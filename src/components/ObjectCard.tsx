import Link from "next/link";
import Image from "next/image";
import { ObjectListItem, TYPE_LABELS, CATEGORY_LABELS } from "@/types/objects";

function formatPrice(type: ObjectListItem["type"], price: number): string {
  const formatted = new Intl.NumberFormat("ru-RU").format(price);
  return type === "RENT" ? `${formatted} ₽/мес` : `${formatted} ₽`;
}

function formatArea(total: number, min: number | null): string {
  if (min && min < total) return `от ${min} до ${total} м²`;
  return `${total} м²`;
}

const TYPE_COLORS: Record<string, string> = {
  SALE: "#c53030",
  RENT: "var(--accent)",
};

export default function ObjectCard({ obj }: { obj: ObjectListItem }) {
  const photo = obj.photos[0] ?? null;

  return (
    <Link href={`/catalog/${obj.id}`} style={{
      display: "flex", flexDirection: "column",
      background: "var(--surface)", border: "1px solid var(--border)",
      borderRadius: 10, overflow: "hidden", cursor: "pointer",
      transition: "var(--trans)", textDecoration: "none", color: "inherit",
    }}
    onMouseEnter={e => {
      (e.currentTarget as HTMLElement).style.transform = "translateY(-2px)";
      (e.currentTarget as HTMLElement).style.boxShadow = "var(--shadow)";
    }}
    onMouseLeave={e => {
      (e.currentTarget as HTMLElement).style.transform = "none";
      (e.currentTarget as HTMLElement).style.boxShadow = "none";
    }}>
      <div style={{ height: 160, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", background: "var(--surface2)" }}>
        {photo ? (
          <Image
            src={photo} alt={obj.title} fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <span style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 32, color: "var(--border)", fontWeight: 600, letterSpacing: 2 }}>
            {Math.round(obj.areaTotal).toLocaleString("ru-RU")}
          </span>
        )}
        <span style={{
          position: "absolute", top: 10, left: 10,
          background: TYPE_COLORS[obj.type] ?? "var(--accent)", color: "#fff",
          fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 4,
        }}>{TYPE_LABELS[obj.type]}</span>
        <span style={{
          position: "absolute", top: 10, right: 10,
          fontSize: 11, fontWeight: 500, color: "var(--muted)",
          background: "var(--surface)", border: "1px solid var(--border)",
          padding: "3px 9px", borderRadius: 4,
        }}>{CATEGORY_LABELS[obj.category]}</span>
      </div>

      <div style={{ padding: 16 }}>
        <div style={{ fontSize: 11, color: "var(--accent)", fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginBottom: 4 }}>
          {CATEGORY_LABELS[obj.category]}
        </div>
        <div style={{ fontSize: 14, fontWeight: 500, color: "var(--dark)", marginBottom: 8, lineHeight: 1.3 }}>
          {obj.title}
        </div>
        {(obj.metro ?? obj.address) && (
          <div style={{ fontSize: 12, color: "var(--muted)", marginBottom: 8 }}>
            📍 {obj.metro ?? obj.address}
          </div>
        )}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingTop: 8, borderTop: "1px solid var(--border)" }}>
          <span style={{ fontSize: 12, color: "var(--muted)" }}>{formatArea(obj.areaTotal, obj.areaMin)}</span>
          <span style={{ fontSize: 13, color: "var(--accent)", fontWeight: 600 }}>
            {obj.price > 0 ? formatPrice(obj.type, obj.price) : "По запросу"}
          </span>
        </div>
      </div>
    </Link>
  );
}
