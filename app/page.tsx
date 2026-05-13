import type { Metadata } from "next";
import Link from "next/link";
import { LOTERIAS_CONFIG, getLatestDrawPerLoteria, getAllDraws, formatBRL, formatDateShort } from "@/lib/loterias";
import AdsterraBanner from "@/components/AdsterraBanner";
import AdsterraNative from "@/components/AdsterraNative";

export const revalidate = 86400;

const BASE = "https://hojenoticia.com";

export const metadata: Metadata = {
  title: "Resultados de Loterias – Mega-Sena, Quina, Lotofácil | Hoje Notícia",
  description: "Confira os resultados de todas as loterias da Caixa: Mega-Sena, Quina, Lotofácil, Lotomania e mais. Atualizado após cada sorteio.",
  keywords: "resultado loteria hoje, mega sena resultado, quina resultado, lotofacil resultado, loterias caixa",
  alternates: { canonical: `${BASE}/` },
  openGraph: {
    title: "Resultados de Loterias | Hoje Notícia",
    description: "Mega-Sena, Quina, Lotofácil e mais. Resultados atualizados.",
    url: `${BASE}/`,
  },
};

const itemListLd = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Loterias da Caixa",
  description: "Resultados de loterias brasileiras",
  url: `${BASE}/`,
  itemListElement: Object.entries(LOTERIAS_CONFIG).map(([slug, cfg], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: cfg.name,
    url: `${BASE}/loterias/${slug}`,
  })),
};

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quais loterias da Caixa estão disponíveis no site?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Acompanhamos as 7 modalidades oficiais: Mega-Sena, Quina, Lotofácil, Lotomania, Timemania, Dia de Sorte e Dupla Sena. Cada uma tem página própria com último resultado, histórico de concursos e estimativa do próximo prêmio.",
      },
    },
    {
      "@type": "Question",
      name: "A que horas saem os resultados das loterias?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Os sorteios da Caixa Econômica Federal acontecem por volta das 20h (horário de Brasília) e o resultado costuma sair em até 30 minutos após o sorteio. Atualizamos a página assim que o resultado oficial é divulgado.",
      },
    },
    {
      "@type": "Question",
      name: "Como conferir se ganhei na loteria?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "Compare as dezenas do seu volante com as números sorteados publicados aqui ou no site da Caixa. Para resgatar o prêmio você pode usar o aplicativo Loterias Caixa, qualquer casa lotérica ou agências da Caixa, conforme o valor.",
      },
    },
    {
      "@type": "Question",
      name: "Qual loteria tem a maior chance de ganhar?",
      acceptedAnswer: {
        "@type": "Answer",
        text:
          "A Lotofácil é tradicionalmente a loteria com maior chance estatística de premiação, pois sorteia 15 números de 1 a 25. A Mega-Sena tem chances menores mas oferece os maiores prêmios.",
      },
    },
  ],
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [{ "@type": "ListItem", position: 1, name: "Início", item: BASE }],
};

function NumberBall({ num, color }: { num: string; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 38, height: 38, borderRadius: "50%",
      background: color, color: "#fff",
      fontWeight: 800, fontSize: "0.9rem", flexShrink: 0,
    }}>
      {num.padStart(2, "0")}
    </span>
  );
}

export default function HomePage() {
  const latest = getLatestDrawPerLoteria();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Banner topo (728x90 desktop / 320x50 mobile) */}
      <AdsterraBanner size="728x90" showOn="desktop" />
      <AdsterraBanner size="320x50" showOn="mobile" />

      {/* Cards de coberturas especiais */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1rem", marginBottom: "2rem" }}>
        <Link href="/copa" style={{
          background: "linear-gradient(135deg, #009739 0%, #FEDD00 100%)",
          color: "#fff", borderRadius: 16, padding: "1.25rem",
          textDecoration: "none", display: "block",
          boxShadow: "0 4px 16px rgba(0,151,57,0.25)",
        }}>
          <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: "0.4rem", fontWeight: 800, opacity: 0.95 }}>
            🏆 Especial
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, marginBottom: "0.2rem" }}>
            Copa 2026
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.95 }}>
            Jogos e onde assistir →
          </div>
        </Link>

        <Link href="/eleicoes-2026" style={{
          background: "linear-gradient(135deg, #dc2626 0%, #0f172a 100%)",
          color: "#fff", borderRadius: 16, padding: "1.25rem",
          textDecoration: "none", display: "block",
          boxShadow: "0 4px 16px rgba(220,38,38,0.25)",
        }}>
          <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: "0.4rem", fontWeight: 800, opacity: 0.95 }}>
            🗳️ Especial
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, marginBottom: "0.2rem" }}>
            Eleições 2026
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.95 }}>
            Candidatos e calendário →
          </div>
        </Link>

        <Link href="/cotacao" style={{
          background: "linear-gradient(135deg, #16a34a 0%, #065f46 100%)",
          color: "#fff", borderRadius: 16, padding: "1.25rem",
          textDecoration: "none", display: "block",
          boxShadow: "0 4px 16px rgba(22,163,74,0.25)",
        }}>
          <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: "0.4rem", fontWeight: 800, opacity: 0.95 }}>
            💰 Diário
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, marginBottom: "0.2rem" }}>
            Cotação Hoje
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.95 }}>
            Dólar, Euro, Bitcoin →
          </div>
        </Link>

        <Link href="/horoscopo" style={{
          background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)",
          color: "#fff", borderRadius: 16, padding: "1.25rem",
          textDecoration: "none", display: "block",
          boxShadow: "0 4px 16px rgba(124,58,237,0.25)",
        }}>
          <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: "0.4rem", fontWeight: 800, opacity: 0.95 }}>
            ✨ Diário
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, marginBottom: "0.2rem" }}>
            Horóscopo do Dia
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.95 }}>
            Previsão dos 12 signos →
          </div>
        </Link>

        <Link href="/feriados" style={{
          background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)",
          color: "#fff", borderRadius: 16, padding: "1.25rem",
          textDecoration: "none", display: "block",
          boxShadow: "0 4px 16px rgba(14,165,233,0.25)",
        }}>
          <div style={{ fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: 1.5, marginBottom: "0.4rem", fontWeight: 800, opacity: 0.95 }}>
            📅 Calendário
          </div>
          <div style={{ fontSize: "1.3rem", fontWeight: 900, marginBottom: "0.2rem" }}>
            Feriados
          </div>
          <div style={{ fontSize: "0.85rem", opacity: 0.95 }}>
            Próximos feriados nacionais →
          </div>
        </Link>
      </div>

      {/* Hero loterias */}
      <div style={{ marginBottom: "2.5rem", borderBottom: "4px solid #209869", paddingBottom: "1rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a" }}>
          🎰 Resultados de Loterias
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.4rem", fontSize: "1.05rem" }}>
          Mega-Sena, Quina, Lotofácil e mais — resultados atualizados após cada sorteio.
        </p>
      </div>

      {/* Cards por loteria */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "3rem" }}>
        {Object.entries(LOTERIAS_CONFIG).map(([slug, cfg]) => {
          const draw = latest[slug];
          return (
            <Link key={slug} href={`/loterias/${slug}`} style={{ textDecoration: "none" }}>
              <div style={{
                background: "#fff", borderRadius: 16, overflow: "hidden",
                boxShadow: "0 2px 12px rgba(0,0,0,0.08)", border: "1px solid #e2e8f0",
                transition: "transform 0.15s, box-shadow 0.15s",
              }}>
                <div style={{ background: cfg.color, padding: "1rem 1.25rem", display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <span style={{ fontSize: "1.8rem" }}>{cfg.emoji}</span>
                  <div>
                    <div style={{ color: "#fff", fontWeight: 800, fontSize: "1.1rem" }}>{cfg.name}</div>
                    <div style={{ color: "rgba(255,255,255,0.75)", fontSize: "0.78rem" }}>{cfg.freq}</div>
                  </div>
                  {draw && (
                    <span style={{ marginLeft: "auto", background: "rgba(0,0,0,0.2)", color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 20 }}>
                      Concurso {draw.concurso}
                    </span>
                  )}
                </div>

                <div style={{ padding: "1.25rem" }}>
                  {draw ? (
                    <>
                      <div style={{ fontSize: "0.72rem", fontWeight: 700, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 1, marginBottom: "0.75rem" }}>
                        Último resultado · {formatDateShort(draw.draw_date)}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "1rem" }}>
                        {draw.numeros.slice(0, 8).map((n) => (
                          <NumberBall key={n} num={n} color={cfg.ballColor} />
                        ))}
                        {draw.numeros.length > 8 && (
                          <span style={{ alignSelf: "center", fontSize: "0.8rem", color: "#64748b" }}>+{draw.numeros.length - 8}</span>
                        )}
                      </div>
                      {draw.ganhadores > 0 ? (
                        <div style={{ fontSize: "0.85rem", color: "#16a34a", fontWeight: 700 }}>
                          🏆 {draw.ganhadores} ganhador{draw.ganhadores > 1 ? "es" : ""} — {formatBRL(draw.premio_principal)}
                        </div>
                      ) : (
                        <div style={{ fontSize: "0.85rem", color: "#94a3b8" }}>
                          Acumulou — próximo: {draw.proximo_premio ? formatBRL(draw.proximo_premio) : "—"}
                        </div>
                      )}
                    </>
                  ) : (
                    <div style={{ color: "#94a3b8", fontSize: "0.88rem", padding: "0.5rem 0" }}>
                      Resultado em breve...
                    </div>
                  )}

                  <div style={{ marginTop: "1rem", paddingTop: "0.75rem", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "0.8rem", color: "#64748b" }}>{cfg.description.slice(0, 45)}...</span>
                    <span style={{ fontSize: "0.82rem", color: cfg.color, fontWeight: 700 }}>Ver tudo →</span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Últimos resultados — internal linking pra Google indexar concursos recentes */}
      {(() => {
        const ultimos = getAllDraws()
          .filter((d) => d.status === "publicado")
          .slice(0, 24);
        if (ultimos.length === 0) return null;
        return (
          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
              <span style={{ background: "#dc2626", color: "#fff", borderRadius: 4, padding: "0.1rem 0.5rem", fontSize: "0.7em", letterSpacing: 1 }}>RECENTES</span>
              Últimos resultados sorteados
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.5rem" }}>
              {ultimos.map((d) => {
                const cfg = LOTERIAS_CONFIG[d.loteria];
                if (!cfg) return null;
                return (
                  <Link key={`${d.loteria}-${d.slug}`} href={`/loterias/${d.loteria}/${d.slug}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      background: "#fff", borderRadius: 10, padding: "0.65rem 0.85rem",
                      border: "1px solid #e2e8f0",
                      display: "flex", alignItems: "center", gap: "0.6rem",
                    }}>
                      <span style={{ fontSize: "1.4rem" }}>{cfg.emoji}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 700, color: cfg.color, fontSize: "0.82rem" }}>
                          {cfg.name} {d.concurso}
                        </div>
                        <div style={{ fontSize: "0.74rem", color: "#94a3b8", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {formatDateShort(d.draw_date)} · {d.ganhadores > 0 ? `🏆 ${formatBRL(d.premio_principal)}` : "Acumulou"}
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* Native banner antes do bloco SEO */}
      <AdsterraNative />

      {/* SEO text */}
      <section style={{ background: "#f8fafc", borderRadius: 12, padding: "2rem", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
          Sobre as Loterias da Caixa Econômica Federal
        </h2>
        <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: "0.75rem" }}>
          As loterias federais brasileiras são administradas pela <strong>Caixa Econômica Federal</strong> e representam
          uma forma legal de jogo regulamentado pelo governo. Os sorteios acontecem regularmente, com prêmios que
          podem chegar a centenas de milhões de reais.
        </p>
        <p style={{ color: "#475569", lineHeight: 1.8, marginBottom: "0.75rem" }}>
          A <strong>Mega-Sena</strong> é o concurso mais famoso, com sorteios às quartas e sábados.
          A <strong>Quina</strong> e a <strong>Lotofácil</strong> acontecem praticamente todos os dias úteis.
        </p>
        <p style={{ color: "#475569", lineHeight: 1.8 }}>
          Nesta página você encontra os resultados de todos os concursos, incluindo dezenas sorteadas,
          ganhadores, valores dos prêmios e as estimativas para os próximos sorteios.
        </p>
      </section>
    </div>
  );
}
