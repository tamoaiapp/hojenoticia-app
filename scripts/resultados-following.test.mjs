import assert from 'node:assert/strict';
import test from 'node:test';
import {
  GAME_IDS, FOLLOWING_KEYS, defaultPreferences, parsePreferences, readLocal, saveLocal,
  normalizeResult, buildResultsFeed, parseResultsFeed, parseBaseline, reconcileResults,
  mergeInbox, parseInbox, brazilDate,
} from '../lib/resultados-following.mjs';

const today = '2026-11-04';
const prize = { faixa: 1, descricao: '5 acertos', ganhadores: 0, premio: 0 };
const record = (overrides = {}) => normalizeResult({ game: 'quina', concurso: 7158, slug: 'concurso-7158', date: '2026-11-03', numbers: ['23', '25', '44', '51', '68'], secondNumbers: [], clovers: [], prizes: [prize], ...overrides }, today);
const draw = (overrides = {}) => ({ loteria: 'quina', concurso: 7158, slug: 'concurso-7158', status: 'publicado', draw_date: '2026-11-03', numeros: ['23', '25', '44', '51', '68'], rateio: [prize], ...overrides });

test('preferences whitelist ten games, deduplicate, recover corrupt storage and obey version', () => {
  assert.equal(GAME_IDS.length, 10);
  assert.deepEqual(parsePreferences('{broken'), defaultPreferences());
  assert.deepEqual(parsePreferences({ version: 2, favorites: ['quina'], alertsEnabled: true }), defaultPreferences());
  assert.deepEqual(parsePreferences({ version: 1, favorites: ['quina', '__proto__', 'mega-sena', 'quina'], alertsEnabled: true, browserEnabled: true }), { version: 1, favorites: ['quina', 'mega-sena'], alertsEnabled: true, browserEnabled: true });
  assert.deepEqual(parsePreferences({ version: 1, favorites: [], alertsEnabled: true, browserEnabled: true }), defaultPreferences());
  const blocked = { getItem() { throw new Error('blocked'); }, setItem() { throw new Error('quota'); } };
  assert.equal(readLocal(blocked, FOLLOWING_KEYS.preferences), null);
  assert.equal(saveLocal(blocked, FOLLOWING_KEYS.inbox, { version: 1, events: [] }), false);
});

test('first baseline is silent, then a new contest alerts once and repeated snapshots are silent', () => {
  const first = reconcileResults(null, [record()], ['quina']);
  assert.deepEqual(first.events, []);
  const next = record({ concurso: 7159, slug: 'concurso-7159', date: today });
  const changed = reconcileResults(first.baseline, [next, record()], ['quina']);
  assert.equal(changed.events.length, 1);
  assert.equal(changed.events[0].kind, 'new');
  assert.equal(changed.events[0].result.concurso, 7159);
  assert.deepEqual(reconcileResults(changed.baseline, [next, record()], ['quina']).events, []);
  assert.deepEqual(reconcileResults(null, [next, record()], ['quina']).events, []);
});

test('a correction to numbers or prize data is semantic; check/publication timestamps are not', () => {
  const original = record(), first = reconcileResults(null, [original], ['quina']);
  const timestamps = record({ source_checked_at: '2026-11-04T10:00:00Z', published_at: '2026-11-04T11:00:00Z', updated_at: '2026-11-04T11:01:00Z', numbers: [...original.numbers].reverse() });
  assert.equal(timestamps.fingerprint, original.fingerprint);
  assert.deepEqual(reconcileResults(first.baseline, [timestamps], ['quina']).events, []);
  const numbers = reconcileResults(first.baseline, [record({ numbers: ['01', '25', '44', '51', '68'] })], ['quina']);
  assert.equal(numbers.events[0].kind, 'corrected');
  const prizeCorrection = record({ prizes: [{ ...prize, ganhadores: 1, premio: 1500000 }] });
  assert.equal(reconcileResults(first.baseline, [prizeCorrection], ['quina']).events[0].kind, 'corrected');
  const sourceOnly = record({ sourceURL: 'https://servicebus3.caixa.gov.br/portaldeloterias/api/quina/7158' });
  assert.equal(sourceOnly.fingerprint, original.fingerprint);
});

test('adding a favorite or backfilling an older contest does not flood the inbox', () => {
  const seeded = reconcileResults(null, [record()], ['quina']);
  const old = record({ concurso: 7000, slug: 'concurso-7000', date: '2026-01-02' });
  const mega = record({ game: 'mega-sena', concurso: 3000, slug: 'concurso-3000', numbers: ['01', '02', '03', '04', '05', '06'] });
  assert.deepEqual(reconcileResults(seeded.baseline, [record(), old, mega], ['quina', 'mega-sena']).events, []);
  const removed = reconcileResults(seeded.baseline, [], []).baseline;
  assert.deepEqual(removed, parseBaseline(null));
  assert.deepEqual(reconcileResults(removed, [record()], ['quina']).events, []);
});

test('Federal retains zeroes and prize order; Super Sete retains duplicate column digits', () => {
  const tickets = ['056338', '001871', '024389', '062267', '030022'];
  const federal = record({ game: 'federal', numbers: tickets });
  assert.deepEqual(federal.numbers, tickets);
  assert.notEqual(record({ game: 'federal', numbers: [...tickets].reverse() }).fingerprint, federal.fingerprint);
  assert.equal(record({ game: 'federal', numbers: tickets.map(Number) }), null);
  const columns = ['0', '1', '0', '8', '2', '2', '9'];
  const seven = record({ game: 'super-sete', numbers: columns });
  assert.deepEqual(seven.numbers, columns);
  assert.notEqual(record({ game: 'super-sete', numbers: [...columns].reverse() }).fingerprint, seven.fingerprint);
});

test('Dupla Sena distinguishes both draws and detects a correction confined to the second draw', () => {
  const firstNumbers = ['01', '02', '03', '04', '05', '06'], secondNumbers = ['07', '08', '09', '10', '11', '12'];
  const dupla = record({ game: 'dupla-sena', numbers: firstNumbers, secondNumbers });
  const first = reconcileResults(null, [dupla], ['dupla-sena']);
  const changed = record({ game: 'dupla-sena', numbers: firstNumbers, secondNumbers: ['07', '08', '09', '10', '11', '13'] });
  assert.equal(reconcileResults(first.baseline, [changed], ['dupla-sena']).events[0].kind, 'corrected');
  assert.notEqual(record({ game: 'dupla-sena', numbers: secondNumbers, secondNumbers: firstNumbers }).fingerprint, dupla.fingerprint);
  assert.equal(record({ game: 'dupla-sena', numbers: firstNumbers, secondNumbers, session: 'Midday' }).fingerprint, dupla.fingerprint);
});

test('trevos, month, team and prize-tier identity survive the feed and affect corrections', () => {
  for (const [game, field, before, after] of [
    ['maismilionaria', 'clovers', ['1', '2'], ['1', '3']],
    ['diadesorte', 'month', 'Novembro', 'Dezembro'],
    ['timemania', 'team', 'TIME A', 'TIME B'],
  ]) assert.notEqual(record({ game, [field]: before }).fingerprint, record({ game, [field]: after }).fingerprint);
  const one = record({ prizes: [prize, { ...prize, faixa: 2, descricao: '4 acertos', ganhadores: 5, premio: 30 }] });
  const reordered = record({ prizes: [...one.prizes].reverse() });
  assert.equal(one.fingerprint, reordered.fingerprint);
});

test('feed selects only three published contests per game and only confirmed matching next dates', () => {
  const feed = buildResultsFeed([
    ...[7158, 7157, 7156, 7155].map(concurso => draw({ concurso, slug: `concurso-${concurso}`, proximo_concurso: 7159, proxima_data: today })),
    draw({ concurso: 7159, slug: 'concurso-7159', status: 'aguardando', schedule_status: 'confirmed', draw_date: today, numeros: [] }),
    draw({ loteria: 'mega-sena', concurso: 9999, slug: 'concurso-9999', status: 'aguardando', schedule_status: 'unconfirmed', draw_date: '2026-11-05', numeros: [] }),
  ], today);
  assert.deepEqual(feed.results.map(result => result.concurso), [7158, 7157, 7156]);
  assert.deepEqual(feed.schedule, [{ game: 'quina', concurso: 7159, date: today, slug: 'concurso-7159', status: 'confirmed' }]);
  assert.deepEqual(parseResultsFeed(feed, today), feed);
  assert.equal(parseResultsFeed({ ...feed, results: [feed.results[0], feed.results[0]] }, today), null);
  assert.equal(parseResultsFeed({ ...feed, results: [{ ...feed.results[0], fingerprint: 'forged' }] }, today), null);
  const unconfirmed = buildResultsFeed([draw({ proximo_concurso: 7159, proxima_data: today }), draw({ concurso: 7159, slug: 'concurso-7159', status: 'aguardando', schedule_status: 'unconfirmed', draw_date: today })], today);
  assert.deepEqual(unconfirmed.schedule, []);
});

test('future and impossible dates stay out; Brazilian civil day is independent of UTC midnight', () => {
  assert.equal(record({ date: '2026-02-30' }), null);
  assert.equal(record({ date: '2026-11-05' }), null);
  assert.equal(record({ status: 'aguardando' }), null);
  assert.equal(brazilDate(new Date('2027-01-01T01:30:00Z')), '2026-12-31');
  assert.equal(brazilDate(new Date('2027-01-01T03:00:00Z')), '2027-01-01');
});

test('inbox is deduplicated, bounded to 100 and recovers invalid payloads without inventing alerts', () => {
  const events = [];
  for (let concurso = 7200; concurso >= 7090; concurso--) {
    const result = record({ concurso, slug: `concurso-${concurso}` });
    events.push({ id: `new|${result.id}|${result.fingerprint}`, kind: 'new', result });
  }
  const inbox = mergeInbox([], events);
  assert.equal(inbox.length, 100);
  assert.deepEqual(mergeInbox(inbox, [inbox[0]]), inbox);
  assert.deepEqual(parseInbox('{broken'), []);
  assert.deepEqual(parseInbox({ version: 2, events }), []);
  assert.deepEqual(parseInbox({ version: 1, events: [{ ...events[0], id: 'fake' }] }), []);
  assert.deepEqual(parseBaseline('{broken'), parseBaseline(null));
});
