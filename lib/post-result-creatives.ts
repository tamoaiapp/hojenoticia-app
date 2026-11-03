export const POST_RESULT_CREATIVES = [
  { id: "01", title: "Conferiu os números? Agora entenda suas chances.", cue: "Uma chance em quantas?" },
  { id: "02", title: "O que significa uma chance em 50 milhões?", cue: "Veja a conta" },
  { id: "03", title: "Números atrasados ajudam? Entenda o que o histórico mostra.", cue: "Histórico não é previsão" },
  { id: "04", title: "Quadra, quina ou sena: compare as probabilidades.", cue: "Compare as chances" },
  { id: "05", title: "Antes do próximo concurso, entenda a probabilidade.", cue: "Entenda as combinações" },
  { id: "06", title: "A conta que vale entender depois do resultado.", cue: "Além das dezenas" },
  { id: "07", title: "O que muda ao marcar mais números? Veja a comparação.", cue: "De 6 a 20 números" },
  { id: "08", title: "Seu número favorito muda a chance? Entenda.", cue: "Sorteios independentes" },
  { id: "09", title: "Resultado conferido. Agora, veja as probabilidades.", cue: "Continue sua consulta" },
  { id: "10", title: "Quantas combinações existem na Mega-Sena?", cue: "A matemática do sorteio" },
  { id: "11", title: "As chances da sena, sem fórmulas complicadas.", cue: "Uma explicação direta" },
  { id: "12", title: "O resultado anterior muda o próximo? Entenda a conta.", cue: "Cada sorteio é novo" },
  { id: "13", title: "Qual é a diferença entre marcar 6 ou 7 números?", cue: "Compare lado a lado" },
  { id: "14", title: "Da quadra à sena: veja a diferença nas chances.", cue: "Conheça cada faixa" },
  { id: "15", title: "Por que resultados anteriores não preveem o próximo?", cue: "Entenda o histórico" },
  { id: "16", title: "Combinações da Mega-Sena: o que os números significam.", cue: "Entenda sua consulta" },
  { id: "17", title: "Já olhou o rateio? Agora compare as probabilidades.", cue: "Depois do resultado" },
  { id: "18", title: "Uma em 50.063.860: entenda essa probabilidade.", cue: "A chance da aposta simples" },
  { id: "19", title: "Marcar mais dezenas muda a probabilidade? Compare.", cue: "Explore a tabela" },
  { id: "20", title: "Quer entender o resultado além das dezenas?", cue: "Veja as chances reais" },
] as const;

export function initialCreativeIndex(loteria: string, concurso: number): number {
  return (Array.from(loteria).reduce((sum, letter) => sum + letter.charCodeAt(0), 0) + concurso) % POST_RESULT_CREATIVES.length;
}
