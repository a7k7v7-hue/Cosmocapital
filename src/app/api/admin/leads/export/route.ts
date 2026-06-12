import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/session";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const user = await requireSessionUser();
  if (user instanceof NextResponse) return user;

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
