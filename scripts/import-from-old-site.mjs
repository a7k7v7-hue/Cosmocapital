/**
 * Импорт объектов со старого сайта cosmocapital.ru в локальную БД
 * Запуск: node scripts/import-from-old-site.mjs
 */
import { PrismaClient } from "../src/generated/prisma/index.js";

const prisma = new PrismaClient();
const BASE = "https://cosmocapital.ru";

// Все ID объектов (найдены перебором 1-200, проверено 2026-06-12)
const OBJECT_IDS = [
  21, 22, 24, 25, 27, 31, 32, 34, 35, 36, 40, 41, 42,
  52, 54, 60, 61, 75, 76, 79, 80, 81, 82, 84, 85, 86,
  88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100,
  101, 103, 104, 106, 107, 108,
];

function guessCategory(text) {
  const t = text.toLowerCase();
  if (t.includes("склад") || t.includes("логист")) return "WAREHOUSE";
  if (t.includes("офис")) return "OFFICE";
  if (t.includes("торг") || t.includes("ритейл") || t.includes("ТЦ") || t.includes("тц")) return "RETAIL";
  if (t.includes("производ")) return "PRODUCTION";
  return "FREE_PURPOSE";
}

function guessType(text) {
  const t = text.toLowerCase();
  const hasSale = t.includes("продаж");
  const hasRent = t.includes("аренд");
  return hasSale && !hasRent ? "SALE" : "RENT";
}

function extractNumber(str) {
  const m = str?.replace(/\s/g, "").match(/[\d]+[.,]?[\d]*/);
  return m ? parseFloat(m[0].replace(",", ".")) : 0;
}

async function fetchObject(id) {
  const res = await fetch(`${BASE}/object/${id}`, {
    signal: AbortSignal.timeout(10000),
  }).catch(() => null);
  if (!res?.ok) return null;

  const html = await res.text();

  // Strip scripts/styles, get plain text lines
  const clean = html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, " ")
    .replace(/[ \t]+/g, " ");

  const lines = clean
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 2);

  // Title — first meaningful line after nav (skip phone, nav items)
  const navSkip = new Set(["+7 (903) 537 44 88", "Главная", "О компании", "Поиск объекта", "Услуги", "Новости", "Контакты"]);
  const title = lines.find((l) => !navSkip.has(l) && !/^R\d{4}$/.test(l) && l.length > 3 && !l.startsWith("©")) ?? `Объект ${id}`;

  // Address
  const addrLine = lines.find((l) => l.toLowerCase().startsWith("местоположение:"));
  const address = addrLine ? addrLine.replace(/^местоположение:\s*/i, "").trim() : "";

  // Area
  const areaLine = lines.find((l) => l.toLowerCase().includes("площадь:"));
  const areaMatch = areaLine?.match(/([\d\s]+)\s*м/);
  const areaTotal = areaMatch ? extractNumber(areaMatch[1]) : 100;

  // Type
  const typeLine = lines.find((l) => ["аренда", "продажа", "аренда, продажа"].includes(l.toLowerCase()));
  const type = guessType(typeLine ?? "аренда");

  // Price
  const priceLine = lines.find((l) => l.toLowerCase().includes("стоимость:"));
  const priceStr = priceLine?.replace(/стоимость:/i, "").trim() ?? "";
  const price = priceStr.toLowerCase().includes("запрос") ? 0 : extractNumber(priceStr);

  // Description
  const descIdx = lines.findIndex((l) => l === "Описание");
  const description = descIdx >= 0
    ? lines.slice(descIdx + 1, descIdx + 6).filter((l) => !navSkip.has(l) && l.length > 5).join(" ").trim()
    : "";

  // Category from title + description
  const category = guessCategory(title + " " + description);

  // Photos
  const photos = [...new Set(
    [...html.matchAll(/\/uploads\/object\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/gi)].map((m) => m[0])
  )].map((p) => `${BASE}${p}`);

  return { id, title, type, category, address, areaTotal, price, description, photos };
}

async function main() {
  console.log(`Fetching ${OBJECT_IDS.length} objects from ${BASE}...`);

  const results = await Promise.all(OBJECT_IDS.map(fetchObject));
  const objects = results.filter(Boolean);

  console.log(`\nFetched ${objects.length} objects:\n`);
  for (const o of objects) {
    console.log(`  [${o.id}] ${o.title} | ${o.type} | ${o.category} | ${o.areaTotal}м² | ${o.price > 0 ? o.price + "₽" : "по запросу"} | ${o.photos.length} фото`);
  }

  console.log("\nImporting into database...");
  let created = 0;
  let skipped = 0;

  for (const o of objects) {
    // Check if object with same title already exists
    const exists = await prisma.object.findFirst({ where: { title: o.title } });
    if (exists) {
      console.log(`  SKIP (exists): ${o.title}`);
      skipped++;
      continue;
    }

    await prisma.object.create({
      data: {
        title: o.title,
        type: o.type,
        category: o.category,
        address: o.address || "Москва",
        areaTotal: o.areaTotal || 100,
        price: o.price,
        description: o.description || o.title,
        photos: o.photos,
        status: "ACTIVE",
        featured: false,
      },
    });
    console.log(`  ✓ Created: ${o.title}`);
    created++;
  }

  console.log(`\nDone: ${created} created, ${skipped} skipped.`);
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
