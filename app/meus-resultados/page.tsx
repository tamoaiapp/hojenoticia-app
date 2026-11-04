import type { Metadata } from "next";
import MyResults from "@/components/MyResults";

export const metadata: Metadata = {
  title: "Meus resultados: favoritos e avisos locais de loterias",
  description: "Escolha as modalidades que acompanha, consulte os últimos concursos e ative avisos opcionais neste navegador com o site aberto.",
  robots: { index: false, follow: true, googleBot: { index: false, follow: true } },
  alternates: { canonical: "https://www.hojenoticia.com/meus-resultados" },
};

export default function MyResultsPage() { return <MyResults />; }
