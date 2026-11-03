import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { updateLoterias } from './loterias.mjs';

test('recovers a result whose local forecast date is still in the future', async () => {
  const root = fs.mkdtempSync(path.join(os.tmpdir(), 'hojenoticia-loterias-'));
  const dir = path.join(root, 'content', 'loterias', 'mega-sena');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'concurso-3057.mdx'), 'status: publicado\n');
  fs.writeFileSync(path.join(dir, 'concurso-3058.mdx'), 'status: aguardando\ndraw_date: "2026-11-04"\n');
  fs.writeFileSync(path.join(dir, 'concurso-3059.mdx'), 'status: aguardando\ndraw_date: "2026-11-07"\n');

  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (url) => {
    assert.equal(url, 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena');
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
    const result = await updateLoterias({ root, today: '2026-11-03' });
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
    assert.equal(field(content, 'source_url'), 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/3058');
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
    assert.equal(field(next, 'source_url'), 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/3058');
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
    assert.match(content, /premiação por faixa permanece em confirmação/);
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
      assert.equal(url, 'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena');
      return new Response(JSON.stringify(official({ numero: 3200 })), { status: 200 });
    };
    const result = await updateLoterias(opts);
    assert.deepEqual(result.errors, []);
    assert.deepEqual(requested, [
      'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena',
      'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/2800',
      'https://servicebus2.caixa.gov.br/portaldeloterias/api/megasena/2802',
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
