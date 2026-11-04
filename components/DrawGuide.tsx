import Link from "next/link";
import type { DrawMeta } from "@/lib/loterias";
import { LOTERIAS_CONFIG, formatDate } from "@/lib/loterias-config";
import { DRAW_GUIDES, getDrawResultParagraphs } from "@/lib/draw-editorial";

export default function DrawGuide({ draw, latest, scheduleConfirmed }: { draw: DrawMeta; latest?: DrawMeta; scheduleConfirmed: boolean }) {
  const cfg = LOTERIAS_CONFIG[draw.loteria];
  const guide = DRAW_GUIDES[draw.loteria];
  const published = draw.status === "publicado";
  const label = `${cfg.name} ${draw.concurso}`;
  const numberLabel = draw.loteria === "federal" ? "bilhetes" : draw.loteria === "super-sete" ? "dígitos de cada coluna" : "números";
  const facts = getDrawResultParagraphs(draw, cfg.name);
  const main = draw.rateio?.find(row => row.faixa === 1);
  const principal = draw.loteria === "dupla-sena" ? "faixa principal do primeiro sorteio" : "faixa principal";
  return (
    <div className="article-body draw-guide">
      <section aria-labelledby="resumo-concurso-title">
        <h2 id="resumo-concurso-title">{published ? `Resumo do resultado da ${label}` : `O que acompanhar no concurso ${draw.concurso} da ${cfg.name}`}</h2>
        {published ? facts.map(paragraph => <p key={paragraph}>{paragraph}</p>) : <>
          <p>Esta página acompanha o resultado da {cfg.name} no concurso {draw.concurso}. Os {numberLabel}, as faixas de premiação e os ganhadores serão apresentados quando houver dados confirmados para este concurso. Uma lista vazia neste momento significa que o resultado ainda não foi confirmado neste registro.</p>
          <p>{scheduleConfirmed ? `A data informada para o concurso ${draw.concurso} é ${formatDate(draw.draw_date)}. A programação identifica o sorteio; ela não confirma que os números ou o rateio já foram divulgados.` : `A data do concurso ${draw.concurso} e a estimativa de prêmio ainda dependem de confirmação da Caixa. O número do concurso identifica esta página, mas não permite deduzir um calendário ou um valor de premiação.`}</p>
          {latest && <p>O resultado mais recente publicado neste arquivo é o <Link href={`/loterias/${draw.loteria}/${latest.slug}`}>concurso {latest.concurso} da {cfg.name}, de {formatDate(latest.draw_date)}</Link>. Ele é um sorteio diferente do concurso {draw.concurso}; os números e prêmios anteriores não devem ser usados como resultado desta página.</p>}
          <p>Para acompanhar a divulgação, verifique a modalidade, o número {draw.concurso} e a situação do resultado no <a href={cfg.sourceUrl} target="_blank" rel="noopener noreferrer">portal oficial da {cfg.name} na Caixa</a>. A confirmação dos números pode ocorrer antes da publicação do rateio completo; cada informação precisa ser conferida no registro do próprio concurso.</p>
        </>}
      </section>

      <section aria-labelledby="conferencia-title">
        <h2 id="conferencia-title">Como conferir o bilhete da {label}</h2>
        <p>{guide.compare}</p>
        <ol>
          <li>Confirme no comprovante a modalidade {cfg.name} e o número do concurso {draw.concurso}{published ? `, de ${formatDate(draw.draw_date)}` : ""}.</li>
          <li>{published ? `Compare os ${numberLabel} apresentados no resultado com os campos correspondentes do bilhete.` : `Aguarde os ${numberLabel} deste concurso antes de fazer a contagem de acertos. Um resultado anterior não substitui o sorteio aguardado.`}</li>
          <li>Localize a descrição da faixa e diferencie a quantidade de apostas ganhadoras do valor do prêmio por aposta.</li>
          <li>Conserve o comprovante e valide qualquer premiação nos canais oficiais da Caixa, conforme as condições aplicáveis ao bilhete.</li>
        </ol>
      </section>

      <section aria-labelledby="formato-title">
        <h2 id="formato-title">Como interpretar o resultado da {cfg.name}</h2>
        <p>{guide.format}</p>
        <p>{guide.prizes}</p>
        <p>O concurso {draw.concurso} possui registro próprio no <Link href={`/loterias/${draw.loteria}#historico`}>histórico da {cfg.name}</Link>. Use o número do concurso e a data confirmada para localizar outros resultados, evitando confundir extrações de datas diferentes.</p>
      </section>

      <section aria-labelledby="duvidas-concurso-title">
        <h2 id="duvidas-concurso-title">Perguntas sobre o concurso {draw.concurso} da {cfg.name}</h2>
        <h3>{published ? `Onde consultar os ${numberLabel} da ${label}?` : `O resultado da ${label} já está disponível?`}</h3>
        <p>{published ? `Os ${numberLabel} confirmados estão no quadro de resultado e no resumo deste concurso. Para validar o bilhete, confira também o registro oficial indicado na seção de fontes.` : `Ainda não há resultado confirmado para o concurso ${draw.concurso} nesta página. Consulte a fonte oficial para verificar o estágio da divulgação; um calendário confirmado não equivale a números sorteados.`}</p>
        <h3>{draw.loteria === "federal" ? `Como identificar o primeiro prêmio da Federal ${draw.concurso}?` : `A ${label} teve ganhador na ${principal}?`}</h3>
        <p>{draw.loteria === "federal" ? published && draw.numeros[0] ? `O bilhete registrado na primeira posição é ${draw.numeros[0]}. A ordem identifica o prêmio; confira o número completo e as condições do bilhete na Caixa.` : "A identificação do primeiro prêmio depende da publicação dos bilhetes desta extração, preservando a ordem oficial." : !published || !main ? "A informação depende do rateio confirmado deste concurso. A ausência de uma tabela ou de dados preenchidos não permite concluir que não houve ganhadores." : main.ganhadores === 0 ? `O rateio informado para a ${label} registra zero apostas ganhadoras na ${principal}. As demais faixas devem ser conferidas no quadro de premiação.` : `A ${principal} da ${label} registra ${main.ganhadores.toLocaleString("pt-BR")} aposta${main.ganhadores === 1 ? " ganhadora" : "s ganhadoras"}. Confira no rateio o valor individual informado para essa faixa.`}</p>
        <h3>Onde acompanhar outros concursos da {cfg.name}?</h3>
        <p>Consulte o <Link href={`/loterias/${draw.loteria}#historico`}>histórico de resultados da {cfg.name}</Link> e os links de concurso anterior e seguinte no fim desta página. {draw.loteria === "federal" || draw.loteria === "super-sete" ? "A comparação deve preservar a ordem dos bilhetes ou das colunas, conforme a modalidade." : <>As <Link href={`/loterias/${draw.loteria}/estatisticas`}>estatísticas da {cfg.name}</Link> descrevem os concursos publicados no arquivo e não preveem o próximo resultado.</>}</p>
      </section>
    </div>
  );
}
