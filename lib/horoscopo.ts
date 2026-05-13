import fs from "fs";
import path from "path";

const HOROSCOPO_DIR = path.join(process.cwd(), "content", "horoscopo");

export interface SignoData {
  slug: string;
  name: string;
  periodo: string;
  elemento: string;
  regente: string;
  geral: string;
  amor: string;
  trabalho: string;
  dinheiro: string;
  saude: string;
  numero_sorte: number;
  cor_sorte: string;
}

export interface HoroscopoDia {
  date: string;
  updated_at: string;
  signos: Record<string, SignoData>;
}

export function getHoroscopoLatest(): HoroscopoDia | null {
  const fp = path.join(HOROSCOPO_DIR, "latest.json");
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, "utf-8"));
}

export const SIGNOS_LIST = [
  { slug: "aries",       name: "Áries",       periodo: "21/03 a 19/04", emoji: "♈", cor: "#dc2626" },
  { slug: "touro",       name: "Touro",       periodo: "20/04 a 20/05", emoji: "♉", cor: "#16a34a" },
  { slug: "gemeos",      name: "Gêmeos",      periodo: "21/05 a 20/06", emoji: "♊", cor: "#eab308" },
  { slug: "cancer",      name: "Câncer",      periodo: "21/06 a 22/07", emoji: "♋", cor: "#0ea5e9" },
  { slug: "leao",        name: "Leão",        periodo: "23/07 a 22/08", emoji: "♌", cor: "#f59e0b" },
  { slug: "virgem",      name: "Virgem",      periodo: "23/08 a 22/09", emoji: "♍", cor: "#84cc16" },
  { slug: "libra",       name: "Libra",       periodo: "23/09 a 22/10", emoji: "♎", cor: "#ec4899" },
  { slug: "escorpiao",   name: "Escorpião",   periodo: "23/10 a 21/11", emoji: "♏", cor: "#7c2d12" },
  { slug: "sagitario",   name: "Sagitário",   periodo: "22/11 a 21/12", emoji: "♐", cor: "#9333ea" },
  { slug: "capricornio", name: "Capricórnio", periodo: "22/12 a 19/01", emoji: "♑", cor: "#475569" },
  { slug: "aquario",     name: "Aquário",     periodo: "20/01 a 18/02", emoji: "♒", cor: "#06b6d4" },
  { slug: "peixes",      name: "Peixes",      periodo: "19/02 a 20/03", emoji: "♓", cor: "#6366f1" },
];

export function formatDateBR(iso: string): string {
  const [y, m, d] = iso.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d))
    .toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}
