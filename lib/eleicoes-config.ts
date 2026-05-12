/**
 * Configuração das Eleições Gerais Brasil 2026
 * 1º turno: 04/10/2026 · 2º turno: 25/10/2026
 *
 * Pré-candidatos a presidente: fonte JOTA/CNN Brasil maio/2026.
 * Registro oficial de candidaturas: até 15/08/2026 (TSE).
 */

export const ELEICAO_INFO = {
  ano: 2026,
  primeiro_turno: "2026-10-04",
  segundo_turno: "2026-10-25",
  posse_presidente: "2027-01-01",
  prazo_registro: "2026-08-15",
  prazo_filiacao: "2026-04-04",
  inicio_campanha: "2026-08-16",
};

export const CARGOS = [
  { slug: "presidente",          nome: "Presidente da República", escopo: "nacional" },
  { slug: "governador",          nome: "Governador",               escopo: "estadual" },
  { slug: "senador",             nome: "Senador",                  escopo: "estadual" },
  { slug: "deputado-federal",    nome: "Deputado Federal",         escopo: "estadual" },
  { slug: "deputado-estadual",   nome: "Deputado Estadual",        escopo: "estadual" },
] as const;

export const UFS = [
  { sigla: "AC", nome: "Acre",                regiao: "Norte" },
  { sigla: "AL", nome: "Alagoas",             regiao: "Nordeste" },
  { sigla: "AP", nome: "Amapá",               regiao: "Norte" },
  { sigla: "AM", nome: "Amazonas",            regiao: "Norte" },
  { sigla: "BA", nome: "Bahia",               regiao: "Nordeste" },
  { sigla: "CE", nome: "Ceará",               regiao: "Nordeste" },
  { sigla: "DF", nome: "Distrito Federal",    regiao: "Centro-Oeste" },
  { sigla: "ES", nome: "Espírito Santo",      regiao: "Sudeste" },
  { sigla: "GO", nome: "Goiás",               regiao: "Centro-Oeste" },
  { sigla: "MA", nome: "Maranhão",            regiao: "Nordeste" },
  { sigla: "MT", nome: "Mato Grosso",         regiao: "Centro-Oeste" },
  { sigla: "MS", nome: "Mato Grosso do Sul",  regiao: "Centro-Oeste" },
  { sigla: "MG", nome: "Minas Gerais",        regiao: "Sudeste" },
  { sigla: "PA", nome: "Pará",                regiao: "Norte" },
  { sigla: "PB", nome: "Paraíba",             regiao: "Nordeste" },
  { sigla: "PR", nome: "Paraná",              regiao: "Sul" },
  { sigla: "PE", nome: "Pernambuco",          regiao: "Nordeste" },
  { sigla: "PI", nome: "Piauí",               regiao: "Nordeste" },
  { sigla: "RJ", nome: "Rio de Janeiro",      regiao: "Sudeste" },
  { sigla: "RN", nome: "Rio Grande do Norte", regiao: "Nordeste" },
  { sigla: "RS", nome: "Rio Grande do Sul",   regiao: "Sul" },
  { sigla: "RO", nome: "Rondônia",            regiao: "Norte" },
  { sigla: "RR", nome: "Roraima",             regiao: "Norte" },
  { sigla: "SC", nome: "Santa Catarina",      regiao: "Sul" },
  { sigla: "SP", nome: "São Paulo",           regiao: "Sudeste" },
  { sigla: "SE", nome: "Sergipe",             regiao: "Nordeste" },
  { sigla: "TO", nome: "Tocantins",           regiao: "Norte" },
] as const;

export type CandidatoPresidente = {
  slug: string;
  nome: string;
  partido: string;
  sigla_partido: string;
  posicionamento?: "esquerda" | "centro-esquerda" | "centro" | "centro-direita" | "direita";
  estado_origem?: string;
  cargo_atual?: string;
  status: "pre-candidato" | "candidato-confirmado" | "desistente";
  data_anuncio?: string;
  fotos_url?: string;
  bio_curta?: string;
};

export function getUfBySlug(sigla: string) {
  return UFS.find((u) => u.sigla.toLowerCase() === sigla.toLowerCase());
}
