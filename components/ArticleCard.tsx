"use client";
import Link from "next/link";
import { ArticleMeta } from "@/lib/mdx";
import { getCategoryMeta } from "@/lib/categories";

export default function ArticleCard({ article, large = false }: { article: ArticleMeta; large?: boolean }) {
  const cat = getCategoryMeta(article.category);
  const thumb = article.image ?? (article.youtubeId ? `https://img.youtube.com/vi/${article.youtubeId}/maxresdefault.jpg` : null);
  const date = new Date(article.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });

  return (
    <Link href={`/${article.category}/${article.slug}`} style={{ display: "block", textDecoration: "none" }}>
      <article style={{
        background: "#fff",
        borderRadius: 10,
        overflow: "hidden",
        boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
        transition: "transform 0.15s, box-shadow 0.15s",
        height: "100%",
        cursor: "pointer",
      }}
        onMouseEnter={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "translateY(-2px)"; el.style.boxShadow = "0 4px 16px rgba(0,0,0,0.12)"; }}
        onMouseLeave={(e) => { const el = e.currentTarget as HTMLElement; el.style.transform = "none"; el.style.boxShadow = "0 1px 4px rgba(0,0,0,0.08)"; }}
      >
        {thumb && (
          <div style={{ aspectRatio: "16/9", overflow: "hidden", background: "#e2e8f0" }}>
            <img src={thumb} alt={article.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
          </div>
        )}
        <div style={{ padding: large ? "1.25rem" : "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.5rem" }}>
            <span style={{ background: cat.color, color: "#fff", fontSize: "0.7rem", fontWeight: 700, padding: "0.15rem 0.5rem", borderRadius: 4, textTransform: "uppercase", letterSpacing: "0.5px" }}>
              {cat.emoji} {cat.label}
            </span>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>{date}</span>
            <span style={{ fontSize: "0.75rem", color: "#94a3b8" }}>· {article.readTime}</span>
          </div>
          <h2 style={{ fontSize: large ? "1.2rem" : "1rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.4, marginBottom: "0.4rem" }}>
            {article.title}
          </h2>
          <p style={{ fontSize: "0.85rem", color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {article.description}
          </p>
        </div>
      </article>
    </Link>
  );
}
