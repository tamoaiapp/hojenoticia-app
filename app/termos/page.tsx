import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Termos de Uso — Hoje Notícia",
  description: "Termos e condições de uso do portal Hoje Notícia.",
};

export default function TermosPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.25rem", color: "#1e293b" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1.5rem" }}>Termos de Uso</h1>

      <p style={{ color: "#64748b", marginBottom: "2rem" }}>Última atualização: abril de 2025</p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>1. Aceitação dos Termos</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        Ao acessar o Hoje Notícia, você concorda com estes Termos de Uso. Caso não concorde, por favor não utilize o site.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>2. Conteúdo Editorial</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        Os artigos publicados no Hoje Notícia são elaborados com base em fontes públicas e têm caráter informativo.
        Nos esforçamos para garantir a precisão das informações, mas não garantimos a completude ou atualidade de todo conteúdo.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>3. Propriedade Intelectual</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        Todo o conteúdo original deste site (textos, imagens, layout) é protegido por direitos autorais.
        É proibida a reprodução sem autorização prévia por escrito.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>4. Limitação de Responsabilidade</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        O Hoje Notícia não se responsabiliza por decisões tomadas com base no conteúdo publicado.
        As informações são de caráter geral e não substituem consulta profissional.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>5. Alterações</h2>
      <p style={{ lineHeight: 1.8, color: "#334155" }}>
        Podemos atualizar estes termos a qualquer momento. A versão mais recente sempre estará disponível nesta página.
      </p>
    </div>
  );
}
