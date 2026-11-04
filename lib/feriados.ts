import fs from "fs";
import path from "path";
import { getHolidayCalendar } from "./holiday-store";

const FERIADOS_DIR = path.join(process.cwd(), "content", "feriados");

export interface Feriado {
  data: string;
  nome: string;
  tipo: "nacional" | "estadual" | "municipal" | "referencia" | "comemorativa";
  facultativo: boolean;
  dia_semana: string;
}

export interface FeriadosAno {
  ano: number;
  atualizado_em: string;
  feriados: Feriado[];
}

export function getFeriadosAno(ano: number): FeriadosAno | null {
  const calendar = getHolidayCalendar(ano);
  if (!calendar) return null;
  return {
    ano, atualizado_em: calendar.checkedAt ?? "",
    feriados: calendar.events.map(event => ({ data: event.date, nome: event.name, tipo: event.kind, facultativo: false,
      dia_semana: new Date(`${event.date}T12:00:00Z`).toLocaleDateString("pt-BR", { timeZone: "UTC", weekday: "long" }),
    })),
  };
}

export function getAnosDisponiveis(): number[] {
  if (!fs.existsSync(FERIADOS_DIR)) return [];
  return fs.readdirSync(FERIADOS_DIR)
    .filter(f => /^\d{4}\.json$/.test(f))
    .map(f => Number(f.replace(".json", "")))
    .sort();
}

export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
