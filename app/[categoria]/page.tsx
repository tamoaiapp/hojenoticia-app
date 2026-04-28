import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getArticlesByCategory } from "@/lib/mdx";
import { getCategoryMeta, CATEGORIES } from "@/lib/categories";
import ArticleCard from "@/components/ArticleCard";

interface Props { params: Promise<{ categoria: string }> }

export async function generateStaticParams() {
  return Object.keys(CATEGORIES).map((c) => ({ categoria: c }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { categoria } = await params;
  const cat = getCategoryMeta(categoria);
  return {
    title: `${cat.emoji} ${cat.label} — Hoje Notícia`,
    description: `As melhores notícias de ${cat.label} do Brasil. Conteúdo atualizado todos os dias.`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { categoria } = await params;
  const articles = getArticlesByCategory(categoria);
  if (!Object.keys(CATEGORIES).includes(categoria) && !articles.length) notFound();
  const cat = getCategoryMeta(categoria);

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <div style={{ marginBottom: "2rem", borderBottom: `4px solid ${cat.color}`, paddingBottom: "1rem" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a" }}>{cat.emoji} {cat.label}</h1>
        <p style={{ color: "#64748b", marginTop: "0.25rem" }}>{articles.length} artigo{articles.length !== 1 ? "s" : ""} publicado{articles.length !== 1 ? "s" : ""}</p>
      </div>

      {articles.length === 0 ? (
        <p style={{ color: "#94a3b8", textAlign: "center", padding: "3rem 0" }}>Em breve novos artigos nesta categoria.</p>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.25rem" }}>
          {articles.map((a) => <ArticleCard key={`${a.category}/${a.slug}`} article={a} large />)}
        </div>
      )}
    </div>
  );
}
