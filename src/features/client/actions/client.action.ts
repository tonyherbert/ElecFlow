"use server";

import { orgAction } from "@/lib/actions/safe-actions";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

import { createClientSchema, updateClientSchema } from "../schemas/client.schema";

export const createClientAction = orgAction
  .metadata({})
  .inputSchema(createClientSchema)
  .action(async ({ parsedInput, ctx: { org } }) => {
    const client = await prisma.client.create({
      data: {
        name: parsedInput.name,
        email: parsedInput.email || null,
        phone: parsedInput.phone || null,
        address: parsedInput.address || null,
        notes: parsedInput.notes || null,
        organizationId: org.id,
      },
    });

    return { clientId: client.id };
  });

export const updateClientAction = orgAction
  .metadata({})
  .inputSchema(updateClientSchema)
  .action(async ({ parsedInput, ctx: { org } }) => {
    await prisma.client.update({
      where: {
        id: parsedInput.id,
        organizationId: org.id,
      },
      data: {
        name: parsedInput.name,
        email: parsedInput.email || null,
        phone: parsedInput.phone || null,
        address: parsedInput.address || null,
        notes: parsedInput.notes || null,
      },
    });

    return { success: true };
  });

export const deleteClientAction = orgAction
  .metadata({})
  .inputSchema(z.object({ id: z.string() }))
  .action(async ({ parsedInput, ctx: { org } }) => {
    await prisma.client.delete({
      where: {
        id: parsedInput.id,
        organizationId: org.id,
      },
    });

    return { success: true };
  });

export async function getClientsByOrganization(organizationId: string) {
  const clients = await prisma.client.findMany({
    where: {
      organizationId,
    },
    orderBy: {
      updatedAt: "desc",
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          circuits: true,
        },
      },
    },
  });

  return clients.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    createdAt: c.createdAt,
    updatedAt: c.updatedAt,
    circuitCount: c._count.circuits,
  }));
}

export async function getClientById(clientId: string, organizationId: string) {
  const client = await prisma.client.findUnique({
    where: {
      id: clientId,
      organizationId,
    },
  });

  return client;
}
