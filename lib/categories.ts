export const CATEGORIES: Record<string, { label: string; color: string; emoji: string }> = {
  politica:      { label: "Política",        color: "#dc2626", emoji: "" },
  noticias:      { label: "Notícias",        color: "#2563eb", emoji: "" },
  crime:         { label: "Crime",           color: "#374151", emoji: "" },
  fofoca:        { label: "Fofoca",          color: "#db2777", emoji: "" },
  futebol:       { label: "Futebol",         color: "#16a34a", emoji: "" },
  entretenimento:{ label: "Entretenimento",  color: "#ea580c", emoji: "" },
  automoveis:    { label: "Automóveis",      color: "#0f766e", emoji: "" },
  financas:      { label: "Finanças",        color: "#d97706", emoji: "" },
  saude:         { label: "Saúde",           color: "#0891b2", emoji: "" },
  tecnologia:    { label: "Tecnologia",      color: "#7c3aed", emoji: "" },
  religiao:      { label: "Religião",        color: "#854d0e", emoji: "" },
};

export function getCategoryMeta(slug: string) {
  return CATEGORIES[slug] ?? { label: slug, color: "#64748b", emoji: "" };
}
