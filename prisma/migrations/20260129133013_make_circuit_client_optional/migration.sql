-- DropForeignKey
ALTER TABLE "circuit" DROP CONSTRAINT "circuit_clientId_fkey";

-- AlterTable
ALTER TABLE "circuit" ALTER COLUMN "clientId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "circuit" ADD CONSTRAINT "circuit_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "client"("id") ON DELETE SET NULL ON UPDATE CASCADE;
