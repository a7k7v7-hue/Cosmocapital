-- AlterTable
ALTER TABLE "objects" ADD COLUMN     "blocksCount" INTEGER,
ADD COLUMN     "dataSource" TEXT,
ADD COLUMN     "ddCompsId" TEXT,
ADD COLUMN     "manager" TEXT,
ADD COLUMN     "recordedDate" TIMESTAMP(3),
ADD COLUMN     "stage" TEXT,
ADD COLUMN     "trustClass" TEXT,
ADD COLUMN     "trustScore" DOUBLE PRECISION;

-- CreateIndex
CREATE UNIQUE INDEX "objects_ddCompsId_key" ON "objects"("ddCompsId");

