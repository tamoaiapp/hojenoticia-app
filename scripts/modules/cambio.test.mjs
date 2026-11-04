import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { updateCambio } from './cambio.mjs';

const now = new Date('2026-11-04T12:00:00Z');
const today = '2026-11-04';
const pairs = ['USD', 'EUR', 'GBP', 'ARS', 'BTC', 'ETH'];
const stamp = now.getTime() / 1000 - 60;
const quotes = () => Object.fromEntries(pairs.map(code => [`${code}BRL`, {
  code, codein: 'BRL', name: `${code}/Real Brasileiro`, bid: '5', ask: '5.1',
  high: '5.5', low: '4.5', varBid: '0.1', pctChange: '2',
  timestamp: String(stamp), create_date: '2026-11-04 08:59:00',
}]));
const history = () => [{ bid: '4.9', timestamp: String(stamp - 86400) }];
const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers });

function setup(t) {
  const tempDir = path.resolve(os.tmpdir());
  const root = fs.mkdtempSync(path.join(tempDir, 'hoje-cambio-test-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), tempDir);
    assert.ok(path.basename(root).startsWith('hoje-cambio-test-'));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const dir = path.join(root, 'content', 'cambio');
  const latest = path.join(dir, 'latest.json');
  const daily = path.join(dir, `${today}.json`);
  const waits = [];
  const calls = [];
  const options = { root, today, now, apiKey: '', wait: async ms => { waits.push(ms); } };
  const fetcher = handler => async (url, options) => {
    calls.push({ url, options });
    return handler(url, options, calls.length);
  };
  const read = () => JSON.parse(fs.readFileSync(latest, 'utf8'));
  async function seed() {
    await updateCambio({ ...options, fetchImpl: async url => json(url.includes('/last/') ? quotes() : history()) });
    const snapshot = read();
    snapshot.updated_at = '2026-11-03T12:00:00.000Z';
    snapshot.date = '2026-11-03';
    // Emula também o checkout Windows com CRLF. A igualdade deve ser semântica.
    fs.writeFileSync(latest, JSON.stringify(snapshot, null, 2).replace(/\n/g, '\r\n'));
    return snapshot;
  }
  return { root, dir, latest, daily, waits, calls, options, fetcher, read, seed };
}

test('429 temporário respeita Retry-After e envia chave só no cabeçalho', async t => {
  const s = setup(t);
  const result = await updateCambio({ ...s.options, apiKey: 'synthetic-test-key', fetchImpl: s.fetcher((url, _, count) => {
    if (count === 1) return json({}, 429, { 'Retry-After': '2' });
    return json(url.includes('/last/') ? quotes() : history());
  }) });
  assert.equal(result.changes, 2);
  assert.deepEqual(s.waits, [2000]);
  assert.equal(Object.keys(s.read().pares).length, 6);
  assert.ok(s.calls.every(c => c.options.headers['x-api-key'] === 'synthetic-test-key'));
  assert.ok(s.calls.every(c => !c.url.includes('synthetic-test-key')));
  assert.ok(!fs.readFileSync(s.latest, 'utf8').includes('synthetic-test-key'));
});

test('falha de rede e 503 usam novas tentativas limitadas', async t => {
  const s = setup(t);
  await updateCambio({ ...s.options, fetchImpl: s.fetcher((url, _, count) => {
    if (count === 1) throw new Error('network unavailable');
    if (count === 2) return json({}, 503);
    return json(url.includes('/last/') ? quotes() : history());
  }) });
  assert.deepEqual(s.waits, [1000, 2000]);
  assert.equal(s.calls.length, 6);
});

test('429 persistente preserva os bytes do cache e do snapshot, e continua sendo falha', async t => {
  const s = setup(t);
  await s.seed();
  const latest = fs.readFileSync(s.latest);
  const daily = fs.readFileSync(s.daily);
  await assert.rejects(updateCambio({ ...s.options, fetchImpl: s.fetcher(() => json({}, 429)) }), /HTTP 429/);
  assert.equal(s.calls.length, 3);
  assert.deepEqual(s.waits, [5000, 10000]);
  assert.deepEqual(fs.readFileSync(s.latest), latest);
  assert.deepEqual(fs.readFileSync(s.daily), daily);
  assert.equal(s.read().date, '2026-11-03');
  assert.ok(s.calls.every(c => c.url.includes('/last/')));
});

test('429 sem cache não cria cotação ou snapshot fictício', async t => {
  const s = setup(t);
  await assert.rejects(updateCambio({ ...s.options, fetchImpl: s.fetcher(() => json({}, 429)) }), /HTTP 429/);
  assert.equal(fs.existsSync(s.dir), false);
});

test('Retry-After em data HTTP acima do orçamento não provoca tentativa antecipada', async t => {
  const s = setup(t);
  await assert.rejects(updateCambio({ ...s.options, fetchImpl: s.fetcher(() => json({}, 429, {
    'Retry-After': new Date(now.getTime() + 60000).toUTCString(),
  })) }), /Retry-After excede/);
  assert.equal(s.calls.length, 1);
  assert.deepEqual(s.waits, []);
});

test('Retry-After em data HTTP dentro do orçamento é respeitado', async t => {
  const s = setup(t);
  await updateCambio({ ...s.options, fetchImpl: s.fetcher((url, _, count) => count === 1
    ? json({}, 429, { 'Retry-After': new Date(now.getTime() + 7000).toUTCString() })
    : json(url.includes('/last/') ? quotes() : history())) });
  assert.deepEqual(s.waits, [7000]);
});

test('resposta idêntica preserva bytes CRLF e horários, sem refazer históricos', async t => {
  const s = setup(t);
  await s.seed();
  const before = fs.readFileSync(s.latest);
  const result = await updateCambio({ ...s.options, fetchImpl: s.fetcher(() => json(quotes())) });
  assert.equal(result.changes, 0);
  assert.equal(s.calls.length, 1);
  assert.deepEqual(fs.readFileSync(s.latest), before);
});

test('erro de rede depois de Retry-After não ultrapassa o orçamento de espera', async t => {
  const s = setup(t);
  await assert.rejects(updateCambio({ ...s.options, fetchImpl: s.fetcher((_, __, count) => {
    if (count === 1) return json({}, 429, { 'Retry-After': '30' });
    throw new Error('network unavailable');
  }) }), /limite de espera/);
  assert.equal(s.calls.length, 2);
  assert.deepEqual(s.waits, [30000]);
});

for (const [name, corrupt] of [
  ['par ausente', data => { delete data.ETHBRL; }],
  ['número inválido', data => { data.USDBRL.bid = 'NaN'; }],
  ['array no lugar do número', data => { data.USDBRL.bid = [5]; }],
  ['preço vazio', data => { data.USDBRL.bid = ''; }],
  ['data impossível', data => { data.USDBRL.create_date = '2026-02-31 10:00:00'; }],
  ['horário futuro', data => { data.USDBRL.timestamp = String(stamp + 3600); }],
  ['faixa invertida', data => { data.USDBRL.high = '1'; }],
]) {
  test(`payload com ${name} não sobrescreve dados válidos`, async t => {
    const s = setup(t);
    await s.seed();
    const before = fs.readFileSync(s.latest);
    const data = quotes();
    corrupt(data);
    await assert.rejects(updateCambio({ ...s.options, fetchImpl: s.fetcher(() => json(data)) }));
    assert.deepEqual(fs.readFileSync(s.latest), before);
    assert.equal(s.calls.length, 1);
  });
}

test('fonte que recua no tempo é rejeitada sem escrita parcial', async t => {
  const s = setup(t);
  await s.seed();
  const data = quotes();
  data.USDBRL.timestamp = String(stamp - 86400);
  const before = fs.readFileSync(s.latest);
  await assert.rejects(updateCambio({ ...s.options, fetchImpl: s.fetcher(() => json(data)) }), /anterior/);
  assert.deepEqual(fs.readFileSync(s.latest), before);
});

test('histórico com 429 mantém as séries anteriores e suspende chamadas restantes', async t => {
  const s = setup(t);
  const previous = await s.seed();
  const data = quotes();
  data.USDBRL.bid = '5.01';
  const result = await updateCambio({ ...s.options, fetchImpl: s.fetcher(url => url.includes('/last/') ? json(data) : json({}, 429)) });
  assert.equal(result.changes, 2);
  assert.equal(result.warnings.length, 3);
  assert.equal(s.calls.length, 4);
  assert.deepEqual(s.read().historico, previous.historico);
  assert.equal(s.read().pares['USD-BRL'].bid, 5.01);
});

test('timestamp futuro em cache corrompido pode ser reparado pela fonte válida', async t => {
  const s = setup(t);
  const broken = await s.seed();
  broken.pares['USD-BRL'].timestamp = stamp + 86400;
  fs.writeFileSync(s.latest, JSON.stringify(broken));
  await updateCambio({ ...s.options, fetchImpl: async url => json(url.includes('/last/') ? quotes() : history()) });
  assert.equal(s.read().pares['USD-BRL'].timestamp, stamp);
});

test('histórico usa dia de Brasília, ordena e remove duplicatas iguais', async t => {
  const s = setup(t);
  const midnight = Date.parse('2026-11-04T01:00:00Z') / 1000;
  const data = [{ bid: '5', timestamp: String(midnight) }, { bid: '4', timestamp: String(midnight - 86400) }, { bid: '5', timestamp: String(midnight) }];
  await updateCambio({ ...s.options, fetchImpl: async url => json(url.includes('/last/') ? quotes() : data) });
  assert.deepEqual(s.read().historico['USD-BRL'].map(row => row.date), ['2026-11-03', '2026-11-02']);
});

test('erro 401 não é repetido e não vaza a chave', async t => {
  const s = setup(t);
  await assert.rejects(updateCambio({ ...s.options, apiKey: 'synthetic-test-key', fetchImpl: s.fetcher(() => json({}, 401)) }), error => {
    assert.ok(!error.message.includes('synthetic-test-key'));
    return /HTTP 401/.test(error.message);
  });
  assert.equal(s.calls.length, 1);
  assert.deepEqual(s.waits, []);
});
