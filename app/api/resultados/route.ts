import { getDrawsByLoteria } from "@/lib/loterias";
import { buildResultsFeed, GAME_IDS } from "@/lib/resultados-following.mjs";

export const runtime = "nodejs";
export const revalidate = 120;

export function GET() {
  const feed = buildResultsFeed(GAME_IDS.flatMap(game => getDrawsByLoteria(game)));
  return Response.json(feed, {
    headers: {
      "Cache-Control": "public, max-age=120, s-maxage=120, stale-while-revalidate=60",
      "X-Content-Type-Options": "nosniff",
      "X-Robots-Tag": "noindex",
    },
  });
}
