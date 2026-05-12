/**
 * Configuração da Copa do Mundo FIFA 2026
 * Fonte: FIFA + Wikipedia (sorteio realizado em dez/2025)
 * Sujeito a revisão: alguns grupos ainda em verificação.
 */

export const COPA_INFO = {
  edicao: "2026",
  ano: 2026,
  inicio: "2026-06-11",
  fim: "2026-07-19",
  paises_sede: ["Estados Unidos", "Canadá", "México"],
  total_times: 48,
  total_jogos: 104,
  total_grupos: 12,
  abertura: {
    data: "2026-06-11",
    local: "Estadio Azteca, Cidade do México",
    descricao: "México joga a partida de abertura no Estadio Azteca.",
  },
  final: {
    data: "2026-07-19",
    local: "MetLife Stadium, Nova York/Nova Jersey",
  },
};

export type Grupo = {
  letra: string;
  times: { nome: string; bandeira: string; codigo: string }[];
};

/**
 * 12 grupos com 4 times cada — sorteio FIFA dez/2025.
 * `codigo` segue ISO 3166-1 alpha-2 (em minúsculo) para flag emojis.
 */
export const GRUPOS: Grupo[] = [
  { letra: "A", times: [
    { nome: "México",          bandeira: "🇲🇽", codigo: "mx" },
    { nome: "África do Sul",   bandeira: "🇿🇦", codigo: "za" },
    { nome: "Coreia do Sul",   bandeira: "🇰🇷", codigo: "kr" },
    { nome: "Tchéquia",        bandeira: "🇨🇿", codigo: "cz" },
  ]},
  { letra: "B", times: [
    { nome: "Canadá",          bandeira: "🇨🇦", codigo: "ca" },
    { nome: "Bósnia",          bandeira: "🇧🇦", codigo: "ba" },
    { nome: "Catar",           bandeira: "🇶🇦", codigo: "qa" },
    { nome: "Suíça",           bandeira: "🇨🇭", codigo: "ch" },
  ]},
  { letra: "C", times: [
    { nome: "Brasil",          bandeira: "🇧🇷", codigo: "br" },
    { nome: "Marrocos",        bandeira: "🇲🇦", codigo: "ma" },
    { nome: "Haiti",           bandeira: "🇭🇹", codigo: "ht" },
    { nome: "Escócia",         bandeira: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", codigo: "sct" },
  ]},
  { letra: "D", times: [
    { nome: "Estados Unidos",  bandeira: "🇺🇸", codigo: "us" },
    { nome: "Paraguai",        bandeira: "🇵🇾", codigo: "py" },
    { nome: "Austrália",       bandeira: "🇦🇺", codigo: "au" },
    { nome: "Turquia",         bandeira: "🇹🇷", codigo: "tr" },
  ]},
  { letra: "E", times: [
    { nome: "Alemanha",        bandeira: "🇩🇪", codigo: "de" },
    { nome: "Curaçao",         bandeira: "🇨🇼", codigo: "cw" },
    { nome: "Costa do Marfim", bandeira: "🇨🇮", codigo: "ci" },
    { nome: "Equador",         bandeira: "🇪🇨", codigo: "ec" },
  ]},
  { letra: "F", times: [
    { nome: "França",          bandeira: "🇫🇷", codigo: "fr" },
    { nome: "Holanda",         bandeira: "🇳🇱", codigo: "nl" },
    { nome: "Polônia",         bandeira: "🇵🇱", codigo: "pl" },
    { nome: "Egito",           bandeira: "🇪🇬", codigo: "eg" },
  ]},
  { letra: "G", times: [
    { nome: "Espanha",         bandeira: "🇪🇸", codigo: "es" },
    { nome: "Sérvia",          bandeira: "🇷🇸", codigo: "rs" },
    { nome: "Noruega",         bandeira: "🇳🇴", codigo: "no" },
    { nome: "Argélia",         bandeira: "🇩🇿", codigo: "dz" },
  ]},
  { letra: "H", times: [
    { nome: "Portugal",        bandeira: "🇵🇹", codigo: "pt" },
    { nome: "Bélgica",         bandeira: "🇧🇪", codigo: "be" },
    { nome: "Croácia",         bandeira: "🇭🇷", codigo: "hr" },
    { nome: "Tunísia",         bandeira: "🇹🇳", codigo: "tn" },
  ]},
  { letra: "I", times: [
    { nome: "Argentina",       bandeira: "🇦🇷", codigo: "ar" },
    { nome: "Uruguai",         bandeira: "🇺🇾", codigo: "uy" },
    { nome: "Colômbia",        bandeira: "🇨🇴", codigo: "co" },
    { nome: "Panamá",          bandeira: "🇵🇦", codigo: "pa" },
  ]},
  { letra: "J", times: [
    { nome: "Inglaterra",      bandeira: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", codigo: "eng" },
    { nome: "Áustria",         bandeira: "🇦🇹", codigo: "at" },
    { nome: "Japão",           bandeira: "🇯🇵", codigo: "jp" },
    { nome: "Gana",            bandeira: "🇬🇭", codigo: "gh" },
  ]},
  { letra: "K", times: [
    { nome: "Nova Zelândia",   bandeira: "🇳🇿", codigo: "nz" },
    { nome: "Jordânia",        bandeira: "🇯🇴", codigo: "jo" },
    { nome: "Cabo Verde",      bandeira: "🇨🇻", codigo: "cv" },
    { nome: "Iraque",          bandeira: "🇮🇶", codigo: "iq" },
  ]},
  { letra: "L", times: [
    { nome: "Itália",          bandeira: "🇮🇹", codigo: "it" },
    { nome: "Senegal",         bandeira: "🇸🇳", codigo: "sn" },
    { nome: "Honduras",        bandeira: "🇭🇳", codigo: "hn" },
    { nome: "Jamaica",         bandeira: "🇯🇲", codigo: "jm" },
  ]},
];

export const SEDES = {
  estados_unidos: [
    "Atlanta", "Boston", "Dallas", "Houston", "Kansas City", "Los Angeles",
    "Miami", "Nova York/Nova Jersey", "Filadélfia", "São Francisco", "Seattle",
  ],
  canada: ["Toronto", "Vancouver"],
  mexico: ["Cidade do México", "Guadalajara", "Monterrey"],
};

/**
 * Onde assistir os jogos no Brasil.
 * IDs de afiliados via env vars NEXT_PUBLIC_AFFID_*
 */
export const ONDE_ASSISTIR = [
  {
    nome: "Globoplay",
    tipo: "Streaming",
    preco: "Assinatura mensal",
    cobertura: "Todos os jogos com narração da Globo",
    logo: "🟦",
    url_base: "https://globoplay.globo.com/copa-do-mundo-2026/",
    afiliado_env: "NEXT_PUBLIC_AFFID_GLOBOPLAY",
    cor: "#fa233b",
  },
  {
    nome: "SporTV (TV paga)",
    tipo: "TV por assinatura",
    preco: "Plano de TV a cabo",
    cobertura: "Jogos selecionados ao vivo",
    logo: "📺",
    url_base: "https://sportv.globo.com/copa-do-mundo-2026/",
    cor: "#0066cc",
  },
  {
    nome: "TV Globo",
    tipo: "TV aberta",
    preco: "Grátis",
    cobertura: "Jogos do Brasil + jogos selecionados",
    logo: "📡",
    url_base: "https://globo.com/copa-do-mundo-2026/",
    cor: "#cc0000",
  },
  {
    nome: "FIFA+",
    tipo: "Streaming grátis",
    preco: "Grátis com cadastro",
    cobertura: "Highlights, replays e conteúdo oficial FIFA",
    logo: "⚽",
    url_base: "https://www.fifa.com/fifaplus/pt",
    cor: "#326295",
  },
];

export function getGrupoByLetra(letra: string): Grupo | undefined {
  return GRUPOS.find((g) => g.letra.toLowerCase() === letra.toLowerCase());
}

export function getTimeBySlug(slug: string) {
  for (const g of GRUPOS) {
    const t = g.times.find((t) => slugifyTime(t.nome) === slug);
    if (t) return { ...t, grupo: g.letra };
  }
  return null;
}

export function slugifyTime(nome: string): string {
  return nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
