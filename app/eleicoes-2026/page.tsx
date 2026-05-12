import type { Metadata } from "next";
import Link from "next/link";
import { ELEICAO_INFO, CARGOS, UFS } from "@/lib/eleicoes-config";
import { getPresidentes } from "@/lib/eleicoes";

export const revalidate = 3600;
const BASE = "https://hojenoticia.com";

export const metadata: Metadata = {
  title: "Eleições 2026 — Presidente, Governadores e Candidatos",
  description:
    "Tudo sobre as Eleições Gerais Brasil 2026: pré-candidatos a presidente, governadores, senadores e deputados. 1º turno: 04/10. 2º turno: 25/10.",
  keywords:
    "eleicoes 2026, eleicao presidencial 2026, candidatos presidente 2026, lula 2026, bolsonaro 2026, eleicao brasil 2026",
  alternates: { canonical: `${BASE}/eleicoes-2026` },
  openGraph: {
    title: "Eleições 2026 — Candidatos e Calendário",
    description: "Pré-candidatos, datas, calendário e cobertura completa.",
    url: `${BASE}/eleicoes-2026`,
    type: "website",
  },
};

export default function EleicoesHub() {
  const presidentes = getPresidentes();

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início",         item: BASE },
      { "@type": "ListItem", position: 2, name: "Eleições 2026",  item: `${BASE}/eleicoes-2026` },
    ],
  };

  const eventLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Eleições Gerais Brasil 2026",
    description: "Eleição para Presidente da República, Governadores, Senadores e Deputados em outubro de 2026.",
    startDate: ELEICAO_INFO.primeiro_turno,
    endDate: ELEICAO_INFO.segundo_turno,
    location: { "@type": "Country", name: "Brasil" },
    organizer: { "@type": "GovernmentOrganization", name: "Tribunal Superior Eleitoral", url: "https://www.tse.jus.br/" },
    url: `${BASE}/eleicoes-2026`,
    eventStatus: "https://schema.org/EventScheduled",
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Quando são as eleições no Brasil em 2026?",
        acceptedAnswer: { "@type": "Answer", text: `O 1º turno será em ${formatDate(ELEICAO_INFO.primeiro_turno)} e o 2º turno (se houver) em ${formatDate(ELEICAO_INFO.segundo_turno)}.` },
      },
      {
        "@type": "Question",
        name: "Quais cargos serão eleitos em 2026?",
        acceptedAnswer: { "@type": "Answer", text: "Em 2026 elege-se Presidente da República, Governador, Senador (1 por estado), Deputados Federais e Deputados Estaduais." },
      },
      {
        "@type": "Question",
        name: "Quando os candidatos são oficializados?",
        acceptedAnswer: { "@type": "Answer", text: `O registro oficial das candidaturas ocorre até ${formatDate(ELEICAO_INFO.prazo_registro)} no TSE. Antes disso, todos os nomes divulgados são pré-candidaturas.` },
      },
      {
        "@type": "Question",
        name: "Quando começa a campanha eleitoral?",
        acceptedAnswer: { "@type": "Answer", text: `A propaganda eleitoral só é permitida a partir de ${formatDate(ELEICAO_INFO.inicio_campanha)}.` },
      },
    ],
  };

  const totalCandidatos = presidentes.candidatos.length;

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav aria-label="Breadcrumb" style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
        <Link href="/" style={{ color: "#2563eb" }}>Início</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <span>Eleições 2026</span>
      </nav>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #009739 0%, #FEDD00 100%)",
        borderRadius: 20, padding: "2.5rem 2rem", color: "#0f172a",
        marginBottom: "2rem",
      }}>
        <div style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 2, marginBottom: "0.5rem", fontWeight: 800 }}>
          🇧🇷 Brasil · 04 de outubro de 2026
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, lineHeight: 1.1, marginBottom: "0.75rem" }}>
          Eleições 2026
        </h1>
        <p style={{ fontSize: "1.05rem", maxWidth: 720, marginBottom: "1.5rem" }}>
          Presidente, Governadores, Senadores e Deputados — cobertura completa de candidatos, propostas
          e resultados.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/eleicoes-2026/presidente" style={pillStyle}>👤 Candidatos a presidente ({totalCandidatos})</Link>
        </div>
      </div>

      {/* Calendário */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1rem", color: "#0f172a" }}>📅 Calendário oficial</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
          {[
            { dt: ELEICAO_INFO.prazo_filiacao,   ev: "Prazo final de filiação partidária" },
            { dt: ELEICAO_INFO.prazo_registro,   ev: "Registro oficial de candidaturas no TSE" },
            { dt: ELEICAO_INFO.inicio_campanha,  ev: "Início da campanha eleitoral" },
            { dt: ELEICAO_INFO.primeiro_turno,   ev: "1º turno",   destaque: true },
            { dt: ELEICAO_INFO.segundo_turno,    ev: "2º turno (se houver)" },
            { dt: ELEICAO_INFO.posse_presidente, ev: "Posse do Presidente" },
          ].map((m) => (
            <div key={m.dt} style={{
              background: m.destaque ? "#dc2626" : "#fff",
              color: m.destaque ? "#fff" : "#0f172a",
              borderRadius: 12, padding: "1rem 1.25rem",
              border: m.destaque ? "none" : "1px solid #e2e8f0",
            }}>
              <div style={{ fontSize: "0.72rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: 1, marginBottom: "0.4rem" }}>
                {formatDate(m.dt)}
              </div>
              <div style={{ fontWeight: 700, fontSize: "0.95rem" }}>{m.ev}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Cargos */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1rem", color: "#0f172a" }}>🗳️ Cargos em disputa</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "0.75rem" }}>
          {CARGOS.map((c) => (
            <div key={c.slug} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1rem" }}>
              <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: "0.4rem" }}>
                {c.escopo}
              </div>
              <div style={{ fontWeight: 700, fontSize: "1rem", color: "#0f172a" }}>{c.nome}</div>
            </div>
          ))}
        </div>
        <p style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "1rem" }}>
          <em>Cobertura por estado em breve.</em>
        </p>
      </section>

      {/* Estados (placeholder) */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, marginBottom: "1rem", color: "#0f172a" }}>🌎 Estados</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {UFS.map((u) => (
            <Link key={u.sigla} href={`/eleicoes-2026/${u.sigla.toLowerCase()}`} style={{
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
              padding: "0.5rem 0.9rem", fontSize: "0.85rem", color: "#0f172a",
              textDecoration: "none", fontWeight: 700,
            }}>
              {u.sigla} · {u.nome}
            </Link>
          ))}
        </div>
      </section>

      <section style={{ background: "#f8fafc", borderRadius: 12, padding: "1.5rem", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.5rem" }}>{presidentes.aviso}</h2>
        <p style={{ color: "#475569", lineHeight: 1.7, fontSize: "0.88rem" }}>
          Fonte dos pré-candidatos: {presidentes.fonte}. Última atualização: {presidentes.ultima_atualizacao}.
        </p>
      </section>
    </div>
  );
}

const pillStyle: React.CSSProperties = {
  display: "inline-block",
  background: "rgba(15,23,42,0.85)",
  color: "#fff",
  padding: "0.55rem 1.1rem",
  borderRadius: 999,
  textDecoration: "none",
  fontWeight: 700,
  fontSize: "0.9rem",
};

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("pt-BR", {
    day: "numeric", month: "long", year: "numeric",
  });
}
