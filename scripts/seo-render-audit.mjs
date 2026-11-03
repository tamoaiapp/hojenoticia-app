import assert from 'node:assert/strict';

const base = (process.argv[2] || 'http://localhost:3000').replace(/\/$/, '');
const sitemapResponse = await fetch(`${base}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]));
const sitemapPaths = new Set(locations.map(url => url.pathname.replace(/\/$/, '') || '/'));
const paths = [...sitemapPaths].filter(path => !/\/concurso-/.test(path));
// Include every template and representative old, confirmed-next and unconfirmed results.
paths.push('/loterias/quina/concurso-7050', '/loterias/lotofacil/concurso-3910', '/loterias/mega-sena/concurso-3080');
for (const lot of ['federal', 'maismilionaria', 'super-sete']) {
  const contests = [...sitemapPaths].filter(path => path.startsWith(`/loterias/${lot}/concurso-`)).sort((a, b) => Number(a.split('-').at(-1)) - Number(b.split('-').at(-1)));
  paths.push(...new Set([contests[0], contests[1], contests.at(-1)].filter(Boolean)));
}
const failures = [];
const titles = new Map();
let linksChecked = 0;
let cursor = 0;

await Promise.all(Array.from({ length: 3 }, async () => {
  while (cursor < paths.length) {
    const path = paths[cursor++];
    try {
      const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(60000) });
      assert.equal(response.status, 200, 'HTTP status');
      const html = await response.text();
      const title = html.match(/<title>(.*?)<\/title>/s)?.[1];
      assert.ok(title?.trim(), 'Title missing');
      assert.ok((title.match(/Hoje Notícia/g) || []).length <= 1, 'Duplicate branding in title');
      assert.ok(!titles.has(title), `Duplicate title with ${titles.get(title)}`);
      titles.set(title, path);
      assert.equal((html.match(/<h1(?:\s|>)/g) || []).length, 1, 'Expected exactly one H1');
      assert.match(html, /<meta name="description" content="[^\"]+"/, 'Description missing');
      assert.ok(!/<meta name="robots" content="[^\"]*noindex/.test(html), 'Unexpected noindex');
      const canonical = html.match(/<link rel="canonical" href="([^\"]+)"/)?.[1];
      assert.equal(new URL(canonical).href, new URL(`https://www.hojenoticia.com${path}`).href, 'Canonical mismatch');
      for (const [, href] of html.matchAll(/<a\b[^>]*\bhref="([^\"]+)"/g)) {
        if (!href.startsWith('/') || href.startsWith('//')) continue;
        const destination = new URL(href.replace(/&amp;/g, '&'), 'https://www.hojenoticia.com').pathname.replace(/\/$/, '') || '/';
        assert.ok(sitemapPaths.has(destination) || ['/rss.xml', '/news-sitemap.xml'].includes(destination), `Link outside known pages: ${href}`);
        linksChecked++;
      }
    } catch (error) {
      failures.push(`${path}: ${error.message}`);
    }
  }
}));
console.log(JSON.stringify({ base, renderedPages: paths.length, sitemapUrls: sitemapPaths.size, internalLinksChecked: linksChecked, failures }, null, 2));
assert.equal(failures.length, 0, 'Rendered SEO audit failed');
