import type { Metadata } from "next";
import Link from "next/link";
import { LOTERIAS_CONFIG, getLatestDrawPerLoteria, formatBRL, formatDateShort } from "@/lib/loterias";

export const revalidate = 86400; // 24h — novos concursos saem 1-2x/semana

const BASE = "https://hojenoticia.com";

export const metadata: Metadata = {
  title: "Resultados de Loterias – Mega-Sena, Quina, Lotofácil | Hoje Notícia",
  description: "Confira os resultados de todas as loterias da Caixa: Mega-Sena, Quina, Lotofácil, Lotomania e mais. Atualizado após cada sorteio.",
  keywords: "resultado loteria hoje, mega sena resultado, quina resultado, lotofacil resultado, loterias caixa",
  openGraph: {
    title: "Resultados de Loterias | Hoje Notícia",
    description: "Mega-Sena, Quina, Lotofácil e mais. Resultados atualizados.",
    url: `${BASE}/loterias`,
  },
};

const ldJson = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Loterias da Caixa",
  description: "Resultados de loterias brasileiras",
  url: `${BASE}/loterias`,
  itemListElement: Object.entries(LOTERIAS_CONFIG).map(([slug, cfg], i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: cfg.name,
    url: `${BASE}/loterias/${slug}`,
  })),
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

export default function LoteriasHubPage() {
  const latest = getLatestDrawPerLoteria();

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.5rem", display: "flex", gap: "0.4rem" }}>
        <Link href="/" style={{ color: "#2563eb" }}>Início</Link>
        <span>/</span>
        <span>Loterias</span>
      </nav>

      {/* Hero */}
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
                {/* Header colorido */}
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

                {/* Resultado */}
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
