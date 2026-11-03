import { MetadataRoute } from "next";
import { LOTERIAS_CONFIG, getAllDraws, getDrawsByLoteria } from "@/lib/loterias";
import { MOEDA_INFO } from "@/lib/cambio";
import { SIGNOS_LIST } from "@/lib/horoscopo";
import { getAnosDisponiveis } from "@/lib/feriados";
import { publicationTime } from "@/lib/news";

const BASE = "https://www.hojenoticia.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const draws = getAllDraws();

  // Datas editoriais conhecidas; a data do sorteio não é a data de publicação.
  const latestPublishedDate = draws
    .filter((d) => d.status === "publicado")
    .map((d) => d.updated_at || d.published_at)
    .filter((date): date is string => !!date && publicationTime(date) !== null && Date.parse(date) <= Date.now())
    .sort()
    .reverse()[0];
  const homeLastMod = latestPublishedDate ? new Date(latestPublishedDate) : undefined;

  const entries: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/`,
      lastModified: homeLastMod,
      changeFrequency: "daily",
      priority: 1,
    },
  ];

  // Página por loteria: última atualização editorial conhecida.
  for (const lot of Object.keys(LOTERIAS_CONFIG)) {
    const lotDraws = getDrawsByLoteria(lot);
    const latest = lotDraws.find((d) => d.status === "publicado");
    const latestDate = latest?.updated_at || latest?.published_at;
    const lastMod = latestDate && publicationTime(latestDate) !== null && Date.parse(latestDate) <= Date.now() ? new Date(latestDate) : undefined;
    entries.push({
      url: `${BASE}/loterias/${lot}`,
      lastModified: lastMod,
      changeFrequency: "daily",
      priority: 0.9,
    });
    // Estatísticas (números mais sorteados, atrasados, etc.)
    entries.push({
      url: `${BASE}/loterias/${lot}/estatisticas`,
      lastModified: lastMod,
      changeFrequency: "daily",
      priority: 0.85,
    });
  }

  // Concursos individuais
  for (const d of draws) {
    entries.push({
      url: `${BASE}/loterias/${d.loteria}/${d.slug}`,
      lastModified: (d.updated_at || d.published_at) && publicationTime(d.updated_at || d.published_at) !== null && Date.parse((d.updated_at || d.published_at)!) <= Date.now() ? new Date((d.updated_at || d.published_at)!) : undefined,
      changeFrequency: d.status === "publicado" ? "yearly" : "daily",
      priority: d.status === "publicado" ? 0.7 : 0.6,
    });
  }

  // Cotações
  entries.push({ url: `${BASE}/cotacao`, changeFrequency: "daily", priority: 0.85 });
  for (const m of Object.values(MOEDA_INFO)) {
    entries.push({
      url: `${BASE}/cotacao/${m.slug}`,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  // Horóscopo
  entries.push({ url: `${BASE}/horoscopo`, changeFrequency: "daily", priority: 0.85 });
  for (const s of SIGNOS_LIST) {
    entries.push({
      url: `${BASE}/horoscopo/${s.slug}`,
      changeFrequency: "daily",
      priority: 0.7,
    });
  }

  // Feriados
  const anosFer = getAnosDisponiveis();
  if (anosFer.length > 0) {
    entries.push({ url: `${BASE}/feriados`, changeFrequency: "monthly", priority: 0.75 });
    for (const ano of anosFer) {
      entries.push({
        url: `${BASE}/feriados/${ano}`,
        changeFrequency: "monthly",
        priority: 0.7,
      });
    }
  }

  // Institucional
  entries.push(
    { url: `${BASE}/noticias`, changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE}/sobre`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/politica-editorial`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/correcoes`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/equipe/tiago-oliveira`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/contato`,     changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacidade`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/termos`,      changeFrequency: "yearly", priority: 0.3 },
  );

  return entries;
}
