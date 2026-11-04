/** Cotações AwesomeAPI: tentativas limitadas e preservação do último registro válido. */
import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';

const PAIRS = ['USD-BRL', 'EUR-BRL', 'GBP-BRL', 'ARS-BRL', 'BTC-BRL', 'ETH-BRL'];
const HISTORY_PAIRS = ['USD-BRL', 'EUR-BRL', 'BTC-BRL'];
const BASE = 'https://economia.awesomeapi.com.br';
const MAX_ATTEMPTS = 3;
const MAX_WAIT_MS = 30_000;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
const dayInBrazil = date => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(date);

class CurrencyRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function retryDelay(response, attempt, now) {
  const header = response.headers.get('retry-after');
  if (header?.trim()) {
    const seconds = Number(header);
    if (Number.isFinite(seconds) && seconds >= 0) return seconds * 1000;
    const date = Date.parse(header);
    if (Number.isFinite(date)) return Math.max(0, date - now.getTime());
  }
  return (response.status === 429 ? 5000 : 1000) * 2 ** attempt;
}

async function requestJSON(url, { fetchImpl, wait, now, apiKey }) {
  const headers = { Accept: 'application/json', 'User-Agent': 'HojeNoticia/1.0 (https://www.hojenoticia.com)' };
  if (apiKey) headers['x-api-key'] = apiKey;
  let waited = 0;
  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    let response;
    try {
      response = await fetchImpl(url, { headers, signal: AbortSignal.timeout(15_000) });
    } catch {
      if (attempt === MAX_ATTEMPTS - 1) throw new CurrencyRequestError('Fonte de câmbio indisponível após 3 tentativas');
      const delay = 1000 * 2 ** attempt;
      if (delay > MAX_WAIT_MS - waited) throw new CurrencyRequestError('Fonte de câmbio indisponível; limite de espera atingido');
      await wait(delay);
      waited += delay;
      continue;
    }
    if (response.ok) return response.json();
    const retryable = response.status === 429 || response.status >= 500;
    if (!retryable || attempt === MAX_ATTEMPTS - 1) {
      throw new CurrencyRequestError(`Fonte de câmbio: HTTP ${response.status}`, response.status);
    }
    const delay = retryDelay(response, attempt, new Date(now.getTime() + waited));
    if (delay > MAX_WAIT_MS - waited) {
      throw new CurrencyRequestError(`Fonte de câmbio: HTTP ${response.status}; Retry-After excede o limite de espera desta execução`, response.status);
    }
    await wait(delay);
    waited += delay;
  }
}

function number(value, field, { positive = false, integer = false } = {}) {
  if (!['number', 'string'].includes(typeof value) || (typeof value === 'string' && !value.trim())) {
    throw new Error(`Cotação inválida: ${field}`);
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || (positive && parsed <= 0) || (integer && !Number.isSafeInteger(parsed))) {
    throw new Error(`Cotação inválida: ${field}`);
  }
  return parsed;
}

function timestamp(value, field, now) {
  const parsed = number(value, field, { positive: true, integer: true });
  if (!Number.isFinite(new Date(parsed * 1000).getTime()) || parsed * 1000 > now.getTime() + 300_000) {
    throw new Error(`Horário inválido: ${field}`);
  }
  return parsed;
}

function normalizePairs(data, previous, now) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) throw new Error('Resposta de câmbio inválida');
  return Object.fromEntries(PAIRS.map(pair => {
    const [from, to] = pair.split('-');
    const info = data[`${from}${to}`];
    if (!info || info.code !== from || info.codein !== to || typeof info.name !== 'string' || !info.name.trim()) {
      throw new Error(`Par ausente ou inválido: ${pair}`);
    }
    if (typeof info.create_date !== 'string' || !/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(info.create_date)) {
      throw new Error(`Data da fonte inválida: ${pair}`);
    }
    const date = new Date(`${info.create_date.replace(' ', 'T')}Z`);
    if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 19).replace('T', ' ') !== info.create_date) {
      throw new Error(`Data da fonte inválida: ${pair}`);
    }
    const result = { code: pair, from, to, name: info.name };
    for (const field of ['bid', 'ask', 'high', 'low', 'varBid', 'pctChange']) {
      result[field] = number(info[field], `${pair}.${field}`, { positive: !['varBid', 'pctChange'].includes(field) });
    }
    if (result.high < result.low) throw new Error(`Faixa de cotação inválida: ${pair}`);
    result.timestamp = timestamp(info.timestamp, `${pair}.timestamp`, now);
    const previousTimestamp = previous?.pares?.[pair]?.timestamp;
    if (Number.isSafeInteger(previousTimestamp) && previousTimestamp > 0 && previousTimestamp * 1000 <= now.getTime()
      && result.timestamp < previousTimestamp) throw new Error(`Fonte retornou cotação anterior ao registro salvo: ${pair}`);
    result.create_date = info.create_date;
    return [pair, result];
  }));
}

function historyIsUsable(history, now) {
  return Array.isArray(history) && history.length > 0 && history.length <= 360 && history.every(row => {
    try {
      number(row.bid, 'histórico.bid', { positive: true });
      timestamp(row.timestamp, 'histórico.timestamp', now);
      return true;
    } catch { return false; }
  });
}

function normalizeHistory(data, pair, now) {
  if (!historyIsUsable(data, now)) throw new Error(`Histórico inválido: ${pair}`);
  const rows = new Map();
  for (const row of data) {
    const stamp = Number(row.timestamp);
    const bid = Number(row.bid);
    if (rows.has(stamp) && rows.get(stamp).bid !== bid) throw new Error(`Histórico conflitante: ${pair}`);
    rows.set(stamp, { bid, timestamp: stamp, date: dayInBrazil(new Date(stamp * 1000)) });
  }
  return [...rows.values()].sort((a, b) => b.timestamp - a.timestamp);
}

function atomicWrite(file, value) {
  const temp = `${file}.tmp-${process.pid}`;
  try {
    fs.writeFileSync(temp, value, 'utf8');
    fs.renameSync(temp, file);
  } finally {
    if (fs.existsSync(temp)) fs.unlinkSync(temp);
  }
}

export async function updateCambio({ root, today, fetchImpl = fetch, wait = sleep, now = new Date(), apiKey = process.env.AWESOMEAPI_KEY ?? '' }) {
  if (!Number.isFinite(now.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(today) || dayInBrazil(new Date(`${today}T12:00:00-03:00`)) !== today) {
    throw new Error('Data de coleta inválida');
  }
  const outDir = path.join(root, 'content', 'cambio');
  const latestPath = path.join(outDir, 'latest.json');
  let previous = null;
  try { previous = JSON.parse(fs.readFileSync(latestPath, 'utf8')); } catch { /* Fonte válida pode reparar o cache. */ }
  const options = { fetchImpl, wait, now, apiKey };
  const data = await requestJSON(`${BASE}/last/${PAIRS.join(',')}`, options);
  const pares = normalizePairs(data, previous, now);
  const samePairs = isDeepStrictEqual(previous?.pares, pares);
  if (samePairs && HISTORY_PAIRS.every(pair => historyIsUsable(previous?.historico?.[pair], now))) {
    return { changes: 0, summary: 'cotações sem mudança; horários originais preservados' };
  }
  const historico = {};
  const warnings = [];
  let rateLimited = false;
  for (const pair of HISTORY_PAIRS) {
    const cached = historyIsUsable(previous?.historico?.[pair], now) ? previous.historico[pair] : [];
    if (rateLimited) {
      historico[pair] = cached;
      warnings.push(`Histórico ${pair}: coleta adiada após HTTP 429; registro anterior preservado`);
      continue;
    }
    try {
      historico[pair] = normalizeHistory(await requestJSON(`${BASE}/json/daily/${pair}/30`, options), pair, now);
    } catch (error) {
      historico[pair] = cached;
      warnings.push(`Histórico ${pair}: ${error.message}; registro anterior preservado`);
      if (error.status === 429) rateLimited = true;
    }
  }
  if (samePairs && isDeepStrictEqual(previous?.historico, historico)) {
    return { changes: 0, summary: 'cotações sem mudança', warnings };
  }
  const snapshot = { updated_at: now.toISOString(), date: today, pares, historico };
  const serialized = JSON.stringify(snapshot, null, 2);
  fs.mkdirSync(outDir, { recursive: true });
  atomicWrite(path.join(outDir, `${today}.json`), serialized);
  atomicWrite(latestPath, serialized);
  return { changes: 2, summary: `${PAIRS.length} pares atualizados`, warnings };
}
