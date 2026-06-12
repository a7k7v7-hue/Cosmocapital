-- Add re-engagement date for lost deals (TZ §4.8)
ALTER TABLE "deals" ADD COLUMN "reEngagementDate" TIMESTAMP(3);
