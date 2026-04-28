import { getAllArticles } from "@/lib/mdx";
import { CATEGORIES, getCategoryMeta } from "@/lib/categories";
import ArticleCard from "@/components/ArticleCard";
import MaisLidos from "@/components/MaisLidos";
import Link from "next/link";

export const revalidate = 3600;

export default function HomePage() {
  const all    = getAllArticles();
  const latest = all.slice(0, 6);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "3rem", alignItems: "start" }}>

        {/* ── Coluna principal ── */}
        <div>
          {/* Últimas notícias */}
          {latest.length > 0 && (
            <section style={{ marginBottom: "3rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1.25rem" }}>
                <span style={{ background: "#ef4444", color: "#fff", fontWeight: 800, fontSize: "0.75rem", padding: "0.2rem 0.6rem", borderRadius: 4, letterSpacing: 1, textTransform: "uppercase" }}>🔴 Agora</span>
                <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: "#0f172a" }}>Últimas Notícias</h1>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
                {latest.map((a) => <ArticleCard key={`${a.category}/${a.slug}`} article={a} large />)}
              </div>
            </section>
          )}

          {/* AdSense */}
          <div style={{ background: "#f1f5f9", borderRadius: 8, padding: "1.5rem", textAlign: "center", marginBottom: "3rem", color: "#94a3b8", fontSize: "0.8rem" }}>
            [Anúncio Google AdSense]
          </div>

          {/* Por categoria */}
          {Object.entries(CATEGORIES).map(([slug, { label, emoji, color }]) => {
            const articles = all.filter((a) => a.category === slug).slice(0, 4);
            if (!articles.length) return null;
            return (
              <section key={slug} style={{ marginBottom: "3rem" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "1rem", borderBottom: `3px solid ${color}`, paddingBottom: "0.5rem" }}>
                  <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a" }}>{emoji} {label}</h2>
                  <Link href={`/${slug}`} style={{ fontSize: "0.82rem", color, fontWeight: 600 }}>Ver tudo →</Link>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
                  {articles.map((a) => <ArticleCard key={`${a.category}/${a.slug}`} article={a} />)}
                </div>
              </section>
            );
          })}

          {all.length === 0 && (
            <div style={{ textAlign: "center", padding: "4rem 0", color: "#94a3b8" }}>
              <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📰</div>
              <p>Conteúdo sendo publicado em breve.</p>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <aside style={{ position: "sticky", top: "2rem" }}>
          <MaisLidos articles={all} />

          {/* AdSense sidebar */}
          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 8, padding: "2rem 1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.78rem", marginBottom: "1.5rem" }}>
            [Anúncio Sidebar]
          </div>

          {/* Categorias rápidas */}
          <div style={{ background: "#fff", borderRadius: 10, padding: "1.25rem", boxShadow: "0 1px 4px rgba(0,0,0,0.08)" }}>
            <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: "1rem", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: 1 }}>
              Editorias
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              {Object.entries(CATEGORIES).map(([slug, { label, emoji, color }]) => (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0.75rem", borderRadius: 6, background: "#f8fafc", textDecoration: "none", fontSize: "0.85rem", fontWeight: 600, color: "#1e293b", borderLeft: `3px solid ${color}` }}
                >
                  <span>{emoji}</span> {label}
                </Link>
              ))}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
