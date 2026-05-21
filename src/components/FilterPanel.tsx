"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import { ObjectCategory, ObjectType, CATEGORY_LABELS, TYPE_LABELS } from "@/types/objects";

const TYPES: ObjectType[] = ["RENT", "SALE"];
const CATEGORIES: ObjectCategory[] = [
  "OFFICE",
  "RETAIL",
  "WAREHOUSE",
  "FREE_PURPOSE",
  "PRODUCTION",
];

export default function FilterPanel() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const update = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const get = (key: string) => searchParams.get(key) ?? "";

  const activeBtn: React.CSSProperties = { background: "var(--accent)", color: "#fff", border: "1px solid var(--accent)" };
  const inactiveBtn: React.CSSProperties = { background: "var(--surface2)", color: "var(--muted)", border: "1px solid var(--border)" };
  const activeCat: React.CSSProperties = { background: "rgba(45,125,70,.08)", color: "var(--accent)", fontWeight: 600 };
  const inactiveCat: React.CSSProperties = { color: "var(--text)" };
  const inputStyle: React.CSSProperties = {
    width: "100%", border: "1.5px solid var(--border)", borderRadius: "var(--r)",
    padding: "8px 12px", fontSize: 13, outline: "none",
    background: "var(--surface)", color: "var(--text)", fontFamily: "inherit",
  };
  const labelStyle: React.CSSProperties = {
    fontSize: 11, fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase",
    color: "var(--muted)", marginBottom: 8, display: "block",
  };
  const btnBase: React.CSSProperties = {
    padding: "6px 14px", borderRadius: 20, fontSize: 13, fontWeight: 500,
    cursor: "pointer", transition: "var(--trans)",
  };
  const catBase: React.CSSProperties = {
    textAlign: "left", padding: "8px 12px", borderRadius: "var(--r)",
    fontSize: 13, cursor: "pointer", width: "100%", border: "none",
    background: "transparent", transition: "var(--trans)", fontFamily: "inherit",
  };

  return (
    <aside style={{ width: 240, flexShrink: 0, display: "flex", flexDirection: "column", gap: 24 }}>
      <div>
        <span style={labelStyle}>Тип сделки</span>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button onClick={() => update("type", "")} style={{ ...btnBase, ...(!get("type") ? activeBtn : inactiveBtn) }}>Все</button>
          {TYPES.map((t) => (
            <button key={t} onClick={() => update("type", get("type") === t ? "" : t)}
              style={{ ...btnBase, ...(get("type") === t ? activeBtn : inactiveBtn) }}>
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span style={labelStyle}>Категория</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <button onClick={() => update("category", "")} style={{ ...catBase, ...(!get("category") ? activeCat : inactiveCat) }}>
            Все категории
          </button>
          {CATEGORIES.map((c) => (
            <button key={c} onClick={() => update("category", get("category") === c ? "" : c)}
              style={{ ...catBase, ...(get("category") === c ? activeCat : inactiveCat) }}>
              {CATEGORY_LABELS[c]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <span style={labelStyle}>Площадь, м²</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="number" placeholder="от" defaultValue={get("areaMin")}
            onBlur={(e) => update("areaMin", e.target.value)} style={inputStyle} />
          <span style={{ color: "var(--muted)", flexShrink: 0 }}>-</span>
          <input type="number" placeholder="до" defaultValue={get("areaMax")}
            onBlur={(e) => update("areaMax", e.target.value)} style={inputStyle} />
        </div>
      </div>

      <div>
        <span style={labelStyle}>Цена, ₽</span>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="number" placeholder="от" defaultValue={get("priceMin")}
            onBlur={(e) => update("priceMin", e.target.value)} style={inputStyle} />
          <span style={{ color: "var(--muted)", flexShrink: 0 }}>-</span>
          <input type="number" placeholder="до" defaultValue={get("priceMax")}
            onBlur={(e) => update("priceMax", e.target.value)} style={inputStyle} />
        </div>
      </div>

      <button onClick={() => router.push(pathname)} style={{
        fontSize: 13, color: "var(--muted)", cursor: "pointer",
        background: "none", border: "none", textAlign: "left", fontFamily: "inherit",
        transition: "var(--trans)",
      }}>Сбросить фильтры</button>
    </aside>
  );
}
