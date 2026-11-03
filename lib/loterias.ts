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
  schedule_status?: "confirmed" | "unconfirmed";
  draw_date: string;
  numeros: string[];
  premio_principal: number;
  ganhadores: number;
  acumulou?: boolean;
  cidade?: string;
  proximo_concurso?: number;
  proxima_data?: string;
  proximo_premio?: number;
  title: string;
  description: string;
  keywords: string;
  published_at?: string;
  updated_at?: string;
  source_url?: string;
  source_checked_at?: string;
  rateio?: { faixa: number; descricao: string; ganhadores: number; premio: number }[];
  municipios_ganhadores?: { municipio: string; uf: string; ganhadores: number }[];
  numeros_segundo_sorteio?: string[];
  trevos_sorteados?: string[];
  mes_sorte?: string;
  time_coracao?: string;
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
    schedule_status:  data.schedule_status === "confirmed" || data.schedule_status === "unconfirmed" ? data.schedule_status : undefined,
    draw_date:        data.draw_date ?? data.date ?? "",
    numeros:          Array.isArray(data.numeros) ? data.numeros : [],
    premio_principal: Number(data.premio_principal ?? 0),
    ganhadores:       Number(data.ganhadores ?? 0),
    acumulou:         typeof data.acumulou === "boolean" ? data.acumulou : undefined,
    cidade:           data.cidade,
    proximo_concurso: data.proximo_concurso ? Number(data.proximo_concurso) : undefined,
    proxima_data:     data.proxima_data,
    proximo_premio:   data.proximo_premio ? Number(data.proximo_premio) : undefined,
    title:            data.title ?? slug,
    description:      data.description ?? "",
    keywords:         data.keywords ?? "",
    published_at:     typeof data.published_at === "string" ? data.published_at : undefined,
    updated_at:       typeof data.updated_at === "string" ? data.updated_at : undefined,
    source_url:       typeof data.source_url === "string" ? data.source_url : undefined,
    source_checked_at: typeof data.source_checked_at === "string" ? data.source_checked_at : undefined,
    rateio:           Array.isArray(data.rateio) ? data.rateio : [],
    municipios_ganhadores: Array.isArray(data.municipios_ganhadores) ? data.municipios_ganhadores : [],
    numeros_segundo_sorteio: Array.isArray(data.numeros_segundo_sorteio) ? data.numeros_segundo_sorteio : [],
    trevos_sorteados:   Array.isArray(data.trevos_sorteados) ? data.trevos_sorteados.map(String) : [],
    mes_sorte:         typeof data.mes_sorte === "string" ? data.mes_sorte : undefined,
    time_coracao:     typeof data.time_coracao === "string" ? data.time_coracao : undefined,
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
