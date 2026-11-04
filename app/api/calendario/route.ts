import { NextRequest, NextResponse } from "next/server";
import { getHolidayCalendar } from "@/lib/holiday-store";
import { holidayCalendarIcs } from "@/lib/holiday-calendar.mjs";

export function GET(request: NextRequest) {
  const parameters = request.nextUrl.searchParams;
  const rawYear = parameters.get("ano") ?? "";
  const city = parameters.get("cidade") ?? "brasil";
  const format = parameters.get("formato") ?? "json";
  if (!/^\d{4}$/.test(rawYear) || !["json", "ics"].includes(format) || !/^[a-z-]{2,60}$/.test(city)) {
    return NextResponse.json({ error: "Selecione um ano disponível, uma capital e o formato json ou ics." }, { status: 400, headers: { "X-Robots-Tag": "noindex" } });
  }
  const calendar = getHolidayCalendar(Number(rawYear), city);
  if (!calendar) return NextResponse.json({ error: "Calendário não encontrado." }, { status: 404 });
  const headers = { "Cache-Control": "public, max-age=300, s-maxage=3600", "X-Robots-Tag": "noindex", "X-Content-Type-Options": "nosniff" };
  if (format === "json") return NextResponse.json(calendar, { headers });
  return new Response(holidayCalendarIcs(calendar, { includeReferences: parameters.get("referencias") === "1" }), {
    headers: { ...headers, "Content-Type": "text/calendar; charset=utf-8", "Content-Disposition": `attachment; filename="feriados-${city}-${rawYear}.ics"` },
  });
}
