import Link from "next/link";
import type { HolidayCalendarModel } from "@/lib/holiday-store";
import { CAPITALS, HOLIDAY_KIND_LABELS } from "@/lib/holiday-calendar.mjs";
import HolidayPreferences from "./HolidayPreferences";
import AdsterraBanner from "./AdsterraBanner";
import AdsterraNative from "./AdsterraNative";
import styles from "./HolidayTools.module.css";

const short = (date: string) => date.split("-").reverse().join("/");
export default function HolidayCalendar({ calendar, years }: { calendar: HolidayCalendarModel; years: number[] }) {
  const { year, location, events } = calendar;
  const national = location.slug === "brasil";
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: location.timeZone }).format(new Date());
  const next = events.find(event => event.date >= today && event.isHoliday);
  const url = `/feriados/${year}${national ? "" : `/${location.slug}`}`;
  const title = national ? `Feriados nacionais e datas de referência de ${year}` : `Feriados em ${location.name} (${location.uf}) de ${year}`;
  const schema = { "@context": "https://schema.org", "@type": "ItemList", name: title, url: `https://www.hojenoticia.com${url}`, itemListElement: events.map((event, index) => ({ "@type": "ListItem", position: index + 1, name: `${short(event.date)} — ${event.name} — ${HOLIDAY_KIND_LABELS[event.kind]}` })) };
  return <div className={styles.shell}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <nav aria-label="Navegação estrutural"><Link href="/">Início</Link> / <Link href="/feriados">Feriados</Link> / {national ? year : `${location.name} · ${year}`}</nav>
    <p className={styles.eyebrow}>Organize suas datas</p><h1>{title}</h1>
    <p>Consulte os dias da semana, a classificação de cada data e a fonte de cada feriado. As referências de Carnaval, Páscoa e outros eventos móveis aparecem separadas dos feriados definidos em lei.</p>
    <AdsterraBanner size="728x90" showOn="desktop" /><AdsterraBanner size="320x50" showOn="mobile" />
    <HolidayPreferences year={year} city={location.slug} years={years} />
    <div className={styles.notice}><strong>Cobertura desta seleção</strong><p>{calendar.coverageNote}</p>{!national && <p>{calendar.localCount} regra{calendar.localCount === 1 ? " local verificada" : "s locais verificadas"} aplicada{calendar.localCount === 1 ? "" : "s"} para {year}. Confirme alterações extraordinárias e o expediente do serviço que você pretende utilizar.</p>}</div>
    {next && <section className={styles.success}><h2>Próximo feriado listado em {year}</h2><p><strong>{next.name}</strong> · <time dateTime={next.date}>{short(next.date)}</time> · {HOLIDAY_KIND_LABELS[next.kind]}.</p></section>}
    <div className={styles.actions}><a className={styles.button} href={`/api/calendario?ano=${year}&cidade=${location.slug}&formato=ics`}>Baixar feriados na agenda (.ics)</a><Link className={`${styles.button} ${styles.secondary}`} href={`/dias-uteis?cidade=${location.slug}`}>Calcular dias úteis</Link></div>
    <p className={styles.small}>A exportação padrão inclui somente feriados legais cadastrados, em eventos de dia inteiro. O arquivo não inclui automaticamente referências ou pontos facultativos de órgãos específicos.</p>
    <div className={styles.tableWrap}><table className={styles.table}><caption>Calendário de {year} · {location.name}</caption><thead><tr><th scope="col">Data</th><th scope="col">Dia</th><th scope="col">Nome e fonte</th><th scope="col">Classificação</th></tr></thead><tbody>{events.map(event => <tr key={event.id}><td><time dateTime={event.date}>{short(event.date)}</time></td><td>{new Date(`${event.date}T12:00:00Z`).toLocaleDateString("pt-BR", { weekday: "long", timeZone: "UTC" })}</td><td><strong>{event.name}</strong><br /><a href={event.source.url} target="_blank" rel="noopener noreferrer" className={styles.small}>{event.source.title}</a>{event.note && <p className={styles.small}>{event.note}</p>}</td><td><span className={`${styles.badge} ${event.isHoliday ? "" : styles.reference}`}>{HOLIDAY_KIND_LABELS[event.kind]}</span></td></tr>)}</tbody></table></div>
    <section><h2>Como usar este calendário</h2><p>Uma data comemorativa ou uma referência de calendário não equivale automaticamente a feriado nacional. Pontos facultativos dependem do órgão, município ou estabelecimento e não significam fechamento de todas as atividades.</p><p>A calculadora usa as datas legais cadastradas e permite informar folgas adicionais. Ela mostra exatamente o que foi descontado; a escolha da capital não confirma calendários locais que ainda não tenham sido verificados.</p><p><a href={`/api/calendario?ano=${year}&cidade=${location.slug}&formato=ics&referencias=1`}>Baixar também as referências na agenda</a> inclui essas datas como eventos provisórios. Reimporte o arquivo se houver atualização das regras.</p></section>
    <AdsterraNative />
    <section><h2>Outros anos e capitais</h2><div className={styles.actions}>{years.filter(value => value !== year).map(value => <Link key={value} href={`/feriados/${value}${national ? "" : `/${location.slug}`}`}>{value}</Link>)}</div><ul className={styles.cities}>{CAPITALS.map(city => <li key={city.slug}><Link href={`/feriados/${year}/${city.slug}`}>{city.name} ({city.uf})</Link></li>)}</ul></section>
  </div>;
}
