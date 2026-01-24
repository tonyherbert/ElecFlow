-- CreateTable
CREATE TABLE "client" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "notes" TEXT,
    "organizationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "client_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "client_organizationId_idx" ON "client"("organizationId");

-- AddForeignKey
ALTER TABLE "client" ADD CONSTRAINT "client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create default clients for each organization that has circuits
INSERT INTO "client" ("id", "name", "organizationId", "createdAt", "updatedAt")
SELECT
    'default_' || c."organizationId",
    'Non classé',
    c."organizationId",
    NOW(),
    NOW()
FROM (SELECT DISTINCT "organizationId" FROM "circuit") c
ON CONFLICT DO NOTHING;

-- AlterTable - Add clientId column with default value
ALTER TABLE "circuit" ADD COLUMN "clientId" TEXT;

-- Update existing circuits to use the default client
UPDATE "circuit"
SET "clientId" = 'default_' || "organizationId";

-- Make clientId required
ALTER TABLE "circuit" ALTER COLUMN "clientId" SET NOT NULL;

-- CreateIndex
CREATE INDEX "circuit_clientId_idx" ON "circuit"("clientId");

-- AddForeignKey
ALTER TABLE "circuit" ADD CONSTRAINT "circuit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
