import { getAllArticles } from "@/lib/mdx";
import ArticleCard from "@/components/ArticleCard";
import MaisLidos from "@/components/MaisLidos";
import InfiniteArticleList from "@/components/InfiniteArticleList";
import Link from "next/link";
import { getCategoryMeta } from "@/lib/categories";

export const revalidate = 3600;

// Ordem de prioridade editorial: política em primeiro, resto misturado
const PRIORIDADE = [
  'politica','noticias','crime','fofoca','futebol',
  'entretenimento','financas','saude','tecnologia','religiao','automoveis',
]

const CAP_POR_CAT = 50 // máximo de artigos por categoria no feed — evita entretenimento dominar

export default function HomePage() {
  const all = getAllArticles()

  // Destaques: 1 artigo de cada categoria na ordem de prioridade (política primeiro)
  const usadas = new Set<string>()
  const destaque = PRIORIDADE
    .map(cat => all.find(a => a.category === cat && !usadas.has(cat) && (usadas.add(cat), true)))
    .filter(Boolean)
    .slice(0, 3) as typeof all

  // Feed: intercala categorias em ordem de prioridade, cap por categoria
  const destaqueslugs = new Set(destaque.map(a => a.slug))
  const semDestaque = all.filter(a => !destaqueslugs.has(a.slug))

  // Monta mapa por categoria respeitando a ordem de prioridade
  const porCategoria: Record<string, typeof all> = {}
  PRIORIDADE.forEach(c => { porCategoria[c] = [] })
  semDestaque.forEach(a => {
    const cat = a.category
    if (!porCategoria[cat]) porCategoria[cat] = []
    if (porCategoria[cat].length < CAP_POR_CAT) porCategoria[cat].push(a)
  })

  // Round-robin: 1 artigo de cada categoria por rodada, na ordem de prioridade
  const feed: typeof all = []
  const maxLen = Math.max(...PRIORIDADE.map(c => porCategoria[c]?.length ?? 0))
  for (let i = 0; i < maxLen; i++) {
    PRIORIDADE.forEach(c => {
      if (porCategoria[c]?.[i]) feed.push(porCategoria[c][i])
    })
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
              {PRIORIDADE.map((slug) => {
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
