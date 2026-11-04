import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CAPITALS } from '../lib/holiday-calendar.mjs';

const base = (process.argv[2] ?? 'http://localhost:3000').replace(/\/$/, '');
const years = fs.readdirSync('content/feriados').filter(file => /^\d{4}\.json$/.test(file)).map(file => Number(file.slice(0, 4))).sort();
const sitemapResponse = await fetch(`${base}/sitemap.xml`);
assert.equal(sitemapResponse.status, 200);
const sitemap = await sitemapResponse.text();
const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map(match => new URL(match[1]).pathname);
assert.equal(new Set(locations).size, locations.length, 'Duplicate sitemap paths');
assert.ok(locations.includes('/dias-uteis'));
assert.ok(!locations.some(path => path === '/meus-resultados' || path.startsWith('/api/')));

let calendars = 0, routes = 0;
for (const year of years) {
  for (const city of [{ slug: 'brasil' }, ...CAPITALS]) {
    const response = await fetch(`${base}/api/calendario?ano=${year}&cidade=${city.slug}`, { signal: AbortSignal.timeout(30000) });
    assert.equal(response.status, 200);
    assert.match(response.headers.get('x-robots-tag'), /noindex/);
    const calendar = await response.json();
    assert.equal(calendar.year, year);
    assert.equal(calendar.location.slug, city.slug);
    assert.ok(calendar.events.length >= 14);
    assert.equal(calendar.events.filter(event => event.kind === 'nacional').length, 9);
    assert.ok(calendar.events.every(event => event.source.url.startsWith('https://') && event.date.startsWith(`${year}-`)));
    assert.ok(calendar.coverageNote);
    if (year === 2026 && city.slug !== 'brasil') assert.ok(calendar.localCount > 0);
    const path = `/feriados/${year}${city.slug === 'brasil' ? '' : `/${city.slug}`}`;
    assert.ok(locations.includes(path), `${path} missing from sitemap`);
    const page = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(30000) });
    assert.equal(page.status, 200);
    const html = await page.text();
    assert.equal((html.match(/<h1(?:\s|>)/g) ?? []).length, 1);
    assert.ok(html.includes(`https://www.hojenoticia.com${path}`));
    assert.ok(!/<meta name="robots" content="[^"]*noindex/.test(html));
    assert.ok((html.match(/<tr>/g) ?? []).length >= calendar.events.length);
    calendars++; routes++;
  }
}
const download = await fetch(`${base}/api/calendario?ano=${years[0]}&cidade=sao-paulo-sp&formato=ics`);
assert.equal(download.status, 200);
assert.match(download.headers.get('content-type'), /text\/calendar/);
assert.match(download.headers.get('content-disposition'), /attachment; filename="feriados-sao-paulo-sp-\d{4}\.ics"/);
const ics = await download.text();
assert.ok(ics.endsWith('END:VCALENDAR\r\n'));
assert.ok(!/(?<!\r)\n/.test(ics));
assert.ok(ics.includes('DTSTART;VALUE=DATE:'));
assert.ok(!ics.includes('STATUS:TENTATIVE'));
assert.ok(ics.split('\r\n').every(line => Buffer.byteLength(line) <= 75));
for (const [query, status] of [['ano=2026&cidade=unknown', 404], ['ano=2025', 404], ['ano=2026&formato=html', 400], ['ano=../../x', 400]]) {
  assert.equal((await fetch(`${base}/api/calendario?${query}`)).status, status);
}
for (const path of ['/feriados/2026/unknown', '/feriados/2025']) assert.equal((await fetch(`${base}${path}`)).status, 404);
const calculator = await fetch(`${base}/dias-uteis?cidade=sao-paulo-sp`);
assert.equal(calculator.status, 200);
assert.match(await calculator.text(), /<link rel="canonical" href="https:\/\/www\.hojenoticia\.com\/dias-uteis"/);
console.log(JSON.stringify({ base, calendarModels: calendars, calendarPages: routes, capitals: CAPITALS.length, years, download: 'RFC 5545 all-day dates', sitemap: 'public utilities indexed; private preferences and API excluded' }, null, 2));
