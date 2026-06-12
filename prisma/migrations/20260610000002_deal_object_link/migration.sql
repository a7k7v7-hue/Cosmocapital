-- Link deals to catalog objects (optional)
ALTER TABLE "deals" ADD COLUMN "objectId" TEXT;
ALTER TABLE "deals" ADD CONSTRAINT "deals_objectId_fkey"
  FOREIGN KEY ("objectId") REFERENCES "objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
