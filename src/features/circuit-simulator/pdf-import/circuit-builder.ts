import { nanoid } from "nanoid";
import type { ParsedComponent, ParsedPdfResult, CircuitBuildResult } from "./types";

type NodeInput = {
  id: string;
  name: string;
  type: "source" | "intermediate" | "receptor" | "neutral";
};

type LinkInput = {
  id: string;
  name: string;
  fromNodeId: string;
  toNodeId: string;
  behavior:
    | { type: "always_conducting" }
    | { type: "normally_open"; stateId: string }
    | { type: "normally_closed"; stateId: string };
};

type StateInput = {
  id: string;
  name: string;
  isActive: boolean;
};

export function buildCircuitFromParsed(parsed: ParsedPdfResult): CircuitBuildResult {
  const errors: string[] = [];

  if (parsed.components.length === 0) {
    return { success: false, errors: ["Aucun composant trouvé dans le PDF"] };
  }

  const nodes: NodeInput[] = [];
  const links: LinkInput[] = [];
  const states: StateInput[] = [];
  const receptorNodeIds: string[] = [];

  const componentToNode = new Map<string, string>();
  const componentToState = new Map<string, string>();

  const sourceNodeId = nanoid(8);
  nodes.push({ id: sourceNodeId, name: "Phase (Source)", type: "source" });

  const neutralNodeId = nanoid(8);
  nodes.push({ id: neutralNodeId, name: "Neutre", type: "neutral" });

  const mainBreaker = parsed.components.find((c) => c.isMainBreaker);
  if (!mainBreaker) {
    errors.push("Interrupteur général (Q1) non trouvé");
  }

  const differentials = parsed.components.filter(
    (c) => !c.isMainBreaker && (c.isDifferential || (!c.isFinalCircuit && !c.parentRepere))
  );

  const finalCircuits = parsed.components.filter(
    (c) => c.isFinalCircuit || (c.parentRepere && !c.isMainBreaker && !c.isDifferential)
  );

  if (mainBreaker) {
    const igNodeId = nanoid(8);
    const igStateId = nanoid(8);

    nodes.push({
      id: igNodeId,
      name: `${mainBreaker.repere} - ${mainBreaker.designation}`,
      type: "intermediate",
    });

    states.push({
      id: igStateId,
      name: `${mainBreaker.repere} (${mainBreaker.protection})`,
      isActive: false,
    });

    componentToNode.set(mainBreaker.repere, igNodeId);
    componentToState.set(mainBreaker.repere, igStateId);

    links.push({
      id: nanoid(8),
      name: `Source → ${mainBreaker.repere}`,
      fromNodeId: sourceNodeId,
      toNodeId: igNodeId,
      behavior: { type: "normally_closed", stateId: igStateId },
    });
  }

  for (const diff of differentials) {
    const diffNodeId = nanoid(8);
    const diffStateId = nanoid(8);

    nodes.push({
      id: diffNodeId,
      name: `${diff.repere} - ${diff.designation}`,
      type: "intermediate",
    });

    states.push({
      id: diffStateId,
      name: `${diff.repere} (${diff.protection})`,
      isActive: false,
    });

    componentToNode.set(diff.repere, diffNodeId);
    componentToState.set(diff.repere, diffStateId);

    const fromNodeId = mainBreaker
      ? componentToNode.get(mainBreaker.repere) ?? sourceNodeId
      : sourceNodeId;

    links.push({
      id: nanoid(8),
      name: `${mainBreaker?.repere ?? "Source"} → ${diff.repere}`,
      fromNodeId,
      toNodeId: diffNodeId,
      behavior: { type: "normally_closed", stateId: diffStateId },
    });
  }

  for (const circuit of finalCircuits) {
    const receptorNodeId = nanoid(8);
    const circuitStateId = nanoid(8);

    nodes.push({
      id: receptorNodeId,
      name: circuit.designation || `Récepteur ${circuit.repere}`,
      type: "receptor",
    });

    states.push({
      id: circuitStateId,
      name: `${circuit.repere} (${circuit.protection})`,
      isActive: false,
    });

    componentToNode.set(circuit.repere, receptorNodeId);
    componentToState.set(circuit.repere, circuitStateId);
    receptorNodeIds.push(receptorNodeId);

    const parentNodeId = circuit.parentRepere
      ? componentToNode.get(circuit.parentRepere)
      : mainBreaker
        ? componentToNode.get(mainBreaker.repere)
        : sourceNodeId;

    if (!parentNodeId) {
      errors.push(`Parent ${circuit.parentRepere} non trouvé pour ${circuit.repere}`);
      continue;
    }

    links.push({
      id: nanoid(8),
      name: `${circuit.parentRepere ?? "Source"} → ${circuit.repere} (${circuit.cable ?? "câble"})`,
      fromNodeId: parentNodeId,
      toNodeId: receptorNodeId,
      behavior: { type: "normally_closed", stateId: circuitStateId },
    });

    links.push({
      id: nanoid(8),
      name: `${circuit.repere} → Neutre`,
      fromNodeId: receptorNodeId,
      toNodeId: neutralNodeId,
      behavior: { type: "always_conducting" },
    });
  }

  const orphans = parsed.components.filter(
    (c) => !c.isMainBreaker && !differentials.includes(c) && !finalCircuits.includes(c)
  );

  for (const orphan of orphans) {
    errors.push(`Composant orphelin détecté: ${orphan.repere} - ${orphan.designation}`);
  }

  if (receptorNodeIds.length === 0) {
    errors.push("Aucun récepteur (circuit final) détecté");
    return { success: false, errors };
  }

  return {
    success: true,
    circuitInput: {
      name: parsed.documentName.replace(/\.pdf$/i, ""),
      description: `Importé depuis ${parsed.documentName} - ${parsed.components.length} composants`,
      nodes,
      links,
      states,
      sourceNodeId,
      neutralNodeId,
      receptorNodeIds,
    },
    errors,
  };
}

export function getCircuitSummary(parsed: ParsedPdfResult): {
  mainBreaker: ParsedComponent | undefined;
  differentials: ParsedComponent[];
  finalCircuits: ParsedComponent[];
  orphans: ParsedComponent[];
} {
  const mainBreaker = parsed.components.find((c) => c.isMainBreaker);
  const differentials = parsed.components.filter(
    (c) => !c.isMainBreaker && (c.isDifferential || (!c.isFinalCircuit && !c.parentRepere))
  );
  const finalCircuits = parsed.components.filter(
    (c) => c.isFinalCircuit || (c.parentRepere && !c.isMainBreaker && !c.isDifferential)
  );
  const orphans = parsed.components.filter(
    (c) => !c.isMainBreaker && !differentials.includes(c) && !finalCircuits.includes(c)
  );

  return { mainBreaker, differentials, finalCircuits, orphans };
}
