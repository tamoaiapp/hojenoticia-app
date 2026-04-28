import Link from "next/link";
import { ArticleMeta } from "@/lib/mdx";
import { getCategoryMeta } from "@/lib/categories";

export default function VejaTambem({ articles }: { articles: ArticleMeta[] }) {
  if (!articles.length) return null;

  return (
    <section aria-label="Veja também" style={{ marginTop: "2.5rem", borderTop: "3px solid #e2e8f0", paddingTop: "1.5rem" }}>
      <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: 1, marginBottom: "1.25rem" }}>
        👀 Veja Também
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
        {articles.map((a) => {
          const cat = getCategoryMeta(a.category);
          const thumb = a.image ?? (a.youtubeId ? `https://img.youtube.com/vi/${a.youtubeId}/mqdefault.jpg` : null);
          const date = new Date(a.date).toLocaleDateString("pt-BR", { day: "numeric", month: "short" });
          return (
            <Link key={a.slug} href={`/${a.category}/${a.slug}`} style={{ display: "block", textDecoration: "none" }}>
              <article style={{ background: "#f8fafc", borderRadius: 8, overflow: "hidden", border: "1px solid #e2e8f0", height: "100%" }}>
                {thumb && (
                  <div style={{ aspectRatio: "16/9", overflow: "hidden", background: "#e2e8f0" }}>
                    <img src={thumb} alt={a.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} loading="lazy" />
                  </div>
                )}
                <div style={{ padding: "0.75rem" }}>
                  <span style={{ fontSize: "0.65rem", background: cat.color, color: "#fff", padding: "0.1rem 0.4rem", borderRadius: 3, fontWeight: 700, textTransform: "uppercase" }}>
                    {cat.label}
                  </span>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b", lineHeight: 1.4, marginTop: "0.4rem" }}>
                    {a.title.slice(0, 60)}{a.title.length > 60 ? "…" : ""}
                  </div>
                  <div style={{ fontSize: "0.72rem", color: "#94a3b8", marginTop: "0.3rem" }}>{date}</div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
