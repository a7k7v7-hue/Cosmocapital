import { PrismaClient } from "../src/generated/prisma";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

const OUTPUT_PATH = join(__dirname, "..", "..", "otsenka-nedvizhimosti", "data", "objects.csv");

const COLUMNS = [
  "id", "type", "category", "areaTotal", "areaMin", "floor", "floorsTotal",
  "price", "pricePerSqm", "lat", "lng", "landCategory", "status",
] as const;

function csvCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const s = String(value);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

async function main() {
  const objects = await prisma.object.findMany({
    where: { status: "ACTIVE" },
    select: Object.fromEntries(COLUMNS.map((c) => [c, true])),
  });

  const lines = [COLUMNS.join(",")];
  for (const obj of objects) {
    lines.push(COLUMNS.map((c) => csvCell((obj as Record<string, unknown>)[c])).join(","));
  }

  mkdirSync(join(__dirname, "..", "..", "otsenka-nedvizhimosti", "data"), { recursive: true });
  writeFileSync(OUTPUT_PATH, lines.join("\n"), "utf-8");

  console.log(`Экспортировано объектов: ${objects.length}`);
  console.log(`Сохранено: ${OUTPUT_PATH}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
