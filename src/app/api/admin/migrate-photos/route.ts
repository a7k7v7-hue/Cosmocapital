import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

const OLD_DOMAIN = "cosmocapital.ru";
const CONCURRENCY = 15;
const PHOTO_TIMEOUT_MS = 12000;

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { error: "Supabase не настроен (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)" },
      { status: 503 }
    );
  }

  const supabase = createClient(supabaseUrl, supabaseKey, { auth: { persistSession: false } });

  // Verify bucket exists
  const { data: buckets, error: bucketsErr } = await supabase.storage.listBuckets();
  if (bucketsErr) {
    return NextResponse.json({ error: `Ошибка Storage: ${bucketsErr.message}` }, { status: 503 });
  }
  if (!buckets?.some((b) => b.name === "objects")) {
    return NextResponse.json({
      error: 'Bucket "objects" не создан. Создайте его в Supabase → Storage → New bucket (name: objects, Public: да).',
    }, { status: 503 });
  }

  // Load all objects with old-site photos
  const objects = await prisma.object.findMany({ select: { id: true, photos: true } });
  const toMigrate = objects.filter((o) => o.photos.some((p) => p.includes(OLD_DOMAIN)));

  if (toMigrate.length === 0) {
    return NextResponse.json({ ok: true, message: "Все фото уже перенесены", migrated: 0, errors: 0 });
  }

  // Flat task list
  const tasks = toMigrate.flatMap((o) =>
    o.photos
      .filter((p) => p.includes(OLD_DOMAIN))
      .map((photoUrl) => ({ objectId: o.id, photoUrl }))
  );

  // Per-photo download + upload
  async function migrateOne(objectId: string, photoUrl: string) {
    const res = await fetch(photoUrl, { signal: AbortSignal.timeout(PHOTO_TIMEOUT_MS) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const buffer = await res.arrayBuffer();
    const contentType = res.headers.get("content-type") ?? "image/jpeg";
    const origName = decodeURIComponent(photoUrl.split("/").pop() ?? `photo-${Date.now()}.jpg`);

    const { error } = await supabase.storage
      .from("objects")
      .upload(`migrated/${origName}`, buffer, { contentType, upsert: true });
    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from("objects").getPublicUrl(`migrated/${origName}`);
    return { objectId, oldUrl: photoUrl, newUrl: data.publicUrl, error: null };
  }

  // Process in concurrent batches
  const allResults: { objectId: string; oldUrl: string; newUrl: string | null; error: string | null }[] = [];
  for (let i = 0; i < tasks.length; i += CONCURRENCY) {
    const batch = tasks.slice(i, i + CONCURRENCY);
    const batchResults = await Promise.all(
      batch.map(async ({ objectId, photoUrl }) => {
        try {
          return await migrateOne(objectId, photoUrl);
        } catch (e) {
          return { objectId, oldUrl: photoUrl, newUrl: null, error: (e as Error).message };
        }
      })
    );
    allResults.push(...batchResults);
  }

  // Build old→new URL maps per object
  const newUrlMap = new Map<string, Map<string, string>>();
  for (const r of allResults) {
    if (!newUrlMap.has(r.objectId)) newUrlMap.set(r.objectId, new Map());
    if (r.newUrl) newUrlMap.get(r.objectId)!.set(r.oldUrl, r.newUrl);
  }

  // Update DB
  let dbUpdated = 0;
  for (const obj of toMigrate) {
    const urlMap = newUrlMap.get(obj.id);
    if (!urlMap || urlMap.size === 0) continue;
    const newPhotos = obj.photos.map((p) => urlMap.get(p) ?? p);
    await prisma.object.update({ where: { id: obj.id }, data: { photos: newPhotos } });
    dbUpdated++;
  }

  const succeeded = allResults.filter((r) => r.newUrl !== null).length;
  const failed = allResults.filter((r) => r.error !== null).length;

  return NextResponse.json({
    ok: true,
    totalPhotos: tasks.length,
    migrated: succeeded,
    errors: failed,
    dbUpdated,
    errorDetails: allResults.filter((r) => r.error).map((r) => `${r.oldUrl}: ${r.error}`),
  });
}
