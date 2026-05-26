import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const TOKEN = "desc-fix-2026";

function decodeHtml(raw: string): string {
  return raw
    // Convert block tags to newlines first
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/li>/gi, "\n")
    .replace(/<li[^>]*>/gi, "• ")
    .replace(/<\/?(ul|ol|h[1-6]|div|section|header)[^>]*>/gi, "\n")
    // Strip remaining HTML tags
    .replace(/<[^>]+>/g, "")
    // Decode common HTML entities
    .replace(/&ndash;/gi, "–")
    .replace(/&mdash;/gi, "—")
    .replace(/&laquo;/gi, "«")
    .replace(/&raquo;/gi, "»")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#8211;/g, "–")
    .replace(/&#8212;/g, "—")
    .replace(/&#171;/g, "«")
    .replace(/&#187;/g, "»")
    .replace(/&#160;/g, " ")
    .replace(/&#38;/g, "&")
    // Collapse 3+ newlines to 2
    .replace(/\n{3,}/g, "\n\n")
    // Trim
    .trim();
}

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("token") !== TOKEN) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const objects = await prisma.object.findMany({ select: { id: true, description: true } });

  let updated = 0;
  const samples: { before: string; after: string }[] = [];

  for (const obj of objects) {
    const cleaned = decodeHtml(obj.description);
    if (cleaned !== obj.description) {
      if (samples.length < 2) {
        samples.push({ before: obj.description.slice(0, 120), after: cleaned.slice(0, 120) });
      }
      await prisma.object.update({ where: { id: obj.id }, data: { description: cleaned } });
      updated++;
    }
  }

  // Show raw excerpt of first object for diagnosis
  const raw = objects[0]?.description?.slice(0, 300) ?? "";
  return NextResponse.json({ ok: true, total: objects.length, updated, samples, rawSample: raw });
}
