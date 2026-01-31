import type {
  ControlState,
  ReceptorSimulationResult,
} from "../types/circuit.types";

/**
 * Data structure for PDF report generation
 */
export type PDFReportData = {
  circuitId: string;
  circuitName: string;
  organizationName: string;
  timestamp: Date;
  states: ControlState[];
  results: ReceptorSimulationResult[];
  stats: {
    powered: number;
    notPowered: number;
    total: number;
    percentage: number;
  };
};
