import { MetadataRoute } from "next";
import { LOTERIAS_CONFIG, getAllDraws, getDrawsByLoteria } from "@/lib/loterias";
import { UFS } from "@/lib/eleicoes-config";
import { getJogos } from "@/lib/copa-jogos";

const BASE = "https://hojenoticia.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const draws = getAllDraws();
  const now = new Date();

  // lastModified do conjunto = data do mais recente publicado (não fica mentindo)
  const latestPublishedDate = draws
    .filter((d) => d.status === "publicado")
    .map((d) => d.draw_date)
    .sort()
    .reverse()[0];
  const homeLastMod = latestPublishedDate ? new Date(latestPublishedDate) : now;

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/`,
      lastModified: homeLastMod,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // Página por loteria — lastModified = data do último concurso publicado dessa loteria
  for (const lot of Object.keys(LOTERIAS_CONFIG)) {
    const lotDraws = getDrawsByLoteria(lot);
    const latest = lotDraws.find((d) => d.status === "publicado");
    entries.push({
      url: `${BASE}/loterias/${lot}`,
      lastModified: latest ? new Date(latest.draw_date) : now,
      changeFrequency: "daily",
      priority: 0.9,
    });
  }

  // Concursos individuais
  for (const d of draws) {
    entries.push({
      url: `${BASE}/loterias/${d.loteria}/${d.slug}`,
      lastModified: new Date(d.draw_date),
      changeFrequency: d.status === "aguardando" ? "daily" : "yearly",
      priority: d.status === "publicado" ? 0.7 : 0.6,
    });
  }

  // Copa do Mundo 2026
  entries.push(
    { url: `${BASE}/copa`,                 lastModified: now, changeFrequency: "daily",  priority: 0.95 },
    { url: `${BASE}/copa/grupos`,          lastModified: now, changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/copa/jogos`,           lastModified: now, changeFrequency: "daily",  priority: 0.92 },
    { url: `${BASE}/copa/onde-assistir`,   lastModified: now, changeFrequency: "weekly", priority: 0.8 },
  );
  // 104 jogos individuais
  for (const j of getJogos().jogos) {
    entries.push({
      url: `${BASE}/copa/jogos/${j.id}`,
      lastModified: new Date(j.data),
      changeFrequency: "weekly",
      priority: 0.75,
    });
  }

  // Eleições 2026
  entries.push(
    { url: `${BASE}/eleicoes-2026`,             lastModified: now, changeFrequency: "daily",  priority: 0.95 },
    { url: `${BASE}/eleicoes-2026/presidente`,  lastModified: now, changeFrequency: "daily",  priority: 0.9 },
  );
  for (const u of UFS) {
    entries.push({
      url: `${BASE}/eleicoes-2026/${u.sigla.toLowerCase()}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  // Institucional
  entries.push(
    { url: `${BASE}/contato`,     lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacidade`, lastModified: now, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/termos`,      lastModified: now, changeFrequency: "yearly", priority: 0.3 },
  );

  return entries;
}
