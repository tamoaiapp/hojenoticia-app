import { escapeXml, getNewsSitemapDraws, newsArticleUrl, NEWS_PUBLICATION_NAME } from "@/lib/news";

export const dynamic = "force-dynamic";

export function GET(): Response {
  const entries = getNewsSitemapDraws().map(draw => `  <url>
    <loc>${escapeXml(newsArticleUrl(draw))}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(NEWS_PUBLICATION_NAME)}</news:name>
        <news:language>pt</news:language>
      </news:publication>
      <news:publication_date>${escapeXml(draw.published_at)}</news:publication_date>
      <news:title>${escapeXml(draw.title)}</news:title>
    </news:news>
  </url>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${entries}
</urlset>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
