import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  LOTERIAS_CONFIG, getDrawsByLoteria,
  formatBRL, formatDate, formatDateShort,
} from "@/lib/loterias";

export const revalidate = 1800;
export const dynamicParams = true;

const BASE = "https://hojenoticia.com";

interface Props { params: Promise<{ loteria: string }> }

export async function generateStaticParams() {
  return Object.keys(LOTERIAS_CONFIG).map((loteria) => ({ loteria }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { loteria } = await params;
  const cfg = LOTERIAS_CONFIG[loteria];
  if (!cfg) return {};
  const draws = getDrawsByLoteria(loteria).filter(d => d.status === "publicado");
  const latest = draws[0];
  const prize = latest?.proximo_premio ? ` — próximo prêmio ${formatBRL(latest.proximo_premio)}` : "";
  return {
    title: `Resultado ${cfg.name} – Último Concurso e Histórico${prize} | Hoje Notícia`,
    description: `Confira o resultado da ${cfg.name}, o último concurso sorteado e o histórico completo de resultados. ${cfg.description}`,
    keywords: `resultado ${loteria}, ${loteria} resultado hoje, concurso ${loteria}, dezenas ${loteria}`,
    openGraph: {
      title: `Resultado ${cfg.name} | Hoje Notícia`,
      description: `Último resultado e histórico completo da ${cfg.name}.`,
      url: `${BASE}/loterias/${loteria}`,
    },
  };
}

function NumberBall({ num, color, size = 44 }: { num: string; color: string; size?: number }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: size, height: size, borderRadius: "50%",
      background: color, color: "#fff",
      fontWeight: 800, fontSize: size > 40 ? "1.05rem" : "0.82rem", flexShrink: 0,
      boxShadow: `0 3px 8px ${color}55`,
    }}>
      {num.padStart(2, "0")}
    </span>
  );
}

export default async function LoteriasPage({ params }: Props) {
  const { loteria } = await params;
  const cfg = LOTERIAS_CONFIG[loteria];
  if (!cfg) notFound();

  const draws      = getDrawsByLoteria(loteria);
  const published  = draws.filter(d => d.status === "publicado");
  const upcoming   = draws.filter(d => d.status === "aguardando").sort((a, b) => a.concurso - b.concurso);
  const latest     = published[0];
  const recent     = published.slice(1, 10);

  const ldJson = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Histórico ${cfg.name}`,
    url: `${BASE}/loterias/${loteria}`,
    itemListElement: published.slice(0, 20).map((d, i) => ({
      "@type": "ListItem", position: i + 1,
      name: d.title,
      url: `${BASE}/loterias/${loteria}/${d.slug}`,
    })),
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldJson) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.25rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "#2563eb" }}>Início</Link>
        <span>/</span>
        <Link href="/loterias" style={{ color: "#2563eb" }}>Loterias</Link>
        <span>/</span>
        <span>{cfg.name}</span>
      </nav>

      {/* Hero com último resultado */}
      <div style={{
        background: cfg.color, borderRadius: 20, padding: "2rem",
        marginBottom: "2rem", color: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "2.5rem" }}>{cfg.emoji}</span>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, lineHeight: 1.2 }}>
              Resultado {cfg.name}
            </h1>
            <p style={{ opacity: 0.8, fontSize: "0.88rem" }}>{cfg.freq} · {cfg.description}</p>
          </div>
        </div>

        {latest ? (
          <>
            <div style={{ fontSize: "0.78rem", opacity: 0.75, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: 1 }}>
              Último resultado — Concurso {latest.concurso} · {formatDate(latest.draw_date)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginBottom: "1rem" }}>
              {latest.numeros.map((n) => (
                <span key={n} style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 50, height: 50, borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)", color: "#fff",
                  fontWeight: 900, fontSize: "1.1rem", border: "2px solid rgba(255,255,255,0.4)",
                }}>
                  {n.padStart(2, "0")}
                </span>
              ))}
            </div>
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.9rem" }}>
              {latest.ganhadores > 0 ? (
                <span>🏆 <strong>{latest.ganhadores} ganhador{latest.ganhadores > 1 ? "es"  : ""}</strong> — {formatBRL(latest.premio_principal)}</span>
              ) : (
                <span>🔄 <strong>Acumulou!</strong> Nenhum ganhador do prêmio principal</span>
              )}
              {latest.proxima_data && (
                <span>📅 Próximo sorteio: <strong>{formatDateShort(latest.proxima_data)}</strong>
                  {latest.proximo_premio ? ` — ${formatBRL(latest.proximo_premio)}` : ""}</span>
              )}
            </div>
          </>
        ) : (
          <p style={{ opacity: 0.8 }}>Resultados em breve. Acompanhe aqui!</p>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "2rem", alignItems: "start" }}>

        {/* Coluna principal */}
        <div>
          {/* Próximos sorteios */}
          {upcoming.length > 0 && (
            <section style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: 1, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ background: "#ef4444", color: "#fff", borderRadius: 4, padding: "0.1rem 0.4rem", fontSize: "0.7rem" }}>PRÓXIMOS</span>
                Sorteios Previstos
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {upcoming.map(d => (
                  <Link key={d.slug} href={`/loterias/${loteria}/${d.slug}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "1rem",
                      background: "#fff", borderRadius: 10, padding: "0.75rem 1rem",
                      border: "1px solid #e2e8f0", justifyContent: "space-between",
                    }}>
                      <div>
                        <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>Concurso {d.concurso}</span>
                        <span style={{ color: "#94a3b8", fontSize: "0.82rem", marginLeft: "0.5rem" }}>— {formatDate(d.draw_date)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {d.premio_principal > 0 && (
                          <span style={{ fontSize: "0.82rem", color: cfg.color, fontWeight: 700 }}>
                            {formatBRL(d.premio_principal)} estimado
                          </span>
                        )}
                        <span style={{ background: "#fef9c3", color: "#854d0e", fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: 6 }}>
                          Aguardando
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Histórico */}
          {published.length > 0 && (
            <section>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: 1, marginBottom: "1rem" }}>
                Histórico de Resultados
              </h2>

              {/* Último resultado (card grande) */}
              {latest && (
                <Link href={`/loterias/${loteria}/${latest.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{
                    background: "#fff", borderRadius: 14, padding: "1.25rem",
                    border: `2px solid ${cfg.color}`, marginBottom: "0.75rem",
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.75rem", flexWrap: "wrap", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 800, color: "#0f172a" }}>Concurso {latest.concurso}</span>
                      <span style={{ color: "#64748b", fontSize: "0.82rem" }}>{formatDate(latest.draw_date)}</span>
                    </div>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
                      {latest.numeros.map(n => <NumberBall key={n} num={n} color={cfg.ballColor} />)}
                    </div>
                    {latest.ganhadores > 0 ? (
                      <span style={{ fontSize: "0.85rem", color: "#16a34a", fontWeight: 700 }}>
                        🏆 {latest.ganhadores} ganhador{latest.ganhadores > 1 ? "es" : ""} — {formatBRL(latest.premio_principal)}
                      </span>
                    ) : (
                      <span style={{ fontSize: "0.85rem", color: "#64748b" }}>Acumulou</span>
                    )}
                  </div>
                </Link>
              )}

              {/* Tabela dos outros */}
              {recent.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 14, overflow: "hidden", border: "1px solid #e2e8f0" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th style={{ padding: "0.65rem 1rem", textAlign: "left", fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Concurso</th>
                        <th style={{ padding: "0.65rem 1rem", textAlign: "left", fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Data</th>
                        <th style={{ padding: "0.65rem 1rem", textAlign: "left", fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Dezenas</th>
                        <th style={{ padding: "0.65rem 1rem", textAlign: "right", fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((d, i) => (
                        <tr key={d.slug} style={{ borderTop: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td style={{ padding: "0.65rem 1rem" }}>
                            <Link href={`/loterias/${loteria}/${d.slug}`} style={{ color: cfg.color, fontWeight: 700, fontSize: "0.88rem" }}>
                              {d.concurso}
                            </Link>
                          </td>
                          <td style={{ padding: "0.65rem 1rem", fontSize: "0.85rem", color: "#64748b" }}>{formatDateShort(d.draw_date)}</td>
                          <td style={{ padding: "0.65rem 1rem" }}>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.2rem" }}>
                              {d.numeros.slice(0, 6).map(n => (
                                <NumberBall key={n} num={n} color={cfg.ballColor} size={28} />
                              ))}
                              {d.numeros.length > 6 && <span style={{ fontSize: "0.75rem", color: "#94a3b8", alignSelf: "center" }}>+{d.numeros.length - 6}</span>}
                            </div>
                          </td>
                          <td style={{ padding: "0.65rem 1rem", textAlign: "right", fontSize: "0.82rem" }}>
                            {d.ganhadores > 0
                              ? <span style={{ color: "#16a34a", fontWeight: 700 }}>🏆 {d.ganhadores} gan.</span>
                              : <span style={{ color: "#94a3b8" }}>Acumulou</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {draws.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
              <p>Resultados sendo publicados em breve.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside style={{ position: "sticky", top: "2rem" }}>
          <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: "1px solid #e2e8f0", marginBottom: "1.25rem" }}>
            <div style={{ fontWeight: 800, fontSize: "0.85rem", color: "#0f172a", textTransform: "uppercase", letterSpacing: 1, borderBottom: `3px solid ${cfg.color}`, paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              Outras Loterias
            </div>
            {Object.entries(LOTERIAS_CONFIG).filter(([s]) => s !== loteria).map(([s, c]) => (
              <Link key={s} href={`/loterias/${s}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600, color: "#1e293b" }}>
                <span>{c.emoji}</span> {c.name}
                <span style={{ marginLeft: "auto", color: "#94a3b8", fontSize: "0.78rem" }}>Ver →</span>
              </Link>
            ))}
          </div>

          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "1.5rem", textAlign: "center", color: "#94a3b8", fontSize: "0.78rem" }}>
            [Anúncio]
          </div>
        </aside>
      </div>
    </div>
  );
}
