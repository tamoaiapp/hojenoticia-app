import { getAllDraws, type DrawMeta } from "./loterias";

export const NEWS_SITE_URL = "https://www.hojenoticia.com";
export const NEWS_PUBLICATION_NAME = "Hoje Notícia";
const DAY_MS = 24 * 60 * 60 * 1000;

type PublicationMetadata = {
  published_at?: string;
  updated_at?: string;
  source_url?: string;
  source_checked_at?: string;
};

export type NewsDraw = DrawMeta & PublicationMetadata & {
  published_at: string;
  source_url: string;
};

function calendarDay(value: string): number | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T00:00:00Z`);
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) return null;
  return parsed.getTime();
}

export function publicationTime(value?: string): number | null {
  if (!value) return null;
  const match = value.match(/^\d{4}-\d{2}-\d{2}T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d{1,9})?)?(?:Z|[+-]\d{2}:\d{2})$/);
  if (!match || calendarDay(value.slice(0, 10)) === null) return null;
  if (Number(match[1]) > 23 || Number(match[2]) > 59 || Number(match[3] || 0) > 59) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function isOfficialCaixaSource(value?: string): boolean {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && !url.username && !url.password &&
      (url.hostname === "caixa.gov.br" || url.hostname.endsWith(".caixa.gov.br"));
  } catch {
    return false;
  }
}

/** A result becomes a news article only with a real publication timestamp and a timely official source. */
export function isNewsArticle(draw: DrawMeta & PublicationMetadata): draw is NewsDraw {
  if (draw.status !== "publicado" || !isOfficialCaixaSource(draw.source_url)) return false;
  const published = publicationTime(draw.published_at);
  const eventDay = calendarDay(draw.draw_date);
  if (published === null || eventDay === null) return false;
  const publicationDay = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date(published));
  const publicationDayMs = calendarDay(publicationDay);
  if (publicationDayMs === null) return false;
  const daysAfterEvent = (publicationDayMs - eventDay) / DAY_MS;
  return daysAfterEvent >= 0 && daysAfterEvent <= 2;
}

export function getNewsDraws(): NewsDraw[] {
  return getAllDraws().filter(isNewsArticle)
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at));
}

export function getNewsSitemapDraws(
  draws: (DrawMeta & PublicationMetadata)[] = getNewsDraws(),
  now: Date = new Date(),
): NewsDraw[] {
  const end = now.getTime();
  const start = end - 2 * DAY_MS;
  return draws.filter(isNewsArticle)
    .filter(draw => {
      const published = Date.parse(draw.published_at);
      return published >= start && published <= end;
    })
    .sort((a, b) => Date.parse(b.published_at) - Date.parse(a.published_at))
    .slice(0, 1000);
}

export function newsArticleUrl(draw: Pick<DrawMeta, "loteria" | "slug">): string {
  return `${NEWS_SITE_URL}/loterias/${encodeURIComponent(draw.loteria)}/${encodeURIComponent(draw.slug)}`;
}

export function escapeXml(value: string): string {
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function formatPublicationTime(value: string): string {
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo", day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short",
  }).format(new Date(value));
}
