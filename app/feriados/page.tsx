import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getAnosDisponiveis } from "@/lib/feriados";

const BASE = "https://www.hojenoticia.com";
export const revalidate = 86400;

export const metadata: Metadata = {
  title: "Feriados e pontos facultativos: calendário por ano",
  description: "Consulte as datas listadas por ano e veja a distinção entre feriados e pontos facultativos, com dia da semana e observações sobre regras locais.",
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
  const atual = Number(new Intl.DateTimeFormat("en", { timeZone: "America/Sao_Paulo", year: "numeric" }).format(new Date()));
  const padrao = anos.includes(atual) ? atual : anos[0];

  if (anos.length === 1) redirect(`/feriados/${padrao}`);

  return (
    <div style={{ maxWidth: 800, margin: "0 auto", padding: "2rem 1.25rem" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 900, color: "#0f172a", marginBottom: "1rem" }}>
        📅 Feriados e pontos facultativos
      </h1>
      <p style={{ color: "#64748b", marginBottom: "1.5rem" }}>Selecione o ano para consultar as datas listadas e a classificação de cada uma:</p>
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
