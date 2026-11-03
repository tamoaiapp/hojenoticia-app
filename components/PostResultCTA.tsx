"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { initialCreativeIndex, POST_RESULT_CREATIVES } from "@/lib/post-result-creatives";
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
  const gameName = LOTERIAS_CONFIG[loteria]?.name ?? "loteria";
  const destination = megaSena ? "/loterias/mega-sena/probabilidades" : `/loterias/${loteria}/estatisticas`;
  const title = megaSena ? creative.title : `Conferiu os números? Explore o histórico da ${gameName}.`;
  const action = megaSena ? "ver as probabilidades" : "explorar as estatísticas";

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
          <div className="post-result-image-copy" aria-hidden="true"><span>{megaSena ? creative.cue : "Conheça o histórico"}</span><span className="post-result-photo-action">{megaSena ? "Entenda as chances" : "Explore os resultados"} <span aria-hidden="true">↗</span></span></div>
        </a>
        <figcaption>{POST_RESULT_AD.enabled && "Publicidade ao clicar · "}Imagem ilustrativa gerada por IA</figcaption>
      </figure>
      <div className="post-result-copy">
        <p className="post-result-kicker">{gameName} · Continue sua consulta</p>
        <h2 id="post-result-title">{title}</h2>
        <p>{megaSena ? "Compare as chances de sena, quina e quadra e veja como a quantidade de dezenas entra nessa conta." : `Veja as frequências dos números e navegue pelos resultados publicados da ${gameName}.`}</p>
        <p className="post-result-image-hint">Clique na foto para {action}.{POST_RESULT_AD.enabled && " O clique também abre publicidade em outra aba."}</p>
        <p className="post-result-note">Os sorteios são independentes. O histórico não prevê o próximo resultado.</p>
      </div>
    </aside>
  );
}
