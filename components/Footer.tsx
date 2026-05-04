import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ background: "#0f172a", color: "#94a3b8", marginTop: "4rem", padding: "2.5rem 1.25rem" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "2rem", justifyContent: "space-between" }}>
        <div>
          <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#fff", marginBottom: "0.5rem" }}>
            Hoje<span style={{ color: "#ef4444" }}>Notícia</span>
          </div>
          <p style={{ fontSize: "0.85rem", maxWidth: 280 }}>
            As principais notícias do Brasil em um só lugar. Futebol, política, fofoca, saúde e muito mais.
          </p>
        </div>
        <div style={{ display: "flex", gap: "3rem" }}>
          <div>
            <div style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: "0.75rem", fontSize: "0.85rem" }}>PORTAL</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.82rem" }}>
              <Link href="/" style={{ color: "#94a3b8" }}>Início</Link>
              <Link href="/futebol" style={{ color: "#94a3b8" }}>Futebol</Link>
              <Link href="/politica" style={{ color: "#94a3b8" }}>Política</Link>
              <Link href="/fofoca" style={{ color: "#94a3b8" }}>Fofoca</Link>
            </div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: "#e2e8f0", marginBottom: "0.75rem", fontSize: "0.85rem" }}>INSTITUCIONAL</div>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", fontSize: "0.82rem" }}>
              <Link href="/quem-somos" style={{ color: "#94a3b8" }}>Quem Somos</Link>
              <Link href="/contato" style={{ color: "#94a3b8" }}>Contato</Link>
              <Link href="/privacidade" style={{ color: "#94a3b8" }}>Privacidade</Link>
              <Link href="/termos" style={{ color: "#94a3b8" }}>Termos de Uso</Link>
            </div>
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1200, margin: "2rem auto 0", borderTop: "1px solid #1e293b", paddingTop: "1.5rem", fontSize: "0.78rem", textAlign: "center", lineHeight: 1.8 }}>
        © {new Date().getFullYear()} HojeNotícia. Todos os direitos reservados.
        <span style={{ display: "block", color: "#64748b", marginTop: "0.25rem" }}>
          CNPJ 29.434.321/0001-20 &nbsp;·&nbsp;
          <Link href="/quem-somos" style={{ color: "#64748b" }}>Quem Somos</Link>
          &nbsp;·&nbsp;
          <Link href="/privacidade" style={{ color: "#64748b" }}>Política de Privacidade</Link>
          &nbsp;·&nbsp;
          <Link href="/termos" style={{ color: "#64748b" }}>Termos de Uso</Link>
        </span>
      </div>
    </footer>
  );
}
