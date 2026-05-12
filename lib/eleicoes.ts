import fs from "fs";
import path from "path";
import { CandidatoPresidente, UFS } from "./eleicoes-config";

const ELEICOES_DIR = path.join(process.cwd(), "content", "eleicoes-2026");

export interface PresidentesData {
  ultima_atualizacao: string;
  fonte: string;
  aviso: string;
  candidatos: CandidatoPresidente[];
}

export function getPresidentes(): PresidentesData {
  const fp = path.join(ELEICOES_DIR, "presidente.json");
  if (!fs.existsSync(fp)) {
    return { ultima_atualizacao: "", fonte: "", aviso: "", candidatos: [] };
  }
  return JSON.parse(fs.readFileSync(fp, "utf-8")) as PresidentesData;
}

export function getCandidatoPresidenteBySlug(slug: string): CandidatoPresidente | null {
  const data = getPresidentes();
  return data.candidatos.find((c) => c.slug === slug) ?? null;
}

export function corPosicionamento(pos?: string): string {
  switch (pos) {
    case "esquerda":          return "#dc2626";
    case "centro-esquerda":   return "#f97316";
    case "centro":            return "#94a3b8";
    case "centro-direita":    return "#3b82f6";
    case "direita":           return "#1d4ed8";
    default:                  return "#64748b";
  }
}

export function labelPosicionamento(pos?: string): string {
  if (!pos) return "Sem classificação";
  return pos.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join("-");
}

export { UFS };
