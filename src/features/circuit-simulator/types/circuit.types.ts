/**
 * Circuit Simulator Domain Types
 *
 * These types represent the logical model for electrical circuit simulation.
 * The focus is on logical flow verification, not physical simulation.
 */

// =============================================================================
// Node Types
// =============================================================================

/**
 * Type of electrical node in the circuit
 * - source: Starting point (e.g., phase)
 * - intermediate: Connection point between components
 * - receptor: Device to be powered (e.g., lamp)
 * - neutral: Return point (e.g., neutral)
 */
export type NodeType = "source" | "intermediate" | "receptor" | "neutral";

/**
 * Represents a point in the electrical circuit
 */
export type CircuitNode = {
  id: string;
  name: string;
  type: NodeType;
  description?: string;
};

// =============================================================================
// Link Types
// =============================================================================

/**
 * Behavior of an electrical link/connection
 * - always_conducting: Cable/wire that always conducts
 * - normally_open (NO): Contact that is open by default, closes when state is active
 * - normally_closed (NC): Contact that is closed by default, opens when state is active
 */
export type LinkBehavior =
  | { type: "always_conducting" }
  | { type: "normally_open"; stateId: string }
  | { type: "normally_closed"; stateId: string };

/**
 * Represents a connection between two nodes
 */
export type CircuitLink = {
  id: string;
  name: string;
  fromNodeId: string;
  toNodeId: string;
  behavior: LinkBehavior;
  description?: string;
};

// =============================================================================
// State Types
// =============================================================================

/**
 * Represents the state of a controllable element (switch, relay contact, etc.)
 * When isActive is true:
 * - NO (normally_open) contacts close (conduct)
 * - NC (normally_closed) contacts open (do not conduct)
 */
export type ControlState = {
  id: string;
  name: string;
  isActive: boolean;
};

// =============================================================================
// Circuit Types
// =============================================================================

/**
 * Complete circuit definition
 */
export type Circuit = {
  id: string;
  name: string;
  description?: string;
  nodes: CircuitNode[];
  links: CircuitLink[];
  states: ControlState[];
  sourceNodeId: string;
  neutralNodeId: string;
  receptorNodeIds: string[];
};

/**
 * Circuit definition without ID (for creation)
 */
export type CircuitInput = Omit<Circuit, "id">;

// =============================================================================
// Simulation Result Types
// =============================================================================

/**
 * Represents a segment of the path through the circuit
 */
export type PathSegment = {
  linkId: string;
  linkName: string;
  fromNodeId: string;
  toNodeId: string;
  isConducting: boolean;
};

/**
 * Information about where the circuit is interrupted
 */
export type CutoffPoint = {
  linkId: string;
  linkName: string;
  reason: string;
};

/**
 * Result for a single receptor
 */
export type ReceptorSimulationResult = {
  receptorId: string;
  receptorName: string;
  isPowered: boolean;
  activePath: PathSegment[] | null;
  cutoffPoint?: CutoffPoint;
};

/**
 * Complete simulation result for a circuit
 */
export type CircuitSimulationResult = {
  circuitId: string;
  circuitName: string;
  states: ControlState[];
  results: ReceptorSimulationResult[];
  timestamp: Date;
};

// =============================================================================
// Graph Types (Internal)
// =============================================================================

/**
 * Function type for checking if a link conducts given current states
 */
export type ConductingFunction = (states: Map<string, boolean>) => boolean;

/**
 * Adjacency list entry for graph traversal
 */
export type AdjacencyEntry = {
  linkId: string;
  linkName: string;
  targetNodeId: string;
  isConducting: ConductingFunction;
};

/**
 * Graph representation of the circuit for traversal
 */
export type CircuitGraph = Map<string, AdjacencyEntry[]>;

/**
 * Result of path finding algorithm
 */
export type PathFindingResult = {
  found: boolean;
  path: PathSegment[];
  cutoffLinkId?: string;
};
