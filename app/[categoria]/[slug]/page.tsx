import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getArticleBySlug, getArticlesByCategory, getAllArticles } from "@/lib/mdx";
import { getCategoryMeta } from "@/lib/categories";
import VejaTambem from "@/components/VejaTambem";
import MaisLidos from "@/components/MaisLidos";
import { formatRelativeDate, formatFullDate } from "@/lib/dateUtils";

interface Props { params: Promise<{ categoria: string; slug: string }> }

export const dynamicParams = true;
export const revalidate = 3600;  // revalida cada artigo a cada 1h

export async function generateStaticParams() {
  const articles = getAllArticles();
  return articles.map((a) => ({ categoria: a.category, slug: a.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, slug } = await params;
  const a = getArticleBySlug(categoria, slug);
  if (!a) return {};
  const image = a.image ?? (a.youtubeId ? `https://img.youtube.com/vi/${a.youtubeId}/maxresdefault.jpg` : undefined);
  const keywords = Array.isArray(a.keywords) ? a.keywords.join(", ") : a.keywords;
  const canonical = `https://hojenoticia.com/${a.category}/${slug}`;
  return {
    title: `${a.title} - Hoje Notícia`,
    description: a.description,
    keywords,
    alternates: { canonical },
    openGraph: {
      title: a.title,
      description: a.description,
      type: "article",
      publishedTime: a.date,
      siteName: "Hoje Notícia",
      locale: "pt_BR",
      url: canonical,
      ...(image ? { images: [{ url: image, width: 1280, height: 720, alt: a.title }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: a.title,
      description: a.description,
      site: "@hojenoticia",
      ...(image ? { images: [image] } : {}),
    },
    other: {
      "article:published_time": a.date,
      "article:modified_time":  a.date,
      "article:section":        a.category,
      ...(keywords ? { "news_keywords": keywords } : {}),
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { categoria, slug } = await params;
  const article = getArticleBySlug(categoria, slug);
  if (!article) notFound();

  const cat     = getCategoryMeta(article.category);
  const allArts = getAllArticles();
  const byCat   = getArticlesByCategory(article.category).filter((a) => a.slug !== slug);
  const related = byCat.slice(0, 3);
  const vejaTambem = byCat.slice(3, 7);
  const maisLidos  = allArts;

  const date    = formatRelativeDate(article.date);
  const fullDate = formatFullDate(article.date);
  const thumb   = article.image ?? (article.youtubeId ? `https://img.youtube.com/vi/${article.youtubeId}/maxresdefault.jpg` : null);
  const tags    = Array.isArray(article.keywords) ? article.keywords : [];
  const base    = "https://hojenoticia.com";

  // NewsArticle JSON-LD
  const newsLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline:        article.title,
    description:     article.description,
    datePublished:   article.date,
    dateModified:    article.date,
    author:    { "@type": "Organization", name: "Hoje Notícia", url: base },
    publisher: { "@type": "Organization", name: "Hoje Notícia", logo: { "@type": "ImageObject", url: `${base}/logo.png` } },
    mainEntityOfPage: { "@type": "WebPage", "@id": `${base}/${article.category}/${slug}` },
    ...(thumb ? { image: { "@type": "ImageObject", url: thumb, width: 1280, height: 720 } } : {}),
  };

  // BreadcrumbList JSON-LD
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: base },
      { "@type": "ListItem", position: 2, name: cat.label, item: `${base}/${article.category}` },
      { "@type": "ListItem", position: 3, name: article.title.slice(0, 50) },
    ],
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(newsLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      <div className="article-page-grid" style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "3rem", alignItems: "start" }}>

        {/* ── Artigo ── */}
        <article>
          {/* Breadcrumb semântico */}
          <nav aria-label="Breadcrumb" style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.25rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#2563eb" }}>Início</Link>
            <span>/</span>
            <Link href={`/${article.category}`} style={{ color: "#2563eb" }}>{cat.label}</Link>
            <span>/</span>
            <span style={{ color: "#64748b" }}>{article.title.slice(0, 45)}…</span>
          </nav>

          {/* Badge categoria */}
          <Link href={`/${article.category}`} style={{ textDecoration: "none" }}>
            <span style={{ color: cat.color, fontSize: "0.72rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
              {cat.label}
            </span>
          </Link>

          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", lineHeight: 1.3, margin: "0.75rem 0 0.5rem" }}>
            {article.title}
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.05rem", marginBottom: "1rem", lineHeight: 1.6 }}>{article.description}</p>

          <div style={{ display: "flex", gap: "1rem", fontSize: "0.8rem", color: "#94a3b8", marginBottom: "1.5rem", flexWrap: "wrap", alignItems: "center" }}>
            <time dateTime={article.date} title={fullDate} style={{ fontWeight: 500 }}>{date}</time>
            <span>·</span>
            <span>{article.readTime} de leitura</span>
            <span>·</span>
            <span style={{ fontWeight: 600, color: "#475569" }}>Hoje Notícia</span>
          </div>

          {/* Thumbnail */}
          {thumb && !article.youtubeId && (
            <img src={thumb} alt={article.title} style={{ width: "100%", borderRadius: 10, marginBottom: "1.5rem", maxHeight: 400, objectFit: "cover" }} />
          )}

          {/* YouTube thumbnail link (evita age-restriction iframe) */}
          {article.youtubeId && (
            <a
              href={`https://www.youtube.com/watch?v=${article.youtubeId}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "block", position: "relative", marginBottom: "1.75rem", borderRadius: 10, overflow: "hidden", aspectRatio: "16/9" }}
            >
              <img
                src={`https://img.youtube.com/vi/${article.youtubeId}/maxresdefault.jpg`}
                alt={article.title}
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                onError={(e) => { (e.currentTarget as HTMLImageElement).src = `https://img.youtube.com/vi/${article.youtubeId}/hqdefault.jpg` }}
              />
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.3)" }}>
                <div style={{ width: 68, height: 48, background: "#ff0000", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg viewBox="0 0 68 48" width="68" height="48"><path d="M66.5 7.7a8.5 8.5 0 0 0-6-6C56.2 0 34 0 34 0S11.8 0 7.5 1.7a8.5 8.5 0 0 0-6 6C0 12 0 24 0 24s0 12 1.5 16.3a8.5 8.5 0 0 0 6 6C11.8 48 34 48 34 48s22.2 0 26.5-1.7a8.5 8.5 0 0 0 6-6C68 36 68 24 68 24s0-12-1.5-16.3z" fill="#ff0000"/><path d="M45 24 27 14v20" fill="#fff"/></svg>
                </div>
              </div>
            </a>
          )}

          {/* AdSense topo */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.78rem", marginBottom: "2rem" }}>
            [Anúncio]
          </div>

          {/* Conteúdo MDX */}
          <div className="article-body">
            <MDXRemote source={article.content} />
          </div>

          {/* Tags clicáveis */}
          {tags.length > 0 && (
            <footer style={{ marginTop: "2rem", paddingTop: "1.25rem", borderTop: "1px solid #e2e8f0" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#64748b" }}>Tags:</span>
                {tags.map((tag: string) => (
                  <Link
                    key={tag}
                    href={`/${article.category}`}
                    rel="tag"
                    style={{ fontSize: "0.78rem", background: "#f1f5f9", color: "#475569", padding: "0.2rem 0.65rem", borderRadius: 20, textDecoration: "none", fontWeight: 500 }}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </footer>
          )}

          {/* AdSense pós-artigo */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.78rem", margin: "2rem 0" }}>
            [Anúncio]
          </div>

          {/* Veja Também */}
          <VejaTambem articles={vejaTambem.length ? vejaTambem : byCat.slice(0, 4)} />

          {/* Leia Também — links textuais para SEO */}
          {related.length > 0 && (
            <section aria-label="Leia também" style={{ marginTop: "2rem", background: "#f8fafc", borderRadius: 8, padding: "1.25rem", border: "1px solid #e2e8f0" }}>
              <h3 style={{ fontSize: "0.85rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: 1, marginBottom: "0.75rem" }}>
                Leia Também
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {related.map((a) => (
                  <li key={a.slug} style={{ padding: "0.4rem 0", borderBottom: "1px solid #e2e8f0" }}>
                    <Link href={`/${a.category}/${a.slug}`} style={{ color: "#2563eb", fontSize: "0.88rem", fontWeight: 600, textDecoration: "none" }}>
                      → {a.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}
        </article>

        {/* ── Sidebar ── */}
        <aside className="article-page-sidebar" style={{ position: "sticky", top: "2rem" }}>
          <MaisLidos articles={maisLidos} currentSlug={slug} />

          {/* AdSense sidebar */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "2rem 1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.78rem" }}>
            [Anúncio Sidebar]
          </div>

          {/* Mais nesta categoria */}
          {related.length > 0 && (
            <div style={{ background: "#fff", borderRadius: 10, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginTop: "1.5rem" }}>
              <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "1rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1, borderBottom: `3px solid ${cat.color}`, paddingBottom: "0.5rem" }}>
                Mais em {cat.label}
              </div>
              {related.map((a) => (
                <Link key={a.slug} href={`/${a.category}/${a.slug}`} style={{ display: "block", padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9", textDecoration: "none" }}>
                  <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", lineHeight: 1.4, marginBottom: "0.2rem" }}>{a.title}</div>
                  <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{new Date(a.date).toLocaleDateString("pt-BR")}</div>
                </Link>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
