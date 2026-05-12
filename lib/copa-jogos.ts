import fs from "fs";
import path from "path";
import { GRUPOS, type Grupo } from "./copa-config";

const COPA_DIR = path.join(process.cwd(), "content", "copa");

export type Fase =
  | "grupos"
  | "oitavas-32"
  | "oitavas"
  | "quartas"
  | "semifinal"
  | "terceiro"
  | "final";

export interface Jogo {
  id: number;
  fase: Fase;
  grupo?: string;
  data: string;            // YYYY-MM-DD
  horario_brasilia: string; // HH:MM
  estadio: string;
  cidade: string;
  pais: "US" | "CA" | "MX";
  time1: string;
  time2: string;
  score1?: number;
  score2?: number;
  status?: "agendado" | "ao-vivo" | "encerrado";
}

export interface JogosData {
  ultima_atualizacao: string;
  fonte: string;
  aviso: string;
  fuso_referencia: string;
  jogos: Jogo[];
}

export function getJogos(): JogosData {
  const fp = path.join(COPA_DIR, "jogos.json");
  if (!fs.existsSync(fp)) {
    return {
      ultima_atualizacao: "",
      fonte: "",
      aviso: "",
      fuso_referencia: "America/Sao_Paulo",
      jogos: [],
    };
  }
  return JSON.parse(fs.readFileSync(fp, "utf-8")) as JogosData;
}

export function getJogoById(id: number): Jogo | null {
  return getJogos().jogos.find((j) => j.id === id) ?? null;
}

export function getJogosBrasil(): Jogo[] {
  return getJogos().jogos.filter(
    (j) => j.time1 === "Brasil" || j.time2 === "Brasil",
  );
}

export function getProximosJogos(limit = 10): Jogo[] {
  const hoje = new Date().toISOString().split("T")[0];
  return getJogos()
    .jogos.filter((j) => j.data >= hoje)
    .sort((a, b) => (a.data + a.horario_brasilia).localeCompare(b.data + b.horario_brasilia))
    .slice(0, limit);
}

export function getJogosPorGrupo(grupo: string): Jogo[] {
  return getJogos().jogos.filter((j) => j.grupo === grupo);
}

export function getBandeiraDoTime(nome: string): string {
  for (const g of GRUPOS) {
    const t = g.times.find((t) => t.nome === nome);
    if (t) return t.bandeira;
  }
  return "⚽";
}

export function formatData(iso: string): string {
  const [y, m, d] = iso.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
}

export function formatDataLonga(iso: string): string {
  const [y, m, d] = iso.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function nomeFase(fase: Fase): string {
  switch (fase) {
    case "grupos":     return "Fase de Grupos";
    case "oitavas-32": return "16-avos (Round of 32)";
    case "oitavas":    return "Oitavas de Final";
    case "quartas":    return "Quartas de Final";
    case "semifinal":  return "Semifinal";
    case "terceiro":   return "Disputa do 3º Lugar";
    case "final":      return "Final";
  }
}

export { GRUPOS };
export type { Grupo };
