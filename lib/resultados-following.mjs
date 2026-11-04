// Shared by the read-only feed and the browser. No ticket data leaves this module.
export const GAME_IDS = ['lotofacil', 'quina', 'mega-sena', 'lotomania', 'timemania', 'diadesorte', 'dupla-sena', 'maismilionaria', 'super-sete', 'federal'];
export const FOLLOWING_KEYS = { preferences: 'hojenoticia.results.v1', baseline: 'hojenoticia.results-baseline.v1', inbox: 'hojenoticia.results-inbox.v1' };
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const decode = raw => { try { return typeof raw === 'string' ? raw.length <= 2_000_000 ? JSON.parse(raw) : null : raw; } catch { return null; } };
const favorites = values => Array.isArray(values) ? GAME_IDS.filter(game => values.includes(game)) : [];
const positiveInteger = value => typeof value === 'number' && Number.isSafeInteger(value) && value > 0;
const amount = value => typeof value === 'number' && Number.isFinite(value) && value >= 0;
export const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(`${value}T12:00:00Z`)) && new Date(`${value}T12:00:00Z`).toISOString().slice(0, 10) === value;
export const brazilDate = (now = new Date()) => new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);

/** @typedef {{version:1,favorites:string[],alertsEnabled:boolean,browserEnabled:boolean}} Preferences */
/** @typedef {{faixa:number,descricao:string,ganhadores:number,premio:number}} PrizeTier */
/** @typedef {{id:string,game:string,concurso:number,slug:string,date:string,numbers:string[],secondNumbers:string[],clovers:string[],month:string|null,team:string|null,prizes:PrizeTier[],rollover:boolean|null,sourceURL?:string,fingerprint:string}} Result */
/** @typedef {{version:1,followed:string[],seen:Record<string,string>,latest:Record<string,number>}} Baseline */
/** @typedef {{id:string,kind:'new'|'corrected',result:Result}} ResultEvent */
/** @typedef {{game:string,concurso:number,date:string,slug:string,status:'confirmed'}} Schedule */

/** @returns {Preferences} */
export function defaultPreferences() { return { version: 1, favorites: [], alertsEnabled: false, browserEnabled: false }; }
/** @returns {Preferences} */
export function parsePreferences(raw) {
  const value = decode(raw);
  if (!object(value) || value.version !== 1) return defaultPreferences();
  const selected = favorites(value.favorites), enabled = selected.length > 0 && value.alertsEnabled === true;
  return { version: 1, favorites: selected, alertsEnabled: enabled, browserEnabled: enabled && value.browserEnabled === true };
}
export function readLocal(storage, key) { try { return storage.getItem(key); } catch { return null; } }
export function saveLocal(storage, key, value) { try { storage.setItem(key, JSON.stringify(value)); return true; } catch { return false; } }

const digits = values => Array.isArray(values) && values.length <= 25 && values.every(n => typeof n === 'string' && /^\d{1,6}$/.test(n));
const unordered = numbers => [...numbers].map(Number).sort((a, b) => a - b);
// Federal prize positions and Super Sete columns are ordered. Dupla Sena's two
// draws remain separate. Collection/publication timestamps have no part here.
export function resultFingerprint(result) {
  const main = ['federal', 'super-sete'].includes(result.game) ? result.numbers : unordered(result.numbers);
  const prizes = [...result.prizes].sort((a, b) => a.faixa - b.faixa || a.descricao.localeCompare(b.descricao));
  return JSON.stringify([result.game, result.concurso, result.date, main, unordered(result.secondNumbers), unordered(result.clovers), result.month, result.team, result.rollover, prizes.map(p => [p.faixa, p.descricao, p.ganhadores, p.premio])]);
}

/** Defensive shape checks; the Caixa importer remains responsible for game rules. @returns {Result|null} */
export function normalizeResult(value, today = brazilDate()) {
  if (!object(value) || !GAME_IDS.includes(value.game) || !positiveInteger(value.concurso) || !validDate(value.date) || value.date > today || !digits(value.numbers) || !value.numbers.length) return null;
  if (value.status != null && value.status !== 'publicado') return null;
  const { game, concurso, date } = value, slug = `concurso-${concurso}`, id = `${game}:${concurso}`;
  if (value.slug !== slug || value.id != null && value.id !== id) return null;
  if (!digits(value.secondNumbers ?? []) || !digits(value.clovers ?? [])) return null;
  if (game === 'federal' && !value.numbers.every(n => /^\d{5,6}$/.test(n))) return null;
  if (game === 'super-sete' && (value.numbers.length !== 7 || !value.numbers.every(n => /^\d$/.test(n)))) return null;
  const text = v => typeof v === 'string' && v.trim().length > 0 && v.length <= 120 ? v.trim() : null;
  const rawPrizes = value.prizes ?? [];
  if (!Array.isArray(rawPrizes) || rawPrizes.length > 30 || rawPrizes.some(p => !object(p) || !positiveInteger(p.faixa) || typeof p.descricao !== 'string' || p.descricao.length > 200 || !Number.isSafeInteger(p.ganhadores) || p.ganhadores < 0 || !amount(p.premio))) return null;
  const prizes = rawPrizes.map(p => ({ faixa: p.faixa, descricao: p.descricao, ganhadores: p.ganhadores, premio: p.premio }));
  const result = { id, game, concurso, slug, date, numbers: [...value.numbers], secondNumbers: game === 'dupla-sena' ? [...(value.secondNumbers ?? [])] : [], clovers: game === 'maismilionaria' ? [...(value.clovers ?? [])] : [], month: game === 'diadesorte' ? text(value.month) : null, team: game === 'timemania' ? text(value.team) : null, prizes, rollover: typeof value.rollover === 'boolean' ? value.rollover : null };
  let sourceURL;
  try { const source = new URL(value.sourceURL); if (source.protocol === 'https:' && !source.username && !source.password) sourceURL = source.href; } catch { /* Older records may not contain a source link. */ }
  return { ...result, ...(sourceURL ? { sourceURL } : {}), fingerprint: resultFingerprint(result) };
}

/** @returns {{version:1,results:Result[],schedule:Schedule[]}} */
export function buildResultsFeed(draws, today = brazilDate()) {
  const results = [], schedule = [];
  for (const game of GAME_IDS) {
    const records = draws.filter(draw => draw.loteria === game).sort((a, b) => b.concurso - a.concurso);
    const published = records.filter(draw => draw.status === 'publicado').map(draw => normalizeResult({ game, status: draw.status, concurso: draw.concurso, slug: draw.slug, date: draw.draw_date, numbers: draw.numeros, secondNumbers: draw.numeros_segundo_sorteio, clovers: draw.trevos_sorteados, month: draw.mes_sorte, team: draw.time_coracao, prizes: draw.rateio, rollover: draw.acumulou, sourceURL: draw.source_url }, today)).filter(Boolean);
    const unique = published.filter((draw, index) => published.findIndex(other => other.id === draw.id) === index).slice(0, 3);
    results.push(...unique);
    const latest = records.find(draw => draw.status === 'publicado' && draw.concurso === unique[0]?.concurso);
    const next = latest && records.find(draw => draw.status === 'aguardando' && draw.schedule_status === 'confirmed' && draw.concurso === latest.proximo_concurso && draw.draw_date === latest.proxima_data && draw.concurso > latest.concurso && validDate(draw.draw_date) && draw.draw_date >= today && draw.slug === `concurso-${draw.concurso}`);
    if (next) schedule.push({ game, concurso: next.concurso, date: next.draw_date, slug: next.slug, status: 'confirmed' });
  }
  return { version: 1, results, schedule };
}

/** @returns {{version:1,results:Result[],schedule:Schedule[]}|null} */
export function parseResultsFeed(value, today = brazilDate()) {
  if (!object(value) || value.version !== 1 || !Array.isArray(value.results) || value.results.length > 30 || !Array.isArray(value.schedule) || value.schedule.length > 10) return null;
  const results = value.results.map(record => normalizeResult(record, today));
  if (results.some((record, i) => !record || record.fingerprint !== value.results[i].fingerprint) || new Set(results.map(r => r.id)).size !== results.length) return null;
  if (GAME_IDS.some(game => results.filter(r => r.game === game).length > 3)) return null;
  const schedule = value.schedule.filter(record => object(record) && GAME_IDS.includes(record.game) && positiveInteger(record.concurso) && validDate(record.date) && record.date >= today && record.slug === `concurso-${record.concurso}` && record.status === 'confirmed').map(record => ({ game: record.game, concurso: record.concurso, date: record.date, slug: record.slug, status: /** @type {'confirmed'} */ ('confirmed') }));
  if (schedule.length !== value.schedule.length || new Set(schedule.map(r => r.game)).size !== schedule.length) return null;
  return { version: 1, results, schedule };
}

const validID = id => typeof id === 'string' && GAME_IDS.some(game => new RegExp(`^${game}:[1-9]\\d{0,8}$`).test(id));
/** @returns {Baseline} */
export function parseBaseline(raw) {
  const value = decode(raw), empty = { version: /** @type {1} */ (1), followed: [], seen: {}, latest: {} };
  if (!object(value) || value.version !== 1) return empty;
  const seen = {}, latest = {};
  if (object(value.seen)) for (const [id, fp] of Object.entries(value.seen).slice(-100)) if (validID(id) && typeof fp === 'string' && fp.length <= 15000) seen[id] = fp;
  if (object(value.latest)) for (const game of GAME_IDS) if (positiveInteger(value.latest[game])) latest[game] = value.latest[game];
  return { version: 1, followed: favorites(value.followed), seen, latest };
}

/** @returns {{baseline:Baseline,events:ResultEvent[]}} */
export function reconcileResults(rawPrevious, rawRecords, selected) {
  const previous = parseBaseline(rawPrevious), chosen = favorites(selected), followed = new Set(previous.followed);
  const records = rawRecords.map(record => normalizeResult(record)).filter(record => record && chosen.includes(record.game)).sort((a, b) => b.concurso - a.concurso);
  const seen = Object.fromEntries(Object.entries(previous.seen).filter(([id]) => chosen.some(game => id.startsWith(`${game}:`))));
  const latest = Object.fromEntries(Object.entries(previous.latest).filter(([game]) => chosen.includes(game)));
  const events = [];
  for (const result of records) {
    const known = previous.seen[result.id], oldLatest = previous.latest[result.game];
    if (followed.has(result.game) && oldLatest) {
      const kind = known != null && known !== result.fingerprint ? 'corrected' : known == null && result.concurso > oldLatest ? 'new' : null;
      if (kind) events.push({ id: `${kind}|${result.id}|${result.fingerprint}`, kind, result });
    }
    seen[result.id] = result.fingerprint;
    latest[result.game] = Math.max(latest[result.game] ?? 0, result.concurso);
  }
  const boundedSeen = Object.fromEntries(Object.entries(seen).sort(([a], [b]) => Number(b.split(':')[1]) - Number(a.split(':')[1])).slice(0, 100));
  return { baseline: { version: 1, followed: chosen, seen: boundedSeen, latest }, events };
}

/** @returns {ResultEvent[]} */
export function parseInbox(raw) {
  const value = decode(raw);
  if (!object(value) || value.version !== 1 || !Array.isArray(value.events)) return [];
  const events = [], ids = new Set();
  for (const candidate of value.events.slice(0, 300)) {
    if (!object(candidate) || !['new', 'corrected'].includes(candidate.kind)) continue;
    const result = normalizeResult(candidate.result);
    if (!result) continue;
    const id = `${candidate.kind}|${result.id}|${result.fingerprint}`;
    if (id !== candidate.id || ids.has(id)) continue;
    ids.add(id); events.push({ id, kind: candidate.kind, result });
    if (events.length === 100) break;
  }
  return events;
}
/** @returns {ResultEvent[]} */
export function mergeInbox(previous, incoming) { return parseInbox({ version: 1, events: [...incoming, ...previous] }); }
