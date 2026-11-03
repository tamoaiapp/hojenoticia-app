import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Sobre o Hoje Notícia",
  description: "Conheça o Hoje Notícia, seu responsável e como são produzidos os boletins de resultados de loterias.",
  alternates: { canonical: "https://www.hojenoticia.com/sobre" },
};

export default function SobrePage() {
  return (
    <article className="article-body" style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <h1 id="redacao" style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1rem" }}>Sobre o Hoje Notícia</h1>
      <p>
        O Hoje Notícia é um site independente de consulta a resultados de loterias e outros conteúdos informativos.
        O responsável pelo site e pela publicação é{" "}
        <Link href="/equipe/tiago-oliveira" style={{ color: "#2563eb", textDecoration: "underline" }}>Tiago Oliveira</Link>.
      </p>
      <h2>Como os resultados são publicados</h2>
      <p>
        Os boletins de loterias utilizam automação para consultar dados oficiais da Caixa Econômica Federal.
        O processo faz verificações automáticas da fonte, da identificação do concurso, da data e das dezenas
        antes de publicar um resultado. Isso não significa que cada boletim passe por revisão humana prévia.
      </p>
      <p>
        A data do sorteio e as datas de publicação e atualização têm funções diferentes. Os resultados históricos
        devem ser lidos com a data do concurso indicado. Confira nossa{" "}
        <Link href="/politica-editorial" style={{ color: "#2563eb", textDecoration: "underline" }}>política editorial</Link>{" "}
        para saber mais sobre fontes e automação.
      </p>
      <h2>Independência e publicidade</h2>
      <p>
        O Hoje Notícia não é um canal oficial da Caixa. A consulta definitiva de resultados, regras, prazos e
        resgate de prêmios deve ser feita nos{" "}
        <a href="https://loterias.caixa.gov.br/" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>canais oficiais das Loterias Caixa</a>.
      </p>
      <p>
        O site exibe publicidade. A presença de um anúncio não constitui confirmação das informações
        ou recomendação dos produtos anunciados.
      </p>
      <h2>Fale com o responsável</h2>
      <p>
        Envie dúvidas e sugestões para{" "}
        <a href="mailto:tiago.mo@outlook.com" style={{ color: "#2563eb", textDecoration: "underline", overflowWrap: "anywhere" }}>tiago.mo@outlook.com</a>.
        Para apontar um erro, consulte a{" "}
        <Link href="/correcoes" style={{ color: "#2563eb", textDecoration: "underline" }}>política de correções</Link>.
      </p>
    </article>
  );
}
