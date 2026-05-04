import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: { default: "Hoje Notícia — Futebol, Política, Fofoca e Mais", template: "%s | Hoje Notícia" },
  description: "Fique por dentro das principais notícias do Brasil: futebol, política, fofoca, saúde, finanças e muito mais.",
  keywords: "noticias brasil, futebol, politica, fofoca, saude, financas, hoje",
  metadataBase: new URL("https://hojenoticia.com"),
  openGraph: { siteName: "Hoje Notícia", locale: "pt_BR", type: "website" },
  twitter: { card: "summary_large_image", site: "@hojenoticia" },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 } },
  other: {
    "google-site-verification": "",  // adicionar código do Search Console aqui
  },
};

const organizationLd = {
  "@context": "https://schema.org",
  "@type": "NewsMediaOrganization",
  "@id": "https://hojenoticia.com/#organization",
  name: "Hoje Notícia",
  url: "https://hojenoticia.com",
  logo: { "@type": "ImageObject", url: "https://hojenoticia.com/logo.svg", width: 220, height: 60 },
  publishingPrinciples: "https://hojenoticia.com/quem-somos",
  masthead: "https://hojenoticia.com/quem-somos",
  foundingDate: "2025",
  inLanguage: "pt-BR",
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://hojenoticia.com/#website",
  name: "Hoje Notícia",
  url: "https://hojenoticia.com",
  inLanguage: "pt-BR",
  publisher: { "@id": "https://hojenoticia.com/#organization" },
  potentialAction: {
    "@type": "SearchAction",
    target: { "@type": "EntryPoint", urlTemplate: "https://hojenoticia.com/?q={search_term_string}" },
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous" />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
        <Header />
        <main style={{ minHeight: "80vh" }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
