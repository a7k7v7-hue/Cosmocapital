import dynamic from "next/dynamic";
import { prisma } from "@/lib/prisma";
import Header from "@/components/Header";

const MapClient = dynamic(() => import("@/components/MapClient"), { ssr: false });

export const metadata = { title: "Карта объектов — Космо Капитал" };

export default async function MapPage() {
  const raw = await prisma.object.findMany({
    where: { status: "ACTIVE", lat: { not: null }, lng: { not: null } },
    select: {
      id: true,
      title: true,
      address: true,
      type: true,
      category: true,
      areaTotal: true,
      price: true,
      photos: true,
      lat: true,
      lng: true,
    },
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  const objects = raw.map((o) => ({ ...o, lat: o.lat!, lng: o.lng! }));

  return (
    <>
      <Header />
      <div style={{ paddingTop: 68, height: "100dvh", display: "flex", flexDirection: "column" }}>
        {/* Title bar */}
        <div style={{
          background: "var(--surface)",
          borderBottom: "1px solid var(--border)",
          padding: "12px 40px",
          display: "flex",
          alignItems: "center",
          gap: 16,
        }}>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--dark)", margin: 0 }}>
            Карта объектов
          </h1>
          <span style={{
            background: "var(--dark)", color: "#fff",
            fontSize: 11, fontWeight: 600, padding: "2px 8px", borderRadius: 20,
          }}>
            {objects.length}
          </span>
          <a href="/catalog" style={{ marginLeft: "auto", fontSize: 13, color: "var(--muted)" }}>
            ← Каталог
          </a>
        </div>

        {/* Map fills the rest */}
        <div style={{ flex: 1, position: "relative" }}>
          <MapClient objects={objects} />
        </div>
      </div>
    </>
  );
}
