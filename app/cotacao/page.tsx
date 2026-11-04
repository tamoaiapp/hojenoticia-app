import type { Metadata } from "next";
import Link from "next/link";
import { getCambioLatest, getQuoteTiming, MOEDA_INFO, formatBRL } from "@/lib/cambio";
import AdsterraBanner from "@/components/AdsterraBanner";

export const revalidate = 300;

const BASE = "https://www.hojenoticia.com";

export const metadata: Metadata = {
  title: "Cotações de dólar, euro e criptomoedas em reais",
  description: "Consulte as cotações registradas de dólar, euro, libra, bitcoin e ethereum em reais, com a data dos dados e o histórico disponível.",
  alternates: { canonical: `${BASE}/cotacao` },
};

export default function CotacaoPage() {
  const now = new Date();
  const data = getCambioLatest(now);

  if (!data) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem" }}>
        <h1>Cotações</h1>
        <p>Não há cotações validadas disponíveis para consulta.</p>
      </div>
    );
  }

  const updatedAt = new Date(data.updated_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const pares = Object.values(data.pares);
  const hasPreviousDate = pares.some(par => getQuoteTiming(par.timestamp, now)?.isFromPreviousDate);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cotações de moedas",
    url: `${BASE}/cotacao`,
    itemListElement: pares.map((p, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: p.name,
      url: `${BASE}/cotacao/${MOEDA_INFO[p.code]?.slug ?? p.code.toLowerCase()}`,
    })),
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd).replace(/</g, "\\u003c") }} />

      <AdsterraBanner size="728x90" showOn="desktop" />
      <AdsterraBanner size="320x50" showOn="mobile" />

      <div style={{ marginBottom: "2rem", borderBottom: "4px solid #16a34a", paddingBottom: "1rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a" }}>
          💰 Cotações em reais
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.4rem", fontSize: "1.05rem" }}>
          Valores registrados para dólar, euro, outras moedas e criptoativos.
        </p>
        <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginTop: "0.3rem" }}>
          Coleta deste registro: {updatedAt} (horário de Brasília). Abaixo, cada par mostra o horário da negociação informado pela fonte.
        </p>
        {hasPreviousDate && (
          <p style={{ color: "#92400e", fontSize: "0.9rem", marginTop: "0.6rem" }}>
            Uma ou mais cotações têm negociação registrada pela fonte em data anterior a hoje e podem não refletir os valores neste momento.
          </p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        {pares.map(p => {
          const info = MOEDA_INFO[p.code];
          if (!info) return null;
          const subiu = p.pctChange >= 0;
          const timing = getQuoteTiming(p.timestamp, now);
          return (
            <Link key={p.code} href={`/cotacao/${info.slug}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff", borderRadius: 14, padding: "1.25rem",
                border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", marginBottom: "0.75rem" }}>
                  <span style={{ fontSize: "1.6rem" }}>{info.emoji}</span>
                  <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "1.05rem" }}>{info.nome}</div>
                </div>
                <div style={{ fontSize: "1.6rem", fontWeight: 900, color: info.cor }}>
                  {formatBRL(p.bid)}
                </div>
                <div style={{ marginTop: "0.4rem", display: "flex", justifyContent: "space-between", fontSize: "0.85rem", color: subiu ? "#16a34a" : "#dc2626", fontWeight: 700 }}>
                  <span>{subiu ? "▲" : "▼"} {p.pctChange.toFixed(2)}%</span>
                  <span style={{ color: "#94a3b8", fontWeight: 500 }}>
                    máx {formatBRL(p.high)} / mín {formatBRL(p.low)}
                  </span>
                </div>
                {timing && <p style={{ marginTop: "0.65rem", fontSize: "0.8rem", color: "#475569" }}>Negociação na fonte: <time dateTime={timing.iso}>{timing.formatted}</time> (Brasília).</p>}
                {timing?.isFromPreviousDate && <p style={{ marginTop: "0.4rem", fontSize: "0.82rem", color: "#92400e" }}>Negociação de uma data anterior a hoje.</p>}
              </div>
            </Link>
          );
        })}
      </div>

      <section style={{ background: "#f8fafc", borderRadius: 12, padding: "1.5rem", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem" }}>
          Sobre as cotações
        </h2>
        <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: "0.5rem" }}>
          Os valores são referências informativas fornecidas pela AwesomeAPI. Eles não constituem uma oferta
          de compra ou venda e podem diferir do preço final de uma operação. Consulte o valor e as condições
          oferecidos pela instituição que realizará a transação.
        </p>
        <p style={{ color: "#475569", lineHeight: 1.7 }}>
          Fonte dos valores: <a href="https://docs.awesomeapi.com.br/api-de-moedas" rel="noopener noreferrer" target="_blank" style={{ textDecoration: "underline" }}>AwesomeAPI</a>.
          Os dados podem apresentar atraso; confira a data antes de usar uma cotação como referência.
        </p>
      </section>
    </div>
  );
}
