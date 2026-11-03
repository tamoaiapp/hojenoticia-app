export const POST_RESULT_AD = {
  unitId: "32081506",
  // Enable only after an Active Mainstream placement is confirmed.
  enabled: false,
  url: "https://auctionr.org/4/a808bcdcfd9eb0f9335210c0c9d7b63a",
};

export function postResultAdUrl(loteria: string, creativeId: string): string {
  const url = new URL(POST_RESULT_AD.url);
  const game = loteria.replace(/[^a-z0-9]/gi, "_").toLowerCase();
  url.searchParams.set("psid", `hn_${game}_${creativeId}`);
  return url.href;
}
