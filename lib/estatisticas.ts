import { getDrawsByLoteria } from "./loterias";
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
  if (!cfg || loteria === "federal" || loteria === "super-sete") return null;

  const draws = getDrawsByLoteria(loteria)
    .filter((d) => d.status === "publicado" && d.numeros.length > 0)
    .sort((a, b) => a.concurso - b.concurso); // ordem cronológica ASC

  if (draws.length === 0) return null;

  const totalNumeros = TOTAL_NUMEROS[cfg.apiKey];
  if (!totalNumeros) return null;
  const freqMap = new Map<string, { vezes: number; ultimoConcurso: number; ultimoIndice: number }>();

  // Inicializa todos os números possíveis
  const inicio = cfg.apiKey === "lotomania" ? 0 : 1;
  for (let i = inicio; i < inicio + totalNumeros; i++) {
    freqMap.set(String(i).padStart(2, "0"), { vezes: 0, ultimoConcurso: 0, ultimoIndice: -1 });
  }

  let totalNumerosSorteados = 0;
  let pares = 0;
  let impares = 0;
  for (const [indice, d] of draws.entries()) {
    for (const n of d.numeros) {
      const padded = n.padStart(2, "0");
      const entry = freqMap.get(padded);
      if (entry) {
        entry.vezes++;
        entry.ultimoConcurso = d.concurso;
        entry.ultimoIndice = indice;
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
      atrasoConcursos: info.ultimoIndice >= 0 ? draws.length - 1 - info.ultimoIndice : undefined,
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

const TOTAL_NUMEROS: Record<string, number> = {
  megasena: 60, quina: 80, lotofacil: 25, lotomania: 100,
  timemania: 80, diadesorte: 31, duplasena: 50, maismilionaria: 50,
};

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
