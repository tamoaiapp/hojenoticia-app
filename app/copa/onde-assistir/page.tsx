import type { Metadata } from "next";
import Link from "next/link";
import { ONDE_ASSISTIR, COPA_INFO } from "@/lib/copa-config";

export const revalidate = 86400;
const BASE = "https://hojenoticia.com";

export const metadata: Metadata = {
  title: "Onde Assistir a Copa do Mundo 2026 — TV e Streaming",
  description:
    "Guia completo de onde assistir aos jogos da Copa do Mundo FIFA 2026 no Brasil: TV Globo, SporTV, Globoplay, FIFA+. Comparativo de preços e cobertura.",
  keywords:
    "onde assistir copa 2026, copa do mundo ao vivo, globoplay copa 2026, sportv copa, fifa+ copa, assistir brasil copa",
  alternates: { canonical: `${BASE}/copa/onde-assistir` },
  openGraph: {
    title: "Onde Assistir a Copa do Mundo 2026",
    description: "Guia completo: TV Globo, SporTV, Globoplay, FIFA+.",
    url: `${BASE}/copa/onde-assistir`,
    type: "article",
  },
};

export default function OndeAssistirPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início",             item: BASE },
      { "@type": "ListItem", position: 2, name: "Copa do Mundo 2026", item: `${BASE}/copa` },
      { "@type": "ListItem", position: 3, name: "Onde Assistir",      item: `${BASE}/copa/onde-assistir` },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Posso assistir a Copa do Mundo 2026 de graça?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Sim. A TV Globo transmite gratuitamente em canal aberto os jogos do Brasil e jogos selecionados. O FIFA+ também oferece highlights e replays gratuitos. Para todos os 104 jogos ao vivo, é necessário ter Globoplay ou TV por assinatura com SporTV.",
        },
      },
      {
        "@type": "Question",
        name: "Quanto custa a assinatura do Globoplay para a Copa 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "O Globoplay tem planos a partir de R$ 24,90/mês (plano básico com anúncios) e R$ 39,90/mês (Premium sem anúncios). Verifique os valores atuais no site oficial.",
        },
      },
      {
        "@type": "Question",
        name: "O FIFA+ transmite jogos ao vivo da Copa 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "O FIFA+ exibe highlights, replays e conteúdo oficial da FIFA gratuitamente. Para jogos ao vivo no Brasil, os direitos pertencem ao Grupo Globo (TV Globo, SporTV e Globoplay).",
        },
      },
    ],
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <nav aria-label="Breadcrumb" style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
        <Link href="/" style={{ color: "#2563eb" }}>Início</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <Link href="/copa" style={{ color: "#2563eb" }}>Copa 2026</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <span>Onde Assistir</span>
      </nav>

      <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", marginBottom: "0.5rem" }}>
        Onde Assistir a Copa do Mundo 2026
      </h1>
      <p style={{ color: "#64748b", fontSize: "1.05rem", marginBottom: "2rem" }}>
        Tudo sobre como acompanhar os {COPA_INFO.total_jogos} jogos no Brasil — TV aberta, paga e streaming.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem", marginBottom: "2rem" }}>
        {ONDE_ASSISTIR.map((c) => {
          const afiliadoUrl = c.afiliado_env
            ? process.env[c.afiliado_env]
            : undefined;
          const href = afiliadoUrl ?? c.url_base;
          const isAfiliado = Boolean(afiliadoUrl);
          return (
            <a
              key={c.nome}
              href={href}
              target="_blank"
              rel={isAfiliado ? "sponsored noopener" : "noopener"}
              style={{
                display: "flex", gap: "1rem", alignItems: "stretch",
                background: "#fff", borderRadius: 14,
                border: `2px solid ${c.cor}33`, padding: "1.25rem",
                textDecoration: "none", color: "inherit",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}
            >
              <div style={{
                background: c.cor, color: "#fff",
                width: 70, minHeight: 70, borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "2rem", flexShrink: 0,
              }}>
                {c.logo}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: "0.6rem", marginBottom: "0.25rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "1.2rem", fontWeight: 800, color: c.cor }}>{c.nome}</span>
                  <span style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5 }}>
                    {c.tipo}
                  </span>
                </div>
                <div style={{ fontSize: "0.9rem", color: "#475569", marginBottom: "0.4rem" }}>
                  <strong>{c.preco}</strong> · {c.cobertura}
                </div>
                <div style={{ fontSize: "0.82rem", color: c.cor, fontWeight: 700 }}>
                  Acessar {c.nome} →
                </div>
              </div>
            </a>
          );
        })}
      </div>

      <section style={{ background: "#f8fafc", borderRadius: 12, padding: "1.5rem", border: "1px solid #e2e8f0", marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.75rem" }}>
          Qual escolher?
        </h2>
        <ul style={{ color: "#475569", lineHeight: 1.8, fontSize: "0.92rem", paddingLeft: "1.25rem" }}>
          <li><strong>Só os jogos do Brasil</strong> — TV Globo gratuita basta.</li>
          <li><strong>Todos os jogos ao vivo</strong> — Globoplay (streaming) ou TV por assinatura com SporTV.</li>
          <li><strong>Highlights e replays</strong> — FIFA+ é gratuito e oficial.</li>
          <li><strong>Mobile/celular</strong> — Globoplay funciona em iOS e Android.</li>
        </ul>
      </section>

      <p style={{ fontSize: "0.75rem", color: "#94a3b8", textAlign: "center", marginTop: "1.5rem" }}>
        Alguns links nesta página são patrocinados — ao assinar pelos links, você apoia o site sem pagar mais por isso.
      </p>
    </div>
  );
}
