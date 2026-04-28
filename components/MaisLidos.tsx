import Link from "next/link";
import { ArticleMeta } from "@/lib/mdx";
import { getCategoryMeta } from "@/lib/categories";

export default function MaisLidos({ articles, currentSlug }: { articles: ArticleMeta[]; currentSlug?: string }) {
  const top = articles.filter((a) => a.slug !== currentSlug).slice(0, 7);
  if (!top.length) return null;

  return (
    <aside aria-label="Artigos mais lidos" style={{ background: "#fff", borderRadius: 10, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)", marginBottom: "1.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem", borderBottom: "3px solid #ef4444", paddingBottom: "0.6rem" }}>
        <span style={{ fontSize: "1rem" }}>🔥</span>
        <h2 style={{ fontSize: "0.9rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: 1, margin: 0 }}>
          Mais Lidos
        </h2>
      </div>
      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {top.map((a, i) => {
          const cat = getCategoryMeta(a.category);
          return (
            <li key={a.slug} style={{ display: "flex", gap: "0.75rem", padding: "0.65rem 0", borderBottom: i < top.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <span style={{ fontSize: "1.4rem", fontWeight: 900, color: "#e2e8f0", minWidth: 24, lineHeight: 1.3 }}>{i + 1}</span>
              <div>
                <Link href={`/${a.category}/${a.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 700, color: "#1e293b", lineHeight: 1.4, marginBottom: "0.2rem" }}>
                    {a.title.slice(0, 65)}{a.title.length > 65 ? "…" : ""}
                  </div>
                </Link>
                <span style={{ fontSize: "0.7rem", background: cat.color, color: "#fff", padding: "0.1rem 0.4rem", borderRadius: 3, fontWeight: 700 }}>
                  {cat.label}
                </span>
              </div>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
