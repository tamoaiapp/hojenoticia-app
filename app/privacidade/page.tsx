import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Informações sobre dados e publicidade no Hoje Notícia e contato do responsável pelo site.",
  alternates: { canonical: "https://www.hojenoticia.com/privacidade" },
};

export default function PrivacidadePage() {
  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "3rem 1.25rem", color: "#1e293b" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.5rem" }}>Política de Privacidade</h1>
      <p style={{ color: "#64748b", marginBottom: "2rem" }}>Última atualização: 3 de novembro de 2026</p>

      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "2rem" }}>
        O <strong>Hoje Notícia</strong>, sob responsabilidade de Tiago Oliveira, doravante denominado "nós" ou "Portal",
        está comprometido com a proteção dos dados pessoais dos seus usuários, em conformidade com a
        Lei Geral de Proteção de Dados Pessoais (Lei nº 13.709/2018 — LGPD) e demais legislações aplicáveis.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>1. Dados Coletados</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        Quando você envia um e-mail, recebemos o endereço do remetente e as informações incluídas na mensagem
        para responder à solicitação. Serviços de hospedagem e publicidade podem processar dados técnicos de navegação,
        como endereço IP e informações do navegador, conforme suas próprias políticas.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>2. Cookies</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        Parceiros de publicidade podem usar cookies ou tecnologias semelhantes para exibição e medição de anúncios.
        Você pode desativar cookies nas configurações do seu navegador a qualquer momento, sem prejuízo ao acesso ao conteúdo.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>3. Anúncios</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        Exibimos banners e anúncios nativos da Adsterra. Os links desses anúncios são acionados ao clicar no próprio anúncio.
        A imagem da chamada após os resultados também pode abrir publicidade da Adsterra em outra aba quando clicada;
        a página atual segue para o conteúdo de probabilidades. Esse Smartlink não é acionado por cliques comuns nos textos ou menus do site.
        O Google AdSense também pode ser usado quando estiver configurado no site.
        Consulte a{" "}
        <a href="https://adsterra.com/privacy-policy-managed" style={{ color: "#dc2626" }} target="_blank" rel="noopener noreferrer">
          Política de Privacidade da Adsterra
        </a>{" "}
        e a{" "}
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
        Para tratar de uma solicitação sobre seus dados, escreva para{" "}
        <a href="mailto:tiago.mo@outlook.com" style={{ color: "#dc2626" }}>tiago.mo@outlook.com</a>.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>6. Contato sobre dados pessoais</h2>
      <p style={{ lineHeight: 1.8, color: "#334155", marginBottom: "1rem" }}>
        O responsável pelo site, Tiago Oliveira, pode ser contatado pelo e-mail{" "}
        <a href="mailto:tiago.mo@outlook.com" style={{ color: "#dc2626" }}>tiago.mo@outlook.com</a>.
      </p>

      <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "0.75rem", marginTop: "2rem" }}>7. Alterações desta Política</h2>
      <p style={{ lineHeight: 1.8, color: "#334155" }}>
        Esta política pode ser atualizada periodicamente. A data de última atualização será sempre indicada no topo
        desta página. Recomendamos revisitá-la regularmente.
      </p>
    </div>
  );
}
