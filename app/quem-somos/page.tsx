import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Quem Somos — Hoje Notícia",
  description: "Conheça o HojeNotícia, portal de notícias brasileiro. CNPJ 29.434.321/0001-20.",
};

export default function QuemSomosPage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.25rem", color: "#1e293b" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.5rem" }}>Quem Somos</h1>
      <p style={{ color: "#64748b", marginBottom: "2.5rem", fontSize: "1.05rem" }}>
        O HojeNotícia é um portal de notícias brasileiro dedicado a reunir as principais informações do país em um só lugar.
      </p>

      {/* Missão */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem", borderBottom: "2px solid #dc2626", paddingBottom: "0.4rem", display: "inline-block" }}>
          Nossa Missão
        </h2>
        <p style={{ lineHeight: 1.8, color: "#334155" }}>
          Democratizar o acesso à informação de qualidade. Cobrimos política, esportes, entretenimento, saúde, tecnologia e muito mais —
          reunindo em um único portal as notícias que mais importam para o brasileiro.
        </p>
      </section>

      {/* Como funciona */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem", borderBottom: "2px solid #dc2626", paddingBottom: "0.4rem", display: "inline-block" }}>
          Nossa Redação
        </h2>
        <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
          O HojeNotícia utiliza tecnologia de inteligência artificial para curar, resumir e contextualizar notícias provenientes de fontes
          jornalísticas públicas e canais de comunicação credenciados. Todo conteúdo é elaborado com base em informações de domínio público
          e tem caráter estritamente informativo.
        </p>
        <p style={{ lineHeight: 1.8, color: "#334155" }}>
          Nosso sistema monitora continuamente as principais fontes de notícias do Brasil, garantindo cobertura atualizada nas 11 editorias:
          Política, Notícias, Crime, Fofoca, Futebol, Entretenimento, Automóveis, Finanças, Saúde, Tecnologia e Religião.
        </p>
      </section>

      {/* Dados da empresa */}
      <section style={{ marginBottom: "2.5rem", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: "1.5rem 2rem" }}>
        <h2 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#0f172a", marginBottom: "1rem" }}>
          Dados da Empresa
        </h2>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
          <tbody>
            {[
              ["Razão Social", "HojeNotícia"],
              ["CNPJ", "29.434.321/0001-20"],
              ["Segmento", "Portal de Notícias / Comunicação Digital"],
              ["Website", "hojenoticia.com"],
              ["País", "Brasil"],
            ].map(([label, value]) => (
              <tr key={label} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "0.6rem 0", fontWeight: 600, color: "#475569", width: "35%" }}>{label}</td>
                <td style={{ padding: "0.6rem 0", color: "#1e293b" }}>{value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {/* Responsabilidade editorial */}
      <section style={{ marginBottom: "2.5rem" }}>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem", borderBottom: "2px solid #dc2626", paddingBottom: "0.4rem", display: "inline-block" }}>
          Responsabilidade Editorial
        </h2>
        <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
          Todo conteúdo publicado no HojeNotícia é baseado em fontes públicas e jornalísticas. Nos esforçamos para garantir a precisão
          e clareza das informações. Caso identifique algum erro ou imprecisão, entre em contato conosco pelo formulário de{" "}
          <a href="/contato" style={{ color: "#dc2626", fontWeight: 600 }}>contato</a>.
        </p>
        <p style={{ lineHeight: 1.8, color: "#334155" }}>
          Direito de resposta e solicitações de remoção de conteúdo são atendidos em conformidade com a legislação brasileira,
          incluindo a Lei nº 13.709/2018 (LGPD) e o Marco Civil da Internet (Lei nº 12.965/2014).
        </p>
      </section>

      {/* Contato */}
      <section>
        <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: "#0f172a", marginBottom: "0.75rem", borderBottom: "2px solid #dc2626", paddingBottom: "0.4rem", display: "inline-block" }}>
          Fale Conosco
        </h2>
        <p style={{ lineHeight: 1.8, color: "#334155" }}>
          Sugestões de pauta, parcerias, correções ou solicitações editoriais:{" "}
          <a href="/contato" style={{ color: "#dc2626", fontWeight: 600 }}>formulário de contato</a>.
        </p>
      </section>
    </div>
  );
}
