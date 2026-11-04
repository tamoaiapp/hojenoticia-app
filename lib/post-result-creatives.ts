export const POST_RESULT_CREATIVES = [
  { id: "01", title: "10 anos apostando: a chance do próximo bilhete muda?", cue: "10 anos. E a próxima chance?" },
  { id: "02", title: "6 ou 7 dezenas: você imagina o tamanho da diferença?", cue: "Uma dezena a mais. O que muda?" },
  { id: "03", title: "O mesmo jogo por anos: sorte acumulada ou conta igual?", cue: "A sorte fica acumulada?" },
  { id: "04", title: "Faltou pouco? Veja a distância entre quadra, quina e sena.", cue: "Foi por pouco mesmo?" },
  { id: "05", title: "Seu número da sorte muda alguma coisa nesta conta?", cue: "Favorito ou qualquer outro?" },
  { id: "06", title: "Você sabe o que 1 em 50 milhões significa de verdade?", cue: "O tamanho da chance" },
  { id: "07", title: "Trocar os números ou repetir? Veja o que muda na chance.", cue: "Trocar ou repetir?" },
  { id: "08", title: "Uma sequência de 1 a 6 parece impossível. Será?", cue: "1, 2, 3, 4, 5, 6. E se sair?" },
  { id: "09", title: "O prêmio acumulou. A chance de acertar também muda?", cue: "Prêmio maior, chance maior?" },
  { id: "10", title: "Marcando 7 números, você cobre quantas combinações?", cue: "7 números escondem uma conta" },
  { id: "11", title: "Quadra, quina ou sena: qual é a diferença nas chances?", cue: "Cada acerto tem sua conta" },
  { id: "12", title: "Um número está “atrasado”. Ele tem mais chance agora?", cue: "Está devendo sair?" },
  { id: "13", title: "Mais dezenas: quanto a probabilidade realmente muda?", cue: "Veja 6, 7, 8 e 10 dezenas" },
  { id: "14", title: "50.063.860 combinações. Onde entra o seu jogo?", cue: "Seu jogo nessa conta" },
  { id: "15", title: "Existe um prazo para acertar a sena? Veja o que a conta diz.", cue: "A espera muda a chance?" },
  { id: "16", title: "Mais números no bilhete: uma aposta ou várias combinações?", cue: "O que há por trás do bilhete?" },
  { id: "17", title: "Acertar 4 ou 6: você já comparou essas duas chances?", cue: "Da quadra à sena" },
  { id: "18", title: "Você já comparou as chances do seu jeito de jogar?", cue: "Faça a conta do seu jogo" },
  { id: "19", title: "Números “quentes”: isso muda as chances da Mega-Sena?", cue: "Frequência é previsão?" },
  { id: "20", title: "Antes de chamar de sorte, olhe para esta conta.", cue: "A conta por trás do bilhete" },
] as const;

export const POST_RESULT_STATISTICS_COPY = [
  { title: "Aposta há anos? Já olhou seus números deste jeito?", cue: "Já olhou por este lado?" },
  { title: "Esses números saíram mais. Os seus estão na lista?", cue: "Seu número está aqui?" },
  { title: "Seu número da sorte está entre os mais sorteados?", cue: "Confira a frequência dele" },
  { title: "Há quantos concursos seu número não aparece?", cue: "Você sabe há quanto tempo?" },
  { title: "Algum número sumiu dos últimos resultados? Veja a lista.", cue: "Há quanto tempo não sai?" },
  { title: "O resultado passou. Estes detalhes continuam nos números.", cue: "Olhe uma segunda vez" },
  { title: "Mais sorteado ou mais “atrasado”: onde está seu favorito?", cue: "Onde está seu favorito?" },
  { title: "Você lembra dos números que mais se repetiram?", cue: "Será que você lembra?" },
  { title: "O histórico confirma sua intuição sobre esses números?", cue: "Intuição ou frequência?" },
  { title: "Pares ou ímpares: qual grupo apareceu mais na amostra?", cue: "Compare os dois lados" },
  { title: "Aposta nos mesmos números? Veja como eles aparecem aqui.", cue: "Os mesmos de sempre?" },
  { title: "Só conferiu os acertos? Há mais para ver nesse histórico.", cue: "Além do resultado" },
  { title: "Qual número está há mais concursos sem aparecer na amostra?", cue: "Há quantos concursos não sai?" },
  { title: "Seu favorito está entre os números mais sorteados?", cue: "Será que ele está na lista?" },
  { title: "Você sabe a diferença entre frequência e previsão?", cue: "Este detalhe faz diferença" },
  { title: "Um mesmo número, vários concursos. Quantas vezes ele apareceu?", cue: "Veja a contagem" },
  { title: "Quais números mais apareceram nos concursos publicados?", cue: "O topo da lista" },
  { title: "Tem um número que você sempre procura? Veja a frequência dele.", cue: "Procure seu favorito" },
  { title: "Seu palpite combina com os números mais frequentes da amostra?", cue: "Será que estão na lista?" },
  { title: "O que muda quando você olha vários concursos lado a lado?", cue: "Vá além deste concurso" },
] as const;

export const POST_RESULT_HISTORY_COPY = [
  { title: "Conferiu um concurso. E os anteriores, você já viu?", cue: "O que saiu antes?" },
  { title: "Seu bilhete lembra algum resultado anterior? Confira no arquivo.", cue: "Já viu esses números antes?" },
  { title: "Qual resultado veio antes deste? Volte no histórico.", cue: "Volte um concurso" },
  { title: "Você lembra do resultado anterior? Confira no arquivo.", cue: "Será que você lembra?" },
  { title: "Um resultado sozinho conta só parte da história.", cue: "Veja os outros concursos" },
  { title: "Depois deste resultado, qual concurso você quer comparar?", cue: "Compare os resultados" },
  { title: "Já voltou aos concursos anteriores para conferir os números?", cue: "Olhe de novo" },
  { title: "Quer comparar com o sorteio anterior? O histórico está aqui.", cue: "E no concurso anterior?" },
] as const;

export function initialCreativeIndex(loteria: string, concurso: number): number {
  return (Array.from(loteria).reduce((sum, letter) => sum + letter.charCodeAt(0), 0) + concurso) % POST_RESULT_CREATIVES.length;
}
