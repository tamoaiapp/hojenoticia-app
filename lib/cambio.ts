import fs from "fs";
import path from "path";

const CAMBIO_DIR = path.join(process.cwd(), "content", "cambio");

export type QuoteSource = "awesomeapi" | "bcb-ptax" | "binance";

export interface ParCambio {
  code: string;
  from: string;
  to: string;
  name: string;
  bid: number;
  ask: number;
  high: number | null;
  low: number | null;
  varBid: number | null;
  pctChange: number | null;
  timestamp: number;
  create_date: string;
  source?: QuoteSource;
  timestamp_precision?: "day" | "second";
}

export interface HistoricoPoint {
  bid: number;
  timestamp: number;
  date: string;
  source?: QuoteSource;
}

export interface CambioSnapshot {
  updated_at: string;
  date: string;
  pares: Record<string, ParCambio>;
  historico: Record<string, HistoricoPoint[]>;
}

const BRASILIA = "America/Sao_Paulo";
const MAX_SOURCE_CLOCK_SKEW_MS = 300_000;

const QUOTE_SOURCES = {
  awesomeapi: {
    name: "AwesomeAPI",
    url: "https://docs.awesomeapi.com.br/api-de-moedas",
    methodology: "Referências de compra, venda e variação informadas pela AwesomeAPI.",
  },
  "bcb-ptax": {
    name: "Banco Central do Brasil — PTAX",
    url: "https://ptax.bcb.gov.br/ptax_internet/consultarTodasAsMoedas.do?method=consultaTodasMoedas",
    methodology: "Taxa PTAX de fechamento da data indicada. É uma referência diária do Banco Central, não uma cotação intradiária. Máxima, mínima e variação não são informadas neste boletim.",
  },
  binance: {
    name: "Binance — dados públicos de mercado",
    url: "https://developers.binance.com/docs/binance-spot-api-docs/rest-api/market-data-endpoints#24hr-ticker-price-change-statistics",
    methodology: "Compra e venda do mercado em reais na Binance. Máxima e mínima referem-se à janela móvel de 24 horas informada pela fonte. A variação da última negociação não é aplicada ao preço de compra.",
  },
} as const;

export function getQuoteSource(quote: Pick<ParCambio, "source">) {
  return QUOTE_SOURCES[quote.source ?? "awesomeapi"];
}

function record(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validTimestamp(timestamp: unknown, now: Date): timestamp is number {
  return typeof timestamp === "number" && Number.isSafeInteger(timestamp) && timestamp > 0
    && Number.isFinite(new Date(timestamp * 1000).getTime()) && timestamp * 1000 <= now.getTime() + MAX_SOURCE_CLOCK_SKEW_MS;
}

function brasiliaDay(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: BRASILIA, year: "numeric", month: "2-digit", day: "2-digit",
  }).format(date);
}

export function getQuoteTiming(timestamp: number, now = new Date(), precision: "day" | "second" = "second") {
  if (!validTimestamp(timestamp, now)) return null;
  const date = new Date(timestamp * 1000);
  const day = brasiliaDay(date);
  return {
    iso: precision === "day" ? day : date.toISOString(),
    day,
    formatted: precision === "day"
      ? date.toLocaleDateString("pt-BR", { timeZone: BRASILIA })
      : date.toLocaleString("pt-BR", { timeZone: BRASILIA }),
    dateOnly: precision === "day",
    isFromPreviousDate: day < brasiliaDay(now),
  };
}

export function parseCambioSnapshot(value: unknown, now = new Date()): CambioSnapshot | null {
  if (!record(value) || typeof value.updated_at !== "string"
    || !/^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value.updated_at)
    || !record(value.pares)) return null;
  const collectedDay = value.updated_at.slice(0, 10);
  const civilDate = new Date(`${collectedDay}T00:00:00Z`);
  if (!Number.isFinite(civilDate.getTime()) || civilDate.toISOString().slice(0, 10) !== collectedDay) return null;
  const collected = Date.parse(value.updated_at);
  if (!Number.isFinite(collected) || collected > now.getTime()) return null;
  if (typeof value.date !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value.date)
    || !Number.isFinite(Date.parse(value.date)) || new Date(value.date).toISOString().slice(0, 10) !== value.date
    || value.date > brasiliaDay(now)) return null;

  const pares: Record<string, ParCambio> = {};
  const historico: Record<string, HistoricoPoint[]> = {};
  for (const code of Object.keys(MOEDA_INFO)) {
    const par = value.pares[code];
    const [from, to] = code.split("-");
    if (!record(par) || par.code !== code || par.from !== from || par.to !== to
      || typeof par.name !== "string" || !par.name.trim() || typeof par.create_date !== "string"
      || !validTimestamp(par.timestamp, now)) continue;
    const source = par.source === undefined ? "awesomeapi" : par.source;
    if (typeof source !== "string" || !Object.hasOwn(QUOTE_SOURCES, source)) continue;
    if (![par.bid, par.ask].every(n => typeof n === "number" && Number.isFinite(n) && n > 0)) continue;
    if (source === "bcb-ptax") {
      if (!["USD", "EUR", "GBP", "ARS"].includes(from) || par.timestamp_precision !== "day"
        || ![par.high, par.low, par.varBid, par.pctChange].every(n => n === null)) continue;
      const day = brasiliaDay(new Date(par.timestamp * 1000));
      // The CSV supplies a civil date. Midnight is only its storage boundary, never a trading time.
      if (par.create_date !== day || par.timestamp !== Date.parse(`${day}T00:00:00-03:00`) / 1000) continue;
    } else {
      if (par.timestamp_precision !== undefined && par.timestamp_precision !== "second") continue;
      if (source === "binance" && !["BTC", "ETH"].includes(from)) continue;
      const hasVariation = [par.varBid, par.pctChange].every(n => typeof n === "number" && Number.isFinite(n));
      const missingVariation = source === "binance" && par.varBid === null && par.pctChange === null;
      if (![par.high, par.low].every(n => typeof n === "number" && Number.isFinite(n) && n > 0)
        || (!hasVariation && !missingVariation)
        || Number(par.high) < Number(par.low)) continue;
    }
    pares[code] = par as unknown as ParCambio;

    const points = record(value.historico) ? value.historico[code] : undefined;
    historico[code] = Array.isArray(points) ? points.flatMap(point => {
      if (!record(point) || typeof point.bid !== "number" || !Number.isFinite(point.bid) || point.bid <= 0
        || !validTimestamp(point.timestamp, now)
        || (point.source === undefined ? "awesomeapi" : point.source) !== source) return [];
      // Display the source timestamp in Brasilia, including legacy rows whose stored date used UTC.
      return [{ bid: point.bid, timestamp: point.timestamp, date: brasiliaDay(new Date(point.timestamp * 1000)),
        ...(point.source !== undefined ? { source: source as QuoteSource } : {}),
      }];
    }) : [];
  }
  if (!Object.keys(pares).length) return null;
  return { updated_at: value.updated_at, date: value.date, pares, historico };
}

export function getCambioLatest(now = new Date()): CambioSnapshot | null {
  try {
    const fp = path.join(CAMBIO_DIR, "latest.json");
    if (!fs.existsSync(fp)) return null;
    return parseCambioSnapshot(JSON.parse(fs.readFileSync(fp, "utf-8")), now);
  } catch {
    return null;
  }
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
