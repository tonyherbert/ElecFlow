"use server";

import { orgAction } from "@/lib/actions/safe-actions";
import { ActionError } from "@/lib/errors/action-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

import { buildCircuitFromParsed } from "../pdf-import/circuit-builder";
import { parseFormelecText } from "../pdf-import/formelec-parser";
import { extractTextFromPdf } from "../pdf-import/pdf-parser";
import { computeCircuitFingerprint } from "../utils/fingerprint";

import {
  findCircuitsByFingerprint,
  findCircuitsByFingerprintGlobal,
  getNextVersionNumber,
} from "./circuit.action";

// =============================================================================
// Parse PDF (Preview before import)
// =============================================================================

const ParsePdfInputSchema = z.object({
  /** Base64 encoded PDF content */
  fileBase64: z.string().min(1),
  /** Original file name */
  fileName: z.string().min(1),
});

export const parsePdfAction = orgAction
  .metadata({})
  .inputSchema(ParsePdfInputSchema)
  .action(async ({ parsedInput }) => {
    const { fileBase64, fileName } = parsedInput;

    // Validate file extension
    if (!fileName.toLowerCase().endsWith(".pdf")) {
      throw new ActionError("Le fichier doit être un PDF");
    }

    // Decode base64 to buffer
    const buffer = Buffer.from(fileBase64, "base64");

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (buffer.length > maxSize) {
      throw new ActionError("Fichier trop volumineux (maximum 10MB)");
    }

    // Extract text from PDF
    let extractionResult;
    try {
      extractionResult = await extractTextFromPdf(buffer);
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw new ActionError(
        "Impossible de lire le PDF. Vérifiez que le fichier n'est pas corrompu."
      );
    }

    // Parse Formelec format
    const parsed = parseFormelecText(extractionResult.text, fileName);

    // Build circuit preview
    const buildResult = buildCircuitFromParsed(parsed);

    // Compute fingerprint for version matching
    const fingerprint =
      parsed.components.length > 0
        ? computeCircuitFingerprint(parsed.components)
        : null;

    return {
      parsed,
      buildResult,
      pdfInfo: {
        numPages: extractionResult.numPages,
        title: extractionResult.info.title,
      },
      fingerprint,
    };
  });

// =============================================================================
// Check Existing Versions
// =============================================================================

const CheckVersionInputSchema = z.object({
  /** Fingerprint from parsed PDF */
  fingerprint: z.string().min(1),
  /** Client ID to check within (optional for global import) */
  clientId: z.string().optional(),
});

export const checkExistingVersionsAction = orgAction
  .metadata({})
  .inputSchema(CheckVersionInputSchema)
  .action(async ({ parsedInput, ctx: { org } }) => {
    const { fingerprint, clientId } = parsedInput;

    // If no clientId, check across all circuits in the org
    const matches = clientId
      ? await findCircuitsByFingerprint(fingerprint, clientId, org.id)
      : await findCircuitsByFingerprintGlobal(fingerprint, org.id);

    return {
      hasExistingVersions: matches.length > 0,
      existingCircuits: matches.map((m) => ({
        id: m.id,
        name: m.name,
        version: m.version,
        createdAt: m.createdAt,
        latestVersion: m.childVersions[0]?.version ?? m.version,
      })),
    };
  });

// =============================================================================
// Import PDF and Create Circuit
// =============================================================================

const ImportPdfInputSchema = z.object({
  /** Base64 encoded PDF content */
  fileBase64: z.string().min(1),
  /** Original file name */
  fileName: z.string().min(1),
  /** Client ID to associate the circuit with (optional) */
  clientId: z.string().optional(),
  /** Optional custom circuit name (overrides parsed name) */
  customName: z.string().optional(),
  /** Optional parent circuit ID to create as new version */
  createAsVersionOf: z.string().optional(),
});

export const importPdfAction = orgAction
  .metadata({})
  .inputSchema(ImportPdfInputSchema)
  .action(async ({ parsedInput, ctx: { org } }) => {
    const { fileBase64, fileName, clientId, customName, createAsVersionOf } =
      parsedInput;

    // Validate file extension
    if (!fileName.toLowerCase().endsWith(".pdf")) {
      throw new ActionError("Le fichier doit être un PDF");
    }

    // Decode base64 to buffer
    const buffer = Buffer.from(fileBase64, "base64");

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024;
    if (buffer.length > maxSize) {
      throw new ActionError("Fichier trop volumineux (maximum 10MB)");
    }

    // Extract text from PDF
    let extractionResult;
    try {
      extractionResult = await extractTextFromPdf(buffer);
    } catch (error) {
      console.error("PDF extraction error:", error);
      throw new ActionError(
        "Impossible de lire le PDF. Vérifiez que le fichier n'est pas corrompu."
      );
    }

    // Parse Formelec format
    const parsed = parseFormelecText(extractionResult.text, fileName);

    if (parsed.components.length === 0) {
      throw new ActionError(
        "Aucun composant détecté dans le PDF. Vérifiez que le format est Formelec."
      );
    }

    // Build circuit
    const buildResult = buildCircuitFromParsed(parsed);

    if (!buildResult.success || !buildResult.circuitInput) {
      throw new ActionError(
        buildResult.errors.join(", ") || "Impossible de construire le circuit"
      );
    }

    const circuitInput = buildResult.circuitInput;

    // Compute fingerprint for version matching
    const fingerprint = computeCircuitFingerprint(parsed.components);

    // Determine version info
    let version = 1;
    let parentCircuitId: string | null = null;

    if (createAsVersionOf) {
      // Validate that the parent circuit exists and belongs to this org
      const parentCircuit = await prisma.circuit.findUnique({
        where: { id: createAsVersionOf, organizationId: org.id },
        select: { id: true, parentCircuitId: true },
      });

      if (parentCircuit) {
        // Use the original circuit as parent (not the one passed if it's already a child)
        parentCircuitId = parentCircuit.parentCircuitId ?? parentCircuit.id;
        version = await getNextVersionNumber(parentCircuitId, org.id);
      }
    }

    // Create circuit in database
    const circuit = await prisma.circuit.create({
      data: {
        name: customName ?? circuitInput.name,
        description: circuitInput.description,
        clientId: clientId ?? null,
        organizationId: org.id,
        nodesJson: JSON.stringify(circuitInput.nodes),
        linksJson: JSON.stringify(circuitInput.links),
        statesJson: JSON.stringify(circuitInput.states),
        sourceNodeId: circuitInput.sourceNodeId,
        neutralNodeId: circuitInput.neutralNodeId,
        receptorNodeIds: JSON.stringify(circuitInput.receptorNodeIds),
        // Versioning fields
        version,
        fingerprint,
        parentCircuitId,
      },
    });

    return {
      circuitId: circuit.id,
      componentsCount: parsed.components.length,
      version,
      isNewVersion: parentCircuitId !== null,
      warnings: buildResult.errors, // Non-fatal errors become warnings
    };
  });
