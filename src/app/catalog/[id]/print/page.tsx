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

  const description = cleanDescription(obj.description).slice(0, 700);

  const specs: { label: string; value: string }[] = [
    { label: "Тип", value: TYPE_LABELS[obj.type] },
    { label: "Категория", value: CATEGORY_LABELS[obj.category] },
    { label: "Площадь", value: `${obj.areaTotal.toLocaleString("ru-RU")} м²` },
    ...(obj.areaMin ? [{ label: "Мин. секция", value: `${obj.areaMin} м²` }] : []),
    ...(obj.floor ? [{ label: "Этаж", value: `${obj.floor}${obj.floorsTotal ? ` / ${obj.floorsTotal}` : ""}` }] : []),
    ...(obj.metro ? [{ label: "Метро", value: `м. ${obj.metro}` }] : []),
    { label: "Стоимость", value: "По запросу" },
  ];

  const [photo1, photo2] = obj.photos;

  return (
    <>
      <PrintTrigger title={obj.title} />

      {/* HEADER */}
      <div style={{
        background: navy, height: 52,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 32px",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 30, height: 30, background: green, borderRadius: 5,
            display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Cormorant Garamond', serif", fontWeight: 700, fontSize: 18, color: "#fff",
          }}>К</div>
          <div>
            <div style={{ color: "#fff", fontWeight: 600, fontSize: 13, letterSpacing: ".07em" }}>КОСМО КАПИТАЛ</div>
            <div style={{ color: "rgba(255,255,255,.5)", fontSize: 9, letterSpacing: ".05em" }}>КОММЕРЧЕСКАЯ НЕДВИЖИМОСТЬ</div>
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>+7 (903) 537 44 88</div>
          <div style={{ color: "rgba(255,255,255,.5)", fontSize: 9 }}>info@cosmocapital.ru · cosmocapital.ru</div>
        </div>
      </div>

      {/* ACCENT LINE */}
      <div style={{ height: 3, background: green }} />

      {/* BODY */}
      <div style={{ padding: "22px 32px 0", flex: 1 }}>

        {/* Title block */}
        <div style={{ marginBottom: 16 }}>
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

        {/* Two-column main content */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: 20 }}>

          {/* LEFT: photos + description */}
          <div>
            {/* Photos */}
            {photo1 && (
              <div style={{ display: "grid", gridTemplateColumns: photo2 ? "1fr 1fr" : "1fr", gap: 8, marginBottom: 16 }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={photo1} alt={obj.title}
                  style={{ width: "100%", height: 190, objectFit: "cover", borderRadius: 6, display: "block" }} />
                {photo2 && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo2} alt=""
                    style={{ width: "100%", height: 190, objectFit: "cover", borderRadius: 6, display: "block" }} />
                )}
              </div>
            )}

            {/* Description */}
            <div>
              <div style={{
                fontSize: 8, fontWeight: 700, color: navy, letterSpacing: ".12em",
                textTransform: "uppercase", marginBottom: 8, paddingBottom: 7,
                borderBottom: `2px solid ${green}`,
              }}>Описание</div>
              <div style={{ fontSize: 11, color: "#2a2f3e", lineHeight: 1.75, whiteSpace: "pre-line" }}>
                {description}
              </div>
            </div>
          </div>

          {/* RIGHT: specs */}
          <div style={{ background: "#f7f5f0", borderRadius: 8, padding: "16px 16px", border: "1px solid #e4dfd6", alignSelf: "start" }}>
            <div style={{
              fontSize: 8, fontWeight: 700, color: navy, letterSpacing: ".12em",
              textTransform: "uppercase", marginBottom: 12, paddingBottom: 8,
              borderBottom: `2px solid ${green}`,
            }}>Параметры</div>
            {specs.map(({ label, value }) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 8, color: "#9098a9", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 2 }}>{label}</div>
                <div style={{
                  fontSize: label === "Стоимость" ? 13 : 11,
                  fontWeight: label === "Стоимость" ? 700 : 600,
                  color: label === "Стоимость" ? green : "#1a1f2e",
                }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{
        background: "#f7f5f0", borderTop: "1px solid #e4dfd6",
        padding: "10px 32px", marginTop: 20,
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
