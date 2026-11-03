import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { MDXRemote } from "next-mdx-remote/rsc";
import AdsterraBanner from "@/components/AdsterraBanner";
import {
  LOTERIAS_CONFIG, getDrawBySlug, getDrawsByLoteria, formatDate, formatDateShort,
  type DrawMeta,
} from "@/lib/loterias";
import { formatPublicationTime, isNewsArticle, isOfficialCaixaSource, publicationTime } from "@/lib/news";

export const revalidate = 1800;
export const dynamicParams = true;

const BASE = "https://www.hojenoticia.com";
const RESPONSIBLE_URL = `${BASE}/equipe/tiago-oliveira`;
const currency = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const integer = new Intl.NumberFormat("pt-BR");

interface Props { params: Promise<{ loteria: string; concurso: string }> }

function knownTimestamp(value?: string): string | undefined {
  const time = publicationTime(value);
  return time !== null && time <= Date.now() ? value : undefined;
}

function publicationDates(draw: DrawMeta) {
  const publishedAt = draw.status === "publicado" ? knownTimestamp(draw.published_at) : undefined;
  const updated = draw.status === "publicado" ? knownTimestamp(draw.updated_at) : undefined;
  const updatedAt = updated && (!publishedAt || Date.parse(updated) >= Date.parse(publishedAt)) ? updated : undefined;
  return { publishedAt, updatedAt };
}

function currentNextDate(value?: string): string | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const date = new Date(`${value}T12:00:00Z`);
  if (!Number.isFinite(date.getTime()) || date.toISOString().slice(0, 10) !== value) return undefined;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(new Date());
  return value >= today ? value : undefined;
}

function structuredData(value: unknown): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

export async function generateStaticParams() {
  return Object.keys(LOTERIAS_CONFIG).flatMap(loteria =>
    getDrawsByLoteria(loteria)
      .filter(draw => draw.status === "publicado")
      .map(draw => ({ loteria, concurso: draw.slug })),
  );
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { loteria, concurso } = await params;
  const cfg = LOTERIAS_CONFIG[loteria];
  const draw = cfg ? getDrawBySlug(loteria, concurso) : null;
  if (!draw || !cfg) return {};

  const url = `${BASE}/loterias/${loteria}/${concurso}`;
  const image = `${url}/imagem`;
  const published = draw.status === "publicado";
  const { publishedAt, updatedAt } = publicationDates(draw);

  return {
    title: draw.title,
    description: draw.description,
    alternates: { canonical: url },
    robots: {
      index: published,
      follow: true,
      googleBot: { index: published, follow: true, "max-image-preview": "large" },
    },
    openGraph: {
      type: published ? "article" : "website",
      title: draw.title,
      description: draw.description,
      url,
      images: [{ url: image, width: 1200, height: 675, alt: `Infográfico do concurso ${draw.concurso} da ${cfg.name}` }],
      ...(publishedAt ? { publishedTime: publishedAt } : {}),
      ...(updatedAt ? { modifiedTime: updatedAt } : {}),
    },
    twitter: { card: "summary_large_image", title: draw.title, description: draw.description, images: [image] },
  };
}

function DrawNumbers({ numbers, color }: { numbers: string[]; color: string }) {
  return (
    <ol aria-label="Números sorteados" style={{ display: "flex", flexWrap: "wrap", gap: "0.6rem", padding: 0, margin: "1rem 0 1.5rem", listStyle: "none" }}>
      {numbers.map((number, index) => (
        <li key={`${index}-${number}`} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: 48, height: 48, padding: "0 0.65rem", borderRadius: 999, background: color, color: "#fff", fontWeight: 800, fontSize: "1rem", fontVariantNumeric: "tabular-nums" }}>
          {String(number).padStart(2, "0")}
        </li>
      ))}
    </ol>
  );
}

export default async function DrawPage({ params }: Props) {
  const { loteria, concurso } = await params;
  const cfg = LOTERIAS_CONFIG[loteria];
  const draw = cfg ? getDrawBySlug(loteria, concurso) : null;
  if (!draw || !cfg) notFound();

  const published = draw.status === "publicado";
  const pageUrl = `${BASE}/loterias/${loteria}/${concurso}`;
  const imageUrl = `${pageUrl}/imagem`;
  const { publishedAt, updatedAt } = publicationDates(draw);
  const sourceUrl = isOfficialCaixaSource(draw.source_url)
    ? draw.source_url!
    : `https://servicebus2.caixa.gov.br/portaldeloterias/api/${encodeURIComponent(cfg.apiKey)}/${draw.concurso}`;
  const sourceCheckedAt = knownTimestamp(draw.source_checked_at);
  const nextDate = currentNextDate(draw.proxima_data);
  // A seção gerada de próximo sorteio é apresentada abaixo apenas enquanto vigente.
  const articleContent = draw.content.replace(/(^|\r?\n)## Próximo Sorteio[^\r\n]*\r?\n[\s\S]*?(?=\r?\n## |$)/gi, "\n");
  const publishedDraws = getDrawsByLoteria(loteria).filter(item => item.status === "publicado");
  const previous = publishedDraws.find(item => item.concurso < draw.concurso);
  const next = [...publishedDraws].reverse().find(item => item.concurso > draw.concurso);
  const nextRecord = draw.proximo_concurso ? getDrawBySlug(loteria, `concurso-${draw.proximo_concurso}`) : null;
  const rateio = draw.rateio ?? [];
  const municipalities = draw.municipios_ganhadores ?? [];

  const articleLd = published ? {
    "@context": "https://schema.org",
    "@type": publishedAt && isNewsArticle(draw) ? "NewsArticle" : "Article",
    "@id": `${pageUrl}#article`,
    mainEntityOfPage: { "@type": "WebPage", "@id": pageUrl },
    headline: draw.title,
    description: draw.description,
    ...(publishedAt ? { datePublished: publishedAt } : {}),
    ...(updatedAt ? { dateModified: updatedAt } : {}),
    inLanguage: "pt-BR",
    isAccessibleForFree: true,
    articleSection: cfg.name,
    author: { "@type": "Organization", name: "Hoje Notícia", url: `${BASE}/sobre`, "@id": `${BASE}/#organization` },
    accountablePerson: { "@type": "Person", name: "Tiago Oliveira", url: RESPONSIBLE_URL, "@id": `${RESPONSIBLE_URL}#person` },
    publisher: { "@type": "Organization", name: "Hoje Notícia", "@id": `${BASE}/#organization`, url: BASE },
    image: { "@type": "ImageObject", url: imageUrl, width: 1200, height: 675, caption: "Infográfico: Hoje Notícia. Dados: Caixa." },
    citation: sourceUrl,
    url: pageUrl,
  } : null;

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: BASE },
      { "@type": "ListItem", position: 2, name: cfg.name, item: `${BASE}/loterias/${loteria}` },
      { "@type": "ListItem", position: 3, name: `Concurso ${draw.concurso}`, item: pageUrl },
    ],
  };

  return (
    <article style={{ maxWidth: 900, margin: "0 auto", padding: "2rem 1.25rem" }}>
      {articleLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(articleLd) }} />}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: structuredData(breadcrumbs) }} />

      <nav aria-label="Navegação estrutural" style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", color: "#475569", fontSize: "0.85rem", marginBottom: "1.5rem" }}>
        <Link href="/">Início</Link><span aria-hidden="true">/</span>
        <Link href={`/loterias/${loteria}`}>{cfg.name}</Link><span aria-hidden="true">/</span>
        <span>Concurso {draw.concurso}</span>
      </nav>

      <header>
        <Link href={`/loterias/${loteria}`} style={{ color: cfg.ballColor, fontWeight: 700 }}>{cfg.name}</Link>
        <h1 style={{ fontSize: "clamp(1.65rem, 4vw, 2.3rem)", lineHeight: 1.25, fontWeight: 900, margin: "0.65rem 0 1rem", overflowWrap: "anywhere" }}>{draw.title}</h1>
        <p style={{ color: "#475569", fontSize: "1.08rem", marginBottom: "1rem" }}>{draw.description}</p>
        <div style={{ color: "#475569", fontSize: "0.9rem", lineHeight: 1.8, marginBottom: "1.25rem" }}>
          <p>Por <Link href="/sobre" style={{ color: "#1d4ed8", textDecoration: "underline" }}>Hoje Notícia</Link>. Responsável pela publicação: <Link href="/equipe/tiago-oliveira" style={{ color: "#1d4ed8", textDecoration: "underline" }}>Tiago Oliveira</Link>.</p>
          {publishedAt && <p>Publicado em <time dateTime={publishedAt}>{formatPublicationTime(publishedAt)}</time>.</p>}
          {published && !publishedAt && <p>Registro histórico: a data original de publicação não está disponível.</p>}
          {updatedAt && updatedAt !== publishedAt && <p>Atualizado em <time dateTime={updatedAt}>{formatPublicationTime(updatedAt)}</time>.</p>}
          <p>{published ? "Data do sorteio:" : "Sorteio previsto para:"} <time dateTime={draw.draw_date}>{formatDate(draw.draw_date)}</time>.</p>
        </div>
        <p style={{ color: "#475569", fontSize: "0.85rem", borderLeft: "3px solid #cbd5e1", paddingLeft: "0.85rem", marginBottom: "1.5rem" }}>
          Boletim produzido automaticamente a partir de dados da Caixa, com validação automática dos campos.
          A identificação do responsável não indica revisão humana prévia de cada boletim.{" "}
          <Link href="/politica-editorial" style={{ color: "#1d4ed8", textDecoration: "underline" }}>Conheça o processo de publicação</Link>.
        </p>
        <figure style={{ margin: "0 0 2rem" }}>
          <Image src={imageUrl} alt={`Infográfico da ${cfg.name}, concurso ${draw.concurso}, com data do sorteio e resultados disponíveis`} width={1200} height={675} unoptimized priority style={{ width: "100%", height: "auto", borderRadius: 12 }} />
          <figcaption style={{ color: "#64748b", fontSize: "0.8rem", marginTop: "0.4rem" }}>Infográfico: Hoje Notícia. Dados: Caixa.</figcaption>
        </figure>
      </header>

      {published ? (
        <section aria-labelledby="resultado-title" style={{ background: "#fff", border: `1px solid ${cfg.color}`, borderRadius: 14, padding: "1.25rem", marginBottom: "2rem" }}>
          <h2 id="resultado-title" style={{ fontSize: "1.35rem", fontWeight: 800 }}>Resultado do concurso {draw.concurso}</h2>
          <p style={{ color: "#475569", marginTop: "0.5rem" }}>Sorteio realizado em {formatDate(draw.draw_date)}.</p>
          {draw.numeros.length > 0 && <>
            <h3 style={{ fontSize: "1rem", fontWeight: 700, marginTop: "1rem" }}>{draw.numeros_segundo_sorteio?.length ? "Primeiro sorteio" : "Números sorteados"}</h3>
            <DrawNumbers numbers={draw.numeros} color={cfg.ballColor} />
          </>}
          {!!draw.numeros_segundo_sorteio?.length && <>
            <h3 style={{ fontSize: "1rem", fontWeight: 700 }}>Segundo sorteio</h3>
            <DrawNumbers numbers={draw.numeros_segundo_sorteio} color={cfg.ballColor} />
          </>}
          {draw.mes_sorte && <p><strong>Mês da sorte:</strong> {draw.mes_sorte}.</p>}
          {draw.time_coracao && <p><strong>Time do coração:</strong> {draw.time_coracao}.</p>}
          {rateio.length > 0 || draw.ganhadores > 0
            ? <p style={{ marginTop: "0.75rem" }}><strong>Ganhadores na faixa principal:</strong> {integer.format(draw.ganhadores)}.</p>
            : <p style={{ marginTop: "0.75rem" }}>Confira a premiação por faixa na fonte oficial.</p>}
          {draw.premio_principal > 0 && <p><strong>Prêmio por aposta na faixa principal:</strong> {currency.format(draw.premio_principal)}.</p>}
          {draw.cidade && municipalities.length === 0 && <p><strong>Local informado:</strong> {draw.cidade}.</p>}
        </section>
      ) : (
        <section aria-labelledby="pending-title" style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 14, padding: "1.25rem", marginBottom: "2rem" }}>
          <h2 id="pending-title" style={{ fontSize: "1.35rem", fontWeight: 800 }}>Resultado aguardando confirmação</h2>
          <p style={{ marginTop: "0.75rem" }}>Este concurso ainda não tem resultado confirmado nesta página. Consulte a fonte oficial para acompanhar a divulgação.</p>
          {draw.premio_principal > 0 && <p style={{ marginTop: "0.75rem" }}>Estimativa de prêmio informada para o concurso: <strong>{currency.format(draw.premio_principal)}</strong>.</p>}
        </section>
      )}

      {published && rateio.length > 0 && (
        <section aria-labelledby="rateio-title" style={{ marginBottom: "2rem" }}>
          <h2 id="rateio-title" style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.75rem" }}>Rateio informado pela Caixa</h2>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", background: "#fff", fontSize: "0.92rem" }}>
              <thead><tr style={{ background: "#e2e8f0", textAlign: "left" }}>
                <th scope="col" style={{ padding: "0.75rem" }}>Faixa</th><th scope="col" style={{ padding: "0.75rem" }}>Acertos</th>
                <th scope="col" style={{ padding: "0.75rem" }}>Apostas ganhadoras</th><th scope="col" style={{ padding: "0.75rem" }}>Prêmio por aposta</th>
              </tr></thead>
              <tbody>{rateio.map((item, index) => <tr key={`${item.faixa}-${index}`} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "0.75rem" }}>{item.faixa}</td><td style={{ padding: "0.75rem" }}>{item.descricao || `Faixa ${item.faixa}`}</td>
                <td style={{ padding: "0.75rem" }}>{integer.format(item.ganhadores)}</td><td style={{ padding: "0.75rem", whiteSpace: "nowrap" }}>{currency.format(item.premio)}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>
      )}

      {published && municipalities.length > 0 && (
        <section aria-labelledby="municipios-title" style={{ marginBottom: "2rem" }}>
          <h2 id="municipios-title" style={{ fontSize: "1.35rem", fontWeight: 800, marginBottom: "0.75rem" }}>Municípios informados pela Caixa</h2>
          <ul style={{ paddingLeft: "1.25rem", lineHeight: 1.9 }}>
            {municipalities.map((item, index) => <li key={`${item.municipio}-${item.uf}-${index}`}>
              {item.municipio}{item.uf ? ` (${item.uf})` : ""}: {integer.format(item.ganhadores)} aposta{item.ganhadores === 1 ? "" : "s"} ganhadora{item.ganhadores === 1 ? "" : "s"}.
            </li>)}
          </ul>
        </section>
      )}

      {articleContent.trim() && <div className="article-body" style={{ marginBottom: "2rem" }}><MDXRemote source={articleContent} /></div>}

      {nextDate && draw.proximo_concurso && (
        <section style={{ marginBottom: "2rem", padding: "1.25rem", border: "1px solid #cbd5e1", borderRadius: 12 }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800 }}>Próximo concurso informado</h2>
          <p style={{ marginTop: "0.5rem" }}>Concurso {draw.proximo_concurso}, previsto para {formatDate(nextDate)}.</p>
          {!!draw.proximo_premio && <p>Estimativa de prêmio: {currency.format(draw.proximo_premio)}.</p>}
          {nextRecord && <Link href={`/loterias/${loteria}/${nextRecord.slug}`} style={{ color: "#1d4ed8", textDecoration: "underline" }}>Ver página do concurso {draw.proximo_concurso}</Link>}
        </section>
      )}

      <section aria-labelledby="fonte-title" style={{ borderTop: "1px solid #cbd5e1", paddingTop: "1.25rem", marginBottom: "2rem", color: "#475569", lineHeight: 1.8 }}>
        <h2 id="fonte-title" style={{ fontSize: "1.1rem", fontWeight: 800, color: "#1e293b" }}>Fonte e correções</h2>
        <p><a href={sourceUrl} target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", textDecoration: "underline", overflowWrap: "anywhere" }}>Dados oficiais da Caixa — concurso {draw.concurso}</a>.</p>
        {sourceCheckedAt && <p>Consulta à fonte em <time dateTime={sourceCheckedAt}>{formatPublicationTime(sourceCheckedAt)}</time>.</p>}
        <p>O Hoje Notícia é independente da Caixa. A conferência definitiva do bilhete e das regras deve ser feita nos <a href="https://loterias.caixa.gov.br/" target="_blank" rel="noopener noreferrer" style={{ color: "#1d4ed8", textDecoration: "underline" }}>canais oficiais das Loterias Caixa</a>.</p>
        <p>Encontrou um erro? <Link href="/correcoes" style={{ color: "#1d4ed8", textDecoration: "underline" }}>Veja como pedir uma correção</Link>.</p>
      </section>

      <aside aria-label="Publicidade" style={{ margin: "2rem 0", textAlign: "center" }}>
        <p style={{ color: "#64748b", fontSize: "0.75rem" }}>Publicidade</p>
        <AdsterraBanner size="300x250" />
      </aside>

      <nav aria-label="Arquivo de concursos" style={{ display: "flex", flexWrap: "wrap", gap: "1rem", justifyContent: "space-between", borderTop: "1px solid #cbd5e1", paddingTop: "1.25rem", lineHeight: 1.8 }}>
        {previous && <Link href={`/loterias/${loteria}/${previous.slug}`} style={{ color: "#1d4ed8" }}>← Concurso {previous.concurso} ({formatDateShort(previous.draw_date)})</Link>}
        {next && <Link href={`/loterias/${loteria}/${next.slug}`} style={{ color: "#1d4ed8" }}>Concurso {next.concurso} ({formatDateShort(next.draw_date)}) →</Link>}
      </nav>
      <p style={{ marginTop: "1.25rem" }}><Link href={`/loterias/${loteria}`} style={{ color: "#1d4ed8", textDecoration: "underline" }}>Ver o histórico de resultados da {cfg.name}</Link>.</p>
    </article>
  );
}
