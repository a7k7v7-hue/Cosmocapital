import { PrismaClient, ObjectType, ObjectCategory } from "../src/generated/prisma";

const prisma = new PrismaClient();

async function main() {
  await prisma.service.createMany({
    data: [
      { title: "Аренда офисов", description: "Подбор и оформление офисных помещений под ваш бизнес.", icon: "🏢", order: 1 },
      { title: "Продажа коммерческой недвижимости", description: "Сопровождение сделок купли-продажи коммерческих объектов.", icon: "🔑", order: 2 },
      { title: "Аренда торговых площадей", description: "Поиск помещений в торговых центрах и стрит-ритейл.", icon: "🛍️", order: 3 },
      { title: "Аренда складов", description: "Складские и производственные помещения разных классов.", icon: "🏗️", order: 4 },
      { title: "Консалтинг", description: "Анализ рынка, оценка объектов, инвестиционные стратегии.", icon: "📊", order: 5 },
      { title: "Управление активами", description: "Управление коммерческой недвижимостью и оптимизация доходности.", icon: "💼", order: 6 },
    ],
    skipDuplicates: true,
  });

  const objects = [
    {
      type: ObjectType.RENT,
      category: ObjectCategory.OFFICE,
      title: "Офис класса A в деловом центре",
      description: "Современный офис в новом бизнес-центре класса A. Открытая планировка, панорамные окна, парковка.",
      address: "Москва, Пресненская наб., 12",
      metro: "Выставочная",
      areaTotal: 250,
      areaMin: 50,
      floor: 14,
      floorsTotal: 25,
      price: 187500,
      pricePerSqm: 750,
      photos: [],
      featured: true,
    },
    {
      type: ObjectType.RENT,
      category: ObjectCategory.OFFICE,
      title: "Офис в центре, готов к въезду",
      description: "Полностью меблированный офис рядом с метро. Переговорная комната, кухня, 24/7 охрана.",
      address: "Москва, ул. Тверская, 18",
      metro: "Тверская",
      areaTotal: 120,
      floor: 3,
      floorsTotal: 9,
      price: 90000,
      pricePerSqm: 750,
      photos: [],
      featured: true,
    },
    {
      type: ObjectType.RENT,
      category: ObjectCategory.RETAIL,
      title: "Торговое помещение на первой линии",
      description: "Стрит-ритейл с отдельным входом и большими витринами. Высокий пешеходный трафик.",
      address: "Москва, ул. Арбат, 24",
      metro: "Арбатская",
      areaTotal: 80,
      floor: 1,
      floorsTotal: 5,
      price: 200000,
      pricePerSqm: 2500,
      photos: [],
      featured: true,
    },
    {
      type: ObjectType.RENT,
      category: ObjectCategory.WAREHOUSE,
      title: "Склад класса B+ с пандусом",
      description: "Теплый склад с пандусом для фур, высота потолков 9м, ворота 4x4м.",
      address: "Москва, Варшавское шоссе, 125",
      metro: "Варшавская",
      areaTotal: 1500,
      areaMin: 300,
      floor: 1,
      floorsTotal: 1,
      price: 450000,
      pricePerSqm: 300,
      photos: [],
    },
    {
      type: ObjectType.SALE,
      category: ObjectCategory.OFFICE,
      title: "Офисный блок в продажу",
      description: "Отдельный этаж в офисном центре в собственность. Свидетельство о праве, чистая юридическая история.",
      address: "Москва, Ленинградский пр., 37",
      metro: "Динамо",
      areaTotal: 450,
      floor: 7,
      floorsTotal: 12,
      price: 54000000,
      pricePerSqm: 120000,
      photos: [],
    },
    {
      type: ObjectType.SALE,
      category: ObjectCategory.FREE_PURPOSE,
      title: "Помещение свободного назначения",
      description: "Универсальное помещение: офис, клиника, учебный центр. Отдельный вход, парковка.",
      address: "Москва, ул. Профсоюзная, 56",
      metro: "Профсоюзная",
      areaTotal: 320,
      floor: 1,
      floorsTotal: 7,
      price: 32000000,
      pricePerSqm: 100000,
      photos: [],
    },
  ];

  for (const obj of objects) {
    await prisma.object.create({ data: obj });
  }

  console.log(`Seed complete: ${objects.length} objects, 6 services`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
