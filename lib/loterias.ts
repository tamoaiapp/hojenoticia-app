import fs from "fs";
import path from "path";
import matter from "gray-matter";

export const LOTERIAS_CONFIG: Record<string, {
  name: string; emoji: string; color: string; ballColor: string;
  numCount: number; apiKey: string; freq: string; description: string;
}> = {
  "mega-sena": {
    name: "Mega-Sena", emoji: "🍀", color: "#209869", ballColor: "#1a7a55",
    numCount: 6, apiKey: "megasena", freq: "Quarta e Sábado",
    description: "O maior prêmio das loterias brasileiras. São sorteados 6 números de 1 a 60.",
  },
  "quina": {
    name: "Quina", emoji: "⭐", color: "#6F3F8E", ballColor: "#5a3275",
    numCount: 5, apiKey: "quina", freq: "Segunda a Sábado",
    description: "5 números de 1 a 80 sorteados diariamente. Acumula frequentemente.",
  },
  "lotofacil": {
    name: "Lotofácil", emoji: "🌸", color: "#930089", ballColor: "#780070",
    numCount: 15, apiKey: "lotofacil", freq: "Todos os dias",
    description: "15 números de 1 a 25. A loteria com maior chance de ganhar.",
  },
  "lotomania": {
    name: "Lotomania", emoji: "🎯", color: "#F78100", ballColor: "#c06500",
    numCount: 20, apiKey: "lotomania", freq: "Segunda, Quarta e Sexta",
    description: "20 números de 0 a 99. Acumula se ninguém acertar os 20.",
  },
  "timemania": {
    name: "Timemania", emoji: "⚽", color: "#00713A", ballColor: "#005a2e",
    numCount: 7, apiKey: "timemania", freq: "Terça, Quinta e Sábado",
    description: "7 números de 1 a 80 mais um time do coração.",
  },
  "diadesorte": {
    name: "Dia de Sorte", emoji: "🍀", color: "#B37009", ballColor: "#8a5607",
    numCount: 7, apiKey: "diadesorte", freq: "Terça, Quinta e Sábado",
    description: "7 números de 1 a 31 mais um mês da sorte.",
  },
  "dupla-sena": {
    name: "Dupla Sena", emoji: "🎲", color: "#D22F27", ballColor: "#a82420",
    numCount: 6, apiKey: "duplasena", freq: "Terça, Quinta e Sábado",
    description: "6 números de 1 a 50 sorteados duas vezes por concurso.",
  },
};

const LOTERIAS_DIR = path.join(process.cwd(), "content", "loterias");

export interface DrawMeta {
  loteria: string;
  concurso: number;
  slug: string;
  status: "aguardando" | "publicado";
  draw_date: string;
  numeros: string[];
  premio_principal: number;
  ganhadores: number;
  cidade?: string;
  proximo_concurso?: number;
  proxima_data?: string;
  proximo_premio?: number;
  title: string;
  description: string;
  keywords: string;
}

export interface Draw extends DrawMeta { content: string; }

function parseDraw(file: string, loteria: string): DrawMeta {
  const slug = file.replace(/\.mdx?$/, "");
  const fp = path.join(LOTERIAS_DIR, loteria, file);
  const { data } = matter(fs.readFileSync(fp, "utf-8"));
  return {
    slug, loteria,
    concurso:         Number(data.concurso ?? 0),
    status:           data.status ?? "aguardando",
    draw_date:        data.draw_date ?? data.date ?? "2026-01-01",
    numeros:          Array.isArray(data.numeros) ? data.numeros : [],
    premio_principal: Number(data.premio_principal ?? 0),
    ganhadores:       Number(data.ganhadores ?? 0),
    cidade:           data.cidade,
    proximo_concurso: data.proximo_concurso ? Number(data.proximo_concurso) : undefined,
    proxima_data:     data.proxima_data,
    proximo_premio:   data.proximo_premio ? Number(data.proximo_premio) : undefined,
    title:            data.title ?? slug,
    description:      data.description ?? "",
    keywords:         data.keywords ?? "",
  };
}

export function getDrawsByLoteria(loteria: string): DrawMeta[] {
  const dir = path.join(LOTERIAS_DIR, loteria);
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter(f => /\.mdx?$/.test(f))
    .map(f => parseDraw(f, loteria))
    .sort((a, b) => b.concurso - a.concurso);
}

export function getAllDraws(): DrawMeta[] {
  if (!fs.existsSync(LOTERIAS_DIR)) return [];
  const all: DrawMeta[] = [];
  for (const lot of fs.readdirSync(LOTERIAS_DIR)) {
    const dir = path.join(LOTERIAS_DIR, lot);
    if (!fs.statSync(dir).isDirectory()) continue;
    if (!LOTERIAS_CONFIG[lot]) continue;
    all.push(...getDrawsByLoteria(lot));
  }
  return all.sort((a, b) => b.draw_date.localeCompare(a.draw_date));
}

export function getLatestDrawPerLoteria(): Record<string, DrawMeta | null> {
  const result: Record<string, DrawMeta | null> = {};
  for (const lot of Object.keys(LOTERIAS_CONFIG)) {
    const draws = getDrawsByLoteria(lot).filter(d => d.status === "publicado");
    result[lot] = draws[0] ?? null;
  }
  return result;
}

export function getDrawBySlug(loteria: string, slug: string): Draw | null {
  for (const ext of [".mdx", ".md"]) {
    const fp = path.join(LOTERIAS_DIR, loteria, slug + ext);
    if (!fs.existsSync(fp)) continue;
    const { data, content } = matter(fs.readFileSync(fp, "utf-8"));
    return { ...parseDraw(slug + ext, loteria), content };
  }
  return null;
}

export function formatBRL(n: number): string {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1).replace(".", ",")} milhões`;
  if (n >= 1_000)     return `R$ ${(n / 1_000).toFixed(0)} mil`;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return dt.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
