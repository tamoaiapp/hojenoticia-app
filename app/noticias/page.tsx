import type { Metadata } from "next";
import Link from "next/link";
import { formatDateShort, LOTERIAS_CONFIG } from "@/lib/loterias";
import { formatPublicationTime, getNewsDraws, newsArticleUrl, NEWS_SITE_URL } from "@/lib/news";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Notícias das loterias",
  description: "Boletins das loterias publicados pelo Hoje Notícia, com fonte oficial e datas de publicação identificadas.",
  alternates: {
    canonical: `${NEWS_SITE_URL}/noticias`,
    types: { "application/rss+xml": `${NEWS_SITE_URL}/rss.xml` },
  },
  openGraph: {
    title: "Notícias das loterias | Hoje Notícia",
    url: `${NEWS_SITE_URL}/noticias`,
    type: "website",
  },
};

export default function NoticiasPage() {
  const now = Date.now();
  const draws = getNewsDraws().filter(draw => Date.parse(draw.published_at) <= now).slice(0, 50);

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <nav aria-label="Navegação estrutural" style={{ marginBottom: "1rem", fontSize: "0.9rem" }}>
        <Link href="/" style={{ color: "#166534" }}>Início</Link> / Notícias
      </nav>
      <header style={{ marginBottom: "2rem" }}>
        <h1 style={{ fontSize: "2rem", lineHeight: 1.2, marginBottom: "0.75rem" }}>Notícias das loterias</h1>
        <p style={{ maxWidth: 760, color: "#475569" }}>
          Boletins publicados pelo Hoje Notícia com dados confirmados na Caixa. A data do sorteio aparece separada do horário de publicação.
        </p>
        <p style={{ marginTop: "0.75rem", fontSize: "0.9rem", color: "#475569" }}>
          Publicação: <Link href="/sobre" style={{ color: "#166534", textDecoration: "underline" }}>Hoje Notícia</Link>.
          {" "}Responsável pelo site: <Link href="/equipe/tiago-oliveira" style={{ color: "#166534", textDecoration: "underline" }}>Tiago Oliveira</Link>.
          {" "}<a href="/rss.xml" style={{ color: "#166534", textDecoration: "underline" }}>Acompanhar por RSS</a>.
        </p>
      </header>

      {draws.length === 0 ? (
        <section style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "1.5rem" }}>
          <h2 style={{ fontSize: "1.2rem", marginBottom: "0.75rem" }}>Os próximos boletins aparecerão aqui</h2>
          <p style={{ color: "#475569", marginBottom: "1rem" }}>
            Esta seção reúne publicações com fonte oficial e horário de publicação registrado. Os resultados antigos continuam disponíveis no arquivo de loterias.
          </p>
          <Link href="/loterias" style={{ color: "#166534", fontWeight: 700, textDecoration: "underline" }}>Consultar o arquivo de resultados</Link>
        </section>
      ) : (
        <div style={{ display: "grid", gap: "1rem" }}>
          {draws.map(draw => (
            <article key={`${draw.loteria}-${draw.slug}`} style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 16, padding: "1.5rem" }}>
              <p style={{ color: "#166534", fontWeight: 700, fontSize: "0.85rem", marginBottom: "0.5rem" }}>{LOTERIAS_CONFIG[draw.loteria]?.name || draw.loteria}</p>
              <h2 style={{ fontSize: "1.35rem", lineHeight: 1.3, marginBottom: "0.75rem" }}>
                <Link href={newsArticleUrl(draw)}>{draw.title}</Link>
              </h2>
              <p style={{ fontSize: "0.85rem", color: "#64748b", marginBottom: "0.75rem" }}>
                Por <Link href="/sobre" style={{ textDecoration: "underline" }}>Hoje Notícia</Link> · Publicado em <time dateTime={draw.published_at}>{formatPublicationTime(draw.published_at)}</time>
              </p>
              <p style={{ color: "#334155", marginBottom: "0.75rem" }}>{draw.description}</p>
              <p style={{ fontSize: "0.85rem", color: "#64748b" }}>
                Sorteio de {formatDateShort(draw.draw_date)} · <a href={draw.source_url} target="_blank" rel="noopener noreferrer" style={{ color: "#166534", textDecoration: "underline" }}>Fonte oficial: Caixa</a>
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
