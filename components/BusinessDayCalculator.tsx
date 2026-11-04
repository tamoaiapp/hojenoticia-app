"use client";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CAPITALS, addCivilDays, countBusinessDays } from "@/lib/holiday-calendar.mjs";
import type { HolidayCalendarModel } from "@/lib/holiday-store";
import styles from "./HolidayTools.module.css";

type CountResult = ReturnType<typeof countBusinessDays> & { cityName: string; city: string; start: string; end: string; coverage: string[]; references: boolean };
export default function BusinessDayCalculator({ initialDate, initialCity, years }: { initialDate: string; initialCity: string; years: number[] }) {
  const [city, setCity] = useState(initialCity), [start, setStart] = useState(initialDate), [end, setEnd] = useState(addCivilDays(initialDate, 30));
  const [includeStart, setIncludeStart] = useState(false), [includeEnd, setIncludeEnd] = useState(true), [saturday, setSaturday] = useState(false), [references, setReferences] = useState(false), [extra, setExtra] = useState("");
  const [loading, setLoading] = useState(false), [error, setError] = useState(""), [result, setResult] = useState<CountResult | null>(null);
  const request = useRef<AbortController | null>(null);
  useEffect(() => () => request.current?.abort(), []);
  function invalidate() { request.current?.abort(); request.current = null; setLoading(false); setResult(null); setError(""); }
  async function calculate(event: FormEvent) {
    event.preventDefault(); request.current?.abort();
    const controller = new AbortController(); request.current = controller;
    const timeout = window.setTimeout(() => controller.abort("timeout"), 15000);
    setLoading(true); setError(""); setResult(null);
    try {
      const first = Number(start.slice(0, 4)), last = Number(end.slice(0, 4));
      if (!years.includes(first) || !years.includes(last)) throw new Error(`Escolha datas entre ${years[0]} e ${years.at(-1)}.`);
      if (last < first || end < start) throw new Error("A data final precisa ser igual ou posterior à inicial.");
      const calendars = await Promise.all(Array.from({ length: last - first + 1 }, async (_, index) => {
        const response = await fetch(`/api/calendario?ano=${first + index}&cidade=${city}`, { signal: controller.signal });
        if (!response.ok) throw new Error("Não foi possível carregar o calendário desta localidade. Tente novamente.");
        const data = await response.json() as HolidayCalendarModel;
        if (!Array.isArray(data.events) || data.year !== first + index || data.location?.slug !== city) throw new Error("O calendário recebido não corresponde à seleção. Tente novamente.");
        return data;
      }));
      const extraDates = extra.trim() ? extra.split(/[,;\s]+/).filter(Boolean) : [];
      const count = countBusinessDays({ start, end, calendars, includeStart, includeEnd, saturdayIsWorking: saturday, includeReferenceDates: references, extraDates });
      if (controller.signal.aborted || request.current !== controller) return;
      setResult({ ...count, city, cityName: calendars[0].location.name, start, end, references, coverage: [...new Set(calendars.map(calendar => calendar.coverageNote))] });
      window.dispatchEvent(new CustomEvent("hoje:business-days-calculated", { detail: { city, workingDays: count.working, consideredDays: count.considered } }));
    } catch (failure) {
      if (request.current === controller && (!controller.signal.aborted || controller.signal.reason === "timeout")) setError(controller.signal.reason === "timeout" ? "O calendário demorou para responder. Tente calcular novamente." : failure instanceof Error ? failure.message : "Não foi possível concluir a contagem.");
    } finally { window.clearTimeout(timeout); if (request.current === controller) { setLoading(false); request.current = null; } }
  }
  const min = `${years[0]}-01-01`, max = `${years.at(-1)}-12-31`;
  return <>
    <form className={styles.card} onSubmit={calculate} onChange={invalidate}>
      <div className={styles.grid}>
        <label className={styles.field}>Data inicial<input type="date" required min={min} max={max} value={start} onChange={event => setStart(event.target.value)} /></label>
        <label className={styles.field}>Data final<input type="date" required min={min} max={max} value={end} onChange={event => setEnd(event.target.value)} /></label>
        <label className={styles.field}>Calendário da localidade<select value={city} onChange={event => setCity(event.target.value)}><option value="brasil">Brasil — somente cobertura nacional</option>{CAPITALS.map(location => <option key={location.slug} value={location.slug}>{location.name} ({location.uf})</option>)}</select></label>
        <label className={styles.field}>Folgas adicionais, se houver<textarea value={extra} maxLength={1200} onChange={event => setExtra(event.target.value)} placeholder="Ex.: 2026-12-24, 2026-12-31" /><span className={styles.small}>Use AAAA-MM-DD, separadas por vírgula ou linha. Essas datas ficam somente nesta consulta.</span></label>
      </div>
      <label className={styles.check}><input type="checkbox" checked={includeStart} onChange={event => setIncludeStart(event.target.checked)} />Incluir a data inicial na contagem</label>
      <label className={styles.check}><input type="checkbox" checked={includeEnd} onChange={event => setIncludeEnd(event.target.checked)} />Incluir a data final na contagem</label>
      <label className={styles.check}><input type="checkbox" checked={saturday} onChange={event => setSaturday(event.target.checked)} />Considerar sábado como dia de trabalho</label>
      <label className={styles.check}><input type="checkbox" checked={references} onChange={event => setReferences(event.target.checked)} />Descontar também as referências de calendário, simulando folga nessas datas</label>
      <p className={styles.small}>Por padrão, entram segunda a sexta e são descontados os feriados legais cadastrados. Carnaval e outras referências não são descontados automaticamente onde não houver regra local confirmada.</p>
      <button className={styles.button} type="submit" disabled={loading}>{loading ? "Carregando calendário…" : "Calcular dias úteis"}</button>
    </form>
    {error && <p role="alert" className={styles.error}>{error}</p>}
    <div aria-live="polite" aria-busy={loading}>
      {result && <section className={styles.card} aria-labelledby="business-day-result-title">
        <h2 id="business-day-result-title">Contagem para {result.cityName}</h2>
        <p>De {result.start.split("-").reverse().join("/")} a {result.end.split("-").reverse().join("/")}, conforme as opções selecionadas.</p>
        <p className={styles.result}>{result.working} dia{result.working === 1 ? " útil" : "s úteis"}</p>
        <div className={styles.stats}><div><strong>{result.considered}</strong>dias considerados</div><div><strong>{result.weekends}</strong>dias de fim de semana</div><div><strong>{result.holidays}</strong>{result.references ? "feriados e referências" : "feriados cadastrados"}</div><div><strong>{result.manual}</strong>folgas adicionais</div></div>
        <div className={styles.notice}>{result.coverage.map(note => <p key={note}>{note}</p>)}</div>
        {result.excluded.length > 0 && <><h3>Datas descontadas em dias de trabalho</h3><ul className={styles.sources}>{result.excluded.map(item => <li key={item.date}>{item.date.split("-").reverse().join("/")}: {item.reason}</li>)}</ul></>}
        <p className={styles.small}>Feriado em um dia já excluído da semana é descontado uma única vez.</p>
        <Link href={`/feriados/${result.start.slice(0, 4)}${result.city === "brasil" ? "" : `/${result.city}`}`}>Ver as fontes e as datas deste calendário</Link>
      </section>}
    </div>
  </>;
}
