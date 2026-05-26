import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ObjectCard from "@/components/ObjectCard";
import { ObjectListItem } from "@/types/objects";

async function getFeatured(): Promise<ObjectListItem[]> {
  try {
    const items = await prisma.object.findMany({
      where: { status: "ACTIVE", featured: true },
      orderBy: { createdAt: "desc" },
      take: 6,
      select: {
        id: true, type: true, category: true, title: true,
        address: true, metro: true, areaTotal: true, areaMin: true,
        price: true, pricePerSqm: true, photos: true, featured: true,
      },
    });
    return items as ObjectListItem[];
  } catch {
    return [];
  }
}

export default async function FeaturedObjects() {
  const items = await getFeatured();

  if (items.length === 0) return null;

  return (
    <section className="rg-section-pad" style={{ maxWidth: 1280, margin: "0 auto", padding: "80px 40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 40, flexWrap: "wrap", gap: 16 }}>
        <div>
          <p style={{ color: "var(--accent)", fontSize: 12, fontWeight: 600, letterSpacing: ".15em", textTransform: "uppercase", marginBottom: 8 }}>
            Спецпредложения
          </p>
          <h2 style={{ fontFamily: "var(--font-cormorant, serif)", fontSize: 40, fontWeight: 400, color: "var(--dark)" }}>
            Актуальные объекты
          </h2>
        </div>
        <Link href="/catalog" style={{
          background: "var(--accent)", color: "#fff", padding: "10px 22px",
          borderRadius: "var(--r)", fontSize: 13, fontWeight: 600, letterSpacing: ".02em",
        }}>Весь каталог →</Link>
      </div>

      <div className="rg-3" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 20 }}>
        {items.map((obj) => (
          <ObjectCard key={obj.id} obj={obj} />
        ))}
      </div>
    </section>
  );
}
