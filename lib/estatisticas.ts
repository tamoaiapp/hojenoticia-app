import { getDrawsByLoteria, type DrawMeta } from "./loterias";
import { LOTERIAS_CONFIG } from "./loterias-config";

export interface NumeroFrequencia {
  numero: string;       // "01" a "60" etc.
  vezes: number;        // quantas vezes saiu
  percentual: number;   // 0-100
  ultimoConcurso?: number;
  atrasoConcursos?: number; // quantos concursos sem sair
}

export interface EstatisticasLoteria {
  loteria: string;
  totalConcursos: number;
  totalNumeros: number;       // 60 pra Mega, 80 pra Quina, etc.
  numerosPorSorteio: number;  // 6 pra Mega, 5 pra Quina, etc.
  frequencias: NumeroFrequencia[];     // ordenado por frequência DESC
  maisSorteados: NumeroFrequencia[];   // top 10
  menosSorteados: NumeroFrequencia[];  // bottom 10
  maisAtrasados: NumeroFrequencia[];   // não saem há mais concursos
  paresImpares: { pares: number; impares: number };
  mediaPorSorteio: number;
  ultimaAtualizacao: string;
}

export function calcularEstatisticas(loteria: string): EstatisticasLoteria | null {
  const cfg = LOTERIAS_CONFIG[loteria];
  if (!cfg) return null;

  const draws = getDrawsByLoteria(loteria)
    .filter((d) => d.status === "publicado" && d.numeros.length > 0)
    .sort((a, b) => a.concurso - b.concurso); // ordem cronológica ASC

  if (draws.length === 0) return null;

  const totalNumeros = inferirTotalNumeros(cfg.apiKey, draws);
  const freqMap = new Map<string, { vezes: number; ultimoConcurso: number }>();

  // Inicializa todos os números possíveis
  const inicio = cfg.apiKey === "lotomania" ? 0 : 1;
  for (let i = inicio; i <= totalNumeros; i++) {
    freqMap.set(String(i).padStart(2, "0"), { vezes: 0, ultimoConcurso: 0 });
  }

  let totalNumerosSorteados = 0;
  let pares = 0;
  let impares = 0;
  const ultimoConcurso = draws[draws.length - 1].concurso;

  for (const d of draws) {
    for (const n of d.numeros) {
      const padded = n.padStart(2, "0");
      const entry = freqMap.get(padded);
      if (entry) {
        entry.vezes++;
        entry.ultimoConcurso = d.concurso;
      }
      totalNumerosSorteados++;
      const num = Number(n);
      if (num % 2 === 0) pares++;
      else impares++;
    }
  }

  const totalSorteios = draws.length;
  const frequencias: NumeroFrequencia[] = [];
  for (const [numero, info] of freqMap) {
    frequencias.push({
      numero,
      vezes: info.vezes,
      percentual: totalSorteios > 0 ? (info.vezes / totalSorteios) * 100 : 0,
      ultimoConcurso: info.ultimoConcurso || undefined,
      atrasoConcursos: info.ultimoConcurso > 0 ? ultimoConcurso - info.ultimoConcurso : undefined,
    });
  }
  frequencias.sort((a, b) => b.vezes - a.vezes);

  const maisSorteados = frequencias.slice(0, 10);
  const menosSorteados = [...frequencias].reverse().slice(0, 10);
  const maisAtrasados = [...frequencias]
    .filter((f) => f.atrasoConcursos !== undefined)
    .sort((a, b) => (b.atrasoConcursos ?? 0) - (a.atrasoConcursos ?? 0))
    .slice(0, 10);

  return {
    loteria,
    totalConcursos: totalSorteios,
    totalNumeros,
    numerosPorSorteio: cfg.numCount,
    frequencias,
    maisSorteados,
    menosSorteados,
    maisAtrasados,
    paresImpares: { pares, impares },
    mediaPorSorteio: totalSorteios > 0 ? totalNumerosSorteados / totalSorteios : 0,
    ultimaAtualizacao: draws[draws.length - 1].draw_date,
  };
}

function inferirTotalNumeros(apiKey: string, draws: DrawMeta[]): number {
  // Pra cada loteria, o range é fixo
  switch (apiKey) {
    case "megasena":    return 60;
    case "quina":       return 80;
    case "lotofacil":   return 25;
    case "lotomania":   return 99;
    case "timemania":   return 80;
    case "diadesorte":  return 31;
    case "duplasena":   return 50;
    default:
      // Fallback: descobre pelo maior número já sorteado
      let max = 0;
      for (const d of draws) {
        for (const n of d.numeros) {
          const num = Number(n);
          if (num > max) max = num;
        }
      }
      return max;
  }
}

/**
 * Sugestão estatística para o próximo sorteio: combina os 3 números
 * mais sorteados com os 3 mais atrasados (estratégia mista).
 * NÃO é garantia — é só uma combinação interessante baseada no histórico.
 */
export function sugerirNumeros(stats: EstatisticasLoteria): string[] {
  const qtd = stats.numerosPorSorteio;
  const metade = Math.floor(qtd / 2);
  const quentes = stats.maisSorteados.slice(0, metade).map((f) => f.numero);
  const frios = stats.maisAtrasados.slice(0, qtd - metade).map((f) => f.numero);
  const conjunto = Array.from(new Set([...quentes, ...frios]));
  // Se faltarem (overlap), pega mais quentes
  let i = metade;
  while (conjunto.length < qtd && i < stats.maisSorteados.length) {
    if (!conjunto.includes(stats.maisSorteados[i].numero)) {
      conjunto.push(stats.maisSorteados[i].numero);
    }
    i++;
  }
  return conjunto.slice(0, qtd).sort((a, b) => Number(a) - Number(b));
}
