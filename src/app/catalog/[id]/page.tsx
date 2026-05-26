import { notFound } from "next/navigation";
import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import PhotoGallery from "@/components/PhotoGallery";
import LeadForm from "@/components/LeadForm";
import { TYPE_LABELS, CATEGORY_LABELS } from "@/types/objects";

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

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const obj = await getObject(id);
  if (!obj) return { title: "Объект не найден" };
  return {
    title: `${obj.title}`,
    description: obj.description.slice(0, 160),
    openGraph: {
      title: obj.title,
      description: obj.description.slice(0, 160),
      images: obj.photos[0] ? [obj.photos[0]] : [],
    },
  };
}

export default async function ObjectPage({ params }: PageProps) {
  const { id } = await params;
  const obj = await getObject(id);
  if (!obj) notFound();

  const specs = [
    { label: "Тип сделки", value: TYPE_LABELS[obj.type] },
    { label: "Категория", value: CATEGORY_LABELS[obj.category] },
    { label: "Адрес", value: obj.address },
    obj.metro ? { label: "Метро", value: obj.metro } : null,
    { label: "Общая площадь", value: `${obj.areaTotal} м²` },
    obj.areaMin ? { label: "Минимальная секция", value: `${obj.areaMin} м²` } : null,
    obj.floor ? { label: "Этаж", value: `${obj.floor}${obj.floorsTotal ? ` из ${obj.floorsTotal}` : ""}` } : null,
    { label: obj.type === "RENT" ? "Стоимость аренды" : "Цена", value: "По запросу" },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div style={{ paddingTop: 68, minHeight: "100vh", background: "var(--bg)" }}>
      <div className="rg-section-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px" }}>
        <a href="/catalog" style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontSize: 13, color: "var(--muted)", marginBottom: 24,
          transition: "var(--trans)",
        }}>← Назад к каталогу</a>

        <div className="rg-object-grid" style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <PhotoGallery photos={obj.photos} title={obj.title} />

            <div style={{ background: "var(--surface)", borderRadius: 12, padding: 24, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                <span style={{
                  background: obj.type === "SALE" ? "#c53030" : "var(--accent)", color: "#fff",
                  fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 4,
                }}>{TYPE_LABELS[obj.type]}</span>
                <span style={{
                  background: "var(--surface2)", color: "var(--muted)",
                  fontSize: 11, fontWeight: 500, padding: "3px 9px", borderRadius: 4,
                  border: "1px solid var(--border)",
                }}>{CATEGORY_LABELS[obj.category]}</span>
              </div>
              <h1 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 32, fontWeight: 400, color: "var(--dark)", marginBottom: 16, lineHeight: 1.2 }}>
                {obj.title}
              </h1>
              <div style={{ color: "var(--muted)", lineHeight: 1.85, fontSize: 14 }}>
                {obj.description.split("\n\n").filter(Boolean).map((para, i) => (
                  <p key={i} style={{ marginBottom: 12 }}>
                    {para.split("\n").map((line, j) => (
                      <span key={j}>
                        {j > 0 && <br />}
                        {line}
                      </span>
                    ))}
                  </p>
                ))}
              </div>
            </div>

            <div style={{ background: "var(--surface)", borderRadius: 12, padding: 24, border: "1px solid var(--border)" }}>
              <h2 style={{ fontSize: 16, fontWeight: 600, color: "var(--dark)", marginBottom: 16 }}>Характеристики</h2>
              <dl style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                {specs.map(({ label, value }) => (
                  <div key={label}>
                    <dt style={{ fontSize: 11, color: "var(--muted)", textTransform: "uppercase", letterSpacing: ".08em" }}>{label}</dt>
                    <dd style={{ fontSize: 14, fontWeight: 500, color: "var(--dark)", marginTop: 2 }}>{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>

          <div>
            <div style={{
              background: "var(--surface)", borderRadius: 12, padding: 24,
              border: "1px solid var(--border)", position: "sticky", top: 84,
            }}>
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 28, fontWeight: 600, color: "var(--dark)" }}>
                  По запросу
                </div>
              </div>

              <LeadForm objectId={obj.id} source="object_page" />

              <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid var(--border)", display: "flex", flexDirection: "column", gap: 10, alignItems: "center" }}>
                <a href="tel:+79035374488" style={{ color: "var(--accent)", fontWeight: 600, fontSize: 14 }}>
                  +7 (903) 537-44-88
                </a>
                <a
                  href={`/catalog/${obj.id}/print`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    border: "1px solid var(--border)", borderRadius: 6, padding: "7px 14px",
                    fontSize: 12, color: "var(--muted)", textDecoration: "none",
                    transition: "var(--trans)",
                  }}
                >
                  📄 Скачать PDF
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
