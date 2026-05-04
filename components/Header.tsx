"use client";
import Link from "next/link";
import { useState } from "react";
import { CATEGORIES } from "@/lib/categories";

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header style={{ background: "#fff", borderBottom: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)", position: "relative" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 1.25rem" }}>

        {/* Top bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.85rem 0", borderBottom: "1px solid #f1f5f9" }}>

          {/* Hamburguer — só mobile */}
          <button
            className="header-menu-btn"
            onClick={() => setOpen((o) => !o)}
            aria-label="Menu"
            style={{ background: "none", border: "none", cursor: "pointer", padding: "0.25rem", display: "flex", flexDirection: "column", gap: 5 }}
          >
            <span style={{ display: "block", width: 22, height: 2, background: "#374151" }} />
            <span style={{ display: "block", width: 22, height: 2, background: "#374151" }} />
            <span style={{ display: "block", width: 22, height: 2, background: "#374151" }} />
          </button>

          <Link href="/" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "0.55rem" }}>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="38" height="38" style={{ flexShrink: 0 }}>
              <rect width="48" height="48" rx="8" fill="#dc2626"/>
              <text x="24" y="20" fontFamily="Arial Black, Impact, sans-serif" fontSize="11" fontWeight="900" fill="white" textAnchor="middle" letterSpacing="0.5">HOJE</text>
              <rect x="6" y="23" width="36" height="1.5" fill="rgba(255,255,255,0.4)"/>
              <text x="24" y="38" fontFamily="Arial Black, Impact, sans-serif" fontSize="10" fontWeight="900" fill="white" textAnchor="middle" letterSpacing="0.3">NOTÍCIA</text>
            </svg>
            <span style={{ fontSize: "1.7rem", fontWeight: 900, color: "#0f172a", letterSpacing: "-1.5px" }}>
              Hoje<span style={{ color: "#dc2626" }}>Notícia</span>
            </span>
          </Link>

          <div style={{ fontSize: "0.75rem", color: "#94a3b8", fontStyle: "italic" }} className="header-date">
            {new Date().toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </div>
        </div>

        {/* Nav desktop */}
        <nav aria-label="Editorias" className={`header-nav${open ? " open" : ""}`}>
          {Object.entries(CATEGORIES).map(([slug, { label, color }]) => (
            <Link
              key={slug}
              href={`/${slug}`}
              onClick={() => setOpen(false)}
              style={{
                padding: "0.55rem 1rem",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: "#374151",
                whiteSpace: "nowrap",
                textTransform: "uppercase",
                letterSpacing: "0.5px",
                borderBottom: "3px solid transparent",
                textDecoration: "none",
                transition: "color 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => { const el = e.currentTarget; el.style.color = color; el.style.borderBottomColor = color; }}
              onMouseLeave={(e) => { const el = e.currentTarget; el.style.color = "#374151"; el.style.borderBottomColor = "transparent"; }}
            >
              {label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
