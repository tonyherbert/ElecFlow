/**
 * Types for PDF import and Formelec parsing
 */

/**
 * A component parsed from the Formelec PDF
 * Represents a circuit breaker, differential, or other protective device
 */
export type ParsedComponent = {
  /** Reference code (e.g., "Q2.1", "Q3") */
  repere: string;
  /** Description (e.g., "Eclairage Chambre 1") */
  designation: string;
  /** Cable specification (e.g., "3G1.5", "3G2.5") */
  cable?: string;
  /** Protection rating (e.g., "10A", "25A / 30mA") */
  protection: string;
  /** Parent reference (e.g., "Q2" for "Q2.1") - derived from hierarchy */
  parentRepere?: string;
  /** True if this is a differential (has "mA" in protection) */
  isDifferential: boolean;
  /** True if this is the main breaker (Q1) */
  isMainBreaker: boolean;
  /** True if this is a final circuit (has cable specification) */
  isFinalCircuit: boolean;
};

/**
 * Result of parsing a Formelec PDF
 */
export type ParsedPdfResult = {
  /** Name extracted from PDF (document title) */
  documentName: string;
  /** List of parsed components */
  components: ParsedComponent[];
  /** Any parsing errors encountered */
  errors: string[];
  /** Raw text extracted (for debugging) */
  rawText?: string;
};

/**
 * Hierarchical representation of components
 */
export type ComponentHierarchy = {
  /** The component */
  component: ParsedComponent;
  /** Child components (e.g., Q2.1, Q2.2 under Q2) */
  children: ComponentHierarchy[];
};

/**
 * Component type for AI parsing
 */
export type ComponentType =
  | "main_breaker"
  | "differential"
  | "circuit_breaker"
  | "final_circuit";

/**
 * A component parsed by AI from the PDF text
 */
export type AIParserComponent = {
  /** Reference code (e.g., "Q1", "Q2.1", "F1") */
  repere: string;
  /** Description (e.g., "Éclairage Chambre 1") */
  designation: string;
  /** Protection rating (e.g., "10A", "25A/30mA") */
  protection: string;
  /** Cable specification (e.g., "3G1.5", "3G2.5") */
  cable: string | null;
  /** Parent reference (e.g., "Q2" for "Q2.1") */
  parentRepere: string | null;
  /** Component type */
  type: ComponentType;
};

/**
 * Result of AI parsing
 */
export type AIParseResult = {
  /** List of detected components */
  components: AIParserComponent[];
  /** Confidence score (0-1) */
  confidence: number;
  /** Optional notes about parsing quality */
  notes: string;
};

/**
 * Result of building a circuit from parsed data
 */
export type CircuitBuildResult = {
  /** Whether the build was successful */
  success: boolean;
  /** Circuit data ready for creation (if success) */
  circuitInput?: {
    name: string;
    description?: string;
    nodes: {
      id: string;
      name: string;
      type: "source" | "intermediate" | "receptor" | "neutral";
    }[];
    links: {
      id: string;
      name: string;
      fromNodeId: string;
      toNodeId: string;
      behavior:
        | { type: "always_conducting" }
        | { type: "normally_open"; stateId: string }
        | { type: "normally_closed"; stateId: string };
    }[];
    states: {
      id: string;
      name: string;
      isActive: boolean;
    }[];
    sourceNodeId: string;
    neutralNodeId: string;
    receptorNodeIds: string[];
  };
  /** Errors if build failed */
  errors: string[];
};
