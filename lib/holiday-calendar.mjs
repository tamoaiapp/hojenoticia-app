/** Civil-date calendar. Legal holidays and reference dates have different meanings. */
export const CAPITALS = [
  ['rio-branco-ac', 'Rio Branco', 'AC', 'America/Rio_Branco'], ['maceio-al', 'Maceió', 'AL', 'America/Maceio'],
  ['macapa-ap', 'Macapá', 'AP', 'America/Belem'], ['manaus-am', 'Manaus', 'AM', 'America/Manaus'],
  ['salvador-ba', 'Salvador', 'BA', 'America/Bahia'], ['fortaleza-ce', 'Fortaleza', 'CE', 'America/Fortaleza'],
  ['brasilia-df', 'Brasília', 'DF', 'America/Sao_Paulo'], ['vitoria-es', 'Vitória', 'ES', 'America/Sao_Paulo'],
  ['goiania-go', 'Goiânia', 'GO', 'America/Sao_Paulo'], ['sao-luis-ma', 'São Luís', 'MA', 'America/Fortaleza'],
  ['cuiaba-mt', 'Cuiabá', 'MT', 'America/Cuiaba'], ['campo-grande-ms', 'Campo Grande', 'MS', 'America/Campo_Grande'],
  ['belo-horizonte-mg', 'Belo Horizonte', 'MG', 'America/Sao_Paulo'], ['belem-pa', 'Belém', 'PA', 'America/Belem'],
  ['joao-pessoa-pb', 'João Pessoa', 'PB', 'America/Fortaleza'], ['curitiba-pr', 'Curitiba', 'PR', 'America/Sao_Paulo'],
  ['recife-pe', 'Recife', 'PE', 'America/Recife'], ['teresina-pi', 'Teresina', 'PI', 'America/Fortaleza'],
  ['rio-de-janeiro-rj', 'Rio de Janeiro', 'RJ', 'America/Sao_Paulo'], ['natal-rn', 'Natal', 'RN', 'America/Fortaleza'],
  ['porto-alegre-rs', 'Porto Alegre', 'RS', 'America/Sao_Paulo'], ['porto-velho-ro', 'Porto Velho', 'RO', 'America/Porto_Velho'],
  ['boa-vista-rr', 'Boa Vista', 'RR', 'America/Boa_Vista'], ['florianopolis-sc', 'Florianópolis', 'SC', 'America/Sao_Paulo'],
  ['sao-paulo-sp', 'São Paulo', 'SP', 'America/Sao_Paulo'], ['aracaju-se', 'Aracaju', 'SE', 'America/Maceio'],
  ['palmas-to', 'Palmas', 'TO', 'America/Araguaina'],
].map(([slug, name, uf, timeZone]) => ({ slug, name, uf, timeZone }));
export const BRAZIL = { slug: 'brasil', name: 'Brasil — cobertura nacional', uf: '', timeZone: 'America/Sao_Paulo' };
export const HOLIDAY_KIND_LABELS = { nacional: 'Feriado nacional', estadual: 'Feriado estadual', municipal: 'Feriado municipal', referencia: 'Referência de calendário', comemorativa: 'Data comemorativa' };
const FEDERAL = { title: 'Lei Federal 10.607/2002', url: 'https://www2.camara.leg.br/legin/fed/lei/2002/lei-10607-19-dezembro-2002-473572-publicacaooriginal-1-pl.html' };
const APARECIDA = { title: 'Lei Federal 6.802/1980', url: 'https://www.planalto.gov.br/ccivil_03/leis/l6802.htm' };
const CONSCIENCIA = { title: 'Lei Federal 14.759/2023', url: 'https://www2.camara.leg.br/legin/fed/lei/2023/lei-14759-21-dezembro-2023-795091-norma-pl.html' };
const LOCAL = { title: 'Lei Federal 9.093/1995 — feriados locais', url: 'https://legis.senado.gov.br/norma/550969/publicacao/15650123' };
const DAY = 86_400_000;

export function parseCivilDate(iso) {
  if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) throw new Error('Informe uma data válida no formato ano-mês-dia.');
  const date = new Date(`${iso}T00:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== iso) throw new Error('A data informada não existe no calendário.');
  return date;
}
export function addCivilDays(iso, days) {
  if (!Number.isSafeInteger(days)) throw new Error('Quantidade de dias inválida.');
  return new Date(parseCivilDate(iso).getTime() + days * DAY).toISOString().slice(0, 10);
}
export function easterDate(year) {
  if (!Number.isInteger(year) || year < 1900 || year > 2199) throw new Error('Ano fora do intervalo do calendário.');
  const a = year % 19, b = Math.floor(year / 100), c = year % 100;
  const d = Math.floor(b / 4), e = b % 4, f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30, i = Math.floor(c / 4), k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), day = (h + l - 7 * m + 114) % 31 + 1;
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}
export function calendarLocation(slug = 'brasil') {
  return slug === 'brasil' ? BRAZIL : CAPITALS.find(city => city.slug === slug) ?? null;
}

export function buildHolidayCalendar(year, slug = 'brasil', catalog = {}) {
  if (!Number.isInteger(year) || year < 2026 || year > 2100) throw new Error('Ano fora do intervalo do calendário.');
  const location = calendarLocation(slug);
  if (!location) throw new Error('Capital não encontrada.');
  const easter = easterDate(year);
  const events = new Map();
  const put = (id, date, name, kind, source, note = '') => {
    parseCivilDate(date);
    events.set(id, { id, date, name, kind, isHoliday: ['nacional', 'estadual', 'municipal'].includes(kind), source, note });
  };
  for (const [id, monthDay, name, source] of [
    ['ano-novo', '01-01', 'Confraternização Universal', FEDERAL], ['tiradentes', '04-21', 'Tiradentes', FEDERAL],
    ['trabalho', '05-01', 'Dia do Trabalhador', FEDERAL], ['independencia', '09-07', 'Independência do Brasil', FEDERAL],
    ['aparecida', '10-12', 'Nossa Senhora Aparecida', APARECIDA], ['finados', '11-02', 'Finados', FEDERAL],
    ['republica', '11-15', 'Proclamação da República', FEDERAL], ['consciencia-negra', '11-20', 'Dia Nacional de Zumbi e da Consciência Negra', CONSCIENCIA],
    ['natal', '12-25', 'Natal', FEDERAL],
  ]) put(id, `${year}-${monthDay}`, name, 'nacional', source);
  for (const [id, offset, name] of [['carnaval-segunda', -48, 'Carnaval (segunda-feira)'], ['carnaval', -47, 'Carnaval (terça-feira)'], ['paixao', -2, 'Sexta-feira da Paixão'], ['corpus', 60, 'Corpus Christi']]) {
    put(id, addCivilDays(easter, offset), name, 'referencia', LOCAL, 'Data calculada como referência. O enquadramento local e o expediente dependem de lei ou ato aplicável. Não é descontada automaticamente como feriado nacional.');
  }
  put('pascoa', easter, 'Páscoa', 'comemorativa', LOCAL, 'Data comemorativa; não representa, por si só, um feriado nacional adicional.');
  const entry = catalog.locations?.[slug];
  let localCount = 0;
  for (const rule of entry?.rules ?? []) {
    if (!rule || !['estadual', 'municipal'].includes(rule.kind) || !/^[a-z0-9-]{1,80}$/.test(rule.id ?? '') || !rule.name?.trim() || !rule.source?.title || !/^https:\/\//.test(rule.source?.url ?? '')) throw new Error(`Regra local inválida: ${slug}.`);
    if (rule.years && (!Array.isArray(rule.years) || !rule.years.every(value => Number.isInteger(value) && value >= 2026 && value <= 2100))) throw new Error(`Vigência local inválida: ${slug}.`);
    if (rule.years && !rule.years.includes(year)) continue;
    if (events.get(rule.id)?.kind === 'nacional') continue;
    let date;
    if (Number.isSafeInteger(rule.easterOffset) && Math.abs(rule.easterOffset) < 100) date = addCivilDays(easter, rule.easterOffset);
    else if (Number.isSafeInteger(rule.month) && Number.isSafeInteger(rule.day)) date = `${year}-${String(rule.month).padStart(2, '0')}-${String(rule.day).padStart(2, '0')}`;
    else throw new Error(`Data local inválida: ${slug}.`);
    // Statutory transfers (for example the SC state day) may move to a Sunday.
    if (rule.transferToNextSunday) date = addCivilDays(date, (7 - parseCivilDate(date).getUTCDay()) % 7);
    put(rule.id, date, rule.name, rule.kind, rule.source, rule.note ?? '');
    localCount++;
  }
  const sorted = [...events.values()].sort((a, b) => a.date.localeCompare(b.date) || a.name.localeCompare(b.name, 'pt-BR'));
  return {
    year, location, checkedAt: catalog.checked_at ?? null, events: sorted, localCount,
    coverageNote: slug === 'brasil'
      ? 'Cobertura nacional. Feriados estaduais, municipais e expedientes de órgãos ou empresas não estão incluídos nesta seleção.'
      : entry?.note ?? 'Feriados nacionais incluídos. A cobertura estadual e municipal desta capital ainda não foi verificada; confira o calendário oficial local.',
    sources: [...new Map(sorted.map(event => [event.source.url, event.source])).values()],
  };
}

export function countBusinessDays({ start, end, calendars, includeStart = false, includeEnd = true, saturdayIsWorking = false, includeReferenceDates = false, extraDates = /** @type {string[]} */ ([]) }) {
  const from = parseCivilDate(start).getTime(), through = parseCivilDate(end).getTime();
  if (from > through) throw new Error('A data final precisa ser igual ou posterior à inicial.');
  if (through - from > 1096 * DAY) throw new Error('Escolha um intervalo de até três anos.');
  if (!Array.isArray(calendars) || !calendars.length) throw new Error('O calendário ainda não foi carregado.');
  const years = new Set(calendars.map(calendar => calendar.year));
  for (let year = Number(start.slice(0, 4)); year <= Number(end.slice(0, 4)); year++) if (!years.has(year)) throw new Error(`Calendário de ${year} indisponível.`);
  const closures = new Map();
  for (const calendar of calendars) for (const event of calendar.events) {
    if (event.isHoliday || includeReferenceDates && event.kind === 'referencia') {
      const existing = closures.get(event.date);
      closures.set(event.date, { names: [...(existing?.names ?? []), event.name], manual: false });
    }
  }
  if (!Array.isArray(extraDates) || extraDates.length > 100) throw new Error('Informe até 100 datas adicionais.');
  for (const value of new Set(extraDates)) {
    parseCivilDate(value);
    if (!closures.has(value)) closures.set(value, { names: ['Folga informada por você'], manual: true });
  }
  const excluded = [];
  let considered = 0, working = 0, weekends = 0, holidays = 0, manual = 0;
  for (let current = from; current <= through; current += DAY) {
    if (current === from && !includeStart || current === through && !includeEnd) continue;
    considered++;
    const date = new Date(current), iso = date.toISOString().slice(0, 10), day = date.getUTCDay();
    if (day === 0 || day === 6 && !saturdayIsWorking) { weekends++; continue; }
    const closure = closures.get(iso);
    if (closure) {
      if (closure.manual) manual++; else holidays++;
      excluded.push({ date: iso, reason: closure.names.join('; ') });
    } else working++;
  }
  return { considered, working, weekends, holidays, manual, excluded };
}

export function escapeCalendarText(value) {
  return String(value).replace(/\\/g, '\\\\').replace(/\r\n|\r|\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
}
export function foldCalendarLine(value) {
  const encoder = new TextEncoder();
  const lines = [];
  let line = '', octets = 0;
  for (const character of value) {
    const length = encoder.encode(character).length;
    if (octets + length > 75) { lines.push(line); line = ' '; octets = 1; }
    line += character; octets += length;
  }
  lines.push(line);
  return lines.join('\r\n');
}
export function holidayCalendarIcs(calendar, { now = new Date(), includeReferences = false } = {}) {
  if (!Number.isFinite(now.getTime())) throw new Error('Data de exportação inválida.');
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
  const path = `/feriados/${calendar.year}${calendar.location.slug === 'brasil' ? '' : `/${calendar.location.slug}`}`;
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Hoje Noticia//Calendario de feriados//PT-BR', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH', `X-WR-CALNAME:${escapeCalendarText(`Feriados ${calendar.location.name} ${calendar.year}`)}`];
  for (const event of calendar.events.filter(event => event.isHoliday || includeReferences)) {
    lines.push('BEGIN:VEVENT', `UID:${calendar.location.slug}-${calendar.year}-${event.id}@hojenoticia.com`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${event.date.replaceAll('-', '')}`, `DTEND;VALUE=DATE:${addCivilDays(event.date, 1).replaceAll('-', '')}`, `SUMMARY:${escapeCalendarText(event.name)}`, `DESCRIPTION:${escapeCalendarText(`${HOLIDAY_KIND_LABELS[event.kind]}. ${event.note} Fonte: ${event.source.title} — ${event.source.url}`)}`, `URL:https://www.hojenoticia.com${path}`, `STATUS:${event.isHoliday ? 'CONFIRMED' : 'TENTATIVE'}`, 'TRANSP:TRANSPARENT', 'END:VEVENT');
  }
  lines.push('END:VCALENDAR');
  return lines.map(foldCalendarLine).join('\r\n') + '\r\n';
}
