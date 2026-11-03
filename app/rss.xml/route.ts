import { escapeXml, getNewsDraws, newsArticleUrl, NEWS_PUBLICATION_NAME, NEWS_SITE_URL } from "@/lib/news";

export const dynamic = "force-dynamic";

export function GET(): Response {
  const now = new Date();
  const items = getNewsDraws().filter(draw => Date.parse(draw.published_at) <= now.getTime()).slice(0, 50)
    .map(draw => {
      const url = escapeXml(newsArticleUrl(draw));
      return `    <item>
      <title>${escapeXml(draw.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(draw.published_at).toUTCString()}</pubDate>
      <dc:creator>${escapeXml(NEWS_PUBLICATION_NAME)}</dc:creator>
      <description>${escapeXml(`${draw.description}\nFonte oficial: ${draw.source_url}`)}</description>
    </item>`;
    }).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(NEWS_PUBLICATION_NAME)}</title>
    <link>${NEWS_SITE_URL}/noticias</link>
    <description>Boletins das loterias publicados pelo Hoje Notícia com dados confirmados na fonte oficial.</description>
    <language>pt-BR</language>
    <lastBuildDate>${now.toUTCString()}</lastBuildDate>
    <atom:link href="${NEWS_SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>`;
  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8", "Cache-Control": "no-cache" },
  });
}
