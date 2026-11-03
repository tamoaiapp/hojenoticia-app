import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import AdsterraBanner from "@/components/AdsterraBanner";
import AdsterraNative from "@/components/AdsterraNative";
import LotterySearch from "@/components/LotterySearch";
import { LOTERIAS_CONFIG, getLatestDrawPerLoteria, getAllDraws, getDrawBySlug, formatDateShort, type DrawMeta } from "@/lib/loterias";
import { formatPublicationTime, getNewsDraws, isOfficialCaixaSource, publicationTime } from "@/lib/news";

export const revalidate = 1800;

const BASE = "https://www.hojenoticia.com";
const featured = ["quina", "lotofacil", "mega-sena"];
const allModalities = [...featured, ...Object.keys(LOTERIAS_CONFIG).filter(slug => !featured.includes(slug))];
const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const integer = new Intl.NumberFormat("pt-BR");

export const metadata: Metadata = {
  title: "Resultados de loterias: Quina, Lotofácil e Mega-Sena",
  description: "Consulte os números sorteados, o rateio e o histórico de concursos da Quina, Lotofácil, Mega-Sena e outras loterias. Boletins com dados e fonte Caixa.",
  alternates: { canonical: `${BASE}/` },
  openGraph: {
    title: "Resultados de loterias — Hoje Notícia",
    description: "Números sorteados, rateio e histórico de concursos em uma consulta direta.",
    url: `${BASE}/`,
    type: "website",
  },
};

function isCurrentDate(value: string | undefined, today: string): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T12:00:00Z`);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value && value >= today;
}

function ResultNumbers({ values, color, label = "Números sorteados" }: { values: string[]; color: string; label?: string }) {
  return <ol className="result-numbers" aria-label={label}>
    {values.map((value, index) => <li key={`${index}-${value}`} style={{ backgroundColor: color }} className={String(value).length > 2 ? "number-ticket" : undefined}>{String(value).padStart(2, "0")}</li>)}
  </ol>;
}

function LotteryCard({ slug, draw, today }: { slug: string; draw: DrawMeta | null; today: string }) {
  const cfg = LOTERIAS_CONFIG[slug];
  const officialNext = draw && isOfficialCaixaSource(draw.source_url) && isCurrentDate(draw.proxima_data, today) &&
    draw.proximo_concurso && draw.proximo_concurso > draw.concurso;
  const nextRecord = officialNext ? getDrawBySlug(slug, `concurso-${draw.proximo_concurso}`) : null;
  const sourceUrl = draw && isOfficialCaixaSource(draw.source_url) ? draw.source_url : undefined;
  const luckyMonth = draw?.mes_sorte?.trim();
  const heartTeam = draw?.time_coracao?.trim();

  return <article className="lottery-card" style={{ borderTopColor: cfg.color }}>
    <div className="lottery-card-heading">
      <h3><span className="lottery-color-dot" style={{ backgroundColor: cfg.color }} aria-hidden="true" />{cfg.name}</h3>
      {draw && <span className="contest-badge">Concurso {draw.concurso}</span>}
    </div>
    {draw ? <>
      <p className="result-date">Sorteio de <time dateTime={draw.draw_date}>{formatDateShort(draw.draw_date)}</time></p>
      {draw.numeros_segundo_sorteio?.length ? <p className="numbers-label">Primeiro sorteio</p> : null}
      <ResultNumbers values={draw.numeros} color={cfg.ballColor} />
      {!!draw.numeros_segundo_sorteio?.length && <>
        <p className="numbers-label">Segundo sorteio</p>
        <ResultNumbers values={draw.numeros_segundo_sorteio} color={cfg.ballColor} label="Números do segundo sorteio" />
      </>}
      {luckyMonth && <p className="result-extra">Mês da sorte: <strong>{luckyMonth}</strong></p>}
      {heartTeam && <p className="result-extra">Time do coração: <strong>{heartTeam}</strong></p>}
      <p className="result-summary">{draw.ganhadores > 0 ? `${integer.format(draw.ganhadores)} aposta${draw.ganhadores === 1 ? "" : "s"} ganhadora${draw.ganhadores === 1 ? "" : "s"} na faixa principal` : draw.rateio?.length ? "Sem aposta ganhadora na faixa principal" : draw.acumulou === true ? "Prêmio acumulado" : "Premiação aguardando confirmação"}
        {draw.premio_principal > 0 && <strong>{money.format(draw.premio_principal)} por aposta</strong>}
      </p>
      {officialNext && <div className="next-contest-info">
        <span>Próximo: {draw.proximo_concurso} · {formatDateShort(draw.proxima_data!)}</span>
        {!!draw.proximo_premio && <strong>Estimativa: {money.format(draw.proximo_premio)}</strong>}
      </div>}
      <div className="lottery-card-actions">
        <Link className="button button-primary" href={`/loterias/${slug}/${draw.slug}`} aria-label={`Resultado completo e rateio da ${cfg.name}, concurso ${draw.concurso}`}>Resultado e rateio <span aria-hidden="true">→</span></Link>
        <div className="card-secondary-links">
          <Link href={`/loterias/${slug}`}>Histórico</Link>
          <Link href={`/loterias/${slug}/estatisticas`}>Estatísticas</Link>
          {nextRecord && <Link href={`/loterias/${slug}/${nextRecord.slug}`}>Próximo concurso</Link>}
        </div>
        {sourceUrl && <a className="card-source" href={sourceUrl} target="_blank" rel="noopener noreferrer">Fonte: Caixa <span aria-hidden="true">↗</span></a>}
      </div>
    </> : <>
      <p className="empty-result">Ainda não há resultado publicado nesta modalidade.</p>
      <div className="lottery-card-actions"><Link className="button button-secondary" href={`/loterias/${slug}`}>Consultar modalidade <span aria-hidden="true">→</span></Link><div className="card-secondary-links"><Link href={`/loterias/${slug}/estatisticas`}>Estatísticas</Link></div></div>
    </>}
  </article>;
}

export default function HomePage() {
  const latest = getLatestDrawPerLoteria();
  const now = Date.now();
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date(now));
  const recentResults = getAllDraws().filter(draw => draw.status === "publicado").slice(0, 12);
  const news = getNewsDraws().filter(draw => {
    const published = publicationTime(draw.published_at);
    return published !== null && published <= now && published >= now - 7 * 86400000;
  }).slice(0, 3);
  const itemList = {
    "@context": "https://schema.org", "@type": "ItemList", name: "Resultados de loterias", url: `${BASE}/`,
    itemListElement: allModalities.map((slug, index) => ({ "@type": "ListItem", position: index + 1, name: LOTERIAS_CONFIG[slug].name, url: `${BASE}/loterias/${slug}` })),
  };

  return (
    <div className="home-page">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList).replace(/</g, "\\u003c") }} />
      <section className="home-hero" aria-labelledby="home-title">
        <div className="home-intro">
          <p className="eyebrow">Consulta de concursos</p>
          <h1 id="home-title">Resultados de loterias</h1>
          <p className="home-lead">Encontre os números sorteados, confira o rateio e consulte o histórico da sua loteria.</p>
          <p className="home-source-note">Dados da <a href="https://loterias.caixa.gov.br/" target="_blank" rel="noopener noreferrer">Caixa <span aria-hidden="true">↗</span></a>. Confira a data de cada sorteio.</p>
          <a className="intro-jump" href="#resultados">Ver resultados disponíveis <span aria-hidden="true">↓</span></a>
        </div>
        <LotterySearch />
      </section>

      <section id="resultados" className="home-section" aria-labelledby="featured-title">
        <div className="section-heading"><div><p className="eyebrow">Quina, Lotofácil e Mega-Sena</p><h2 id="featured-title">Últimos resultados publicados</h2></div><Link className="section-link" href="/loterias">Todas as loterias <span aria-hidden="true">→</span></Link></div>
        <div className="lottery-cards featured-cards">{featured.map(slug => <LotteryCard key={slug} slug={slug} draw={latest[slug]} today={today} />)}</div>
      </section>

      <div className="home-ad-strip" aria-label="Publicidade">
        <AdsterraBanner size="728x90" showOn="desktop" />
        <AdsterraBanner size="320x50" showOn="mobile" />
      </div>

      <section className="home-section" aria-labelledby="other-lotteries-title">
        <div className="section-heading"><div><p className="eyebrow">Outras modalidades</p><h2 id="other-lotteries-title">Continue sua consulta</h2></div></div>
        <div className="lottery-cards">{allModalities.filter(slug => !featured.includes(slug)).map(slug => <LotteryCard key={slug} slug={slug} draw={latest[slug]} today={today} />)}</div>
      </section>

      {news.length > 0 && <section className="home-section" aria-labelledby="news-title">
        <div className="section-heading"><div><p className="eyebrow">Boletins publicados</p><h2 id="news-title">Notícias recentes</h2></div><Link className="section-link" href="/noticias">Ver notícias <span aria-hidden="true">→</span></Link></div>
        <div className="home-news-grid">{news.map(draw => <article key={`${draw.loteria}-${draw.slug}`} className="home-news-card">
          <Link href={`/loterias/${draw.loteria}/${draw.slug}`} className="home-news-image" aria-label={draw.title}><Image src={`${BASE}/loterias/${draw.loteria}/${draw.slug}/imagem`} alt={`Infográfico do concurso ${draw.concurso} da ${LOTERIAS_CONFIG[draw.loteria].name}`} width={1200} height={675} unoptimized /></Link>
          <div className="home-news-body"><p className="news-category">{LOTERIAS_CONFIG[draw.loteria].name}</p><h3><Link href={`/loterias/${draw.loteria}/${draw.slug}`}>{draw.title}</Link></h3><p className="news-date">Publicado em <time dateTime={draw.published_at}>{formatPublicationTime(draw.published_at)}</time></p></div>
        </article>)}</div>
      </section>}

      {recentResults.length > 0 && <section className="home-section" aria-labelledby="archive-title">
        <div className="section-heading"><div><p className="eyebrow">Arquivo de concursos</p><h2 id="archive-title">Resultados recentes para conferir</h2></div></div>
        <ol className="recent-results-list">{recentResults.map(draw => <li key={`${draw.loteria}-${draw.slug}`}><Link href={`/loterias/${draw.loteria}/${draw.slug}`}><span><strong>{LOTERIAS_CONFIG[draw.loteria].name}</strong><span className="recent-contest">Concurso {draw.concurso}</span></span><time dateTime={draw.draw_date}>{formatDateShort(draw.draw_date)}</time><span className="recent-arrow" aria-hidden="true">→</span></Link></li>)}</ol>
      </section>}

      <div className="home-information-grid">
        <section className="home-information" aria-labelledby="source-title">
          <p className="eyebrow">Fonte e transparência</p>
          <h2 id="source-title">Uma consulta que você pode conferir</h2>
          <p>Os boletins são montados automaticamente a partir de dados oficiais da Caixa. Cada resultado tem uma página própria com a data do sorteio e o link da fonte.</p>
          <p>O Hoje Notícia é um site independente. Para conferir seu bilhete, regras e prazos, consulte também os <a href="https://loterias.caixa.gov.br/" target="_blank" rel="noopener noreferrer">canais oficiais das Loterias Caixa</a>.</p>
          <div className="information-links"><Link href="/politica-editorial">Como publicamos</Link><Link href="/correcoes">Pedir uma correção</Link><Link href="/sobre">Sobre o site</Link></div>
        </section>
        <aside className="home-square-ad" aria-label="Publicidade"><AdsterraBanner size="300x250" /></aside>
      </div>
      <div className="home-native-ad" aria-label="Publicidade"><AdsterraNative /></div>
    </div>
  );
}
