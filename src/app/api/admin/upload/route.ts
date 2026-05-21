import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { createClient } from "@supabase/supabase-js";

const MAX_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED = ["image/jpeg", "image/png", "image/webp"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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
