"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";
import { initialCreativeIndex, POST_RESULT_CREATIVES } from "@/lib/post-result-creatives";

const SMARTLINK = {
  unitId: "32081506",
  url: "https://auctionr.org/4/a808bcdcfd9eb0f9335210c0c9d7b63a",
};

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
  const destination = "/loterias/mega-sena/probabilidades";

  function handleImageClick(event: MouseEvent<HTMLAnchorElement>) {
    if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;

    // Only the image opens advertising. Native navigation to the calculator
    // remains available even when a browser blocks or rejects the new tab.
    try {
      window.open(SMARTLINK.url, "_blank", "noopener,noreferrer");
    } catch {
      // Keep the image's normal href usable if opening a tab is unavailable.
    }
    window.dispatchEvent(new CustomEvent("hoje:post-result-click", { detail: { creative: creative.id, loteria, concurso, destination, adUnitId: SMARTLINK.unitId } }));
  }

  return (
    <aside ref={card} className="post-result-cta" aria-labelledby="post-result-title" data-creative-id={creative.id}>
      <figure className="post-result-visual">
        <a className="post-result-image-link" href={destination} onClick={handleImageClick} data-ad-unit-id={SMARTLINK.unitId} aria-label={`${creative.title} Abre publicidade em outra aba e mostra as probabilidades da Mega-Sena nesta aba.`}>
          <Image src={`/images/post-result/creative-${creative.id}.webp`} alt="Pessoa adulta segurando um bilhete de loteria em uma cena ilustrativa" width={600} height={400} sizes="(max-width: 640px) 100vw, 380px" />
          <div className="post-result-image-copy" aria-hidden="true">{creative.cue}</div>
        </a>
        <figcaption>Publicidade ao clicar · Imagem ilustrativa gerada por IA</figcaption>
      </figure>
      <div className="post-result-copy">
        <p className="post-result-kicker">Mega-Sena · Entenda as chances</p>
        <h2 id="post-result-title">{creative.title}</h2>
        <p>Compare as chances de sena, quina e quadra e veja como a quantidade de dezenas entra nessa conta.</p>
        <p className="post-result-image-hint">Clique na imagem para abrir publicidade em outra aba e ver as probabilidades aqui.</p>
        <p className="post-result-note">Os sorteios são independentes. O histórico não prevê o próximo resultado.</p>
      </div>
    </aside>
  );
}
