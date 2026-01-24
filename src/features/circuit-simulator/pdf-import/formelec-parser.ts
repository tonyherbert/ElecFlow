import type { ParsedComponent, ParsedPdfResult } from "./types";

const REPERE_PATTERN = /^(Q\d+(?:\.\d+)?)\b/;
const PROTECTION_PATTERN = /(\d+A(?:\s*\/\s*\d+mA)?)/;
const CABLE_PATTERN = /(\d+G\d+(?:\.\d+)?)/;

export function parseFormelecText(text: string, documentName: string): ParsedPdfResult {
  const components: ParsedComponent[] = [];
  const errors: string[] = [];

  const normalizedText = text.replace(/[ \t]+/g, " ").replace(/\r\n/g, "\n");
  const lines = normalizedText.split("\n").map((l) => l.trim());

  let currentRepere: string | null = null;
  let currentDesignation = "";
  let currentCable: string | undefined;
  let currentProtection = "";

  for (const line of lines) {
    if (!line) continue;

    const repereMatch = line.match(REPERE_PATTERN);

    if (repereMatch) {
      if (currentRepere && currentProtection) {
        components.push(
          createComponent(currentRepere, currentDesignation, currentCable, currentProtection)
        );
      }

      currentRepere = repereMatch[1];
      currentDesignation = "";
      currentCable = undefined;
      currentProtection = "";

      const restOfLine = line.substring(repereMatch[0].length).trim();
      if (restOfLine) {
        const protMatch = restOfLine.match(PROTECTION_PATTERN);
        if (protMatch) {
          currentProtection = protMatch[1];
          currentDesignation = restOfLine.replace(protMatch[0], "").trim().replace(/\s+/g, " ");
        } else {
          currentDesignation = restOfLine;
        }

        const cableMatch = restOfLine.match(CABLE_PATTERN);
        if (cableMatch) {
          currentCable = cableMatch[1];
          currentDesignation = currentDesignation.replace(cableMatch[0], "").trim();
        }
      }
    } else if (currentRepere) {
      const protMatch = line.match(PROTECTION_PATTERN);
      if (protMatch && !currentProtection) {
        currentProtection = protMatch[1];
      }

      const cableMatch = line.match(CABLE_PATTERN);
      if (cableMatch && !currentCable) {
        currentCable = cableMatch[1];
      }

      if (
        !protMatch &&
        !cableMatch &&
        !line.match(/^(Repère|Désignation|Câble|Protection|Folio)/i)
      ) {
        if (line.length > 2 && !line.match(/^\d+$/)) {
          currentDesignation = currentDesignation
            ? `${currentDesignation} ${line}`
            : line;
        }
      }
    }
  }

  if (currentRepere && currentProtection) {
    components.push(
      createComponent(currentRepere, currentDesignation, currentCable, currentProtection)
    );
  }

  const uniqueComponents = deduplicateComponents(components);
  uniqueComponents.sort(compareReperes);

  if (uniqueComponents.length === 0) {
    errors.push("Aucun composant détecté. Vérifiez que le PDF est au format Formelec.");
  }

  return { documentName, components: uniqueComponents, errors, rawText: text };
}

function createComponent(
  repere: string,
  designation: string,
  cable: string | undefined,
  protection: string
): ParsedComponent {
  const isDifferential = /mA/i.test(protection);
  const isMainBreaker = repere === "Q1";
  const isFinalCircuit = Boolean(cable) && !isDifferential && !isMainBreaker;

  let parentRepere: string | undefined;
  if (repere.includes(".")) {
    parentRepere = repere.split(".")[0];
  }

  const cleanDesignation = designation
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^[-–—]\s*/, "");

  return {
    repere,
    designation: cleanDesignation || `Composant ${repere}`,
    cable,
    protection,
    parentRepere,
    isDifferential,
    isMainBreaker,
    isFinalCircuit,
  };
}

function deduplicateComponents(components: ParsedComponent[]): ParsedComponent[] {
  const byRepere = new Map<string, ParsedComponent>();

  for (const comp of components) {
    const existing = byRepere.get(comp.repere);
    if (!existing) {
      byRepere.set(comp.repere, comp);
    } else {
      const existingScore =
        (existing.designation ? 1 : 0) +
        (existing.cable ? 1 : 0) +
        (existing.protection.length > 3 ? 1 : 0);
      const newScore =
        (comp.designation ? 1 : 0) + (comp.cable ? 1 : 0) + (comp.protection.length > 3 ? 1 : 0);

      if (newScore > existingScore) {
        byRepere.set(comp.repere, comp);
      }
    }
  }

  return Array.from(byRepere.values());
}

function compareReperes(a: ParsedComponent, b: ParsedComponent): number {
  const partsA = a.repere.replace("Q", "").split(".").map(Number);
  const partsB = b.repere.replace("Q", "").split(".").map(Number);

  if (partsA[0] !== partsB[0]) {
    return partsA[0] - partsB[0];
  }

  const subA = partsA[1] ?? -1;
  const subB = partsB[1] ?? -1;

  return subA - subB;
}

export function buildComponentHierarchy(
  components: ParsedComponent[]
): Map<string, ParsedComponent[]> {
  const hierarchy = new Map<string, ParsedComponent[]>();
  const topLevel: ParsedComponent[] = [];

  for (const comp of components) {
    if (!comp.parentRepere) {
      topLevel.push(comp);
      hierarchy.set(comp.repere, []);
    }
  }

  hierarchy.set("root", topLevel);

  for (const comp of components) {
    if (comp.parentRepere) {
      const children = hierarchy.get(comp.parentRepere) ?? [];
      children.push(comp);
      hierarchy.set(comp.parentRepere, children);
    }
  }

  return hierarchy;
}
