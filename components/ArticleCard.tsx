"use client";
import Link from "next/link";
import { ArticleMeta } from "@/lib/mdx";
import { getCategoryMeta } from "@/lib/categories";
import { formatRelativeDate } from "@/lib/dateUtils";

export default function ArticleCard({ article, large = false }: { article: ArticleMeta; large?: boolean }) {
  const cat   = getCategoryMeta(article.category);
  const thumb = article.image ?? (article.youtubeId ? `https://img.youtube.com/vi/${article.youtubeId}/maxresdefault.jpg` : null);
  const date  = formatRelativeDate(article.date);

  return (
    <Link href={`/${article.category}/${article.slug}`} style={{ display: "block", textDecoration: "none" }}>
      <article style={{
        background: "#fff",
        border: "1px solid #e2e8f0",
        borderRadius: 4,
        overflow: "hidden",
        transition: "box-shadow 0.15s",
        height: "100%",
        cursor: "pointer",
      }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 16px rgba(0,0,0,0.10)"; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
      >
        {thumb && (
          <div style={{ aspectRatio: "16/9", overflow: "hidden", background: "#f1f5f9" }}>
            <img
              src={thumb}
              alt={article.title}
              style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", transition: "transform 0.3s" }}
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
        <div style={{ padding: large ? "1rem" : "0.875rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.4rem" }}>
            <span style={{ color: cat.color, fontSize: "0.68rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.8px" }}>
              {cat.label}
            </span>
            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>·</span>
            <span style={{ fontSize: "0.72rem", color: "#94a3b8" }}>{date}</span>
          </div>
          <h2 style={{ fontSize: large ? "1.1rem" : "0.95rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.4, marginBottom: "0.35rem" }}>
            {article.title}
          </h2>
          <p style={{ fontSize: "0.82rem", color: "#64748b", lineHeight: 1.5, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {article.description}
          </p>
        </div>
      </article>
    </Link>
  );
}
