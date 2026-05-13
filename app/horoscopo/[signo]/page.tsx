import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getHoroscopoLatest, SIGNOS_LIST, formatDateBR } from "@/lib/horoscopo";
import AdsterraBanner from "@/components/AdsterraBanner";
import AdsterraNative from "@/components/AdsterraNative";

export const revalidate = 86400;

const BASE = "https://hojenoticia.com";

export function generateStaticParams() {
  return SIGNOS_LIST.map(s => ({ signo: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ signo: string }> }): Promise<Metadata> {
  const { signo } = await params;
  const s = SIGNOS_LIST.find(x => x.slug === signo);
  if (!s) return {};
  const data = getHoroscopoLatest();
  const dataDia = data ? formatDateBR(data.date) : "hoje";
  return {
    title: `Horóscopo ${s.name} — ${dataDia} | Hoje Notícia`,
    description: `Horóscopo de ${s.name} para ${dataDia}: amor, trabalho, dinheiro e saúde. Número e cor da sorte do dia.`,
    keywords: `horoscopo ${s.slug}, ${s.slug} hoje, ${s.name.toLowerCase()} amor, ${s.name.toLowerCase()} trabalho`,
    alternates: { canonical: `${BASE}/horoscopo/${signo}` },
  };
}

export default async function SignoPage({ params }: { params: Promise<{ signo: string }> }) {
  const { signo } = await params;
  const meta = SIGNOS_LIST.find(s => s.slug === signo);
  if (!meta) notFound();
  const data = getHoroscopoLatest();
  const previsao = data?.signos[signo];

  if (!data || !previsao) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.25rem" }}>
        <h1>{meta.name}</h1>
        <p>Previsão do dia ainda não disponível.</p>
      </div>
    );
  }

  const dataDia = formatDateBR(data.date);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: BASE },
      { "@type": "ListItem", position: 2, name: "Horóscopo", item: `${BASE}/horoscopo` },
      { "@type": "ListItem", position: 3, name: meta.name, item: `${BASE}/horoscopo/${signo}` },
    ],
  };

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `Horóscopo ${meta.name} — ${dataDia}`,
    datePublished: data.date,
    dateModified: data.updated_at,
    author: { "@type": "Organization", name: "Hoje Notícia" },
    publisher: { "@type": "Organization", name: "Hoje Notícia" },
    mainEntityOfPage: `${BASE}/horoscopo/${signo}`,
  };

  const blocos: { titulo: string; texto: string; icone: string }[] = [
    { titulo: "Visão geral do dia", texto: previsao.geral,    icone: "🌟" },
    { titulo: "Amor",               texto: previsao.amor,     icone: "❤️" },
    { titulo: "Trabalho",           texto: previsao.trabalho, icone: "💼" },
    { titulo: "Dinheiro",           texto: previsao.dinheiro, icone: "💰" },
    { titulo: "Saúde",              texto: previsao.saude,    icone: "🌿" },
  ];

  return (
    <div style={{ maxWidth: 850, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }} />

      <AdsterraBanner size="728x90" showOn="desktop" />
      <AdsterraBanner size="320x50" showOn="mobile" />

      <nav style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "1rem" }}>
        <Link href="/" style={{ color: "#64748b" }}>Início</Link> /{" "}
        <Link href="/horoscopo" style={{ color: "#64748b" }}>Horóscopo</Link> /{" "}
        <span>{meta.name}</span>
      </nav>

      <div style={{ marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: `4px solid ${meta.cor}` }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <span style={{ fontSize: "2.4rem" }}>{meta.emoji}</span>
          Horóscopo {meta.name}
        </h1>
        <p style={{ color: "#64748b", marginTop: "0.4rem" }}>
          {dataDia} · {meta.periodo}
        </p>
      </div>

      <div style={{ display: "flex", gap: "0.75rem", marginBottom: "1.5rem", flexWrap: "wrap" }}>
        <Badge label="Número da sorte" value={String(previsao.numero_sorte)} cor={meta.cor} />
        <Badge label="Cor da sorte" value={previsao.cor_sorte} cor={meta.cor} />
        <Badge label="Elemento" value={previsao.elemento} cor={meta.cor} />
        <Badge label="Regente" value={previsao.regente} cor={meta.cor} />
      </div>

      {blocos.map((b, i) => (
        <section key={b.titulo} style={{ marginBottom: "1.25rem", background: "#fff", border: "1px solid #e2e8f0", borderRadius: 12, padding: "1.25rem" }}>
          <h2 style={{ fontSize: "1.15rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.5rem", display: "flex", alignItems: "center", gap: "0.4rem" }}>
            <span>{b.icone}</span> {b.titulo}
          </h2>
          <p style={{ color: "#475569", lineHeight: 1.7, margin: 0 }}>{b.texto}</p>
          {i === 1 && <div style={{ marginTop: "1rem" }}><AdsterraNative /></div>}
        </section>
      ))}

      <section style={{ background: "#f8fafc", borderRadius: 12, padding: "1.5rem", border: "1px solid #e2e8f0", marginTop: "1.5rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem" }}>
          Outros signos
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
          {SIGNOS_LIST.filter(s => s.slug !== signo).map(s => (
            <Link key={s.slug} href={`/horoscopo/${s.slug}`}
              style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "0.5rem 0.85rem", textDecoration: "none", color: "#0f172a", fontSize: "0.88rem" }}>
              {s.emoji} {s.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Badge({ label, value, cor }: { label: string; value: string; cor: string }) {
  return (
    <div style={{ background: "#fff", border: `2px solid ${cor}`, borderRadius: 10, padding: "0.5rem 0.85rem" }}>
      <div style={{ fontSize: "0.7rem", color: "#94a3b8", fontWeight: 700, textTransform: "uppercase" }}>{label}</div>
      <div style={{ fontSize: "1rem", fontWeight: 800, color: cor, textTransform: "capitalize" }}>{value}</div>
    </div>
  );
}
