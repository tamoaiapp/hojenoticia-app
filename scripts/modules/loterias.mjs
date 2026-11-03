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

async function fetchCaixa(api, numero, { fetchImpl, wait }) {
  const url = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${api}${numero == null ? '' : `/${numero}`}`;
  for (let i = 0; i < 3; i++) {
    try {
      const res = await fetchImpl(url, {
        headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
        signal: AbortSignal.timeout(15000),
      });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } catch (e) {
      if (i === 2) throw new Error(`${url}: ${e.message}`);
      await wait(500 * (i + 1));
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

function sourceNumbers(data, loteriaKey) {
  const values = [data?.listaDezenas, data?.dezenasSorteadasOrdemSorteio, data?.dezenas]
    .find(values => Array.isArray(values) && values.length > 0) || [];
  // Sem a lista canônica do primeiro sorteio, não aceitar uma lista combinada
  // de 12 dezenas como se fosse um único resultado da Dupla Sena.
  return loteriaKey === 'dupla-sena' && values.length !== 6 ? [] : values;
}

function extractDrawData(loteriaKey, data) {
  const numeros = sourceNumbers(data, loteriaKey).map(n => String(n).padStart(2, '0'));
  if (loteriaKey !== 'super-sete') numeros.sort((a, b) => Number(a) - Number(b));

  const rateio = (Array.isArray(data.listaRateioPremio) ? data.listaRateioPremio : []).map((r, index) => ({
    faixa: Number(r.faixa) || index + 1,
    descricao: String(r.descricaoFaixa || `Faixa ${index + 1}`).trim(),
    ganhadores: Math.max(0, Number(r.numeroDeGanhadores) || 0),
    premio: Math.max(0, Number(r.valorPremio) || 0),
  }));
  const municipios = (Array.isArray(data.listaMunicipioUFGanhadores) ? data.listaMunicipioUFGanhadores : [])
    .filter(g => Number(g.ganhadores) > 0 && g.municipio)
    .map(g => ({ municipio: String(g.municipio).trim(), uf: String(g.uf || '').trim(), ganhadores: Number(g.ganhadores) }));
  // Municípios podem ser uma lista parcial; o rateio define a faixa principal.
  const ganhadores = rateio.length > 0 ? rateio[0].ganhadores : municipios.reduce((sum, g) => sum + g.ganhadores, 0);
  const premioPrincipal = ganhadores > 0 ? rateio[0]?.premio || 0 : 0;
  const cidade = municipios.length === 1 ? `${municipios[0].municipio}, ${municipios[0].uf}` : undefined;
  const acumulou = typeof data.acumulado === 'boolean' ? data.acumulado : rateio.length > 0 ? ganhadores === 0 : undefined;
  const numerosSegundoSorteio = (Array.isArray(data.listaDezenasSegundoSorteio) ? data.listaDezenasSegundoSorteio : [])
    .map(n => String(n).padStart(2, '0')).sort((a, b) => Number(a) - Number(b));
  const mesSorte = data.nomeMesSorte ? String(data.nomeMesSorte).trim() : undefined;
  const timeCoracao = data.nomeTimeCoracaoMesSorte ? String(data.nomeTimeCoracaoMesSorte).trim() : undefined;

  return { numeros, ganhadores, cidade, premioPrincipal, acumulou, rateio, municipios, numerosSegundoSorteio, mesSorte, timeCoracao };
}

function scalar(content, field) {
  const value = content.match(new RegExp(`^${field}:\\s*(.+)$`, 'm'))?.[1]?.trim();
  if (!value) return undefined;
  try { return JSON.parse(value); } catch { return value.replace(/^['"]|['"]$/g, ''); }
}

function validTimestamp(value) {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})$/.test(value)
    && !Number.isNaN(Date.parse(value));
}

function substantiveContent(content) {
  return content.replace(/\r\n/g, '\n').replace(/^(?:published_at|updated_at|source_checked_at):[^\n]*(?:\n|$)/gm, '');
}

function buildPublicadoMDX(loteriaKey, data, { publishedAt, updatedAt, checkedAt }) {
  const lnome = NAMES[loteriaKey];
  const concurso = data.numero;
  const drawDate = parseBRDate(data.dataApuracao);
  const proxConcurso = data.numeroConcursoProximo || concurso + 1;
  const proxData = data.dataProximoConcurso ? parseBRDate(data.dataProximoConcurso) : null;
  const proxPremio = Number(data.valorEstimadoProximoConcurso) || 0;
  const { numeros, ganhadores, cidade, premioPrincipal, acumulou, rateio, municipios, numerosSegundoSorteio, mesSorte, timeCoracao } = extractDrawData(loteriaKey, data);
  const sourceUrl = `https://servicebus2.caixa.gov.br/portaldeloterias/api/${API_KEYS[loteriaKey]}/${concurso}`;

  const numerosStr = numeros.join(', ');
  const dateDDMMYYYY = formatDDMMYYYY(drawDate);
  const dateFormatted = formatPtDate(drawDate);
  const proxPremioStr = formatBRL(proxPremio);
  const premioPrincipalStr = formatBRL(premioPrincipal);

  let title, desc, body;
  if (acumulou) {
    title = `Resultado ${lnome} Concurso ${concurso} – ${dateDDMMYYYY}: Acumulou${proxPremio > 0 ? ` para ${proxPremioStr}` : ''}`;
    desc = `Resultado da ${lnome} concurso ${concurso} em ${dateDDMMYYYY}. Dezenas: ${numerosStr}. Acumulou${proxPremio > 0 ? ` — próximo prêmio estimado em ${proxPremioStr}` : ''}.`;
    body = `O concurso **${concurso}** da **${lnome}**, sorteado em **${dateFormatted}**, acumulou, segundo os dados oficiais da Caixa.${rateio.length > 0 && ganhadores === 0 ? ' Não houve apostas ganhadoras na faixa principal.' : ''}`;
  } else if (rateio.length > 0 && ganhadores > 0) {
    title = `Resultado ${lnome} Concurso ${concurso} – ${dateDDMMYYYY}: ${ganhadores} ganhador${ganhadores !== 1 ? 'es' : ''}, ${premioPrincipalStr}`;
    desc = `Resultado da ${lnome} concurso ${concurso} em ${dateDDMMYYYY}. Dezenas: ${numerosStr}. ${ganhadores} ganhador${ganhadores !== 1 ? 'es' : ''}. Prêmio: ${premioPrincipalStr}.`;
    body = `O concurso **${concurso}** da **${lnome}**, sorteado em **${dateFormatted}**, teve **${ganhadores} aposta${ganhadores !== 1 ? 's' : ''} ganhadora${ganhadores !== 1 ? 's' : ''}** na faixa principal${cidade ? ` em ${cidade}` : ''}, segundo a Caixa. O prêmio por aposta nessa faixa foi de **${premioPrincipal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}**.`;
  } else {
    title = `Resultado ${lnome} Concurso ${concurso} – ${dateDDMMYYYY}: Dezenas sorteadas`;
    desc = `Resultado da ${lnome} concurso ${concurso} em ${dateDDMMYYYY}. Dezenas: ${numerosStr}. Confira a divulgação oficial e a situação da premiação.`;
    body = `A Caixa divulgou as dezenas do concurso **${concurso}** da **${lnome}**, sorteado em **${dateFormatted}**. A premiação por faixa permanece em confirmação na fonte consultada.`;
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
premio_principal: ${premioPrincipal}
ganhadores: ${ganhadores}
rateio: ${JSON.stringify(rateio)}
municipios_ganhadores: ${JSON.stringify(municipios)}
source_url: ${JSON.stringify(sourceUrl)}
source_checked_at: ${JSON.stringify(checkedAt)}`;

  if (typeof acumulou === 'boolean') front += `\nacumulou: ${acumulou}`;
  if (publishedAt) front += `\npublished_at: ${JSON.stringify(publishedAt)}`;
  if (updatedAt) front += `\nupdated_at: ${JSON.stringify(updatedAt)}`;
  if (cidade) front += `\ncidade: ${JSON.stringify(cidade)}`;
  if (numerosSegundoSorteio.length > 0) front += `\nnumeros_segundo_sorteio: ${JSON.stringify(numerosSegundoSorteio)}`;
  if (mesSorte) front += `\nmes_sorte: ${JSON.stringify(mesSorte)}`;
  if (timeCoracao) front += `\ntime_coracao: ${JSON.stringify(timeCoracao)}`;
  if (proxConcurso) front += `\nproximo_concurso: ${proxConcurso}`;
  if (proxData) front += `\nproxima_data: "${proxData}"`;
  if (proxPremio) front += `\nproximo_premio: ${proxPremio}`;

  front += `
keywords: "${keywords}"
readTime: "2 min"
date: "${drawDate}"
---

## Resultado ${lnome} ${concurso} — ${dateFormatted}

${body}

As dezenas sorteadas foram **${numerosStr}**. O rateio oficial por faixa de premiação acompanha este boletim quando divulgado pela Caixa.

## Como conferir seu bilhete

Confira o número do concurso, as dezenas e o rateio no [registro oficial da Caixa para o concurso ${concurso}](${sourceUrl}). A confirmação e o pagamento de prêmios são de responsabilidade da Caixa.

Este boletim é produzido automaticamente a partir da fonte oficial. A data do sorteio é distinta da data de publicação do boletim. Para comunicar divergências, use a [página de correções](/correcoes).
`;

  if (proxConcurso && proxData) {
    front += `
## Próximo Sorteio — Concurso ${proxConcurso}

O próximo sorteio da ${lnome} acontece em **${formatPtDate(proxData)}**.
${proxPremio > 0 ? `Estimativa de prêmio: **${proxPremioStr}**.` : 'A estimativa de prêmio ainda não foi informada na fonte consultada.'}
`;
  }
  return front;
}

export async function updateLoterias({ root, today, now = () => new Date().toISOString(), fetchImpl = fetch, wait = sleep }) {
  const CONTENT_DIR = path.join(root, 'content', 'loterias');
  let totalUpdated = 0;
  let totalChecked = 0;
  const errors = [];

  for (const [loteriaKey, apiKey] of Object.entries(API_KEYS)) {
    const dir = path.join(CONTENT_DIR, loteriaKey);
    if (!fs.existsSync(dir)) continue;

    let latest;
    try {
      latest = await fetchCaixa(apiKey, undefined, { fetchImpl, wait });
      const latestDate = parseBRDate(latest?.dataApuracao);
      const latestNumbers = sourceNumbers(latest, loteriaKey);
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
    const localNumbers = files.map(f => Number(f.match(/\d+/)[0])).filter(n => n <= latestNumber);
    const firstLocal = localNumbers.length > 0 ? Math.min(...localNumbers) : latestNumber;
    const start = Math.max(firstLocal, latestNumber - 119);
    if (firstMissing < start) {
      errors.push(`${loteriaKey}: lacuna maior que 120 concursos; recuperação parcial`);
    }
    // Incluir lacunas locais também permite repetir uma consulta que falhou
    // ontem mesmo quando um concurso posterior já foi publicado.
    const candidates = new Set([latestNumber]);
    const publishedSet = new Set(publishedNumbers);
    for (let concurso = start; concurso <= latestNumber; concurso++) {
      if (!publishedSet.has(concurso)) candidates.add(concurso);
    }
    for (const file of files) {
      const numero = Number(file.match(/\d+/)[0]);
      if (numero > latestNumber) continue;
      if (fs.readFileSync(path.join(dir, file), 'utf-8').includes('status: aguardando')) candidates.add(numero);
    }

    console.log(`  ${NAMES[loteriaKey]}: conferindo ${candidates.size} concursos pela numeração oficial`);
    for (const concurso of [...candidates].sort((a, b) => a - b)) {
      totalChecked++;
      try {
        if (concurso !== latestNumber) await wait(300);
        const data = concurso === latestNumber ? latest : await fetchCaixa(apiKey, concurso, { fetchImpl, wait });
        const numeros = sourceNumbers(data, loteriaKey);
        const drawDate = parseBRDate(data?.dataApuracao);
        if (Number(data?.numero) !== concurso || !drawDate || drawDate > today || numeros.length === 0) {
          throw new Error('resposta sem número, data ou dezenas válidos');
        }
        const fp = path.join(dir, `concurso-${concurso}.mdx`);
        const existing = fs.existsSync(fp) ? fs.readFileSync(fp, 'utf-8') : '';
        const wasPublished = scalar(existing, 'status') === 'publicado';
        const timestamp = typeof now === 'function' ? now() : now;
        if (!validTimestamp(timestamp)) throw new Error('horário de publicação inválido');
        const originalPublishedAt = scalar(existing, 'published_at');
        const publishedAt = wasPublished
          ? (validTimestamp(originalPublishedAt) ? originalPublishedAt : undefined)
          : timestamp;
        const nextContent = buildPublicadoMDX(loteriaKey, data, {
          publishedAt,
          updatedAt: timestamp,
          checkedAt: timestamp,
        });
        if (substantiveContent(existing) !== substantiveContent(nextContent)) {
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
      // Guardar pendências antigas que falharam: a próxima execução precisa
      // poder tentar novamente. Só apagar previsões futuras não confirmadas.
      if (file !== nextFile && Number(file.match(/\d+/)[0]) > latestNumber) {
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
