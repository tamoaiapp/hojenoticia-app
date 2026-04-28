"use client";
import { useEffect, useRef, useState } from "react";
import { ArticleMeta } from "@/lib/mdx";
import ArticleListItem from "./ArticleListItem";

const BATCH = 12;

export default function InfiniteArticleList({ articles }: { articles: ArticleMeta[] }) {
  const [count, setCount] = useState(BATCH);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const visible = articles.slice(0, count);
  const hasMore = count < articles.length;

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return;
    const obs = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) setCount((c) => c + BATCH); },
      { rootMargin: "300px" }
    );
    obs.observe(sentinelRef.current);
    return () => obs.disconnect();
  }, [hasMore]);

  return (
    <div>
      {visible.map((a) => (
        <ArticleListItem key={`${a.category}/${a.slug}`} article={a} />
      ))}
      {hasMore && (
        <div ref={sentinelRef} style={{ textAlign: "center", padding: "1.5rem 0", color: "#94a3b8", fontSize: "0.82rem" }}>
          Carregando mais notícias…
        </div>
      )}
    </div>
  );
}
