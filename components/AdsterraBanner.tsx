"use client";

import { useEffect, useRef } from "react";

type Size = "300x250" | "728x90" | "320x50";

const ADSTERRA_KEYS: Record<Size, string> = {
  "300x250": "0ec1f5a6949ea2c4c8f6f2ac5aa421b6",
  "728x90":  "2ad36e1f5dffe984bee1ab5c5d1b7326",
  "320x50":  "9ab7186cdfd9f5d107309adc7c14a006",
};

const ADSTERRA_DIMS: Record<Size, { width: number; height: number }> = {
  "300x250": { width: 300, height: 250 },
  "728x90":  { width: 728, height: 90 },
  "320x50":  { width: 320, height: 50 },
};

interface Props {
  size: Size;
  /** "desktop" esconde em mobile (< 768px) — usar para 728x90.
   *  "mobile"  esconde em desktop — usar para 320x50.
   *  "all" não esconde — usar para 300x250. */
  showOn?: "all" | "desktop" | "mobile";
  className?: string;
}

/**
 * Cada banner é renderizado dentro de um iframe isolado para evitar
 * conflito da variável global `atOptions` quando há múltiplos banners
 * na mesma página.
 */
export default function AdsterraBanner({ size, showOn = "all", className }: Props) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const { width, height } = ADSTERRA_DIMS[size];
  const key = ADSTERRA_KEYS[size];

  useEffect(() => {
    if (!iframeRef.current) return;
    const doc = iframeRef.current.contentDocument;
    if (!doc) return;
    doc.open();
    doc.write(`<!doctype html><html><head><style>html,body{margin:0;padding:0;background:transparent;}</style></head><body><script>var atOptions={'key':'${key}','format':'iframe','height':${height},'width':${width},'params':{}};</script><script src="https://www.highperformanceformat.com/${key}/invoke.js"></script></body></html>`);
    doc.close();
  }, [key, width, height]);

  const hideStyle: React.CSSProperties =
    showOn === "desktop"
      ? { width, height, maxWidth: "100%" }
      : showOn === "mobile"
      ? { width, height, maxWidth: "100%" }
      : { width, height, maxWidth: "100%" };

  const wrapperClass =
    showOn === "desktop" ? "ad-desktop-only"
    : showOn === "mobile" ? "ad-mobile-only"
    : "";

  return (
    <div
      className={[wrapperClass, className].filter(Boolean).join(" ")}
      style={{
        margin: "1.5rem auto",
        textAlign: "center",
        display: "block",
      }}
      aria-label="Anúncio"
    >
      <iframe
        ref={iframeRef}
        width={width}
        height={height}
        style={{ border: 0, display: "inline-block", ...hideStyle }}
        scrolling="no"
        title="Anúncio"
      />
    </div>
  );
}
