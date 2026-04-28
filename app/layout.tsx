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
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Google AdSense */}
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX" crossOrigin="anonymous" />
      </head>
      <body>
        <Header />
        <main style={{ minHeight: "80vh" }}>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
