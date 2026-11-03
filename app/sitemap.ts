import { MetadataRoute } from "next";
import { LOTERIAS_CONFIG, getAllDraws, getDrawsByLoteria } from "@/lib/loterias";
import { UFS } from "@/lib/eleicoes-config";
import { getJogos } from "@/lib/copa-jogos";
import { MOEDA_INFO } from "@/lib/cambio";
import { SIGNOS_LIST } from "@/lib/horoscopo";
import { getAnosDisponiveis } from "@/lib/feriados";

const BASE = "https://www.hojenoticia.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const draws = getAllDraws();

  // lastModified do conjunto = data do mais recente publicado (não fica mentindo)
  const latestPublishedDate = draws
    .filter((d) => d.status === "publicado")
    .map((d) => d.draw_date)
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

  // Página por loteria — lastModified = data do último concurso publicado dessa loteria
  for (const lot of Object.keys(LOTERIAS_CONFIG)) {
    const lotDraws = getDrawsByLoteria(lot);
    const latest = lotDraws.find((d) => d.status === "publicado");
    const lastMod = latest ? new Date(latest.draw_date) : undefined;
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
    if (d.status !== "publicado") continue;
    entries.push({
      url: `${BASE}/loterias/${d.loteria}/${d.slug}`,
      lastModified: new Date(d.draw_date),
      changeFrequency: "yearly",
      priority: 0.7,
    });
  }

  // Copa do Mundo 2026
  entries.push(
    { url: `${BASE}/copa`,                 changeFrequency: "daily",  priority: 0.95 },
    { url: `${BASE}/copa/grupos`,          changeFrequency: "weekly", priority: 0.85 },
    { url: `${BASE}/copa/jogos`,           changeFrequency: "daily",  priority: 0.92 },
    { url: `${BASE}/copa/onde-assistir`,   changeFrequency: "weekly", priority: 0.8 },
  );
  // 104 jogos individuais
  for (const j of getJogos().jogos) {
    entries.push({
      url: `${BASE}/copa/jogos/${j.id}`,
      changeFrequency: "weekly",
      priority: 0.75,
    });
  }

  // Eleições 2026
  entries.push(
    { url: `${BASE}/eleicoes-2026`,             changeFrequency: "daily",  priority: 0.95 },
    { url: `${BASE}/eleicoes-2026/presidente`,  changeFrequency: "daily",  priority: 0.9 },
  );
  for (const u of UFS) {
    entries.push({
      url: `${BASE}/eleicoes-2026/${u.sigla.toLowerCase()}`,
      changeFrequency: "weekly",
      priority: 0.7,
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
    { url: `${BASE}/contato`,     changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacidade`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/termos`,      changeFrequency: "yearly", priority: 0.3 },
  );

  return entries;
}
