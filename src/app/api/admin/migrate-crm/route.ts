import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// One-time migration endpoint — DELETE THIS FILE AFTER USE
const TOKEN = "crm-migrate-cosmocapital-2026-k9x";

const CRM_OBJECTS = [
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Riverdale", description: "Riverdale | Аренда, Продажа", address: "2-й Павелецкий проезд, д. 5, стр. 1", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: 'ЖК "Пресня сити"', description: 'ЖК "Пресня сити" | Продажа', address: "Москва, Ходынская ул., д.2", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: 'ЖК "Царская площадь"', description: 'ЖК "Царская площадь" | Продажа', address: "Москва, Ленинградский проспект, д. 31", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Загородный дом 508 кв.м. во Владивостоке", description: "Загородный дом 508 кв.м. во Владивостоке | Продажа", address: "Владивосток, ул. Находкинская д. 11 г", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Продажа 3-х комнатной квартиры 81 кв.м. в Строгино", description: "Продажа 3-х комнатной квартиры 81 кв.м. в Строгино | Продажа", address: "Москва, улица Твардовского, 12к1", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Продажа загородного дома 344 кв.м. в Новомосковском районе г. Москва", description: "Продажа загородного дома 344 кв.м. в Новомосковском районе г. Москва | Продажа", address: "Москва, поселение Щаповское, квартал № 39", areaTotal: 0, price: 35000000 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "3-х комнатная квартира в Хамовниках 121,3 кв.м.", description: "3-х комнатная квартира в Хамовниках 121,3 кв.м. | Продажа", address: "Москва, улица Усачёва, 15кБ", areaTotal: 0, price: 160000000 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Квартира студио 17 кв.м.", description: "Квартира студио 17 кв.м. | Продажа", address: "Москва, Зеленоград, к814", areaTotal: 0, price: 5000000 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Продажа здания 783 кв.м. Садовая - Спасская д. 19 стр. 3", description: "Продажа здания 783 кв.м. Садовая - Спасская д. 19 стр. 3 | Продажа", address: "Садовая - Спасская д. 19 стр. 3", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Продажа гостиницы 3*", description: "Продажа гостиницы 3* | Продажа", address: "Москва, Серебрянический переулок, 12с1", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Продажа здания 1 216 кв.м. в г. Пересвет", description: "Продажа здания 1 216 кв.м. в г. Пересвет", address: "Московская область, Сергиево-Посадский городской округ, Пересвет, Советская улица, 3", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Продажа комплекса зданий 18 338 кв.м. на з/у 2,38 га", description: "Продажа комплекса зданий общей площадью 18 338 кв.м. на земельном участке 2,38 га.", address: "Москва, Сельскохозяйственная улица, 17к2", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Продажа комплекса зданий 13 800 кв.м. на з/у 1,94 га", description: "Продажа комплекса зданий общей площадью 13 800 кв.м. на земельном участке 1,94 га.", address: "Москва, Сельскохозяйственная улица, 17к2", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Продажа участка 0,8 га под строительство комплекса апартаментов", description: "Продажа участка 0,8 га под строительство комплекса апартаментов | Продажа", address: "Москва, Сетунь", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "OFFICE" as const, title: "Административный комплекс 1 100 кв.м. на зу 0,5 га", description: "Административный комплекс 1 100 кв.м. на зу 0,5 га", address: "Москва, Варшавское шоссе, 66к2", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Участок под жилую застройку 0,21 га", description: "Участок под жилую застройку 0,21 га | Продажа", address: "Москва, Мерзляковский переулок, 22", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "RETAIL" as const, title: "Продажа автосалона 4 275 кв.м. на з/у 0,94 га", description: "Продажа автосалона 4 275 кв.м. на з/у 0,94 га", address: "Москва, улица Обручева, 54", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Продажа здания 10 000 кв.м. Милютинский пер-к, д. 5 стр.1", description: "Продажа здания 10 000 кв.м. Милютинский пер-к, д. 5 стр.1 | Строительство под заказчика", address: "Москва, Милютинский пер-к, д.5 стр.1", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "RETAIL" as const, title: 'Продажа помещения под автомойку в ЖК "Headliner"', description: 'Продажа помещения под автомойку в ЖК "Headliner" | Продажа', address: "Москва, Пресненский район, жилой комплекс Хедлайнер", areaTotal: 0, price: 130000 },
  { type: "SALE" as const, category: "RETAIL" as const, title: 'Продажа помещения под автомойку в ЖК "I Love"', description: 'Продажа помещения под автомойку в действующем ЖК "I Love" | Продажа', address: "Москва, Звёздный бульвар, 21с1", areaTotal: 0, price: 48000000 },
  { type: "SALE" as const, category: "OFFICE" as const, title: "Продажа административного здания под редевелопмент", description: "Продажа административного здания под редевелопмент | Продажа", address: "Москва, улица Академика Капицы, 32А", areaTotal: 0, price: 360000000 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Продажа пансионата в Крыму 40 км от Симферополя", description: "Продажа пансионата в Крыму 40 км от Симферополя | Продажа", address: "Крым, пос. Утес", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: 'Продажа кинотеатра "Восход" под реконструкцию', description: 'Продажа кинотеатра "Восход" под реконструкцию | Продажа', address: "Москва, Михайлова, д. 29", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Продажа земельного участка 1,2 га под ТЦ или жилой дом", description: "Продажа земельного участка 1,2 га под строительство ТЦ или жилого дома | Продажа", address: "Москва, Дмитровское ш. 49", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Продажа участка 0,93 га под строительство жилого комплекса", description: "Продажа участка 0,93 га под строительство жилого комплекса | Продажа", address: "Москва, Саймоновский пер., вл. 3", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "RETAIL" as const, title: 'Продажа готового бизнеса - магазин "Пятерочка" г. Пушкино МО', description: 'Продажа готового бизнеса - магазин "Пятерочка" г. Пушкино МО | Продажа', address: "Московская область, Пушкинский район, пгт Правдинский, Советская улица, уч.3б", areaTotal: 0, price: 75000000 },
  { type: "SALE" as const, category: "RETAIL" as const, title: 'Продажа готового бизнеса - магазин "Дикси" Сергиев - Посад', description: 'Продажа готового бизнеса - магазин "Дикси" Сергиев - Посад | Продажа', address: "Сергиево-Посадский район, рп Богородское, д.27/1", areaTotal: 0, price: 60000000 },
  { type: "SALE" as const, category: "PRODUCTION" as const, title: "Продажа производственного комплекса 16 770 кв.м. на з/у 1,37 га", description: "Продажа производственного комплекса 16 770 кв.м. на з/у 1,37 га", address: "Москва, 4-й Рощинский проезд, 20с1", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "PRODUCTION" as const, title: "Участки промышленного назначения в г. Воронеж", description: "Участки промышленного назначения в г. Воронеж | Продажа", address: "Воронеж", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Участок под жилую застройку 0,3 га", description: "Участок под жилую застройку 0,3 га | Продажа", address: "Москва, переулок Обуха, 3", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Продажа з/у под жилую застройку 0,68 га", description: "Продажа з/у под жилую застройку 0,68 га | Продажа", address: "Москва, 1-й Котляковский переулок, 4А", areaTotal: 0, price: 0 },
  { type: "SALE" as const, category: "FREE_PURPOSE" as const, title: "Продажа з/у под жилую застройку 1,37 га", description: "Продажа з/у под жилую застройку 1,37 га | Продажа", address: "Москва, Сельскохозяйственная улица, 42с1", areaTotal: 0, price: 0 },
];

export async function POST(req: NextRequest) {
  if (req.headers.get("authorization") !== `Bearer ${TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existing = new Set(
    (await prisma.object.findMany({ select: { title: true } })).map((o) => o.title)
  );

  const toInsert = CRM_OBJECTS.filter((o) => !existing.has(o.title));

  if (toInsert.length === 0) {
    return NextResponse.json({ created: 0, message: "Already migrated" });
  }

  const result = await prisma.object.createMany({ data: toInsert });
  return NextResponse.json({ created: result.count });
}
