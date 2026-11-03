import { ImageResponse } from "next/og";
import { LOTERIAS_CONFIG, getDrawBySlug, formatBRL, formatDateShort } from "@/lib/loterias";

export const runtime = "nodejs";
export const alt = "Resultado do concurso";
export const size = { width: 1200, height: 675 };
export const contentType = "image/png";

interface Props { params: Promise<{ loteria: string; concurso: string }> }

export default async function Image({ params }: Props) {
  const { loteria, concurso } = await params;
  const draw = getDrawBySlug(loteria, concurso);
  const cfg = LOTERIAS_CONFIG[loteria];

  if (!draw || !cfg) {
    return new ImageResponse(
      (
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#0f172a",
            color: "#fff",
            fontSize: 56,
            fontWeight: 900,
          }}
        >
          Hoje Notícia — Resultados de Loterias
        </div>
      ),
      size,
    );
  }

  const isPublished = draw.status === "publicado";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: cfg.color,
          color: "#fff",
          padding: 60,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Top bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 30,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              fontSize: 26,
              fontWeight: 800,
            }}
          >
            <span>{cfg.name}</span>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 22,
              fontWeight: 700,
              background: "rgba(0,0,0,0.25)",
              padding: "8px 18px",
              borderRadius: 8,
            }}
          >
            Concurso {draw.concurso}
          </div>
        </div>

        {/* Title */}
        <div
          style={{
            display: "flex",
            fontSize: 44,
            fontWeight: 900,
            lineHeight: 1.15,
            marginBottom: 24,
            maxWidth: "100%",
          }}
        >
          {isPublished
            ? `Resultado ${cfg.name} — ${formatDateShort(draw.draw_date)}`
            : draw.schedule_status === "confirmed" ? `Próximo Sorteio ${cfg.name} — ${formatDateShort(draw.draw_date)}` : `${cfg.name} — calendário em confirmação`}
        </div>

        {/* Numbers */}
        {isPublished && draw.numeros.length > 0 ? (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 12,
              marginBottom: 32,
            }}
          >
            {draw.numeros.slice(0, 20).map((n) => (
              <div
                key={n}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 78,
                  height: 78,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.22)",
                  border: "3px solid rgba(255,255,255,0.55)",
                  fontSize: 32,
                  fontWeight: 900,
                }}
              >
                {n.padStart(2, "0")}
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              fontSize: 32,
              opacity: 0.9,
              marginBottom: 32,
            }}
          >
            Aguardando sorteio
          </div>
        )}

        {/* Footer info */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 10, width: 680 }}>
            <div style={{ display: "flex", fontSize: 22, opacity: 0.85 }}>
              {isPublished ? draw.ganhadores > 0 ? `${draw.ganhadores} aposta(s) ganhadora(s)` : draw.acumulou === true ? "Acumulou" : "Premiação na fonte oficial" : "Resultado aguardando confirmação"}
            </div>
            <div style={{ display: "flex", fontSize: 28, fontWeight: 800 }}>
              {isPublished && draw.ganhadores > 0 && draw.premio_principal > 0
                ? formatBRL(draw.premio_principal)
                : draw.proximo_premio ? `Estimativa seguinte: ${formatBRL(draw.proximo_premio)}` : ""}
            </div>
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 20,
              fontWeight: 800,
              background: "#fff",
              color: cfg.color,
              padding: "10px 24px",
              borderRadius: 8,
            }}
          >
            Hoje Notícia · dados Caixa
          </div>
        </div>
      </div>
    ),
    size,
  );
}
