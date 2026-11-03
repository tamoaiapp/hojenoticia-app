export const LOTERIAS_CONFIG: Record<string, {
  name: string; emoji: string; color: string; ballColor: string;
  numCount: number; apiKey: string; freq: string; description: string; sourceUrl: string;
}> = {
  "mega-sena": {
    name: "Mega-Sena", emoji: "🍀", color: "#187a52", ballColor: "#146542",
    numCount: 6, apiKey: "megasena", freq: "Consulte a programação oficial",
    description: "São sorteadas 6 dezenas entre 1 e 60. Confira os números, a premiação e os concursos anteriores.",
    sourceUrl: "https://loterias.caixa.gov.br/Paginas/Mega-Sena.aspx",
  },
  "quina": {
    name: "Quina", emoji: "⭐", color: "#6F3F8E", ballColor: "#5a3275",
    numCount: 5, apiKey: "quina", freq: "Consulte a programação oficial",
    description: "São sorteadas 5 dezenas entre 1 e 80. Consulte os números e a premiação de cada concurso.",
    sourceUrl: "https://loterias.caixa.gov.br/Paginas/Quina.aspx",
  },
  "lotofacil": {
    name: "Lotofácil", emoji: "🌸", color: "#930089", ballColor: "#780070",
    numCount: 15, apiKey: "lotofacil", freq: "Consulte a programação oficial",
    description: "São sorteadas 15 dezenas entre 1 e 25, com faixas de premiação de 11 a 15 acertos.",
    sourceUrl: "https://loterias.caixa.gov.br/Paginas/Lotofacil.aspx",
  },
  "lotomania": {
    name: "Lotomania", emoji: "🎯", color: "#a64b00", ballColor: "#8c4000",
    numCount: 20, apiKey: "lotomania", freq: "Consulte a programação oficial",
    description: "São sorteados 20 números entre 00 e 99. Veja os números e as faixas de premiação do concurso.",
    sourceUrl: "https://loterias.caixa.gov.br/Paginas/Lotomania.aspx",
  },
  "timemania": {
    name: "Timemania", emoji: "⚽", color: "#00713A", ballColor: "#005a2e",
    numCount: 7, apiKey: "timemania", freq: "Consulte a programação oficial",
    description: "7 números de 1 a 80 mais um time do coração.",
    sourceUrl: "https://loterias.caixa.gov.br/Paginas/Timemania.aspx",
  },
  "diadesorte": {
    name: "Dia de Sorte", emoji: "🍀", color: "#925c08", ballColor: "#8a5607",
    numCount: 7, apiKey: "diadesorte", freq: "Consulte a programação oficial",
    description: "7 números de 1 a 31 mais um mês da sorte.",
    sourceUrl: "https://loterias.caixa.gov.br/Paginas/Dia-de-Sorte.aspx",
  },
  "dupla-sena": {
    name: "Dupla Sena", emoji: "🎲", color: "#D22F27", ballColor: "#a82420",
    numCount: 6, apiKey: "duplasena", freq: "Consulte a programação oficial",
    description: "Cada concurso tem dois sorteios de 6 dezenas entre 1 e 50. Confira os dois resultados.",
    sourceUrl: "https://loterias.caixa.gov.br/Paginas/Dupla-Sena.aspx",
  },
  "maismilionaria": {
    name: "+Milionária", emoji: "💎", color: "#005CA9", ballColor: "#003d70",
    numCount: 6, apiKey: "maismilionaria", freq: "Consulte a programação oficial",
    description: "São sorteadas 6 dezenas entre 1 e 50 e 2 trevos entre 1 e 6.",
    sourceUrl: "https://loterias.caixa.gov.br/Paginas/Mais-Milionaria.aspx",
  },
  "super-sete": {
    name: "Super Sete", emoji: "7️⃣", color: "#806800", ballColor: "#756000",
    numCount: 7, apiKey: "supersete", freq: "Consulte a programação oficial",
    description: "São sorteados 7 algarismos de 0 a 9, um em cada coluna. A ordem das colunas faz parte do resultado.",
    sourceUrl: "https://loterias.caixa.gov.br/Paginas/Super-Sete.aspx",
  },
  "federal": {
    name: "Loteria Federal", emoji: "🎟️", color: "#0066B3", ballColor: "#004680",
    numCount: 5, apiKey: "federal", freq: "Consulte a programação oficial",
    description: "Confira os bilhetes sorteados para os cinco prêmios principais de cada extração.",
    sourceUrl: "https://loterias.caixa.gov.br/Paginas/Federal.aspx",
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
