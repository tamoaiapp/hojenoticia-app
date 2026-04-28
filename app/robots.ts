import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/" },
      { userAgent: "Googlebot-News", allow: "/" },
    ],
    sitemap: [
      "https://hojenoticia.com/sitemap.xml",
      "https://hojenoticia.com/sitemap-news.xml",
    ],
  };
}
