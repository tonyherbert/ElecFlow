"use client";

import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type NodeTypes,
  MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useEffect, useMemo } from "react";

import type { Circuit, CircuitSimulationResult, CircuitLink } from "../../types/circuit.types";
import { CircuitNodeComponent, type CircuitNodeData } from "./circuit-node";

type CircuitDiagramProps = {
  circuit: Circuit;
  stateOverrides: Record<string, boolean>;
  result: CircuitSimulationResult | null;
  onToggleState: (stateId: string) => void;
};

// Custom node types
const nodeTypes: NodeTypes = {
  circuitNode: CircuitNodeComponent,
};

/**
 * Build adjacency map from circuit links
 * Returns a map of nodeId -> outgoing links
 */
function buildAdjacencyMap(links: CircuitLink[]): Map<string, CircuitLink[]> {
  const adjacency = new Map<string, CircuitLink[]>();
  for (const link of links) {
    const existing = adjacency.get(link.fromNodeId) ?? [];
    existing.push(link);
    adjacency.set(link.fromNodeId, existing);
  }
  return adjacency;
}

/**
 * Compute node levels using BFS from source
 * Returns a map of nodeId -> level (distance from source)
 */
function computeNodeLevels(
  sourceNodeId: string,
  adjacency: Map<string, CircuitLink[]>
): Map<string, number> {
  const levels = new Map<string, number>();
  const queue: { nodeId: string; level: number }[] = [{ nodeId: sourceNodeId, level: 0 }];

  while (queue.length > 0) {
    const item = queue.shift();
    if (!item) continue;
    const { nodeId, level } = item;

    if (levels.has(nodeId)) continue;
    levels.set(nodeId, level);

    const outgoingLinks = adjacency.get(nodeId) ?? [];
    for (const link of outgoingLinks) {
      if (!levels.has(link.toNodeId)) {
        queue.push({ nodeId: link.toNodeId, level: level + 1 });
      }
    }
  }

  return levels;
}

/**
 * Transform circuit data into React Flow nodes and edges
 * Uses actual circuit topology from links, not naming conventions
 */
function buildFlowElements(
  circuit: Circuit,
  stateOverrides: Record<string, boolean>,
  result: CircuitSimulationResult | null,
  onToggleState: (stateId: string) => void
): { nodes: Node<CircuitNodeData>[]; edges: Edge[] } {
  const flowNodes: Node<CircuitNodeData>[] = [];
  const flowEdges: Edge[] = [];

  // Build adjacency map from links
  const adjacency = buildAdjacencyMap(circuit.links);

  // Compute levels for each circuit node
  const nodeLevels = computeNodeLevels(circuit.sourceNodeId, adjacency);

  // Map stateId to link and state info
  const stateIdToLink = new Map<string, CircuitLink>();
  const stateIdToState = new Map<string, typeof circuit.states[0]>();

  for (const link of circuit.links) {
    if (link.behavior.type === "normally_open" || link.behavior.type === "normally_closed") {
      stateIdToLink.set(link.behavior.stateId, link);
    }
  }

  for (const state of circuit.states) {
    stateIdToState.set(state.id, state);
  }

  // Helper to check if a receptor is powered
  const isReceptorPowered = (nodeId: string): boolean => {
    if (!result) return false;
    const receptorResult = result.results.find((r) => r.receptorId === nodeId);
    return receptorResult?.isPowered ?? false;
  };

  // Helper to check if a link is currently conducting
  const isLinkConducting = (link: CircuitLink): boolean => {
    if (link.behavior.type === "always_conducting") return true;
    const stateId = link.behavior.stateId;
    const state = stateIdToState.get(stateId);
    const isActive = stateId in stateOverrides
      ? stateOverrides[stateId]
      : (state?.isActive ?? false);

    // Both normally_closed and normally_open conduct when active
    return isActive;
  };

  // Check if a node is powered by tracing back to source
  const isNodePowered = (nodeId: string): boolean => {
    if (nodeId === circuit.sourceNodeId) return true;
    if (!result) return false;

    // Check if any powered receptor's path passes through this node
    for (const res of result.results) {
      if (res.isPowered && res.activePath) {
        for (const seg of res.activePath) {
          if (seg.toNodeId === nodeId && seg.isConducting) {
            return true;
          }
        }
      }
    }
    return false;
  };

  // Layout configuration
  const HORIZONTAL_GAP = 180;
  const VERTICAL_GAP = 150;
  const START_X = 400;
  const START_Y = 50;

  // Group nodes by their level for positioning
  const nodesByLevel = new Map<number, string[]>();
  for (const [nodeId, level] of nodeLevels) {
    const existing = nodesByLevel.get(level) ?? [];
    existing.push(nodeId);
    nodesByLevel.set(level, existing);
  }

  // Track which visual nodes we've created (for links with states, we create state nodes)
  const circuitNodeToVisualNode = new Map<string, string>();
  const stateToVisualNode = new Map<string, string>();

  // Process source node (level 0)
  const sourceNode = circuit.nodes.find((n) => n.id === circuit.sourceNodeId);
  if (sourceNode) {
    flowNodes.push({
      id: sourceNode.id,
      type: "circuitNode",
      position: { x: START_X, y: START_Y },
      data: {
        label: sourceNode.name,
        nodeType: "source",
        isPowered: true,
      },
    });
    circuitNodeToVisualNode.set(sourceNode.id, sourceNode.id);
  }

  // Process links with states - these become visual breaker/differential nodes
  // Group links by their source node for proper layout
  const linksByFromNode = new Map<string, CircuitLink[]>();
  for (const link of circuit.links) {
    if (link.behavior.type === "normally_open" || link.behavior.type === "normally_closed") {
      const existing = linksByFromNode.get(link.fromNodeId) ?? [];
      existing.push(link);
      linksByFromNode.set(link.fromNodeId, existing);
    }
  }

  // Determine level for each state based on the source node of its link
  const stateToLevel = new Map<string, number>();
  for (const link of circuit.links) {
    if (link.behavior.type === "normally_open" || link.behavior.type === "normally_closed") {
      const fromLevel = nodeLevels.get(link.fromNodeId) ?? 0;
      stateToLevel.set(link.behavior.stateId, fromLevel + 1);
    }
  }

  // Group states by level for positioning
  const statesByLevel = new Map<number, string[]>();
  for (const [stateId, level] of stateToLevel) {
    const existing = statesByLevel.get(level) ?? [];
    existing.push(stateId);
    statesByLevel.set(level, existing);
  }

  // Create visual nodes for each state (breaker/differential)
  for (const [level, stateIds] of statesByLevel) {
    stateIds.forEach((stateId, index) => {
      const state = stateIdToState.get(stateId);
      const link = stateIdToLink.get(stateId);
      if (!state || !link) return;

      const isDifferential =
        state.name.toLowerCase().includes("diff") ||
        link.name.toLowerCase().includes("diff") ||
        link.name.includes("mA");

      const isActive = stateId in stateOverrides ? stateOverrides[stateId] : state.isActive;
      const isPowered = isNodePowered(link.fromNodeId) && isActive;
      const xPos = START_X + (index - (stateIds.length - 1) / 2) * HORIZONTAL_GAP;
      const yPos = START_Y + level * VERTICAL_GAP;

      const visualNodeId = `state-${stateId}`;
      flowNodes.push({
        id: visualNodeId,
        type: "circuitNode",
        position: { x: xPos, y: yPos },
        data: {
          label: state.name,
          nodeType: isDifferential ? "differential" : "breaker",
          isActive,
          isPowered,
          stateId,
          onToggle: onToggleState,
        },
      });

      stateToVisualNode.set(stateId, visualNodeId);
      // Map the target circuit node to this visual node (for edge connections)
      circuitNodeToVisualNode.set(link.toNodeId, visualNodeId);
    });
  }

  // Create edges based on actual circuit topology
  for (const link of circuit.links) {
    if (link.behavior.type === "normally_open" || link.behavior.type === "normally_closed") {
      const stateId = link.behavior.stateId;
      const targetVisualNode = stateToVisualNode.get(stateId);
      if (!targetVisualNode) continue;

      // Find the source visual node
      // It could be the source node itself, or another state node
      let sourceVisualNode: string | undefined;

      // Check if the fromNode is the circuit source
      if (link.fromNodeId === circuit.sourceNodeId) {
        sourceVisualNode = circuit.sourceNodeId;
      } else {
        // Find a link that targets the fromNode and has a state
        const incomingLink = circuit.links.find(
          l => l.toNodeId === link.fromNodeId &&
          (l.behavior.type === "normally_open" || l.behavior.type === "normally_closed")
        );
        if (incomingLink && (incomingLink.behavior.type === "normally_open" || incomingLink.behavior.type === "normally_closed")) {
          sourceVisualNode = stateToVisualNode.get(incomingLink.behavior.stateId);
        }
      }

      if (sourceVisualNode) {
        const isConducting = isLinkConducting(link);
        const sourceIsPowered = sourceVisualNode === circuit.sourceNodeId ||
          (flowNodes.find(n => n.id === sourceVisualNode)?.data.isPowered ?? false);
        const edgePowered = sourceIsPowered && isConducting;

        flowEdges.push({
          id: `edge-${sourceVisualNode}-${targetVisualNode}`,
          source: sourceVisualNode,
          target: targetVisualNode,
          style: {
            stroke: edgePowered ? "var(--powered)" : "var(--muted-foreground)",
            strokeWidth: 2,
          },
          animated: edgePowered,
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: edgePowered ? "var(--powered)" : "var(--muted-foreground)",
          },
        });
      }
    }
  }

  // Find the maximum level used for positioning receptors
  const maxStateLevel = Math.max(...Array.from(statesByLevel.keys()), 0);
  const receptorLevel = maxStateLevel + 1;

  // Process receptor nodes
  const receptorNodes = circuit.nodes.filter((n) => circuit.receptorNodeIds.includes(n.id));
  receptorNodes.forEach((receptor, index) => {
    const isPowered = isReceptorPowered(receptor.id);
    const xPos = START_X + (index - (receptorNodes.length - 1) / 2) * HORIZONTAL_GAP;
    const yPos = START_Y + receptorLevel * VERTICAL_GAP;

    flowNodes.push({
      id: receptor.id,
      type: "circuitNode",
      position: { x: xPos, y: yPos },
      data: {
        label: receptor.name,
        nodeType: "receptor",
        isPowered,
      },
    });

    // Find the link that connects to this receptor
    const incomingLink = circuit.links.find((l) => l.toNodeId === receptor.id);
    if (incomingLink) {
      const behavior = incomingLink.behavior;
      if (behavior.type === "normally_open" || behavior.type === "normally_closed") {
        const sourceVisualNode = stateToVisualNode.get(behavior.stateId);
        if (sourceVisualNode) {
          flowEdges.push({
            id: `edge-to-${receptor.id}`,
            source: sourceVisualNode,
            target: receptor.id,
            style: {
              stroke: isPowered ? "var(--powered)" : "var(--muted-foreground)",
              strokeWidth: 2,
            },
            animated: isPowered,
          });
        }
      }
    }
  });

  // Add neutral node at the bottom
  const neutralNode = circuit.nodes.find((n) => n.id === circuit.neutralNodeId);
  if (neutralNode) {
    const neutralLevel = receptorLevel + 1;
    flowNodes.push({
      id: neutralNode.id,
      type: "circuitNode",
      position: { x: START_X, y: START_Y + neutralLevel * VERTICAL_GAP },
      data: {
        label: neutralNode.name,
        nodeType: "neutral",
      },
    });

    // Edges from receptors to neutral
    for (const receptor of receptorNodes) {
      const isPowered = isReceptorPowered(receptor.id);
      flowEdges.push({
        id: `edge-${receptor.id}-neutral`,
        source: receptor.id,
        target: neutralNode.id,
        style: {
          stroke: isPowered ? "var(--powered)" : "var(--muted-foreground)",
          strokeWidth: 1.5,
          strokeDasharray: isPowered ? undefined : "5,5",
        },
        animated: isPowered,
      });
    }
  }

  return { nodes: flowNodes, edges: flowEdges };
}

export function CircuitDiagram({
  circuit,
  stateOverrides,
  result,
  onToggleState,
}: CircuitDiagramProps) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildFlowElements(circuit, stateOverrides, result, onToggleState),
    [circuit, stateOverrides, result, onToggleState]
  );

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Update nodes and edges when props change
  useEffect(() => {
    const { nodes: newNodes, edges: newEdges } = buildFlowElements(
      circuit,
      stateOverrides,
      result,
      onToggleState
    );
    setNodes(newNodes);
    setEdges(newEdges);
  }, [circuit, stateOverrides, result, onToggleState, setNodes, setEdges]);

  return (
    <div className="h-[600px] w-full overflow-hidden rounded-xl border bg-card">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 0.3 }}
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background color="hsl(var(--muted-foreground) / 0.1)" gap={20} />
        <Controls className="rounded-lg border bg-background shadow-md" />
        <MiniMap
          className="rounded-lg border bg-background shadow-md"
          maskColor="hsl(var(--background) / 0.8)"
          nodeColor={(node) => {
            const data = node.data as CircuitNodeData;
            if (data.nodeType === "source") return "hsl(var(--primary))";
            if (data.nodeType === "neutral") return "hsl(var(--muted-foreground))";
            if (data.isPowered) return "hsl(var(--powered))";
            return "hsl(var(--muted-foreground))";
          }}
        />
      </ReactFlow>
    </div>
  );
}
