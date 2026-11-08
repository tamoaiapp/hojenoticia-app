/** Public, keyless fallback: BCB daily closing rates and Binance spot BRL markets.
 * BCB publishes a civil date, not a collection time. Its normalized timestamp is
 * only a day boundary; consumers must respect timestamp_precision: 'day'.
 * Docs: https://ptax.bcb.gov.br/ptax_internet/consultarTodasAsMoedas.do?method=consultaTodasMoedas
 * https://developers.binance.com/en/docs/products/spot/rest-api
 */
const FIAT = ['USD', 'EUR', 'GBP', 'ARS'];
const CRYPTO = ['BTC', 'ETH'];
const NAMES = {
  USD: 'Dólar Americano/Real Brasileiro', EUR: 'Euro/Real Brasileiro',
  GBP: 'Libra Esterlina/Real Brasileiro', ARS: 'Peso Argentino/Real Brasileiro',
  BTC: 'Bitcoin/Real Brasileiro', ETH: 'Ethereum/Real Brasileiro',
};
const DAY_MS = 86_400_000;
const MAX_BCB_DAYS = 10;
const MAX_CRYPTO_AGE_MS = 2 * DAY_MS;
const waitDefault = ms => new Promise(resolve => setTimeout(resolve, ms));
const brazilDay = now => new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo', year: 'numeric', month: '2-digit', day: '2-digit',
}).format(now);

function sourceError(source, message, status) {
  const error = new Error(`${source}: ${message}`);
  error.status = status;
  return error;
}

async function request(url, { fetchImpl, wait }, source) {
  for (let attempt = 0; attempt < 2; attempt++) {
    let response;
    try {
      response = await fetchImpl(url, {
        // BCB serves CSV as application/octet-stream and rejects a JSON-only Accept.
        headers: { Accept: '*/*', 'User-Agent': 'HojeNoticia/1.0 (https://www.hojenoticia.com)' },
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      if (attempt === 1) throw sourceError(source, 'fonte indisponível após 2 tentativas');
      await wait(500);
      continue;
    }
    if (response.ok) return response;
    // Do not evade rate limits by repeating requests or moving to other dates.
    if (response.status < 500 || attempt === 1) throw sourceError(source, `HTTP ${response.status}`, response.status);
    await wait(500);
  }
}

function numeric(value, label, { positive = false } = {}) {
  if (!['number', 'string'].includes(typeof value) || (typeof value === 'string' && !value.trim())) {
    throw sourceError(label, 'número inválido');
  }
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || (positive && parsed <= 0)) throw sourceError(label, 'número inválido');
  return parsed;
}

function bcbNumber(value, label) {
  if (typeof value !== 'string' || !/^\d+,\d+$/.test(value)) throw sourceError(label, 'valor decimal inválido');
  return numeric(value.replace(',', '.'), label, { positive: true });
}

function pair(code, bid, ask, stamp, source, precision) {
  if (bid > ask) throw sourceError(source === 'bcb-ptax' ? 'Banco Central' : 'Binance', `compra maior que venda: ${code}`);
  return {
    code: `${code}-BRL`, from: code, to: 'BRL', name: NAMES[code], bid, ask,
    high: null, low: null, varBid: null, pctChange: null, timestamp: stamp,
    create_date: precision === 'day' ? brazilDay(new Date(stamp * 1000))
      : new Date(stamp * 1000).toISOString().slice(0, 19).replace('T', ' '),
    source, timestamp_precision: precision,
  };
}

async function bcbPairs({ today, now, ...options }) {
  for (let offset = 0; offset < MAX_BCB_DAYS; offset++) {
    const date = new Date(Date.parse(`${today}T12:00:00Z`) - offset * DAY_MS).toISOString().slice(0, 10);
    const compact = date.replaceAll('-', '');
    let response;
    try {
      response = await request(`https://www4.bcb.gov.br/Download/fechamento/${compact}.csv`, options, 'Banco Central');
    } catch (error) {
      if (error.status === 404) continue; // Weekends, holidays, or not published yet.
      throw error;
    }
    const [year, month, day] = date.split('-');
    const sourceDate = `${day}/${month}/${year}`;
    const stamp = Date.parse(`${date}T00:00:00-03:00`) / 1000;
    if (!Number.isSafeInteger(stamp) || stamp * 1000 > now.getTime()) throw sourceError('Banco Central', 'data futura');
    const rates = {};
    const csv = await response.text();
    for (const line of csv.trim().split(/\r?\n/)) {
      const columns = line.split(';');
      const code = columns[3];
      if (!FIAT.includes(code)) continue;
      if (columns.length !== 8 || columns[0] !== sourceDate || !/^\d{3}$/.test(columns[1])
        || !['A', 'B'].includes(columns[2]) || rates[`${code}-BRL`]) {
        throw sourceError('Banco Central', `linha inválida ou duplicada: ${code}`);
      }
      const bid = bcbNumber(columns[4], `Banco Central ${code} compra`);
      const ask = bcbNumber(columns[5], `Banco Central ${code} venda`);
      rates[`${code}-BRL`] = pair(code, bid, ask, stamp, 'bcb-ptax', 'day');
    }
    if (FIAT.some(code => !rates[`${code}-BRL`])) throw sourceError('Banco Central', 'arquivo incompleto: faltam moedas obrigatórias');
    return rates;
  }
  throw sourceError('Banco Central', `nenhum fechamento publicado nos últimos ${MAX_BCB_DAYS} dias`);
}

async function cryptoPairs({ now, ...options }) {
  const url = new URL('https://data-api.binance.vision/api/v3/ticker/24hr');
  url.searchParams.set('symbols', JSON.stringify(CRYPTO.map(code => `${code}BRL`)));
  let data;
  try { data = await (await request(url.href, options, 'Binance')).json(); }
  catch (error) {
    if (error instanceof SyntaxError) throw sourceError('Binance', 'resposta JSON inválida');
    throw error;
  }
  if (!Array.isArray(data) || data.length !== CRYPTO.length) throw sourceError('Binance', 'resposta incompleta');
  const rates = {};
  for (const code of CRYPTO) {
    const rows = data.filter(row => row?.symbol === `${code}BRL`);
    if (rows.length !== 1) throw sourceError('Binance', `par ausente ou duplicado: ${code}-BRL`);
    const row = rows[0];
    const closeTime = numeric(row.closeTime, `Binance ${code} horário`);
    if (!Number.isSafeInteger(closeTime) || closeTime <= 0 || closeTime > now.getTime() + 300_000
      || closeTime < now.getTime() - MAX_CRYPTO_AGE_MS) throw sourceError('Binance', `horário futuro ou desatualizado: ${code}`);
    const bid = numeric(row.bidPrice, `Binance ${code} compra`, { positive: true });
    const ask = numeric(row.askPrice, `Binance ${code} venda`, { positive: true });
    const rate = pair(code, bid, ask, Math.floor(closeTime / 1000), 'binance', 'second');
    rate.high = numeric(row.highPrice, `Binance ${code} máxima`, { positive: true });
    rate.low = numeric(row.lowPrice, `Binance ${code} mínima`, { positive: true });
    if (rate.high < rate.low) throw sourceError('Binance', `faixa invertida: ${code}`);
    // Binance's change is the last-trade variation, not a variation of best bid.
    // Leave legacy varBid/pctChange absent instead of changing their meaning.
    rates[`${code}-BRL`] = rate;
  }
  return rates;
}

export async function fetchFallback({ today, now = new Date(), fetchImpl = fetch, wait = waitDefault }) {
  if (!(now instanceof Date) || !Number.isFinite(now.getTime()) || !/^\d{4}-\d{2}-\d{2}$/.test(today)
    || brazilDay(now) !== today) throw new Error('Data de coleta alternativa inválida');
  const options = { today, now, fetchImpl, wait };
  const fiat = await bcbPairs(options);
  const crypto = await cryptoPairs(options);
  // No AwesomeAPI history is combined with a different provider or time basis.
  return {
    pares: { ...fiat, ...crypto }, historico: {},
    warnings: ['Fontes alternativas: fechamento diário do Banco Central e mercado à vista em reais da Binance. Máxima, mínima ou variação não fornecidas com a mesma definição ficam indisponíveis.'],
  };
}
