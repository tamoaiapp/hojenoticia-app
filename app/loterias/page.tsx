import type { Metadata } from "next";
import Link from "next/link";
import { LOTERIAS_CONFIG, getDrawsByLoteria, formatDateShort } from "@/lib/loterias";

export const revalidate = 1800;
const BASE = "https://www.hojenoticia.com";
export const metadata: Metadata = {
  title: "Resultados das loterias: histórico e próximos concursos",
  description: "Consulte resultados de Quina, Lotofácil, Mega-Sena e outras loterias. Encontre o histórico por modalidade e acompanhe os próximos concursos.",
  alternates: { canonical: `${BASE}/loterias` },
  openGraph: { title: "Resultados das loterias: histórico e próximos concursos", description: "Escolha a loteria para consultar números sorteados, premiação disponível e concursos anteriores e futuros.", url: `${BASE}/loterias`, type: "website" },
};

export default function LoteriasHub() {
  const priority = ["quina", "lotofacil", "mega-sena"];
  const lotteries = [...priority, ...Object.keys(LOTERIAS_CONFIG).filter(slug => !priority.includes(slug))];
  const listLd = { "@context": "https://schema.org", "@type": "ItemList", name: "Resultados das loterias", itemListElement: lotteries.map((slug, index) => ({ "@type": "ListItem", position: index + 1, name: `Resultados da ${LOTERIAS_CONFIG[slug].name}`, url: `${BASE}/loterias/${slug}` })) };
  return <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.25rem" }}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(listLd) }} />
    <nav aria-label="Navegação estrutural" style={{ color: "#64748b", fontSize: ".88rem", marginBottom: "1.25rem" }}><Link href="/">Início</Link> / Loterias</nav>
    <header style={{ marginBottom: "2rem" }}>
      <h1 style={{ fontSize: "clamp(1.8rem, 5vw, 2.5rem)", lineHeight: 1.2, marginBottom: ".75rem" }}>Resultados das loterias</h1>
      <p style={{ color: "#475569", maxWidth: 760 }}>Escolha a modalidade para consultar os números sorteados, a premiação disponível e o histórico de concursos. Nas páginas futuras, acompanhe a confirmação da programação e a publicação do resultado após o sorteio.</p>
    </header>
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 285px), 1fr))", gap: "1rem" }}>
      {lotteries.map(slug => {
        const cfg = LOTERIAS_CONFIG[slug];
        const draws = getDrawsByLoteria(slug);
        const published = draws.filter(draw => draw.status === "publicado");
        const latest = published[0];
        const future = draws.filter(draw => draw.status === "aguardando" && draw.concurso > (latest?.concurso || 0));
        return <section key={slug} style={{ background: "#fff", border: "1px solid #e2e8f0", borderTop: `4px solid ${cfg.color}`, borderRadius: 12, padding: "1.25rem" }}>
          <h2 style={{ fontSize: "1.3rem", marginBottom: ".6rem" }}><Link href={`/loterias/${slug}`}>{cfg.emoji} {cfg.name}</Link></h2>
          <p style={{ fontSize: ".9rem", lineHeight: 1.7, color: "#475569", marginBottom: ".75rem" }}>{cfg.description}</p>
          {latest ? <p style={{ fontSize: ".9rem", marginBottom: ".75rem" }}>Último publicado: <Link href={`/loterias/${slug}/${latest.slug}`} style={{ fontWeight: 700, color: cfg.ballColor, textDecoration: "underline" }}>{cfg.name} {latest.concurso}</Link>, de {formatDateShort(latest.draw_date)}.</p> : <p style={{ fontSize: ".9rem", color: "#64748b", marginBottom: ".75rem" }}>Ainda não há resultado publicado neste arquivo.</p>}
          <nav aria-label={`Arquivo da ${cfg.name}`} style={{ display: "grid", gap: ".6rem", fontSize: ".88rem", textDecoration: "underline" }}>
            <Link href={`/loterias/${slug}#historico`}>Histórico da {cfg.name} ({published.length} concursos)</Link>
            {future.length > 0 && <Link href={`/loterias/${slug}#future-contests-title`}>Próximos concursos da {cfg.name} ({future.length})</Link>}
            <Link href={`/loterias/${slug}/estatisticas`}>Estatísticas e leitura dos resultados</Link>
          </nav>
        </section>;
      })}
    </div>
    <p style={{ marginTop: "2rem", color: "#475569" }}>Para acompanhar novas publicações, consulte as <Link href="/noticias" style={{ textDecoration: "underline" }}>notícias das loterias</Link> ou assine o <a href="/rss.xml" style={{ textDecoration: "underline" }}>feed RSS do Hoje Notícia</a>.</p>
  </div>;
}
