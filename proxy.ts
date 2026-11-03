import { NextRequest, NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  if (!/^\/(?:copa|eleicoes-2026)(?:\/|$)/.test(request.nextUrl.pathname)) return NextResponse.next();
  return new NextResponse(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex"><title>Cobertura encerrada | Hoje Notícia</title><style>body{margin:0;background:#f8fafc;color:#172033;font:17px/1.6 system-ui,sans-serif}main{max-width:650px;margin:12vh auto;padding:2rem}a{display:inline-block;background:#dc2626;color:white;padding:.8rem 1.2rem;border-radius:10px;text-decoration:none;font-weight:700}p{color:#475569}</style></head><body><main><p>Hoje Notícia</p><h1>Esta cobertura foi encerrada</h1><p>O site agora concentra a navegação em resultados, próximos concursos e notícias das loterias.</p><a href="/">Consultar resultados das loterias</a></main></body></html>`, {
    status: 410,
    headers: { "Content-Type": "text/html; charset=utf-8", "X-Robots-Tag": "noindex" },
  });
}

export const config = { matcher: ["/copa/:path*", "/eleicoes-2026/:path*"] };
