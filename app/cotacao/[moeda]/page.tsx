import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCambioLatest, getQuoteSource, getQuoteTiming, MOEDA_INFO, SLUG_TO_CODE, formatBRL } from "@/lib/cambio";
import AdsterraBanner from "@/components/AdsterraBanner";
import AdsterraNative from "@/components/AdsterraNative";

export const revalidate = 300;

const BASE = "https://www.hojenoticia.com";

export function generateStaticParams() {
  return Object.values(MOEDA_INFO).map(m => ({ moeda: m.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ moeda: string }> }): Promise<Metadata> {
  const { moeda } = await params;
  const code = SLUG_TO_CODE[moeda];
  if (!code) return {};
  const info = MOEDA_INFO[code];
  const data = getCambioLatest();
  const par = data?.pares[code];
  const valor = par ? formatBRL(par.bid) : "";
  return {
    title: `Cotação: ${info.nome} em reais`,
    description: `Consulte a cotação registrada de ${info.nome} em reais${valor ? `: ${valor}` : ""}, a data dos dados, a variação informada e o histórico disponível.`,
    alternates: { canonical: `${BASE}/cotacao/${moeda}` },
  };
}

export default async function MoedaPage({ params }: { params: Promise<{ moeda: string }> }) {
  const { moeda } = await params;
  const code = SLUG_TO_CODE[moeda];
  if (!code) notFound();
  const info = MOEDA_INFO[code];
  const now = new Date();
  const data = getCambioLatest(now);
  const par = data?.pares[code];

  if (!data || !par) {
    return (
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem" }}>
        <h1>{info.nome}</h1>
        <p>Não há cotação validada disponível para esta moeda.</p>
      </div>
    );
  }

  const historico = data.historico?.[code] ?? [];
  const subiu = par.pctChange !== null && par.pctChange >= 0;
  const updatedAt = new Date(data.updated_at).toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
  const timing = getQuoteTiming(par.timestamp, now, par.timestamp_precision);
  const source = getQuoteSource(par);

  // Estatísticas do histórico
  const valores = historico.map(h => h.bid).filter(v => v > 0);
  const stats = valores.length ? {
    max: Math.max(...valores),
    min: Math.min(...valores),
    mean: valores.reduce((a, b) => a + b, 0) / valores.length,
  } : null;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: BASE },
      { "@type": "ListItem", position: 2, name: "Cotações", item: `${BASE}/cotacao` },
      { "@type": "ListItem", position: 3, name: info.nome, item: `${BASE}/cotacao/${moeda}` },
    ],
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <AdsterraBanner size="728x90" showOn="desktop" />
      <AdsterraBanner size="320x50" showOn="mobile" />

      <nav style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
        <Link href="/" style={{ color: "#64748b" }}>Início</Link> /{" "}
        <Link href="/cotacao" style={{ color: "#64748b" }}>Cotações</Link> /{" "}
        <span>{info.nome}</span>
      </nav>

      <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: `4px solid ${info.cor}` }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "2.2rem" }}>{info.emoji}</span>
          Cotação: {info.nome}
        </h1>
        <p style={{ color: "#94a3b8", fontSize: "0.82rem", marginTop: "0.4rem" }}>
          Coleta deste registro: {updatedAt} (horário de Brasília).
        </p>
        {timing && <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.3rem" }}>{timing.dateOnly ? "Data do fechamento: " : "Cotação na fonte: "}<time dateTime={timing.iso}>{timing.formatted}</time>{timing.dateOnly ? "." : " (horário de Brasília)."}</p>}
        {timing?.isFromPreviousDate && <p style={{ color: "#92400e", fontSize: "0.9rem", marginTop: "0.6rem" }}>A cotação é de uma data anterior a hoje e pode não refletir os valores neste momento. Referências diárias podem manter o último fechamento em fins de semana e feriados.</p>}
      </div>

      <div style={{ background: "#fff", borderRadius: 14, padding: "1.75rem", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
        <div style={{ fontSize: "0.85rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase", marginBottom: "0.4rem" }}>
          {par.source === "bcb-ptax" ? "Compra PTAX de fechamento" : "Compra informada pela fonte"}
        </div>
        <div style={{ fontSize: "2.8rem", fontWeight: 900, color: info.cor, lineHeight: 1 }}>
          {formatBRL(par.bid)}
        </div>
        {par.pctChange !== null && par.varBid !== null && (
          <div style={{ marginTop: "0.6rem", color: subiu ? "#16a34a" : "#dc2626", fontWeight: 800, fontSize: "1.1rem" }}>
            {subiu ? "▲" : "▼"} {par.pctChange.toFixed(2)}% ({par.varBid >= 0 ? "+" : ""}{par.varBid.toFixed(4)}){par.source === "binance" ? " em 24h" : ""}
          </div>
        )}
        {par.source === "bcb-ptax" && <p style={{ color: "#475569", marginTop: "0.75rem", lineHeight: 1.6 }}>{source.methodology}</p>}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "2rem" }}>
        <Stat label="Compra informada pela fonte" value={formatBRL(par.bid)} />
        <Stat label="Venda informada pela fonte" value={formatBRL(par.ask)} />
        {par.high !== null && <Stat label={par.source === "binance" ? "Máxima em 24h" : "Máxima do dia registrado"} value={formatBRL(par.high)} />}
        {par.low !== null && <Stat label={par.source === "binance" ? "Mínima em 24h" : "Mínima do dia registrado"} value={formatBRL(par.low)} />}
      </div>

      {historico.length > 0 && stats && (
        <section style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.75rem", color: "#0f172a" }}>
            Histórico disponível
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem", marginBottom: "1rem" }}>
            <Stat label="Máxima no histórico" value={formatBRL(stats.max)} />
            <Stat label="Mínima no histórico" value={formatBRL(stats.min)} />
            <Stat label="Média no histórico" value={formatBRL(stats.mean)} />
          </div>
          <p style={{ color: "#64748b", fontSize: "0.85rem", marginBottom: "0.75rem" }}>A tabela mostra até 15 registros disponíveis da mesma fonte: {source.name}. Mudanças de fonte iniciam uma série separada.</p>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
              <thead>
                <tr style={{ background: "#f8fafc", textAlign: "left" }}>
                  <th style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid #e2e8f0" }}>Data</th>
                  <th style={{ padding: "0.5rem 0.75rem", borderBottom: "1px solid #e2e8f0" }}>Cotação</th>
                </tr>
              </thead>
              <tbody>
                {historico.slice(0, 15).map(h => (
                  <tr key={h.timestamp}>
                    <td style={{ padding: "0.45rem 0.75rem", borderBottom: "1px solid #f1f5f9" }}>
                      {h.date.split("-").reverse().join("/")}
                    </td>
                    <td style={{ padding: "0.45rem 0.75rem", borderBottom: "1px solid #f1f5f9", fontWeight: 600 }}>
                      {formatBRL(h.bid)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <section style={{ color: "#475569", lineHeight: 1.7, marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.15rem", color: "#0f172a", marginBottom: "0.5rem" }}>Fonte e uso dos valores</h2>
        <p>
          Fonte: <a href={source.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>{source.name}</a>. {source.methodology}{" "}
          As referências de compra e venda são campos da fonte, não preços oferecidos ao visitante.
          Os dados podem apresentar atraso e não constituem uma oferta de negociação.
        </p>
      </section>

      <AdsterraNative />

      <section style={{ background: "#f8fafc", borderRadius: 12, padding: "1.5rem", border: "1px solid #e2e8f0", marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem" }}>
          Outras cotações
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {Object.values(MOEDA_INFO).filter(m => m.slug !== moeda).map(m => (
            <Link key={m.slug} href={`/cotacao/${m.slug}`}
              style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "0.5rem 0.9rem", textDecoration: "none", color: "#0f172a", fontSize: "0.88rem" }}>
              {m.emoji} {m.nome}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#fff", borderRadius: 10, padding: "0.85rem 1rem", border: "1px solid #e2e8f0" }}>
      <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: "1.05rem", fontWeight: 800, color: "#0f172a", marginTop: "0.15rem" }}>{value}</div>
    </div>
  );
}
