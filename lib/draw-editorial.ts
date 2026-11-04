import type { DrawMeta } from "./loterias";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const count = new Intl.NumberFormat("pt-BR");

function shortDate(iso: string): string | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const date = new Date(`${iso}T12:00:00Z`);
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === iso ? iso.split("-").reverse().join("/") : null;
}

export function getDrawSearchCopy(draw: DrawMeta, name: string) {
  const date = shortDate(draw.draw_date);
  if (draw.status !== "publicado") {
    const confirmed = draw.schedule_status === "confirmed" && date;
    return {
      title: `Resultado da ${name} ${draw.concurso}: ${confirmed ? `sorteio de ${date}` : "acompanhe o concurso"}`,
      description: confirmed
        ? `Acompanhe o resultado da ${name}, concurso ${draw.concurso}, com data informada de ${date}. Veja a situação do sorteio, a conferência e a premiação quando confirmada.`
        : `Resultado da ${name} ${draw.concurso}: acompanhe a confirmação de data, números e premiação. Consulte as regras de conferência e os resultados anteriores.`,
    };
  }
  const label = draw.loteria === "federal" ? "bilhetes" : draw.loteria === "super-sete" ? "dígitos por coluna" : "números";
  const detail = draw.numeros.length <= 7 ? `${label} ${draw.numeros.join(", ")}` : `${label} sorteados`;
  return {
    title: `Resultado da ${name}: concurso ${draw.concurso}${date ? ` (${date})` : ""}`,
    description: `${name} ${draw.concurso}${date ? `, de ${date}` : ""}: ${detail}. Confira a premiação disponível, como conferir o bilhete e os dados da Caixa.`,
  };
}

export function getDrawResultParagraphs(draw: DrawMeta, name: string): string[] {
  if (draw.status !== "publicado") return [];
  const date = shortDate(draw.draw_date);
  const paragraphs = [`O concurso ${draw.concurso} da ${name}${date ? `, realizado em ${date},` : ""} tem os seguintes resultados registrados na fonte da Caixa.`];
  if (draw.loteria === "federal") {
    paragraphs.push(`Os cinco bilhetes principais, na ordem dos prêmios, são: ${draw.numeros.map((value, i) => `${i + 1}º prêmio: ${value}`).join("; ")}. Os zeros à esquerda fazem parte de cada número e devem ser mantidos na conferência.`);
  } else if (draw.loteria === "super-sete") {
    paragraphs.push(`O resultado por posição é: ${draw.numeros.map((value, i) => `coluna ${i + 1}: ${value}`).join("; ")}. A leitura é feita da primeira à sétima coluna; um algarismo repetido em outra posição não substitui o da coluna correspondente.`);
  } else {
    paragraphs.push(`${draw.numeros_segundo_sorteio?.length ? "No primeiro sorteio, saíram" : "Foram sorteados"} os números ${draw.numeros.join(" – ")}.${draw.numeros_segundo_sorteio?.length ? ` No segundo sorteio do mesmo concurso, os números foram ${draw.numeros_segundo_sorteio.join(" – ")}. Confira cada sorteio separadamente.` : " A lista identifica este concurso e deve ser comparada com os números registrados no comprovante."}`);
  }
  if (draw.trevos_sorteados?.length) paragraphs.push(`Os trevos da +Milionária ${draw.concurso} foram ${draw.trevos_sorteados.join(" e ")}. A conferência combina as seis dezenas e os dois trevos; os trevos não devem ser contados como dezenas adicionais.`);
  if (draw.mes_sorte) paragraphs.push(`O Mês da Sorte informado para o concurso ${draw.concurso} é ${draw.mes_sorte}. Confira esse campo do comprovante separadamente das sete dezenas.`);
  if (draw.time_coracao) paragraphs.push(`O Time do Coração registrado na Timemania ${draw.concurso} é ${draw.time_coracao}. Esse resultado acompanha as sete dezenas e possui campo próprio no bilhete.`);

  const rateio = draw.rateio ?? [];
  if (draw.loteria === "federal") {
    const firstPrize = rateio[0]?.premio || draw.premio_principal;
    if (firstPrize > 0) paragraphs.push(`O valor informado para o primeiro prêmio desta extração é ${money.format(firstPrize)}. Confira na Caixa o detalhamento dos demais prêmios e as regras aplicáveis ao bilhete e às frações adquiridas.`);
  } else {
    const main = rateio.find(row => row.faixa === 1);
    const principal = draw.loteria === "dupla-sena" ? "faixa principal do primeiro sorteio" : "faixa principal";
    if (main) paragraphs.push(main.ganhadores === 0
      ? `O rateio do concurso ${draw.concurso} registra zero apostas ganhadoras na ${principal}${main.descricao ? ` (${main.descricao})` : ""}.${draw.acumulou === true ? " A Caixa informa que o prêmio acumulou." : " Consulte as demais faixas para conferir os prêmios distribuídos."}`
      : `Na ${principal}${main.descricao ? ` (${main.descricao})` : ""}, o concurso ${draw.concurso} teve ${count.format(main.ganhadores)} aposta${main.ganhadores === 1 ? " ganhadora" : "s ganhadoras"}${main.premio > 0 ? `, com ${money.format(main.premio)} por aposta` : "; o valor individual deve ser consultado na fonte"}.`);
    else {
      if (!rateio.length && draw.ganhadores > 0) paragraphs.push(`O registro do concurso informa ${count.format(draw.ganhadores)} aposta${draw.ganhadores === 1 ? " ganhadora" : "s ganhadoras"} na ${principal}${draw.premio_principal > 0 ? `, com ${money.format(draw.premio_principal)} por aposta` : ""}.`);
      paragraphs.push("O rateio detalhado ainda não está disponível neste registro. A ausência dessa informação não significa que não houve ganhadores; confira a divulgação da Caixa antes de concluir a conferência do prêmio.");
    }
    const other = rateio.filter(row => row !== main && row.ganhadores > 0).slice(0, 2);
    if (other.length) paragraphs.push(other.map(row => `Na faixa ${row.descricao || row.faixa}, ${row.ganhadores === 1 ? "foi registrada 1 aposta ganhadora" : `foram registradas ${count.format(row.ganhadores)} apostas ganhadoras`}${row.premio > 0 ? `, com prêmio individual de ${money.format(row.premio)}` : ""}.`).join(" ") + " O quadro de rateio reúne as faixas disponíveis deste concurso.");
  }
  return paragraphs;
}

// Replace only the recognisable boilerplate. Preserve any separately authored MDX sections.
export function removeManagedDrawContent(content: string): string {
  return content.replace(/(^|\r?\n)## ([^\r\n]+)\r?\n([\s\S]*?)(?=\r?\n## |$)/g, (section, _prefix: string, heading: string, body: string) => {
    const text = body.trim();
    if (/^Próximo Sorteio/i.test(heading)) return "\n";
    if (/^Resultado do concurso \d+/.test(heading) && text.includes("O número do concurso e a data identificam o resultado")) return "\n";
    if (/^Situação do concurso \d+/.test(heading) && (/^Esta página acompanha o concurso/.test(text) || /^A Caixa informa o sorteio do concurso/.test(text))) return "\n";
    if (heading === "Como conferir" && text.startsWith("Compare a modalidade, o número do concurso e os")) return "\n";
    if (/^Sobre a /.test(heading) && text.endsWith("Consulte as condições de participação e as faixas de premiação no regulamento oficial.")) return "\n";
    if (/^Como funciona a /.test(heading) && text.endsWith("As faixas de premiação e as condições de participação seguem o regulamento oficial da modalidade.")) return "\n";
    if (heading === "Fonte e correções" && text.startsWith("Referência para conferência:")) return "\n";
    if (heading === "Onde conferir as informações" && text.startsWith("Consulte os [canais oficiais das Loterias Caixa]")) return "\n";
    return section;
  }).trim();
}

export const DRAW_GUIDES: Record<string, { format: string; compare: string; prizes: string }> = {
  "mega-sena": { format: "O resultado da Mega-Sena reúne seis dezenas de um universo de 1 a 60. A lista de números é distinta do valor anunciado para o próximo concurso: o prêmio estimado para um sorteio futuro não é o valor pago neste resultado.", compare: "Compare as seis dezenas sorteadas com a seleção do comprovante. Para entender uma seleção com mais dezenas, consulte também a calculadora de probabilidades; a quantidade de combinações é diferente da quantidade de números sorteados.", prizes: "No rateio da Mega-Sena, observe separadamente as faixas de sena, quina e quadra. O total de apostas ganhadoras e o prêmio por aposta têm significados diferentes: um é a quantidade de bilhetes contemplados, e o outro é o valor individual informado para a faixa." },
  quina: { format: "A Quina sorteia cinco dezenas de um universo de 1 a 80. O nome da modalidade também identifica a faixa de cinco acertos; por isso, a identificação Quina no título não significa que um bilhete tenha acertado todos os números.", compare: "Conte quantas das cinco dezenas do resultado aparecem na seleção registrada no comprovante. A mesma página reúne as faixas de dois, três, quatro e cinco acertos, quando o rateio está disponível.", prizes: "Confira primeiro a coluna de acertos e depois o número de apostas ganhadoras e o prêmio individual. Mesmo quando não há ganhador com cinco acertos, pode haver premiação nas outras faixas do concurso; o quadro de rateio mostra essa diferença." },
  lotofacil: { format: "O resultado da Lotofácil contém 15 dezenas entre 1 e 25. A conferência deve considerar toda a seleção registrada no bilhete, e não apenas os primeiros números exibidos na página.", compare: "Compare as 15 dezenas sorteadas com os números da sua seleção e conte os acertos. As faixas de premiação da modalidade abrangem 11, 12, 13, 14 e 15 acertos; consulte o rateio correspondente a este concurso.", prizes: "O valor de uma faixa não deve ser aplicado automaticamente a outra. Observe a quantidade de acertos, o total de apostas ganhadoras e o prêmio por aposta, pois as três informações aparecem em colunas diferentes do rateio." },
  lotomania: { format: "A Lotomania sorteia 20 números de 00 a 99. O 00 faz parte do universo da modalidade e deve ser tratado como um número válido na conferência, mantendo sua apresentação com dois dígitos.", compare: "Localize cada um dos 20 números sorteados na seleção do seu comprovante. Confira o total final de acertos e a descrição de cada faixa no rateio oficial; a modalidade não deve ser confundida com os formatos de seis ou quinze dezenas de outras loterias.", prizes: "Use a descrição de acertos do rateio para identificar a faixa aplicável ao bilhete. A lista de números, sozinha, não informa o valor de um prêmio nem substitui a validação do comprovante pela Caixa." },
  timemania: { format: "A Timemania apresenta sete dezenas entre 1 e 80 e o Time do Coração. O nome do time é um campo separado do resultado e não deve ser somado à quantidade de dezenas sorteadas.", compare: "Faça duas verificações: compare as sete dezenas com os números registrados e confira o Time do Coração no campo próprio do bilhete. A identificação do time deve acompanhar a edição correta do concurso.", prizes: "Leia a descrição de cada faixa no rateio para distinguir a premiação das dezenas e a informação relativa ao Time do Coração. O prêmio anunciado para o próximo concurso é uma estimativa separada dos valores efetivamente informados neste sorteio." },
  diadesorte: { format: "No Dia de Sorte, o resultado apresenta sete dezenas entre 1 e 31 e um Mês da Sorte. As dezenas e o mês têm campos próprios no comprovante, ainda que ambos façam parte do mesmo concurso.", compare: "Conte os acertos das sete dezenas e, em seguida, confira o mês por seu nome. Não transforme o Mês da Sorte em uma oitava dezena: use a descrição das faixas da Caixa para interpretar cada parte do resultado.", prizes: "O quadro de rateio informa as faixas disponíveis e o valor individual de cada uma. A estimativa para o próximo concurso e a premiação apurada para o sorteio já realizado devem ser lidas separadamente." },
  "dupla-sena": { format: "A Dupla Sena tem dois sorteios no mesmo concurso. Cada um apresenta seis dezenas entre 1 e 50; reunir as duas listas como se fossem um único resultado de 12 números altera a leitura do bilhete.", compare: "Compare sua seleção primeiro com as seis dezenas do primeiro sorteio e depois com as seis do segundo. Mantenha as contagens separadas e consulte no rateio a descrição correspondente a cada sorteio.", prizes: "A existência de dois sorteios exige atenção à identificação da faixa. Um número que aparece nas duas listas não deve ser contado duas vezes dentro de uma única comparação; cada resultado é conferido por conta própria." },
  maismilionaria: { format: "A +Milionária combina seis dezenas entre 1 e 50 e dois trevos entre 1 e 6. Mesmo quando um trevo tem o mesmo algarismo de uma dezena, ele pertence a outro conjunto do resultado.", compare: "Confira as seis dezenas e os dois trevos nos campos correspondentes do comprovante. A quantidade de dezenas e a quantidade de trevos acertados devem ser comparadas com a descrição da faixa no rateio oficial.", prizes: "A leitura da premiação depende da combinação de acertos indicada na faixa. Não use apenas a contagem das dezenas para concluir um prêmio: os trevos integram o formato da modalidade e precisam ser conferidos separadamente." },
  "super-sete": { format: "O Super Sete apresenta sete colunas, cada uma com um algarismo entre 0 e 9. A posição é parte do resultado, e o mesmo algarismo pode aparecer em mais de uma coluna.", compare: "Leia o resultado da coluna 1 à coluna 7 e compare cada dígito somente com a mesma posição do comprovante. Ordenar os algarismos ou retirar repetições modifica o resultado e impede uma conferência correta.", prizes: "Use as faixas disponíveis no rateio e confirme os acertos por coluna. Uma análise que mistura todos os algarismos em uma única lista não substitui a conferência por posição; o histórico mantém esse formato em cada concurso." },
  federal: { format: "A Loteria Federal apresenta bilhetes associados aos cinco prêmios principais da extração. A ordem dos bilhetes é a ordem dos prêmios: o primeiro número não é simplesmente o menor número da lista.", compare: "Confira o número completo do bilhete, inclusive os zeros à esquerda, e a posição do prêmio. Consulte também na Caixa as condições de premiação do bilhete, suas frações e as demais modalidades de contemplação previstas para a extração.", prizes: "Os valores informados por prêmio devem ser interpretados conforme a fração do bilhete adquirida e o regulamento oficial. A sequência dos cinco bilhetes deve permanecer associada ao primeiro, segundo, terceiro, quarto e quinto prêmios." },
};
