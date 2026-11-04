/** National holiday/reference records; local laws are maintained in the attributed capital catalog. */
import fs from 'node:fs';
import path from 'node:path';
import { isDeepStrictEqual } from 'node:util';
import { buildHolidayCalendar } from '../../lib/holiday-calendar.mjs';

export async function updateFeriados({ root, now = new Date() }) {
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(now);
  const currentYear = Number(today.slice(0, 4));
  const directory = path.join(root, 'content', 'feriados');
  fs.mkdirSync(directory, { recursive: true });
  let changes = 0;
  for (const year of [currentYear, currentYear + 1, currentYear + 2]) {
    const calendar = buildHolidayCalendar(year);
    const feriados = calendar.events.map(event => ({
      data: event.date, nome: event.name, tipo: event.kind, facultativo: false, feriado: event.isHoliday,
      dia_semana: new Date(`${event.date}T12:00:00Z`).toLocaleDateString('pt-BR', { timeZone: 'UTC', weekday: 'long' }),
      fonte: event.source, observacao: event.note,
    }));
    const file = path.join(directory, `${year}.json`);
    let previous;
    try { previous = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { /* A valid generated record repairs an invalid cache. */ }
    if (previous?.ano === year && isDeepStrictEqual(previous.feriados, feriados)) continue;
    const temp = `${file}.tmp-${process.pid}`;
    try {
      fs.writeFileSync(temp, JSON.stringify({ ano: year, atualizado_em: today, feriados }, null, 2));
      fs.renameSync(temp, file);
    } finally { if (fs.existsSync(temp)) fs.unlinkSync(temp); }
    changes++;
  }
  return { changes, summary: changes ? `${changes} calendário(s) atualizados` : 'calendários sem mudança' };
}
