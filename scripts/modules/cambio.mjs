/**
 * Módulo: Câmbio.
 * Busca cotações via AwesomeAPI (gratuita, sem chave) e grava JSON estático.
 * As páginas do site lêem esse JSON em build time / ISR.
 *
 * Endpoint: https://economia.awesomeapi.com.br/last/USD-BRL,EUR-BRL,BTC-BRL,ETH-BRL
 */
import fs from 'fs';
import path from 'path';

const PARES = ['USD-BRL', 'EUR-BRL', 'GBP-BRL', 'ARS-BRL', 'BTC-BRL', 'ETH-BRL'];

async function fetchCambio() {
  const url = `https://economia.awesomeapi.com.br/last/${PARES.join(',')}`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return await res.json();
}

async function fetchHistorico(par, dias = 30) {
  const url = `https://economia.awesomeapi.com.br/json/daily/${par}/${dias}`;
  const res = await fetch(url, {
    headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) return [];
  return await res.json();
}

export async function updateCambio({ root, today }) {
  const OUT_DIR = path.join(root, 'content', 'cambio');
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

  const data = await fetchCambio();
  if (!data || Object.keys(data).length === 0) {
    return { changes: 0, summary: 'API sem resposta' };
  }

  // Snapshot do dia
  const snapshot = {
    updated_at: new Date().toISOString(),
    date: today,
    pares: {},
  };

  for (const [_, info] of Object.entries(data)) {
    const code = `${info.code}-${info.codein}`;
    snapshot.pares[code] = {
      code,
      from: info.code,
      to: info.codein,
      name: info.name,
      bid:  Number(info.bid),
      ask:  Number(info.ask),
      high: Number(info.high),
      low:  Number(info.low),
      varBid: Number(info.varBid),
      pctChange: Number(info.pctChange),
      timestamp: Number(info.timestamp),
      create_date: info.create_date,
    };
  }

  // Histórico 30 dias (só pares principais — economiza fetch)
  const historicoPares = ['USD-BRL', 'EUR-BRL', 'BTC-BRL'];
  const historico = {};
  for (const par of historicoPares) {
    try {
      const hist = await fetchHistorico(par, 30);
      historico[par] = hist.map(d => ({
        bid: Number(d.bid),
        timestamp: Number(d.timestamp),
        date: new Date(Number(d.timestamp) * 1000).toISOString().split('T')[0],
      }));
    } catch (e) {
      console.log(`    histórico ${par} falhou: ${e.message}`);
      historico[par] = [];
    }
  }

  const out = { ...snapshot, historico };

  // Salva sempre como "latest.json" + snapshot do dia (pra histórico)
  const latestPath = path.join(OUT_DIR, 'latest.json');
  const dailyPath  = path.join(OUT_DIR, `${today}.json`);

  // Não regrava se conteúdo é idêntico (evita commit vazio quando API atrasou)
  let prevContent = '';
  if (fs.existsSync(latestPath)) prevContent = fs.readFileSync(latestPath, 'utf-8');
  const newContent = JSON.stringify(out, null, 2);

  if (prevContent === newContent) {
    return { changes: 0, summary: 'cotações sem mudança' };
  }

  fs.writeFileSync(latestPath, newContent, 'utf-8');
  fs.writeFileSync(dailyPath, newContent, 'utf-8');

  return {
    changes: 1,
    summary: `${Object.keys(snapshot.pares).length} pares atualizados`,
  };
}
