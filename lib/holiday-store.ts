import fs from "node:fs";
import path from "node:path";
import { buildHolidayCalendar, CAPITALS } from "./holiday-calendar.mjs";

export interface HolidayEntry {
  id: string; date: string; name: string;
  kind: "nacional" | "estadual" | "municipal" | "referencia" | "comemorativa";
  isHoliday: boolean; source: { title: string; url: string }; note: string;
}
export interface HolidayCalendarModel {
  year: number; location: { slug: string; name: string; uf: string; timeZone: string };
  checkedAt: string | null; events: HolidayEntry[]; localCount: number;
  coverageNote: string; sources: { title: string; url: string }[];
}

export function availableHolidayYears(): number[] {
  const directory = path.join(process.cwd(), "content", "feriados");
  return fs.readdirSync(directory).filter(file => /^\d{4}\.json$/.test(file)).map(file => Number(file.slice(0, 4))).filter(year => year >= 2026 && year <= 2100).sort();
}
export function getHolidayCalendar(year: number, city = "brasil"): HolidayCalendarModel | null {
  if (!availableHolidayYears().includes(year) || city !== "brasil" && !CAPITALS.some(location => location.slug === city)) return null;
  let catalog = {};
  const file = path.join(process.cwd(), "content", "feriados", "capital-rules.json");
  if (fs.existsSync(file)) catalog = JSON.parse(fs.readFileSync(file, "utf8"));
  return buildHolidayCalendar(year, city, catalog) as HolidayCalendarModel;
}
