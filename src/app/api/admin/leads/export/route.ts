import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const leads = await prisma.lead.findMany({
    orderBy: { createdAt: "desc" },
    include: { object: { select: { title: true, address: true } } },
  });

  const header = ["ID", "Имя", "Телефон", "Email", "Сообщение", "Объект", "Адрес объекта", "Источник", "Статус", "Заметки", "Дата"];
  const rows = leads.map((l) => [
    l.id,
    l.name,
    l.phone,
    l.email ?? "",
    l.message?.replace(/\n/g, " ") ?? "",
    l.object?.title ?? "",
    l.object?.address ?? "",
    l.source,
    l.status,
    l.notes?.replace(/\n/g, " ") ?? "",
    new Date(l.createdAt).toLocaleString("ru-RU"),
  ]);

  const csv = [header, ...rows]
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    .join("\r\n");

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-${date}.csv"`,
    },
  });
}
