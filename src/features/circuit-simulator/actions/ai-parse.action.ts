"use server";

import { orgAction } from "@/lib/actions/safe-actions";
import { ActionError } from "@/lib/errors/action-error";
import { z } from "zod";

import {
  convertAIComponentsToParsed,
  parseWithAI,
} from "../pdf-import/ai-parser";
import { buildCircuitFromParsed } from "../pdf-import/circuit-builder";
import { extractTextFromPdf } from "../pdf-import/pdf-parser";
import type { AIParseResult, ParsedComponent } from "../pdf-import/types";
import { computeCircuitFingerprint } from "../utils/fingerprint";

// =============================================================================
// AI Parse PDF (Extract text and parse with Claude)
// =============================================================================

const AIParsePdfInputSchema = z.object({
  /** Base64 encoded PDF content */
  fileBase64: z.string().min(1),
  /** Original file name */
  fileName: z.string().min(1),
});

export const aiParsePdfAction = orgAction
  .metadata({})
  .inputSchema(AIParsePdfInputSchema)
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

    // Check if we got any text
    if (!extractionResult.text || extractionResult.text.trim().length < 50) {
      throw new ActionError(
        "Impossible d'extraire le texte du PDF. Il s'agit peut-être d'un PDF scanné (image)."
      );
    }

    // Parse with AI
    let aiResult: AIParseResult;
    try {
      aiResult = await parseWithAI(extractionResult.text);
    } catch (error) {
      console.error("AI parsing error:", error);
      throw new ActionError(
        "Erreur lors de l'analyse IA. Veuillez réessayer."
      );
    }

    return {
      aiResult,
      pdfInfo: {
        numPages: extractionResult.numPages,
        title: extractionResult.info.title,
      },
      rawText: extractionResult.text,
    };
  });

// =============================================================================
// Validate and Import from AI-parsed components
// =============================================================================

const AIComponentSchema = z.object({
  repere: z.string().min(1),
  designation: z.string(),
  protection: z.string(),
  cable: z.string().nullable(),
  parentRepere: z.string().nullable(),
  type: z.enum(["main_breaker", "differential", "circuit_breaker", "final_circuit"]),
});

const ValidateAndBuildInputSchema = z.object({
  /** AI-parsed components (after user validation/editing) */
  components: z.array(AIComponentSchema),
  /** Circuit name */
  name: z.string().min(1),
});

export const validateAndBuildAction = orgAction
  .metadata({})
  .inputSchema(ValidateAndBuildInputSchema)
  .action(async ({ parsedInput }) => {
    const { components, name } = parsedInput;

    if (components.length === 0) {
      throw new ActionError("Aucun composant à importer");
    }

    // Convert AI components to standard format
    const parsedComponents: ParsedComponent[] = convertAIComponentsToParsed(
      components
    );

    // Build circuit preview
    const buildResult = buildCircuitFromParsed({
      documentName: name,
      components: parsedComponents,
      errors: [],
    });

    // Compute fingerprint for version matching
    const fingerprint = computeCircuitFingerprint(parsedComponents);

    return {
      buildResult,
      fingerprint,
      parsedComponents,
    };
  });
