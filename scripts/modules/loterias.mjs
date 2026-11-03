/**
 * Módulo: Loterias.
 * Reconcilia os concursos locais com os números publicados pela Caixa.
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
  if (!/^\d{2}\/\d{2}\/\d{4}$/.test(str || '')) return null;
  const [d, m, y] = str.split('/');
  const iso = `${y}-${m}-${d}`;
  const parsed = new Date(`${iso}T12:00:00Z`);
  return !Number.isNaN(parsed.valueOf()) && parsed.toISOString().startsWith(iso) ? iso : null;
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
  const url = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${api}${numero == null ? '' : `/${numero}`}`;
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
      if (i === 2) throw new Error(`${url}: ${e.message}`);
      await sleep(500 * (i + 1));
    }
  }
}

function buildAguardandoMDX(loteriaKey, data) {
  const concurso = Number(data.numeroConcursoProximo);
  const drawDate = parseBRDate(data.dataProximoConcurso);
  const premio = Number(data.valorEstimadoProximoConcurso) || 0;
  const nome = NAMES[loteriaKey];
  const premioTexto = premio > 0 ? ` Estimativa informada pela Caixa: ${formatBRL(premio)}.` : '';

  return `---
title: "${nome} Concurso ${concurso} – Sorteio previsto para ${formatDDMMYYYY(drawDate)}"
description: "Concurso ${concurso} da ${nome} previsto para ${formatDDMMYYYY(drawDate)}.${premioTexto} Resultado aguardando confirmação da Caixa."
loteria: ${loteriaKey}
concurso: ${concurso}
status: aguardando
draw_date: "${drawDate}"
numeros: []
premio_principal: ${Math.round(premio)}
ganhadores: 0
keywords: "${nome} concurso ${concurso}"
date: "${drawDate}"
---

## ${nome} — Concurso ${concurso}

Sorteio previsto para **${formatPtDate(drawDate)}**.${premioTexto}

Resultado aguardando confirmação da [Caixa](https://loterias.caixa.gov.br/).
`;
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
  const errors = [];

  for (const [loteriaKey, apiKey] of Object.entries(API_KEYS)) {
    const dir = path.join(CONTENT_DIR, loteriaKey);
    if (!fs.existsSync(dir)) continue;

    let latest;
    try {
      latest = await fetchCaixa(apiKey);
      const latestDate = parseBRDate(latest?.dataApuracao);
      const latestNumbers = latest?.dezenasSorteadasOrdemSorteio || latest?.listaDezenas || latest?.dezenas || [];
      if (!Number.isInteger(Number(latest?.numero)) || Number(latest.numero) < 1 ||
          !latestDate || latestDate > today || latestNumbers.length === 0) {
        throw new Error('último concurso ausente ou com data inválida');
      }
    } catch (e) {
      errors.push(`${loteriaKey}: ${e.message}`);
      continue;
    }

    const latestNumber = Number(latest.numero);
    const files = fs.readdirSync(dir).filter(f => /^concurso-\d+\.mdx$/.test(f));
    const publishedNumbers = files
      .filter(f => fs.readFileSync(path.join(dir, f), 'utf-8').includes('status: publicado'))
      .map(f => Number(f.match(/\d+/)[0]));
    if (publishedNumbers.length > 0 && latestNumber < Math.max(...publishedNumbers)) {
      errors.push(`${loteriaKey}: fonte oficial retornou concurso anterior ao já publicado`);
      continue;
    }
    const firstMissing = publishedNumbers.length > 0 ? Math.max(...publishedNumbers) + 1 : latestNumber;
    const start = Math.max(firstMissing, latestNumber - 119);
    if (firstMissing < start) {
      errors.push(`${loteriaKey}: lacuna maior que 120 concursos; recuperação parcial`);
    }
    const candidates = new Set();
    for (let concurso = start; concurso <= latestNumber; concurso++) candidates.add(concurso);
    for (const file of files) {
      const numero = Number(file.match(/\d+/)[0]);
      if (numero > latestNumber) continue;
      if (fs.readFileSync(path.join(dir, file), 'utf-8').includes('status: aguardando')) candidates.add(numero);
    }

    console.log(`  ${NAMES[loteriaKey]}: conferindo ${candidates.size} concursos pela numeração oficial`);
    for (const concurso of [...candidates].sort((a, b) => a - b)) {
      totalChecked++;
      try {
        await sleep(300);
        const data = concurso === latestNumber ? latest : await fetchCaixa(apiKey, concurso);
        const numeros = data?.dezenasSorteadasOrdemSorteio || data?.listaDezenas || data?.dezenas || [];
        if (Number(data?.numero) !== concurso || !data?.dataApuracao || numeros.length === 0) {
          throw new Error('resposta sem número, data ou dezenas válidos');
        }
        const fp = path.join(dir, `concurso-${concurso}.mdx`);
        const nextContent = buildPublicadoMDX(loteriaKey, data);
        if (!fs.existsSync(fp) || fs.readFileSync(fp, 'utf-8') !== nextContent) {
          fs.writeFileSync(fp, nextContent, 'utf-8');
          totalUpdated++;
          console.log(`    ✓ ${loteriaKey}/concurso-${concurso}.mdx`);
        }
      } catch (e) {
        errors.push(`${loteriaKey}/${concurso}: ${e.message}`);
      }
    }

    // Datas futuras foram estimadas no passado e podem apontar para concursos
    // que já ocorreram. Mantenha apenas o próximo concurso informado pela Caixa.
    const nextNumber = Number(latest.numeroConcursoProximo);
    const nextDate = parseBRDate(latest.dataProximoConcurso);
    const hasNext = Number.isInteger(nextNumber) && nextNumber > latestNumber && nextDate && nextDate >= today;
    const nextFile = hasNext ? `concurso-${nextNumber}.mdx` : null;
    for (const file of files) {
      const fp = path.join(dir, file);
      if (!fs.readFileSync(fp, 'utf-8').includes('status: aguardando')) continue;
      if (file !== nextFile) {
        fs.unlinkSync(fp);
        totalUpdated++;
      }
    }
    if (nextFile) {
      const fp = path.join(dir, nextFile);
      const nextContent = buildAguardandoMDX(loteriaKey, latest);
      if (!fs.existsSync(fp) || fs.readFileSync(fp, 'utf-8') !== nextContent) {
        fs.writeFileSync(fp, nextContent, 'utf-8');
        totalUpdated++;
      }
    }
  }

  return {
    changes: totalUpdated,
    errors,
    summary: `${totalChecked} concursos conferidos, ${totalUpdated} arquivos alterados, ${errors.length} falhas`,
  };
}
