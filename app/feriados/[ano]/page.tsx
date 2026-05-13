import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getFeriadosAno, getAnosDisponiveis, formatDateBR, formatDateShort } from "@/lib/feriados";
import AdsterraBanner from "@/components/AdsterraBanner";
import AdsterraNative from "@/components/AdsterraNative";

const BASE = "https://hojenoticia.com";

export function generateStaticParams() {
  return getAnosDisponiveis().map(a => ({ ano: String(a) }));
}

export async function generateMetadata({ params }: { params: Promise<{ ano: string }> }): Promise<Metadata> {
  const { ano } = await params;
  const a = Number(ano);
  const data = getFeriadosAno(a);
  if (!data) return {};
  const proxNacional = data.feriados.find(f => !f.facultativo);
  return {
    title: `Feriados ${a} — Calendário Nacional Completo | Hoje Notícia`,
    description: `Lista completa dos feriados nacionais de ${a}: datas, dia da semana, fixos e móveis (Páscoa, Carnaval, Corpus Christi).${proxNacional ? ` Próximo: ${proxNacional.nome} em ${formatDateShort(proxNacional.data)}.` : ""}`,
    keywords: `feriados ${a}, feriados nacionais ${a}, carnaval ${a}, páscoa ${a}, calendário ${a}`,
    alternates: { canonical: `${BASE}/feriados/${a}` },
  };
}

export default async function FeriadosAnoPage({ params }: { params: Promise<{ ano: string }> }) {
  const { ano } = await params;
  const a = Number(ano);
  const data = getFeriadosAno(a);
  if (!data) notFound();

  const hoje = new Date().toISOString().split("T")[0];
  const proximos = data.feriados.filter(f => f.data >= hoje);
  const passados = data.feriados.filter(f => f.data < hoje);
  const proximo = proximos[0];

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Feriados nacionais ${a}`,
    url: `${BASE}/feriados/${a}`,
    itemListElement: data.feriados.map((f, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: f.nome,
      item: {
        "@type": "Event",
        name: f.nome,
        startDate: f.data,
        eventStatus: "https://schema.org/EventScheduled",
        location: { "@type": "Country", name: "Brasil" },
      },
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: BASE },
      { "@type": "ListItem", position: 2, name: "Feriados", item: `${BASE}/feriados` },
      { "@type": "ListItem", position: 3, name: String(a), item: `${BASE}/feriados/${a}` },
    ],
  };

  const anosDisponiveis = getAnosDisponiveis();

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <AdsterraBanner size="728x90" showOn="desktop" />
      <AdsterraBanner size="320x50" showOn="mobile" />

      <nav style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
        <Link href="/" style={{ color: "#64748b" }}>Início</Link> /{" "}
        <Link href="/feriados" style={{ color: "#64748b" }}>Feriados</Link> /{" "}
        <span>{a}</span>
      </nav>

      <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "4px solid #0ea5e9" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a" }}>
          📅 Feriados Nacionais {a}
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.4rem" }}>
          Lista completa dos feriados nacionais brasileiros em {a}.
        </p>
      </div>

      {proximo && (
        <div style={{ background: "linear-gradient(135deg, #0ea5e9 0%, #0369a1 100%)", color: "#fff", borderRadius: 14, padding: "1.5rem", marginBottom: "1.5rem" }}>
          <div style={{ fontSize: "0.78rem", textTransform: "uppercase", fontWeight: 800, opacity: 0.95, letterSpacing: 1.5, marginBottom: "0.4rem" }}>
            Próximo feriado
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 900 }}>
            {proximo.nome}
          </div>
          <div style={{ fontSize: "0.95rem", opacity: 0.95, marginTop: "0.3rem", textTransform: "capitalize" }}>
            {formatDateBR(proximo.data)} ({proximo.dia_semana})
            {proximo.facultativo && " — ponto facultativo"}
          </div>
        </div>
      )}

      <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 12, overflow: "hidden", border: "1px solid #e2e8f0" }}>
          <thead>
            <tr style={{ background: "#f8fafc" }}>
              <th style={th}>Data</th>
              <th style={th}>Dia da semana</th>
              <th style={th}>Feriado</th>
              <th style={th}>Tipo</th>
            </tr>
          </thead>
          <tbody>
            {data.feriados.map(f => {
              const isPassado = f.data < hoje;
              return (
                <tr key={f.data + f.nome} style={{ opacity: isPassado ? 0.55 : 1 }}>
                  <td style={td}><strong>{formatDateShort(f.data)}</strong></td>
                  <td style={{ ...td, textTransform: "capitalize" }}>{f.dia_semana}</td>
                  <td style={td}>{f.nome}</td>
                  <td style={td}>
                    {f.facultativo ? (
                      <span style={{ background: "#fef3c7", color: "#92400e", padding: "0.15rem 0.5rem", borderRadius: 6, fontSize: "0.78rem", fontWeight: 700 }}>
                        facultativo
                      </span>
                    ) : (
                      <span style={{ background: "#dcfce7", color: "#166534", padding: "0.15rem 0.5rem", borderRadius: 6, fontSize: "0.78rem", fontWeight: 700 }}>
                        nacional
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <AdsterraNative />

      {anosDisponiveis.length > 1 && (
        <section style={{ background: "#f8fafc", borderRadius: 12, padding: "1.5rem", border: "1px solid #e2e8f0", marginTop: "1.5rem" }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem" }}>
            Outros anos
          </h2>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
            {anosDisponiveis.filter(x => x !== a).map(x => (
              <Link key={x} href={`/feriados/${x}`}
                style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "0.5rem 0.85rem", textDecoration: "none", color: "#0f172a", fontWeight: 700 }}>
                {x}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section style={{ background: "#f8fafc", borderRadius: 12, padding: "1.5rem", border: "1px solid #e2e8f0", marginTop: "1rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem" }}>
          Sobre os feriados nacionais
        </h2>
        <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: "0.6rem" }}>
          Os feriados nacionais são regulamentados pelas Leis 662/49, 6.802/80, 10.607/02 e mais recentemente pela Lei 14.759/2023
          (que estabeleceu o Dia da Consciência Negra em 20 de novembro).
        </p>
        <p style={{ color: "#475569", lineHeight: 1.7, marginBottom: "0.6rem" }}>
          Carnaval e Corpus Christi são <strong>pontos facultativos</strong> no âmbito federal, mas muitos estados e municípios
          os declararam como feriados oficiais. Consulte a legislação local.
        </p>
        <p style={{ color: "#475569", lineHeight: 1.7, fontSize: "0.88rem" }}>
          {passados.length} feriados já passaram · {proximos.length} ainda virão em {a}.
        </p>
      </section>
    </div>
  );
}

const th = { padding: "0.65rem 0.85rem", textAlign: "left" as const, borderBottom: "1px solid #e2e8f0", fontWeight: 700, fontSize: "0.85rem", color: "#475569" };
const td = { padding: "0.6rem 0.85rem", borderBottom: "1px solid #f1f5f9", fontSize: "0.92rem", color: "#0f172a" };
