import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política editorial",
  description: "Fontes, automação, datas, publicidade e correções nos boletins de resultados do Hoje Notícia.",
  alternates: { canonical: "https://www.hojenoticia.com/politica-editorial" },
};

export default function PoliticaEditorialPage() {
  return (
    <article className="article-body" style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1rem" }}>Política editorial</h1>
      <p>
        Esta página explica o processo de publicação dos boletins de resultados de loterias do Hoje Notícia.
        O responsável pelo site e pela publicação é{" "}
        <Link href="/equipe/tiago-oliveira" style={{ color: "#2563eb", textDecoration: "underline" }}>Tiago Oliveira</Link>.
      </p>
      <h2>Fontes dos resultados</h2>
      <p>
        A fonte dos resultados é a Caixa Econômica Federal. A automação consulta seus dados oficiais e verifica
        se a resposta corresponde ao concurso solicitado e contém data e dezenas antes de publicar.
        Informações ainda não confirmadas devem aparecer como pendentes, sem dezenas inventadas.
      </p>
      <p>
        Valores estimados para concursos futuros são identificados como estimativas e podem mudar.
        O site não substitui a conferência do bilhete nem as regras disponíveis nos{" "}
        <a href="https://loterias.caixa.gov.br/" target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>canais oficiais da Caixa</a>.
      </p>
      <h2>Uso de automação</h2>
      <p>
        A consulta, a validação dos campos e a montagem dos boletins de loterias são automatizadas.
        A assinatura de responsabilidade do site não indica que cada boletim tenha passado por revisão humana
        antes de ser disponibilizado. Falhas de fonte ou de processamento podem atrasar a publicação.
      </p>
      <h2>Datas e atualizações</h2>
      <p>
        A data do sorteio identifica o evento informado. A data de publicação identifica a disponibilização do
        boletim, e a data de atualização indica uma alteração no conteúdo. Uma notícia antiga não deve receber
        data nova apenas para parecer recente. Onde uma data de publicação histórica não é conhecida, ela
        não deve ser estimada a partir do sorteio.
      </p>
      <h2>Publicidade</h2>
      <p>
        O site utiliza anúncios para monetização. Os espaços de publicidade devem ser identificados e
        distinguidos dos resultados e do texto informativo. A presença de um anúncio não significa endosso
        do produto ou serviço anunciado.
      </p>
      <h2>Correções e contato</h2>
      <p>
        Erros podem ser comunicados a{" "}
        <a href="mailto:tiago.mo@outlook.com?subject=Corre%C3%A7%C3%A3o%20no%20Hoje%20Not%C3%ADcia" style={{ color: "#2563eb", textDecoration: "underline", overflowWrap: "anywhere" }}>tiago.mo@outlook.com</a>.
        A{" "}
        <Link href="/correcoes" style={{ color: "#2563eb", textDecoration: "underline" }}>política de correções</Link>{" "}
        descreve as informações necessárias para conferir um pedido e como alterações relevantes são sinalizadas.
      </p>
    </article>
  );
}
