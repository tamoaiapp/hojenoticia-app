import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { FUTURE_STOCK, normalizeLotteryContent, updateLoterias } from './loterias.mjs';

test('recovers a result whose local forecast date is still in the future', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hojenoticia-loterias-'));
  const dir = path.join(root, 'content', 'loterias', 'mega-sena');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'concurso-3057.mdx'), 'status: publicado\n');
  fs.writeFileSync(path.join(dir, 'concurso-3058.mdx'), 'status: aguardando\ndraw_date: "2026-11-04"\n');
  fs.writeFileSync(path.join(dir, 'concurso-3059.mdx'), 'status: aguardando\ndraw_date: "2026-11-07"\n');

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.equal(url, 'https://servicebus3.caixa.gov.br/portaldeloterias/api/megasena');
    return new Response(JSON.stringify({
      numero: 3058,
      dataApuracao: '15/09/2026',
      listaDezenas: ['01', '02', '03', '04', '05', '06'],
      numeroConcursoProximo: 3059,
      dataProximoConcurso: '17/09/2026',
      valorEstimadoProximoConcurso: 1000000,
      listaRateioPremio: [{ numeroDeGanhadores: 0, valorPremio: 0 }],
    }), { status: 200 });
  };

  try {
    const result = await updateLoterias({ root, today: '2026-11-03', onlyLoterias: ['mega-sena'] });
    assert.deepEqual(result.errors, []);
    assert.match(fs.readFileSync(path.join(dir, 'concurso-3058.mdx'), 'utf-8'), /status: publicado[\s\S]*draw_date: "2026-09-15"/);
    assert.equal(fs.readFileSync(path.join(dir, 'concurso-3059.mdx'), 'utf-8'), 'status: aguardando\ndraw_date: "2026-11-07"\n', 'future contest URLs remain available');
  } finally {
    globalThis.fetch = originalFetch;
    fs.rmSync(root, { recursive: true, force: true });
  }
});

function fixture(files = {}, game = 'mega-sena') {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hojenoticia-publication-'));
  const dir = path.join(root, 'content', 'loterias', game);
  fs.mkdirSync(dir, { recursive: true });
  for (const [name, content] of Object.entries(files)) fs.writeFileSync(path.join(dir, name), content);
  return { root, dir, cleanup: () => fs.rmSync(root, { recursive: true, force: true }) };
}

function official(overrides = {}) {
  return {
    numero: 3058,
    dataApuracao: '03/11/2026',
    listaDezenas: ['01', '02', '03', '04', '05', '06'],
    acumulado: false,
    listaRateioPremio: [
      { faixa: 1, descricaoFaixa: '6 acertos', numeroDeGanhadores: 2, valorPremio: 12345.67 },
      { faixa: 2, descricaoFaixa: '5 acertos', numeroDeGanhadores: 40, valorPremio: 123.45 },
    ],
    listaMunicipioUFGanhadores: [{ municipio: 'São Paulo', uf: 'SP', ganhadores: 1 }],
    ...overrides,
  };
}

function options(root, data, now = '2026-11-03T23:01:02.000Z') {
  return {
    root, today: '2026-11-03', now,
    onlyLoterias: fs.readdirSync(path.join(root, 'content', 'loterias')),
    wait: async () => {},
    fetchImpl: async () => new Response(JSON.stringify(data), { status: 200 }),
  };
}

function field(content, name) {
  const value = content.match(new RegExp(`^${name}: (.+)$`, 'm'))?.[1];
  if (value === undefined) return undefined;
  try { return JSON.parse(value); } catch { return value; }
}

test('records the real publication time and official prize data for a new result', async () => {
  const f = fixture({ 'concurso-3058.mdx': 'status: aguardando\ndraw_date: "2026-11-04"\n' });
  try {
    const result = await updateLoterias(options(f.root, official()));
    const content = fs.readFileSync(path.join(f.dir, 'concurso-3058.mdx'), 'utf-8');
    assert.deepEqual(result.errors, []);
    assert.equal(field(content, 'published_at'), '2026-11-03T23:01:02.000Z');
    assert.equal(field(content, 'source_checked_at'), '2026-11-03T23:01:02.000Z');
    assert.equal(field(content, 'source_url'), 'https://servicebus3.caixa.gov.br/portaldeloterias/api/megasena/3058');
    assert.equal(field(content, 'ganhadores'), 2, 'rateio takes precedence over a partial municipality list');
    assert.equal(field(content, 'premio_principal'), 12345.67, 'keep the actual cents');
    assert.equal(field(content, 'rateio')[1].descricao, '5 acertos');
    assert.match(content, /registro oficial da Caixa/);
  } finally { f.cleanup(); }
});

test('preserves original publication when prize data changes, then leaves repeated polling unchanged', async () => {
  const f = fixture();
  try {
    await updateLoterias(options(f.root, official()));
    const corrected = official({ listaRateioPremio: [{ faixa: 1, descricaoFaixa: '6 acertos', numeroDeGanhadores: 2, valorPremio: 23456.78 }] });
    await updateLoterias(options(f.root, corrected, '2026-11-03T23:05:00.000Z'));
    const fp = path.join(f.dir, 'concurso-3058.mdx');
    const content = fs.readFileSync(fp, 'utf-8');
    assert.equal(field(content, 'published_at'), '2026-11-03T23:01:02.000Z');
    assert.equal(field(content, 'updated_at'), '2026-11-03T23:05:00.000Z');
    const repeated = await updateLoterias(options(f.root, corrected, '2026-11-03T23:15:00.000Z'));
    assert.equal(repeated.changes, 0);
    assert.equal(fs.readFileSync(fp, 'utf-8'), content, 'a fresh check alone cannot rejuvenate the article');
  } finally { f.cleanup(); }
});

test('does not invent original publication timestamps for published legacy content', async () => {
  const f = fixture({ 'concurso-3058.mdx': 'status: publicado\ndraw_date: "2026-11-03"\n' });
  try {
    await updateLoterias(options(f.root, official()));
    const content = fs.readFileSync(path.join(f.dir, 'concurso-3058.mdx'), 'utf-8');
    assert.equal(field(content, 'published_at'), undefined);
    assert.equal(field(content, 'updated_at'), '2026-11-03T23:01:02.000Z');
  } finally { f.cleanup(); }
});

test('reports source failures and preserves files instead of claiming a successful publication', async () => {
  const future = 'status: aguardando\nschedule_status: unconfirmed\ndraw_date: "2026-12-01"\n';
  const f = fixture({
    'concurso-3058.mdx': 'status: aguardando\ndraw_date: "2026-11-03"\n',
    'concurso-3060.mdx': future,
  });
  try {
    const opts = options(f.root, null);
    opts.fetchImpl = async () => new Response('', { status: 500 });
    const result = await updateLoterias(opts);
    assert.equal(result.changes, 0);
    assert.equal(result.errors.length, 1);
    assert.match(result.errors[0], /HTTP 500/);
    assert.match(fs.readFileSync(path.join(f.dir, 'concurso-3058.mdx'), 'utf-8'), /status: aguardando/);
    assert.equal(fs.readFileSync(path.join(f.dir, 'concurso-3060.mdx'), 'utf-8'), future);
  } finally { f.cleanup(); }
});

test('confirms only the next official schedule and preserves other future contest pages', async () => {
  const otherFuture = 'status: aguardando\nschedule_status: unconfirmed\ndraw_date: "2026-12-31"\n';
  const f = fixture({
    'concurso-3058.mdx': 'status: publicado\ndraw_date: "2026-11-03"\n',
    'concurso-3059.mdx': 'status: aguardando\nschedule_status: unconfirmed\ndraw_date: "2026-12-24"\npremio_principal: 999999999\n',
    'concurso-3060.mdx': otherFuture,
  });
  try {
    const data = official({ numeroConcursoProximo: 3059, dataProximoConcurso: '04/11/2026', valorEstimadoProximoConcurso: 1000000 });
    const result = await updateLoterias(options(f.root, data));
    assert.deepEqual(result.errors, []);
    const next = fs.readFileSync(path.join(f.dir, 'concurso-3059.mdx'), 'utf-8');
    assert.equal(field(next, 'status'), 'aguardando');
    assert.equal(field(next, 'schedule_status'), 'confirmed');
    assert.equal(field(next, 'draw_date'), '2026-11-04');
    assert.equal(field(next, 'premio_principal'), 1000000);
    assert.equal(field(next, 'source_url'), 'https://servicebus3.caixa.gov.br/portaldeloterias/api/megasena/3058');
    assert.equal(fs.readFileSync(path.join(f.dir, 'concurso-3060.mdx'), 'utf-8'), otherFuture);
  } finally { f.cleanup(); }
});

test('keeps a failed older result reachable for retry after a newer result has published', async () => {
  const f = fixture({
    'concurso-3057.mdx': 'status: publicado\n',
    'concurso-3058.mdx': 'status: aguardando\n',
  });
  try {
    const latest = official({ numero: 3059 });
    const opts = options(f.root, latest);
    opts.fetchImpl = async url => url.endsWith('/3058')
      ? new Response('', { status: 500 })
      : new Response(JSON.stringify(latest), { status: 200 });
    const failed = await updateLoterias(opts);
    assert.equal(failed.errors.length, 1);
    assert.match(fs.readFileSync(path.join(f.dir, 'concurso-3058.mdx'), 'utf-8'), /status: aguardando/);
    opts.fetchImpl = async url => new Response(JSON.stringify(url.endsWith('/3058') ? official() : latest), { status: 200 });
    const recovered = await updateLoterias(opts);
    assert.deepEqual(recovered.errors, []);
    assert.match(fs.readFileSync(path.join(f.dir, 'concurso-3058.mdx'), 'utf-8'), /status: publicado/);
  } finally { f.cleanup(); }
});

test('keeps the second Dupla Sena drawing separate without unrelated month or team fields', async () => {
  const f = fixture({}, 'dupla-sena');
  try {
    const data = official({
      listaDezenasSegundoSorteio: ['11', '12', '13', '14', '15', '16'],
      nomeMesSorte: 'NOVEMBRO',
      nomeTimeCoracaoMesSorte: 'TIME INFORMADO PELA FONTE',
    });
    await updateLoterias(options(f.root, data));
    const content = fs.readFileSync(path.join(f.dir, 'concurso-3058.mdx'), 'utf-8');
    assert.equal(field(content, 'numeros').length, 6);
    assert.deepEqual(field(content, 'numeros_segundo_sorteio'), ['11', '12', '13', '14', '15', '16']);
    assert.equal(field(content, 'mes_sorte'), undefined);
    assert.equal(field(content, 'time_coracao'), undefined);
  } finally { f.cleanup(); }
});

test('ignores shared NUL placeholders on Mega-Sena and sanitizes official text', async () => {
  const f = fixture();
  try {
    await updateLoterias(options(f.root, official({
      nomeMesSorte: '\u0000\u0000',
      nomeTimeCoracaoMesSorte: '\u0000\u0000\u0000',
      listaDezenasSegundoSorteio: ['11', '12', '13', '14', '15', '16'],
      listaRateioPremio: [{ faixa: 1, descricaoFaixa: '\u00006\tacertos\u007f', numeroDeGanhadores: 1, valorPremio: 123.45 }],
      listaMunicipioUFGanhadores: [{ municipio: '\u0000São\nPaulo\u0085', uf: '\u0000SP', ganhadores: 1 }],
    })));
    const content = fs.readFileSync(path.join(f.dir, 'concurso-3058.mdx'), 'utf-8');
    assert.equal(field(content, 'time_coracao'), undefined);
    assert.equal(field(content, 'mes_sorte'), undefined);
    assert.equal(field(content, 'numeros_segundo_sorteio'), undefined);
    assert.equal(field(content, 'rateio')[0].descricao, '6 acertos');
    assert.deepEqual(field(content, 'municipios_ganhadores'), [{ municipio: 'São Paulo', uf: 'SP', ganhadores: 1 }]);
    assert.doesNotMatch(content, /\\u0000|\\u007f|\\u0085|\u0000|\u007f|\u0085/);
  } finally { f.cleanup(); }
});

test('maps the shared Dia de Sorte field to month instead of team', async () => {
  const f = fixture({}, 'diadesorte');
  try {
    await updateLoterias(options(f.root, official({ nomeMesSorte: '\u0000', nomeTimeCoracaoMesSorte: '\u0000Novembro\u0000' })));
    const content = fs.readFileSync(path.join(f.dir, 'concurso-3058.mdx'), 'utf-8');
    assert.equal(field(content, 'mes_sorte'), 'Novembro');
    assert.equal(field(content, 'time_coracao'), undefined);
  } finally { f.cleanup(); }
});

test('stores a cleaned team only for Timemania', async () => {
  const f = fixture({}, 'timemania');
  try {
    await updateLoterias(options(f.root, official({ nomeMesSorte: 'Novembro', nomeTimeCoracaoMesSorte: '\u0000Corinthians\u0000' })));
    const content = fs.readFileSync(path.join(f.dir, 'concurso-3058.mdx'), 'utf-8');
    assert.equal(field(content, 'time_coracao'), 'Corinthians');
    assert.equal(field(content, 'mes_sorte'), undefined);
  } finally { f.cleanup(); }
});

test('does not infer zero winners while official prize information is unavailable', async () => {
  const f = fixture();
  try {
    await updateLoterias(options(f.root, official({ acumulado: undefined, listaRateioPremio: [], listaMunicipioUFGanhadores: [] })));
    const content = fs.readFileSync(path.join(f.dir, 'concurso-3058.mdx'), 'utf-8');
    assert.equal(field(content, 'acumulou'), undefined);
    assert.match(content, /Referência para conferência/);
    assert.doesNotMatch(content, /Não houve apostas ganhadoras/);
  } finally { f.cleanup(); }
});

test('refreshes only selected existing published archives and preserves their original publication metadata', async () => {
  const originalPublication = '2026-01-02T23:00:00.000Z';
  const files = {
    'concurso-2799.mdx': 'status: draft\n',
    'concurso-2800.mdx': `status: publicado\ndraw_date: "2026-01-02"\npublished_at: "${originalPublication}"\n`,
    'concurso-2801.mdx': 'status: publicado\ndraw_date: "2026-01-02"\n',
    'concurso-2802.mdx': 'status: publicado\ndraw_date: "2026-01-02"\n',
    'concurso-3201.mdx': 'status: aguardando\nschedule_status: unconfirmed\n',
  };
  // Keep the normal recovery window complete so only explicit archive
  // requests, plus the latest result, are candidates for this regression.
  for (let numero = 3081; numero <= 3200; numero++) files[`concurso-${numero}.mdx`] = 'status: publicado\n';
  const f = fixture(files);
  try {
    const requested = [];
    const opts = options(f.root, official({ numero: 3200 }));
    opts.refresh = { 'mega-sena': [2800, 2802, 0, -1, 2800.5, '2801', NaN, Infinity, 3201, 2798, 2799] };
    opts.fetchImpl = async url => {
      requested.push(url);
      if (url.endsWith('/2800')) return new Response(JSON.stringify(official({ numero: 2800, dataApuracao: '02/01/2026' })), { status: 200 });
      if (url.endsWith('/2802')) return new Response(JSON.stringify(official({ numero: 2802, dataApuracao: '02/01/2026' })), { status: 200 });
      assert.equal(url, 'https://servicebus3.caixa.gov.br/portaldeloterias/api/megasena');
      return new Response(JSON.stringify(official({ numero: 3200 })), { status: 200 });
    };
    const result = await updateLoterias(opts);
    assert.deepEqual(result.errors, []);
    assert.deepEqual(requested, [
      'https://servicebus3.caixa.gov.br/portaldeloterias/api/megasena',
      'https://servicebus3.caixa.gov.br/portaldeloterias/api/megasena/2800',
      'https://servicebus3.caixa.gov.br/portaldeloterias/api/megasena/2802',
    ]);
    const archive = fs.readFileSync(path.join(f.dir, 'concurso-2800.mdx'), 'utf-8');
    assert.equal(field(archive, 'published_at'), originalPublication);
    assert.equal(field(archive, 'updated_at'), '2026-11-03T23:01:02.000Z');
    assert.equal(field(archive, 'rateio')[0].ganhadores, 2);
    assert.equal(field(fs.readFileSync(path.join(f.dir, 'concurso-2802.mdx'), 'utf-8'), 'published_at'), undefined);
    assert.equal(fs.readFileSync(path.join(f.dir, 'concurso-2801.mdx'), 'utf-8'), files['concurso-2801.mdx']);
    assert.equal(fs.readFileSync(path.join(f.dir, 'concurso-2799.mdx'), 'utf-8'), files['concurso-2799.mdx']);
    assert.equal(fs.existsSync(path.join(f.dir, 'concurso-2798.mdx')), false);
    assert.equal(fs.readFileSync(path.join(f.dir, 'concurso-3201.mdx'), 'utf-8'), files['concurso-3201.mdx']);

    opts.now = '2026-11-03T23:15:00.000Z';
    const repeated = await updateLoterias(opts);
    assert.equal(repeated.changes, 0);
    assert.equal(fs.readFileSync(path.join(f.dir, 'concurso-2800.mdx'), 'utf-8'), archive);
  } finally { f.cleanup(); }
});

function stockSource(api, numero = 1000) {
  const extras = {
    federal: {
      listaDezenas: ['056338', '001871', '024389', '062267', '030022'],
      dataProximoConcurso: '',
      listaRateioPremio: Array.from({ length: 5 }, (_, index) => ({ faixa: index + 1, descricaoFaixa: `${index + 1}º prêmio`, numeroDeGanhadores: 1, valorPremio: 100000 / (index + 1) })),
    },
    maismilionaria: { trevosSorteados: [1, 6] },
    supersete: { tipoJogo: 'SUPER_7', listaDezenas: ['1', '9', '2', '9', '4', '6', '5'] },
  };
  return official({ numero, numeroConcursoProximo: numero + 1, dataProximoConcurso: '04/11/2026', valorEstimadoProximoConcurso: 100000, ...extras[api] });
}

test('creates all ten modality directories and maintains the 600-page future inventory without deleting URLs', async () => {
  const f = fixture();
  try {
    assert.equal(Object.values(FUTURE_STOCK).reduce((sum, value) => sum + value, 0), 600);
    const opts = options(f.root, null);
    delete opts.onlyLoterias;
    let quinaLatest = 1000;
    opts.fetchImpl = async url => {
      const api = new URL(url).pathname.split('/api/')[1];
      assert.ok(api && !api.includes('/'), 'only one latest query per modality is needed');
      return new Response(JSON.stringify(stockSource(api, api === 'quina' ? quinaLatest : 1000)), { status: 200 });
    };
    const first = await updateLoterias(opts);
    assert.deepEqual(first.errors, []);
    assert.equal(first.futureCreated, 600);
    const contentDir = path.join(f.root, 'content', 'loterias');
    for (const [game, target] of Object.entries(FUTURE_STOCK)) {
      const dir = path.join(contentDir, game);
      assert.equal(fs.readdirSync(dir).length, target + 1, game);
      for (let number = 1001; number <= 1000 + target; number++) {
        const content = fs.readFileSync(path.join(dir, `concurso-${number}.mdx`), 'utf-8');
        assert.equal(field(content, 'status'), 'aguardando');
        if (number === 1001 && game !== 'federal') {
          assert.equal(field(content, 'schedule_status'), 'confirmed');
          assert.equal(field(content, 'draw_date'), '2026-11-04');
        } else {
          assert.equal(field(content, 'schedule_status'), 'unconfirmed');
          assert.equal(field(content, 'draw_date'), undefined);
          assert.equal(field(content, 'date'), undefined);
          assert.equal(field(content, 'premio_principal'), 0);
          assert.doesNotMatch(content, /\b\d{2}\/\d{2}\/20\d{2}\b|R\$|ao vivo|\b\d{1,2}h\b/i);
        }
      }
    }
    const federal = fs.readFileSync(path.join(contentDir, 'federal', 'concurso-1000.mdx'), 'utf-8');
    assert.deepEqual(field(federal, 'numeros'), ['056338', '001871', '024389', '062267', '030022']);
    assert.equal(field(federal, 'rateio').length, 5);
    const superSete = fs.readFileSync(path.join(contentDir, 'super-sete', 'concurso-1000.mdx'), 'utf-8');
    assert.deepEqual(field(superSete, 'numeros'), ['1', '9', '2', '9', '4', '6', '5']);
    const milionaria = fs.readFileSync(path.join(contentDir, 'maismilionaria', 'concurso-1000.mdx'), 'utf-8');
    assert.deepEqual(field(milionaria, 'trevos_sorteados'), ['1', '6']);
    assert.equal(normalizeLotteryContent({ root: f.root }).changes, 0, 'the live generator and editorial normalizer use the same stable templates');

    const outside = path.join(contentDir, 'mega-sena', 'concurso-9000.mdx');
    fs.writeFileSync(outside, 'status: aguardando\nschedule_status: unconfirmed\n');
    opts.now = '2026-11-03T23:15:00.000Z';
    const repeated = await updateLoterias(opts);
    assert.equal(repeated.changes, 0);
    assert.equal(fs.readFileSync(outside, 'utf-8'), 'status: aguardando\nschedule_status: unconfirmed\n');

    quinaLatest = 1001;
    const advanced = await updateLoterias(opts);
    assert.deepEqual(advanced.errors, []);
    assert.equal(advanced.futureCreated, 1);
    const quinaDir = path.join(contentDir, 'quina');
    assert.equal(field(fs.readFileSync(path.join(quinaDir, 'concurso-1001.mdx'), 'utf-8'), 'status'), 'publicado');
    assert.equal(field(fs.readFileSync(path.join(quinaDir, 'concurso-1121.mdx'), 'utf-8'), 'status'), 'aguardando');
    assert.equal(fs.readdirSync(quinaDir).filter(file => field(fs.readFileSync(path.join(quinaDir, file), 'utf-8'), 'status') === 'aguardando').length, 120);
  } finally { f.cleanup(); }
});

test('rejects an invalid Super Sete payload without inventing its result or future numbering', async () => {
  const f = fixture({}, 'super-sete');
  try {
    const result = await updateLoterias(options(f.root, official({ numero: 917, tipoJogo: 'MEGA_SENA', listaDezenas: ['1', '9', '2', '9', '4', '6', '5'] })));
    assert.equal(result.errors.length, 1);
    assert.equal(fs.readdirSync(f.dir).length, 0);
  } finally { f.cleanup(); }
});

test('uses the official alternate API when the primary source fails and records the responding source', async () => {
  const f = fixture();
  try {
    const opts = options(f.root, null);
    const calls = [];
    opts.fetchImpl = async url => {
      calls.push(url);
      return url.includes('servicebus3') ? new Response('', { status: 500 }) : new Response(JSON.stringify(official()), { status: 200 });
    };
    const result = await updateLoterias(opts);
    assert.deepEqual(result.errors, []);
    assert.equal(calls.filter(url => url.includes('servicebus3')).length, 3);
    assert.equal(field(fs.readFileSync(path.join(f.dir, 'concurso-3058.mdx'), 'utf-8'), 'source_url'), 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/3058');
  } finally { f.cleanup(); }
});

test('normalizes legacy editorial text while preserving every factual frontmatter field', () => {
  const factual = `loteria: mega-sena\nconcurso: 3058\nstatus: publicado\ndraw_date: "2026-01-02"\nnumeros: ["01","02","03","04","05","06"]\npremio_principal: 12345.67\nganhadores: 2\nrateio: [{"faixa":1,"descricao":"6 acertos","ganhadores":2,"premio":12345.67}]\npublished_at: "2026-01-02T23:00:00.000Z"\nupdated_at: "2026-01-03T00:00:00.000Z"\nsource_checked_at: "2026-01-03T00:00:00.000Z"\nsource_url: "https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/3058"\ncustom_attribute: "preserve me"`;
  const pendingFacts = 'loteria: mega-sena\nconcurso: 3059\nstatus: aguardando\nschedule_status: unconfirmed\ndraw_date: "2026-12-31"\npremio_principal: 999999999\nnumeros: []';
  const f = fixture({
    'concurso-3058.mdx': `---\ntitle: "Título longo com resultado HOJE"\ndescription: "Descrição antiga"\n${factual}\nkeywords: "resultado hoje"\n---\n\nO próximo sorteio acontece amanhã.`,
    'concurso-3059.mdx': `---\ntitle: "Sorteio em dezembro"\ndescription: "Prêmio estimado antigo"\n${pendingFacts}\nkeywords: "resultado hoje"\n---\n\nSorteio hoje às 20h.`,
  });
  try {
    const migrated = normalizeLotteryContent({ root: f.root });
    assert.deepEqual(migrated.errors, []);
    assert.equal(migrated.changes, 2);
    assert.equal(migrated.factualRecordsVerified, 2);
    for (const [file, facts] of [['concurso-3058.mdx', factual], ['concurso-3059.mdx', pendingFacts]]) {
      const content = fs.readFileSync(path.join(f.dir, file), 'utf-8');
      const metadata = content.match(/^---\n([\s\S]*?)\n---/)?.[1];
      assert.equal(metadata.split('\n').filter(line => !/^(title|description|keywords):/.test(line)).join('\n'), facts);
      assert.doesNotMatch(content, /resultado hoje|próximo sorteio acontece|20h/i);
      if (file === 'concurso-3058.mdx') assert.equal(field(content, 'title'), 'Resultado Mega-Sena concurso 3058 — 02/01/2026');
      else assert.doesNotMatch(content.split('\n---\n')[1], /31\/12\/2026|999999999|R\$/);
    }
    assert.equal(normalizeLotteryContent({ root: f.root }).changes, 0);
  } finally { f.cleanup(); }
});
