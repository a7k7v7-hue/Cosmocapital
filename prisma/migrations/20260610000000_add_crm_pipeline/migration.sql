-- CreateEnum
CREATE TYPE "DealSegment" AS ENUM ('BIG_BOX', 'LIGHT_INDUSTRIAL', 'LAND');

-- CreateEnum
CREATE TYPE "DealType" AS ENUM ('LI_RENT', 'LI_SALE_LAND', 'BB_RENT', 'BB_SALE_LAND', 'BTS_SLB_MANDATE');

-- CreateEnum
CREATE TYPE "LossReason" AS ENUM ('CHOSE_ANOTHER_WITHOUT_US', 'WENT_TO_COMPETITOR', 'POSTPONED_DECISION', 'BUDGET_NOT_CONFIRMED', 'OWNER_REMOVED_OBJECT', 'OTHER');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('CALL', 'MEETING', 'VIEWING', 'PROPOSAL_SENT', 'EMAIL', 'OTHER');

-- CreateTable
CREATE TABLE "deals" (
    "id" TEXT NOT NULL,
    "brokerName" TEXT NOT NULL,
    "segment" "DealSegment" NOT NULL,
    "dealType" "DealType" NOT NULL,
    "clientName" TEXT NOT NULL,
    "objectDescription" TEXT NOT NULL,
    "areaSqm" DOUBLE PRECISION,
    "stage" INTEGER NOT NULL DEFAULT 1,
    "expectedGci" DOUBLE PRECISION NOT NULL,
    "expectedCloseDate" TIMESTAMP(3),
    "lastStageChangedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "isLost" BOOLEAN NOT NULL DEFAULT false,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,
    "actualGci" DOUBLE PRECISION,
    "lossReason" "LossReason",
    "lossComment" TEXT,
    "lprContact" TEXT,
    "leadSource" TEXT,
    "nextActionDate" TIMESTAMP(3),
    "nextActionDesc" TEXT,
    "notes" TEXT,
    "qualificationData" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_stage_changes" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "fromStage" INTEGER NOT NULL,
    "toStage" INTEGER NOT NULL,
    "comment" TEXT,
    "changedBy" TEXT,
    "changedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deal_stage_changes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deal_activities" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "type" "ActivityType" NOT NULL,
    "description" TEXT NOT NULL,
    "activityDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "deal_activities_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "deal_stage_changes" ADD CONSTRAINT "deal_stage_changes_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deal_activities" ADD CONSTRAINT "deal_activities_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "deals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
