-- CreateTable
CREATE TABLE "circuit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "organizationId" TEXT NOT NULL,
    "nodesJson" TEXT NOT NULL,
    "linksJson" TEXT NOT NULL,
    "statesJson" TEXT NOT NULL,
    "sourceNodeId" TEXT NOT NULL,
    "neutralNodeId" TEXT NOT NULL,
    "receptorNodeIds" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "circuit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "circuit_simulation" (
    "id" TEXT NOT NULL,
    "circuitId" TEXT NOT NULL,
    "statesJson" TEXT NOT NULL,
    "resultsJson" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "circuit_simulation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "circuit_organizationId_idx" ON "circuit"("organizationId");

-- CreateIndex
CREATE INDEX "circuit_simulation_circuitId_idx" ON "circuit_simulation"("circuitId");

-- AddForeignKey
ALTER TABLE "circuit" ADD CONSTRAINT "circuit_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "circuit_simulation" ADD CONSTRAINT "circuit_simulation_circuitId_fkey" FOREIGN KEY ("circuitId") REFERENCES "circuit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
