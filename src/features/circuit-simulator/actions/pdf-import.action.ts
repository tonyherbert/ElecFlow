"use server";

import { orgAction } from "@/lib/actions/safe-actions";
import { ActionError } from "@/lib/errors/action-error";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

import { extractTextFromPdf } from "../pdf-import/pdf-parser";
import { parseFormelecText } from "../pdf-import/formelec-parser";
import { buildCircuitFromParsed } from "../pdf-import/circuit-builder";

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

    return {
      parsed,
      buildResult,
      pdfInfo: {
        numPages: extractionResult.numPages,
        title: extractionResult.info.title,
      },
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
  /** Client ID to associate the circuit with */
  clientId: z.string().min(1),
  /** Optional custom circuit name (overrides parsed name) */
  customName: z.string().optional(),
});

export const importPdfAction = orgAction
  .metadata({})
  .inputSchema(ImportPdfInputSchema)
  .action(async ({ parsedInput, ctx: { org } }) => {
    const { fileBase64, fileName, clientId, customName } = parsedInput;

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

    // Create circuit in database
    const circuit = await prisma.circuit.create({
      data: {
        name: customName ?? circuitInput.name,
        description: circuitInput.description,
        clientId,
        organizationId: org.id,
        nodesJson: JSON.stringify(circuitInput.nodes),
        linksJson: JSON.stringify(circuitInput.links),
        statesJson: JSON.stringify(circuitInput.states),
        sourceNodeId: circuitInput.sourceNodeId,
        neutralNodeId: circuitInput.neutralNodeId,
        receptorNodeIds: JSON.stringify(circuitInput.receptorNodeIds),
      },
    });

    return {
      circuitId: circuit.id,
      componentsCount: parsed.components.length,
      warnings: buildResult.errors, // Non-fatal errors become warnings
    };
  });
