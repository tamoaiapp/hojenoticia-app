import type { Metadata } from "next";
import Link from "next/link";
import { GRUPOS } from "@/lib/copa-config";

export const revalidate = 3600;
const BASE = "https://hojenoticia.com";

export const metadata: Metadata = {
  title: "Grupos da Copa do Mundo 2026 — Tabela Completa",
  description:
    "Veja todos os 12 grupos da Copa do Mundo FIFA 2026: A, B, C, D, E, F, G, H, I, J, K e L com as 48 seleções classificadas.",
  keywords: "grupos copa 2026, copa do mundo grupos, grupo brasil copa 2026, tabela copa 2026",
  alternates: { canonical: `${BASE}/copa/grupos` },
};

export default function GruposPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início",             item: BASE },
      { "@type": "ListItem", position: 2, name: "Copa do Mundo 2026", item: `${BASE}/copa` },
      { "@type": "ListItem", position: 3, name: "Grupos",             item: `${BASE}/copa/grupos` },
    ],
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav aria-label="Breadcrumb" style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
        <Link href="/" style={{ color: "#2563eb" }}>Início</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <Link href="/copa" style={{ color: "#2563eb" }}>Copa 2026</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <span>Grupos</span>
      </nav>

      <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", marginBottom: "0.5rem" }}>
        Grupos da Copa do Mundo 2026
      </h1>
      <p style={{ color: "#64748b", fontSize: "1.05rem", marginBottom: "2rem" }}>
        12 grupos, 4 seleções cada — sorteio realizado pela FIFA em dezembro de 2025.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
        {GRUPOS.map((g) => {
          const temBrasil = g.times.some((t) => t.nome === "Brasil");
          return (
            <div key={g.letra} style={{
              background: "#fff", borderRadius: 14,
              border: temBrasil ? "2px solid #009739" : "1px solid #e2e8f0",
              overflow: "hidden",
            }}>
              <div style={{
                background: temBrasil ? "#009739" : "#1e293b",
                color: "#fff", padding: "0.75rem 1.25rem",
                fontWeight: 800, fontSize: "1rem",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <span>Grupo {g.letra}</span>
                {temBrasil && <span style={{ fontSize: "0.75rem", opacity: 0.9 }}>com 🇧🇷 Brasil</span>}
              </div>
              <div style={{ padding: "0.5rem 0" }}>
                {g.times.map((t, i) => (
                  <div key={t.codigo} style={{
                    display: "flex", alignItems: "center", gap: "0.75rem",
                    padding: "0.6rem 1.25rem",
                    borderTop: i > 0 ? "1px solid #f1f5f9" : "none",
                    background: t.nome === "Brasil" ? "#f0fdf4" : "transparent",
                  }}>
                    <span style={{ fontSize: "1.6rem" }}>{t.bandeira}</span>
                    <span style={{ fontWeight: t.nome === "Brasil" ? 800 : 600, color: "#0f172a", fontSize: "0.95rem" }}>
                      {t.nome}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "2.5rem", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>Como funciona a fase de grupos</h2>
        <p style={{ color: "#475569", lineHeight: 1.7, fontSize: "0.92rem" }}>
          Cada um dos 12 grupos disputa 6 jogos na primeira fase (todos contra todos). As 2 melhores
          seleções de cada grupo avançam diretamente, somadas às 8 melhores 3ªs colocadas — totalizando{" "}
          <strong>32 classificados</strong> para a fase de mata-mata.
        </p>
      </div>
    </div>
  );
}
