import type { Metadata } from "next";
import Link from "next/link";
import { getPresidentes, corPosicionamento, labelPosicionamento } from "@/lib/eleicoes";
import { ELEICAO_INFO } from "@/lib/eleicoes-config";

export const revalidate = 3600;
const BASE = "https://hojenoticia.com";

export const metadata: Metadata = {
  title: "Candidatos a Presidente em 2026 — Lista Completa",
  description:
    "Lista atualizada dos pré-candidatos à Presidência da República nas Eleições Brasil 2026: Lula, Flávio Bolsonaro, Caiado, Zema e mais.",
  keywords:
    "candidatos presidente 2026, pre candidatos presidencia 2026, lula 2026, flavio bolsonaro presidente, eleicao presidencial",
  alternates: { canonical: `${BASE}/eleicoes-2026/presidente` },
};

export default function PresidentePage() {
  const { candidatos, fonte, ultima_atualizacao, aviso } = getPresidentes();

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início",                       item: BASE },
      { "@type": "ListItem", position: 2, name: "Eleições 2026",                item: `${BASE}/eleicoes-2026` },
      { "@type": "ListItem", position: 3, name: "Candidatos a Presidente",     item: `${BASE}/eleicoes-2026/presidente` },
    ],
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Pré-candidatos a Presidente da República 2026",
    numberOfItems: candidatos.length,
    itemListElement: candidatos.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Person",
        name: c.nome,
        affiliation: { "@type": "Organization", name: c.partido },
        ...(c.cargo_atual && { jobTitle: c.cargo_atual }),
      },
    })),
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav aria-label="Breadcrumb" style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
        <Link href="/" style={{ color: "#2563eb" }}>Início</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <Link href="/eleicoes-2026" style={{ color: "#2563eb" }}>Eleições 2026</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <span>Presidente</span>
      </nav>

      <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", marginBottom: "0.5rem" }}>
        Candidatos a Presidente — Eleições 2026
      </h1>
      <p style={{ color: "#64748b", fontSize: "1.05rem", marginBottom: "0.5rem" }}>
        {candidatos.length} pré-candidatos anunciados publicamente. 1º turno em{" "}
        <strong>{formatDate(ELEICAO_INFO.primeiro_turno)}</strong>.
      </p>
      <div style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 8, padding: "0.75rem 1rem", marginBottom: "2rem", fontSize: "0.85rem", color: "#78350f" }}>
        ⚠️ {aviso}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: "1rem" }}>
        {candidatos.map((c) => {
          const corPos = corPosicionamento(c.posicionamento);
          const iniciais = c.nome.split(" ").filter(Boolean).map((p) => p[0]).slice(0, 2).join("");
          return (
            <article
              key={c.slug}
              style={{
                background: "#fff", borderRadius: 14,
                border: "1px solid #e2e8f0", overflow: "hidden",
                display: "flex", flexDirection: "column",
              }}
            >
              <div style={{ background: corPos, padding: "1.25rem", color: "#fff", display: "flex", alignItems: "center", gap: "1rem" }}>
                <div style={{
                  width: 64, height: 64, borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontWeight: 900, fontSize: "1.6rem",
                  border: "2px solid rgba(255,255,255,0.5)",
                }}>
                  {iniciais}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "1.15rem", fontWeight: 900, lineHeight: 1.2, marginBottom: "0.2rem" }}>
                    {c.nome}
                  </div>
                  <div style={{ fontSize: "0.82rem", opacity: 0.95 }}>
                    {c.sigla_partido} · {labelPosicionamento(c.posicionamento)}
                  </div>
                </div>
              </div>
              <div style={{ padding: "1rem 1.25rem", flex: 1 }}>
                {c.cargo_atual && (
                  <div style={{ fontSize: "0.85rem", color: "#0f172a", marginBottom: "0.5rem" }}>
                    <strong>Cargo atual:</strong> {c.cargo_atual}
                  </div>
                )}
                {c.estado_origem && (
                  <div style={{ fontSize: "0.85rem", color: "#0f172a", marginBottom: "0.5rem" }}>
                    <strong>Estado:</strong> {c.estado_origem}
                  </div>
                )}
                {c.bio_curta && (
                  <p style={{ color: "#475569", lineHeight: 1.6, fontSize: "0.88rem", margin: "0.5rem 0 0" }}>
                    {c.bio_curta}
                  </p>
                )}
              </div>
              <div style={{ padding: "0.75rem 1.25rem", borderTop: "1px solid #f1f5f9", background: "#f8fafc", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.78rem" }}>
                <span style={{
                  background: c.status === "candidato-confirmado" ? "#16a34a" : c.status === "desistente" ? "#94a3b8" : "#f59e0b",
                  color: "#fff", padding: "0.2rem 0.6rem", borderRadius: 6, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5,
                }}>
                  {c.status === "candidato-confirmado" ? "Confirmado" : c.status === "desistente" ? "Desistiu" : "Pré-candidato"}
                </span>
                {c.data_anuncio && (
                  <span style={{ color: "#94a3b8" }}>Anunciado em {formatDateShort(c.data_anuncio)}</span>
                )}
              </div>
            </article>
          );
        })}
      </div>

      <section style={{ marginTop: "2.5rem", background: "#f8fafc", borderRadius: 12, padding: "1.5rem", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.75rem" }}>Sobre esta lista</h2>
        <p style={{ color: "#475569", lineHeight: 1.7, fontSize: "0.92rem" }}>
          Os nomes acima são <strong>pré-candidaturas</strong> divulgadas publicamente — o registro oficial das
          candidaturas no TSE ocorre até {formatDate(ELEICAO_INFO.prazo_registro)}.
          Fonte: {fonte}. Última atualização: {ultima_atualizacao}.
        </p>
      </section>
    </div>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("pt-BR", {
    day: "numeric", month: "long", year: "numeric",
  });
}
function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
