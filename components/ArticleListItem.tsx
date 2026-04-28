"use client";
import Link from "next/link";
import { ArticleMeta } from "@/lib/mdx";
import { getCategoryMeta } from "@/lib/categories";
import { formatRelativeDate } from "@/lib/dateUtils";

export default function ArticleListItem({ article }: { article: ArticleMeta }) {
  const cat   = getCategoryMeta(article.category);
  const thumb = article.image ?? (article.youtubeId ? `https://img.youtube.com/vi/${article.youtubeId}/maxresdefault.jpg` : null);
  const date  = formatRelativeDate(article.date);

  return (
    <article style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: "1.25rem", marginBottom: "1.25rem" }}>
      <Link href={`/${article.category}/${article.slug}`} style={{ textDecoration: "none", display: "flex", gap: "1.25rem", alignItems: "flex-start" }}>

        {/* Imagem */}
        {thumb && (
          <div style={{ flexShrink: 0, width: 200, height: 130, overflow: "hidden", borderRadius: 3, background: "#f1f5f9" }}
            className="article-thumb"
          >
            <img
              src={thumb}
              alt={article.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              loading="lazy"
              onError={(e) => {
                const img = e.currentTarget;
                if (article.youtubeId && img.src.includes("maxresdefault")) {
                  img.src = `https://img.youtube.com/vi/${article.youtubeId}/hqdefault.jpg`;
                }
              }}
            />
          </div>
        )}

        {/* Texto */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "0.68rem", fontWeight: 800, color: cat.color, textTransform: "uppercase", letterSpacing: "0.8px", marginBottom: "0.35rem" }}>
            {cat.label}
          </div>
          <h2 style={{ fontSize: "1.05rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.4, marginBottom: "0.5rem" }}>
            {article.title}
          </h2>
          <p style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden", marginBottom: "0.5rem" }}>
            {article.description}
          </p>
          <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>
            {date} — {cat.label}
          </span>
        </div>
      </Link>
    </article>
  );
}
