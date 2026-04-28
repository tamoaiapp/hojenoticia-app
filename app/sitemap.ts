import { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/mdx";
import { CATEGORIES } from "@/lib/categories";
import { LOTERIAS_CONFIG, getAllDraws } from "@/lib/loterias";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hojenoticia.com";
  const articles = getAllArticles();
  const draws    = getAllDraws();

  return [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },

    // Categorias de notícias
    ...Object.keys(CATEGORIES).map((cat) => ({
      url: `${base}/${cat}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),

    // Artigos
    ...articles.map((a) => ({
      url: `${base}/${a.category}/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),

    // Hub de loterias
    { url: `${base}/loterias`, lastModified: new Date(), changeFrequency: "hourly" as const, priority: 0.95 },

    // Página por loteria
    ...Object.keys(LOTERIAS_CONFIG).map((lot) => ({
      url: `${base}/loterias/${lot}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.9,
    })),

    // Páginas individuais de cada concurso
    ...draws.map((d) => ({
      url: `${base}/loterias/${d.loteria}/${d.slug}`,
      lastModified: new Date(d.draw_date),
      changeFrequency: d.status === "aguardando" ? "hourly" as const : "monthly" as const,
      priority: d.status === "publicado" ? 0.85 : 0.75,
    })),
  ];
}
