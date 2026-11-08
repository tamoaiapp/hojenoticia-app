import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { updateCambio } from './cambio.mjs';

const now = new Date('2026-11-08T12:00:00Z');
const today = '2026-11-08';
const codes = ['USD', 'EUR', 'GBP', 'ARS', 'BTC', 'ETH'];
const json = (data, status = 200) => new Response(JSON.stringify(data), { status });
const seconds = value => Date.parse(value) / 1000;
function alternative() {
  return { pares: Object.fromEntries(codes.map(code => {
    const fiat = !['BTC', 'ETH'].includes(code);
    return [`${code}-BRL`, {
      code: `${code}-BRL`, from: code, to: 'BRL', name: `${code}/Real Brasileiro`,
      bid: 5, ask: 5.01, high: fiat ? null : 5.5, low: fiat ? null : 4.5,
      varBid: null, pctChange: null,
      timestamp: seconds(fiat ? '2026-11-06T03:00:00Z' : '2026-11-08T11:59:00Z'),
      create_date: fiat ? '2026-11-06' : '2026-11-08 11:59:00',
      source: fiat ? 'bcb-ptax' : 'binance', timestamp_precision: fiat ? 'day' : 'second',
    }];
  })), historico: {}, warnings: [] };
}
function primary() {
  return Object.fromEntries(codes.map(code => [`${code}BRL`, {
    code, codein: 'BRL', name: `${code}/Real Brasileiro`, bid: '5', ask: '5.01',
    high: '5.5', low: '4.5', varBid: '0.1', pctChange: '2',
    timestamp: String(seconds('2026-11-08T11:59:00Z')), create_date: '2026-11-08 08:59:00',
  }]));
}
function setup(t) {
  const base = path.resolve(os.tmpdir());
  const root = fs.mkdtempSync(path.join(base, 'hoje-cambio-recovery-'));
  t.after(() => {
    assert.equal(path.dirname(root), base);
    assert.ok(path.basename(root).startsWith('hoje-cambio-recovery-'));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const dir = path.join(root, 'content', 'cambio');
  const latest = path.join(dir, 'latest.json');
  const daily = path.join(dir, `${today}.json`);
  const options = { root, now, today, apiKey: '', wait: async () => {}, fetchImpl: async () => json({}, 429) };
  const seed = value => {
    fs.mkdirSync(dir, { recursive: true });
    const bytes = JSON.stringify({ updated_at: '2026-11-08T10:00:00.000Z', date: today, ...value }, null, 2).replace(/\n/g, '\r\n');
    fs.writeFileSync(latest, bytes);
    fs.writeFileSync(daily, bytes);
  };
  return { root, latest, daily, dir, options, seed, read: () => JSON.parse(fs.readFileSync(latest, 'utf8')) };
}

test('429 persistente recupera os seis pares sem chave e sem misturar os históricos', async t => {
  const s = setup(t);
  s.seed({ pares: {}, historico: { 'USD-BRL': [{ bid: 4, timestamp: seconds('2026-11-04T12:00:00Z'), date: '2026-11-04' }] } });
  const result = await updateCambio({ ...s.options, apiKey: 'synthetic-primary-only', fallbackImpl: async options => {
    assert.equal('apiKey' in options, false);
    return alternative();
  } });
  assert.equal(result.changes, 2);
  assert.match(result.warnings[0], /429/);
  assert.equal(Object.keys(s.read().pares).length, 6);
  assert.equal(s.read().pares['USD-BRL'].high, null);
  assert.equal(s.read().pares['USD-BRL'].source, 'bcb-ptax');
  assert.deepEqual(s.read().historico, {});
  assert.ok(!fs.readFileSync(s.latest, 'utf8').includes('synthetic-primary-only'));
});

test('falha em todas as fontes permanece erro e preserva os bytes dos dois arquivos', async t => {
  const s = setup(t);
  s.seed(alternative());
  const before = fs.readFileSync(s.latest);
  await assert.rejects(updateCambio({ ...s.options, fallbackImpl: async () => { throw new Error('Binance HTTP 503'); } }), /429.*503.*preservados/);
  assert.deepEqual(fs.readFileSync(s.latest), before);
  assert.deepEqual(fs.readFileSync(s.daily), before);
});

test('fonte alternativa repetida não altera horários nem bytes CRLF', async t => {
  const s = setup(t);
  const { pares, historico } = alternative();
  s.seed({ pares, historico });
  const before = fs.readFileSync(s.latest);
  const result = await updateCambio({ ...s.options, fallbackImpl: async () => alternative() });
  assert.equal(result.changes, 0);
  assert.deepEqual(fs.readFileSync(s.latest), before);
  assert.deepEqual(fs.readFileSync(s.daily), before);
});

test('PTAX diária aceita a mesma data de uma referência intradiária sem inventar um horário', async t => {
  const s = setup(t);
  const previous = alternative();
  previous.pares['USD-BRL'].timestamp = seconds('2026-11-06T20:00:00Z');
  delete previous.pares['USD-BRL'].source;
  s.seed(previous);
  await updateCambio({ ...s.options, fallbackImpl: async () => alternative() });
  assert.equal(s.read().pares['USD-BRL'].timestamp_precision, 'day');
  assert.equal(s.read().pares['USD-BRL'].timestamp, seconds('2026-11-06T03:00:00Z'));
});

test('nenhuma fonte alternativa pode substituir uma data mais nova por outra anterior', async t => {
  const s = setup(t);
  const previous = alternative();
  previous.pares['USD-BRL'].timestamp = seconds('2026-11-07T20:00:00Z');
  delete previous.pares['USD-BRL'].source;
  s.seed(previous);
  const before = fs.readFileSync(s.latest);
  await assert.rejects(updateCambio({ ...s.options, fallbackImpl: async () => alternative() }), /anterior.*USD-BRL/);
  assert.deepEqual(fs.readFileSync(s.latest), before);
});

test('par alternativo ausente impede qualquer escrita parcial', async t => {
  const s = setup(t);
  await assert.rejects(updateCambio({ ...s.options, fallbackImpl: async () => {
    const value = alternative();
    delete value.pares['ETH-BRL'];
    return value;
  } }), /ausente.*ETH-BRL/);
  assert.equal(fs.existsSync(s.dir), false);
});

test('fonte primária saudável não consulta alternativas e descarta histórico de outra metodologia', async t => {
  const s = setup(t);
  const previous = alternative();
  previous.historico['USD-BRL'] = [{ bid: 4, timestamp: seconds('2026-11-06T03:00:00Z'), date: '2026-11-06' }];
  s.seed(previous);
  let fallbackCalls = 0;
  const result = await updateCambio({ ...s.options,
    fetchImpl: async url => url.includes('/last/') ? json(primary()) : json({}, 503),
    fallbackImpl: async () => { fallbackCalls++; return alternative(); },
  });
  assert.equal(fallbackCalls, 0);
  assert.equal(result.changes, 2);
  assert.deepEqual(s.read().historico['USD-BRL'], []);
});

test('data inválida é rejeitada antes de consultar qualquer fonte', async t => {
  const s = setup(t);
  await assert.rejects(updateCambio({ ...s.options, today: '2026-02-30',
    fetchImpl: async () => assert.fail('não consultar fonte primária'),
    fallbackImpl: async () => assert.fail('não consultar fonte alternativa'),
  }), /Data de coleta inválida/);
  assert.equal(fs.existsSync(s.dir), false);
});

test('recuperação padrão atravessa os adaptadores reais e mantém a chave só na fonte primária', async t => {
  const s = setup(t);
  const calls = [];
  const result = await updateCambio({ ...s.options, apiKey: 'synthetic-primary-only', fetchImpl: async (input, options) => {
    const url = new URL(input);
    calls.push(url.hostname);
    if (url.hostname === 'economia.awesomeapi.com.br') {
      assert.equal(options.headers['x-api-key'], 'synthetic-primary-only');
      return json({}, 429);
    }
    assert.equal(options.headers['x-api-key'], undefined);
    if (url.hostname === 'www4.bcb.gov.br') {
      if (!url.pathname.endsWith('/20261106.csv')) return new Response('', { status: 404 });
      return new Response(codes.slice(0, 4).map((code, index) =>
        `06/11/2026;${220 + index};A;${code};5,00000000;5,01000000;1,00000000;1,00000000`).join('\r\n'));
    }
    assert.equal(url.hostname, 'data-api.binance.vision');
    return json(['BTC', 'ETH'].map(code => ({ symbol: `${code}BRL`, bidPrice: '100', askPrice: '101',
      highPrice: '110', lowPrice: '90', closeTime: now.getTime() - 1000 })));
  } });
  assert.equal(result.changes, 2);
  assert.equal(calls.length, 7);
  assert.equal(s.read().pares['USD-BRL'].create_date, '2026-11-06');
  assert.equal(s.read().pares['BTC-BRL'].varBid, null);
  assert.equal(Object.keys(s.read().pares).length, 6);
});
