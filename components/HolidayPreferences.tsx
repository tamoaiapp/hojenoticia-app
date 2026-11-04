"use client";
import Link from "next/link";
import { useState, useSyncExternalStore } from "react";
import { CAPITALS } from "@/lib/holiday-calendar.mjs";
import styles from "./HolidayTools.module.css";

const KEY = "hoje:holiday-city:v1";
const EVENT = "hoje:holiday-city-change";
function readSaved() { try { return localStorage.getItem(KEY) ?? ""; } catch { return ""; } }
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback); window.addEventListener(EVENT, callback);
  return () => { window.removeEventListener("storage", callback); window.removeEventListener(EVENT, callback); };
}
export default function HolidayPreferences({ year, city = "brasil", years }: { year: number; city?: string; years: number[] }) {
  const [selectedCity, setCity] = useState(city), [selectedYear, setYear] = useState(year), [message, setMessage] = useState("");
  const stored = useSyncExternalStore(subscribe, readSaved, () => "");
  const saved = CAPITALS.find(location => location.slug === stored);
  const validStored = stored === "brasil" || !!saved;
  const href = `/feriados/${selectedYear}${selectedCity === "brasil" ? "" : `/${selectedCity}`}`;
  function save(remove = false) {
    try {
      if (remove) localStorage.removeItem(KEY); else localStorage.setItem(KEY, selectedCity);
      window.dispatchEvent(new Event(EVENT));
      setMessage(remove ? "Preferência apagada deste navegador." : "Preferência salva somente neste navegador.");
    } catch { setMessage("O navegador não permitiu salvar. Você pode continuar usando o calendário normalmente."); }
  }
  return <section className={styles.card} aria-labelledby="choose-calendar-title">
    <h2 id="choose-calendar-title">Escolha o ano e a capital</h2>
    <div className={styles.grid}>
      <label className={styles.field}>Localidade<select value={selectedCity} onChange={event => setCity(event.target.value)}><option value="brasil">Brasil — somente cobertura nacional</option>{CAPITALS.map(location => <option key={location.slug} value={location.slug}>{location.name} ({location.uf})</option>)}</select></label>
      <label className={styles.field}>Ano<select value={selectedYear} onChange={event => setYear(Number(event.target.value))}>{years.map(value => <option key={value} value={value}>{value}</option>)}</select></label>
    </div>
    <div className={styles.actions}><Link className={styles.button} href={href}>Ver calendário</Link><button className={`${styles.button} ${styles.secondary}`} type="button" onClick={() => save()}>Salvar minha localidade</button>{stored && <button className={`${styles.button} ${styles.secondary}`} type="button" onClick={() => save(true)}>Apagar preferência</button>}</div>
    {saved && <p className={styles.small}>Salva neste navegador: <Link href={`/feriados/${selectedYear}/${saved.slug}`}>{saved.name} ({saved.uf})</Link>.</p>}
    {validStored && stored === "brasil" && <p className={styles.small}>Salva neste navegador: <Link href={`/feriados/${selectedYear}`}>Brasil — cobertura nacional</Link>.</p>}
    <p className={styles.small}>A preferência fica neste dispositivo. A cobertura local e as fontes aparecem em cada calendário.</p>
    <p role="status" className={styles.small}>{message}</p>
  </section>;
}
