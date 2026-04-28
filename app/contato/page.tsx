import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato — Hoje Notícia",
  description: "Entre em contato com a equipe do Hoje Notícia.",
};

export default function ContatoPage() {
  return (
    <div style={{ maxWidth: 600, margin: "0 auto", padding: "3rem 1.25rem", color: "#1e293b" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, marginBottom: "0.5rem" }}>Contato</h1>
      <p style={{ color: "#64748b", marginBottom: "2rem" }}>
        Sugestões, correções ou parcerias? Fale com a gente.
      </p>

      <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: "2rem" }}>
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.9rem" }}>Nome</label>
          <input
            type="text"
            placeholder="Seu nome"
            style={{ width: "100%", padding: "0.65rem 1rem", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.95rem", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "1.25rem" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.9rem" }}>E-mail</label>
          <input
            type="email"
            placeholder="seu@email.com"
            style={{ width: "100%", padding: "0.65rem 1rem", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.95rem", boxSizing: "border-box" }}
          />
        </div>
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", fontWeight: 600, marginBottom: "0.4rem", fontSize: "0.9rem" }}>Mensagem</label>
          <textarea
            placeholder="Sua mensagem..."
            rows={5}
            style={{ width: "100%", padding: "0.65rem 1rem", borderRadius: 8, border: "1px solid #cbd5e1", fontSize: "0.95rem", resize: "vertical", boxSizing: "border-box" }}
          />
        </div>
        <button
          style={{ background: "#2563eb", color: "#fff", fontWeight: 700, padding: "0.75rem 2rem", borderRadius: 8, border: "none", cursor: "pointer", fontSize: "1rem", width: "100%" }}
        >
          Enviar mensagem
        </button>
        <p style={{ fontSize: "0.8rem", color: "#94a3b8", textAlign: "center", marginTop: "1rem" }}>
          (Formulário em breve — por enquanto entre em contato via redes sociais)
        </p>
      </div>
    </div>
  );
}
