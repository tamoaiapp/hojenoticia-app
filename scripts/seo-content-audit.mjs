import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import matter from 'gray-matter';

// Read-only audit of every lottery URL, its metadata, and Markdown links.
const root = process.cwd();
const contentRoot = path.join(root, 'content', 'loterias');
const routes = new Set(['/', '/loterias', '/noticias', '/sobre', '/contato', '/correcoes', '/politica-editorial', '/privacidade', '/termos', '/equipe/tiago-oliveira']);
const records = [];
const errors = [];
const titles = new Map();
const descriptions = new Map();
const modalities = {};

for (const loteria of fs.readdirSync(contentRoot)) {
  const dir = path.join(contentRoot, loteria);
  if (!fs.statSync(dir).isDirectory()) continue;
  routes.add(`/loterias/${loteria}`);
  routes.add(`/loterias/${loteria}/estatisticas`);
  modalities[loteria] = { published: 0, future: 0, confirmed: 0, minFuture: null, maxFuture: null };
  for (const file of fs.readdirSync(dir).filter(file => /\.mdx?$/.test(file))) {
    const { data, content } = matter(fs.readFileSync(path.join(dir, file), 'utf8'));
    const url = `/loterias/${loteria}/${file.replace(/\.mdx?$/, '')}`;
    routes.add(url);
    records.push({ data, content, url, loteria });
  }
}

function unique(map, value, field, url) {
  if (typeof value !== 'string' || !value.trim()) errors.push(`${url}: missing ${field}`);
  else if (map.has(value)) errors.push(`${url}: duplicate ${field} with ${map.get(value)}`);
  else map.set(value, url);
}

for (const { data, content, url, loteria } of records) {
  unique(titles, data.title, 'title', url);
  unique(descriptions, data.description, 'description', url);
  if (/\bhoje\b|ao vivo|tempo real/i.test(data.title)) errors.push(`${url}: unstable title`);
  if (/^# /m.test(content)) errors.push(`${url}: body adds a second H1`);
  if (!Number.isInteger(data.concurso) || data.concurso <= 0) errors.push(`${url}: invalid contest`);
  if (!content.trim()) errors.push(`${url}: empty body`);
  const counts = modalities[loteria];
  if (data.status === 'publicado') {
    counts.published++;
    if (!Array.isArray(data.numeros) || data.numeros.length === 0) errors.push(`${url}: published without numbers`);
    const numberCounts = { 'mega-sena': 6, quina: 5, lotofacil: 15, lotomania: 20, timemania: 7, diadesorte: 7, 'dupla-sena': 6, federal: 5, maismilionaria: 6, 'super-sete': 7 };
    if (data.numeros?.length !== numberCounts[loteria]) errors.push(`${url}: unexpected number count`);
    if (data.numeros?.some(number => typeof number !== 'string')) errors.push(`${url}: number strings required to preserve zeros`);
    if (loteria === 'dupla-sena' && data.numeros_segundo_sorteio?.length !== 6) errors.push(`${url}: second draw missing`);
    if (loteria === 'maismilionaria' && data.trevos_sorteados?.length !== 2) errors.push(`${url}: two trevos required`);
    if (loteria === 'super-sete' && data.numeros?.some(number => !/^\d$/.test(number))) errors.push(`${url}: positional digits invalid`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(data.draw_date)) errors.push(`${url}: published without draw date`);
  } else if (data.status === 'aguardando') {
    counts.future++;
    counts.minFuture = Math.min(counts.minFuture ?? Infinity, data.concurso);
    counts.maxFuture = Math.max(counts.maxFuture ?? 0, data.concurso);
    if (data.schedule_status === 'confirmed') counts.confirmed++;
    else if (data.schedule_status !== 'unconfirmed') errors.push(`${url}: future schedule status missing`);
    if (data.published_at || data.updated_at) errors.push(`${url}: future has article timestamps`);
    if (data.numeros?.length) errors.push(`${url}: future claims drawn numbers`);
  } else errors.push(`${url}: invalid status`);
  for (const [, href] of content.matchAll(/\[[^\]]+\]\((\/[^\s)]+)\)/g)) {
    const destination = decodeURI(href.split(/[?#]/)[0]).replace(/\/$/, '') || '/';
    if (!routes.has(destination)) errors.push(`${url}: broken internal Markdown link ${href}`);
  }
}

console.log(JSON.stringify({ pages: records.length, uniqueTitles: titles.size, uniqueDescriptions: descriptions.size, modalities, errors }, null, 2));
assert.equal(errors.length, 0, 'Content SEO audit failed');
const csvFlag = process.argv.find(value => value.startsWith('--csv='));
if (csvFlag) {
  const quote = value => `"${String(value ?? '').replace(/"/g, '""')}"`;
  const lines = [['url', 'loteria', 'concurso', 'status', 'schedule_status', 'title', 'description', 'data_confirmada', 'fonte']];
  for (const { data, url, loteria } of records) lines.push([
    `https://www.hojenoticia.com${url}`, loteria, data.concurso, data.status, data.schedule_status,
    data.title, data.description, data.status === 'publicado' || data.schedule_status === 'confirmed' ? data.draw_date : '', data.source_url,
  ]);
  fs.writeFileSync(csvFlag.slice('--csv='.length), `\uFEFF${lines.map(row => row.map(quote).join(',')).join('\r\n')}\r\n`, 'utf8');
}
