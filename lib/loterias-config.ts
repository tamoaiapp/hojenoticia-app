export const LOTERIAS_CONFIG: Record<string, {
  name: string; emoji: string; color: string; ballColor: string;
  numCount: number; apiKey: string; freq: string; description: string;
}> = {
  "mega-sena": {
    name: "Mega-Sena", emoji: "🍀", color: "#209869", ballColor: "#1a7a55",
    numCount: 6, apiKey: "megasena", freq: "Quarta e Sábado",
    description: "O maior prêmio das loterias brasileiras. São sorteados 6 números de 1 a 60.",
  },
  "quina": {
    name: "Quina", emoji: "⭐", color: "#6F3F8E", ballColor: "#5a3275",
    numCount: 5, apiKey: "quina", freq: "Segunda a Sábado",
    description: "5 números de 1 a 80 sorteados diariamente. Acumula frequentemente.",
  },
  "lotofacil": {
    name: "Lotofácil", emoji: "🌸", color: "#930089", ballColor: "#780070",
    numCount: 15, apiKey: "lotofacil", freq: "Todos os dias",
    description: "15 números de 1 a 25. A loteria com maior chance de ganhar.",
  },
  "lotomania": {
    name: "Lotomania", emoji: "🎯", color: "#F78100", ballColor: "#c06500",
    numCount: 20, apiKey: "lotomania", freq: "Segunda, Quarta e Sexta",
    description: "20 números de 0 a 99. Acumula se ninguém acertar os 20.",
  },
  "timemania": {
    name: "Timemania", emoji: "⚽", color: "#00713A", ballColor: "#005a2e",
    numCount: 7, apiKey: "timemania", freq: "Terça, Quinta e Sábado",
    description: "7 números de 1 a 80 mais um time do coração.",
  },
  "diadesorte": {
    name: "Dia de Sorte", emoji: "🍀", color: "#B37009", ballColor: "#8a5607",
    numCount: 7, apiKey: "diadesorte", freq: "Terça, Quinta e Sábado",
    description: "7 números de 1 a 31 mais um mês da sorte.",
  },
  "dupla-sena": {
    name: "Dupla Sena", emoji: "🎲", color: "#D22F27", ballColor: "#a82420",
    numCount: 6, apiKey: "duplasena", freq: "Terça, Quinta e Sábado",
    description: "6 números de 1 a 50 sorteados duas vezes por concurso.",
  },
  "maismilionaria": {
    name: "+Milionária", emoji: "💎", color: "#005CA9", ballColor: "#003d70",
    numCount: 6, apiKey: "maismilionaria", freq: "Sábado",
    description: "6 números de 1 a 50 mais 2 trevos de 1 a 6. Prêmio mínimo de R$ 10 milhões.",
  },
  "super-sete": {
    name: "Super Sete", emoji: "7️⃣", color: "#C5A100", ballColor: "#9c8000",
    numCount: 7, apiKey: "supersete", freq: "Segunda, Quarta e Sexta",
    description: "Escolha 1 número de 0 a 9 em cada uma das 7 colunas.",
  },
  "federal": {
    name: "Loteria Federal", emoji: "🎟️", color: "#0066B3", ballColor: "#004680",
    numCount: 5, apiKey: "federal", freq: "Quarta e Sábado",
    description: "Sorteio por bilhetes com 5 prêmios principais. Maior loteria do Brasil em duração.",
  },
};

export function formatBRL(n: number): string {
  if (n >= 1_000_000) return `R$ ${(n / 1_000_000).toFixed(1).replace(".", ",")} milhões`;
  if (n >= 1_000)     return `R$ ${(n / 1_000).toFixed(0)} mil`;
  return n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-");
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  return dt.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}

export function formatDateShort(iso: string): string {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}
