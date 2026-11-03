import type { Metadata } from "next";
import Link from "next/link";

const PROFILE_URL = "https://www.hojenoticia.com/equipe/tiago-oliveira";

export const metadata: Metadata = {
  title: "Tiago Oliveira — responsável pelo site",
  description: "Tiago Oliveira é o responsável pelo site e pela publicação do Hoje Notícia. Veja informações de contato e o processo editorial.",
  alternates: { canonical: PROFILE_URL },
};

export default function TiagoOliveiraPage() {
  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": `${PROFILE_URL}#person`,
    name: "Tiago Oliveira",
    url: PROFILE_URL,
    email: "mailto:tiago.mo@outlook.com",
    jobTitle: "Responsável pelo site e pela publicação",
    affiliation: { "@type": "Organization", "@id": "https://www.hojenoticia.com/#organization", name: "Hoje Notícia" },
  };

  return (
    <article className="article-body" style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.25rem" }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person) }} />
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1rem" }}>Tiago Oliveira</h1>
      <p><strong>Responsável pelo site e pela publicação do Hoje Notícia.</strong></p>
      <p>
        Este perfil identifica a pessoa responsável pela operação e pela publicação do site.
        Os boletins de resultados de loterias utilizam automação para consultar e validar dados oficiais da Caixa;
        essa responsabilidade não significa revisão humana prévia de cada boletim.
      </p>
      <p>
        Para dúvidas, sugestões ou correções, escreva para{" "}
        <a href="mailto:tiago.mo@outlook.com" style={{ color: "#2563eb", textDecoration: "underline", overflowWrap: "anywhere" }}>tiago.mo@outlook.com</a>.
      </p>
      <p>
        Veja a{" "}
        <Link href="/politica-editorial" style={{ color: "#2563eb", textDecoration: "underline" }}>política editorial</Link>,
        a{" "}
        <Link href="/correcoes" style={{ color: "#2563eb", textDecoration: "underline" }}>política de correções</Link>{" "}
        e a apresentação do{" "}
        <Link href="/sobre" style={{ color: "#2563eb", textDecoration: "underline" }}>Hoje Notícia</Link>.
      </p>
    </article>
  );
}
