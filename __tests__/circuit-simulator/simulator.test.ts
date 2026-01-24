import {
  buildGraph,
  createSimpleLightingCircuit,
  findPath,
  simulateCircuit,
} from "@/features/circuit-simulator/engine/simulator";
import type { Circuit } from "@/features/circuit-simulator/types/circuit.types";
import { describe, expect, it } from "vitest";

describe("Circuit Simulator", () => {
  describe("Simple Lighting Circuit", () => {
    const circuit = createSimpleLightingCircuit();

    it("should show lamp NOT powered when switch is open (default state)", () => {
      const result = simulateCircuit(circuit);

      expect(result.results).toHaveLength(1);
      expect(result.results[0].isPowered).toBe(false);
      expect(result.results[0].receptorId).toBe("lamp");
      expect(result.results[0].cutoffPoint).toBeDefined();
      expect(result.results[0].cutoffPoint?.linkId).toBe("l2"); // Switch link
    });

    it("should show lamp powered when switch is closed", () => {
      const result = simulateCircuit(circuit, {
        switch: true, // Activate switch (close NO contact)
      });

      expect(result.results[0].isPowered).toBe(true);
      expect(result.results[0].activePath).not.toBeNull();
      expect(result.results[0].activePath?.length).toBeGreaterThan(0);
      expect(result.results[0].cutoffPoint).toBeUndefined();
    });

    it("should show lamp NOT powered when breaker trips", () => {
      const result = simulateCircuit(circuit, {
        switch: true, // Switch closed
        breaker: true, // Breaker tripped (NC opens when active)
      });

      expect(result.results[0].isPowered).toBe(false);
      expect(result.results[0].cutoffPoint?.linkId).toBe("l1"); // Breaker link
    });

    it("should return correct states in result", () => {
      const result = simulateCircuit(circuit, { switch: true });

      expect(result.states).toHaveLength(2);
      expect(result.states.find((s) => s.id === "switch")?.isActive).toBe(true);
      expect(result.states.find((s) => s.id === "breaker")?.isActive).toBe(
        false
      );
    });

    it("should include circuit info in result", () => {
      const result = simulateCircuit(circuit);

      expect(result.circuitId).toBe(circuit.id);
      expect(result.circuitName).toBe(circuit.name);
      expect(result.timestamp).toBeInstanceOf(Date);
    });
  });

  describe("Graph Building", () => {
    it("should create bidirectional links", () => {
      const circuit: Circuit = {
        id: "test",
        name: "Test",
        nodes: [
          { id: "a", name: "A", type: "source" },
          { id: "b", name: "B", type: "receptor" },
        ],
        links: [
          {
            id: "l1",
            name: "A to B",
            fromNodeId: "a",
            toNodeId: "b",
            behavior: { type: "always_conducting" },
          },
        ],
        states: [],
        sourceNodeId: "a",
        neutralNodeId: "b",
        receptorNodeIds: ["b"],
      };

      const graph = buildGraph(circuit);

      // Both nodes should have adjacency entries
      expect(graph.get("a")).toHaveLength(1);
      expect(graph.get("b")).toHaveLength(1);

      // Check correct targets
      expect(graph.get("a")?.[0].targetNodeId).toBe("b");
      expect(graph.get("b")?.[0].targetNodeId).toBe("a");
    });

    it("should handle multiple links from same node", () => {
      const circuit: Circuit = {
        id: "test",
        name: "Test",
        nodes: [
          { id: "a", name: "A", type: "source" },
          { id: "b", name: "B", type: "intermediate" },
          { id: "c", name: "C", type: "receptor" },
        ],
        links: [
          {
            id: "l1",
            name: "A to B",
            fromNodeId: "a",
            toNodeId: "b",
            behavior: { type: "always_conducting" },
          },
          {
            id: "l2",
            name: "A to C",
            fromNodeId: "a",
            toNodeId: "c",
            behavior: { type: "always_conducting" },
          },
        ],
        states: [],
        sourceNodeId: "a",
        neutralNodeId: "c",
        receptorNodeIds: ["b", "c"],
      };

      const graph = buildGraph(circuit);

      // Node A should have 2 outgoing links
      expect(graph.get("a")).toHaveLength(2);
    });
  });

  describe("Path Finding", () => {
    it("should find path when all links conduct", () => {
      const circuit: Circuit = {
        id: "test",
        name: "Test",
        nodes: [
          { id: "a", name: "A", type: "source" },
          { id: "b", name: "B", type: "intermediate" },
          { id: "c", name: "C", type: "receptor" },
        ],
        links: [
          {
            id: "l1",
            name: "A to B",
            fromNodeId: "a",
            toNodeId: "b",
            behavior: { type: "always_conducting" },
          },
          {
            id: "l2",
            name: "B to C",
            fromNodeId: "b",
            toNodeId: "c",
            behavior: { type: "always_conducting" },
          },
        ],
        states: [],
        sourceNodeId: "a",
        neutralNodeId: "c",
        receptorNodeIds: ["c"],
      };

      const graph = buildGraph(circuit);
      const states = new Map<string, boolean>();

      const result = findPath(graph, circuit, "a", "c", states);

      expect(result.found).toBe(true);
      expect(result.path).toHaveLength(2);
      expect(result.path[0].fromNodeId).toBe("a");
      expect(result.path[0].toNodeId).toBe("b");
      expect(result.path[1].fromNodeId).toBe("b");
      expect(result.path[1].toNodeId).toBe("c");
    });

    it("should not find path when a link is open", () => {
      const circuit: Circuit = {
        id: "test",
        name: "Test",
        nodes: [
          { id: "a", name: "A", type: "source" },
          { id: "b", name: "B", type: "intermediate" },
          { id: "c", name: "C", type: "receptor" },
        ],
        links: [
          {
            id: "l1",
            name: "A to B",
            fromNodeId: "a",
            toNodeId: "b",
            behavior: { type: "always_conducting" },
          },
          {
            id: "l2",
            name: "B to C",
            fromNodeId: "b",
            toNodeId: "c",
            behavior: { type: "normally_open", stateId: "sw1" },
          },
        ],
        states: [{ id: "sw1", name: "Switch 1", isActive: false }],
        sourceNodeId: "a",
        neutralNodeId: "c",
        receptorNodeIds: ["c"],
      };

      const graph = buildGraph(circuit);
      const states = new Map<string, boolean>([["sw1", false]]);

      const result = findPath(graph, circuit, "a", "c", states);

      expect(result.found).toBe(false);
      expect(result.cutoffLinkId).toBe("l2");
    });

    it("should find path when NO contact is activated", () => {
      const circuit: Circuit = {
        id: "test",
        name: "Test",
        nodes: [
          { id: "a", name: "A", type: "source" },
          { id: "b", name: "B", type: "receptor" },
        ],
        links: [
          {
            id: "l1",
            name: "A to B",
            fromNodeId: "a",
            toNodeId: "b",
            behavior: { type: "normally_open", stateId: "sw1" },
          },
        ],
        states: [{ id: "sw1", name: "Switch 1", isActive: true }],
        sourceNodeId: "a",
        neutralNodeId: "b",
        receptorNodeIds: ["b"],
      };

      const graph = buildGraph(circuit);
      const states = new Map<string, boolean>([["sw1", true]]);

      const result = findPath(graph, circuit, "a", "b", states);

      expect(result.found).toBe(true);
    });

    it("should not find path when NC contact is activated", () => {
      const circuit: Circuit = {
        id: "test",
        name: "Test",
        nodes: [
          { id: "a", name: "A", type: "source" },
          { id: "b", name: "B", type: "receptor" },
        ],
        links: [
          {
            id: "l1",
            name: "A to B",
            fromNodeId: "a",
            toNodeId: "b",
            behavior: { type: "normally_closed", stateId: "sw1" },
          },
        ],
        states: [{ id: "sw1", name: "Switch 1", isActive: true }],
        sourceNodeId: "a",
        neutralNodeId: "b",
        receptorNodeIds: ["b"],
      };

      const graph = buildGraph(circuit);
      const states = new Map<string, boolean>([["sw1", true]]);

      const result = findPath(graph, circuit, "a", "b", states);

      expect(result.found).toBe(false);
    });
  });

  describe("Multiple Receptors", () => {
    it("should show no receptors powered when all switches are off", () => {
      const circuit: Circuit = {
        id: "test",
        name: "Test Two Lamps",
        nodes: [
          { id: "phase", name: "Phase", type: "source" },
          { id: "lamp1", name: "Lamp 1", type: "receptor" },
          { id: "lamp2", name: "Lamp 2", type: "receptor" },
          { id: "neutral", name: "Neutral", type: "neutral" },
        ],
        links: [
          {
            id: "l1",
            name: "Phase to Lamp1",
            fromNodeId: "phase",
            toNodeId: "lamp1",
            behavior: { type: "normally_open", stateId: "sw1" },
          },
          {
            id: "l2",
            name: "Lamp1 to Neutral",
            fromNodeId: "lamp1",
            toNodeId: "neutral",
            behavior: { type: "always_conducting" },
          },
          {
            id: "l3",
            name: "Phase to Lamp2",
            fromNodeId: "phase",
            toNodeId: "lamp2",
            behavior: { type: "normally_open", stateId: "sw2" },
          },
          {
            id: "l4",
            name: "Lamp2 to Neutral",
            fromNodeId: "lamp2",
            toNodeId: "neutral",
            behavior: { type: "always_conducting" },
          },
        ],
        states: [
          { id: "sw1", name: "Switch 1", isActive: false },
          { id: "sw2", name: "Switch 2", isActive: false },
        ],
        sourceNodeId: "phase",
        neutralNodeId: "neutral",
        receptorNodeIds: ["lamp1", "lamp2"],
      };

      // Both switches off
      const result = simulateCircuit(circuit, { sw1: false, sw2: false });

      expect(result.results).toHaveLength(2);
      expect(result.results.every((r) => !r.isPowered)).toBe(true);
    });

    it("should show all receptors powered when all switches are on", () => {
      const circuit: Circuit = {
        id: "test",
        name: "Test Two Lamps",
        nodes: [
          { id: "phase", name: "Phase", type: "source" },
          { id: "lamp1", name: "Lamp 1", type: "receptor" },
          { id: "lamp2", name: "Lamp 2", type: "receptor" },
          { id: "neutral", name: "Neutral", type: "neutral" },
        ],
        links: [
          {
            id: "l1",
            name: "Phase to Lamp1",
            fromNodeId: "phase",
            toNodeId: "lamp1",
            behavior: { type: "normally_open", stateId: "sw1" },
          },
          {
            id: "l2",
            name: "Lamp1 to Neutral",
            fromNodeId: "lamp1",
            toNodeId: "neutral",
            behavior: { type: "always_conducting" },
          },
          {
            id: "l3",
            name: "Phase to Lamp2",
            fromNodeId: "phase",
            toNodeId: "lamp2",
            behavior: { type: "normally_open", stateId: "sw2" },
          },
          {
            id: "l4",
            name: "Lamp2 to Neutral",
            fromNodeId: "lamp2",
            toNodeId: "neutral",
            behavior: { type: "always_conducting" },
          },
        ],
        states: [
          { id: "sw1", name: "Switch 1", isActive: false },
          { id: "sw2", name: "Switch 2", isActive: false },
        ],
        sourceNodeId: "phase",
        neutralNodeId: "neutral",
        receptorNodeIds: ["lamp1", "lamp2"],
      };

      // Both switches on
      const result = simulateCircuit(circuit, { sw1: true, sw2: true });

      expect(result.results).toHaveLength(2);
      expect(result.results.every((r) => r.isPowered)).toBe(true);
    });
  });

  describe("Cutoff Point Explanation", () => {
    it("should provide reason for NO contact cutoff", () => {
      const circuit = createSimpleLightingCircuit();

      const result = simulateCircuit(circuit, { switch: false });

      expect(result.results[0].cutoffPoint?.reason).toContain("not active");
      expect(result.results[0].cutoffPoint?.reason).toContain("NO contact");
    });

    it("should provide reason for NC contact cutoff", () => {
      const circuit = createSimpleLightingCircuit();

      const result = simulateCircuit(circuit, { switch: true, breaker: true });

      expect(result.results[0].cutoffPoint?.reason).toContain("active");
      expect(result.results[0].cutoffPoint?.reason).toContain("NC contact");
    });
  });
});
