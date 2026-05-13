import type { Metadata } from "next";
import Link from "next/link";
import { getHoroscopoLatest, SIGNOS_LIST, formatDateBR } from "@/lib/horoscopo";
import AdsterraBanner from "@/components/AdsterraBanner";

export const revalidate = 86400;

const BASE = "https://hojenoticia.com";

export const metadata: Metadata = {
  title: "Horóscopo do Dia — Previsão dos 12 Signos | Hoje Notícia",
  description: "Horóscopo do dia para os 12 signos: amor, trabalho, dinheiro, saúde, número e cor da sorte. Atualizado diariamente.",
  keywords: "horoscopo do dia, horoscopo hoje, previsão signos, áries hoje, touro hoje, gêmeos hoje",
  alternates: { canonical: `${BASE}/horoscopo` },
};

export default function HoroscopoPage() {
  const data = getHoroscopoLatest();
  const dataDia = data ? formatDateBR(data.date) : "";

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Horóscopo do dia",
    url: `${BASE}/horoscopo`,
    itemListElement: SIGNOS_LIST.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      url: `${BASE}/horoscopo/${s.slug}`,
    })),
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />

      <AdsterraBanner size="728x90" showOn="desktop" />
      <AdsterraBanner size="320x50" showOn="mobile" />

      <div style={{ marginBottom: "2rem", borderBottom: "4px solid #7c3aed", paddingBottom: "1rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a" }}>
          ✨ Horóscopo do Dia
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.4rem", fontSize: "1.05rem" }}>
          Previsão dos 12 signos para {dataDia || "hoje"}.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
        {SIGNOS_LIST.map(s => {
          const signo = data?.signos[s.slug];
          return (
            <Link key={s.slug} href={`/horoscopo/${s.slug}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff", borderRadius: 14, overflow: "hidden",
                border: "1px solid #e2e8f0", boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
              }}>
                <div style={{ background: s.cor, color: "#fff", padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.8rem" }}>{s.emoji}</span>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: "1.05rem" }}>{s.name}</div>
                    <div style={{ fontSize: "0.78rem", opacity: 0.85 }}>{s.periodo}</div>
                  </div>
                </div>
                <div style={{ padding: "1rem 1.25rem" }}>
                  {signo ? (
                    <p style={{ color: "#475569", fontSize: "0.88rem", lineHeight: 1.55, margin: 0 }}>
                      {signo.geral.length > 130 ? signo.geral.slice(0, 130) + "…" : signo.geral}
                    </p>
                  ) : (
                    <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>Previsão em instantes...</p>
                  )}
                  <div style={{ marginTop: "0.75rem", fontSize: "0.82rem", color: s.cor, fontWeight: 700 }}>
                    Ver previsão completa →
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
