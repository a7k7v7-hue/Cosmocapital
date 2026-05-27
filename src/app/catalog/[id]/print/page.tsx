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

function cleanDescription(raw: string): string {
  return raw
    .replace(/Контактная информация[\s\S]*$/i, "")
    .replace(/\+7\s*\(903\)\s*537\s*44\s*88[\s\S]*$/g, "")
    .replace(/info@cosm[oa]capital\.ru[\s\S]*$/gi, "")
    .replace(/cosm[oa]capital\.ru[\s\S]*$/gi, "")
    .trim()
    .replace(/\n{3,}/g, "\n\n");
}

const navy = "#0e2a5e";
const green = "#7cb342";

export default async function PrintPage({ params }: PageProps) {
  const { id } = await params;
  const obj = await getObject(id);
  if (!obj) notFound();

  const description = cleanDescription(obj.description).slice(0, 860);
  const paragraphs = description.split("\n\n").filter(Boolean);

  const specs: { label: string; value: string }[] = [
    { label: "Тип", value: TYPE_LABELS[obj.type] },
    { label: "Категория", value: CATEGORY_LABELS[obj.category] },
    { label: "Площадь", value: `${obj.areaTotal.toLocaleString("ru-RU")} м²` },
    ...(obj.areaMin ? [{ label: "Мин. секция", value: `${obj.areaMin} м²` }] : []),
    ...(obj.floor ? [{ label: "Этаж", value: `${obj.floor}${obj.floorsTotal ? ` / ${obj.floorsTotal}` : ""}` }] : []),
    ...(obj.metro ? [{ label: "Метро", value: `м. ${obj.metro}` }] : []),
    { label: "Стоимость", value: "По запросу" },
  ];

  // Show up to 6 photos, 3 per row
  const photos = obj.photos.slice(0, 6);
  const cols = photos.length <= 2 ? photos.length || 1 : 3;
  const photoH = photos.length <= 1 ? 210 : photos.length === 2 ? 188 : photos.length <= 3 ? 172 : 128;

  return (
    <>
      <PrintTrigger title={`${obj.title} — ${obj.address}`} />

      {/* HEADER — white, clean */}
      <div style={{
        padding: "14px 32px",
        borderBottom: `3px solid ${green}`,
        display: "flex", justifyContent: "space-between", alignItems: "center",
        background: "#fff",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 32, height: 32, background: green, borderRadius: 6,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 20, color: "#fff",
          }}>К</div>
          <div>
            <div style={{ color: navy, fontWeight: 700, fontSize: 13, letterSpacing: ".07em" }}>КОСМО КАПИТАЛ</div>
            <div style={{ color: "#9098a9", fontSize: 9, letterSpacing: ".04em" }}>КОММЕРЧЕСКАЯ НЕДВИЖИМОСТЬ</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: navy, fontWeight: 600, fontSize: 13 }}>+7 (903) 537 44 88</div>
          <div style={{ color: "#9098a9", fontSize: 9 }}>info@cosmocapital.ru · cosmocapital.ru</div>
        </div>
      </div>

      {/* BODY */}
      <div style={{ padding: "18px 32px 0" }}>

        {/* Title block */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 7 }}>
            <span style={{
              background: obj.type === "SALE" ? "#c53030" : green, color: "#fff",
              fontSize: 9, fontWeight: 700, padding: "2px 9px", borderRadius: 3, letterSpacing: ".08em",
            }}>{TYPE_LABELS[obj.type].toUpperCase()}</span>
            <span style={{
              background: "#f0ede6", color: "#6b7080",
              fontSize: 9, fontWeight: 600, padding: "2px 9px", borderRadius: 3, letterSpacing: ".06em",
            }}>{CATEGORY_LABELS[obj.category].toUpperCase()}</span>
          </div>
          <h1 style={{
            fontFamily: "'Cormorant Garamond', serif",
            fontSize: 24, fontWeight: 600, color: navy,
            lineHeight: 1.2, marginBottom: 5,
          }}>{obj.title}</h1>
          <div style={{ fontSize: 11, color: "#6b7080", display: "flex", gap: 14, flexWrap: "wrap" }}>
            <span>📍 {obj.address}</span>
            {obj.metro && <span>🚇 м. {obj.metro}</span>}
          </div>
        </div>

        {/* Photos grid */}
        {photos.length > 0 && (
          <div style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gap: 7,
            marginBottom: 14,
          }}>
            {photos.map((src, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={i} src={src} alt={i === 0 ? obj.title : ""}
                style={{ width: "100%", height: photoH, objectFit: "cover", borderRadius: 5, display: "block" }} />
            ))}
          </div>
        )}

        {/* Two-column: specs | description */}
        <div style={{ display: "grid", gridTemplateColumns: "185px 1fr", gap: 18 }}>

          {/* Specs */}
          <div style={{
            background: "#f7f5f0", borderRadius: 7, padding: "13px 15px",
            border: "1px solid #e4dfd6", alignSelf: "start",
          }}>
            <div style={{
              fontSize: 8, fontWeight: 700, color: navy, letterSpacing: ".12em",
              textTransform: "uppercase", marginBottom: 11, paddingBottom: 8,
              borderBottom: `2px solid ${green}`,
            }}>Параметры</div>
            {specs.map(({ label, value }) => (
              <div key={label} style={{ marginBottom: 9 }}>
                <div style={{ fontSize: 8, color: "#9098a9", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 2 }}>{label}</div>
                <div style={{
                  fontSize: label === "Стоимость" ? 13 : 11,
                  fontWeight: label === "Стоимость" ? 700 : 600,
                  color: label === "Стоимость" ? green : "#1a1f2e",
                }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Description */}
          <div>
            <div style={{
              fontSize: 8, fontWeight: 700, color: navy, letterSpacing: ".12em",
              textTransform: "uppercase", marginBottom: 11, paddingBottom: 8,
              borderBottom: `2px solid ${green}`,
            }}>Описание</div>
            {paragraphs.map((para, i) => (
              <p key={i} style={{
                fontSize: 11, color: "#2a2f3e", lineHeight: 1.78,
                marginBottom: i < paragraphs.length - 1 ? 9 : 0,
              }}>{para}</p>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        background: "#f7f5f0", borderTop: "1px solid #e4dfd6",
        padding: "9px 32px", marginTop: 16,
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <div style={{ fontSize: 10, color: "#9098a9" }}>cosmocapital.ru/catalog/{obj.id}</div>
        <div style={{ display: "flex", gap: 18, fontSize: 10, color: navy, fontWeight: 500 }}>
          <span>+7 (903) 537 44 88</span>
          <span>info@cosmocapital.ru</span>
        </div>
      </div>
    </>
  );
}
