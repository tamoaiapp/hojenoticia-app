import test from 'node:test';
import assert from 'node:assert/strict';
import { fetchFallback } from './cambio-fallback.mjs';

const NOW = new Date('2026-11-08T13:00:00Z');
const TODAY = '2026-11-08';
const CSV = [
  '06/11/2026;220;A;USD;5,50070000;5,50130000;1,00000000;1,00000000',
  '06/11/2026;222;B;EUR;6,10000000;6,12000000;1,10000000;1,11000000',
  '06/11/2026;540;B;GBP;7,10000000;7,12000000;1,20000000;1,21000000',
  '06/11/2026;706;A;ARS;0,00381000;0,00383000;1440,00000000;1450,00000000',
].join('\r\n');
const ticker = (symbol, factor = 1) => ({
  symbol, bidPrice: String(100 * factor), askPrice: String(101 * factor),
  highPrice: String(110 * factor), lowPrice: String(90 * factor),
  priceChange: '5', priceChangePercent: '5.263', closeTime: NOW.getTime() - 1000,
});
const crypto = () => [ticker('BTCBRL', 1000), ticker('ETHBRL', 10)];
const reply = (body, status = 200) => new Response(typeof body === 'string' ? body : JSON.stringify(body), { status });

function fixture({ csv = CSV, rows = crypto(), bcb = null, binance = null } = {}) {
  const calls = [];
  const waits = [];
  const fetchImpl = async (input, options) => {
    const url = new URL(input);
    calls.push({ url, options });
    if (url.hostname === 'www4.bcb.gov.br') {
      if (bcb) return bcb(url, calls.length);
      if (!url.pathname.endsWith('/20261106.csv')) return reply('', 404);
      return reply(csv);
    }
    assert.equal(url.hostname, 'data-api.binance.vision');
    assert.deepEqual(JSON.parse(url.searchParams.get('symbols')), ['BTCBRL', 'ETHBRL']);
    return binance ? binance(url) : reply(rows);
  };
  return { calls, waits, options: { today: TODAY, now: NOW, fetchImpl, wait: async ms => waits.push(ms) } };
}

test('Sunday falls back to Friday official CSV and both exact BRL spot pairs with no key', async () => {
  const f = fixture();
  const value = await fetchFallback(f.options);
  assert.equal(f.calls.length, 4);
  assert.deepEqual(Object.keys(value.pares).sort(), ['ARS-BRL', 'BTC-BRL', 'ETH-BRL', 'EUR-BRL', 'GBP-BRL', 'USD-BRL']);
  assert.equal(value.pares['USD-BRL'].bid, 5.5007);
  assert.equal(value.pares['USD-BRL'].ask, 5.5013);
  assert.equal(value.pares['ARS-BRL'].bid, 0.00381);
  assert.equal(value.pares['USD-BRL'].timestamp, Date.parse('2026-11-06T00:00:00-03:00') / 1000);
  assert.equal(value.pares['USD-BRL'].create_date, '2026-11-06');
  assert.equal(value.pares['USD-BRL'].source, 'bcb-ptax');
  assert.equal(value.pares['USD-BRL'].timestamp_precision, 'day');
  assert.equal(value.pares['BTC-BRL'].source, 'binance');
  assert.equal(value.pares['BTC-BRL'].bid, 100000);
  assert.equal(value.pares['BTC-BRL'].timestamp_precision, 'second');
  assert.equal(value.pares['BTC-BRL'].high, 110000);
  assert.equal(value.pares['USD-BRL'].high, null);
  assert.equal(value.pares['USD-BRL'].pctChange, null);
  assert.equal(value.pares['BTC-BRL'].pctChange, null);
  assert.deepEqual(value.historico, {});
  for (const call of f.calls) {
    assert.equal(Object.keys(call.options.headers).some(key => /key|auth/i.test(key)), false);
    assert.equal(call.options.headers.Accept, '*/*');
  }
});

test('BCB rate limit stops immediately without trying other dates or Binance', async () => {
  const f = fixture({ bcb: () => reply('', 429) });
  await assert.rejects(fetchFallback(f.options), /Banco Central: HTTP 429/);
  assert.equal(f.calls.length, 1);
  assert.deepEqual(f.waits, []);
});

test('BCB server outage uses at most two attempts and does not silently use a different date', async () => {
  const f = fixture({ bcb: () => reply('', 503) });
  await assert.rejects(fetchFallback(f.options), /Banco Central: HTTP 503/);
  assert.equal(f.calls.length, 2);
  assert.deepEqual(f.waits, [500]);
});

test('temporary server error retries the same resource and succeeds', async () => {
  let attempts = 0;
  const f = fixture({ bcb: url => {
    if (url.pathname.endsWith('/20261108.csv') && attempts++ === 0) return reply('', 503);
    if (url.pathname.endsWith('/20261106.csv')) return reply(CSV);
    return reply('', 404);
  } });
  await fetchFallback(f.options);
  assert.deepEqual(f.waits, [500]);
  assert.equal(f.calls[0].url.href, f.calls[1].url.href);
});

test('network failures use a bounded retry without leaking request options in errors', async () => {
  const f = fixture({ bcb: () => { throw new Error('secret transport internals'); } });
  await assert.rejects(fetchFallback(f.options), /Banco Central: fonte indisponível após 2 tentativas/);
  assert.equal(f.calls.length, 2);
  assert.deepEqual(f.waits, [500]);
});

test('BCB misses are bounded to ten civil dates', async () => {
  const f = fixture({ bcb: () => reply('', 404) });
  await assert.rejects(fetchFallback(f.options), /nenhum fechamento publicado nos últimos 10 dias/);
  assert.equal(f.calls.length, 10);
});

for (const [name, csv] of [
  ['HTML in place of CSV', '<html>unavailable</html>'],
  ['missing ARS', CSV.split('\r\n').slice(0, 3).join('\r\n')],
  ['duplicate target currency', `${CSV}\r\n${CSV.split('\r\n')[0]}`],
  ['source date different from file date', CSV.replaceAll('06/11/2026', '05/11/2026')],
  ['empty bid', CSV.replace('5,50070000', '')],
  ['invalid decimal', CSV.replace('5,50070000', 'NaN')],
  ['zero bid', CSV.replace('5,50070000', '0,00000000')],
  ['inverted bid ask', CSV.replace('5,50070000', '9,50070000')],
]) {
  test(`invalid BCB source fails without crypto request: ${name}`, async () => {
    const f = fixture({ csv });
    await assert.rejects(fetchFallback(f.options), /Banco Central/);
    assert.equal(f.calls.length, 3);
  });
}

for (const [name, mutate] of [
  ['wrong quote currency', rows => { rows[0].symbol = 'BTCUSD'; }],
  ['duplicate market', rows => { rows[1] = rows[0]; }],
  ['empty bid', rows => { rows[0].bidPrice = ''; }],
  ['array as bid', rows => { rows[0].bidPrice = [100]; }],
  ['zero price', rows => { rows[0].askPrice = '0'; }],
  ['inverted spread', rows => { rows[0].askPrice = '1'; }],
  ['inverted high low', rows => { rows[0].highPrice = '1'; }],
  ['far future clock', rows => { rows[0].closeTime = NOW.getTime() + 301000; }],
  ['old source clock', rows => { rows[0].closeTime = NOW.getTime() - 2 * 86400000 - 1; }],
  ['fractional milliseconds', rows => { rows[0].closeTime += 0.5; }],
]) {
  test(`invalid crypto source fails atomically: ${name}`, async () => {
    const rows = crypto();
    mutate(rows);
    const f = fixture({ rows });
    await assert.rejects(fetchFallback(f.options), /Binance/);
  });
}

test('Binance rate limit is surfaced and not repeated', async () => {
  const f = fixture({ binance: () => reply('', 429) });
  await assert.rejects(fetchFallback(f.options), /Binance: HTTP 429/);
  assert.equal(f.calls.length, 4);
  assert.deepEqual(f.waits, []);
});

test('Binance invalid JSON is a source failure, not an empty successful market', async () => {
  const f = fixture({ binance: () => reply('<html>not JSON</html>') });
  await assert.rejects(fetchFallback(f.options), /Binance: resposta JSON inválida/);
});

test('collection date must match the actual Brasilia day before any requests', async () => {
  const f = fixture();
  await assert.rejects(fetchFallback({ ...f.options, today: '2026-11-09' }), /Data de coleta alternativa inválida/);
  await assert.rejects(fetchFallback({ ...f.options, now: new Date('bad') }), /Data de coleta alternativa inválida/);
  assert.equal(f.calls.length, 0);
});
