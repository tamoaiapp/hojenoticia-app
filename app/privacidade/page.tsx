import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — Hoje Notícia",
  description: "Saiba como o Hoje Notícia coleta e usa seus dados.",
};

export default function PrivacidadePage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.25rem", color: "#1e293b" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "1.5rem" }}>Política de Privacidade</h1>

      <p style={{ color: "#64748b", marginBottom: "2rem" }}>Última atualização: abril de 2025</p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>1. Coleta de Dados</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        O Hoje Notícia não coleta dados pessoais de identificação direta. Podemos coletar dados de navegação anônimos
        (como páginas visitadas e tempo de sessão) por meio de ferramentas de análise como o Google Analytics.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>2. Cookies</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        Utilizamos cookies para análise de tráfego e exibição de anúncios relevantes pelo Google AdSense.
        Você pode desativar cookies nas configurações do seu navegador.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>3. Anúncios</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        Exibimos anúncios do Google AdSense. O Google pode usar cookies para exibir anúncios baseados em visitas
        anteriores ao nosso site ou a outros sites. Consulte a{" "}
        <a href="https://policies.google.com/privacy" style={{ color: "#2563eb" }} target="_blank" rel="noopener noreferrer">
          Política de Privacidade do Google
        </a>{" "}
        para mais informações.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>4. Links Externos</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        Nosso site pode conter links para sites externos. Não nos responsabilizamos pelas práticas de privacidade
        desses sites.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>5. Contato</h2>
      <p style={{ lineHeight: 1.8, color: "#334155" }}>
        Dúvidas sobre privacidade? Entre em contato pelo nosso{" "}
        <a href="/contato" style={{ color: "#2563eb" }}>formulário de contato</a>.
      </p>
    </div>
  );
}
