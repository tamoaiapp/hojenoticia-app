"use client";

import { useEffect, useRef } from "react";

const NATIVE_KEY = "2109e405159d5c45e474e9558c57bed0";

/**
 * Native banner Adsterra — anúncio que parece conteúdo, encaixa bem
 * entre listagens / no fim do artigo.
 */
export default function AdsterraNative() {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const container = wrapper.querySelector<HTMLDivElement>(`#container-${NATIVE_KEY}`);
    const script = document.createElement("script");
    script.async = true;
    script.dataset.cfasync = "false";
    script.src = `https://bauval.org/21/${NATIVE_KEY}`;
    wrapper.prepend(script);
    return () => {
      script.remove();
      container?.replaceChildren();
    };
  }, []);

  return (
    <div ref={wrapperRef} style={{ margin: "1.5rem auto", textAlign: "center" }} aria-label="Anúncio">
      <div id={`container-${NATIVE_KEY}`} />
    </div>
  );
}
