import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { LOTERIAS_CONFIG } from "@/lib/loterias-config";
import { calcularEstatisticas, type NumeroFrequencia } from "@/lib/estatisticas";

export const revalidate = 86400; // 1 dia
export const dynamicParams = false;
const BASE = "https://www.hojenoticia.com";

interface Props { params: Promise<{ loteria: string }> }

export async function generateStaticParams() {
  return Object.keys(LOTERIAS_CONFIG).map((loteria) => ({ loteria }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { loteria } = await params;
  const cfg = LOTERIAS_CONFIG[loteria];
  if (!cfg) return {};
  const positional = loteria === "federal" || loteria === "super-sete";
  const title = positional ? `Estatísticas da ${cfg.name}: como consultar os resultados` : `Estatísticas da ${cfg.name}: números mais sorteados`;
  const description = positional
    ? `Entenda a leitura dos resultados da ${cfg.name} e consulte os concursos publicados. ${loteria === "federal" ? "Os bilhetes são identificados por ordem de prêmio." : "Cada algarismo pertence a uma das sete colunas."}`
    : `Consulte a frequência dos números da ${cfg.name} nos concursos publicados no Hoje Notícia, os intervalos sem aparecer e a distribuição de pares e ímpares.`;
  return {
    title,
    description,
    alternates: { canonical: `${BASE}/loterias/${loteria}/estatisticas` },
    openGraph: {
      title,
      description,
      url: `${BASE}/loterias/${loteria}/estatisticas`,
      type: "website",
    },
  };
}

export default async function EstatisticasPage({ params }: Props) {
  const { loteria } = await params;
  const cfg = LOTERIAS_CONFIG[loteria];
  if (!cfg) notFound();

  const stats = calcularEstatisticas(loteria);
  if (!stats) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.25rem", textAlign: "center" }}>
        <h1 style={{ fontSize: "1.5rem", color: "#0f172a" }}>Estatísticas da {cfg.name}: consulta dos resultados</h1>
        <p style={{ color: "#64748b", marginTop: "1rem" }}>
          {loteria === "federal" ? "A Federal identifica bilhetes por ordem de prêmio. Uma frequência única de dezenas não representa esse formato de sorteio." : loteria === "super-sete" ? "No Super Sete, cada algarismo pertence a uma coluna. Uma frequência que mistura as sete colunas não descreve o resultado por posição. A análise por coluna ainda não está disponível." : "Ainda não há concursos publicados suficientes neste arquivo para apresentar a frequência dos números."}
        </p>
        <p style={{ marginTop: "1rem" }}><Link href={`/loterias/${loteria}`} style={{ color: cfg.ballColor, textDecoration: "underline", fontWeight: 700 }}>Consultar resultados e concursos da {cfg.name}</Link></p>
        <p style={{ marginTop: "1rem" }}><a href={cfg.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>Regras e programação da {cfg.name} na Caixa</a></p>
      </div>
    );
  }

  const maxFreq = stats.maisSorteados[0]?.vezes ?? 1;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início",         item: BASE },
      { "@type": "ListItem", position: 2, name: cfg.name,         item: `${BASE}/loterias/${loteria}` },
      { "@type": "ListItem", position: 3, name: "Estatísticas",   item: `${BASE}/loterias/${loteria}/estatisticas` },
    ],
  };

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: `Quais os números mais sorteados na ${cfg.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Na amostra de ${stats.totalConcursos} concursos publicados neste site, os números com maior frequência são: ${stats.maisSorteados.map((n) => n.numero).join(", ")}. O número ${stats.maisSorteados[0].numero} aparece ${stats.maisSorteados[0].vezes} vezes. A amostra pode ter lacunas e não representa necessariamente todo o histórico da modalidade.`,
        },
      },
      {
        "@type": "Question",
        name: `Quais números estão mais atrasados na ${cfg.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: stats.maisAtrasados.length > 0
            ? `Entre os maiores intervalos sem aparecer na amostra estão: ${stats.maisAtrasados.slice(0, 5).map((n) => `${n.numero} (${n.atrasoConcursos} concursos observados)`).join(", ")}. Esse intervalo conta apenas os concursos disponíveis neste arquivo e não aumenta a chance de um número sair.`
            : "Dados insuficientes.",
        },
      },
      {
        "@type": "Question",
        name: `É possível prever os números da ${cfg.name}?`,
        acceptedAnswer: {
          "@type": "Answer",
          text: `Não. Cada sorteio é independente — o histórico não influencia o próximo. As estatísticas mostram padrões passados mas não garantem resultados futuros. Use os dados como curiosidade, não como estratégia de aposta segura.`,
        },
      },
    ],
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <nav aria-label="Breadcrumb" style={{ fontSize: "0.82rem", color: "#94a3b8", marginBottom: "1.25rem" }}>
        <Link href="/" style={{ color: "#2563eb" }}>Início</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <Link href={`/loterias/${loteria}`} style={{ color: "#2563eb" }}>{cfg.name}</Link>
        <span style={{ margin: "0 0.4rem" }}>/</span>
        <span>Estatísticas</span>
      </nav>

      {/* Hero */}
      <div style={{
        background: cfg.color, borderRadius: 20, padding: "2rem", color: "#fff", marginBottom: "2rem",
      }}>
        <div style={{ fontSize: "0.85rem", textTransform: "uppercase", letterSpacing: 2, opacity: 0.9, marginBottom: "0.5rem" }}>
          {cfg.emoji} Estatísticas
        </div>
        <h1 style={{ fontSize: "2rem", fontWeight: 900, lineHeight: 1.2, marginBottom: "0.5rem" }}>
          Estatísticas da {cfg.name}: números mais sorteados
        </h1>
        <p style={{ fontSize: "1rem", opacity: 0.95 }}>
          Análise de <strong>{stats.totalConcursos} concursos</strong> publicados neste site. Último sorteio da amostra: {stats.ultimaAtualizacao.split("-").reverse().join("/")}.
        </p>
        <p style={{ fontSize: ".9rem", opacity: .95, marginTop: ".75rem" }}>O arquivo pode ter lacunas. A frequência descreve a amostra disponível e não prevê o próximo sorteio.{loteria === "dupla-sena" ? " Esta análise considera apenas o primeiro sorteio de cada concurso." : loteria === "maismilionaria" ? " Esta análise considera apenas as dezenas, sem os trevos." : ""}</p>
        {loteria === "mega-sena" && <p style={{ marginTop: "1rem" }}><Link href="/loterias/mega-sena/probabilidades" style={{ color: "#fff", textDecoration: "underline", fontWeight: 700 }}>Entenda as probabilidades de sena, quina e quadra →</Link></p>}
      </div>

      {/* Mais sorteados */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
          🔥 Top 10 Mais Sorteados
        </h2>
        <NumeroBarGrid items={stats.maisSorteados} maxFreq={maxFreq} cor={cfg.color} ballColor={cfg.ballColor} />
      </section>

      {/* Mais atrasados */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
          ⏳ Top 10 Mais Atrasados
        </h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem", marginBottom: "1rem" }}>
          Números com mais concursos da amostra desde a última aparição. O intervalo considera somente os concursos disponíveis neste arquivo.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: "0.75rem" }}>
          {stats.maisAtrasados.map((n) => (
            <div key={n.numero} style={{
              background: "#fff", border: "1px solid #fbbf24",
              borderRadius: 12, padding: "0.9rem", textAlign: "center",
            }}>
              <div style={{ display: "inline-flex", alignItems: "center", justifyContent: "center",
                width: 48, height: 48, borderRadius: "50%", background: "#f59e0b", color: "#fff",
                fontWeight: 900, fontSize: "1rem", marginBottom: "0.5rem" }}>
                {n.numero}
              </div>
              <div style={{ fontSize: "0.82rem", color: "#0f172a", fontWeight: 700 }}>
                {n.atrasoConcursos} concursos da amostra
              </div>
              <div style={{ fontSize: "0.72rem", color: "#64748b" }}>desde a última aparição</div>
            </div>
          ))}
        </div>
      </section>

      {/* Pares vs ímpares */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
          ⚖️ Pares vs Ímpares
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <PieCard
            label="Números pares"
            qtd={stats.paresImpares.pares}
            total={stats.paresImpares.pares + stats.paresImpares.impares}
            cor="#3b82f6"
          />
          <PieCard
            label="Números ímpares"
            qtd={stats.paresImpares.impares}
            total={stats.paresImpares.pares + stats.paresImpares.impares}
            cor="#ef4444"
          />
        </div>
      </section>

      {/* Menos sorteados */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
          ❄️ Top 10 Menos Sorteados
        </h2>
        <NumeroBarGrid items={stats.menosSorteados} maxFreq={maxFreq} cor="#94a3b8" ballColor="#cbd5e1" />
      </section>

      {/* Tabela completa */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.3rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
          📊 Frequência completa ({stats.totalNumeros} números)
        </h2>
        <p style={{ color: "#475569", fontSize: ".9rem", marginBottom: "1rem" }}>A porcentagem indica a parcela dos {stats.totalConcursos} concursos da amostra em que o número apareceu. O traço no intervalo indica que o número ainda não apareceu nesta amostra.</p>
        <div style={{ background: "#fff", borderRadius: 12, padding: "1rem", border: "1px solid #e2e8f0", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.88rem" }}>
            <thead>
              <tr style={{ background: "#f8fafc" }}>
                <th style={{ padding: "0.5rem", textAlign: "left", color: "#64748b", fontWeight: 700 }}>Nº</th>
                <th style={{ padding: "0.5rem", textAlign: "right", color: "#64748b", fontWeight: 700 }}>Vezes</th>
                <th style={{ padding: "0.5rem", textAlign: "right", color: "#64748b", fontWeight: 700 }}>% dos concursos</th>
                <th style={{ padding: "0.5rem", textAlign: "right", color: "#64748b", fontWeight: 700 }}>Concursos da amostra sem sair</th>
              </tr>
            </thead>
            <tbody>
              {[...stats.frequencias].sort((a, b) => Number(a.numero) - Number(b.numero)).map((f, i) => (
                <tr key={f.numero} style={{ borderTop: "1px solid #f1f5f9", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                  <td style={{ padding: "0.45rem", fontWeight: 700, color: "#0f172a" }}>{f.numero}</td>
                  <td style={{ padding: "0.45rem", textAlign: "right", color: "#475569" }}>{f.vezes}</td>
                  <td style={{ padding: "0.45rem", textAlign: "right", color: "#475569" }}>{f.percentual.toFixed(1)}%</td>
                  <td style={{ padding: "0.45rem", textAlign: "right", color: f.atrasoConcursos && f.atrasoConcursos > 10 ? "#f59e0b" : "#94a3b8" }}>
                    {f.atrasoConcursos ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Disclaimer */}
      <section style={{ background: "#fef3c7", border: "1px solid #fbbf24", borderRadius: 12, padding: "1.25rem", marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1rem", fontWeight: 800, color: "#78350f", marginBottom: "0.5rem" }}>
          Como interpretar estas estatísticas
        </h2>
        <p style={{ color: "#78350f", fontSize: "0.9rem", lineHeight: 1.7, margin: 0 }}>
          Os sorteios da {cfg.name} são <strong>independentes</strong> — cada novo concurso tem a mesma probabilidade
          matemática para qualquer número, independente do histórico anterior. Os dados acima mostram <em>padrões passados</em>
          mas não preveem resultados futuros. Use como curiosidade, não como estratégia de aposta.
        </p>
      </section>

      <section style={{ marginBottom: "2rem" }}>
        <h2 style={{ fontSize: "1.3rem", marginBottom: "1rem" }}>Dúvidas sobre as estatísticas da {cfg.name}</h2>
        {faqLd.mainEntity.map(item => <div key={item.name} style={{ marginBottom: "1.25rem" }}><h3 style={{ fontSize: "1rem", marginBottom: ".4rem" }}>{item.name}</h3><p style={{ color: "#475569", lineHeight: 1.7, fontSize: ".92rem" }}>{item.acceptedAnswer.text}</p></div>)}
        <p style={{ fontSize: ".88rem" }}>Consulte as <a href={cfg.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "underline" }}>regras da {cfg.name} na Caixa</a> e o <Link href={`/loterias/${loteria}#historico`} style={{ textDecoration: "underline" }}>histórico de resultados usado na amostra</Link>.</p>
      </section>
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <Link href={`/loterias/${loteria}`} style={{ color: cfg.color, fontWeight: 700, textDecoration: "none" }}>
          ← Ver últimos resultados da {cfg.name}
        </Link>
      </div>
    </div>
  );
}

function NumeroBarGrid({
  items, maxFreq, cor, ballColor,
}: {
  items: NumeroFrequencia[];
  maxFreq: number;
  cor: string;
  ballColor: string;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      {items.map((f) => {
        const pct = maxFreq > 0 ? (f.vezes / maxFreq) * 100 : 0;
        return (
          <div key={f.numero} style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", justifyContent: "center",
              width: 44, height: 44, borderRadius: "50%",
              background: ballColor, color: "#fff",
              fontWeight: 900, fontSize: "0.95rem", flexShrink: 0,
            }}>
              {f.numero}
            </span>
            <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 8, height: 28, position: "relative", overflow: "hidden" }}>
              <div style={{
                width: `${pct}%`, height: "100%", background: cor,
                transition: "width 0.4s ease-out",
              }} />
              <span style={{
                position: "absolute", left: "0.75rem", top: "50%", transform: "translateY(-50%)",
                color: "#0f172a", fontWeight: 700, fontSize: "0.82rem",
                background: "rgba(255,255,255,.9)", borderRadius: 4, padding: "0 .3rem",
              }}>
                {f.vezes}× ({f.percentual.toFixed(1)}%)
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function PieCard({ label, qtd, total, cor }: { label: string; qtd: number; total: number; cor: string }) {
  const pct = total > 0 ? (qtd / total) * 100 : 0;
  return (
    <div style={{
      background: "#fff", border: "1px solid #e2e8f0",
      borderRadius: 12, padding: "1.25rem", textAlign: "center",
    }}>
      <div style={{ fontSize: "2.4rem", fontWeight: 900, color: cor, marginBottom: "0.25rem" }}>
        {pct.toFixed(1)}%
      </div>
      <div style={{ color: "#0f172a", fontSize: "0.95rem", fontWeight: 700 }}>{label}</div>
      <div style={{ color: "#94a3b8", fontSize: "0.82rem", marginTop: "0.25rem" }}>{qtd.toLocaleString("pt-BR")} de {total.toLocaleString("pt-BR")}</div>
    </div>
  );
}
