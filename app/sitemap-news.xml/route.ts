import { getAllArticles } from "@/lib/mdx";

function escapeXml(str: string) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  const articles = getAllArticles();
  const twoDaysAgo = new Date(Date.now() - 48 * 60 * 60 * 1000);

  // Google News Sitemap: apenas artigos das últimas 48h
  const recent = articles.filter((a) => new Date(a.date) >= twoDaysAgo);

  const urls = recent
    .map((a) => {
      const pubDate = new Date(a.date).toISOString();
      return `  <url>
    <loc>https://hojenoticia.com/${a.category}/${a.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Hoje Notícia</news:name>
        <news:language>pt</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(a.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
