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
  const federal = loteria === "federal";
  const columns = loteria === "super-sete";
  const extraNumbers = draw.numeros_segundo_sorteio?.length ? draw.numeros_segundo_sorteio : draw.trevos_sorteados ?? [];
  const extraLabel = draw.numeros_segundo_sorteio?.length ? "Segundo sorteio" : "Trevos";

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
            {draw.numeros.slice(0, 20).map((n, index) => (
              <div
                key={`${index}-${n}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 6,
                  width: federal ? 170 : 78,
                  height: 78,
                  borderRadius: federal || columns ? 12 : 999,
                  background: "rgba(255,255,255,0.22)",
                  border: "3px solid rgba(255,255,255,0.55)",
                  fontSize: federal ? 28 : 32,
                  fontWeight: 900,
                }}
              >
                {(federal || columns) && <span style={{ fontSize: 15, fontWeight: 500 }}>{federal ? `${index + 1}º prêmio` : `Coluna ${index + 1}`}</span>}
                <span>{federal || columns ? n : n.padStart(2, "0")}</span>
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

        {isPublished && extraNumbers.length > 0 && <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
          <span style={{ fontSize: 22 }}>{extraLabel}:</span>
          {extraNumbers.map((number, index) => <span key={`${index}-${number}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 58, height: 58, borderRadius: 999, background: "rgba(255,255,255,0.22)", border: "2px solid rgba(255,255,255,0.55)", fontSize: 26, fontWeight: 800 }}>{number.padStart(2, "0")}</span>)}
        </div>}
        {isPublished && (draw.mes_sorte || draw.time_coracao) && <div style={{ display: "flex", fontSize: 24, marginBottom: 16 }}>{draw.mes_sorte ? `Mês da sorte: ${draw.mes_sorte}` : `Time do coração: ${draw.time_coracao}`}</div>}

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
              {isPublished ? federal ? "Primeiro prêmio" : draw.ganhadores > 0 ? `${draw.ganhadores} aposta(s) ganhadora(s) na faixa principal` : draw.acumulou === true ? "Acumulou" : "Premiação na fonte oficial" : "Resultado aguardando confirmação"}
            </div>
            <div style={{ display: "flex", fontSize: 28, fontWeight: 800 }}>
              {isPublished && draw.ganhadores > 0 && draw.premio_principal > 0
                ? formatBRL(draw.premio_principal)
                : "Rateio e fonte na página do concurso"}
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
