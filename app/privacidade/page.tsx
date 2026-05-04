import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade — Hoje Notícia",
  description: "Saiba como o Hoje Notícia coleta e usa seus dados. CNPJ 29.434.321/0001-20.",
};

export default function PrivacidadePage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.25rem", color: "#1e293b" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.5rem" }}>Política de Privacidade</h1>
      <p style={{ color: "#64748b", marginBottom: "2rem" }}>Última atualização: maio de 2026</p>

      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "2rem" }}>
        O <strong>HojeNotícia</strong> (CNPJ 29.434.321/0001-20), doravante denominado "nós" ou "Portal",
        está comprometido com a proteção dos dados pessoais dos seus usuários, em conformidade com a
        Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD) e demais legislações aplicáveis.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>1. Dados Coletados</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        O HojeNotícia não coleta dados pessoais de identificação direta. Podemos coletar dados de navegação anônimos
        (como páginas visitadas e tempo de sessão) por meio de ferramentas de análise como o Google Analytics,
        a fim de melhorar a experiência do usuário.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>2. Cookies</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        Utilizamos cookies para análise de tráfego e exibição de anúncios relevantes pelo Google AdSense.
        Você pode desativar cookies nas configurações do seu navegador a qualquer momento, sem prejuízo ao acesso ao conteúdo.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>3. Anúncios (Google AdSense)</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        Exibimos anúncios do Google AdSense. O Google pode usar cookies para exibir anúncios baseados em visitas
        anteriores ao nosso site ou a outros sites. Consulte a{" "}
        <a href="https://policies.google.com/privacy" style={{ color: "#dc2626" }} target="_blank" rel="noopener noreferrer">
          Política de Privacidade do Google
        </a>{" "}
        para mais informações.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>4. Links Externos</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        Nosso site pode conter links para sites externos. Não nos responsabilizamos pelas práticas de privacidade
        desses sites. Recomendamos a leitura das políticas de privacidade de cada site visitado.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>5. Seus Direitos (LGPD)</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        Nos termos da LGPD, você tem direito a confirmar a existência de tratamento de dados, acessar seus dados,
        corrigir dados incorretos, solicitar a eliminação de dados, bem como revogar consentimento a qualquer momento.
        Para exercer esses direitos, entre em contato pelo nosso{" "}
        <a href="/contato" style={{ color: "#dc2626" }}>formulário de contato</a>.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>6. Encarregado de Dados (DPO)</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        O responsável pelo tratamento de dados do HojeNotícia pode ser contatado por meio do{" "}
        <a href="/contato" style={{ color: "#dc2626" }}>formulário de contato</a>. Informações sobre o Portal disponíveis em{" "}
        <a href="/quem-somos" style={{ color: "#dc2626" }}>Quem Somos</a>.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>7. Alterações desta Política</h2>
      <p style={{ lineHeight: 1.8, color: "#334155" }}>
        Esta política pode ser atualizada periodicamente. A data de última atualização será sempre indicada no topo
        desta página. Recomendamos revisitá-la regularmente.
      </p>
    </div>
  );
}
