import Link from "next/link";
import LotterySearch from "@/components/LotterySearch";

export default function NotFound() {
  return <section style={{ maxWidth: 760, margin: "0 auto", padding: "3rem 1.25rem" }}>
    <p style={{ color: "#64748b", marginBottom: ".5rem" }}>Hoje Notícia · página não encontrada</p>
    <h1 style={{ fontSize: "2rem", lineHeight: 1.2, marginBottom: "1rem" }}>Vamos encontrar o concurso certo</h1>
    <p style={{ color: "#475569", marginBottom: "1.5rem" }}>Confira o número e a modalidade. A página procurada ainda não está disponível neste endereço.</p>
    <LotterySearch />
    <p style={{ marginTop: "1.5rem" }}><Link href="/" className="button button-secondary">Ver os últimos resultados</Link></p>
  </section>;
}
