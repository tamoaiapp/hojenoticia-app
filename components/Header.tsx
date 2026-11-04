"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { LOTERIAS_CONFIG } from "@/lib/loterias-config";

const featured = ["lotofacil", "quina", "mega-sena"];
const tools = [{ href: "/meus-resultados", label: "Meus resultados" }, { href: "/feriados", label: "Feriados" }, { href: "/dias-uteis", label: "Dias úteis" }, { href: "/cotacao", label: "Cotação" }, { href: "/horoscopo", label: "Horóscopo" }];

export default function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [today, setToday] = useState<{ text: string; iso: string } | null>(null);
  const moreRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setToday({
        text: new Intl.DateTimeFormat("pt-BR", { timeZone: "America/Sao_Paulo", weekday: "long", day: "numeric", month: "long", year: "numeric" }).format(now),
        iso: new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(now),
      });
    };
    update();
    const interval = window.setInterval(update, 60000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        if (moreRef.current) moreRef.current.open = false;
      }
    };
    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, []);

  function closeMenu() {
    setOpen(false);
    if (moreRef.current) moreRef.current.open = false;
  }

  function active(href: string) {
    return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
  }

  return (
    <header className="site-header">
      <div className="site-header-inner">
        <div className="header-topbar">
          <Link className="site-brand" href="/" onClick={closeMenu} aria-label="Hoje Notícia — página inicial">
            <svg viewBox="0 0 36 36" width="36" height="36" aria-hidden="true" focusable="false">
              <rect width="36" height="36" rx="8" fill="#dc2626" />
              <rect x="8" y="8" width="8" height="9" rx="1" fill="#fff" />
              <path d="M20 9h8M20 14h8M8 22h20M8 27h20" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
            </svg>
            <span>Hoje<span className="brand-accent">Notícia</span></span>
          </Link>
          <time className="site-date" dateTime={today?.iso}>{today?.text ?? "Horário de Brasília"}</time>
          <button type="button" className="site-menu-toggle" aria-expanded={open} aria-controls="site-navigation" aria-label={open ? "Fechar menu" : "Abrir menu"} onClick={() => setOpen(value => !value)}>
            <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true" focusable="false">
              {open ? <path d="m6 6 12 12M18 6 6 18" /> : <path d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
            <span>Menu</span>
          </button>
        </div>
        <nav id="site-navigation" className={`site-nav${open ? " is-open" : ""}`} aria-label="Navegação principal">
          <div className="site-nav-main">
            <Link href="/" onClick={closeMenu} aria-current={active("/") ? "page" : undefined}>Resultados</Link>
            {featured.map(slug => <Link key={slug} href={`/loterias/${slug}`} onClick={closeMenu} aria-current={active(`/loterias/${slug}`) ? "page" : undefined}>{LOTERIAS_CONFIG[slug].name}</Link>)}
            <details className="nav-more" ref={moreRef}>
              <summary>Mais loterias <span aria-hidden="true">⌄</span></summary>
              <div className="nav-more-links">
                {Object.entries(LOTERIAS_CONFIG).filter(([slug]) => !featured.includes(slug)).map(([slug, cfg]) => <Link key={slug} href={`/loterias/${slug}`} onClick={closeMenu} aria-current={active(`/loterias/${slug}`) ? "page" : undefined}>{cfg.name}</Link>)}
                <Link href="/loterias" onClick={closeMenu}>Todas as loterias</Link>
              </div>
            </details>
            <Link href="/noticias" onClick={closeMenu} aria-current={active("/noticias") ? "page" : undefined}>Notícias</Link>
          </div>
          <div className="header-tools" aria-label="Outras consultas">
            {tools.map(tool => <Link key={tool.href} href={tool.href} onClick={closeMenu} aria-current={active(tool.href) ? "page" : undefined}>{tool.label}</Link>)}
          </div>
        </nav>
      </div>
    </header>
  );
}
