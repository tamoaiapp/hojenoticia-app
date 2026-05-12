"use client";

import Script from "next/script";

const NATIVE_KEY = "2109e405159d5c45e474e9558c57bed0";

/**
 * Native banner Adsterra — anúncio que parece conteúdo, encaixa bem
 * entre listagens / no fim do artigo.
 */
export default function AdsterraNative() {
  return (
    <div style={{ margin: "1.5rem auto", textAlign: "center" }} aria-label="Anúncio">
      <Script
        id="adsterra-native-loader"
        strategy="afterInteractive"
        async
        data-cfasync="false"
        src={`https://pl29428023.profitablecpmratenetwork.com/${NATIVE_KEY}/invoke.js`}
      />
      <div id={`container-${NATIVE_KEY}`} />
    </div>
  );
}
