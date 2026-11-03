import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de correções",
  description: "Como comunicar erros nos resultados e conteúdos do Hoje Notícia e identificar correções relevantes.",
  alternates: { canonical: "https://www.hojenoticia.com/correcoes" },
};

export default function CorrecoesPage() {
  return (
    <article className="article-body" style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1rem" }}>Política de correções</h1>
      <p>
        Para apontar um erro no Hoje Notícia, escreva ao responsável pelo site e pela publicação,{" "}
        <Link href="/equipe/tiago-oliveira" style={{ color: "#2563eb", textDecoration: "underline" }}>Tiago Oliveira</Link>,
        pelo e-mail{" "}
        <a href="mailto:tiago.mo@outlook.com?subject=Corre%C3%A7%C3%A3o%20no%20Hoje%20Not%C3%ADcia" style={{ color: "#2563eb", textDecoration: "underline", overflowWrap: "anywhere" }}>tiago.mo@outlook.com</a>.
      </p>
      <h2>O que incluir no pedido</h2>
      <ul>
        <li>O endereço da página e o número do concurso, se houver.</li>
        <li>O trecho ou dado que parece incorreto.</li>
        <li>A informação que você considera correta e um link para a fonte que permite verificá-la.</li>
      </ul>
      <h2>Como corrigimos</h2>
      <p>
        Para resultados de loterias, a conferência deve usar a fonte oficial da Caixa.
        Correções editoriais confirmadas pelo responsável devem identificar na página o que mudou e quando.
        A atualização automática dos dados oficiais registra a data da alteração, sem gerar uma nota editorial
        individual. Ajustes de ortografia ou formatação que não mudem o sentido podem ser feitos sem nota.
      </p>
      <p>
        A divulgação de um resultado antes pendente é uma atualização do boletim. Ela não deve ser apresentada
        como se o resultado já estivesse confirmado no momento da publicação original.
      </p>
      <h2>Processamento automático</h2>
      <p>
        Os boletins são montados automaticamente a partir de dados oficiais e podem apresentar falhas de
        consulta ou processamento. A automação não substitui a análise de um pedido de correção.
        Conheça a{" "}
        <Link href="/politica-editorial" style={{ color: "#2563eb", textDecoration: "underline" }}>política editorial</Link>{" "}
        e os canais de{" "}
        <Link href="/contato" style={{ color: "#2563eb", textDecoration: "underline" }}>contato</Link>.
      </p>
    </article>
  );
}
