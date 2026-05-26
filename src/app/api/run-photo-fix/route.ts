import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TOKEN = "photo-fix-2026";
const NEW_PREFIX = "/photos/migrated/";

function toLocalPath(oldUrl: string): string {
  const fname = decodeURIComponent(oldUrl.split("/").pop() ?? "");
  const base = fname.replace(/\.[^.]+$/, "") + ".jpg";
  return NEW_PREFIX + base.toLowerCase();
}

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("token") !== TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const objects = await prisma.object.findMany({ select: { id: true, photos: true } });
  const toUpdate = objects.filter((o) => o.photos.some((p) => p.includes("cosmocapital.ru")));

  let updated = 0;
  const sample: string[] = [];
  for (const obj of toUpdate) {
    const newPhotos = obj.photos.map((p) =>
      p.includes("cosmocapital.ru") ? toLocalPath(p) : p
    );
    if (updated === 0) sample.push(...newPhotos.slice(0, 2));
    await prisma.object.update({ where: { id: obj.id }, data: { photos: newPhotos } });
    updated++;
  }

  return NextResponse.json({ ok: true, updatedObjects: updated, sampleUrls: sample });
}
