import { ImageResponse } from "next/og";
import { LOTERIAS_CONFIG } from "@/lib/loterias";

export const runtime = "nodejs";
export const alt = "Hoje Notícia — Resultados de Loterias";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
          color: "#fff",
          padding: 70,
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", marginBottom: 40 }}>
          <div style={{ fontSize: 32, color: "#dc2626", fontWeight: 800, marginBottom: 12 }}>
            HOJE NOTÍCIA
          </div>
          <div style={{ fontSize: 76, fontWeight: 900, lineHeight: 1.05 }}>
            Resultados de Loterias
          </div>
          <div style={{ fontSize: 32, opacity: 0.75, marginTop: 16 }}>
            Atualizados após cada sorteio
          </div>
        </div>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 14,
            marginTop: "auto",
            marginBottom: 30,
          }}
        >
          {Object.values(LOTERIAS_CONFIG).map((cfg) => (
            <div
              key={cfg.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: cfg.color,
                color: "#fff",
                padding: "10px 18px",
                borderRadius: 10,
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              <span style={{ fontSize: 26 }}>{cfg.emoji}</span>
              <span>{cfg.name}</span>
            </div>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 28,
            fontWeight: 800,
            opacity: 0.6,
          }}
        >
          hojenoticia.com
        </div>
      </div>
    ),
    size,
  );
}
