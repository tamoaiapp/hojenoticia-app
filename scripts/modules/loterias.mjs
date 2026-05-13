/**
 * Módulo: Loterias.
 * Varre arquivos MDX "aguardando" cuja data já passou e busca o resultado na Caixa.
 */
import fs from 'fs';
import path from 'path';

const API_KEYS = {
  'mega-sena':  'megasena',
  'quina':      'quina',
  'lotofacil':  'lotofacil',
  'lotomania':  'lotomania',
  'timemania':  'timemania',
  'diadesorte': 'diadesorte',
  'dupla-sena': 'duplasena',
  'federal':    'federal',
  'maismilionaria': 'maismilionaria',
  'super-sete': 'supersete',
};

const NAMES = {
  'mega-sena':  'Mega-Sena',
  'quina':      'Quina',
  'lotofacil':  'Lotofácil',
  'lotomania':  'Lotomania',
  'timemania':  'Timemania',
  'diadesorte': 'Dia de Sorte',
  'dupla-sena': 'Dupla Sena',
  'federal':    'Loteria Federal',
  'maismilionaria': '+Milionária',
  'super-sete': 'Super Sete',
};

const sleep = ms => new Promise(r => setTimeout(r, ms));

function parseBRDate(str) {
  if (!str) return null;
  const [d, m, y] = str.split('/');
  return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
}
function formatBRL(n) {
  n = Number(n) || 0;
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1).replace('.', ',')} milhões`;
  if (n >= 1_000)     return `R$ ${(n / 1_000).toFixed(0)} mil`;
  return `R$ ${n.toFixed(2).replace('.', ',')}`;
}
function formatPtDate(iso) {
  const [y, m, d] = iso.split('-');
  return new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: 'numeric' });
}
function formatDDMMYYYY(iso) {
  return iso.split('-').reverse().join('/');
}

async function fetchCaixa(api, numero) {
  const url = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${api}/${numero}`;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetch(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === 2) return null;
      await sleep(500 * (i + 1));
    }
  }
}

function extractDrawData(data) {
  const numeros = (
    data.dezenasSorteadasOrdemSorteio || data.listaDezenas || data.dezenas || []
  ).map(n => String(n).padStart(2, '0')).sort((a, b) => Number(a) - Number(b));

  let ganhadores = 0, cidade;
  if (Array.isArray(data.listaMunicipioUFGanhadores)) {
    ganhadores = data.listaMunicipioUFGanhadores.reduce((s, g) => s + (Number(g.ganhadores) || 0), 0);
    const v = data.listaMunicipioUFGanhadores.filter(g => Number(g.ganhadores) > 0);
    if (v.length > 0 && v[0].municipio) cidade = `${v[0].municipio.toUpperCase().trim()}, ${v[0].uf}`;
  } else if (Array.isArray(data.listaRateioPremio)) {
    ganhadores = Number(data.listaRateioPremio[0]?.numeroDeGanhadores) || 0;
  }

  let premioPrincipal = 0;
  if (ganhadores > 0 && Array.isArray(data.listaRateioPremio)) {
    premioPrincipal = Number(data.listaRateioPremio[0]?.valorPremio) || 0;
  }

  return { numeros, ganhadores, cidade, premioPrincipal, acumulou: ganhadores === 0 };
}

function buildPublicadoMDX(loteriaKey, data) {
  const lnome = NAMES[loteriaKey];
  const concurso = data.numero;
  const drawDate = parseBRDate(data.dataApuracao);
  const proxConcurso = data.numeroConcursoProximo || concurso + 1;
  const proxData = data.dataProximoConcurso ? parseBRDate(data.dataProximoConcurso) : null;
  const proxPremio = Number(data.valorEstimadoProximoConcurso) || 0;
  const { numeros, ganhadores, cidade, premioPrincipal, acumulou } = extractDrawData(data);

  const numerosStr = numeros.join(', ');
  const dateDDMMYYYY = formatDDMMYYYY(drawDate);
  const dateFormatted = formatPtDate(drawDate);
  const proxPremioStr = formatBRL(proxPremio);
  const premioPrincipalStr = formatBRL(premioPrincipal);

  let title, desc, body;
  if (acumulou) {
    title = `Resultado ${lnome} Concurso ${concurso} – ${dateDDMMYYYY}: Acumulou para ${proxPremioStr}`;
    desc = `Resultado da ${lnome} concurso ${concurso} em ${dateDDMMYYYY}. Dezenas: ${numerosStr}. Acumulou — próximo prêmio estimado em ${proxPremioStr}.`;
    body = `O sorteio do concurso **${concurso}** da **${lnome}** de **${dateFormatted}** não teve ganhadores na faixa principal.\n\nAs dezenas sorteadas foram: **${numerosStr}**\n\nO prêmio **acumulou**. A estimativa para o próximo concurso (${proxConcurso}) é de **${proxPremioStr}**.`;
  } else {
    title = `Resultado ${lnome} Concurso ${concurso} – ${dateDDMMYYYY}: ${ganhadores} ganhador${ganhadores !== 1 ? 'es' : ''}, ${premioPrincipalStr}`;
    desc = `Resultado da ${lnome} concurso ${concurso} em ${dateDDMMYYYY}. Dezenas: ${numerosStr}. ${ganhadores} ganhador${ganhadores !== 1 ? 'es' : ''}. Prêmio: ${premioPrincipalStr}.`;
    body = `O sorteio do concurso **${concurso}** da **${lnome}** de **${dateFormatted}** teve **${ganhadores} ganhador${ganhadores !== 1 ? 'es' : ''}**${cidade ? ` em ${cidade}` : ''}.\n\nAs dezenas sorteadas foram: **${numerosStr}**\n\nPrêmio principal: **${premioPrincipalStr}**.`;
  }

  const keywords = `resultado ${loteriaKey.replace(/-/g,' ')} ${concurso}, ${loteriaKey.replace(/-/g,' ')} ${concurso} dezenas, concurso ${concurso} ${loteriaKey.replace(/-/g,' ')}, resultado hoje`;

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

${body}

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

export async function updateLoterias({ root, today }) {
  const CONTENT_DIR = path.join(root, 'content', 'loterias');
  let totalUpdated = 0;
  let totalChecked = 0;

  for (const [loteriaKey, apiKey] of Object.entries(API_KEYS)) {
    const dir = path.join(CONTENT_DIR, loteriaKey);
    if (!fs.existsSync(dir)) continue;

    const files = fs.readdirSync(dir)
      .filter(f => f.endsWith('.mdx'))
      .map(f => ({ file: f, fp: path.join(dir, f) }));

    const toUpdate = files.filter(({ fp }) => {
      const content = fs.readFileSync(fp, 'utf-8');
      if (!content.includes('status: aguardando')) return false;
      const m = content.match(/draw_date:\s*"(\d{4}-\d{2}-\d{2})"/);
      return m && m[1] <= today;
    });

    if (toUpdate.length === 0) continue;
    console.log(`  ${NAMES[loteriaKey]}: ${toUpdate.length} para checar`);

    for (const { file, fp } of toUpdate) {
      const concurso = parseInt(file.replace('concurso-', '').replace('.mdx', ''));
      totalChecked++;

      try {
        await sleep(300);
        const data = await fetchCaixa(apiKey, concurso);
        if (!data || !data.dataApuracao) continue;

        const numeros = data.dezenasSorteadasOrdemSorteio || data.listaDezenas || [];
        if (numeros.length === 0) continue;

        fs.writeFileSync(fp, buildPublicadoMDX(loteriaKey, data), 'utf-8');
        totalUpdated++;
        console.log(`    ✓ ${loteriaKey}/${file}`);
      } catch (e) {
        console.log(`    ✗ ${file}: ${e.message}`);
      }
    }
  }

  return {
    changes: totalUpdated,
    summary: `${totalUpdated}/${totalChecked} concursos publicados`,
  };
}
