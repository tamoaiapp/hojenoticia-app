import { getAllArticles } from "@/lib/mdx";
import ArticleCard from "@/components/ArticleCard";
import MaisLidos from "@/components/MaisLidos";
import InfiniteArticleList from "@/components/InfiniteArticleList";
import Link from "next/link";
import { getCategoryMeta } from "@/lib/categories";

export const revalidate = 3600;

export default function HomePage() {
  const all = getAllArticles();

  // Destaques: 1 artigo de cada categoria diferente (ordem de prioridade)
  const prioridade = ['noticias','politica','crime','fofoca','entretenimento','futebol','financas','saude','tecnologia','religiao']
  const usadas = new Set<string>()
  const destaque = prioridade
    .map(cat => all.find(a => a.category === cat && !usadas.has(a.category) && usadas.add(a.category) !== undefined))
    .filter(Boolean)
    .slice(0, 3) as typeof all

  // Feed: tudo exceto os 3 destaques, intercalando categorias
  const destaqueslugs = new Set(destaque.map(a => a.slug))
  const semDestaque = all.filter(a => !destaqueslugs.has(a.slug))
  // Intercala: pega 1 de cada categoria ciclicamente
  const porCategoria: Record<string, typeof all> = {}
  semDestaque.forEach(a => { (porCategoria[a.category] ??= []).push(a) })
  const feed: typeof all = []
  const cats = Object.keys(porCategoria)
  const maxLen = Math.max(...cats.map(c => porCategoria[c].length))
  for (let i = 0; i < maxLen; i++) {
    cats.forEach(c => { if (porCategoria[c][i]) feed.push(porCategoria[c][i]) })
  }

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "1.5rem 1.25rem" }}>

      {/* ── Destaques (grid 3 cards) ── */}
      {destaque.length > 0 && (
        <section style={{ marginBottom: "2rem" }}>
          <div style={{ borderBottom: "2px solid #dc2626", paddingBottom: "0.4rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#dc2626", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Últimas notícias
            </span>
          </div>
          <div className="destaque-grid">
            {destaque.map((a) => <ArticleCard key={`${a.category}/${a.slug}`} article={a} large />)}
          </div>
        </section>
      )}

      <div className="home-layout">

        {/* ── Feed principal com scroll infinito ── */}
        <main>
          <div style={{ borderBottom: "2px solid #e2e8f0", paddingBottom: "0.4rem", marginBottom: "1.25rem" }}>
            <span style={{ fontSize: "0.72rem", fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "1.5px" }}>
              Todas as notícias
            </span>
          </div>
          <InfiniteArticleList articles={feed} />
        </main>

        {/* ── Sidebar ── */}
        <aside className="sidebar">
          <MaisLidos articles={all} />

          <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 4, padding: "1.5rem 1rem", textAlign: "center", color: "#94a3b8", fontSize: "0.75rem", marginBottom: "1.5rem" }}>
            Publicidade
          </div>

          {/* Editorias */}
          <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 4, padding: "1rem" }}>
            <h3 style={{ fontSize: "0.72rem", fontWeight: 800, color: "#374151", textTransform: "uppercase", letterSpacing: "1.5px", margin: "0 0 0.75rem 0", paddingBottom: "0.4rem", borderBottom: "2px solid #e2e8f0" }}>
              Editorias
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
              {["futebol","politica","fofoca","noticias","financas","saude","tecnologia","entretenimento","crime","religiao"].map((slug) => {
                const cat = getCategoryMeta(slug);
                return (
                  <Link key={slug} href={`/${slug}`} style={{ display: "block", padding: "0.4rem 0.6rem", textDecoration: "none", fontSize: "0.82rem", fontWeight: 600, color: "#374151", borderLeft: `3px solid ${cat.color}`, background: "#f8fafc" }}>
                    {cat.label}
                  </Link>
                );
              })}
            </div>
          </div>
        </aside>

      </div>
    </div>
  );
}
