"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { initialCreativeIndex, POST_RESULT_CREATIVES, POST_RESULT_HISTORY_COPY, POST_RESULT_STATISTICS_COPY } from "@/lib/post-result-creatives";
import { POST_RESULT_AD, postResultAdUrl } from "@/lib/post-result-ad";
import { LOTERIAS_CONFIG } from "@/lib/loterias-config";

export default function PostResultCTA({ loteria, concurso }: { loteria: string; concurso: number }) {
  const [index, setIndex] = useState(() => initialCreativeIndex(loteria, concurso));
  const card = useRef<HTMLElement>(null);

  useEffect(() => {
    function chooseCreative() {
      const random = new Uint32Array(1);
      window.crypto.getRandomValues(random);
      setIndex(random[0] % POST_RESULT_CREATIVES.length);
    }
    if (!("IntersectionObserver" in window)) {
      const frame = requestAnimationFrame(chooseCreative);
      return () => cancelAnimationFrame(frame);
    }
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      chooseCreative();
      observer.disconnect();
    }, { rootMargin: "600px" });
    if (card.current) observer.observe(card.current);
    return () => observer.disconnect();
  }, [loteria, concurso]);

  const creative = POST_RESULT_CREATIVES[index];
  const megaSena = loteria === "mega-sena";
  const historyOnly = loteria === "federal" || loteria === "super-sete";
  const gameName = LOTERIAS_CONFIG[loteria]?.name ?? "loteria";
  const destination = megaSena ? "/loterias/mega-sena/probabilidades" : historyOnly ? `/loterias/${loteria}#historico` : `/loterias/${loteria}/estatisticas`;
  const copy = megaSena ? creative : historyOnly ? POST_RESULT_HISTORY_COPY[index % POST_RESULT_HISTORY_COPY.length] : POST_RESULT_STATISTICS_COPY[index];
  const title = copy.title;
  const action = megaSena ? "ver as probabilidades" : historyOnly ? "consultar o histórico" : "explorar as estatísticas";

  function handleImageClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

    // Only the image opens advertising. Native navigation to the calculator
    // remains available even when a browser blocks or rejects the new tab.
    if (POST_RESULT_AD.enabled) {
      try {
        window.open(postResultAdUrl(loteria, creative.id), "_blank", "noopener,noreferrer");
      } catch {
        // Keep the image's normal href usable if opening a tab is unavailable.
      }
    }
    window.dispatchEvent(new CustomEvent("hoje:post-result-click", { detail: { creative: creative.id, loteria, concurso, destination, adUnitId: POST_RESULT_AD.unitId, advertisingEnabled: POST_RESULT_AD.enabled } }));
  }

  return (
    <aside ref={card} className="post-result-cta" aria-labelledby="post-result-title" data-creative-id={creative.id} data-ad-enabled={POST_RESULT_AD.enabled}>
      <figure className="post-result-visual">
        <a className="post-result-image-link" href={destination} onClick={handleImageClick} data-ad-unit-id={POST_RESULT_AD.unitId} aria-label={`${title} Clique para ${action}.${POST_RESULT_AD.enabled ? " Também abre publicidade em outra aba." : ""}`}>
          <Image src={`/images/post-result/creative-${creative.id}.webp`} alt="Pessoa adulta segurando um bilhete de loteria em uma cena ilustrativa" width={600} height={400} sizes="(max-width: 640px) 100vw, 380px" />
          <div className="post-result-image-copy" aria-hidden="true"><span>{copy.cue}</span><span className="post-result-photo-action">{megaSena ? "Quero entender essa conta" : historyOnly ? "Quero comparar os resultados" : "Quero ver a lista"} <span aria-hidden="true">↗</span></span></div>
        </a>
        <figcaption>{POST_RESULT_AD.enabled && "Publicidade ao clicar · "}Imagem ilustrativa gerada por IA</figcaption>
      </figure>
      <div className="post-result-copy">
        <p className="post-result-kicker">{gameName} · Olhe mais de perto</p>
        <h2 id="post-result-title">{title}</h2>
        <p>{megaSena ? "Anos repetindo o mesmo jogo, uma dezena a mais ou prêmio acumulado: descubra o que entra na conta das chances de sena, quina e quadra." : historyOnly ? loteria === "federal" ? "Volte aos concursos publicados da Federal e compare os bilhetes premiados, prêmio por prêmio." : "Volte aos concursos publicados do Super Sete e compare os dígitos, coluna por coluna." : `Procure seu favorito entre os números mais sorteados e os maiores intervalos sem aparecer na amostra da ${gameName}. A frequência dele é a que você imaginava?`}</p>
        <p className="post-result-image-hint">Clique na foto e {megaSena ? "descubra o que muda nas chances do seu jogo." : historyOnly ? "volte aos resultados anteriores." : "descubra quais números estão no topo da lista."}{POST_RESULT_AD.enabled && " O clique também abre publicidade em outra aba."}</p>
        <p className="post-result-note">Os sorteios são independentes. O histórico não prevê o próximo resultado.</p>
      </div>
    </aside>
  );
}
