import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import AdsterraBanner from "@/components/AdsterraBanner";
import AdsterraNative from "@/components/AdsterraNative";
import FutureContests from "@/components/FutureContests";
import DrawNumbers from "@/components/DrawNumbers";
import { DRAW_GUIDES } from "@/lib/draw-editorial";
import {
  LOTERIAS_CONFIG, getDrawsByLoteria,
  formatBRL, formatDate, formatDateShort,
} from "@/lib/loterias";

export const revalidate = 1800;
export const dynamicParams = true;

const BASE = "https://www.hojenoticia.com";

interface Props { params: Promise<{ loteria: string }> }

export async function generateStaticParams() {
  return Object.keys(LOTERIAS_CONFIG).map((loteria) => ({ loteria }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { loteria } = await params;
  const cfg = LOTERIAS_CONFIG[loteria];
  if (!cfg) return {};
  const draws = getDrawsByLoteria(loteria).filter(d => d.status === "publicado");
  const latest = draws[0];
  const title = `Resultado da ${cfg.name}: ${latest ? `concurso ${latest.concurso} e ` : ""}histórico`;
  const description = latest
    ? `Resultado da ${cfg.name} ${latest.concurso}, sorteado em ${formatDateShort(latest.draw_date)}. Consulte ${loteria === "federal" ? "os bilhetes" : "os números"}, a premiação disponível e os concursos anteriores e futuros.`
    : `Acompanhe o resultado da ${cfg.name}, o histórico de concursos e a programação confirmada disponível para os próximos sorteios.`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/loterias/${loteria}` },
    openGraph: {
      title,
      description,
      url: `${BASE}/loterias/${loteria}`,
      type: "website",
    },
  };
}

export default async function LoteriasPage({ params }: Props) {
  const { loteria } = await params;
  const cfg = LOTERIAS_CONFIG[loteria];
  if (!cfg) notFound();

  const draws      = getDrawsByLoteria(loteria);
  const published  = draws.filter(d => d.status === "publicado");
  const latest     = published[0];
  const todayISO = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(new Date());
  const upcoming   = draws.filter(d => d.status === "aguardando" && d.schedule_status === "confirmed" && latest &&
    d.concurso === latest.proximo_concurso && d.draw_date === latest.proxima_data && d.draw_date >= todayISO);
  const recent     = published.slice(1, 10);
  const archive = published.slice(10);

  const pageUrl = `${BASE}/loterias/${loteria}`;

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `Histórico ${cfg.name}`,
    url: pageUrl,
    itemListElement: published.slice(0, 20).map((d, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: `Resultado da ${cfg.name} ${d.concurso}: ${formatDateShort(d.draw_date)}`,
      url: `${BASE}/loterias/${loteria}/${d.slug}`,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: BASE },
      { "@type": "ListItem", position: 2, name: "Loterias", item: `${BASE}/loterias` },
      { "@type": "ListItem", position: 3, name: cfg.name, item: pageUrl },
    ],
  };

  const faqMain: { q: string; a: string }[] = [
    {
      q: `Como funciona a ${cfg.name}?`,
      a: `${cfg.description} Os sorteios são realizados pela Caixa Econômica Federal.`,
    },
    {
      q: `Quando são os sorteios da ${cfg.name}?`,
      a: `Consulte a programação oficial da Caixa para confirmar o dia e o horário de cada concurso da ${cfg.name}. As datas podem mudar em feriados e concursos especiais. As páginas futuras indicam quando a data ainda não foi confirmada.`,
    },
  ];
  if (latest) {
    faqMain.push({
      q: `Qual foi o último resultado da ${cfg.name}?`,
      a: `O último resultado da ${cfg.name} publicado neste arquivo é o concurso ${latest.concurso}, sorteado em ${formatDate(latest.draw_date)}. Consulte os números e a premiação disponível no link desse concurso.`,
    });
  }
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqMain.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.25rem", display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
        <Link href="/" style={{ color: "#2563eb" }}>Início</Link>
        <span>/</span>
        <Link href="/loterias" style={{ color: "#2563eb" }}>Loterias</Link>
        <span>/</span>
        <span>{cfg.name}</span>
      </nav>

      {/* Hero com último resultado */}
      <div style={{
        background: cfg.color, borderRadius: 20, padding: "2rem",
        marginBottom: "2rem", color: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "2.5rem" }}>{cfg.emoji}</span>
          <div>
            <h1 style={{ fontSize: "1.8rem", fontWeight: 900, lineHeight: 1.2 }}>
              Resultado da {cfg.name}{latest ? ` ${latest.concurso}` : ""}
            </h1>
            <p style={{ opacity: 0.95, fontSize: "0.88rem", marginTop: ".5rem" }}>{cfg.description}</p>
          </div>
        </div>

        {latest ? (
          <>
            <div style={{ fontSize: "0.78rem", opacity: 0.75, marginBottom: "0.5rem", textTransform: "uppercase", letterSpacing: 1 }}>
              Último resultado publicado — Concurso {latest.concurso} · {formatDate(latest.draw_date)}
            </div>
            <DrawNumbers values={latest.numeros} color={cfg.ballColor} loteria={loteria} />
            {!!latest.numeros_segundo_sorteio?.length && <div style={{ margin: ".75rem 0" }}><p style={{ marginBottom: ".5rem" }}>Segundo sorteio</p><DrawNumbers values={latest.numeros_segundo_sorteio} color={cfg.ballColor} loteria={loteria} label="Números do segundo sorteio" /></div>}
            {!!latest.trevos_sorteados?.length && <p style={{ margin: ".75rem 0" }}><strong>Trevos:</strong> {latest.trevos_sorteados.join(" · ")}</p>}
            {latest.mes_sorte && <p style={{ margin: ".75rem 0" }}><strong>Mês da sorte:</strong> {latest.mes_sorte}</p>}
            {latest.time_coracao && <p style={{ margin: ".75rem 0" }}><strong>Time do coração:</strong> {latest.time_coracao}</p>}
            <div style={{ display: "flex", gap: "1.5rem", flexWrap: "wrap", fontSize: "0.9rem" }}>
              {loteria === "federal" ? <span>Confira a premiação de cada bilhete nos detalhes da extração.</span> : latest.ganhadores > 0 ? (
                <span>🏆 <strong>{latest.ganhadores} aposta{latest.ganhadores > 1 ? "s" : ""} ganhadora{latest.ganhadores > 1 ? "s" : ""} na faixa principal</strong>{latest.premio_principal > 0 ? ` — ${latest.premio_principal.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} por aposta` : ""}</span>
              ) : latest.acumulou === true ? (
                <span>🔄 <strong>Acumulou!</strong> Nenhum ganhador do prêmio principal</span>
              ) : <span>Consulte a premiação disponível nos detalhes do concurso.</span>}
            </div>
            <Link href={`/loterias/${loteria}/${latest.slug}`} style={{ display: "inline-block", color: "#fff", fontWeight: 800, textDecoration: "underline", marginTop: "1rem" }}>Ver resultado e premiação da {cfg.name} {latest.concurso} →</Link>
          </>
        ) : (
          <p style={{ opacity: 0.95 }}>Ainda não há resultado publicado neste arquivo. Consulte a fonte oficial da Caixa.</p>
        )}
      </div>

      <nav aria-label={`Consultar ${cfg.name}`} style={{ display: "flex", flexWrap: "wrap", gap: ".75rem 1.25rem", marginBottom: "1.5rem", fontSize: ".9rem", textDecoration: "underline" }}>
        <a href="#historico">Histórico de resultados</a>
        {draws.some(draw => draw.status === "aguardando" && draw.concurso > (latest?.concurso || 0)) && <a href="#future-contests-title">Próximos concursos</a>}
        <Link href={`/loterias/${loteria}/estatisticas`}>Estatísticas da {cfg.name}</Link>
        {loteria === "mega-sena" && <Link href="/loterias/mega-sena/probabilidades">Probabilidades da Mega-Sena</Link>}
        <a href={cfg.sourceUrl} target="_blank" rel="noopener noreferrer">Programação e regras na Caixa</a>
      </nav>
      <AdsterraBanner size="728x90" showOn="desktop" />
      <AdsterraBanner size="320x50" showOn="mobile" />

      <div className="lottery-page-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 300px", gap: "2rem", alignItems: "start" }}>

        {/* Coluna principal */}
        <div style={{ minWidth: 0 }}>
          {/* Próximos sorteios */}
          {upcoming.length > 0 && (
            <section style={{ marginBottom: "2rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: 1, marginBottom: "1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <span style={{ background: "#ef4444", color: "#fff", borderRadius: 4, padding: "0.1rem 0.4rem", fontSize: "0.7rem" }}>PRÓXIMOS</span>
                Próximo concurso informado pela Caixa
              </h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {upcoming.map(d => (
                  <Link key={d.slug} href={`/loterias/${loteria}/${d.slug}`} style={{ textDecoration: "none" }}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap",
                      background: "#fff", borderRadius: 10, padding: "0.75rem 1rem",
                      border: "1px solid #e2e8f0", justifyContent: "space-between",
                    }}>
                      <div>
                        <span style={{ fontWeight: 700, color: "#1e293b", fontSize: "0.9rem" }}>{cfg.name} {d.concurso}</span>
                        <span style={{ color: "#94a3b8", fontSize: "0.82rem", marginLeft: "0.5rem" }}>— {formatDate(d.draw_date)}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        {d.premio_principal > 0 && (
                          <span style={{ fontSize: "0.82rem", color: cfg.color, fontWeight: 700 }}>
                            {formatBRL(d.premio_principal)} estimado
                          </span>
                        )}
                        <span style={{ background: "#fef9c3", color: "#854d0e", fontSize: "0.72rem", fontWeight: 700, padding: "0.2rem 0.5rem", borderRadius: 6 }}>
                          Aguardando
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Histórico */}
          <section id="historico" style={{ scrollMarginTop: "1rem" }}>
              <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#0f172a", textTransform: "uppercase", letterSpacing: 1, marginBottom: "1rem" }}>
                Histórico de resultados da {cfg.name}
              </h2>
              <p style={{ color: "#64748b", fontSize: ".9rem", marginBottom: "1rem" }}>{published.length} concurso{published.length === 1 ? "" : "s"} publicado{published.length === 1 ? "" : "s"} neste arquivo. Abra um concurso para consultar o resultado e a premiação disponível.</p>

              {latest && <p style={{ marginBottom: "1rem", fontSize: ".9rem" }}><Link href={`/loterias/${loteria}/${latest.slug}`} style={{ color: cfg.ballColor, fontWeight: 700, textDecoration: "underline" }}>Último publicado: {cfg.name} {latest.concurso}, de {formatDateShort(latest.draw_date)}</Link></p>}

              {/* Tabela dos outros */}
              {recent.length > 0 && (
                <div style={{ background: "#fff", borderRadius: 14, overflowX: "auto", border: "1px solid #e2e8f0" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th style={{ padding: "0.65rem 1rem", textAlign: "left", fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Concurso</th>
                        <th style={{ padding: "0.65rem 1rem", textAlign: "left", fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Data</th>
                        <th style={{ padding: "0.65rem 1rem", textAlign: "left", fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>{loteria === "federal" ? "Bilhetes por prêmio" : loteria === "super-sete" ? "Colunas de 1 a 7" : loteria === "dupla-sena" ? "Primeiro e segundo sorteios" : "Números"}</th>
                        <th style={{ padding: "0.65rem 1rem", textAlign: "right", fontSize: "0.78rem", color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>Resultado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recent.map((d, i) => (
                        <tr key={d.slug} style={{ borderTop: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td style={{ padding: "0.65rem 1rem" }}>
                            <Link href={`/loterias/${loteria}/${d.slug}`} style={{ color: cfg.color, fontWeight: 700, fontSize: "0.88rem" }}>
                              {cfg.name} {d.concurso}
                            </Link>
                          </td>
                          <td style={{ padding: "0.65rem 1rem", fontSize: "0.85rem", color: "#64748b" }}>{formatDateShort(d.draw_date)}</td>
                          <td style={{ padding: "0.65rem 1rem" }}>
                            <span style={{ fontSize: ".82rem", lineHeight: 1.8, overflowWrap: "anywhere" }}>{d.numeros.join(" · ")}</span>
                            {!!d.numeros_segundo_sorteio?.length && <p style={{ fontSize: ".82rem", lineHeight: 1.8 }}>2º: {d.numeros_segundo_sorteio.join(" · ")}</p>}
                            {!!d.trevos_sorteados?.length && <p style={{ fontSize: ".82rem", lineHeight: 1.8 }}>Trevos: {d.trevos_sorteados.join(" · ")}</p>}
                          </td>
                          <td style={{ padding: "0.65rem 1rem", textAlign: "right", fontSize: "0.82rem" }}>
                            {loteria === "federal" ? <span>Ver prêmios</span> : d.ganhadores > 0
                              ? <span style={{ color: "#16a34a", fontWeight: 700 }}>🏆 {d.ganhadores} gan.</span>
                              : <span style={{ color: "#64748b" }}>{d.acumulou === true ? "Acumulou" : "Ver premiação"}</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {archive.length > 0 && <details style={{ marginTop: "1rem", padding: "1rem", border: "1px solid #e2e8f0", background: "#fff", borderRadius: 12 }}>
                <summary style={{ cursor: "pointer", fontWeight: 800 }}>Consultar mais {archive.length} resultados anteriores da {cfg.name}</summary>
                <ul style={{ listStyle: "none", padding: 0, marginTop: "1rem", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: ".7rem" }}>
                  {archive.map(draw => <li key={draw.slug}><Link href={`/loterias/${loteria}/${draw.slug}`} style={{ color: cfg.ballColor, fontSize: ".85rem", textDecoration: "underline" }}>{cfg.name} {draw.concurso} — {formatDateShort(draw.draw_date)}</Link></li>)}
                </ul>
              </details>}
            </section>

          {draws.length === 0 && (
            <div style={{ textAlign: "center", padding: "3rem", color: "#94a3b8" }}>
              <p>Nenhum concurso disponível neste arquivo.</p>
            </div>
          )}

          <section className="article-body draw-guide" aria-labelledby="consultar-resultados-title">
            <h2 id="consultar-resultados-title">Como consultar os resultados da {cfg.name}</h2>
            <p>Escolha no histórico o número do concurso ou a data que aparece no seu comprovante. Cada página reúne o resultado daquele sorteio, a premiação disponível e o endereço da fonte da Caixa. {latest ? <>O último resultado publicado neste arquivo é o <Link href={`/loterias/${loteria}/${latest.slug}`}>concurso {latest.concurso}, de {formatDate(latest.draw_date)}</Link>.</> : "Os resultados confirmados serão acrescentados conforme a divulgação oficial."}</p>
            <p>{DRAW_GUIDES[loteria].format}</p>
            <p>{DRAW_GUIDES[loteria].compare}</p>
            <p>As páginas dos próximos concursos têm situação própria: uma data informada pela Caixa identifica a programação, enquanto uma data a confirmar indica que ainda falta calendário oficial para aquele concurso. Números e rateio somente aparecem após confirmação; os valores de concursos anteriores não representam prêmios de um sorteio futuro.</p>
          </section>
          <FutureContests lottery={loteria} name={cfg.name} draws={draws.filter(draw => draw.status === "aguardando" && draw.concurso > (latest?.concurso || 0))} />
          <section style={{ margin: "2rem 0" }}>
            <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Dúvidas sobre a {cfg.name}</h2>
            {faqMain.map(item => <div key={item.q} style={{ marginBottom: "1.25rem" }}><h3 style={{ fontSize: "1rem", marginBottom: ".4rem" }}>{item.q}</h3><p style={{ color: "#475569", lineHeight: 1.7, fontSize: ".92rem" }}>{item.a}</p></div>)}
            <p style={{ fontSize: ".88rem" }}>Fonte: <a href={cfg.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>{cfg.name} no portal Loterias Caixa</a>. <Link href="/correcoes" style={{ textDecoration: "underline" }}>Informar uma correção</Link>.</p>
          </section>
          <AdsterraNative />
        </div>

        {/* Sidebar */}
        <aside style={{ position: "sticky", top: "2rem" }}>
          <AdsterraBanner size="300x250" />
          <div style={{ background: "#fff", borderRadius: 14, padding: "1.25rem", border: "1px solid #e2e8f0", marginBottom: "1.25rem" }}>
            <h2 style={{ fontWeight: 800, fontSize: "0.85rem", color: "#0f172a", textTransform: "uppercase", letterSpacing: 1, borderBottom: `3px solid ${cfg.color}`, paddingBottom: "0.5rem", marginBottom: "1rem" }}>
              Outras Loterias
            </h2>
            {Object.entries(LOTERIAS_CONFIG).filter(([s]) => s !== loteria).map(([s, c]) => (
              <Link key={s} href={`/loterias/${s}`} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.5rem 0", borderBottom: "1px solid #f1f5f9", textDecoration: "none", fontSize: "0.88rem", fontWeight: 600, color: "#1e293b" }}>
                <span>{c.emoji}</span> Resultado da {c.name}
                <span style={{ marginLeft: "auto", color: "#94a3b8", fontSize: "0.78rem" }}>Ver →</span>
              </Link>
            ))}
          </div>

        </aside>
      </div>
    </div>
  );
}
