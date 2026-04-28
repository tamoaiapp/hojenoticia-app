import { MetadataRoute } from "next";
import { getAllArticles } from "@/lib/mdx";
import { CATEGORIES } from "@/lib/categories";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hojenoticia.com";
  const articles = getAllArticles();

  return [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },
    ...Object.keys(CATEGORIES).map((cat) => ({
      url: `${base}/${cat}`,
      lastModified: new Date(),
      changeFrequency: "hourly" as const,
      priority: 0.8,
    })),
    ...articles.map((a) => ({
      url: `${base}/${a.category}/${a.slug}`,
      lastModified: new Date(a.date),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
