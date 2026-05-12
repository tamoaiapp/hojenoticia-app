import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { UFS, CARGOS, getUfBySlug, ELEICAO_INFO } from "@/lib/eleicoes-config";

export const revalidate = 3600;
export const dynamicParams = false;
const BASE = "https://hojenoticia.com";

interface Props { params: Promise<{ uf: string }> }

export async function generateStaticParams() {
  return UFS.map((u) => ({ uf: u.sigla.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { uf } = await params;
  const u = getUfBySlug(uf);
  if (!u) return {};
  return {
    title: `Eleições 2026 ${u.sigla} — Candidatos no ${u.nome}`,
    description: `Candidatos a Governador, Senador e Deputados pelo ${u.nome} (${u.sigla}) nas Eleições 2026. Cobertura completa.`,
    keywords: `eleicoes 2026 ${u.sigla}, governador ${u.nome} 2026, senador ${u.sigla} 2026, candidatos ${u.sigla}`,
    alternates: { canonical: `${BASE}/eleicoes-2026/${uf}` },
  };
}

export default async function UfPage({ params }: Props) {
  const { uf } = await params;
  const u = getUfBySlug(uf);
  if (!u) notFound();

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início",         item: BASE },
      { "@type": "ListItem", position: 2, name: "Eleições 2026",  item: `${BASE}/eleicoes-2026` },
      { "@type": "ListItem", position: 3, name: u.nome,           item: `${BASE}/eleicoes-2026/${uf}` },
    ],
  };

  const estaduais = CARGOS.filter((c) => c.escopo === "estadual");

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <nav aria-label="Breadcrumb" style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
        <Link href="/" style={{ color: "#2563eb" }}>Início</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <Link href="/eleicoes-2026" style={{ color: "#2563eb" }}>Eleições 2026</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <span>{u.nome}</span>
      </nav>

      <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", marginBottom: "0.5rem" }}>
        Eleições 2026 — {u.nome} ({u.sigla})
      </h1>
      <p style={{ color: "#64748b", fontSize: "1.05rem", marginBottom: "2rem" }}>
        Região: <strong>{u.regiao}</strong>. 1º turno em {formatDate(ELEICAO_INFO.primeiro_turno)}.
      </p>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem" }}>Cargos em disputa</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "0.75rem" }}>
          {estaduais.map((c) => (
            <div key={c.slug} style={{
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12,
              padding: "1rem 1.25rem",
            }}>
              <div style={{ fontWeight: 800, color: "#0f172a", fontSize: "1rem", marginBottom: "0.4rem" }}>
                {c.nome}
              </div>
              <div style={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                Lista de candidatos em breve.
              </div>
            </div>
          ))}
        </div>
      </section>

      <section style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 12, padding: "1.25rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#78350f", marginBottom: "0.5rem" }}>
          📝 Lista de candidatos em construção
        </h2>
        <p style={{ color: "#78350f", lineHeight: 1.6, fontSize: "0.88rem", margin: 0 }}>
          Os nomes oficiais só são registrados no TSE até {formatDate(ELEICAO_INFO.prazo_registro)}.
          Esta página será atualizada com os pré-candidatos a Governador, Senador e Deputados pelo {u.nome}{" "}
          assim que mais informações forem divulgadas.
        </p>
      </section>

      <section style={{ marginBottom: "1.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, marginBottom: "1rem" }}>Outros estados</h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem" }}>
          {UFS.filter((x) => x.sigla !== u.sigla).map((x) => (
            <Link key={x.sigla} href={`/eleicoes-2026/${x.sigla.toLowerCase()}`} style={{
              background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8,
              padding: "0.4rem 0.8rem", fontSize: "0.82rem", color: "#0f172a",
              textDecoration: "none", fontWeight: 700,
            }}>
              {x.sigla}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  return new Date(Number(y), Number(m) - 1, Number(d)).toLocaleDateString("pt-BR", {
    day: "numeric", month: "long", year: "numeric",
  });
}
