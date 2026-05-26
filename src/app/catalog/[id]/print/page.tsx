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

// Strip boilerplate contact info that was baked into old DB descriptions
function cleanDescription(raw: string): string {
  return raw
    .replace(/Контактная информация[\s\S]*$/i, "")
    .replace(/\+7\s*\(903\)\s*537\s*44\s*88[\s\S]*$/g, "")
    .replace(/info@cosm[oa]capital\.ru[\s\S]*$/gi, "")
    .replace(/cosm[oa]capital\.ru[\s\S]*$/gi, "")
    .trim()
    .replace(/\n{3,}/g, "\n\n");
}

export default async function PrintPage({ params }: PageProps) {
  const { id } = await params;
  const obj = await getObject(id);
  if (!obj) notFound();

  const description = cleanDescription(obj.description);

  const specs: { label: string; value: string }[] = [
    { label: "Тип", value: TYPE_LABELS[obj.type] },
    { label: "Категория", value: CATEGORY_LABELS[obj.category] },
    { label: "Общая площадь", value: `${obj.areaTotal.toLocaleString("ru-RU")} м²` },
    ...(obj.areaMin ? [{ label: "Мин. секция", value: `${obj.areaMin} м²` }] : []),
    ...(obj.floor ? [{ label: "Этаж", value: `${obj.floor}${obj.floorsTotal ? ` / ${obj.floorsTotal}` : ""}` }] : []),
    ...(obj.metro ? [{ label: "Метро", value: `м. ${obj.metro}` }] : []),
  ];

  const [photo1, ...rest] = obj.photos;
  const photos234 = rest.slice(0, 3);

  // Accent color bar: dark blue with green stripe (brand)
  const navy = "#0e2a5e";
  const green = "#7cb342";

  return (
    <>
      <PrintTrigger />

      {/* ── TOP BAR ── */}
      <div style={{ background: navy, padding: "0 36px", display: "flex", justifyContent: "space-between", alignItems: "center", height: 64 }}>
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 36, height: 36, background: green, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 22, color: "#fff",
          }}>К</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, letterSpacing: ".06em" }}>КОСМО КАПИТАЛ</div>
            <div style={{ color: "rgba(255,255,255,.55)", fontSize: 10, letterSpacing: ".04em" }}>КОММЕРЧЕСКАЯ НЕДВИЖИМОСТЬ</div>
          </div>
        </div>
        {/* Contact */}
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 15, letterSpacing: ".02em" }}>+7 (903) 537 44 88</div>
          <div style={{ color: "rgba(255,255,255,.55)", fontSize: 10 }}>info@cosmocapital.ru · cosmocapital.ru</div>
        </div>
      </div>

      {/* ── GREEN ACCENT LINE ── */}
      <div style={{ height: 4, background: green }} />

      {/* ── BODY ── */}
      <div style={{ padding: "28px 36px 0" }}>

        {/* Title block */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", gap: 8, marginBottom: 8 }}>
            <span style={{
              background: obj.type === "SALE" ? "#c53030" : green, color: "#fff",
              fontSize: 10, fontWeight: 600, padding: "3px 10px", borderRadius: 3, letterSpacing: ".06em",
            }}>{TYPE_LABELS[obj.type].toUpperCase()}</span>
            <span style={{
              background: "#f0ede6", color: "#6b7080",
              fontSize: 10, fontWeight: 500, padding: "3px 10px", borderRadius: 3, letterSpacing: ".04em",
            }}>{CATEGORY_LABELS[obj.category].toUpperCase()}</span>
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 28, fontWeight: 600, color: navy,
            lineHeight: 1.25, marginBottom: 6,
          }}>
            {obj.title}
          </h1>
          <div style={{ fontSize: 12, color: "#6b7080", display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>📍 {obj.address}</span>
            {obj.metro && <span>🚇 м. {obj.metro}</span>}
          </div>
        </div>

        {/* Photos */}
        {photo1 && (
          <div style={{ marginBottom: 22 }}>
            {photos234.length > 0 ? (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo1} alt={obj.title}
                  style={{ width: "100%", height: 230, objectFit: "cover", borderRadius: 6, display: "block" }} />
                <div style={{ display: "grid", gridTemplateRows: `repeat(${Math.min(photos234.length, 3)}, 1fr)`, gap: 8 }}>
                  {photos234.map((src, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={src} alt=""
                      style={{ width: "100%", height: photos234.length === 1 ? 230 : photos234.length === 2 ? 111 : 72, objectFit: "cover", borderRadius: 6, display: "block" }} />
                  ))}
                </div>
              </div>
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={photo1} alt={obj.title}
                style={{ width: "100%", height: 280, objectFit: "cover", borderRadius: 6, display: "block" }} />
            )}
          </div>
        )}

        {/* Two-column: specs | description */}
        <div style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 24, marginBottom: 28 }}>

          {/* Specs panel */}
          <div style={{ background: "#f7f5f0", borderRadius: 8, padding: "16px 18px", border: "1px solid #e4dfd6" }}>
            <div style={{
              fontSize: 9, fontWeight: 700, color: navy, letterSpacing: ".12em",
              textTransform: "uppercase", marginBottom: 14, paddingBottom: 10,
              borderBottom: `2px solid ${green}`,
            }}>
              Параметры объекта
            </div>
            {specs.map(({ label, value }) => (
              <div key={label} style={{ marginBottom: 11 }}>
                <div style={{ fontSize: 9, color: "#9098a9", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#1a1f2e" }}>{value}</div>
              </div>
            ))}
            {/* Divider */}
            <div style={{ borderTop: "1px dashed #e4dfd6", margin: "12px 0" }} />
            <div>
              <div style={{ fontSize: 9, color: "#9098a9", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 2 }}>Цена</div>
              <div style={{ fontSize: 14, fontWeight: 700, color: green }}>По запросу</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <div style={{
              fontSize: 9, fontWeight: 700, color: navy, letterSpacing: ".12em",
              textTransform: "uppercase", marginBottom: 14, paddingBottom: 10,
              borderBottom: `2px solid ${green}`,
            }}>
              Описание
            </div>
            <div style={{ fontSize: 12, color: "#2a2f3e", lineHeight: 1.8, whiteSpace: "pre-line" }}>
              {description}
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <div style={{
        background: "#f7f5f0", borderTop: "1px solid #e4dfd6",
        padding: "14px 36px",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: 11, color: "#6b7080" }}>
          cosmocapital.ru/catalog/{obj.id}
        </div>
        <div style={{ display: "flex", gap: 20, fontSize: 11, color: navy, fontWeight: 500 }}>
          <span>+7 (903) 537 44 88</span>
          <span>info@cosmocapital.ru</span>
        </div>
      </div>
    </>
  );
}
