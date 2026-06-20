import { PrismaClient, ObjectType, ObjectCategory } from "../src/generated/prisma";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

type DdCompsRecord = {
  ddCompsId: string;
  type: "RENT" | "SALE";
  category: "WAREHOUSE";
  title: string;
  description: string;
  address: string;
  areaTotal: number;
  price: number;
  pricePerSqm: number | null;
  blocksCount: number | null;
  trustScore: number | null;
  trustClass: string | null;
  dataSource: string | null;
  recordedDate: string | null;
  manager: string | null;
  stage: string | null;
};

async function main() {
  const dataPath = path.resolve(__dirname, "../../otsenka-nedvizhimosti/exports/crm_import.json");

  if (!fs.existsSync(dataPath)) {
    console.error("crm_import.json не найден:", dataPath);
    console.error("Сначала запусти: python scripts/export_dd_comps_for_crm.py (в otsenka-nedvizhimosti)");
    process.exit(1);
  }

  const records = JSON.parse(fs.readFileSync(dataPath, "utf-8")) as DdCompsRecord[];

  let created = 0;
  let updated = 0;
  let errors = 0;

  for (const r of records) {
    try {
      const data = {
        type: r.type === "RENT" ? ObjectType.RENT : ObjectType.SALE,
        category: ObjectCategory.WAREHOUSE,
        title: r.title,
        description: r.description,
        address: r.address,
        areaTotal: r.areaTotal,
        price: r.price,
        pricePerSqm: r.pricePerSqm,
        blocksCount: r.blocksCount,
        trustScore: r.trustScore,
        trustClass: r.trustClass,
        dataSource: r.dataSource,
        recordedDate: r.recordedDate ? new Date(r.recordedDate) : null,
        manager: r.manager,
        stage: r.stage,
      };

      const result = await prisma.object.upsert({
        where: { ddCompsId: r.ddCompsId },
        create: { ddCompsId: r.ddCompsId, status: "ACTIVE", ...data },
        update: data,
      });

      if (result.createdAt.getTime() === result.updatedAt.getTime()) {
        created++;
        console.log(`[+] ${r.title}`);
      } else {
        updated++;
        console.log(`[~] ${r.title}`);
      }
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error(`[!] ${r.title}: ${msg}`);
      errors++;
    }
  }

  console.log(`\nИмпорт DD COMPS завершён: создано ${created}, обновлено ${updated}, ошибок ${errors}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
