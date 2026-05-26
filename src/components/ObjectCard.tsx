"use client";

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

const CATEGORY_PLACEHOLDERS: Record<string, { bg: string; icon: string }> = {
  OFFICE: {
    bg: "linear-gradient(135deg, #0e2a5e 0%, #1a4080 100%)",
    icon: `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="40" height="40" rx="4" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
      <rect x="14" y="16" width="8" height="6" rx="1" fill="rgba(255,255,255,0.5)"/>
      <rect x="24" y="16" width="8" height="6" rx="1" fill="rgba(255,255,255,0.5)"/>
      <rect x="34" y="16" width="8" height="6" rx="1" fill="rgba(255,255,255,0.5)"/>
      <rect x="14" y="26" width="8" height="6" rx="1" fill="rgba(255,255,255,0.5)"/>
      <rect x="24" y="26" width="8" height="6" rx="1" fill="rgba(255,255,255,0.5)"/>
      <rect x="34" y="26" width="8" height="6" rx="1" fill="rgba(255,255,255,0.5)"/>
      <rect x="22" y="36" width="12" height="12" rx="1" fill="rgba(255,255,255,0.6)"/>
    </svg>`,
  },
  RETAIL: {
    bg: "linear-gradient(135deg, #4a1942 0%, #7b3a6e 100%)",
    icon: `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 22L14 10H42L46 22" stroke="rgba(255,255,255,0.5)" stroke-width="2" stroke-linejoin="round"/>
      <rect x="10" y="22" width="36" height="24" rx="2" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
      <rect x="20" y="32" width="16" height="14" rx="1" fill="rgba(255,255,255,0.5)"/>
      <path d="M10 22H46" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
      <circle cx="20" cy="22" r="4" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
      <circle cx="36" cy="22" r="4" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
    </svg>`,
  },
  WAREHOUSE: {
    bg: "linear-gradient(135deg, #2d4a2d 0%, #4a7a3a 100%)",
    icon: `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 28L28 14L50 28V48H6V28Z" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linejoin="round"/>
      <rect x="18" y="34" width="20" height="14" rx="1" fill="rgba(255,255,255,0.4)"/>
      <path d="M28 14V48" stroke="rgba(255,255,255,0.3)" stroke-width="1.5"/>
      <rect x="10" y="34" width="6" height="8" rx="1" fill="rgba(255,255,255,0.4)"/>
      <rect x="40" y="34" width="6" height="8" rx="1" fill="rgba(255,255,255,0.4)"/>
    </svg>`,
  },
  FREE_PURPOSE: {
    bg: "linear-gradient(135deg, #1a4a5e 0%, #2a7a8e 100%)",
    icon: `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="8" y="8" width="18" height="18" rx="2" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
      <rect x="30" y="8" width="18" height="18" rx="2" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
      <rect x="8" y="30" width="18" height="18" rx="2" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
      <rect x="30" y="30" width="18" height="18" rx="2" stroke="rgba(255,255,255,0.5)" stroke-width="2"/>
    </svg>`,
  },
  PRODUCTION: {
    bg: "linear-gradient(135deg, #3a2a14 0%, #6b4e1a 100%)",
    icon: `<svg width="56" height="56" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="6" y="30" width="44" height="18" rx="2" stroke="rgba(255,255,255,0.4)" stroke-width="2"/>
      <path d="M6 30L14 16H24V30" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linejoin="round"/>
      <path d="M24 30V16L34 30" stroke="rgba(255,255,255,0.4)" stroke-width="2" stroke-linejoin="round"/>
      <rect x="10" y="36" width="8" height="6" rx="1" fill="rgba(255,255,255,0.5)"/>
      <rect x="24" y="36" width="8" height="6" rx="1" fill="rgba(255,255,255,0.5)"/>
      <rect x="38" y="36" width="8" height="6" rx="1" fill="rgba(255,255,255,0.5)"/>
      <rect x="36" y="10" width="8" height="20" rx="2" fill="rgba(255,255,255,0.3)"/>
      <rect x="44" y="18" width="6" height="4" rx="1" fill="rgba(255,255,255,0.3)"/>
    </svg>`,
  },
};

export default function ObjectCard({ obj }: { obj: ObjectListItem }) {
  const photo = obj.photos[0] ?? null;
  const placeholder = CATEGORY_PLACEHOLDERS[obj.category] ?? CATEGORY_PLACEHOLDERS.OFFICE;

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
      <div style={{ height: 160, position: "relative", overflow: "hidden" }}>
        {photo ? (
          <Image
            src={photo} alt={obj.title} fill
            className="object-cover"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            background: placeholder.bg,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
            dangerouslySetInnerHTML={{ __html: placeholder.icon }}
          />
        )}
        <span style={{
          position: "absolute", top: 10, left: 10,
          background: TYPE_COLORS[obj.type] ?? "var(--accent)", color: "#fff",
          fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 4,
        }}>{TYPE_LABELS[obj.type]}</span>
        <span style={{
          position: "absolute", top: 10, right: 10,
          fontSize: 11, fontWeight: 500, color: photo ? "#fff" : "rgba(255,255,255,.8)",
          background: photo ? "rgba(0,0,0,.35)" : "rgba(255,255,255,.15)",
          backdropFilter: "blur(4px)",
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
