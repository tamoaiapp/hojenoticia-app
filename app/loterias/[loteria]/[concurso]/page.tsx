import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import {
  LOTERIAS_CONFIG, getDrawsByLoteria, getDrawBySlug,
  formatBRL, formatDate, formatDateShort,
} from "@/lib/loterias";

export const revalidate = 900;
export const dynamicParams = true;

const BASE = "https://hojenoticia.com";

interface Props { params: Promise<{ loteria: string; concurso: string }> }

export async function generateStaticParams() {
  const params: { loteria: string; concurso: string }[] = [];
  for (const lot of Object.keys(LOTERIAS_CONFIG)) {
    const draws = getDrawsByLoteria(lot);
    for (const d of draws) params.push({ loteria: lot, concurso: d.slug });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { loteria, concurso } = await params;
  const draw = getDrawBySlug(loteria, concurso);
  if (!draw) return {};
  const cfg = LOTERIAS_CONFIG[loteria];
  return {
    title: draw.title,
    description: draw.description,
    keywords: draw.keywords,
    openGraph: {
      title: draw.title,
      description: draw.description,
      url: `${BASE}/loterias/${loteria}/${concurso}`,
      type: "article",
      publishedTime: draw.draw_date,
    },
    twitter: {
      card: "summary",
      title: draw.title,
      description: draw.description,
    },
    alternates: { canonical: `${BASE}/loterias/${loteria}/${concurso}` },
  };
}

function NumberBall({ num, color }: { num: string; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", justifyContent: "center",
      width: 56, height: 56, borderRadius: "50%",
      background: color, color: "#fff",
      fontWeight: 900, fontSize: "1.15rem", flexShrink: 0,
      boxShadow: `0 4px 12px ${color}66`,
    }}>
      {num.padStart(2, "0")}
    </span>
  );
}

export default async function DrawPage({ params }: Props) {
  const { loteria, concurso } = await params;
  const draw = getDrawBySlug(loteria, concurso);
  if (!draw) notFound();

  const cfg     = LOTERIAS_CONFIG[loteria];
  if (!cfg) notFound();

  const draws   = getDrawsByLoteria(loteria).filter(d => d.status === "publicado");
  const idx     = draws.findIndex(d => d.slug === concurso);
  const prev    = idx >= 0 && idx + 1 < draws.length ? draws[idx + 1] : null;
  const next    = idx > 0 ? draws[idx - 1] : null;

  const isPublished = draw.status === "publicado";
  const drawDateFmt = formatDate(draw.draw_date);

  // JSON-LD
  const ldEvent = {
    "@context": "https://schema.org",
    "@type": isPublished ? "Event" : "Event",
    name: draw.title,
    description: draw.description,
    startDate: draw.draw_date,
    location: { "@type": "Place", name: "Brasil" },
    organizer: { "@type": "Organization", name: "Caixa Econômica Federal" },
    url: `${BASE}/loterias/${loteria}/${concurso}`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início",   item: BASE },
      { "@type": "ListItem", position: 2, name: "Loterias", item: `${BASE}/loterias` },
      { "@type": "ListItem", position: 3, name: cfg.name,   item: `${BASE}/loterias/${loteria}` },
      { "@type": "ListItem", position: 4, name: draw.title },
    ],
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ldEvent) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.25rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "#2563eb" }}>Início</Link>
        <span>/</span>
        <Link href="/loterias" style={{ color: "#2563eb" }}>Loterias</Link>
        <span>/</span>
        <Link href={`/loterias/${loteria}`} style={{ color: "#2563eb" }}>{cfg.name}</Link>
        <span>/</span>
        <span>Concurso {draw.concurso}</span>
      </nav>

      {/* Badge + título */}
      <Link href={`/loterias/${loteria}`} style={{ textDecoration: "none" }}>
        <span style={{ background: cfg.color, color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 4, textTransform: "uppercase", letterSpacing: 1 }}>
          {cfg.emoji} {cfg.name}
        </span>
      </Link>

      <h1 style={{ fontSize: "1.9rem", fontWeight: 900, color: "#0f172a", lineHeight: 1.3, margin: "0.75rem 0 0.5rem" }}>
        {draw.title}
      </h1>
      <p style={{ color: "#64748b", fontSize: "1.05rem", marginBottom: "1.5rem" }}>{draw.description}</p>

      <div style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "2rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
        <span>📅 <time dateTime={draw.draw_date}>{drawDateFmt}</time></span>
        <span>🎯 Concurso {draw.concurso}</span>
        {isPublished
          ? <span style={{ color: "#16a34a", fontWeight: 700 }}>✅ Resultado Oficial</span>
          : <span style={{ color: "#f59e0b", fontWeight: 700 }}>⏳ Aguardando Sorteio</span>}
      </div>

      {/* Resultado */}
      <div style={{
        background: isPublished ? cfg.color : "#f8fafc",
        borderRadius: 20, padding: "2rem",
        border: isPublished ? "none" : `2px dashed ${cfg.color}`,
        marginBottom: "2rem",
        color: isPublished ? "#fff" : "#0f172a",
      }}>
        {isPublished && draw.numeros.length > 0 ? (
          <>
            <div style={{ fontSize: "0.78rem", opacity: 0.8, textTransform: "uppercase", letterSpacing: 1, marginBottom: "1rem" }}>
              Dezenas Sorteadas — {formatDateShort(draw.draw_date)}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", marginBottom: "1.5rem" }}>
              {draw.numeros.map((n) => (
                <span key={n} style={{
                  display: "inline-flex", alignItems: "center", justifyContent: "center",
                  width: 60, height: 60, borderRadius: "50%",
                  background: "rgba(255,255,255,0.25)", color: "#fff",
                  fontWeight: 900, fontSize: "1.2rem", border: "2px solid rgba(255,255,255,0.5)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}>
                  {n.padStart(2, "0")}
                </span>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem" }}>
              <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "0.75rem 1rem" }}>
                <div style={{ fontSize: "0.72rem", opacity: 0.75, textTransform: "uppercase", letterSpacing: 1 }}>Ganhadores</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 900 }}>
                  {draw.ganhadores > 0 ? `🏆 ${draw.ganhadores}` : "🔄 Acumulou"}
                </div>
              </div>
              <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "0.75rem 1rem" }}>
                <div style={{ fontSize: "0.72rem", opacity: 0.75, textTransform: "uppercase", letterSpacing: 1 }}>Prêmio</div>
                <div style={{ fontSize: "1.1rem", fontWeight: 900 }}>
                  {draw.ganhadores > 0 ? formatBRL(draw.premio_principal) : "—"}
                </div>
              </div>
              {draw.cidade && (
                <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "0.75rem 1rem" }}>
                  <div style={{ fontSize: "0.72rem", opacity: 0.75, textTransform: "uppercase", letterSpacing: 1 }}>Cidade</div>
                  <div style={{ fontSize: "0.9rem", fontWeight: 700 }}>{draw.cidade}</div>
                </div>
              )}
              {draw.proximo_premio && (
                <div style={{ background: "rgba(0,0,0,0.15)", borderRadius: 10, padding: "0.75rem 1rem" }}>
                  <div style={{ fontSize: "0.72rem", opacity: 0.75, textTransform: "uppercase", letterSpacing: 1 }}>Próximo prêmio</div>
                  <div style={{ fontSize: "1rem", fontWeight: 900 }}>{formatBRL(draw.proximo_premio)}</div>
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "1rem 0" }}>
            <div style={{ fontSize: "3rem", marginBottom: "0.75rem" }}>⏳</div>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: cfg.color, marginBottom: "0.5rem" }}>
              Sorteio em {drawDateFmt}
            </h2>
            <p style={{ color: "#64748b", fontSize: "0.95rem" }}>
              As dezenas sorteadas serão publicadas aqui logo após o sorteio.
            </p>
            {draw.premio_principal > 0 && (
              <p style={{ marginTop: "0.75rem", fontWeight: 700, color: cfg.color, fontSize: "1.1rem" }}>
                Estimativa de prêmio: {formatBRL(draw.premio_principal)}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Próximo sorteio */}
      {draw.proxima_data && (
        <div style={{ background: "#f8fafc", borderRadius: 12, padding: "1rem 1.25rem", border: "1px solid #e2e8f0", marginBottom: "2rem", display: "flex", gap: "1rem", alignItems: "center", flexWrap: "wrap" }}>
          <span style={{ fontSize: "1.5rem" }}>📅</span>
          <div>
            <div style={{ fontWeight: 700, color: "#0f172a", fontSize: "0.9rem" }}>Próximo Sorteio</div>
            <div style={{ color: "#64748b", fontSize: "0.85rem" }}>
              Concurso {draw.proximo_concurso} · {formatDate(draw.proxima_data)}
              {draw.proximo_premio && ` · Estimativa ${formatBRL(draw.proximo_premio)}`}
            </div>
          </div>
          {draw.proximo_concurso && (
            <Link href={`/loterias/${loteria}/concurso-${draw.proximo_concurso}`} style={{ marginLeft: "auto", background: cfg.color, color: "#fff", borderRadius: 8, padding: "0.4rem 0.9rem", fontSize: "0.82rem", fontWeight: 700, textDecoration: "none" }}>
              Ver página →
            </Link>
          )}
        </div>
      )}

      {/* Conteúdo MDX */}
      {draw.content.trim() && (
        <div className="article-body" style={{ marginBottom: "2rem" }}>
          <MDXRemote source={draw.content} />
        </div>
      )}

      {/* Navegação entre concursos */}
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", marginBottom: "2rem", flexWrap: "wrap" }}>
        {prev ? (
          <Link href={`/loterias/${loteria}/${prev.slug}`} style={{ flex: 1, background: "#f8fafc", borderRadius: 10, padding: "0.75rem 1rem", border: "1px solid #e2e8f0", textDecoration: "none" }}>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.2rem" }}>← Anterior</div>
            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>Concurso {prev.concurso}</div>
            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{formatDateShort(prev.draw_date)}</div>
          </Link>
        ) : <div style={{ flex: 1 }} />}

        {next ? (
          <Link href={`/loterias/${loteria}/${next.slug}`} style={{ flex: 1, background: "#f8fafc", borderRadius: 10, padding: "0.75rem 1rem", border: "1px solid #e2e8f0", textDecoration: "none", textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "#94a3b8", marginBottom: "0.2rem" }}>Próximo →</div>
            <div style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>Concurso {next.concurso}</div>
            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{formatDateShort(next.draw_date)}</div>
          </Link>
        ) : <div style={{ flex: 1 }} />}
      </div>

      {/* Link para histórico */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Link href={`/loterias/${loteria}`} style={{ color: cfg.color, fontWeight: 700, textDecoration: "none" }}>
          ← Ver todos os resultados da {cfg.name}
        </Link>
      </div>

      {/* SEO text block */}
      <div style={{ background: "#f8fafc", borderRadius: 12, padding: "1.5rem", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem" }}>
          Sobre o Concurso {draw.concurso} da {cfg.name}
        </h2>
        <p style={{ color: "#475569", lineHeight: 1.8, fontSize: "0.92rem" }}>
          O concurso {draw.concurso} da {cfg.name} {isPublished ? `foi realizado em ${drawDateFmt}` : `acontece em ${drawDateFmt}`}.
          {isPublished && draw.numeros.length > 0
            ? ` As dezenas sorteadas foram: ${draw.numeros.map(n => n.padStart(2, "0")).join(", ")}.`
            : " As dezenas serão publicadas aqui logo após o sorteio oficial."}
          {" "}A {cfg.name} é realizada pela Caixa Econômica Federal. {cfg.description}
        </p>
        {isPublished && draw.ganhadores === 0 && (
          <p style={{ color: "#475569", lineHeight: 1.8, fontSize: "0.92rem", marginTop: "0.5rem" }}>
            Nenhum apostador acertou os {cfg.numCount} números no concurso {draw.concurso},
            portanto o prêmio acumulou para o próximo sorteio.
          </p>
        )}
      </div>
    </div>
  );
}
