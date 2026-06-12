import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { requireSessionUser } from "@/lib/session";
import { canEdit } from "@/lib/roles";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;
  if (!canEdit(user.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    return NextResponse.json({ error: "Storage not configured" }, { status: 503 });
  }

  const form = await req.formData().catch(() => null);
  const file = form?.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (!ALLOWED.includes(file.type)) {
    return NextResponse.json({ error: "Только JPEG, PNG, WebP" }, { status: 415 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Файл больше 10 МБ" }, { status: 413 });
  }

  const supabase = createClient(url, key);
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `objects/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const { error } = await supabase.storage
    .from("objects")
    .upload(path, await file.arrayBuffer(), { contentType: file.type });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const { data } = supabase.storage.from("objects").getPublicUrl(path);
  return NextResponse.json({ url: data.publicUrl }, { status: 201 });
}
