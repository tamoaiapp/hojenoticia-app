import type { Metadata } from "next";
import Link from "next/link";
import { COPA_INFO, GRUPOS, SEDES, ONDE_ASSISTIR } from "@/lib/copa-config";
import { getJogosBrasil, getProximosJogos, getBandeiraDoTime, formatData } from "@/lib/copa-jogos";

export const revalidate = 3600;
const BASE = "https://hojenoticia.com";

export const metadata: Metadata = {
  title: "Copa do Mundo 2026 — Jogos, Grupos e Onde Assistir",
  description:
    "Tabela completa da Copa do Mundo FIFA 2026 (EUA, Canadá e México): jogos, grupos, classificação, onde assistir ao vivo na TV e streaming.",
  keywords:
    "copa do mundo 2026, copa 2026, tabela copa 2026, jogos copa do mundo, onde assistir copa 2026, brasil copa, grupos copa 2026",
  alternates: { canonical: `${BASE}/copa` },
  openGraph: {
    title: "Copa do Mundo 2026 — Tabela e Onde Assistir",
    description:
      "Todos os jogos da Copa do Mundo FIFA 2026: tabela, grupos, onde assistir no Brasil.",
    url: `${BASE}/copa`,
    type: "website",
  },
};

export default function CopaHubPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: BASE },
      { "@type": "ListItem", position: 2, name: "Copa do Mundo 2026", item: `${BASE}/copa` },
    ],
  };

  const eventLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: "Copa do Mundo FIFA 2026",
    description:
      "Edição 2026 da Copa do Mundo FIFA realizada nos Estados Unidos, Canadá e México, com 48 seleções e 104 jogos.",
    startDate: COPA_INFO.inicio,
    endDate: COPA_INFO.fim,
    location: [
      { "@type": "Country", name: "Estados Unidos" },
      { "@type": "Country", name: "Canadá" },
      { "@type": "Country", name: "México" },
    ],
    organizer: { "@type": "Organization", name: "FIFA", url: "https://www.fifa.com/" },
    url: `${BASE}/copa`,
    eventStatus: "https://schema.org/EventScheduled",
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Quando começa a Copa do Mundo 2026?",
        acceptedAnswer: {
          "@type": "Answer",
          text: `A Copa do Mundo FIFA 2026 começa em ${formatDate(COPA_INFO.inicio)} com a partida de abertura entre o México e seu adversário no Estadio Azteca, na Cidade do México. A final será em ${formatDate(COPA_INFO.fim)} no MetLife Stadium, em Nova York/Nova Jersey.`,
        },
      },
      {
        "@type": "Question",
        name: "Onde a Copa do Mundo 2026 será disputada?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "A Copa de 2026 terá três países-sede: Estados Unidos (11 cidades), Canadá (2) e México (3), totalizando 16 cidades anfitriãs.",
        },
      },
      {
        "@type": "Question",
        name: "Em qual grupo está o Brasil?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "O Brasil está no Grupo C, com Marrocos, Haiti e Escócia como adversários na primeira fase.",
        },
      },
      {
        "@type": "Question",
        name: "Onde assistir aos jogos da Copa 2026 no Brasil?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Os jogos serão transmitidos pela TV Globo (aberta), SporTV (TV paga), Globoplay (streaming) e FIFA+ (highlights gratuitos).",
        },
      },
    ],
  };

  const brasil = GRUPOS.find((g) => g.letra === "C");

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav aria-label="Breadcrumb" style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
        <Link href="/" style={{ color: "#2563eb" }}>Início</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <span>Copa do Mundo 2026</span>
      </nav>

      {/* Hero */}
      <div style={{
        background: "linear-gradient(135deg, #009739 0%, #FEDD00 50%, #002776 100%)",
        borderRadius: 20, padding: "2.5rem 2rem",
        color: "#fff", marginBottom: "2rem",
        textShadow: "0 1px 3px rgba(0,0,0,0.3)",
      }}>
        <div style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 2, opacity: 0.95, marginBottom: "0.5rem" }}>
          🏆 FIFA · {formatDate(COPA_INFO.inicio)} a {formatDate(COPA_INFO.fim)}
        </div>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 900, lineHeight: 1.1, marginBottom: "0.75rem" }}>
          Copa do Mundo 2026
        </h1>
        <p style={{ fontSize: "1.1rem", opacity: 0.95, marginBottom: "1.5rem", maxWidth: 700 }}>
          {COPA_INFO.total_times} seleções, {COPA_INFO.total_jogos} jogos, {COPA_INFO.paises_sede.length} países-sede:{" "}
          <strong>Estados Unidos, Canadá e México</strong>.
        </p>
        <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
          <Link href="/copa/jogos" style={pillStyle}>📅 Tabela de jogos (104)</Link>
          <Link href="/copa/grupos" style={pillStyle}>📋 Grupos</Link>
          <Link href="/copa/onde-assistir" style={pillStyle}>📺 Onde assistir</Link>
        </div>
      </div>

      {/* Jogos do Brasil */}
      {(() => {
        const jogosBR = getJogosBrasil();
        if (jogosBR.length === 0) return null;
        return (
          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
              🇧🇷 Jogos do Brasil na Copa 2026
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(290px, 1fr))", gap: "0.75rem" }}>
              {jogosBR.map((j) => {
                const adv = j.time1 === "Brasil" ? j.time2 : j.time1;
                const advBandeira = getBandeiraDoTime(adv);
                return (
                  <Link key={j.id} href={`/copa/jogos/${j.id}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      background: "#fff", borderRadius: 12, padding: "1rem 1.25rem",
                      border: "2px solid #009739",
                    }}>
                      <div style={{ fontSize: "0.72rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "0.4rem" }}>
                        {formatData(j.data)} · {j.horario_brasilia} (Brasília)
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem", fontSize: "1.1rem", fontWeight: 800, color: "#0f172a" }}>
                        🇧🇷 Brasil <span style={{ color: "#94a3b8", fontWeight: 400 }}>x</span> {advBandeira} {adv}
                      </div>
                      <div style={{ fontSize: "0.82rem", color: "#64748b" }}>{j.estadio !== "A confirmar" ? `${j.estadio}, ` : ""}{j.cidade}</div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })()}

      {/* Próximos jogos */}
      {(() => {
        const proximos = getProximosJogos(6);
        if (proximos.length === 0) return null;
        return (
          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
              📅 Próximos jogos
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "0.6rem" }}>
              {proximos.map((j) => (
                <Link key={j.id} href={`/copa/jogos/${j.id}`} style={{ textDecoration: "none" }}>
                  <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "0.75rem 1rem" }}>
                    <div style={{ fontSize: "0.7rem", color: "#94a3b8", textTransform: "uppercase", marginBottom: "0.3rem" }}>
                      {formatData(j.data)} · {j.horario_brasilia}
                    </div>
                    <div style={{ fontSize: "0.92rem", color: "#0f172a", fontWeight: 700 }}>
                      {getBandeiraDoTime(j.time1)} {j.time1} <span style={{ color: "#94a3b8", fontWeight: 400 }}>x</span> {getBandeiraDoTime(j.time2)} {j.time2}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            <div style={{ marginTop: "0.75rem" }}>
              <Link href="/copa/jogos" style={{ color: "#009739", fontWeight: 700, fontSize: "0.9rem" }}>
                Ver tabela completa dos 104 jogos →
              </Link>
            </div>
          </section>
        );
      })()}

      {/* Brasil em destaque */}
      {brasil && (
        <section style={{ marginBottom: "2.5rem" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
            🇧🇷 Brasil no Grupo {brasil.letra}
          </h2>
          <div style={{
            background: "#fff", borderRadius: 14, padding: "1.25rem",
            border: "2px solid #009739",
          }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "0.75rem" }}>
              {brasil.times.map((t) => (
                <div key={t.codigo} style={{
                  display: "flex", alignItems: "center", gap: "0.75rem",
                  padding: "0.75rem", background: t.nome === "Brasil" ? "#f0fdf4" : "#f8fafc",
                  border: t.nome === "Brasil" ? "1px solid #16a34a" : "1px solid #e2e8f0",
                  borderRadius: 10,
                }}>
                  <span style={{ fontSize: "1.8rem" }}>{t.bandeira}</span>
                  <span style={{ fontWeight: t.nome === "Brasil" ? 800 : 600, color: "#0f172a" }}>{t.nome}</span>
                </div>
              ))}
            </div>
            <p style={{ color: "#64748b", fontSize: "0.88rem", marginTop: "1rem", marginBottom: 0 }}>
              O Brasil estreia na primeira fase contra adversários do Grupo C. Acompanhe a tabela completa em{" "}
              <Link href="/copa/grupos" style={{ color: "#16a34a", fontWeight: 700 }}>grupos e jogos</Link>.
            </p>
          </div>
        </section>
      )}

      {/* Onde assistir */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
          📺 Onde assistir no Brasil
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
          {ONDE_ASSISTIR.map((c) => (
            <div key={c.nome} style={{
              background: "#fff", border: `1px solid ${c.cor}55`,
              borderRadius: 12, padding: "1rem",
            }}>
              <div style={{ fontSize: "1.5rem", marginBottom: "0.4rem" }}>{c.logo}</div>
              <div style={{ fontWeight: 800, color: c.cor, fontSize: "1rem", marginBottom: "0.2rem" }}>{c.nome}</div>
              <div style={{ fontSize: "0.78rem", color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: "0.5rem" }}>
                {c.tipo} · {c.preco}
              </div>
              <div style={{ fontSize: "0.85rem", color: "#475569", lineHeight: 1.5 }}>{c.cobertura}</div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "0.75rem" }}>
          <Link href="/copa/onde-assistir" style={{ color: "#2563eb", fontWeight: 700, fontSize: "0.9rem" }}>
            Ver detalhes e links de assinatura →
          </Link>
        </div>
      </section>

      {/* Sedes */}
      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
          🌎 Cidades-sede
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1rem" }}>
          {[
            { titulo: "🇺🇸 Estados Unidos", lista: SEDES.estados_unidos },
            { titulo: "🇨🇦 Canadá",          lista: SEDES.canada },
            { titulo: "🇲🇽 México",          lista: SEDES.mexico },
          ].map((s) => (
            <div key={s.titulo} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1.25rem" }}>
              <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem", fontSize: "1rem" }}>{s.titulo}</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
                {s.lista.map((c) => (
                  <span key={c} style={{ background: "#f1f5f9", color: "#475569", fontSize: "0.82rem", padding: "0.25rem 0.65rem", borderRadius: 999 }}>
                    {c}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "#f8fafc", borderRadius: 12, padding: "1.5rem", border: "1px solid #e2e8f0" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, marginBottom: "0.75rem" }}>Sobre a Copa do Mundo 2026</h2>
        <p style={{ color: "#475569", lineHeight: 1.8, fontSize: "0.92rem" }}>
          A Copa do Mundo FIFA 2026 é a 23ª edição do principal torneio de futebol entre seleções nacionais.
          É a primeira Copa do Mundo com três países-sede simultaneamente e a primeira a contar com{" "}
          <strong>48 seleções participantes</strong> — antes eram 32. O torneio começa em{" "}
          {formatDate(COPA_INFO.inicio)} no Estadio Azteca e termina em {formatDate(COPA_INFO.fim)} no MetLife Stadium.
        </p>
      </section>
    </div>
  );
}

const pillStyle: React.CSSProperties = {
  display: "inline-block",
  background: "rgba(255,255,255,0.2)",
  border: "1px solid rgba(255,255,255,0.4)",
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
