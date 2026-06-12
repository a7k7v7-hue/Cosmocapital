import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireSessionUser } from "@/lib/session";
import { canManageUsers } from "@/lib/roles";

const OLD_PREFIX = "https://cosmocapital.ru/uploads/object/";
const NEW_PREFIX = "/photos/migrated/";

// All original filenames map to lowercase .jpg after compression
function toLocalPath(oldUrl: string): string {
  const fname = decodeURIComponent(oldUrl.split("/").pop() ?? "");
  // Compression script converted everything to .jpg
  const base = fname.replace(/\.[^.]+$/, "") + ".jpg";
  return NEW_PREFIX + base.toLowerCase();
}

export async function POST() {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;
  if (!canManageUsers(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const objects = await prisma.object.findMany({ select: { id: true, photos: true } });
  const toUpdate = objects.filter((o) => o.photos.some((p) => p.includes("cosmocapital.ru")));

  let updated = 0;
  for (const obj of toUpdate) {
    const newPhotos = obj.photos.map((p) =>
      p.includes("cosmocapital.ru") ? toLocalPath(p) : p
    );
    await prisma.object.update({ where: { id: obj.id }, data: { photos: newPhotos } });
    updated++;
  }

  return NextResponse.json({ ok: true, updatedObjects: updated });
}
