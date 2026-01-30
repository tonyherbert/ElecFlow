import type {
  AdjacencyEntry,
  Circuit,
  CircuitGraph,
  CircuitSimulationResult,
  ConductingFunction,
  CutoffPoint,
  LinkBehavior,
  PathFindingResult,
  PathSegment,
  ReceptorSimulationResult,
} from "../types/circuit.types";

function createConductingFunction(behavior: LinkBehavior): ConductingFunction {
  switch (behavior.type) {
    case "always_conducting":
      return () => true;
    case "normally_open":
      return (states) => states.get(behavior.stateId) ?? false;
    case "normally_closed":
      return (states) => !(states.get(behavior.stateId) ?? false);
  }
}

export function buildGraph(circuit: Circuit): CircuitGraph {
  const graph: CircuitGraph = new Map();

  for (const node of circuit.nodes) {
    graph.set(node.id, []);
  }

  for (const link of circuit.links) {
    const conductingFn = createConductingFunction(link.behavior);

    const forwardList = graph.get(link.fromNodeId);
    if (forwardList) {
      forwardList.push({
        linkId: link.id,
        linkName: link.name,
        targetNodeId: link.toNodeId,
        isConducting: conductingFn,
      });
    }

    const backwardList = graph.get(link.toNodeId);
    if (backwardList) {
      backwardList.push({
        linkId: link.id,
        linkName: link.name,
        targetNodeId: link.fromNodeId,
        isConducting: conductingFn,
      });
    }
  }

  return graph;
}

export function findPath(
  graph: CircuitGraph,
  _circuit: Circuit,
  sourceId: string,
  targetId: string,
  states: Map<string, boolean>,
  excludeNodes?: Set<string>
): PathFindingResult {
  const visited = new Set<string>();
  const queue: { nodeId: string; path: PathSegment[] }[] = [];
  let firstCutoffLinkId: string | undefined;

  queue.push({ nodeId: sourceId, path: [] });
  visited.add(sourceId);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    if (current.nodeId === targetId) {
      return { found: true, path: current.path };
    }

    const adjacentLinks = graph.get(current.nodeId);
    if (!adjacentLinks) continue;

    for (const link of adjacentLinks) {
      if (visited.has(link.targetNodeId)) continue;
      if (excludeNodes?.has(link.targetNodeId)) continue;

      const isConducting = link.isConducting(states);

      if (isConducting) {
        visited.add(link.targetNodeId);

        const segment: PathSegment = {
          linkId: link.linkId,
          linkName: link.linkName,
          fromNodeId: current.nodeId,
          toNodeId: link.targetNodeId,
          isConducting: true,
        };

        queue.push({
          nodeId: link.targetNodeId,
          path: [...current.path, segment],
        });
      } else if (!firstCutoffLinkId) {
        firstCutoffLinkId = link.linkId;
      }
    }
  }

  const cutoffLinkId = findCutoffPoint(graph, sourceId, targetId, states, excludeNodes);

  return {
    found: false,
    path: [],
    cutoffLinkId: cutoffLinkId ?? firstCutoffLinkId,
  };
}

function findCutoffPoint(
  graph: CircuitGraph,
  sourceId: string,
  targetId: string,
  states: Map<string, boolean>,
  excludeNodes?: Set<string>
): string | undefined {
  const visited = new Set<string>();
  const parent = new Map<string, { nodeId: string; link: AdjacencyEntry } | null>();

  const queue: string[] = [sourceId];
  visited.add(sourceId);
  parent.set(sourceId, null);

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current) continue;

    if (current === targetId) {
      let node = targetId;
      const pathLinks: AdjacencyEntry[] = [];

      let parentEntry = parent.get(node);
      while (parentEntry !== null && parentEntry !== undefined) {
        pathLinks.unshift(parentEntry.link);
        node = parentEntry.nodeId;
        parentEntry = parent.get(node);
      }

      for (const link of pathLinks) {
        if (!link.isConducting(states)) {
          return link.linkId;
        }
      }

      return undefined;
    }

    const adjacentLinks = graph.get(current);
    if (!adjacentLinks) continue;

    for (const link of adjacentLinks) {
      if (!visited.has(link.targetNodeId) && !excludeNodes?.has(link.targetNodeId)) {
        visited.add(link.targetNodeId);
        parent.set(link.targetNodeId, { nodeId: current, link });
        queue.push(link.targetNodeId);
      }
    }
  }

  return undefined;
}

function buildStateMap(
  states: Circuit["states"],
  overrides?: Record<string, boolean>
): Map<string, boolean> {
  const stateMap = new Map<string, boolean>();

  for (const state of states) {
    stateMap.set(state.id, overrides?.[state.id] ?? state.isActive);
  }

  return stateMap;
}

function getCutoffInfo(
  circuit: Circuit,
  linkId: string | undefined,
  states: Map<string, boolean>
): CutoffPoint | undefined {
  if (!linkId) return undefined;

  const link = circuit.links.find((l) => l.id === linkId);
  if (!link) return undefined;

  let reason: string;
  const behavior = link.behavior;

  switch (behavior.type) {
    case "always_conducting":
      reason = "Câble déconnecté";
      break;
    case "normally_open": {
      const stateName =
        circuit.states.find((s) => s.id === behavior.stateId)?.name ?? "Inconnu";
      const isActive = states.get(behavior.stateId) ?? false;
      reason = isActive
        ? `${stateName} est actif mais le contact ne conduit pas`
        : `${stateName} n'est pas actif (contact NO ouvert)`;
      break;
    }
    case "normally_closed": {
      const stateName =
        circuit.states.find((s) => s.id === behavior.stateId)?.name ?? "Inconnu";
      const isActive = states.get(behavior.stateId) ?? false;
      reason = isActive
        ? `${stateName} est actif (contact NC ouvert)`
        : `${stateName} n'est pas actif mais le contact ne conduit pas`;
      break;
    }
  }

  return { linkId, linkName: link.name, reason };
}

export function simulateCircuit(
  circuit: Circuit,
  stateOverrides?: Record<string, boolean>
): CircuitSimulationResult {
  const states = buildStateMap(circuit.states, stateOverrides);
  const graph = buildGraph(circuit);
  const results: ReceptorSimulationResult[] = [];
  const excludeNeutral = new Set([circuit.neutralNodeId]);

  for (const receptorId of circuit.receptorNodeIds) {
    const receptorNode = circuit.nodes.find((n) => n.id === receptorId);
    const receptorName = receptorNode?.name ?? receptorId;

    const toReceptor = findPath(
      graph,
      circuit,
      circuit.sourceNodeId,
      receptorId,
      states,
      excludeNeutral
    );

    const toNeutral = findPath(
      graph,
      circuit,
      receptorId,
      circuit.neutralNodeId,
      states
    );

    const isPowered = toReceptor.found && toNeutral.found;

    const activePath = isPowered ? [...toReceptor.path, ...toNeutral.path] : null;

    const cutoffLinkId = !isPowered
      ? toReceptor.cutoffLinkId ?? toNeutral.cutoffLinkId
      : undefined;

    const cutoffPoint = getCutoffInfo(circuit, cutoffLinkId, states);

    results.push({
      receptorId,
      receptorName,
      isPowered,
      activePath,
      cutoffPoint,
    });
  }

  const finalStates = circuit.states.map((s) => ({
    ...s,
    isActive: states.get(s.id) ?? s.isActive,
  }));

  return {
    circuitId: circuit.id,
    circuitName: circuit.name,
    states: finalStates,
    results,
    timestamp: new Date(),
  };
}

export function createSimpleLightingCircuit(id = "test-1"): Circuit {
  return {
    id,
    name: "Circuit Éclairage Simple",
    description: "Phase -> Disjoncteur -> Interrupteur -> Lampe -> Neutre",
    nodes: [
      { id: "phase", name: "Phase", type: "source" },
      { id: "breaker-out", name: "Sortie Disjoncteur", type: "intermediate" },
      { id: "switch-out", name: "Sortie Interrupteur", type: "intermediate" },
      { id: "lamp", name: "Lampe", type: "receptor" },
      { id: "neutral", name: "Neutre", type: "neutral" },
    ],
    links: [
      {
        id: "l1",
        name: "Phase vers Disjoncteur",
        fromNodeId: "phase",
        toNodeId: "breaker-out",
        behavior: { type: "normally_closed", stateId: "breaker" },
      },
      {
        id: "l2",
        name: "Disjoncteur vers Interrupteur",
        fromNodeId: "breaker-out",
        toNodeId: "switch-out",
        behavior: { type: "normally_open", stateId: "switch" },
      },
      {
        id: "l3",
        name: "Interrupteur vers Lampe",
        fromNodeId: "switch-out",
        toNodeId: "lamp",
        behavior: { type: "always_conducting" },
      },
      {
        id: "l4",
        name: "Lampe vers Neutre",
        fromNodeId: "lamp",
        toNodeId: "neutral",
        behavior: { type: "always_conducting" },
      },
    ],
    states: [
      { id: "breaker", name: "Disjoncteur", isActive: false },
      { id: "switch", name: "Interrupteur", isActive: false },
    ],
    sourceNodeId: "phase",
    neutralNodeId: "neutral",
    receptorNodeIds: ["lamp"],
  };
}
