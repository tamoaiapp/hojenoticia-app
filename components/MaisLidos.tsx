import Link from "next/link";
import { ArticleMeta } from "@/lib/mdx";
import { getCategoryMeta } from "@/lib/categories";

export default function MaisLidos({ articles, currentSlug }: { articles: ArticleMeta[]; currentSlug?: string }) {
  const top = articles.filter((a) => a.slug !== currentSlug).slice(0, 7);
  if (!top.length) return null;

  return (
    <aside aria-label="Mais lidas" style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, padding: "1.25rem", marginBottom: "1.5rem" }}>
      <h2 style={{ fontSize: "0.75rem", fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "1.5px", margin: "0 0 1rem 0", paddingBottom: "0.6rem", borderBottom: "2px solid #dc2626" }}>
        Mais lidas
      </h2>
      <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {top.map((a, i) => {
          const cat = getCategoryMeta(a.category);
          return (
            <li key={a.slug} style={{ display: "flex", gap: "0.75rem", padding: "0.65rem 0", borderBottom: i < top.length - 1 ? "1px solid #f1f5f9" : "none" }}>
              <span style={{ fontSize: "1.3rem", fontWeight: 900, color: "#e2e8f0", minWidth: 22, lineHeight: 1.3, fontFamily: "Georgia, serif" }}>{i + 1}</span>
              <div>
                <Link href={`/${a.category}/${a.slug}`} style={{ textDecoration: "none" }}>
                  <div style={{ fontSize: "0.82rem", fontWeight: 600, color: "#1e293b", lineHeight: 1.45, marginBottom: "0.25rem" }}>
                    {a.title.slice(0, 65)}{a.title.length > 65 ? "…" : ""}
                  </div>
                </Link>
                <span style={{ fontSize: "0.68rem", color: cat.color, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.5px" }}>
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
