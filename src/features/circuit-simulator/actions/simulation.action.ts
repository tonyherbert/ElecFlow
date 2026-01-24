"use server";

import { orgAction } from "@/lib/actions/safe-actions";
import { ActionError } from "@/lib/errors/action-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

import { simulateCircuit } from "../engine/simulator";
import { getCircuitById } from "./circuit.action";

// =============================================================================
// Run Simulation
// =============================================================================

const RunSimulationInputSchema = z.object({
  circuitId: z.string().min(1),
  stateOverrides: z.record(z.string(), z.boolean()).optional(),
});

export const runSimulationAction = orgAction
  .metadata({})
  .inputSchema(RunSimulationInputSchema)
  .action(async ({ parsedInput, ctx: { org } }) => {
    // Load the circuit
    const circuit = await getCircuitById(parsedInput.circuitId, org.id);

    if (!circuit) {
      throw new ActionError("Circuit not found");
    }

    // Run the simulation
    const result = simulateCircuit(circuit, parsedInput.stateOverrides);

    // Save the simulation result
    await prisma.circuitSimulation.create({
      data: {
        circuitId: circuit.id,
        statesJson: JSON.stringify(result.states),
        resultsJson: JSON.stringify(result.results),
      },
    });

    return result;
  });

// =============================================================================
// Get Simulation History
// =============================================================================

export async function getSimulationHistory(
  circuitId: string,
  organizationId: string,
  limit = 10
) {
  // First verify the circuit belongs to the organization
  const circuit = await prisma.circuit.findUnique({
    where: {
      id: circuitId,
      organizationId,
    },
    select: { id: true },
  });

  if (!circuit) {
    return [];
  }

  const simulations = await prisma.circuitSimulation.findMany({
    where: {
      circuitId,
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
    select: {
      id: true,
      statesJson: true,
      resultsJson: true,
      createdAt: true,
    },
  });

  return simulations.map((s) => ({
    id: s.id,
    states: JSON.parse(s.statesJson),
    results: JSON.parse(s.resultsJson),
    createdAt: s.createdAt,
  }));
}
