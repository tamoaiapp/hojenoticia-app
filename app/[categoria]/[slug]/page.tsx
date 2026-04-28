import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getArticleBySlug, getArticlesByCategory } from "@/lib/mdx";
import { getCategoryMeta } from "@/lib/categories";
import ArticleCard from "@/components/ArticleCard";

interface Props { params: Promise<{ categoria: string; slug: string }> }

export const dynamicParams = true;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria, slug } = await params;
  const a = getArticleBySlug(categoria, slug);
  if (!a) return {};
  const image = a.image ?? (a.youtubeId ? `https://img.youtube.com/vi/${a.youtubeId}/maxresdefault.jpg` : undefined);
  return {
    title: a.title,
    description: a.description,
    keywords: a.keywords,
    openGraph: {
      title: a.title,
      description: a.description,
      type: "article",
      publishedTime: a.date,
      ...(image ? { images: [image] } : {}),
    },
    other: {
      "article:published_time": a.date,
      "article:section": a.category,
    },
  };
}

export default async function ArticlePage({ params }: Props) {
  const { categoria, slug } = await params;
  const article = getArticleBySlug(categoria, slug);
  if (!article) notFound();

  const cat = getCategoryMeta(article.category);
  const related = getArticlesByCategory(article.category).filter((a) => a.slug !== slug).slice(0, 3);
  const date = new Date(article.date).toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
  const thumb = article.image ?? (article.youtubeId ? `https://img.youtube.com/vi/${article.youtubeId}/maxresdefault.jpg` : null);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.description,
    datePublished: article.date,
    dateModified: article.date,
    author: { "@type": "Organization", name: "Hoje Notícia" },
    publisher: { "@type": "Organization", name: "Hoje Notícia", logo: { "@type": "ImageObject", url: "https://hojenoticia.com/logo.png" } },
    ...(thumb ? { image: thumb } : {}),
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "3rem", alignItems: "start" }}>
        {/* Article */}
        <article>
          {/* Breadcrumb */}
          <nav style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.25rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
            <Link href="/" style={{ color: "#2563eb" }}>Início</Link>
            <span>/</span>
            <Link href={`/${article.category}`} style={{ color: "#2563eb" }}>{cat.label}</Link>
            <span>/</span>
            <span>{article.title.slice(0, 40)}...</span>
          </nav>

          {/* Category badge */}
          <span style={{ background: cat.color, color: "#fff", fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.6rem", borderRadius: 4, textTransform: "uppercase", letterSpacing: 1 }}>
            {cat.emoji} {cat.label}
          </span>

          <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", lineHeight: 1.3, margin: "0.75rem 0 0.5rem" }}>
            {article.title}
          </h1>
          <p style={{ color: "#64748b", fontSize: "1.05rem", marginBottom: "1rem", lineHeight: 1.6 }}>{article.description}</p>

          <div style={{ display: "flex", gap: "1rem", fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.5rem", flexWrap: "wrap" }}>
            <span>📅 {date}</span>
            <span>⏱ {article.readTime} de leitura</span>
          </div>

          {/* Thumbnail */}
          {thumb && !article.youtubeId && (
            <img src={thumb} alt={article.title} style={{ width: "100%", borderRadius: 10, marginBottom: "1.5rem", maxHeight: 400, objectFit: "cover" }} />
          )}

          {/* YouTube embed */}
          {article.youtubeId && (
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, marginBottom: "1.75rem", borderRadius: 10, overflow: "hidden" }}>
              <iframe
                src={`https://www.youtube.com/embed/${article.youtubeId}`}
                title={article.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
              />
            </div>
          )}

          {/* AdSense — dentro do artigo */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.78rem", marginBottom: "2rem" }}>
            [Anúncio]
          </div>

          {/* Content */}
          <div className="article-body">
            <MDXRemote source={article.content} />
          </div>

          {/* AdSense — pós artigo */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.78rem", margin: "2rem 0" }}>
            [Anúncio]
          </div>
        </article>

        {/* Sidebar */}
        <aside style={{ position: "sticky", top: "2rem" }}>
          <div style={{ background: "#fff", borderRadius: 10, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: "1.5rem" }}>
            <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "1rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>
              Mais em {cat.label}
            </div>
            {related.map((a) => (
              <Link key={a.slug} href={`/${a.category}/${a.slug}`} style={{ display: "block", padding: "0.75rem 0", borderBottom: "1px solid #f1f5f9", textDecoration: "none" }}>
                <div style={{ fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", lineHeight: 1.4, marginBottom: "0.2rem" }}>{a.title}</div>
                <div style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{new Date(a.date).toLocaleDateString("pt-BR")}</div>
              </Link>
            ))}
          </div>
          {/* AdSense sidebar */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "2rem 1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.78rem" }}>
            [Anúncio Sidebar]
          </div>
        </aside>
      </div>
    </div>
  );
}
