import { PrismaClient } from "../src/generated/prisma";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const OUTPUT_PATH = join(__dirname, "..", "..", "otsenka-nedvizhimosti", "data", "deals.csv");

const COLUMNS = [
  "id", "brokerName", "segment", "dealType", "clientName", "areaSqm",
  "stage", "expectedGci", "isLost", "isClosed",
] as const;

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  const deals = await prisma.deal.findMany({
    where: { isLost: false, isClosed: false, areaSqm: { not: null } },
    select: Object.fromEntries(COLUMNS.map((c) => [c, true])),
  });

  const lines = [COLUMNS.join(",")];
  for (const d of deals) {
    lines.push(COLUMNS.map((c) => csvCell((d as Record<string, unknown>)[c])).join(","));
  }

  mkdirSync(join(__dirname, "..", "..", "otsenka-nedvizhimosti", "data"), { recursive: true });
  writeFileSync(OUTPUT_PATH, lines.join("\n"), "utf-8");

  console.log(`Экспортировано сделок (активных, с площадью): ${deals.length}`);
  console.log(`Сохранено: ${OUTPUT_PATH}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
