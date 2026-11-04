import assert from 'node:assert/strict';
import fs from 'node:fs';
import { test } from 'node:test';
import ts from 'typescript';

// Compile only this server-side reader in memory; no source files, data or network are changed.
const source = fs.readFileSync(new URL('../lib/cambio.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { getQuoteTiming, parseCambioSnapshot } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`);
const seconds = iso => Date.parse(iso) / 1000;
const now = new Date('2026-11-04T15:00:00.000Z');
function quote(code = 'USD-BRL', at = '2026-11-04T14:00:00Z') {
  const [from, to] = code.split('-');
  return { code, from, to, name: `${from}/${to}`, bid: 5, ask: 5.01, high: 5.1, low: 4.9, varBid: -0.01, pctChange: -0.2, timestamp: seconds(at), create_date: '2026-11-04 11:00:00' };
}
function snapshot() {
  return { updated_at: now.toISOString(), date: '2026-11-04', pares: { 'USD-BRL': quote() }, historico: {} };
}

test('source date stays on the Brasilia day when UTC has already crossed midnight', () => {
  const timing = getQuoteTiming(seconds('2026-11-04T01:15:00Z'), new Date('2026-11-04T02:30:00Z'));
  assert.equal(timing.day, '2026-11-03');
  assert.equal(timing.isFromPreviousDate, false);
  assert.match(timing.formatted, /03\/11\/2026/);
});

test('the warning changes at midnight in Brasilia, independently of the UTC date', () => {
  const timing = getQuoteTiming(seconds('2026-11-04T02:59:59Z'), new Date('2026-11-04T03:00:01Z'));
  assert.equal(timing.day, '2026-11-03');
  assert.equal(timing.isFromPreviousDate, true);
});

test('a recent collection and a recent crypto quote do not refresh an older currency quote', () => {
  const data = snapshot();
  data.pares['USD-BRL'] = quote('USD-BRL', '2026-11-03T20:00:00Z');
  data.pares['BTC-BRL'] = quote('BTC-BRL');
  const parsed = parseCambioSnapshot(data, now);
  assert.equal(parsed.updated_at, now.toISOString());
  assert.equal(getQuoteTiming(parsed.pares['USD-BRL'].timestamp, now).isFromPreviousDate, true);
  assert.equal(getQuoteTiming(parsed.pares['BTC-BRL'].timestamp, now).isFromPreviousDate, false);
});

test('invalid or future source timestamps never become current quotes', () => {
  for (const value of [NaN, Infinity, -1, 0, '1793800000', seconds('2026-11-05T14:00:00Z')]) {
    assert.equal(getQuoteTiming(value, now), null);
    const data = snapshot();
    data.pares['USD-BRL'].timestamp = value;
    assert.equal(parseCambioSnapshot(data, now), null);
  }
});

test('malformed prices and identifiers are excluded while another valid pair remains readable', () => {
  for (const change of [{ bid: NaN }, { ask: null }, { pctChange: Infinity }, { high: 4.8 }, { bid: '5' }, { from: 'EUR' }]) {
    const data = snapshot();
    Object.assign(data.pares['USD-BRL'], change);
    data.pares['BTC-BRL'] = quote('BTC-BRL');
    const parsed = parseCambioSnapshot(data, now);
    assert.deepEqual(Object.keys(parsed.pares), ['BTC-BRL']);
  }
});

test('invalid collection metadata and empty or malformed snapshots use the unavailable fallback', () => {
  for (const value of [null, [], {}, { ...snapshot(), updated_at: 'not a date' }, { ...snapshot(), updated_at: '2026-11-05T00:00:00Z' }, { ...snapshot(), date: '2026-02-30' }, { ...snapshot(), date: '2026-11-05' }, { ...snapshot(), pares: {} }]) {
    assert.equal(parseCambioSnapshot(value, now), null);
  }
});

test('collection metadata rejects impossible civil dates and 24-hour rollover', () => {
  for (const updated_at of [
    '2026-02-30T12:00:00.000Z',
    '2026-02-30T12:00:00-03:00',
    '2025-02-29T12:00:00Z',
    '2026-11-03T24:00:00Z',
    '2026-11-03T24:00:00-03:00',
  ]) {
    assert.equal(parseCambioSnapshot({ ...snapshot(), updated_at }, now), null, updated_at);
  }
  const offset = '2026-11-04T11:00:00-03:00';
  assert.equal(parseCambioSnapshot({ ...snapshot(), updated_at: offset }, now).updated_at, offset);
  const leap = { ...snapshot(), updated_at: '2024-02-29T23:59:59.999Z', date: '2024-02-29', pares: { 'USD-BRL': quote('USD-BRL', '2024-02-29T23:00:00Z') } };
  assert.equal(parseCambioSnapshot(leap, now).updated_at, leap.updated_at);
});

test('legacy history dates are displayed by source timestamp in Brasilia without changing the input', () => {
  const data = snapshot();
  data.historico['USD-BRL'] = [
    { bid: 5, timestamp: seconds('2026-11-04T01:15:00Z'), date: '2026-11-04' },
    { bid: null, timestamp: seconds('2026-11-03T01:15:00Z'), date: '2026-11-03' },
  ];
  const parsed = parseCambioSnapshot(data, now);
  assert.deepEqual(parsed.historico['USD-BRL'], [{ bid: 5, timestamp: seconds('2026-11-04T01:15:00Z'), date: '2026-11-03' }]);
  assert.equal(data.historico['USD-BRL'][0].date, '2026-11-04');
});
