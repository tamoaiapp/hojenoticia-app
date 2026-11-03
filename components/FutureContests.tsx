import Link from "next/link";
import type { DrawMeta } from "@/lib/loterias";
import { formatDateShort } from "@/lib/loterias-config";

export default function FutureContests({ lottery, name, draws }: { lottery: string; name: string; draws: DrawMeta[] }) {
  const future = draws.filter(draw => draw.status === "aguardando").sort((a, b) => a.concurso - b.concurso);
  if (!future.length) return null;
  const cards = (items: DrawMeta[]) => <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(145px, 1fr))", gap: ".65rem", marginTop: "1rem" }}>{items.map(draw => (
    <Link key={draw.slug} href={`/loterias/${lottery}/${draw.slug}`} style={{ border: "1px solid #e2e8f0", borderRadius: 10, padding: ".85rem", background: "white", display: "block" }}>
      <strong style={{ display: "block", fontSize: ".9rem" }}>{name} {draw.concurso}</strong>
      <span style={{ fontSize: ".78rem", color: "#64748b" }}>{draw.schedule_status === "confirmed" ? formatDateShort(draw.draw_date) : "Data a confirmar"}</span>
    </Link>
  ))}</div>;
  return <section style={{ margin: "2rem 0" }} aria-labelledby="future-contests-title">
    <h2 id="future-contests-title" style={{ fontSize: "1.3rem", marginBottom: ".5rem" }}>Acompanhe os próximos concursos da {name}</h2>
    <p style={{ color: "#64748b", fontSize: ".9rem" }}>Escolha o concurso para consultar a programação e acompanhar a publicação do resultado.</p>
    {cards(future.slice(0, 12))}
    {future.length > 12 && <details style={{ marginTop: "1rem" }}><summary style={{ cursor: "pointer", fontWeight: 700 }}>Ver mais {future.length - 12} concursos</summary>{cards(future.slice(12))}</details>}
  </section>;
}
