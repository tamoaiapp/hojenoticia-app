import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { CAPITALS, addCivilDays, parseCivilDate, easterDate, buildHolidayCalendar, countBusinessDays, holidayCalendarIcs, foldCalendarLine, escapeCalendarText } from '../lib/holiday-calendar.mjs';
import { updateFeriados } from './modules/feriados.mjs';

const catalog = JSON.parse(fs.readFileSync(new URL('../content/feriados/capital-rules.json', import.meta.url), 'utf8'));
const national = year => buildHolidayCalendar(year);
const source = { title: 'Fonte sintética de teste', url: 'https://example.gov.br/lei' };
const count = options => countBusinessDays({ start: '2026-11-16', end: '2026-11-23', calendars: [national(2026)], ...options });

test('Gregorian Easter and moving dates use civil UTC arithmetic', () => {
  assert.deepEqual([2026, 2027, 2028].map(easterDate), ['2026-04-05', '2027-03-28', '2028-04-16']);
  assert.equal(addCivilDays('2028-02-28', 1), '2028-02-29');
  assert.equal(addCivilDays('2026-12-31', 1), '2027-01-01');
  assert.throws(() => parseCivilDate('2027-02-29'));
  assert.throws(() => parseCivilDate('2026-13-01'));
});

test('all 27 capitals have unique slugs, UF identifiers and usable time zones', () => {
  assert.equal(CAPITALS.length, 27);
  assert.equal(new Set(CAPITALS.map(city => city.slug)).size, 27);
  assert.equal(new Set(CAPITALS.map(city => city.uf)).size, 27);
  for (const city of CAPITALS) assert.doesNotThrow(() => new Intl.DateTimeFormat('pt-BR', { timeZone: city.timeZone }).format(new Date()));
});

test('country calendar separates nine federal holidays from Easter and local-dependent references', () => {
  const calendar = national(2027);
  assert.equal(calendar.events.filter(event => event.kind === 'nacional').length, 9);
  for (const id of ['carnaval', 'carnaval-segunda', 'paixao', 'corpus', 'pascoa']) assert.equal(calendar.events.find(event => event.id === id).isHoliday, false);
});

test('catalog is applicable to every capital with attributed legal types and valid dates', () => {
  for (const city of CAPITALS) {
    assert.ok(catalog.locations[city.slug]?.rules.length, city.slug);
    const rules = catalog.locations[city.slug].rules;
    assert.equal(new Set(rules.map(rule => rule.id)).size, rules.length, `${city.slug} duplicated ids`);
    for (const year of [2026, 2027, 2028]) {
      const calendar = buildHolidayCalendar(year, city.slug, catalog);
      assert.ok(calendar.coverageNote.length > 20);
      for (const event of calendar.events) {
        assert.doesNotThrow(() => parseCivilDate(event.date));
        assert.ok(event.source.title && event.source.url.startsWith('https://'));
      }
    }
  }
});

test('annual local acts never become confirmed holidays in a later year', () => {
  const annual = { locations: { 'sao-paulo-sp': { rules: [{ id: 'fechamento-anual', name: 'Apenas 2026', kind: 'municipal', month: 5, day: 12, years: [2026], source }] } } };
  assert.ok(buildHolidayCalendar(2026, 'sao-paulo-sp', annual).events.some(event => event.id === 'fechamento-anual'));
  assert.ok(!buildHolidayCalendar(2027, 'sao-paulo-sp', annual).events.some(event => event.id === 'fechamento-anual'));
});

test('verified local religious dates replace references without creating duplicates', () => {
  const calendar = buildHolidayCalendar(2027, 'sao-paulo-sp', catalog);
  const friday = calendar.events.filter(event => event.id === 'paixao');
  assert.equal(friday.length, 1);
  assert.equal(friday[0].date, '2027-03-26');
  assert.equal(friday[0].kind, 'municipal');
  assert.equal(friday[0].isHoliday, true);
});

test('a local rule cannot downgrade an existing national holiday', () => {
  const data = { locations: { 'sao-paulo-sp': { rules: [{ id: 'consciencia-negra', name: 'Lei local antiga', kind: 'municipal', month: 11, day: 20, source }] } } };
  assert.equal(buildHolidayCalendar(2027, 'sao-paulo-sp', data).events.find(event => event.id === 'consciencia-negra').kind, 'nacional');
});

test('a statutory Sunday transfer changes the civil holiday date', () => {
  const data = { locations: { 'florianopolis-sc': { rules: [{ id: 'data-magna', name: 'Data magna transferida', kind: 'estadual', month: 8, day: 11, transferToNextSunday: true, source }] } } };
  assert.equal(buildHolidayCalendar(2026, 'florianopolis-sc', data).events.find(event => event.id === 'data-magna').date, '2026-08-16');
});

test('default interval excludes the start and counts holiday only once', () => {
  const result = count({});
  assert.deepEqual({ considered: result.considered, working: result.working, weekends: result.weekends, holidays: result.holidays }, { considered: 7, working: 4, weekends: 2, holidays: 1 });
  assert.equal(count({ includeStart: true }).working, 5);
  assert.equal(count({ includeEnd: false }).working, 3);
});

test('holiday on an excluded weekend does not cause a double subtraction', () => {
  const result = count({ start: '2026-11-14', end: '2026-11-16', includeStart: true });
  assert.equal(result.working, 1);
  assert.equal(result.weekends, 2);
  assert.equal(result.holidays, 0);
  assert.equal(result.considered, result.working + result.weekends + result.holidays + result.manual);
});

test('Saturday setting and duplicate manual closures are explicit', () => {
  assert.equal(count({ saturdayIsWorking: true }).working, 5);
  const result = count({ extraDates: ['2026-11-18', '2026-11-18', '2026-11-20'] });
  assert.equal(result.working, 3);
  assert.equal(result.manual, 1);
  assert.equal(result.holidays, 1);
});

test('reference dates affect calculations only when requested or legally confirmed locally', () => {
  const options = { start: '2027-03-26', end: '2027-03-26', includeStart: true, calendars: [national(2027)] };
  assert.equal(count(options).working, 1);
  assert.equal(count({ ...options, includeReferenceDates: true }).working, 0);
  assert.equal(count({ ...options, calendars: [buildHolidayCalendar(2027, 'sao-paulo-sp', catalog)] }).working, 0);
});

test('invalid, reversed, oversized and uncovered periods are rejected', () => {
  assert.throws(() => count({ start: '2027-02-30' }));
  assert.throws(() => count({ end: '2026-10-01' }));
  assert.throws(() => count({ end: '2030-01-01' }));
  assert.throws(() => count({ start: '2027-01-01', end: '2027-01-02' }));
  assert.throws(() => count({ extraDates: ['not-a-date'] }));
  assert.equal(count({ start: '2026-11-16', end: '2026-11-16' }).considered, 0);
});

test('ICS is UTF-8/CRLF, all-day, and does not export reference dates by default', () => {
  const text = holidayCalendarIcs(national(2027), { now: new Date('2026-11-04T12:00:00Z') });
  assert.ok(text.endsWith('\r\n'));
  assert.ok(!text.replaceAll('\r\n', '').includes('\n'));
  assert.equal((text.match(/BEGIN:VEVENT/g) ?? []).length, 9);
  assert.ok(text.includes('DTSTART;VALUE=DATE:20270101\r\nDTEND;VALUE=DATE:20270102'));
  assert.ok(!text.includes('STATUS:TENTATIVE'));
  for (const line of text.split('\r\n')) assert.ok(Buffer.byteLength(line, 'utf8') <= 75);
  assert.ok(holidayCalendarIcs(national(2027), { includeReferences: true }).includes('STATUS:TENTATIVE'));
});

test('ICS UIDs are stable across exports and fields cannot inject calendar lines', () => {
  const first = holidayCalendarIcs(national(2027), { now: new Date('2026-11-04T12:00:00Z') });
  const second = holidayCalendarIcs(national(2027), { now: new Date('2026-11-05T12:00:00Z') });
  const ids = value => value.replace(/\r\n[ \t]/g, '').match(/^UID:.+$/gm);
  assert.deepEqual(ids(first), ids(second));
  assert.equal(escapeCalendarText('ação, teste; um\\dois\rOUTRO'), 'ação\\, teste\\; um\\\\dois\\nOUTRO');
  const folded = foldCalendarLine(`DESCRIPTION:${'ação'.repeat(50)}`);
  assert.equal(folded.replace(/\r\n /g, ''), `DESCRIPTION:${'ação'.repeat(50)}`);
  for (const line of folded.split('\r\n')) assert.ok(Buffer.byteLength(line, 'utf8') <= 75);
});

test('updater is idempotent across days and rolls the year in Brasilia', async t => {
  const temporary = path.resolve(os.tmpdir());
  const root = fs.mkdtempSync(path.join(temporary, 'hoje-holiday-test-'));
  t.after(() => { assert.equal(path.dirname(path.resolve(root)), temporary); assert.ok(path.basename(root).startsWith('hoje-holiday-test-')); fs.rmSync(root, { recursive: true, force: true }); });
  const first = await updateFeriados({ root, now: new Date('2026-11-04T12:00:00Z') });
  assert.equal(first.changes, 3);
  const file = path.join(root, 'content', 'feriados', '2026.json');
  const bytes = fs.readFileSync(file);
  assert.equal((await updateFeriados({ root, now: new Date('2026-11-05T12:00:00Z') })).changes, 0);
  assert.deepEqual(fs.readFileSync(file), bytes);
  assert.equal((await updateFeriados({ root, now: new Date('2027-01-01T01:00:00Z') })).changes, 0);
  assert.equal((await updateFeriados({ root, now: new Date('2027-01-01T03:01:00Z') })).changes, 1);
  assert.ok(fs.existsSync(path.join(root, 'content', 'feriados', '2029.json')));
});
