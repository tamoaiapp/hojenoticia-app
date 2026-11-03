"use client";

import { useId, useState } from "react";
import {
  calcularMegaSena,
  MEGA_SENA_MAX_DEZENAS,
  MEGA_SENA_MIN_DEZENAS,
} from "@/lib/probabilidades";

const integer = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const percent = new Intl.NumberFormat("pt-BR", { style: "percent", maximumFractionDigits: 8 });

export default function ProbabilityCalculator() {
  const id = useId();
  const [dezenas, setDezenas] = useState(MEGA_SENA_MIN_DEZENAS);
  const result = calcularMegaSena(dezenas);

  return (
    <section aria-labelledby={`${id}-title`} style={{ background: "#fff", border: "1px solid #cbd5e1", borderRadius: 16, padding: "1.25rem", marginBottom: "2rem", minWidth: 0 }}>
      <h2 id={`${id}-title`} style={{ fontSize: "1.4rem", marginBottom: ".75rem", color: "#0f172a" }}>Calculadora de probabilidades da Mega-Sena</h2>
      <p id={`${id}-hint`} style={{ color: "#475569", lineHeight: 1.7, marginBottom: "1rem" }}>
        Selecione uma quantidade de dezenas para entender o cálculo em um único concurso.
        O resultado depende da quantidade escolhida, sem usar números de sorteios anteriores.
      </p>
      <label htmlFor={`${id}-dezenas`} style={{ display: "block", color: "#0f172a", fontWeight: 700, marginBottom: ".5rem" }}>Quantidade de dezenas selecionadas</label>
      <select
        id={`${id}-dezenas`}
        value={dezenas}
        onChange={(event) => setDezenas(Number(event.target.value))}
        aria-describedby={`${id}-hint`}
        style={{ width: "100%", maxWidth: 320, minHeight: 48, padding: ".65rem .85rem", border: "1px solid #64748b", borderRadius: 8, color: "#0f172a", background: "#fff", font: "inherit", marginBottom: "1.25rem" }}
      >
        {Array.from({ length: MEGA_SENA_MAX_DEZENAS - MEGA_SENA_MIN_DEZENAS + 1 }, (_, index) => MEGA_SENA_MIN_DEZENAS + index).map((value) => (
          <option key={value} value={value}>{value} dezenas</option>
        ))}
      </select>

      <div role="status" aria-live="polite" aria-atomic="true">
        <p style={{ color: "#334155", lineHeight: 1.7, marginBottom: "1rem" }}>
          Uma seleção de <strong>{dezenas} dezenas</strong> contém {integer.format(result.combinacoesCobertas)} {result.combinacoesCobertas === 1 ? "combinação" : "combinações"} de seis números, entre os {integer.format(result.totalResultados)} resultados possíveis.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 190px), 1fr))", gap: ".75rem" }}>
          {result.faixas.map((faixa) => (
            <div key={faixa.acertos} style={{ border: "1px solid #cbd5e1", borderTop: "4px solid #146542", borderRadius: 10, padding: "1rem", minWidth: 0 }}>
              <h3 style={{ color: "#0f172a", fontSize: "1rem", marginBottom: ".6rem" }}>{faixa.nome} · {faixa.acertos} acertos</h3>
              <p style={{ color: "#146542", fontSize: "1.25rem", fontWeight: 800, lineHeight: 1.35, marginBottom: ".5rem", overflowWrap: "anywhere" }}>1 em {integer.format(Math.round(faixa.umaEm))}</p>
              <p style={{ color: "#475569", fontSize: ".88rem", lineHeight: 1.6 }}>Percentual aproximado: {percent.format(faixa.probabilidade)}.</p>
            </div>
          ))}
        </div>
      </div>

      <p style={{ color: "#475569", fontSize: ".88rem", lineHeight: 1.7, marginTop: "1rem" }}>
        As razões “1 em” são arredondadas ao inteiro mais próximo, como na tabela da Caixa.
        O cálculo considera exatamente quatro, cinco ou seis acertos na seleção completa.
        A quantidade de prêmios de um bilhete múltiplo é uma informação diferente.
      </p>
    </section>
  );
}
