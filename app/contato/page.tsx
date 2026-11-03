import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Contato",
  description: "Contato de Tiago Oliveira, responsável pelo site Hoje Notícia, para dúvidas, sugestões e correções.",
  alternates: { canonical: "https://www.hojenoticia.com/contato" },
};

export default function ContatoPage() {
  return (
    <article className="article-body" style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1rem" }}>Contato</h1>
      <p>
        Para dúvidas, sugestões ou assuntos relacionados à publicação, entre em contato com{" "}
        <Link href="/equipe/tiago-oliveira" style={{ color: "#2563eb", textDecoration: "underline" }}>Tiago Oliveira</Link>,
        responsável pelo Hoje Notícia.
      </p>
      <p>
        E-mail: <a href="mailto:tiago.mo@outlook.com?subject=Contato%20com%20o%20Hoje%20Not%C3%ADcia" style={{ color: "#2563eb", textDecoration: "underline", overflowWrap: "anywhere" }}>tiago.mo@outlook.com</a>.
      </p>
      <h2>Correções</h2>
      <p>
        Encontrou uma informação incorreta? Envie o endereço da página, indique o trecho e, quando possível,
        inclua o link da fonte que permite conferir o dado. Veja como tratamos esses pedidos na{" "}
        <Link href="/correcoes" style={{ color: "#2563eb", textDecoration: "underline" }}>política de correções</Link>.
      </p>
    </article>
  );
}
