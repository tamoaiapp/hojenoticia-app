"use client";
import Link from "next/link";
import { CATEGORIES } from "@/lib/categories";

export default function Header() {
  return (
    <header style={{ background: "#0f172a", borderBottom: "3px solid #ef4444" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.25rem" }}>
        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 0" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <div>
              <span style={{ fontSize: "1.8rem", fontWeight: 900, color: "#fff", letterSpacing: "-1px" }}>
                Hoje<span style={{ color: "#ef4444" }}>Notícia</span>
              </span>
              <div style={{ fontSize: "0.7rem", color: "#94a3b8", letterSpacing: "2px", textTransform: "uppercase" }}>
                O Brasil acontece aqui
              </div>
            </div>
          </Link>
          <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Category nav */}
        <nav style={{ display: "flex", gap: "0.25rem", overflowX: "auto", paddingBottom: "0.5rem" }}>
          {Object.entries(CATEGORIES).map(([slug, { label, emoji }]) => (
            <Link
              key={slug}
              href={`/${slug}`}
              style={{
                padding: "0.4rem 0.9rem",
                borderRadius: "4px 4px 0 0",
                fontSize: "0.82rem",
                fontWeight: 600,
                color: "#cbd5e1",
                whiteSpace: "nowrap",
                transition: "all 0.15s",
              }}
              onMouseEnter={(e) => { (e.target as HTMLElement).style.color = "#fff"; (e.target as HTMLElement).style.background = "rgba(255,255,255,0.1)"; }}
              onMouseLeave={(e) => { (e.target as HTMLElement).style.color = "#cbd5e1"; (e.target as HTMLElement).style.background = "transparent"; }}
            >
              {emoji} {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
