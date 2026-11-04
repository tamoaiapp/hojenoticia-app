import type { Metadata } from "next";
import Link from "next/link";
import BusinessDayCalculator from "@/components/BusinessDayCalculator";
import { availableHolidayYears } from "@/lib/holiday-store";
import { calendarLocation } from "@/lib/holiday-calendar.mjs";
import styles from "@/components/HolidayTools.module.css";

export const metadata: Metadata = { title: "Calculadora de dias úteis com feriados por capital", description: "Conte dias úteis entre duas datas, selecione uma capital, ajuste os dias da semana e confira os feriados e as folgas descontadas.", alternates: { canonical: "https://www.hojenoticia.com/dias-uteis" } };
export default async function BusinessDaysPage({ searchParams }: { searchParams: Promise<{ cidade?: string }> }) {
  const parameters = await searchParams;
  const location = calendarLocation(parameters.cidade ?? "brasil") ?? calendarLocation("brasil")!;
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: location.timeZone }).format(new Date());
  return <div className={styles.shell}><nav aria-label="Navegação estrutural"><Link href="/">Início</Link> / <Link href="/feriados">Feriados</Link> / Dias úteis</nav><p className={styles.eyebrow}>Planeje seu período</p><h1>Calculadora de dias úteis</h1><p>Escolha as datas e a localidade. Ajuste se a contagem inclui o início, o fim e o sábado, e veja quais datas foram retiradas do período.</p><BusinessDayCalculator initialDate={today} initialCity={location.slug} years={availableHolidayYears()} /><section><h2>O que a contagem considera</h2><p>O resultado combina a semana de trabalho escolhida com os feriados cadastrados para o ano e a capital. Datas de referência só entram se você marcar a simulação de folga. Você também pode informar fechamentos adicionais do seu calendário.</p><p>Confira a cobertura local e a relação de datas descontadas antes de usar o total no seu planejamento. Calendários de bancos, órgãos e atividades específicas podem ter expediente próprio.</p><Link href="/feriados">Consultar calendários e fontes por capital</Link></section></div>;
}
