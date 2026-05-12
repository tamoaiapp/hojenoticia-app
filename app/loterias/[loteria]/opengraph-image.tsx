import { ImageResponse } from "next/og";
import { LOTERIAS_CONFIG, getDrawsByLoteria, formatBRL } from "@/lib/loterias";

export const runtime = "nodejs";
export const alt = "Resultados da loteria";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

interface Props { params: Promise<{ loteria: string }> }

export default async function Image({ params }: Props) {
  const { loteria } = await params;
  const cfg = LOTERIAS_CONFIG[loteria];

  if (!cfg) {
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
          Hoje Notícia
        </div>
      ),
      size,
    );
  }

  const latest = getDrawsByLoteria(loteria).find((d) => d.status === "publicado");

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
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
            marginBottom: 30,
          }}
        >
          <span style={{ fontSize: 80 }}>{cfg.emoji}</span>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 72, fontWeight: 900, lineHeight: 1 }}>{cfg.name}</div>
            <div style={{ fontSize: 26, opacity: 0.85, marginTop: 8 }}>{cfg.freq}</div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 30,
            opacity: 0.92,
            lineHeight: 1.4,
            maxWidth: "90%",
          }}
        >
          {cfg.description}
        </div>

        {latest && latest.numeros.length > 0 && (
          <div style={{ display: "flex", flexDirection: "column", marginTop: 40 }}>
            <div style={{ fontSize: 22, opacity: 0.85, marginBottom: 12 }}>
              Último resultado — Concurso {latest.concurso}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {latest.numeros.slice(0, 15).map((n) => (
                <div
                  key={n}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 64,
                    height: 64,
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.22)",
                    border: "2px solid rgba(255,255,255,0.55)",
                    fontSize: 26,
                    fontWeight: 900,
                  }}
                >
                  {n.padStart(2, "0")}
                </div>
              ))}
            </div>
          </div>
        )}

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "auto",
          }}
        >
          <div style={{ display: "flex", fontSize: 22, opacity: 0.85 }}>
            {latest?.proximo_premio
              ? `Próximo: ${formatBRL(latest.proximo_premio)}`
              : "Resultados oficiais atualizados"}
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 26,
              fontWeight: 800,
              background: "#fff",
              color: cfg.color,
              padding: "10px 26px",
              borderRadius: 8,
            }}
          >
            hojenoticia.com
          </div>
        </div>
      </div>
    ),
    size,
  );
}
