interface Props {
  values: string[];
  color: string;
  loteria?: string;
  label?: string;
}

export default function DrawNumbers({ values, color, loteria, label }: Props) {
  const federal = loteria === "federal";
  const columns = loteria === "super-sete";
  return (
    <ol className={`result-numbers${federal || columns ? " ordered-numbers" : ""}`} aria-label={label ?? (federal ? "Bilhetes por ordem de prêmio" : columns ? "Dígitos por coluna" : "Números sorteados")}>
      {values.map((value, index) => (
        <li key={`${index}-${value}`} style={{ backgroundColor: color }} className={federal ? "number-ticket" : undefined}>
          {(federal || columns) && <span className="number-position">{federal ? `${index + 1}º prêmio` : `Coluna ${index + 1}`}</span>}
          <span>{federal || columns ? String(value) : String(value).padStart(2, "0")}</span>
        </li>
      ))}
    </ol>
  );
}
