import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { LOTERIAS_CONFIG } from "./loterias-config";

export { LOTERIAS_CONFIG, formatBRL, formatDate, formatDateShort } from "./loterias-config";

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
