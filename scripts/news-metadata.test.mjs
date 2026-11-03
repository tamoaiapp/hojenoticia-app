import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const newsFile = fileURLToPath(new URL('../lib/news.ts', import.meta.url));

function loadNews(draws = []) {
  const source = fs.readFileSync(newsFile, 'utf8');
  const compiled = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
    reportDiagnostics: true,
  });
  const errors = (compiled.diagnostics || []).filter(item => item.category === ts.DiagnosticCategory.Error);
  assert.deepEqual(errors, [], 'The news helpers must transpile without errors');

  const module = { exports: {} };
  const imports = [];
  const requireStub = (specifier) => {
    imports.push(specifier);
    assert.equal(specifier, './loterias', `Unexpected dependency in news helpers: ${specifier}`);
    return { getAllDraws: () => draws };
  };
  new Function('require', 'module', 'exports', compiled.outputText)(requireStub, module, module.exports);
  assert.deepEqual(imports, ['./loterias'], 'The getAllDraws stub must match the actual import');
  return module.exports;
}

function makeDraw(overrides = {}) {
  return {
    loteria: 'mega-sena',
    concurso: 3080,
    slug: 'concurso-3080',
    status: 'publicado',
    draw_date: '2026-11-01',
    numeros: ['13', '17', '28', '29', '39', '58'],
    premio_principal: 0,
    ganhadores: 0,
    title: 'Mega-Sena acumula após o concurso 3080',
    description: 'Resultado confirmado na fonte oficial.',
    keywords: '',
    source_url: 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/3080',
    published_at: '2026-11-03T09:00:00-03:00',
    ...overrides,
  };
}

test('legacy results without a recorded publication time are not classified as news', () => {
  const news = loadNews();
  const legacy = makeDraw();
  delete legacy.published_at;
  assert.equal(news.isNewsArticle(legacy), false);
  assert.equal(news.isNewsArticle(makeDraw({ published_at: undefined })), false);
  assert.equal(news.isNewsArticle(makeDraw({ status: 'aguardando' })), false);
  assert.equal(news.isNewsArticle(makeDraw()), true);
});

test('publication timestamps need a real calendar date, clock time, and timezone', () => {
  const { publicationTime } = loadNews();
  for (const value of [
    undefined, '', '2026-11-03', '2026-11-03T09:00:00',
    '2026-02-30T09:00:00-03:00', '2026-13-03T09:00:00Z',
    '2026-11-03T24:00:00Z', '2026-11-03T09:60:00Z',
    '2026-11-03T09:00:60Z', '2026-11-03T09:00:00+24:00',
  ]) {
    assert.equal(publicationTime(value), null, `Must reject ${String(value)}`);
  }
  for (const value of ['2026-11-03T09:00-03:00', '2026-11-03T12:00:00Z', '2026-11-03T12:00:00.123Z']) {
    assert.equal(publicationTime(value), Date.parse(value));
  }
});

test('a historical article stays news, but a backfilled old event does not become a new story', () => {
  const { isNewsArticle } = loadNews();
  assert.equal(isNewsArticle(makeDraw({ draw_date: '2020-05-01', published_at: '2020-05-01T22:00:00-03:00' })), true);
  assert.equal(isNewsArticle(makeDraw({ draw_date: '2026-11-01' })), true);
  assert.equal(isNewsArticle(makeDraw({ draw_date: '2026-10-31' })), false);
  assert.equal(isNewsArticle(makeDraw({ draw_date: '2026-11-04' })), false);
  assert.equal(isNewsArticle(makeDraw({ draw_date: '2026-02-30' })), false);
});

test('event-day comparisons use the Brazilian publication day rather than the UTC day', () => {
  const { isNewsArticle } = loadNews();
  const lateUtc = { published_at: '2026-11-03T01:00:00Z' };
  assert.equal(isNewsArticle(makeDraw({ ...lateUtc, draw_date: '2026-11-02' })), true);
  assert.equal(isNewsArticle(makeDraw({ ...lateUtc, draw_date: '2026-11-03' })), false);
});

test('only HTTPS Caixa sources without embedded credentials are accepted', () => {
  const news = loadNews();
  for (const value of ['https://caixa.gov.br/', 'https://www.caixa.gov.br/loterias/', 'https://loterias.caixa.gov.br/Paginas/mega-sena.aspx']) {
    assert.equal(news.isOfficialCaixaSource(value), true, value);
  }
  for (const value of [
    undefined, '', 'not a url', 'http://loterias.caixa.gov.br/',
    'https://caixa.gov.br.example.com/', 'https://notcaixa.gov.br/',
    'https://user@loterias.caixa.gov.br/', 'https://user:secret@loterias.caixa.gov.br/',
    'javascript:alert(1)',
  ]) {
    assert.equal(news.isOfficialCaixaSource(value), false, String(value));
    assert.equal(news.isNewsArticle(makeDraw({ source_url: value })), false, String(value));
  }
});

test('the news sitemap includes exactly the last 48 hours and excludes future publications', () => {
  const { getNewsSitemapDraws } = loadNews();
  const now = new Date('2026-11-03T12:00:00Z');
  const boundary = makeDraw({ published_at: '2026-11-01T12:00:00Z' });
  const inside = makeDraw({ published_at: '2026-11-01T12:00:01Z' });
  const outside = makeDraw({ published_at: '2026-11-01T11:59:59Z' });
  const atNow = makeDraw({ draw_date: '2026-11-03', published_at: now.toISOString() });
  const future = makeDraw({ draw_date: '2026-11-03', published_at: '2026-11-03T12:00:01Z' });
  const actual = getNewsSitemapDraws([outside, boundary, future, inside, atNow], now);
  assert.deepEqual(actual.map(draw => draw.published_at), [atNow.published_at, inside.published_at, boundary.published_at]);
});

test('the news sitemap caps entries at 1000 after sorting the eligible articles', () => {
  const { getNewsSitemapDraws } = loadNews();
  const now = new Date('2026-11-03T12:00:00Z');
  const draws = Array.from({ length: 1002 }, (_, index) => makeDraw({
    concurso: index,
    slug: `concurso-${index}`,
    draw_date: '2026-11-03',
    published_at: new Date(now.getTime() - index * 1000).toISOString(),
  })).reverse();
  const actual = getNewsSitemapDraws(draws, now);
  assert.equal(actual.length, 1000);
  assert.equal(actual[0].concurso, 0);
  assert.equal(actual.at(-1).concurso, 999);
});

test('getNewsDraws filters legacy records and sorts real publications newest first', () => {
  const older = makeDraw({ concurso: 3079, published_at: '2026-11-01T12:00:00Z' });
  const newer = makeDraw({ concurso: 3080 });
  const invalid = makeDraw({ concurso: 3081, published_at: undefined });
  const { getNewsDraws } = loadNews([older, invalid, newer]);
  assert.deepEqual(getNewsDraws().map(draw => draw.concurso), [3080, 3079]);
});

test('XML escaping protects markup, preserves Portuguese text, and drops forbidden control characters', () => {
  const { escapeXml } = loadNews();
  assert.equal(escapeXml('Hoje Notícia & <resultado> "oficial" \'Caixa\'\u0001'), 'Hoje Notícia &amp; &lt;resultado&gt; &quot;oficial&quot; &apos;Caixa&apos;');
  assert.equal(escapeXml('ação\nfonte\tCaixa'), 'ação\nfonte\tCaixa');
  assert.equal(escapeXml(''), '');
});

test('article permalinks remain tied to the lottery and contest slug', () => {
  const { newsArticleUrl } = loadNews();
  assert.equal(newsArticleUrl(makeDraw()), 'https://www.hojenoticia.com/loterias/mega-sena/concurso-3080');
  assert.equal(newsArticleUrl(makeDraw({ slug: 'concurso-3080?alterado' })), 'https://www.hojenoticia.com/loterias/mega-sena/concurso-3080%3Falterado');
});
