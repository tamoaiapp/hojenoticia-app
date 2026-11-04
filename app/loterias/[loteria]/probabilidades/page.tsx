import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProbabilityCalculator from "@/components/ProbabilityCalculator";
import { MEGA_SENA_FONTE, MEGA_SENA_TOTAL_RESULTADOS, tabelaMegaSena } from "@/lib/probabilidades";

const BASE = "https://www.hojenoticia.com";
const PATH = "/loterias/mega-sena/probabilidades";
const TITLE = "Probabilidades da Mega-Sena: chances de 6 a 20 dezenas";
const DESCRIPTION = "Entenda as chances de acertar sena, quina e quadra na Mega-Sena. Consulte a tabela de 6 a 20 dezenas e uma calculadora com a fórmula de combinações.";
const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const sourceFairness = "https://caixanoticias.caixa.gov.br/Paginas/Not%C3%ADcias/2024/12-DEZEMBRO/MEGA-DA-VIRADA-2024-MITOS-E-VERDADES-SOBRE-O-JOGO-QUE-MOVIMENTA-O-PAIS-NO-FIM-DO-ANO.aspx";

interface Props { params: Promise<{ loteria: string }> }

export const dynamicParams = false;

export function generateStaticParams() {
  return [{ loteria: "mega-sena" }];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  if ((await params).loteria !== "mega-sena") notFound();
  return {
    title: TITLE,
    description: DESCRIPTION,
    alternates: { canonical: `${BASE}${PATH}` },
    openGraph: { title: TITLE, description: DESCRIPTION, url: `${BASE}${PATH}`, type: "website" },
  };
}

export default async function ProbabilidadesPage({ params }: Props) {
  if ((await params).loteria !== "mega-sena") notFound();
  const table = tabelaMegaSena();
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: BASE },
      { "@type": "ListItem", position: 2, name: "Mega-Sena", item: `${BASE}/loterias/mega-sena` },
      { "@type": "ListItem", position: 3, name: "Probabilidades", item: `${BASE}${PATH}` },
    ],
  };

  return (
    <div style={{ width: "100%", maxWidth: 1000, margin: "0 auto", padding: "2rem 1.25rem", minWidth: 0 }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb).replace(/</g, "\\u003c") }} />
      <nav aria-label="Navegação estrutural" style={{ display: "flex", flexWrap: "wrap", gap: ".5rem", fontSize: ".88rem", color: "#475569", marginBottom: "1.5rem" }}>
        <Link href="/" style={{ textDecoration: "underline" }}>Início</Link><span aria-hidden="true">/</span>
        <Link href="/loterias/mega-sena" style={{ textDecoration: "underline" }}>Mega-Sena</Link><span aria-hidden="true">/</span>
        <span aria-current="page">Probabilidades</span>
      </nav>

      <header style={{ marginBottom: "2rem" }}>
        <p style={{ color: "#146542", fontWeight: 800, fontSize: ".85rem", letterSpacing: ".06em", textTransform: "uppercase", marginBottom: ".75rem" }}>Entenda as chances</p>
        <h1 style={{ color: "#0f172a", fontSize: "clamp(1.8rem, 5vw, 2.75rem)", fontWeight: 900, lineHeight: 1.2, marginBottom: "1rem" }}>Probabilidades da Mega-Sena</h1>
        <p style={{ color: "#334155", fontSize: "1.08rem", lineHeight: 1.8, marginBottom: "1rem" }}>
          Na seleção de seis dezenas, a chance de acertar a sena é de <strong>1 em {integer.format(MEGA_SENA_TOTAL_RESULTADOS)}</strong> por concurso.
          Veja como essa conta funciona e compare as probabilidades de sena, quina e quadra para seleções de 6 a 20 dezenas.
        </p>
        <p style={{ color: "#475569", fontSize: ".9rem", lineHeight: 1.7 }}>
          Guia educativo do <Link href="/sobre" style={{ textDecoration: "underline" }}>Hoje Notícia</Link>, com cálculo combinatório e referência nas <a href={MEGA_SENA_FONTE} style={{ textDecoration: "underline" }}>regras e probabilidades da Caixa</a>.
        </p>
      </header>

      <nav className="probability-jump-links" aria-label="Explore as probabilidades">
        <a href="#calculadora">Comparar seleções</a>
        <a href="#tabela-title">Ver tabela completa</a>
        <a href="#duvidas-title">Tirar dúvidas</a>
      </nav>

      <aside aria-label="Como interpretar as probabilidades" style={{ borderLeft: "4px solid #146542", background: "#edf7f1", padding: "1rem 1.25rem", color: "#145239", lineHeight: 1.8, marginBottom: "2rem" }}>
        Cada concurso é um novo sorteio aleatório. Frequências, números “atrasados” e resultados anteriores não alteram a chance de uma combinação no próximo sorteio.
        A calculadora explica as probabilidades; não prevê dezenas vencedoras.
      </aside>

      <ProbabilityCalculator />

      <section aria-labelledby="tabela-title" style={{ marginBottom: "2.5rem", minWidth: 0 }}>
        <h2 id="tabela-title" style={{ color: "#0f172a", fontSize: "1.4rem", marginBottom: ".75rem" }}>Tabela de probabilidades: de 6 a 20 dezenas</h2>
        <p id="tabela-nota" style={{ color: "#475569", lineHeight: 1.8, marginBottom: "1rem" }}>
          Cada célula mostra uma chance de “1 em” a quantidade indicada, por concurso.
          Os valores são arredondados ao inteiro mais próximo e correspondem à tabela de referência da Caixa.
          Em telas pequenas, deslize a tabela na horizontal.
        </p>
        <div role="region" aria-label="Tabela de chances da Mega-Sena" aria-describedby="tabela-nota" tabIndex={0} style={{ overflowX: "auto", maxWidth: "100%", border: "1px solid #cbd5e1", borderRadius: 12, background: "#fff" }}>
          <table style={{ width: "100%", minWidth: 530, borderCollapse: "collapse", color: "#334155", fontSize: ".95rem" }}>
            <caption style={{ padding: "1rem", textAlign: "left", color: "#0f172a", fontWeight: 700 }}>Probabilidade aproximada de acerto na Mega-Sena (1 em)</caption>
            <thead style={{ background: "#edf7f1", color: "#145239" }}>
              <tr>
                <th scope="col" style={{ textAlign: "left", padding: ".85rem" }}>Dezenas selecionadas</th>
                <th scope="col" style={{ textAlign: "right", padding: ".85rem" }}>Sena<br /><span style={{ fontWeight: 400 }}>6 acertos</span></th>
                <th scope="col" style={{ textAlign: "right", padding: ".85rem" }}>Quina<br /><span style={{ fontWeight: 400 }}>5 acertos</span></th>
                <th scope="col" style={{ textAlign: "right", padding: ".85rem" }}>Quadra<br /><span style={{ fontWeight: 400 }}>4 acertos</span></th>
              </tr>
            </thead>
            <tbody>
              {table.map((row, index) => (
                <tr key={row.dezenas} style={{ borderTop: "1px solid #e2e8f0", background: index % 2 === 0 ? "#fff" : "#f8fafc" }}>
                  <th scope="row" style={{ textAlign: "left", padding: ".8rem .85rem", fontWeight: 700 }}>{row.dezenas}</th>
                  {row.faixas.map((faixa) => <td key={faixa.acertos} style={{ textAlign: "right", padding: ".8rem .85rem", fontVariantNumeric: "tabular-nums" }}>{integer.format(Math.round(faixa.umaEm))}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ color: "#475569", lineHeight: 1.8, fontSize: ".9rem", marginTop: ".75rem" }}>
          Referência: seção “Probabilidade” da <a href={MEGA_SENA_FONTE} style={{ textDecoration: "underline" }}>Mega-Sena no Portal Loterias Caixa</a>.
          Os acertos se referem às dezenas sorteadas que estão dentro da seleção completa. A premiação de combinações em bilhetes múltiplos segue regras próprias da Caixa.
        </p>
      </section>

      <section aria-labelledby="calculo-title" style={{ marginBottom: "2.5rem", color: "#334155", lineHeight: 1.85 }}>
        <h2 id="calculo-title" style={{ color: "#0f172a", fontSize: "1.4rem", marginBottom: ".75rem" }}>Como a probabilidade é calculada</h2>
        <p style={{ marginBottom: "1rem" }}>A Mega-Sena sorteia seis dezenas diferentes de um universo de 60. A ordem não muda a combinação: por exemplo, 01, 02, 03, 04, 05 e 06 é o mesmo conjunto em qualquer ordem.</p>
        <p style={{ marginBottom: "1rem" }}>O símbolo C(n, k) conta quantos grupos de k elementos podem ser formados a partir de n, sem repetir números e sem considerar a ordem. Assim, C(60, 6) = {integer.format(MEGA_SENA_TOTAL_RESULTADOS)} resultados possíveis.</p>
        <p style={{ marginBottom: "1rem" }}>Com n dezenas selecionadas, a chance de acertar a sena é C(n, 6) ÷ C(60, 6). Para exatamente k acertos, a conta completa é:</p>
        <p style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 10, padding: "1rem", fontWeight: 700, overflowWrap: "anywhere" }}>P(k acertos) = C(n, k) × C(60 − n, 6 − k) ÷ C(60, 6)</p>
        <p style={{ marginTop: "1rem" }}>Por exemplo, uma seleção de sete dezenas contém C(7, 6) = 7 combinações de seis números. A chance da sena nessa seleção é 7 ÷ 50.063.860, equivalente a 1 em 7.151.980. A comparação descreve cobertura matemática, sem recomendar uma quantidade de dezenas.</p>
      </section>

      <section aria-labelledby="duvidas-title" style={{ marginBottom: "2rem", color: "#334155", lineHeight: 1.85 }}>
        <h2 id="duvidas-title" style={{ color: "#0f172a", fontSize: "1.4rem", marginBottom: "1rem" }}>Dúvidas sobre as chances da Mega-Sena</h2>
        <h3 style={{ fontSize: "1.05rem", color: "#0f172a", marginBottom: ".5rem" }}>Jogo há 10 anos. Isso aumenta a chance do próximo bilhete?</h3>
        <p style={{ marginBottom: "1.25rem" }}>O tempo que você já jogou não aumenta a chance do próximo bilhete. Cada concurso é independente: uma seleção de seis dezenas continua com chance de 1 em {integer.format(MEGA_SENA_TOTAL_RESULTADOS)} de acertar a sena naquele sorteio. Repetir números por anos não acumula sorte nem estabelece um prazo para ganhar.</p>
        <h3 style={{ fontSize: "1.05rem", color: "#0f172a", marginBottom: ".5rem" }}>Números mais sorteados têm mais chance no próximo concurso?</h3>
        <p style={{ marginBottom: "1.25rem" }}>Não. A frequência resume o que ocorreu na amostra consultada. No modelo de sorteios aleatórios independentes, o resultado anterior não muda as probabilidades do próximo concurso. A Caixa explica os controles de aleatoriedade e a igualdade de condições das bolas em seu <a href={sourceFairness} style={{ textDecoration: "underline" }}>guia sobre mitos e verdades dos sorteios</a>.</p>
        <h3 style={{ fontSize: "1.05rem", color: "#0f172a", marginBottom: ".5rem" }}>Uma sequência de seis números tem menos chance?</h3>
        <p style={{ marginBottom: "1.25rem" }}>Não. Cada conjunto específico de seis dezenas tem a mesma chance de ser sorteado, inclusive uma sequência. O aspecto visual de uma combinação não altera a conta.</p>
        <h3 style={{ fontSize: "1.05rem", color: "#0f172a", marginBottom: ".5rem" }}>“1 em 50.063.860” significa que haverá um acerto após esse número de concursos?</h3>
        <p style={{ marginBottom: "1.25rem" }}>Não. A razão descreve a chance em um único concurso. Ela não estabelece um prazo para ganhar, e repetir uma seleção não garante um resultado futuro.</p>
        <h3 style={{ fontSize: "1.05rem", color: "#0f172a", marginBottom: ".5rem" }}>A chance de acertar muda quando o prêmio acumula?</h3>
        <p>O valor anunciado não entra nesta fórmula. Mantidas as mesmas regras de sorteio e a mesma quantidade de dezenas selecionadas, a probabilidade de acerto permanece igual. A chance de acerto também não informa quanto cada ganhador receberá.</p>
      </section>

      <nav aria-label="Continue sua consulta da Mega-Sena" style={{ borderTop: "1px solid #cbd5e1", paddingTop: "1.25rem", display: "flex", flexWrap: "wrap", gap: "1rem", lineHeight: 1.7 }}>
        <Link href="/loterias/mega-sena" style={{ color: "#146542", fontWeight: 700, textDecoration: "underline" }}>Resultados da Mega-Sena</Link>
        <Link href="/loterias/mega-sena#historico" style={{ color: "#146542", textDecoration: "underline" }}>Histórico de concursos</Link>
        <Link href="/loterias/mega-sena/estatisticas" style={{ color: "#146542", textDecoration: "underline" }}>Estatísticas dos resultados publicados</Link>
      </nav>
    </div>
  );
}
