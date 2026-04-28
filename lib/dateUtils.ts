export function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHours = Math.floor(diffMs / 3_600_000);
  const diffDays = Math.floor(diffMs / 86_400_000);

  if (diffMin < 2)   return "agora mesmo";
  if (diffMin < 60)  return `há ${diffMin} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays === 1) return "ontem";
  if (diffDays < 7)  return `há ${diffDays} dias`;

  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "short", year: "numeric" });
}

export function formatFullDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("pt-BR", {
    day: "numeric", month: "long", year: "numeric",
  });
}

export function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  const diffDays = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (diffDays < 7) return formatRelativeDate(dateStr);
  return date.toLocaleDateString("pt-BR", { day: "numeric", month: "long", year: "numeric" });
}
