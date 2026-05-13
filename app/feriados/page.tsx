import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAnosDisponiveis } from "@/lib/feriados";

const BASE = "https://hojenoticia.com";

export const metadata: Metadata = {
  title: "Feriados Nacionais — Calendário Completo | Hoje Notícia",
  description: "Calendário de feriados nacionais brasileiros. Datas fixas e móveis (Páscoa, Carnaval, Corpus Christi) com dia da semana.",
  alternates: { canonical: `${BASE}/feriados` },
};

export default function FeriadosIndex() {
  const anos = getAnosDisponiveis();
  if (anos.length === 0) {
    return (
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.25rem" }}>
        <h1>Feriados</h1>
        <p>Calendário em preparação.</p>
      </div>
    );
  }
  const atual = new Date().getFullYear();
  const padrao = anos.includes(atual) ? atual : anos[0];

  if (anos.length === 1) redirect(`/feriados/${padrao}`);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", marginBottom: "1rem" }}>
        📅 Feriados Nacionais
      </h1>
      <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>Selecione o ano:</p>
      <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
        {anos.map(a => (
          <Link key={a} href={`/feriados/${a}`}
            style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "0.75rem 1.25rem", textDecoration: "none", color: "#0f172a", fontWeight: 700, fontSize: "1rem" }}>
            {a}
          </Link>
        ))}
      </div>
    </div>
  );
}
