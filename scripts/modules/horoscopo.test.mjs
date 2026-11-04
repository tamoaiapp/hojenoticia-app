import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { updateHoroscopo } from './horoscopo.mjs';

const today = '2026-11-04';
const firstTime = new Date('2026-11-04T12:00:00.000Z');
const laterTime = new Date('2026-11-04T16:00:00.000Z');
function setup(t) {
  const tempDir = path.resolve(os.tmpdir());
  const root = fs.mkdtempSync(path.join(tempDir, 'hoje-horoscopo-test-'));
  t.after(() => {
    assert.equal(path.dirname(path.resolve(root)), tempDir);
    assert.ok(path.basename(root).startsWith('hoje-horoscopo-test-'));
    fs.rmSync(root, { recursive: true, force: true });
  });
  const dir = path.join(root, 'content', 'horoscopo');
  const daily = path.join(dir, `${today}.json`), latest = path.join(dir, 'latest.json');
  const run = (overrides = {}) => updateHoroscopo({ root, today, now: firstTime, ...overrides });
  const bytes = file => fs.readFileSync(file);
  const read = file => JSON.parse(fs.readFileSync(file, 'utf8'));
  return { root, dir, daily, latest, run, bytes, read };
}

test('same day and same twelve signs preserve bytes, timestamps and mtimes on a second run', async t => {
  const s = setup(t);
  assert.equal((await s.run()).changes, 2);
  const daily = s.bytes(s.daily), latest = s.bytes(s.latest);
  const modified = [fs.statSync(s.daily).mtimeMs, fs.statSync(s.latest).mtimeMs];
  assert.equal(Object.keys(s.read(s.daily).signos).length, 12);
  assert.equal((await s.run({ now: laterTime })).changes, 0);
  assert.deepEqual(s.bytes(s.daily), daily);
  assert.deepEqual(s.bytes(s.latest), latest);
  assert.deepEqual([fs.statSync(s.daily).mtimeMs, fs.statSync(s.latest).mtimeMs], modified);
  assert.equal(s.read(s.latest).updated_at, firstTime.toISOString());
});

test('CRLF checkout and reordered JSON keys do not become material changes', async t => {
  const s = setup(t); await s.run();
  const data = s.read(s.daily);
  const reordered = { signos: Object.fromEntries(Object.entries(data.signos).reverse()), updated_at: data.updated_at, date: data.date };
  fs.writeFileSync(s.daily, JSON.stringify(reordered, null, 2).replace(/\n/g, '\r\n'));
  fs.writeFileSync(s.latest, JSON.stringify(data, null, 4).replace(/\n/g, '\r\n'));
  const daily = s.bytes(s.daily), latest = s.bytes(s.latest);
  assert.equal((await s.run({ now: laterTime })).changes, 0);
  assert.deepEqual(s.bytes(s.daily), daily);
  assert.deepEqual(s.bytes(s.latest), latest);
});

test('a material text change is written, then repeated execution stays unchanged', async t => {
  const s = setup(t); await s.run();
  const expected = s.read(s.daily).signos.aries.geral;
  for (const file of [s.daily, s.latest]) {
    const data = s.read(file); data.signos.aries.geral = 'Conteúdo anterior, diferente do template atual.';
    fs.writeFileSync(file, JSON.stringify(data));
  }
  assert.equal((await s.run({ now: laterTime })).changes, 2);
  assert.equal(s.read(s.daily).signos.aries.geral, expected);
  assert.equal(s.read(s.latest).updated_at, laterTime.toISOString());
  assert.equal((await s.run({ now: new Date('2026-11-04T19:00:00Z') })).changes, 0);
});

for (const corruption of ['missing', 'json', 'shape']) {
  test(`latest ${corruption} is repaired from the valid daily snapshot without redating the day`, async t => {
    const s = setup(t); await s.run();
    fs.writeFileSync(s.daily, fs.readFileSync(s.daily, 'utf8').replace(/\n/g, '\r\n'));
    const daily = s.bytes(s.daily);
    if (corruption === 'missing') fs.unlinkSync(s.latest);
    else fs.writeFileSync(s.latest, corruption === 'json' ? '{broken' : JSON.stringify({ date: today, updated_at: firstTime.toISOString(), signos: {} }));
    assert.equal((await s.run({ now: laterTime })).changes, 1);
    assert.deepEqual(s.bytes(s.daily), daily);
    assert.deepEqual(s.bytes(s.latest), daily);
    assert.equal((await s.run({ now: laterTime })).changes, 0);
  });
}

test('a missing daily snapshot is recovered from matching latest without a new timestamp', async t => {
  const s = setup(t); await s.run();
  const latest = s.bytes(s.latest); fs.unlinkSync(s.daily);
  assert.equal((await s.run({ now: laterTime })).changes, 1);
  assert.deepEqual(s.bytes(s.latest), latest);
  assert.deepEqual(s.bytes(s.daily), latest);
});

test('a new civil day generates its daily file and latest while preserving the previous archive', async t => {
  const s = setup(t); await s.run(); const previous = s.bytes(s.daily);
  const nextDay = '2026-11-05', now = new Date('2026-11-05T12:00:00Z');
  assert.equal((await s.run({ today: nextDay, now })).changes, 2);
  assert.equal(s.read(s.latest).date, nextDay);
  assert.equal(s.read(s.latest).updated_at, now.toISOString());
  assert.deepEqual(s.bytes(s.latest), s.bytes(path.join(s.dir, `${nextDay}.json`)));
  assert.deepEqual(s.bytes(s.daily), previous);
  assert.notDeepEqual(s.read(s.latest).signos, s.read(s.daily).signos);
});

test('retrospective generation or rerun never replaces a valid newer latest', async t => {
  const s = setup(t); await s.run(); const latest = s.bytes(s.latest);
  const earlier = '2026-11-03';
  assert.equal((await s.run({ today: earlier, now: laterTime })).changes, 1);
  assert.deepEqual(s.bytes(s.latest), latest);
  assert.equal(s.read(path.join(s.dir, `${earlier}.json`)).date, earlier);
  assert.equal((await s.run({ today: earlier, now: laterTime })).changes, 0);
});

test('retrospective repair of missing latest selects the surviving newer daily snapshot', async t => {
  const s = setup(t); await s.run(); const current = s.bytes(s.daily);
  fs.unlinkSync(s.latest);
  assert.equal((await s.run({ today: '2026-11-03', now: laterTime })).changes, 2);
  assert.deepEqual(s.bytes(s.latest), current);
  assert.equal(s.read(s.latest).date, today);
});

test('invalid civil dates and clocks fail before creating files', async t => {
  const s = setup(t);
  for (const date of ['2026-02-30', '2026-11-4', '../latest', '', null]) await assert.rejects(s.run({ today: date }), /Data do horóscopo inválida/);
  await assert.rejects(s.run({ now: new Date('invalid') }), /Horário de geração/);
  assert.equal(fs.existsSync(s.dir), false);
});
