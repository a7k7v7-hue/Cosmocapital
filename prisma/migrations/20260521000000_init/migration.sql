-- CreateEnum
CREATE TYPE "ObjectType" AS ENUM ('RENT', 'SALE');

-- CreateEnum
CREATE TYPE "ObjectCategory" AS ENUM ('OFFICE', 'RETAIL', 'WAREHOUSE', 'FREE_PURPOSE', 'PRODUCTION');

-- CreateEnum
CREATE TYPE "ObjectStatus" AS ENUM ('ACTIVE', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'IN_WORK', 'DONE', 'REJECTED');

-- CreateTable
CREATE TABLE "objects" (
    "id" TEXT NOT NULL,
    "type" "ObjectType" NOT NULL,
    "category" "ObjectCategory" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "metro" TEXT,
    "areaTotal" DOUBLE PRECISION NOT NULL,
    "areaMin" DOUBLE PRECISION,
    "floor" INTEGER,
    "floorsTotal" INTEGER,
    "price" DOUBLE PRECISION NOT NULL,
    "pricePerSqm" DOUBLE PRECISION,
    "photos" TEXT[],
    "status" "ObjectStatus" NOT NULL DEFAULT 'ACTIVE',
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "objects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "message" TEXT,
    "objectId" TEXT,
    "source" TEXT NOT NULL DEFAULT 'site',
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "leads" ADD CONSTRAINT "leads_objectId_fkey" FOREIGN KEY ("objectId") REFERENCES "objects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
