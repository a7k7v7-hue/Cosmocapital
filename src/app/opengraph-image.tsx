import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Космо Капитал — Коммерческая недвижимость";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0e2a5e",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "serif",
          padding: "60px",
        }}
      >
        <div style={{ color: "#7cb342", fontSize: 22, letterSpacing: 6, textTransform: "uppercase", marginBottom: 24 }}>
          Коммерческая недвижимость
        </div>
        <div style={{ color: "#ffffff", fontSize: 72, fontWeight: 600, textAlign: "center", lineHeight: 1.1, marginBottom: 24 }}>
          Космо Капитал
        </div>
        <div style={{ color: "rgba(255,255,255,0.65)", fontSize: 26, textAlign: "center" }}>
          Офисы · Склады · Торговые площади · Инвестиции
        </div>
        <div style={{ color: "#7cb342", fontSize: 18, marginTop: 48, letterSpacing: 2 }}>
          cosmacapital.ru
        </div>
      </div>
    ),
    size
  );
}
