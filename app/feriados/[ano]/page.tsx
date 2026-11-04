import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HolidayCalendar from "@/components/HolidayCalendar";
import { availableHolidayYears, getHolidayCalendar } from "@/lib/holiday-store";

export const revalidate = 3600;
export function generateStaticParams() { return availableHolidayYears().map(year => ({ ano: String(year) })); }
export async function generateMetadata({ params }: { params: Promise<{ ano: string }> }): Promise<Metadata> {
  const { ano } = await params;
  if (!getHolidayCalendar(Number(ano))) return {};
  return { title: `Feriados nacionais e calendário de ${ano}`, description: `Confira os feriados nacionais de ${ano}, os dias da semana e as fontes. Escolha uma capital, calcule dias úteis e baixe as datas na agenda.`, alternates: { canonical: `https://www.hojenoticia.com/feriados/${ano}` } };
}
export default async function HolidayYearPage({ params }: { params: Promise<{ ano: string }> }) {
  const { ano } = await params;
  const calendar = getHolidayCalendar(Number(ano));
  if (!calendar) notFound();
  return <HolidayCalendar calendar={calendar} years={availableHolidayYears()} />;
}
