"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LOTERIAS_CONFIG } from "@/lib/loterias-config";

const priority = ["quina", "lotofacil", "mega-sena"];
const modalities = [...priority, ...Object.keys(LOTERIAS_CONFIG).filter(slug => !priority.includes(slug))];

export default function LotterySearch() {
  const router = useRouter();
  const [loteria, setLoteria] = useState("quina");
  const [concurso, setConcurso] = useState("");
  const [error, setError] = useState("");

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = concurso.trim();
    if (!LOTERIAS_CONFIG[loteria] || !/^[0-9]{1,7}$/.test(value) || Number(value) < 1) {
      setError("Digite um número de concurso válido, usando apenas números.");
      return;
    }
    setError("");
    router.push(`/loterias/${loteria}/concurso-${Number(value)}`);
  }

  return (
    <section className="lottery-search" aria-labelledby="search-title">
      <h2 id="search-title">Buscar um concurso</h2>
      <p>Escolha a loteria e informe o número.</p>
      <form onSubmit={submit} noValidate>
        <div className="lottery-search-fields">
          <div className="search-field">
            <label htmlFor="search-lottery">Loteria</label>
            <select id="search-lottery" name="loteria" value={loteria} onChange={event => { setLoteria(event.target.value); setError(""); }}>
              {modalities.map(slug => <option key={slug} value={slug}>{LOTERIAS_CONFIG[slug].name}</option>)}
            </select>
          </div>
          <div className="search-field">
            <label htmlFor="search-contest">Número do concurso</label>
            <input id="search-contest" name="concurso" type="text" inputMode="numeric" pattern="[0-9]+" maxLength={7} autoComplete="off" placeholder="Ex.: 7157" value={concurso} onChange={event => { setConcurso(event.target.value); setError(""); }} aria-invalid={Boolean(error)} aria-describedby={error ? "search-error" : "search-hint"} required />
          </div>
        </div>
        {error && <p id="search-error" className="search-error" role="alert">{error}</p>}
        <button className="button button-primary search-submit" type="submit">Consultar resultado <span aria-hidden="true">→</span></button>
      </form>
      <p id="search-hint" className="search-hint">Não sabe o número? <Link href={`/loterias/${loteria}`}>Veja o histórico da {LOTERIAS_CONFIG[loteria].name}</Link>.</p>
    </section>
  );
}
