/**
 * Busca resultados de todas as loterias na API da Caixa e gera arquivos MDX.
 * Uso: node scripts/fetch-loterias.mjs [--only=lotofacil]
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const CONTENT_DIR = path.join(ROOT, 'content', 'loterias');

// drawsPerWeek: estimativa para calcular ponto de partida dos concursos 2026
const LOTERIAS = {
  'mega-sena':  { api: 'megasena',   name: 'Mega-Sena',    numCount: 6,  drawsPerWeek: 2 },
  'quina':      { api: 'quina',      name: 'Quina',         numCount: 5,  drawsPerWeek: 6 },
  'lotofacil':  { api: 'lotofacil',  name: 'Lotofácil',     numCount: 15, drawsPerWeek: 7 },
  'lotomania':  { api: 'lotomania',  name: 'Lotomania',     numCount: 20, drawsPerWeek: 3 },
  'timemania':  { api: 'timemania',  name: 'Timemania',     numCount: 7,  drawsPerWeek: 3 },
  'diadesorte': { api: 'diadesorte', name: 'Dia de Sorte',  numCount: 7,  drawsPerWeek: 3 },
  'dupla-sena': { api: 'duplasena',  name: 'Dupla Sena',    numCount: 6,  drawsPerWeek: 3 },
};

// Dias de sorteio por loteria (0=Dom,...,6=Sáb) — usado só para futuro
const DRAW_DAYS = {
  'mega-sena':  [3, 6],
  'quina':      [1, 2, 3, 4, 5, 6],
  'lotofacil':  [0, 1, 2, 3, 4, 5, 6],
  'lotomania':  [1, 3, 5],
  'timemania':  [2, 4, 6],
  'diadesorte': [2, 4, 6],
  'dupla-sena': [2, 4, 6],
};

// ── helpers ──────────────────────────────────────────────────────────────────

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function parseBRDate(str) {
  if (!str) return null;
  const [d, m, y] = str.split('/');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}

function dateToISO(d) {
  return d.toISOString().split('T')[0];
}

function formatBRL(n) {
  n = Number(n) || 0;
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1).replace('.', ',')} milhões`;
  if (n >= 1_000)     return `R$ ${(n / 1_000).toFixed(0)} mil`;
  return `R$ ${n.toFixed(2).replace('.', ',')}`;
}

function formatPtDate(iso) {
  const [y, m, d] = iso.split('-');
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return dt.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDDMMYYYY(iso) {
  return iso.split('-').reverse().join('/');
}

function daysSince2026Jan1(isoDate) {
  const jan1 = new Date('2026-01-01T12:00:00');
  const d = new Date(isoDate + 'T12:00:00');
  return Math.floor((d - jan1) / 86_400_000);
}

function nextDrawDate(isoDate, drawDays) {
  const d = new Date(isoDate + 'T12:00:00');
  for (let i = 1; i <= 7; i++) {
    d.setDate(d.getDate() + 1);
    if (drawDays.includes(d.getDay())) return dateToISO(d);
  }
  return null;
}

// ── Caixa API ─────────────────────────────────────────────────────────────────

async function fetchCaixa(api, numero = '') {
  const url = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${api}/${numero}`;
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
        signal: AbortSignal.timeout(15000),
      });
      if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error(`HTTP ${res.status}`);
      }
      return await res.json();
    } catch (e) {
      if (attempt === 2) throw e;
      await sleep(600 * (attempt + 1));
    }
  }
}

// ── extrair dados do resultado ─────────────────────────────────────────────────

function extractDrawData(data) {
  const numeros = (
    data.dezenasSorteadasOrdemSorteio ||
    data.listaDezenas ||
    data.dezenas ||
    []
  ).map(n => String(n).padStart(2, '0')).sort((a, b) => Number(a) - Number(b));

  // Ganhadores da faixa principal (pode vir de listaMunicipioUFGanhadores ou listaRateioPremio)
  let ganhadores = 0;
  let cidade = undefined;

  if (Array.isArray(data.listaMunicipioUFGanhadores) && data.listaMunicipioUFGanhadores.length > 0) {
    ganhadores = data.listaMunicipioUFGanhadores.reduce((s, g) => s + (Number(g.ganhadores) || 0), 0);
    const vencedores = data.listaMunicipioUFGanhadores.filter(g => Number(g.ganhadores) > 0);
    if (vencedores.length > 0 && vencedores[0].municipio) {
      cidade = `${vencedores[0].municipio.toUpperCase().trim()}, ${vencedores[0].uf}`;
    }
  } else if (Array.isArray(data.listaRateioPremio) && data.listaRateioPremio.length > 0) {
    ganhadores = Number(data.listaRateioPremio[0].numeroDeGanhadores) || 0;
  }

  let premioPrincipal = 0;
  if (ganhadores > 0 && Array.isArray(data.listaRateioPremio) && data.listaRateioPremio.length > 0) {
    premioPrincipal = Number(data.listaRateioPremio[0].valorPremio) || 0;
  }

  return {
    numeros,
    ganhadores,
    cidade,
    premioPrincipal,
    acumulou: ganhadores === 0,
  };
}

// ── gerar conteúdo MDX ────────────────────────────────────────────────────────

function buildPublicadoMDX(loteriaKey, cfg, data) {
  const concurso = data.numero;
  const drawDate = parseBRDate(data.dataApuracao);
  const proxConcurso = data.numeroConcursoProximo || (concurso + 1);
  const proxData = data.dataProximoConcurso ? parseBRDate(data.dataProximoConcurso) : null;
  const proxPremio = Number(data.valorEstimadoProximoConcurso) || 0;

  const { numeros, ganhadores, cidade, premioPrincipal, acumulou } = extractDrawData(data);
  const numerosStr = numeros.join(', ');
  const dateFormatted = formatPtDate(drawDate);
  const dateDDMMYYYY = formatDDMMYYYY(drawDate);
  const lnome = cfg.name;

  const premioPrincipalStr = formatBRL(premioPrincipal);
  const proxPremioStr = formatBRL(proxPremio);

  let title, desc, resultBody;
  if (acumulou) {
    title = `Resultado ${lnome} Concurso ${concurso} – ${dateDDMMYYYY}: Acumulou para ${proxPremioStr}`;
    desc = `Resultado da ${lnome} concurso ${concurso} em ${dateDDMMYYYY}. Dezenas: ${numerosStr}. Acumulou — próximo prêmio estimado em ${proxPremioStr}.`;
    resultBody = `O sorteio do concurso **${concurso}** da **${lnome}** de **${dateFormatted}** não teve ganhadores na faixa principal.\n\nAs dezenas sorteadas foram: **${numerosStr}**\n\nO prêmio **acumulou**. A estimativa para o próximo concurso (${proxConcurso}) é de **${proxPremioStr}**.`;
  } else {
    title = `Resultado ${lnome} Concurso ${concurso} – ${dateDDMMYYYY}: ${ganhadores} ganhador${ganhadores !== 1 ? 'es' : ''}, ${premioPrincipalStr}`;
    desc = `Resultado da ${lnome} concurso ${concurso} em ${dateDDMMYYYY}. Dezenas: ${numerosStr}. ${ganhadores} ganhador${ganhadores !== 1 ? 'es' : ''}. Prêmio: ${premioPrincipalStr}.`;
    resultBody = `O sorteio do concurso **${concurso}** da **${lnome}** de **${dateFormatted}** teve **${ganhadores} ganhador${ganhadores !== 1 ? 'es' : ''}**${cidade ? ` em ${cidade}` : ''}.\n\nAs dezenas sorteadas foram: **${numerosStr}**\n\nPrêmio principal: **${premioPrincipalStr}**.`;
  }

  const keywords = `resultado ${loteriaKey.replace(/-/g,' ')} ${concurso}, ${loteriaKey.replace(/-/g,' ')} ${concurso} dezenas, concurso ${concurso} ${loteriaKey.replace(/-/g,' ')}, resultado hoje, ${loteriaKey.replace(/-/g,' ')} ${dateDDMMYYYY.replace(/\//g,' ')}`;

  let front = `---
title: "${title.replace(/"/g, "'")}"
description: "${desc.replace(/"/g, "'")}"
loteria: ${loteriaKey}
concurso: ${concurso}
status: publicado
draw_date: "${drawDate}"
numeros: ${JSON.stringify(numeros)}
premio_principal: ${Math.round(premioPrincipal)}
ganhadores: ${ganhadores}`;

  if (cidade) front += `\ncidade: "${cidade}"`;
  if (proxConcurso) front += `\nproximo_concurso: ${proxConcurso}`;
  if (proxData) front += `\nproxima_data: "${proxData}"`;
  if (proxPremio) front += `\nproximo_premio: ${Math.round(proxPremio)}`;

  front += `
keywords: "${keywords}"
readTime: "2 min"
date: "${drawDate}"
---

## Resultado ${lnome} ${concurso} — ${dateFormatted}

${resultBody}

## Como conferir seu bilhete

Você pode verificar seu bilhete pelo site ou app da Caixa, nas casas lotéricas ou comparando os números acima com seu volante de aposta.
`;

  if (proxConcurso && proxData) {
    front += `
## Próximo Sorteio — Concurso ${proxConcurso}

O próximo sorteio da ${lnome} acontece em **${formatPtDate(proxData)}**.
Estimativa de prêmio: **${proxPremioStr}**.
`;
  }

  return front;
}

function buildAguardandoMDX(loteriaKey, cfg, concurso, drawDate, estimativaPremio = 0) {
  const lnome = cfg.name;
  const dateDDMMYYYY = formatDDMMYYYY(drawDate);
  const dateFormatted = formatPtDate(drawDate);
  const premioStr = estimativaPremio > 0 ? formatBRL(estimativaPremio) : '';

  const title = `${lnome} Concurso ${concurso} – Resultado do Sorteio de ${dateDDMMYYYY}`;
  const desc = `Confira o resultado do concurso ${concurso} da ${lnome} que acontece em ${dateFormatted}.${premioStr ? ` Estimativa de prêmio: ${premioStr}.` : ''} Dezenas e ganhadores publicados aqui após o sorteio.`;
  const keywords = `${loteriaKey.replace(/-/g,' ')} concurso ${concurso} resultado, ${loteriaKey.replace(/-/g,' ')} ${concurso}, resultado ${loteriaKey.replace(/-/g,' ')} ${dateDDMMYYYY.replace(/\//g,' ')}, dezenas ${loteriaKey.replace(/-/g,' ')} ${concurso}`;

  return `---
title: "${title}"
description: "${desc.replace(/"/g, "'")}"
loteria: ${loteriaKey}
concurso: ${concurso}
status: aguardando
draw_date: "${drawDate}"
numeros: []
premio_principal: ${Math.round(estimativaPremio)}
ganhadores: 0
keywords: "${keywords}"
readTime: "2 min"
date: "${drawDate}"
---

## ${lnome} Concurso ${concurso} — Sorteio em ${dateFormatted}

O sorteio do concurso **${concurso}** da **${lnome}** está previsto para **${dateFormatted}**.${premioStr ? `\nA estimativa de prêmio é de **${premioStr}**.` : ''}

Esta página será atualizada com o resultado oficial logo após o sorteio.
Volte depois das 20h para conferir as dezenas!

## Apostar no Concurso ${concurso}

Você pode realizar sua aposta até as 19h do dia do sorteio em qualquer lotérica credenciada
ou pelo app da Caixa Econômica Federal.
`;
}

// ── processar uma loteria ─────────────────────────────────────────────────────

async function processLoteria(loteriaKey, cfg) {
  console.log(`\n📋 ${cfg.name} (${loteriaKey})`);

  const dir = path.join(CONTENT_DIR, loteriaKey);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  // 1. Pegar o último concurso para calibrar ponto de partida
  let latest;
  try {
    latest = await fetchCaixa(cfg.api);
    if (!latest) throw new Error('resposta vazia');
  } catch (e) {
    console.error(`  ❌ Erro ao buscar último concurso: ${e.message}`);
    return;
  }

  const latestNum = latest.numero;
  const latestDate = parseBRDate(latest.dataApuracao);
  const latestYear = Number(latestDate.split('-')[0]);
  console.log(`  Último: concurso ${latestNum} em ${latestDate}`);

  if (latestYear < 2026) {
    console.log(`  ⚠️  Último concurso é de ${latestYear}, pulando.`);
    return;
  }

  // 2. Estimar primeiro concurso de 2026 (com buffer)
  const daysIn2026 = daysSince2026Jan1(latestDate);
  const estimatedDraws = Math.ceil(daysIn2026 * cfg.drawsPerWeek / 7) + 15;
  const startFrom = Math.max(1, latestNum - estimatedDraws);
  console.log(`  Buscando de ${startFrom} até ${latestNum} (${latestNum - startFrom + 1} concursos)...`);

  // 3. Buscar todos os concursos de 2026 (em lotes de 5)
  const draws2026 = [];
  const BATCH = 5;

  for (let num = startFrom; num <= latestNum; num += BATCH) {
    const batch = [];
    for (let i = 0; i < BATCH && num + i <= latestNum; i++) {
      batch.push(fetchCaixa(cfg.api, num + i).catch(() => null));
    }
    const results = await Promise.all(batch);
    await sleep(200);

    for (const data of results) {
      if (!data || !data.dataApuracao) continue;
      const dateISO = parseBRDate(data.dataApuracao);
      const year = Number(dateISO.split('-')[0]);
      if (year >= 2026) draws2026.push(data);
    }

    process.stdout.write(`  ${num + BATCH - 1}/${latestNum}\r`);
  }

  console.log(`  ✅ ${draws2026.length} concursos de 2026 encontrados`);

  // 4. Gerar arquivos MDX para concursos passados (publicado)
  let created = 0, updated = 0;
  for (const data of draws2026) {
    const slug = `concurso-${data.numero}`;
    const mdxPath = path.join(dir, `${slug}.mdx`);
    const content = buildPublicadoMDX(loteriaKey, cfg, data);

    const exists = fs.existsSync(mdxPath);
    const existingContent = exists ? fs.readFileSync(mdxPath, 'utf-8') : '';

    // Só sobrescrever se status mudou ou arquivo não existe
    if (!exists || existingContent.includes('status: aguardando') || !existingContent.includes('status: publicado')) {
      fs.writeFileSync(mdxPath, content, 'utf-8');
      exists ? updated++ : created++;
    }
  }
  console.log(`  📝 Criados: ${created}, Atualizados (aguardando→publicado): ${updated}`);

  // 5. Gerar concursos futuros (aguardando) até 31/12/2026
  if (!latest.numeroConcursoProximo || !latest.dataProximoConcurso) {
    console.log(`  ⚠️  Sem próximo concurso — skipping futuros`);
    return;
  }

  const drawDays = DRAW_DAYS[loteriaKey] || [1, 3, 5];
  let nextNum = latest.numeroConcursoProximo;
  let nextDate = parseBRDate(latest.dataProximoConcurso);
  const proxPremio = Number(latest.valorEstimadoProximoConcurso) || 0;
  let futureCreated = 0;

  while (nextDate && nextDate <= '2026-12-31') {
    const slug = `concurso-${nextNum}`;
    const mdxPath = path.join(dir, `${slug}.mdx`);
    if (!fs.existsSync(mdxPath)) {
      fs.writeFileSync(mdxPath, buildAguardandoMDX(loteriaKey, cfg, nextNum, nextDate, proxPremio), 'utf-8');
      futureCreated++;
    }
    nextNum++;
    nextDate = nextDrawDate(nextDate, drawDays);
  }

  console.log(`  🗓️  Futuros criados: ${futureCreated}`);
}

// ── limpeza de arquivos ruins (concurso em ano errado) ────────────────────────

function cleanupWrongYear(loteriaKey) {
  const dir = path.join(CONTENT_DIR, loteriaKey);
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.mdx'));
  for (const file of files) {
    const fp = path.join(dir, file);
    const content = fs.readFileSync(fp, 'utf-8');
    const match = content.match(/draw_date:\s*"(\d{4})/);
    if (match && match[1] !== '2026') {
      fs.unlinkSync(fp);
      console.log(`  🗑️  Removido arquivo com data errada: ${file}`);
    }
  }
}

// ── main ──────────────────────────────────────────────────────────────────────

async function main() {
  const args = process.argv.slice(2);
  const onlyFlag = args.find(a => a.startsWith('--only='));
  const onlyKey = onlyFlag ? onlyFlag.split('=')[1] : null;

  const loteriasToRun = onlyKey
    ? { [onlyKey]: LOTERIAS[onlyKey] }
    : LOTERIAS;

  if (onlyKey && !LOTERIAS[onlyKey]) {
    console.error(`Loteria desconhecida: ${onlyKey}`);
    process.exit(1);
  }

  console.log('🎰 Iniciando geração de conteúdo de loterias 2026...\n');

  // Limpar arquivos com ano errado antes de gerar
  for (const key of Object.keys(loteriasToRun)) {
    cleanupWrongYear(key);
  }

  for (const [key, cfg] of Object.entries(loteriasToRun)) {
    await processLoteria(key, cfg);
    await sleep(500); // pausa entre loterias
  }

  console.log('\n✨ Concluído! Fazendo git commit e push...');

  try {
    process.chdir(ROOT);
    execSync('git add content/loterias/', { stdio: 'inherit' });
    execSync('git diff --cached --quiet || git commit -m "loterias: gerar concursos 2026 via Caixa API"', { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });
    console.log('🚀 Deploy iniciado no Vercel!');
  } catch (e) {
    console.log('ℹ️  Git push ignorado (sem git configurado ou sem mudanças)');
  }
}

main().catch(e => { console.error('Erro fatal:', e); process.exit(1); });
