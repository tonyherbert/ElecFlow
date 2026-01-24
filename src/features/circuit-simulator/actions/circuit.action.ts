"use server";

import { orgAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

import type { Circuit } from "../types/circuit.types";

function dbCircuitToDomain(
  dbCircuit: Awaited<ReturnType<typeof prisma.circuit.findUnique>>
): Circuit | null {
  if (!dbCircuit) return null;

  return {
    id: dbCircuit.id,
    name: dbCircuit.name,
    description: dbCircuit.description ?? undefined,
    nodes: JSON.parse(dbCircuit.nodesJson),
    links: JSON.parse(dbCircuit.linksJson),
    states: JSON.parse(dbCircuit.statesJson),
    sourceNodeId: dbCircuit.sourceNodeId,
    neutralNodeId: dbCircuit.neutralNodeId,
    receptorNodeIds: JSON.parse(dbCircuit.receptorNodeIds),
  };
}

export const deleteCircuitAction = orgAction
  .metadata({})
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx: { org } }) => {
    await prisma.circuit.delete({
      where: {
        id: parsedInput.id,
        organizationId: org.id,
      },
    });

    return { success: true };
  });

export async function getCircuitById(
  circuitId: string,
  organizationId: string
): Promise<Circuit | null> {
  const dbCircuit = await prisma.circuit.findUnique({
    where: {
      id: circuitId,
      organizationId,
    },
  });

  return dbCircuitToDomain(dbCircuit);
}

export async function getCircuitsByOrganization(organizationId: string) {
  const circuits = await prisma.circuit.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      receptorNodeIds: true,
    },
  });

  return circuits.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    receptorCount: (JSON.parse(c.receptorNodeIds) as string[]).length,
  }));
}
