-- AlterEnum
ALTER TYPE "ObjectCategory" ADD VALUE 'LAND';

-- AlterTable
ALTER TABLE "objects" ADD COLUMN     "cadastralNumber" TEXT,
ADD COLUMN     "landCategory" TEXT,
ADD COLUMN     "landVri" TEXT;
