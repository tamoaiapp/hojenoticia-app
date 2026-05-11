import { MetadataRoute } from "next";
import { LOTERIAS_CONFIG, getAllDraws } from "@/lib/loterias";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = "https://hojenoticia.com";
  const draws = getAllDraws();

  return [
    { url: base, lastModified: new Date(), changeFrequency: "hourly", priority: 1 },

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

    // Institucional
    { url: `${base}/contato`,      lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${base}/privacidade`,  lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
    { url: `${base}/termos`,       lastModified: new Date(), changeFrequency: "yearly" as const, priority: 0.3 },
  ];
}
