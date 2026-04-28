import fs from "fs";
import path from "path";
import matter from "gray-matter";

const CONTENT_DIR = path.join(process.cwd(), "content");

export interface ArticleMeta {
  slug: string;
  category: string;
  title: string;
  description: string;
  date: string;
  readTime: string;
  keywords: string;
  image?: string;
  youtubeId?: string;
}

export interface Article extends ArticleMeta {
  content: string;
}

function parseArticle(file: string, category: string): ArticleMeta {
  const slug = file.replace(/\.mdx?$/, "");
  const fp = path.join(CONTENT_DIR, category, file);
  const { data } = matter(fs.readFileSync(fp, "utf-8"));
  return {
    slug,
    category,
    title: data.title ?? slug,
    description: data.description ?? "",
    date: data.date ?? "2026-01-01",
    readTime: data.readTime ?? "5 min",
    keywords: data.keywords ?? "",
    image: data.image ?? undefined,
    youtubeId: data.youtubeId ?? undefined,
  };
}

export function getAllArticles(): ArticleMeta[] {
  if (!fs.existsSync(CONTENT_DIR)) return [];
  const articles: ArticleMeta[] = [];
  for (const cat of fs.readdirSync(CONTENT_DIR)) {
    const catDir = path.join(CONTENT_DIR, cat);
    if (!fs.statSync(catDir).isDirectory()) continue;
    for (const file of fs.readdirSync(catDir).filter((f) => /\.mdx?$/.test(f))) {
      try { articles.push(parseArticle(file, cat)); } catch {}
    }
  }
  return articles.sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticlesByCategory(category: string): ArticleMeta[] {
  const catDir = path.join(CONTENT_DIR, category);
  if (!fs.existsSync(catDir)) return [];
  return fs.readdirSync(catDir)
    .filter((f) => /\.mdx?$/.test(f))
    .map((f) => parseArticle(f, category))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getArticleBySlug(category: string, slug: string): Article | null {
  for (const ext of [".mdx", ".md"]) {
    const fp = path.join(CONTENT_DIR, category, slug + ext);
    if (!fs.existsSync(fp)) continue;
    const { data, content } = matter(fs.readFileSync(fp, "utf-8"));
    return {
      slug,
      category,
      title: data.title ?? slug,
      description: data.description ?? "",
      date: data.date ?? "2026-01-01",
      readTime: data.readTime ?? "5 min",
      keywords: data.keywords ?? "",
      image: data.image ?? undefined,
      youtubeId: data.youtubeId ?? undefined,
      content,
    };
  }
  return null;
}
