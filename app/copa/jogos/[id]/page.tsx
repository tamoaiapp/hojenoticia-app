import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  getJogos, getJogoById,
  getBandeiraDoTime, formatData, formatDataLonga, nomeFase,
} from "@/lib/copa-jogos";
import { ONDE_ASSISTIR } from "@/lib/copa-config";

export const revalidate = 3600;
export const dynamicParams = false;
const BASE = "https://hojenoticia.com";

interface Props { params: Promise<{ id: string }> }

export async function generateStaticParams() {
  return getJogos().jogos.map((j) => ({ id: String(j.id) }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const jogo = getJogoById(Number(id));
  if (!jogo) return {};
  const titulo = `${jogo.time1} x ${jogo.time2} — Copa do Mundo 2026`;
  return {
    title: titulo,
    description: `${jogo.time1} contra ${jogo.time2} em ${formatDataLonga(jogo.data)} às ${jogo.horario_brasilia} (Brasília) — ${nomeFase(jogo.fase)}, ${jogo.estadio}, ${jogo.cidade}. Onde assistir e horário.`,
    keywords: `${jogo.time1} x ${jogo.time2}, copa 2026 ${jogo.time1.toLowerCase()}, jogo brasil copa, ${nomeFase(jogo.fase).toLowerCase()} copa 2026`,
    alternates: { canonical: `${BASE}/copa/jogos/${jogo.id}` },
    openGraph: {
      title: titulo,
      description: `${formatDataLonga(jogo.data)} às ${jogo.horario_brasilia} · ${jogo.estadio}, ${jogo.cidade}.`,
      url: `${BASE}/copa/jogos/${jogo.id}`,
      type: "article",
    },
  };
}

export default async function JogoDetalhe({ params }: Props) {
  const { id } = await params;
  const jogo = getJogoById(Number(id));
  if (!jogo) notFound();

  const b1 = getBandeiraDoTime(jogo.time1);
  const b2 = getBandeiraDoTime(jogo.time2);
  const finalizado = jogo.score1 != null && jogo.score2 != null;
  const temBrasil = jogo.time1 === "Brasil" || jogo.time2 === "Brasil";

  const eventLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: `${jogo.time1} x ${jogo.time2}`,
    description: `Partida da Copa do Mundo FIFA 2026 — ${nomeFase(jogo.fase)}.`,
    startDate: `${jogo.data}T${jogo.horario_brasilia}:00-03:00`,
    location: {
      "@type": "Place",
      name: jogo.estadio,
      address: { "@type": "PostalAddress", addressLocality: jogo.cidade, addressCountry: jogo.pais },
    },
    competitor: [
      { "@type": "SportsTeam", name: jogo.time1 },
      { "@type": "SportsTeam", name: jogo.time2 },
    ],
    organizer: { "@type": "Organization", name: "FIFA", url: "https://www.fifa.com/" },
    eventStatus: finalizado ? "https://schema.org/EventScheduled" : "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/MixedEventAttendanceMode",
    url: `${BASE}/copa/jogos/${jogo.id}`,
    superEvent: {
      "@type": "SportsEvent",
      name: "Copa do Mundo FIFA 2026",
      url: `${BASE}/copa`,
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início",             item: BASE },
      { "@type": "ListItem", position: 2, name: "Copa do Mundo 2026", item: `${BASE}/copa` },
      { "@type": "ListItem", position: 3, name: "Jogos",              item: `${BASE}/copa/jogos` },
      { "@type": "ListItem", position: 4, name: `${jogo.time1} x ${jogo.time2}`, item: `${BASE}/copa/jogos/${jogo.id}` },
    ],
  };

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav aria-label="Breadcrumb" style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
        <Link href="/" style={{ color: "#2563eb" }}>Início</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <Link href="/copa" style={{ color: "#2563eb" }}>Copa 2026</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <Link href="/copa/jogos" style={{ color: "#2563eb" }}>Jogos</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <span>{jogo.time1} x {jogo.time2}</span>
      </nav>

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <span style={{ background: "#009739", color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
          🏆 Copa 2026
        </span>
        <span style={{ background: "#1e293b", color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "0.25rem 0.65rem", borderRadius: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>
          {nomeFase(jogo.fase)}{jogo.grupo ? ` · Grupo ${jogo.grupo}` : ""}
        </span>
      </div>

      <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", marginBottom: "0.5rem" }}>
        {jogo.time1} <span style={{ color: "#94a3b8" }}>x</span> {jogo.time2}
      </h1>
      <p style={{ color: "#64748b", fontSize: "1.05rem", marginBottom: "2rem" }}>
        {formatDataLonga(jogo.data)} · <strong>{jogo.horario_brasilia} (Brasília)</strong> · {jogo.estadio}, {jogo.cidade}
      </p>

      {/* Placar */}
      <div style={{
        background: temBrasil
          ? "linear-gradient(135deg, #009739 0%, #FEDD00 100%)"
          : "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
        borderRadius: 20, padding: "2.5rem 2rem", marginBottom: "2rem", color: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", gap: "1rem", flexWrap: "wrap" }}>
          <div style={{ textAlign: "center", flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>{b1}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900 }}>{jogo.time1}</div>
          </div>
          {finalizado ? (
            <div style={{ fontSize: "3rem", fontWeight: 900 }}>
              {jogo.score1} <span style={{ opacity: 0.5 }}>x</span> {jogo.score2}
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.3rem" }}>{jogo.horario_brasilia}</div>
              <div style={{ fontSize: "0.85rem", opacity: 0.9 }}>Horário Brasília</div>
            </div>
          )}
          <div style={{ textAlign: "center", flex: 1, minWidth: 180 }}>
            <div style={{ fontSize: "4rem", marginBottom: "0.5rem" }}>{b2}</div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900 }}>{jogo.time2}</div>
          </div>
        </div>
      </div>

      {/* Onde assistir */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem" }}>📺 Onde assistir</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
          {ONDE_ASSISTIR.map((c) => (
            <a
              key={c.nome}
              href={c.afiliado_env ? (process.env[c.afiliado_env] ?? c.url_base) : c.url_base}
              target="_blank"
              rel={c.afiliado_env ? "sponsored noopener" : "noopener"}
              style={{
                background: "#fff", border: `1px solid ${c.cor}55`,
                borderRadius: 10, padding: "0.85rem 1rem", textDecoration: "none", display: "block",
              }}
            >
              <div style={{ fontWeight: 800, color: c.cor, marginBottom: "0.2rem" }}>
                {c.logo} {c.nome}
              </div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8" }}>{c.tipo} · {c.preco}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Info do jogo */}
      <section style={{ marginBottom: "2rem", background: "#f8fafc", borderRadius: 12, padding: "1.25rem", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "1.05rem", fontWeight: 800, marginBottom: "0.75rem" }}>📍 Detalhes</h2>
        <ul style={{ color: "#475569", lineHeight: 1.8, fontSize: "0.92rem", listStyle: "none", padding: 0, margin: 0 }}>
          <li><strong>Fase:</strong> {nomeFase(jogo.fase)}{jogo.grupo ? ` (Grupo ${jogo.grupo})` : ""}</li>
          <li><strong>Data:</strong> {formatDataLonga(jogo.data)}</li>
          <li><strong>Horário Brasília:</strong> {jogo.horario_brasilia}</li>
          <li><strong>Estádio:</strong> {jogo.estadio}</li>
          <li><strong>Cidade:</strong> {jogo.cidade}, {jogo.pais === "US" ? "Estados Unidos" : jogo.pais === "CA" ? "Canadá" : "México"}</li>
        </ul>
      </section>

      {/* Voltar */}
      <div style={{ textAlign: "center" }}>
        <Link href="/copa/jogos" style={{ color: "#009739", fontWeight: 700, textDecoration: "none", fontSize: "0.95rem" }}>
          ← Ver todos os {getJogos().jogos.length} jogos da Copa 2026
        </Link>
      </div>
    </div>
  );
}
