import fs from "fs";
import path from "path";

const FERIADOS_DIR = path.join(process.cwd(), "content", "feriados");

export interface Feriado {
  data: string;
  nome: string;
  tipo: "nacional" | "estadual" | "municipal";
  facultativo: boolean;
  dia_semana: string;
}

export interface FeriadosAno {
  ano: number;
  atualizado_em: string;
  feriados: Feriado[];
}

export function getFeriadosAno(ano: number): FeriadosAno | null {
  const fp = path.join(FERIADOS_DIR, `${ano}.json`);
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, "utf-8"));
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
