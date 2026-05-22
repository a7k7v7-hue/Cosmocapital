import { PrismaClient, ObjectType, ObjectCategory } from "../src/generated/prisma";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

function decodeHtml(s: string): string {
  return s
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim();
}

function extractTitle(description: string): string {
  const pipeIdx = description.indexOf(" | ");
  const raw = pipeIdx !== -1 ? description.slice(0, pipeIdx) : description;
  return decodeHtml(raw) || "Без названия";
}

function detectType(description: string): ObjectType {
  const lower = description.toLowerCase();
  if (lower.includes("аренда") && !lower.includes("продажа")) return ObjectType.RENT;
  return ObjectType.SALE;
}

function detectCategory(legacyType: string, description: string): ObjectCategory {
  const lower = description.toLowerCase();
  if (lower.includes("производственн")) return ObjectCategory.PRODUCTION;
  if (lower.includes("склад")) return ObjectCategory.WAREHOUSE;
  if (
    lower.includes("офис") ||
    (lower.includes("административн") && !lower.includes("округ"))
  )
    return ObjectCategory.OFFICE;
  if (
    lower.includes("магазин") ||
    lower.includes("автосалон") ||
    lower.includes("автомойк") ||
    lower.includes("пятерочк") ||
    lower.includes("дикси")
  )
    return ObjectCategory.RETAIL;
  return ObjectCategory.FREE_PURPOSE;
}

async function main() {
  const clearMode = process.argv.includes("--clear");
  const dataPath = path.resolve(__dirname, "../../agent1/crm-data.json");

  if (!fs.existsSync(dataPath)) {
    console.error("crm-data.json не найден:", dataPath);
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as {
    Objects: string[][];
  };
  const rows = data.Objects;

  if (clearMode) {
    const deleted = await prisma.object.deleteMany({});
    console.log(`Удалено ${deleted.count} объектов перед миграцией`);
  }

  let created = 0;
  let errors = 0;

  for (const row of rows) {
    const [, , legacyType, address, area, price, , , , description] = row;

    const title = extractTitle(description);
    const type = detectType(description);
    const category = detectCategory(legacyType, description);
    const areaTotal = parseFloat(area) || 0;
    const priceValue = parseFloat(price) || 0;

    try {
      await prisma.object.create({
        data: {
          type,
          category,
          title,
          description: decodeHtml(description).trim() || title,
          address: address.trim(),
          areaTotal,
          price: priceValue,
          status: "ACTIVE",
        },
      });
      created++;
      console.log(`[+] ${category}/${type}: ${title}`);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[!] ${title}: ${msg}`);
      errors++;
    }
  }

  console.log(`\nМиграция завершена: создано ${created}, ошибок ${errors}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
