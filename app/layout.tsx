import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT;
const GSC_VERIFICATION = process.env.NEXT_PUBLIC_GSC_VERIFICATION;
const BASE = "https://hojenoticia.com";

export const viewport: Viewport = {
  themeColor: "#dc2626",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: { default: "Hoje Notícia — Resultados de Loterias", template: "%s | Hoje Notícia" },
  description:
    "Resultados das loterias da Caixa: Mega-Sena, Quina, Lotofácil, Lotomania, Timemania, Dia de Sorte e Dupla Sena. Atualizado após cada sorteio.",
  keywords:
    "resultado loteria, mega sena, quina, lotofacil, lotomania, timemania, dia de sorte, dupla sena, loterias caixa",
  metadataBase: new URL(BASE),
  applicationName: "Hoje Notícia",
  authors: [{ name: "Hoje Notícia", url: BASE }],
  publisher: "Hoje Notícia",
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "Hoje Notícia",
    locale: "pt_BR",
    type: "website",
    url: BASE,
  },
  twitter: { card: "summary_large_image", site: "@hojenoticia" },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },
  ...(GSC_VERIFICATION && {
    verification: { google: GSC_VERIFICATION },
  }),
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${BASE}/#organization`,
  name: "Hoje Notícia",
  legalName: "Hoje Notícia",
  url: BASE,
  logo: { "@type": "ImageObject", url: `${BASE}/logo.svg`, width: 220, height: 60 },
  foundingDate: "2025",
  inLanguage: "pt-BR",
  areaServed: { "@type": "Country", name: "Brasil" },
  knowsAbout: [
    "Loterias da Caixa",
    "Mega-Sena",
    "Quina",
    "Lotofácil",
    "Lotomania",
    "Timemania",
    "Dia de Sorte",
    "Dupla Sena",
  ],
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE}/#website`,
  name: "Hoje Notícia",
  url: BASE,
  inLanguage: "pt-BR",
  publisher: { "@id": `${BASE}/#organization` },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <link rel="preconnect" href="https://img.youtube.com" />
        {ADSENSE_CLIENT && (
          <Script
            id="adsense"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          />
        )}
      </head>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        <Header />
        <main style={{ minHeight: "80vh" }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
