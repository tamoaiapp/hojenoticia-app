/** Regras e tabela de referência: Mega-Sena, Portal Loterias Caixa. */
export const MEGA_SENA_FONTE = "https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx";
export const MEGA_SENA_MIN_DEZENAS = 6;
export const MEGA_SENA_MAX_DEZENAS = 20;

/**
 * Combinações sem repetição e sem considerar a ordem.
 * BigInt mantém os passos exatos; o retorno só admite inteiros seguros.
 */
export function combinacoes(n: number, k: number): number {
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || n > 60 || k < 0 || k > n) {
    throw new RangeError("Use inteiros com 0 ≤ k ≤ n ≤ 60.");
  }

  const size = Math.min(k, n - k);
  let result = BigInt(1);
  for (let i = 1; i <= size; i++) {
    result = (result * BigInt(n - size + i)) / BigInt(i);
  }
  if (result > BigInt(Number.MAX_SAFE_INTEGER)) {
    throw new RangeError("O resultado excede o limite de inteiros exatos desta calculadora.");
  }
  return Number(result);
}

export const MEGA_SENA_TOTAL_RESULTADOS = combinacoes(60, 6);

export interface FaixaMegaSena {
  nome: "Sena" | "Quina" | "Quadra";
  acertos: 6 | 5 | 4;
  resultadosFavoraveis: number;
  probabilidade: number;
  umaEm: number;
}

export interface ProbabilidadeMegaSena {
  dezenas: number;
  combinacoesCobertas: number;
  totalResultados: number;
  faixas: FaixaMegaSena[];
}

/**
 * P(exatamente k acertos) = C(n,k) × C(60−n,6−k) / C(60,6).
 * Os acertos se referem ao conjunto completo de n dezenas selecionadas.
 * Não calcula quantos prêmios um bilhete múltiplo recebe.
 */
export function calcularMegaSena(dezenas: number): ProbabilidadeMegaSena {
  if (!Number.isInteger(dezenas) || dezenas < MEGA_SENA_MIN_DEZENAS || dezenas > MEGA_SENA_MAX_DEZENAS) {
    throw new RangeError("A quantidade de dezenas deve ser um inteiro entre 6 e 20.");
  }

  const faixas = [
    { nome: "Sena", acertos: 6 },
    { nome: "Quina", acertos: 5 },
    { nome: "Quadra", acertos: 4 },
  ] as const;

  return {
    dezenas,
    combinacoesCobertas: combinacoes(dezenas, 6),
    totalResultados: MEGA_SENA_TOTAL_RESULTADOS,
    faixas: faixas.map(({ nome, acertos }) => {
      const resultadosFavoraveis = combinacoes(dezenas, acertos) * combinacoes(60 - dezenas, 6 - acertos);
      return {
        nome,
        acertos,
        resultadosFavoraveis,
        probabilidade: resultadosFavoraveis / MEGA_SENA_TOTAL_RESULTADOS,
        umaEm: MEGA_SENA_TOTAL_RESULTADOS / resultadosFavoraveis,
      };
    }),
  };
}

export function tabelaMegaSena(): ProbabilidadeMegaSena[] {
  return Array.from(
    { length: MEGA_SENA_MAX_DEZENAS - MEGA_SENA_MIN_DEZENAS + 1 },
    (_, index) => calcularMegaSena(MEGA_SENA_MIN_DEZENAS + index),
  );
}
