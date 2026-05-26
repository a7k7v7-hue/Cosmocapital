import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0e2a5e",
          width: 32,
          height: 32,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 6,
          fontFamily: "serif",
        }}
      >
        <div style={{ color: "#7cb342", fontSize: 18, fontWeight: 700 }}>К</div>
      </div>
    ),
    size
  );
}
