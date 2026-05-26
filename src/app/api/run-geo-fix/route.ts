import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TOKEN = "geo-fix-2026";

// Coordinates from old cosmocapital.ru site (data-num → data-pos)
const OLD_COORDS: Record<number, [number, number]> = {
  91: [55.726796, 37.57024],
  90: [55.750145, 37.648259],
  85: [55.837692, 37.635611],
  80: [55.811282601574476, 37.62497220104898],
  79: [55.62917963919204, 37.520810433995166],
  92: [55.707172, 37.610287],
  61: [56.494969, 38.184122],
  60: [56.053794, 37.856308],
  81: [55.753174, 37.525405],
  52: [44.592619, 34.371058],
  35: [55.76203, 37.631319],
  86: [55.837692, 37.635611],
  101: [55.756579, 37.597387],
  103: [56.41648, 38.176531],
  104: [55.64887, 37.562245],
  107: [55.660318, 37.617527],
  98: [55.646365, 37.636239],
  97: [55.849797, 37.627121],
  99: [55.75282, 37.652957],
  34: [51.660228, 39.199225],
  95: [56.39304444375417, 38.287145783019525],
  94: [55.708364, 37.410978],
  22: [56.091957, 37.354015],
  100: [55.81168, 37.489464],
  108: [55.843596, 37.200431],
  41: [55.513269, 37.788759],
  21: [55.324097, 37.540399],
  25: [55.337031, 37.841571],
  31: [55.337732, 37.595853],
  32: [55.334944, 37.671349],
  36: [55.125248, 37.549936],
  40: [55.659672, 37.401559],
  42: [55.47498, 37.728486],
  54: [51.80394, 39.21483],
  75: [55.84421000314859, 37.59822872099897],
  76: [55.859266, 37.585583],
  82: [55.676255, 37.51953],
  27: [55.758539, 37.624942],
  24: [55.712607, 37.645702],
  96: [55.760054, 37.588188],
  84: [55.768699, 37.614015],
  93: [55.761396, 37.552669],
  89: [55.767398, 37.604574],
  106: [55.830988, 37.65037],
  88: [55.759618, 37.591647],
};

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("token") !== TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const objects = await prisma.object.findMany({ select: { id: true, photos: true, lat: true, lng: true } });

  let updated = 0;
  const skipped: number[] = [];

  for (const obj of objects) {
    // Extract old site ID from first photo filename: "/photos/migrated/22_abc123.jpg" → 22
    const firstPhoto = obj.photos[0] ?? "";
    const fname = firstPhoto.split("/").pop() ?? "";
    const oldId = parseInt(fname.split("_")[0], 10);

    if (isNaN(oldId) || !OLD_COORDS[oldId]) {
      skipped.push(oldId);
      continue;
    }

    const [lat, lng] = OLD_COORDS[oldId];
    await prisma.object.update({ where: { id: obj.id }, data: { lat, lng } });
    updated++;
  }

  return NextResponse.json({ ok: true, updated, skipped });
}
