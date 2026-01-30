import type { ParsedComponent } from "../pdf-import/types";

/**
 * Compares two repere strings for sorting
 * Handles format like "Q1", "Q2", "Q2.1", "Q2.10", "Q3"
 */
function compareReperes(a: string, b: string): number {
  const partsA = a.replace("Q", "").split(".").map(Number);
  const partsB = b.replace("Q", "").split(".").map(Number);

  // Compare main number first
  if (partsA[0] !== partsB[0]) {
    return partsA[0] - partsB[0];
  }

  // Compare sub-number (default to -1 if not present)
  return (partsA[1] ?? -1) - (partsB[1] ?? -1);
}

/**
 * Normalizes protection string for consistent matching
 * Removes spaces and converts to uppercase
 */
function normalizeProtection(protection: string): string {
  return protection.replace(/\s+/g, "").toUpperCase();
}

/**
 * Generates a structural fingerprint for version matching.
 * Format: "Q1:63A|Q2:25A/30MA|Q2.1:10A|..."
 *
 * This fingerprint captures the essential structure of a plan:
 * - Component references (Q1, Q2.1, etc.)
 * - Protection values (10A, 25A/30mA, etc.)
 *
 * Two plans with the same fingerprint are considered the same plan,
 * even if designations or other details differ.
 */
export function computeCircuitFingerprint(components: ParsedComponent[]): string {
  // Sort components by repere for consistent ordering
  const sorted = [...components].sort((a, b) => compareReperes(a.repere, b.repere));

  // Create fingerprint string
  return sorted
    .map((c) => `${c.repere}:${normalizeProtection(c.protection)}`)
    .join("|");
}
