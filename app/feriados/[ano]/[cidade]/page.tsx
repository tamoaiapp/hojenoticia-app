import type { Metadata } from "next";
import { notFound } from "next/navigation";
import HolidayCalendar from "@/components/HolidayCalendar";
import { CAPITALS } from "@/lib/holiday-calendar.mjs";
import { availableHolidayYears, getHolidayCalendar } from "@/lib/holiday-store";

export const revalidate = 3600;
export const dynamicParams = false;
interface Props { params: Promise<{ ano: string; cidade: string }> }
export function generateStaticParams() { return availableHolidayYears().flatMap(year => CAPITALS.map(city => ({ ano: String(year), cidade: city.slug }))); }
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ano, cidade } = await params;
  const calendar = getHolidayCalendar(Number(ano), cidade);
  if (!calendar) return {};
  const { name, uf } = calendar.location;
  return { title: `Feriados em ${name} (${uf}) ${ano}: calendário e dias úteis`, description: `Consulte as datas cadastradas de ${ano} para ${name} (${uf}), com fontes e cobertura local. Calcule dias úteis e baixe os feriados na sua agenda.`, alternates: { canonical: `https://www.hojenoticia.com/feriados/${ano}/${cidade}` } };
}
export default async function CapitalHolidayPage({ params }: Props) {
  const { ano, cidade } = await params;
  const calendar = getHolidayCalendar(Number(ano), cidade);
  if (!calendar) notFound();
  return <HolidayCalendar calendar={calendar} years={availableHolidayYears()} />;
}
