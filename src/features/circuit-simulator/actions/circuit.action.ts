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

export const assignClientAction = orgAction
  .metadata({})
  .inputSchema(
    z.object({
      circuitId: z.string(),
      clientId: z.string().nullable(),
    })
  )
  .action(async ({ parsedInput, ctx: { org } }) => {
    await prisma.circuit.update({
      where: {
        id: parsedInput.circuitId,
        organizationId: org.id,
      },
      data: {
        clientId: parsedInput.clientId,
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

export async function getCircuitWithClientById(
  circuitId: string,
  organizationId: string
) {
  const circuit = await prisma.circuit.findUnique({
    where: {
      id: circuitId,
      organizationId,
    },
    select: {
      id: true,
      clientId: true,
      client: {
        select: {
          name: true,
        },
      },
    },
  });

  if (!circuit) return null;

  return {
    id: circuit.id,
    clientId: circuit.clientId,
    clientName: circuit.client?.name ?? null,
  };
}

export async function getCircuitsByClient(clientId: string, organizationId: string) {
  const circuits = await prisma.circuit.findMany({
    where: {
      clientId,
      organizationId,
    },
    orderBy: [
      { parentCircuitId: "asc" }, // Group versions together
      { version: "desc" }, // Latest version first within group
    ],
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      receptorNodeIds: true,
      version: true,
      parentCircuitId: true,
    },
  });

  return circuits.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    receptorCount: (JSON.parse(c.receptorNodeIds) as string[]).length,
    version: c.version,
    parentCircuitId: c.parentCircuitId,
  }));
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

export async function getCircuitsWithClientByOrganization(organizationId: string) {
  const circuits = await prisma.circuit.findMany({
    where: {
      organizationId,
    },
    orderBy: [
      { parentCircuitId: "asc" },
      { version: "desc" },
    ],
    select: {
      id: true,
      name: true,
      description: true,
      createdAt: true,
      updatedAt: true,
      receptorNodeIds: true,
      version: true,
      parentCircuitId: true,
      clientId: true,
      client: {
        select: {
          name: true,
        },
      },
    },
  });

  return circuits.map((c) => ({
    id: c.id,
    name: c.name,
    description: c.description,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    receptorCount: (JSON.parse(c.receptorNodeIds) as string[]).length,
    version: c.version,
    parentCircuitId: c.parentCircuitId,
    clientId: c.clientId,
    clientName: c.client?.name ?? null,
  }));
}

// =============================================================================
// Version-related queries
// =============================================================================

/**
 * Find circuits with the same fingerprint in the same client
 * Used to detect if a plan already exists when importing
 */
export async function findCircuitsByFingerprint(
  fingerprint: string,
  clientId: string,
  organizationId: string
) {
  // Find original versions (parentCircuitId = null) with matching fingerprint
  const matches = await prisma.circuit.findMany({
    where: {
      fingerprint,
      clientId,
      organizationId,
      parentCircuitId: null, // Only match original versions
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      version: true,
      createdAt: true,
      childVersions: {
        select: { id: true, version: true, createdAt: true },
        orderBy: { version: "desc" },
      },
    },
  });

  return matches;
}

/**
 * Find circuits with the same fingerprint across all clients in the org
 * Used for global import (no client pre-selected)
 */
export async function findCircuitsByFingerprintGlobal(
  fingerprint: string,
  organizationId: string
) {
  const matches = await prisma.circuit.findMany({
    where: {
      fingerprint,
      organizationId,
      parentCircuitId: null,
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      version: true,
      createdAt: true,
      childVersions: {
        select: { id: true, version: true, createdAt: true },
        orderBy: { version: "desc" },
      },
    },
  });

  return matches;
}

/**
 * Get all versions of a circuit (including the original)
 */
export async function getCircuitVersions(circuitId: string, organizationId: string) {
  // First, find the circuit to determine if it's a parent or child
  const circuit = await prisma.circuit.findUnique({
    where: { id: circuitId, organizationId },
    select: { parentCircuitId: true },
  });

  if (!circuit) return [];

  // Get the parent ID (or self if this is the original)
  const parentId = circuit.parentCircuitId ?? circuitId;

  // Get all versions (parent + children)
  const versions = await prisma.circuit.findMany({
    where: {
      organizationId,
      OR: [{ id: parentId }, { parentCircuitId: parentId }],
    },
    orderBy: { version: "asc" },
    select: {
      id: true,
      name: true,
      version: true,
      createdAt: true,
      updatedAt: true,
      receptorNodeIds: true,
    },
  });

  return versions.map((v) => ({
    id: v.id,
    name: v.name,
    version: v.version,
    createdAt: v.createdAt,
    updatedAt: v.updatedAt,
    receptorCount: (JSON.parse(v.receptorNodeIds) as string[]).length,
  }));
}

/**
 * Get the next version number for a circuit
 */
export async function getNextVersionNumber(
  parentCircuitId: string,
  organizationId: string
): Promise<number> {
  const latestVersion = await prisma.circuit.findFirst({
    where: {
      organizationId,
      OR: [{ id: parentCircuitId }, { parentCircuitId }],
    },
    orderBy: { version: "desc" },
    select: { version: true },
  });

  return (latestVersion?.version ?? 0) + 1;
}
