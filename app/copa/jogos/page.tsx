import type { Metadata } from "next";
import Link from "next/link";
import {
  getJogos,
  getBandeiraDoTime,
  formatData,
  nomeFase,
  type Fase,
  type Jogo,
} from "@/lib/copa-jogos";

export const revalidate = 3600;
const BASE = "https://hojenoticia.com";

export const metadata: Metadata = {
  title: "Tabela Completa de Jogos da Copa do Mundo 2026",
  description:
    "Calendário completo da Copa do Mundo FIFA 2026: 104 jogos, datas, horários (Brasília), estádios e seleções. Fase de grupos + mata-mata.",
  keywords:
    "tabela copa 2026, jogos copa do mundo 2026, calendario copa 2026, horarios copa 2026, copa mundo brasilia",
  alternates: { canonical: `${BASE}/copa/jogos` },
};

export default function JogosPage() {
  const { jogos, aviso } = getJogos();
  const fases: Fase[] = ["grupos", "oitavas-32", "oitavas", "quartas", "semifinal", "terceiro", "final"];
  const porFase = fases.map((f) => ({ fase: f, jogos: jogos.filter((j) => j.fase === f) }));

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início",             item: BASE },
      { "@type": "ListItem", position: 2, name: "Copa do Mundo 2026", item: `${BASE}/copa` },
      { "@type": "ListItem", position: 3, name: "Jogos",              item: `${BASE}/copa/jogos` },
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
        <span>Jogos</span>
      </nav>

      <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", marginBottom: "0.5rem" }}>
        Tabela Completa — Copa do Mundo 2026
      </h1>
      <p style={{ color: "#64748b", fontSize: "1.05rem", marginBottom: "0.5rem" }}>
        Todos os <strong>{jogos.length} jogos</strong> do torneio. Horários em Brasília (UTC-3).
      </p>
      <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "2rem" }}>{aviso}</p>

      {porFase.map(({ fase, jogos }) =>
        jogos.length === 0 ? null : (
          <section key={fase} style={{ marginBottom: "2.5rem" }}>
            <h2 style={{
              fontSize: "1.1rem", fontWeight: 800, color: "#0f172a",
              textTransform: "uppercase", letterSpacing: 1,
              marginBottom: "1rem", paddingBottom: "0.5rem",
              borderBottom: "3px solid #009739",
            }}>
              {nomeFase(fase)} <span style={{ color: "#94a3b8", fontWeight: 600, fontSize: "0.85rem" }}>({jogos.length} jogos)</span>
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(310px, 1fr))", gap: "0.75rem" }}>
              {jogos.map((j) => <JogoCard key={j.id} jogo={j} />)}
            </div>
          </section>
        ),
      )}
    </div>
  );
}

function JogoCard({ jogo }: { jogo: Jogo }) {
  const b1 = getBandeiraDoTime(jogo.time1);
  const b2 = getBandeiraDoTime(jogo.time2);
  const temBrasil = jogo.time1 === "Brasil" || jogo.time2 === "Brasil";

  return (
    <Link href={`/copa/jogos/${jogo.id}`} style={{ textDecoration: "none" }}>
      <div style={{
        background: "#fff",
        border: temBrasil ? "2px solid #009739" : "1px solid #e2e8f0",
        borderRadius: 12, padding: "0.9rem 1rem",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.72rem", color: "#94a3b8", marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: 0.5 }}>
          <span>{formatData(jogo.data)} · {jogo.horario_brasilia}</span>
          <span>#{jogo.id}{jogo.grupo ? ` · Grupo ${jogo.grupo}` : ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "1.3rem" }}>{b1}</span>
          <span style={{ fontWeight: 700, color: "#0f172a", flex: 1, fontSize: "0.92rem" }}>{jogo.time1}</span>
          {jogo.score1 != null && <span style={{ fontWeight: 900, fontSize: "1rem" }}>{jogo.score1}</span>}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span style={{ fontSize: "1.3rem" }}>{b2}</span>
          <span style={{ fontWeight: 700, color: "#0f172a", flex: 1, fontSize: "0.92rem" }}>{jogo.time2}</span>
          {jogo.score2 != null && <span style={{ fontWeight: 900, fontSize: "1rem" }}>{jogo.score2}</span>}
        </div>
        <div style={{ fontSize: "0.78rem", color: "#94a3b8", marginTop: "0.5rem", paddingTop: "0.5rem", borderTop: "1px solid #f1f5f9" }}>
          {jogo.estadio !== "A confirmar" && `${jogo.estadio} · `}{jogo.cidade}
        </div>
      </div>
    </Link>
  );
}
