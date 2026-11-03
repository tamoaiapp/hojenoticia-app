import type { Metadata } from "next";
import Link from "next/link";
import { getHoroscopoLatest, SIGNOS_LIST, formatDateBR } from "@/lib/horoscopo";
import AdsterraBanner from "@/components/AdsterraBanner";

export const revalidate = 86400;

const BASE = "https://www.hojenoticia.com";

export const metadata: Metadata = {
  title: "Horóscopo: previsões dos 12 signos",
  description: "Consulte a edição disponível do horóscopo dos 12 signos, com a data da previsão, temas do cotidiano, número e cor da sorte.",
  alternates: { canonical: `${BASE}/horoscopo` },
};

export default function HoroscopoPage() {
  const data = getHoroscopoLatest();
  const dataDia = data ? formatDateBR(data.date) : "";
  const todayISO = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Horóscopo dos 12 signos",
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
          ✨ Horóscopo dos 12 signos
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.4rem", fontSize: "1.05rem" }}>
          {dataDia ? `Edição de ${dataDia}.` : "Escolha um signo para consultar as previsões disponíveis."}
        </p>
        {data && data.date < todayISO && <p style={{ color: "#92400e", marginTop: "0.6rem" }}>A edição disponível é anterior a hoje. A previsão para a data atual ainda não está disponível nesta página.</p>}
        {data && data.date > todayISO && <p style={{ color: "#64748b", marginTop: "0.6rem" }}>Esta edição se refere a uma data futura; confira a data antes de ler.</p>}
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.6rem" }}>Conteúdo de entretenimento produzido com automação.</p>
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
                    <p style={{ color: "#94a3b8", fontSize: "0.88rem" }}>Previsão ainda não disponível.</p>
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
