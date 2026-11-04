"use client";

import Link from "next/link";
import { GAME_IDS, type Result } from "@/lib/resultados-following.mjs";
import { LOTERIAS_CONFIG } from "@/lib/loterias-config";
import { useResultsFollowing } from "./ResultsFollowingProvider";
import styles from "./ResultsFollowing.module.css";

const dateLabel = (date: string) => date.split("-").reverse().join("/");
const resultURL = (result: Result) => `/loterias/${result.game}/${result.slug}`;

function Numbers({ result, second = false }: { result: Result; second?: boolean }) {
  const numbers = second ? result.secondNumbers : result.numbers;
  const federal = result.game === "federal", columns = result.game === "super-sete";
  return <ol className={`${styles.numbers} ${federal || columns ? styles.ordered : ""}`} aria-label={second ? "Segundo sorteio" : federal ? "Bilhetes por ordem de prêmio" : columns ? "Dígitos por coluna" : "Números sorteados"}>
    {numbers.map((number, index) => <li key={`${index}:${number}`}>
      {(federal || columns) && <small>{federal ? `${index + 1}º prêmio` : `Coluna ${index + 1}`}</small>}
      {federal || columns ? number : number.padStart(2, "0")}
    </li>)}
  </ol>;
}

function ResultDetail({ result }: { result: Result }) {
  return <>
    <p className={styles.muted}>Concurso {result.concurso} · sorteio de {dateLabel(result.date)}</p>
    {result.game === "dupla-sena" && <p>Primeiro sorteio</p>}
    <Numbers result={result} />
    {result.game === "dupla-sena" && (result.secondNumbers.length > 0 ? <><p>Segundo sorteio</p><Numbers result={result} second /></> : <p className={styles.muted}>O segundo sorteio ainda não consta neste registro. Confira a página completa e a fonte oficial.</p>)}
    {result.clovers.length > 0 && <p><strong>Trevos:</strong> {result.clovers.join(" · ")}</p>}
    {result.month && <p><strong>Mês da sorte:</strong> {result.month}</p>}
    {result.team && <p><strong>Time do coração:</strong> {result.team}</p>}
    {result.prizes.length > 0 && <details><summary>Premiação disponível</summary><ul className={styles.prizes}>
      {result.prizes.map(tier => <li key={`${tier.faixa}:${tier.descricao}`}>{result.game === "dupla-sena" ? `Faixa ${tier.faixa} — ` : ""}{tier.descricao}: {tier.ganhadores} {tier.ganhadores === 1 ? "ganhador" : "ganhadores"}{tier.premio > 0 ? `; ${tier.premio.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })} por ganhador` : ""}.</li>)}
    </ul></details>}
    <p style={{ marginTop: ".8rem" }}><Link className={styles.textLink} href={resultURL(result)}>Abrir resultado e conferir os detalhes</Link></p>
  </>;
}

export default function MyResults() {
  const state = useResultsFollowing();
  const selected = state.preferences.favorites;
  return <div className={styles.page}>
    <nav aria-label="Caminho da página" className={styles.links}><Link href="/">Início</Link><Link href="/loterias">Loterias</Link></nav>
    <h1>Meus resultados</h1>
    <p className={styles.intro}>Escolha as modalidades que você acompanha e consulte os últimos resultados em um só lugar. Lotofácil, Quina e Mega-Sena aparecem primeiro; as dez modalidades estão disponíveis. Não é preciso criar conta nem informar números de bilhetes.</p>
    <nav aria-label="Nesta página" className={styles.links}><a href="#modalidades">Escolher modalidades</a><a href="#resultados">Resultados salvos</a><a href="#avisos">Configurar avisos</a><a href="#caixa-de-avisos">Caixa de avisos ({state.inbox.length})</a></nav>
    {!state.ready && <p role="status">Lendo as preferências deste navegador…</p>}
    {!state.storageAvailable && <p className={`${styles.notice} ${styles.warning}`} role="status">O armazenamento deste navegador não está disponível ou ficou cheio. Você pode usar os controles nesta visita, mas as preferências e os avisos podem não permanecer após fechar a página.</p>}

    <section className={styles.panel} id="modalidades" aria-labelledby="modalidades-title">
      <h2 id="modalidades-title">Quais modalidades você quer acompanhar?</h2>
      <div className={styles.options}>{GAME_IDS.map((game, index) => <label key={game} className={`${styles.option} ${index < 3 ? styles.featured : ""}`}>
        <input type="checkbox" checked={selected.includes(game)} disabled={!state.ready} onChange={() => state.toggleFavorite(game)} />
        <span>{LOTERIAS_CONFIG[game].name}</span>
      </label>)}</div>
      <p className={styles.muted} style={{ marginTop: "1rem" }}>Os favoritos ficam apenas neste navegador e neste dispositivo. Eles não acompanham você automaticamente em outros aparelhos.</p>
    </section>

    <section className={styles.panel} id="resultados" aria-labelledby="resultados-title">
      <h2 id="resultados-title">Resultados das suas modalidades</h2>
      <p className={styles.muted}>Até três concursos publicados por modalidade. As datas abaixo são as datas dos sorteios; uma nova consulta ao arquivo não torna um resultado antigo mais recente.</p>
      {selected.length === 0 && <p className={styles.notice}>Marque uma ou mais modalidades acima para começar.</p>}
      {state.loading && <p role="status">Consultando os resultados publicados…</p>}
      {state.error && <p className={`${styles.notice} ${styles.warning}`} role="status">{state.error}</p>}
      <div className={styles.grid}>{selected.map(game => {
        const results = state.feed?.results.filter(result => result.game === game) ?? [];
        const next = state.feed?.schedule.find(draw => draw.game === game);
        return <article key={game} className={styles.card}>
          <h3>{LOTERIAS_CONFIG[game].name}</h3>
          {results[0] ? <ResultDetail result={results[0]} /> : <p className={styles.muted}>{state.feed ? "Nenhum resultado publicado disponível neste arquivo." : "Aguardando a consulta ao arquivo de resultados."}</p>}
          {results.slice(1).map(result => <details key={result.id}><summary>Concurso {result.concurso} · {dateLabel(result.date)}</summary><ResultDetail result={result} /></details>)}
          {next && <p className={styles.notice}>Programação confirmada: <Link className={styles.textLink} href={`/loterias/${game}/${next.slug}`}>concurso {next.concurso}, {dateLabel(next.date)}</Link>. Ainda não é um resultado.</p>}
          <nav className={styles.links} aria-label={`Continuar na ${LOTERIAS_CONFIG[game].name}`}>
            <Link href={`/loterias/${game}#historico`}>Histórico</Link>
            <Link href={`/loterias/${game}/estatisticas`}>Entenda os dados</Link>
            {game === "mega-sena" && <Link href="/loterias/mega-sena/probabilidades">Probabilidades</Link>}
          </nav>
        </article>;
      })}</div>
    </section>

    <section className={styles.panel} id="avisos" aria-labelledby="avisos-title">
      <h2 id="avisos-title">Avisos opcionais, com o site aberto</h2>
      <p className={styles.intro}>Com os avisos ativados, o site verifica os resultados a cada três minutos enquanto a aba estiver visível. Ao ativar os avisos, a primeira consulta cria uma referência silenciosa. Depois, novos concursos e alterações nos números, complementos ou premiação podem gerar um aviso. Não há notificação em segundo plano com o site fechado e não enviamos e-mail ou WhatsApp.</p>
      <div className={styles.actions}>
        <button className={`${styles.button} ${state.preferences.alertsEnabled ? "" : styles.primary}`} type="button" disabled={!state.ready || selected.length === 0} onClick={() => state.setAlerts(!state.preferences.alertsEnabled)}>{state.preferences.alertsEnabled ? "Desativar os avisos" : "Ativar avisos nesta página"}</button>
        {state.preferences.browserEnabled
          ? <button className={styles.button} type="button" onClick={state.disableBrowser}>Desativar notificações do navegador</button>
          : <button className={styles.button} type="button" disabled={!state.ready || selected.length === 0} onClick={() => { void state.enableBrowser(); }}>Autorizar notificações do navegador</button>}
      </div>
      <p className={styles.muted} style={{ marginTop: "1rem" }}>{state.browserStatus}</p>
      <p className={styles.muted}>Avisos nesta página: <strong>{state.preferences.alertsEnabled ? "ativados" : "desativados"}</strong>. A permissão do navegador é opcional; a caixa de avisos funciona sem ela. A conferência definitiva dos bilhetes e prêmios deve ser feita junto à Caixa.</p>
    </section>

    <section className={styles.panel} id="caixa-de-avisos" aria-labelledby="caixa-title">
      <h2 id="caixa-title">Caixa de avisos</h2>
      <p role="status" aria-live="polite" className={styles.muted}>{state.inbox.length ? `${state.inbox.length} aviso${state.inbox.length === 1 ? "" : "s"} guardado${state.inbox.length === 1 ? "" : "s"} neste navegador.` : "Nenhum aviso guardado. Ative os avisos para acompanhar as próximas mudanças."}</p>
      <ul className={styles.inbox}>{state.inbox.map(event => <li key={event.id}><strong>{event.kind === "new" ? "Novo resultado" : "Resultado atualizado"} · {LOTERIAS_CONFIG[event.result.game].name}</strong><br /><Link className={styles.textLink} href={resultURL(event.result)}>Concurso {event.result.concurso} — sorteio de {dateLabel(event.result.date)}</Link>{event.kind === "corrected" && <p className={styles.muted}>O resultado ou a premiação mudou no arquivo do site. Abra o concurso para conferir os dados atuais.</p>}</li>)}</ul>
      <div className={styles.actions}>
        <button className={styles.button} type="button" disabled={!state.ready || !state.inbox.length} onClick={state.clearInbox}>Limpar a caixa de avisos</button>
        <button className={styles.button} type="button" disabled={!state.ready} onClick={state.clearAll}>Apagar favoritos e avisos deste navegador</button>
      </div>
      <p className={styles.muted} style={{ marginTop: "1rem" }}>Até 100 avisos são guardados localmente. Apagar a caixa mantém os favoritos e a referência dos resultados já vistos. Apagar todos os dados também desativa os avisos. <Link className={styles.textLink} href="/privacidade">Como usamos o armazenamento local</Link>.</p>
    </section>
  </div>;
}
