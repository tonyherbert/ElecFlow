-- AlterTable
ALTER TABLE "circuit" ADD COLUMN     "fingerprint" TEXT,
ADD COLUMN     "parentCircuitId" TEXT,
ADD COLUMN     "version" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "circuit_fingerprint_idx" ON "circuit"("fingerprint");

-- CreateIndex
CREATE INDEX "circuit_parentCircuitId_idx" ON "circuit"("parentCircuitId");

-- AddForeignKey
ALTER TABLE "circuit" ADD CONSTRAINT "circuit_parentCircuitId_fkey" FOREIGN KEY ("parentCircuitId") REFERENCES "circuit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
