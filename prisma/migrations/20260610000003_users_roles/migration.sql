-- Users table with roles
CREATE TYPE "UserRole" AS ENUM ('HEAD', 'SENIOR_BROKER', 'BROKER', 'RESEARCH');

CREATE TABLE "users" (
  "id"         TEXT NOT NULL,
  "email"      TEXT NOT NULL,
  "password"   TEXT NOT NULL,
  "name"       TEXT NOT NULL,
  "role"       "UserRole" NOT NULL DEFAULT 'BROKER',
  "brokerName" TEXT,
  "active"     BOOLEAN NOT NULL DEFAULT true,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
