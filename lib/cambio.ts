import fs from "fs";
import path from "path";

const CAMBIO_DIR = path.join(process.cwd(), "content", "cambio");

export interface ParCambio {
  code: string;
  from: string;
  to: string;
  name: string;
  bid: number;
  ask: number;
  high: number;
  low: number;
  varBid: number;
  pctChange: number;
  timestamp: number;
  create_date: string;
}

export interface HistoricoPoint {
  bid: number;
  timestamp: number;
  date: string;
}

export interface CambioSnapshot {
  updated_at: string;
  date: string;
  pares: Record<string, ParCambio>;
  historico: Record<string, HistoricoPoint[]>;
}

export function getCambioLatest(): CambioSnapshot | null {
  const fp = path.join(CAMBIO_DIR, "latest.json");
  if (!fs.existsSync(fp)) return null;
  return JSON.parse(fs.readFileSync(fp, "utf-8"));
}

export const MOEDA_INFO: Record<string, { slug: string; nome: string; emoji: string; cor: string }> = {
  "USD-BRL": { slug: "dolar",   nome: "Dólar Americano",      emoji: "🇺🇸", cor: "#16a34a" },
  "EUR-BRL": { slug: "euro",    nome: "Euro",                 emoji: "🇪🇺", cor: "#1e40af" },
  "GBP-BRL": { slug: "libra",   nome: "Libra Esterlina",      emoji: "🇬🇧", cor: "#7c3aed" },
  "ARS-BRL": { slug: "peso-argentino", nome: "Peso Argentino", emoji: "🇦🇷", cor: "#0ea5e9" },
  "BTC-BRL": { slug: "bitcoin", nome: "Bitcoin",              emoji: "₿",  cor: "#f59e0b" },
  "ETH-BRL": { slug: "ethereum", nome: "Ethereum",            emoji: "Ξ",  cor: "#6366f1" },
};

export const SLUG_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(MOEDA_INFO).map(([code, info]) => [info.slug, code])
);

export function formatBRL(n: number): string {
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 2, maximumFractionDigits: 4 });
}
