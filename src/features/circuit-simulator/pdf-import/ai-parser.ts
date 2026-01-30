/**
 * AI-powered PDF parsing using Claude Haiku
 * Extracts electrical components from PDF text using LLM
 */

import Anthropic from "@anthropic-ai/sdk";

import type { AIParseResult } from "./types";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const SYSTEM_PROMPT = `Tu es un expert en schémas électriques.
Analyse le texte extrait d'un schéma électrique et extrais les composants.

Pour chaque composant, identifie:
- repere: Identifiant unique (Q1, Q2, Q2.1, F1, etc.)
- designation: Description du circuit (Éclairage chambre, Prises cuisine...)
- protection: Calibre de protection (10A, 16A, 25A/30mA...)
- cable: Section de câble si mentionnée (3G1.5, 3G2.5...), null si non spécifié
- parentRepere: Le parent hiérarchique (Q2.1 → parent Q2), null si pas de parent
- type: "main_breaker" | "differential" | "circuit_breaker" | "final_circuit"

Règles pour déterminer le type:
- main_breaker: Le disjoncteur principal/général (souvent Q1, DB, ou le premier de la liste)
- differential: Un interrupteur différentiel avec sensibilité en mA (30mA, 300mA)
- circuit_breaker: Un disjoncteur divisionnaire sans câble associé
- final_circuit: Un circuit final avec câble associé (éclairage, prises, etc.)

Règles générales:
- Ignore les informations de cartouche (dates, noms de bureau d'études, numéros de page)
- Ignore les lignes qui ne correspondent pas à des composants électriques
- Si un composant a un repère comme "Q2.1", son parent est "Q2"
- Les différentiels ont toujours une sensibilité en mA dans leur protection

Réponds UNIQUEMENT en JSON valide, sans markdown ni explication.`;

/**
 * Parse PDF text using Claude Haiku
 */
export async function parseWithAI(pdfText: string): Promise<AIParseResult> {
  const userPrompt = `Voici le texte extrait du schéma électrique:

---
${pdfText}
---

Extrais tous les composants au format JSON:
{
  "components": [
    {
      "repere": "string",
      "designation": "string",
      "protection": "string",
      "cable": "string | null",
      "parentRepere": "string | null",
      "type": "main_breaker | differential | circuit_breaker | final_circuit"
    }
  ],
  "confidence": 0.0-1.0,
  "notes": "string (remarques sur la qualité du parsing)"
}`;

  const response = await anthropic.messages.create({
    model: "claude-3-5-haiku-20241022",
    max_tokens: 4096,
    messages: [
      {
        role: "user",
        content: userPrompt,
      },
    ],
    system: SYSTEM_PROMPT,
  });

  // Extract text content from response
  const textContent = response.content.find((block) => block.type === "text");
  if (textContent?.type !== "text") {
    throw new Error("No text response from AI");
  }

  // Parse JSON response
  const jsonText = textContent.text.trim();

  // Try to extract JSON from the response (in case there's markdown or extra text)
  const jsonMatch = jsonText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error("Invalid JSON response from AI");
  }

  // Parse as unknown first, then validate
  const rawResult = JSON.parse(jsonMatch[0]) as {
    components?: unknown[];
    confidence?: number;
    notes?: string;
  };

  // Validate structure
  if (!Array.isArray(rawResult.components)) {
    throw new Error("Invalid response structure: components is not an array");
  }

  // Ensure all required fields are present and properly typed
  type ComponentType = AIParseResult["components"][0]["type"];
  const validTypes: ComponentType[] = ["main_breaker", "differential", "circuit_breaker", "final_circuit"];

  const components = rawResult.components.map((comp) => {
    const c = comp as Record<string, unknown>;
    const rawType = c.type as string | undefined;
    const type: ComponentType = rawType && validTypes.includes(rawType as ComponentType)
      ? (rawType as ComponentType)
      : "circuit_breaker";

    return {
      repere: String(c.repere ?? ""),
      designation: String(c.designation ?? ""),
      protection: String(c.protection ?? ""),
      cable: c.cable ? String(c.cable) : null,
      parentRepere: c.parentRepere ? String(c.parentRepere) : null,
      type,
    };
  });

  return {
    components,
    confidence: rawResult.confidence ?? 0.8,
    notes: rawResult.notes ?? "",
  };
}

/**
 * Convert AI parsed components to the standard ParsedComponent format
 */
export function convertAIComponentsToParsed(
  aiComponents: AIParseResult["components"]
) {
  return aiComponents.map((comp) => ({
    repere: comp.repere,
    designation: comp.designation,
    protection: comp.protection,
    cable: comp.cable ?? undefined,
    parentRepere: comp.parentRepere ?? undefined,
    isDifferential: comp.type === "differential",
    isMainBreaker: comp.type === "main_breaker",
    isFinalCircuit: comp.type === "final_circuit",
  }));
}
