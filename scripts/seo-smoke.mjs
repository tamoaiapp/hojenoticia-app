import assert from 'node:assert/strict';

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const read = async (path, status = 200) => {
  const response = await fetch(`${base}${path}`);
  assert.equal(response.status, status, `${path} status`);
  return response.text();
};
const home = await read('/');
assert.doesNotMatch(home, /href="\/(?:copa|eleicoes-2026)(?:[\/"?])/);
const future = await read('/loterias/lotofacil/concurso-3910');
const robots = future.match(/<meta name="robots" content="([^"]+)"/)?.[1];
assert.ok(robots && !robots.includes('noindex'), 'Future SEO pages must remain indexable');
assert.match(future, /rel="canonical" href="https:\/\/www\.hojenoticia\.com\/loterias\/lotofacil\/concurso-3910"/);
assert.match(future, /aguardam? confirma|aguardando confirma|Data a confirmar/i);
const schemas = [...future.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(match => JSON.parse(match[1]));
assert.ok(!schemas.some(schema => schema['@type'] === 'NewsArticle'), 'An unconfirmed result is not a news article');
const sitemap = await read('/sitemap.xml');
assert.match(sitemap, /https:\/\/www\.hojenoticia\.com\/loterias\/lotofacil\/concurso-3910/);
assert.doesNotMatch(sitemap, /<loc>[^<]*\/(?:copa|eleicoes-2026)(?:[\/<])/);
for (const match of sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)) {
  assert.ok(Date.parse(match[1]) <= Date.now() + 1000, 'Sitemap must not claim future modification');
}
await read('/copa', 410);
await read('/eleicoes-2026/presidente', 410);
const news = await read('/news-sitemap.xml');
assert.match(news, /xmlns:news="http:\/\/www\.google\.com\/schemas\/sitemap-news\/0.9"/);
assert.doesNotMatch(news, /concurso-3910/);
assert.match(await read('/rss.xml'), /<rss version="2\.0"/);
const imageResponse = await fetch(`${base}/loterias/mega-sena/concurso-3080/imagem`);
assert.equal(imageResponse.status, 200);
const png = Buffer.from(await imageResponse.arrayBuffer());
assert.equal(png.subarray(1, 4).toString(), 'PNG');
assert.equal(png.readUInt32BE(16), 1200);
assert.equal(png.readUInt32BE(20), 675);
console.log(`SEO smoke passed: ${base}; future pages indexable, archives retired, feeds and image valid.`);
