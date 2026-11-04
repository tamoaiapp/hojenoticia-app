import type { Metadata } from "next";
import Link from "next/link";
import { availableHolidayYears } from "@/lib/holiday-store";
import { CAPITALS } from "@/lib/holiday-calendar.mjs";
import HolidayPreferences from "@/components/HolidayPreferences";
import styles from "@/components/HolidayTools.module.css";

export const revalidate = 3600;
export const metadata: Metadata = { title: "Feriados por capital, calendário e dias úteis", description: "Escolha uma capital brasileira e o ano, consulte feriados com fontes, salve sua localidade, exporte o calendário e calcule dias úteis.", alternates: { canonical: "https://www.hojenoticia.com/feriados" } };
export default function HolidaysPage() {
  const years = availableHolidayYears();
  const current = Number(new Intl.DateTimeFormat("en", { timeZone: "America/Sao_Paulo", year: "numeric" }).format(new Date()));
  const year = years.includes(current) ? current : years[0];
  return <div className={styles.shell}><p className={styles.eyebrow}>Calendário para sua rotina</p><h1>Feriados por capital e dias úteis</h1><p>Encontre as datas da sua localidade, confira a fonte e organize seus próximos compromissos. Cada calendário informa quais regras locais estão verificadas e quais datas são apenas referências.</p><HolidayPreferences year={year} years={years} /><div className={styles.actions}><Link className={styles.button} href="/dias-uteis">Calcular dias úteis</Link><Link className={`${styles.button} ${styles.secondary}`} href={`/feriados/${year}`}>Ver cobertura nacional de {year}</Link></div><section><h2>Calendários das capitais em {year}</h2><ul className={styles.cities}>{CAPITALS.map(city => <li key={city.slug}><Link href={`/feriados/${year}/${city.slug}`}>{city.name} ({city.uf})</Link></li>)}</ul></section><section><h2>Outros anos disponíveis</h2><div className={styles.actions}>{years.map(value => <Link key={value} href={`/feriados/${value}`}>{value}</Link>)}</div><p>Os feriados nacionais definidos em lei aparecem separados de referências como Carnaval e Páscoa. Pontos facultativos e expedientes específicos dependem dos atos aplicáveis ao local e à atividade.</p></section></div>;
}
