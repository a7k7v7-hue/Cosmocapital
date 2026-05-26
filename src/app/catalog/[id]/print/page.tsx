import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { TYPE_LABELS, CATEGORY_LABELS } from "@/types/objects";
import PrintTrigger from "./PrintTrigger";

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getObject(id: string) {
  try {
    return await prisma.object.findFirst({ where: { id, status: "ACTIVE" } });
  } catch {
    return null;
  }
}

export default async function PrintPage({ params }: PageProps) {
  const { id } = await params;
  const obj = await getObject(id);
  if (!obj) notFound();

  const specs = [
    { label: "Тип сделки", value: TYPE_LABELS[obj.type] },
    { label: "Площадь", value: `${obj.areaTotal} м²` },
    obj.areaMin ? { label: "Мин. секция", value: `${obj.areaMin} м²` } : null,
    obj.floor ? { label: "Этаж", value: `${obj.floor}${obj.floorsTotal ? `/${obj.floorsTotal}` : ""}` } : null,
    { label: "Категория", value: CATEGORY_LABELS[obj.category] },
    obj.metro ? { label: "Метро", value: `м. ${obj.metro}` } : null,
    { label: "Местоположение", value: obj.address },
  ].filter(Boolean) as { label: string; value: string }[];

  const mainPhoto = obj.photos[0] ?? null;
  const extraPhotos = obj.photos.slice(1, 5);

  return (
    <>
      <PrintTrigger />
      <div style={{ fontFamily: "Arial, sans-serif", color: "#1a1f2e", background: "#fff", margin: 0, padding: 0 }}>

        {/* ── HEADER ── */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center",
          borderBottom: "3px solid #0e2a5e", paddingBottom: 12, marginBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 44, height: 44, background: "#0e2a5e", borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: "#7cb342", fontWeight: 700, fontSize: 20, letterSpacing: -1,
            }}>К</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, color: "#0e2a5e", letterSpacing: ".04em" }}>КОСМО КАПИТАЛ</div>
              <div style={{ fontSize: 11, color: "#6b7080" }}>Коммерческая недвижимость</div>
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "#0e2a5e" }}>+7 (903) 537 44 88</div>
            <div style={{ fontSize: 11, color: "#6b7080" }}>info@cosmocapital.ru · cosmocapital.ru</div>
          </div>
        </div>

        {/* ── TITLE ── */}
        <h1 style={{ fontSize: 22, fontWeight: 700, color: "#0e2a5e", marginBottom: 4, lineHeight: 1.3 }}>
          {obj.title}
        </h1>
        <div style={{ fontSize: 13, color: "#6b7080", marginBottom: 20 }}>
          📍 {obj.address}{obj.metro ? ` · 🚇 м. ${obj.metro}` : ""}
        </div>

        {/* ── PHOTOS ── */}
        {mainPhoto && (
          <div style={{ marginBottom: 20 }}>
            {/* Main photo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mainPhoto}
              alt={obj.title}
              style={{ width: "100%", height: 320, objectFit: "cover", borderRadius: 8, display: "block" }}
            />
            {/* Extra photos row */}
            {extraPhotos.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: `repeat(${extraPhotos.length}, 1fr)`, gap: 8, marginTop: 8 }}>
                {extraPhotos.map((src, i) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={i} src={src} alt="" style={{ width: "100%", height: 140, objectFit: "cover", borderRadius: 6 }} />
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── SPECS + DESCRIPTION ── */}
        <div style={{ display: "grid", gridTemplateColumns: "280px 1fr", gap: 24, marginBottom: 24 }}>

          {/* Key parameters */}
          <div>
            <div style={{
              background: "#f7f5f0", border: "1px solid #e4dfd6", borderRadius: 8, padding: 16,
            }}>
              <div style={{ fontWeight: 700, fontSize: 13, color: "#0e2a5e", marginBottom: 12, textTransform: "uppercase", letterSpacing: ".08em" }}>
                Ключевые параметры
              </div>
              {specs.map(({ label, value }) => (
                <div key={label} style={{ marginBottom: 10, paddingBottom: 10, borderBottom: "1px solid #e4dfd6" }}>
                  <div style={{ fontSize: 10, color: "#6b7080", textTransform: "uppercase", letterSpacing: ".06em" }}>{label}</div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#1a1f2e", marginTop: 2 }}>{value}</div>
                </div>
              ))}
              <div style={{ marginTop: 4 }}>
                <div style={{ fontSize: 10, color: "#6b7080", textTransform: "uppercase", letterSpacing: ".06em" }}>Цена</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#7cb342", marginTop: 2 }}>По запросу</div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div style={{ fontWeight: 700, fontSize: 13, color: "#0e2a5e", marginBottom: 10, textTransform: "uppercase", letterSpacing: ".08em" }}>
              Описание
            </div>
            <div style={{ fontSize: 13, color: "#1a1f2e", lineHeight: 1.75, whiteSpace: "pre-line" }}>
              {obj.description}
            </div>
          </div>
        </div>

        {/* ── FOOTER ── */}
        <div style={{
          borderTop: "2px solid #0e2a5e", paddingTop: 14, marginTop: 8,
          display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <div style={{ fontSize: 12, color: "#6b7080" }}>
            🌐 cosmocapital.ru/catalog/{obj.id}
          </div>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#0e2a5e" }}>
            +7 (903) 537 44 88 · info@cosmocapital.ru
          </div>
        </div>

      </div>
    </>
  );
}
