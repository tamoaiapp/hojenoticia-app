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

export const FUTURE_STOCK = Object.freeze({
  quina: 120, lotofacil: 120, 'mega-sena': 60, diadesorte: 60,
  'dupla-sena': 45, lotomania: 45, timemania: 45, 'super-sete': 45,
  maismilionaria: 30, federal: 30,
});

const RULES = {
  'mega-sena': 'Na Mega-Sena, são sorteados seis números entre 1 e 60.',
  quina: 'Na Quina, são sorteados cinco números entre 1 e 80.',
  lotofacil: 'Na Lotofácil, são sorteados 15 números entre 1 e 25.',
  lotomania: 'Na Lotomania, são sorteados 20 números entre 00 e 99.',
  timemania: 'Na Timemania, são sorteados sete números entre 1 e 80, além do time do coração.',
  diadesorte: 'No Dia de Sorte, são sorteados sete números entre 1 e 31 e um mês da sorte.',
  'dupla-sena': 'A Dupla Sena tem dois sorteios por concurso. Cada sorteio define seis números entre 1 e 50.',
  'super-sete': 'O Super Sete tem sete colunas. Cada coluna recebe um dígito sorteado entre 0 e 9, e a posição de cada dígito faz parte do resultado.',
  maismilionaria: 'Na +Milionária, são sorteados seis números entre 1 e 50 e dois trevos entre 1 e 6.',
  federal: 'A Loteria Federal utiliza bilhetes. O resultado informa os números dos bilhetes premiados na ordem dos prêmios principais.',
};

// O portal oficial da Caixa informa servicebus3 como API atual. O endereço
// anterior permanece como alternativa quando a consulta principal falhar.
const API_BASES = ['https://servicebus3.caixa.gov.br/portaldeloterias/api', 'https://servicebus2.caixa.gov.br/portaldeloterias/api'];
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
  let lastError;
  for (const base of API_BASES) {
    const url = `${base}/${api}${numero == null ? '' : `/${numero}`}`;
    for (let i = 0; i < 3; i++) {
      try {
        const res = await fetchImpl(url, {
          headers: { 'Accept': 'application/json', 'User-Agent': 'Mozilla/5.0' },
          signal: AbortSignal.timeout(15000),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        return { ...data, __source_api_base: base };
      } catch (e) {
        lastError = new Error(`${url}: ${e.message}`);
        if (i < 2) await wait(500 * (i + 1));
      }
    }
  }
  throw lastError;
}

function pendingEditorial(loteriaKey, concurso, { drawDate, premio = 0, sourceUrl = 'https://loterias.caixa.gov.br/' } = {}) {
  const nome = NAMES[loteriaKey];
  const title = drawDate
    ? `${nome} concurso ${concurso}: resultado e sorteio de ${formatDDMMYYYY(drawDate)}`
    : `${nome} concurso ${concurso}: resultado e informações`;
  const description = drawDate
    ? `Concurso ${concurso} da ${nome}, previsto pela Caixa para ${formatDDMMYYYY(drawDate)}. Acompanhe o resultado e a premiação oficial.`
    : `Acompanhe o concurso ${concurso} da ${nome}. Calendário, estimativa de prêmio e resultado aguardam confirmação oficial da Caixa.`;
  const schedule = drawDate
    ? `A Caixa informa o sorteio do concurso **${concurso}** para **${formatPtDate(drawDate)}**.${premio > 0 ? ` A estimativa de prêmio divulgada é de **${formatBRL(premio)}**.` : ''} O resultado aguarda divulgação oficial.`
    : `Esta página acompanha o concurso **${concurso}** da **${nome}**. O calendário, a estimativa de prêmio e o resultado aguardam confirmação oficial. As informações confirmadas serão incluídas após a divulgação pela Caixa.`;
  return {
    title, description,
    keywords: `${nome} concurso ${concurso}, resultado ${nome} ${concurso}`,
    body: `## Situação do concurso ${concurso}\n\n${schedule}\n\n## Como funciona a ${nome}\n\n${RULES[loteriaKey]} As faixas de premiação e as condições de participação seguem o regulamento oficial da modalidade.\n\n## Onde conferir as informações\n\nConsulte os [canais oficiais das Loterias Caixa](${sourceUrl}) para acompanhar a divulgação. A conferência definitiva de bilhetes e prêmios deve ser feita junto à Caixa.\n\nVeja o [último resultado disponível e o histórico da ${nome}](/loterias/${loteriaKey}). O Hoje Notícia é independente da Caixa; divergências podem ser comunicadas pelos [canais de correção](/correcoes).\n`,
  };
}

function buildFutureMDX(loteriaKey, concurso, schedule = {}) {
  const { drawDate, premio = 0, sourceUrl = 'https://loterias.caixa.gov.br/' } = schedule;
  const { title, description, keywords, body } = pendingEditorial(loteriaKey, concurso, schedule);
  return `---
title: ${JSON.stringify(title)}
description: ${JSON.stringify(description)}
loteria: ${loteriaKey}
concurso: ${concurso}
status: aguardando
schedule_status: ${drawDate ? 'confirmed' : 'unconfirmed'}${drawDate ? `\ndraw_date: ${JSON.stringify(drawDate)}` : ''}
numeros: []
premio_principal: ${drawDate ? premio : 0}
ganhadores: 0
source_url: ${JSON.stringify(sourceUrl)}
keywords: ${JSON.stringify(keywords)}
---

${body}`.trimEnd() + '\n';
}

function sourceNumbers(data, loteriaKey) {
  const values = [data?.listaDezenas, data?.dezenasSorteadasOrdemSorteio, data?.dezenas]
    .find(values => Array.isArray(values) && values.length > 0) || [];
  // Sem a lista canônica do primeiro sorteio, não aceitar uma lista combinada
  // de 12 dezenas como se fosse um único resultado da Dupla Sena.
  if (loteriaKey === 'dupla-sena' && values.length !== 6) return [];
  if (loteriaKey === 'super-sete' && (data?.tipoJogo !== 'SUPER_7' || values.length !== 7 || values.some(n => !/^\d$/.test(cleanText(n))))) return [];
  return values;
}

function cleanText(value) {
  return String(value ?? '').replace(/[\u0000-\u001F\u007F-\u009F]/g, ' ').replace(/\s+/g, ' ').trim();
}

function extractDrawData(loteriaKey, data) {
  const keepOrderAndDigits = loteriaKey === 'super-sete' || loteriaKey === 'federal';
  const numeros = sourceNumbers(data, loteriaKey).map(n => keepOrderAndDigits ? cleanText(n) : cleanText(n).padStart(2, '0'));
  if (!keepOrderAndDigits) numeros.sort((a, b) => Number(a) - Number(b));

  const rateio = (Array.isArray(data.listaRateioPremio) ? data.listaRateioPremio : []).map((r, index) => ({
    faixa: Number(r.faixa) || index + 1,
    descricao: cleanText(r.descricaoFaixa) || `Faixa ${index + 1}`,
    ganhadores: Math.max(0, Number(r.numeroDeGanhadores) || 0),
    premio: Math.max(0, Number(r.valorPremio) || 0),
  }));
  const municipios = (Array.isArray(data.listaMunicipioUFGanhadores) ? data.listaMunicipioUFGanhadores : [])
    .filter(g => Number(g.ganhadores) > 0 && cleanText(g.municipio))
    .map(g => ({ municipio: cleanText(g.municipio), uf: cleanText(g.uf), ganhadores: Number(g.ganhadores) }));
  // Municípios podem ser uma lista parcial; o rateio define a faixa principal.
  const ganhadores = rateio.length > 0 ? rateio[0].ganhadores : municipios.reduce((sum, g) => sum + g.ganhadores, 0);
  const premioPrincipal = ganhadores > 0 ? rateio[0]?.premio || 0 : 0;
  const cidade = municipios.length === 1 ? `${municipios[0].municipio}, ${municipios[0].uf}` : undefined;
  const acumulou = typeof data.acumulado === 'boolean' ? data.acumulado : rateio.length > 0 ? ganhadores === 0 : undefined;
  const numerosSegundoSorteio = (loteriaKey === 'dupla-sena' && Array.isArray(data.listaDezenasSegundoSorteio) ? data.listaDezenasSegundoSorteio : [])
    .map(n => cleanText(n).padStart(2, '0')).sort((a, b) => Number(a) - Number(b));
  // A API compartilha este campo entre o mês do Dia de Sorte e o time da
  // Timemania; nas outras modalidades ele pode conter preenchimento NUL.
  const mesSorte = loteriaKey === 'diadesorte'
    ? cleanText(data.nomeMesSorte) || cleanText(data.nomeTimeCoracaoMesSorte) || undefined
    : undefined;
  const timeCoracao = loteriaKey === 'timemania'
    ? cleanText(data.nomeTimeCoracaoMesSorte) || undefined
    : undefined;
  const trevosSorteados = loteriaKey === 'maismilionaria' && Array.isArray(data.trevosSorteados)
    ? data.trevosSorteados.map(n => cleanText(n)).filter(Boolean)
    : [];

  return { numeros, ganhadores, cidade, premioPrincipal, acumulou, rateio, municipios, numerosSegundoSorteio, mesSorte, timeCoracao, trevosSorteados };
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

function publishedEditorial(loteriaKey, { concurso, drawDate, numeros, sourceUrl }) {
  const nome = NAMES[loteriaKey];
  const label = loteriaKey === 'federal' ? 'bilhetes' : loteriaKey === 'super-sete' ? 'dígitos por coluna' : 'números';
  const title = `Resultado ${nome} concurso ${concurso} — ${formatDDMMYYYY(drawDate)}`;
  const detailed = `Resultado ${nome} ${concurso} (${formatDDMMYYYY(drawDate)}): ${label} ${numeros.join(', ')}. Consulte a premiação e a fonte oficial.`;
  const description = detailed.length <= 160 ? detailed : `Resultado ${nome} concurso ${concurso}, de ${formatDDMMYYYY(drawDate)}. Consulte os números, o rateio disponível e a fonte oficial da Caixa.`;
  return {
    title, description,
    keywords: `resultado ${nome} ${concurso}, ${nome} concurso ${concurso}`,
    body: `## Resultado do concurso ${concurso}\n\nO concurso **${concurso}** da **${nome}** tem resultado registrado para **${formatPtDate(drawDate)}**. O número do concurso e a data identificam o resultado apresentado nesta página.${loteriaKey === 'federal' ? ' Na Federal, a ordem dos bilhetes corresponde à ordem dos prêmios principais.' : loteriaKey === 'super-sete' ? ' No Super Sete, cada dígito deve ser conferido na sua coluna, mantendo a ordem do sorteio.' : ''}\n\n## Como conferir\n\nCompare a modalidade, o número do concurso e os ${label} com o seu bilhete. As informações de premiação disponíveis nesta página acompanham os dados do concurso; a conferência definitiva e o pagamento de prêmios são de responsabilidade da Caixa.\n\n## Sobre a ${nome}\n\n${RULES[loteriaKey]} Consulte as condições de participação e as faixas de premiação no regulamento oficial.\n\n## Fonte e correções\n\nReferência para conferência: [registro oficial da Caixa para o concurso ${concurso}](${sourceUrl}). A data do sorteio é distinta da data de publicação do boletim. O Hoje Notícia é independente da Caixa; comunique divergências pelos [canais de correção](/correcoes).\n`,
  };
}

function buildPublicadoMDX(loteriaKey, data, { publishedAt, updatedAt, checkedAt }) {
  const concurso = data.numero;
  const drawDate = parseBRDate(data.dataApuracao);
  const proxConcurso = data.numeroConcursoProximo || concurso + 1;
  const proxData = data.dataProximoConcurso ? parseBRDate(data.dataProximoConcurso) : null;
  const proxPremio = Number(data.valorEstimadoProximoConcurso) || 0;
  const { numeros, ganhadores, cidade, premioPrincipal, acumulou, rateio, municipios, numerosSegundoSorteio, mesSorte, timeCoracao, trevosSorteados } = extractDrawData(loteriaKey, data);
  const sourceUrl = `${data.__source_api_base || API_BASES[0]}/${API_KEYS[loteriaKey]}/${concurso}`;
  const { title, description, body, keywords } = publishedEditorial(loteriaKey, { concurso, drawDate, numeros, sourceUrl });

  let front = `---
title: "${title.replace(/"/g, "'")}"
description: "${description.replace(/"/g, "'")}"
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
  if (trevosSorteados.length > 0) front += `\ntrevos_sorteados: ${JSON.stringify(trevosSorteados)}`;
  if (proxConcurso) front += `\nproximo_concurso: ${proxConcurso}`;
  if (proxData) front += `\nproxima_data: "${proxData}"`;
  if (proxPremio) front += `\nproximo_premio: ${proxPremio}`;

  front += `
readTime: "2 min"
date: "${drawDate}"
keywords: "${keywords}"
---

${body}
`;
  return front.trimEnd() + '\n';
}

function referenceUrl(loteriaKey, concurso, existing) {
  try {
    const url = new URL(existing);
    if (url.protocol === 'https:' && !url.username && !url.password && (url.hostname === 'caixa.gov.br' || url.hostname.endsWith('.caixa.gov.br'))) return existing;
  } catch { /* Use a stable official reference, without claiming a new fetch. */ }
  return `${API_BASES[0]}/${API_KEYS[loteriaKey]}/${concurso}`;
}

/** Local editorial migration: preserve every factual frontmatter line verbatim. */
export function normalizeLotteryContent({ root }) {
  const contentDir = path.join(root, 'content', 'loterias');
  let checked = 0, changes = 0, factualRecordsVerified = 0;
  const errors = [];
  const editorialKey = /^(?:title|description|keywords):/;
  for (const loteriaKey of Object.keys(API_KEYS)) {
    const dir = path.join(contentDir, loteriaKey);
    if (!fs.existsSync(dir)) continue;
    for (const file of fs.readdirSync(dir).filter(f => /^concurso-\d+\.mdx$/.test(f))) {
      checked++;
      const fp = path.join(dir, file);
      const existing = fs.readFileSync(fp, 'utf-8');
      const parsed = existing.match(/^\uFEFF?---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
      if (!parsed) { errors.push(`${loteriaKey}/${file}: frontmatter ausente`); continue; }
      const metadata = parsed[1];
      if (/^(?:title|description|keywords):\s*[>|]/m.test(metadata)) { errors.push(`${loteriaKey}/${file}: campo editorial multilinha exige revisão`); continue; }
      const status = scalar(metadata, 'status');
      const concurso = Number(scalar(metadata, 'concurso'));
      if (!Number.isInteger(concurso) || concurso < 1 || concurso !== Number(file.match(/\d+/)[0]) || scalar(metadata, 'loteria') !== loteriaKey) {
        errors.push(`${loteriaKey}/${file}: identidade do concurso inválida`); continue;
      }
      let editorial;
      if (status === 'publicado') {
        const drawDate = scalar(metadata, 'draw_date');
        const parsedDate = typeof drawDate === 'string' ? new Date(`${drawDate}T12:00:00Z`) : null;
        const numeros = scalar(metadata, 'numeros');
        if (!parsedDate || !Number.isFinite(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== drawDate || !Array.isArray(numeros)) {
          errors.push(`${loteriaKey}/${file}: resultado legado requer revisão`); continue;
        }
        editorial = publishedEditorial(loteriaKey, {
          concurso, drawDate, numeros: numeros.map(String),
          sourceUrl: referenceUrl(loteriaKey, concurso, scalar(metadata, 'source_url')),
        });
      } else if (status === 'aguardando') {
        const date = scalar(metadata, 'draw_date');
        const parsedDate = typeof date === 'string' ? new Date(`${date}T12:00:00Z`) : null;
        const confirmed = scalar(metadata, 'schedule_status') === 'confirmed' && parsedDate && Number.isFinite(parsedDate.getTime()) && parsedDate.toISOString().slice(0, 10) === date;
        editorial = pendingEditorial(loteriaKey, concurso, confirmed ? {
          drawDate: date, premio: Math.max(0, Number(scalar(metadata, 'premio_principal')) || 0),
          sourceUrl: referenceUrl(loteriaKey, concurso, scalar(metadata, 'source_url')),
        } : undefined);
      } else { errors.push(`${loteriaKey}/${file}: status desconhecido`); continue; }

      const factualLines = metadata.split(/\r?\n/).filter(line => !editorialKey.test(line));
      const nextMetadata = [
        `title: ${JSON.stringify(editorial.title)}`,
        `description: ${JSON.stringify(editorial.description)}`,
        ...factualLines,
        `keywords: ${JSON.stringify(editorial.keywords)}`,
      ].join('\n');
      const preservedLines = nextMetadata.split('\n').filter(line => !editorialKey.test(line));
      if (JSON.stringify(factualLines) !== JSON.stringify(preservedLines)) {
        errors.push(`${loteriaKey}/${file}: alteração factual bloqueada`); continue;
      }
      factualRecordsVerified++;
      const nextContent = `---\n${nextMetadata}\n---\n\n${editorial.body}`.trimEnd() + '\n';
      if (existing.replace(/\r\n/g, '\n') !== nextContent) {
        fs.writeFileSync(fp, nextContent, 'utf-8');
        changes++;
      }
    }
  }
  return { checked, changes, factualRecordsVerified, errors };
}

export async function updateLoterias({ root, today, now = () => new Date().toISOString(), fetchImpl = fetch, wait = sleep, refresh = {}, onlyLoterias }) {
  const CONTENT_DIR = path.join(root, 'content', 'loterias');
  let totalUpdated = 0;
  let totalChecked = 0;
  let futureCreated = 0;
  const errors = [];

  for (const [loteriaKey, apiKey] of Object.entries(API_KEYS)) {
    if (Array.isArray(onlyLoterias) && !onlyLoterias.includes(loteriaKey)) continue;
    const dir = path.join(CONTENT_DIR, loteriaKey);
    fs.mkdirSync(dir, { recursive: true });

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
    // Enriquecer arquivos históricos selecionados sem criar um novo artigo
    // retroativo ou aceitar números que a fonte ainda não publicou.
    const requestedRefresh = refresh?.[loteriaKey];
    if (Array.isArray(requestedRefresh)) {
      for (const numero of requestedRefresh) {
        if (!Number.isInteger(numero) || numero <= 0 || numero > latestNumber) continue;
        const fp = path.join(dir, `concurso-${numero}.mdx`);
        if (fs.existsSync(fp) && scalar(fs.readFileSync(fp, 'utf-8'), 'status') === 'publicado') candidates.add(numero);
      }
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

    // As páginas de concursos futuros são permanentes. Confirmar somente o
    // próximo calendário fornecido pela Caixa; preservar as demais pendências.
    const nextNumber = Number(latest.numeroConcursoProximo);
    const nextDate = parseBRDate(latest.dataProximoConcurso);
    const hasNext = Number.isInteger(nextNumber) && nextNumber > latestNumber && nextDate && nextDate >= today;
    const nextFile = hasNext ? `concurso-${nextNumber}.mdx` : null;
    if (nextFile) {
      const fp = path.join(dir, nextFile);
      const existed = fs.existsSync(fp);
      const nextContent = buildFutureMDX(loteriaKey, nextNumber, {
        drawDate: nextDate,
        premio: Math.max(0, Number(latest.valorEstimadoProximoConcurso) || 0),
        sourceUrl: `${latest.__source_api_base || API_BASES[0]}/${apiKey}/${latestNumber}`,
      });
      if (!existed || fs.readFileSync(fp, 'utf-8') !== nextContent) {
        fs.writeFileSync(fp, nextContent, 'utf-8');
        totalUpdated++;
        if (!existed) futureCreated++;
      }
    }
    // Repor o estoque sem reduzir a janela existente nem inventar calendário.
    for (let numero = latestNumber + 1; numero <= latestNumber + FUTURE_STOCK[loteriaKey]; numero++) {
      const fp = path.join(dir, `concurso-${numero}.mdx`);
      if (fs.existsSync(fp)) continue;
      fs.writeFileSync(fp, buildFutureMDX(loteriaKey, numero), 'utf-8');
      totalUpdated++;
      futureCreated++;
    }
  }

  return {
    changes: totalUpdated,
    futureCreated,
    errors,
    summary: `${totalChecked} concursos conferidos, ${totalUpdated} arquivos alterados, ${futureCreated} páginas futuras criadas, ${errors.length} falhas`,
  };
}
