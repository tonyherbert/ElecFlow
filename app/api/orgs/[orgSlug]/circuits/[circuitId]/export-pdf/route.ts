import { renderToBuffer } from "@react-pdf/renderer";
import { z } from "zod";

import { getCircuitById } from "@/features/circuit-simulator/actions/circuit.action";
import { CircuitReport } from "@/features/circuit-simulator/pdf-report/circuit-report";
import type { PDFReportData } from "@/features/circuit-simulator/pdf-report/types";
import type {
  ControlState,
  ReceptorSimulationResult,
} from "@/features/circuit-simulator/types/circuit.types";
import { ZodRouteError } from "@/lib/errors/zod-route-error";
import { orgRoute } from "@/lib/zod-route";

const SimulationResultSchema = z.object({
  circuitId: z.string(),
  circuitName: z.string(),
  timestamp: z.coerce.date(),
  states: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      isActive: z.boolean(),
    })
  ),
  results: z.array(
    z.object({
      receptorId: z.string(),
      receptorName: z.string(),
      isPowered: z.boolean(),
      activePath: z
        .array(
          z.object({
            linkId: z.string(),
            linkName: z.string(),
            fromNodeId: z.string(),
            toNodeId: z.string(),
            isConducting: z.boolean(),
          })
        )
        .nullable(),
      cutoffPoint: z
        .object({
          linkId: z.string(),
          linkName: z.string(),
          reason: z.string(),
        })
        .optional(),
    })
  ),
});

const ExportPdfBodySchema = z.object({
  simulationResult: SimulationResultSchema,
});

export const POST = orgRoute
  .params(
    z.object({
      orgSlug: z.string(),
      circuitId: z.string(),
    })
  )
  .metadata({})
  .body(ExportPdfBodySchema)
  .handler(async (_req, { params, body, ctx }) => {
    const { circuitId } = params;
    const { organization } = ctx;

    // Verify circuit belongs to this organization
    const circuit = await getCircuitById(circuitId, organization.id);

    if (!circuit) {
      throw new ZodRouteError("Circuit not found", 404);
    }

    const simulationResult = body.simulationResult;

    // Calculate stats
    const powered = simulationResult.results.filter((r) => r.isPowered).length;
    const notPowered = simulationResult.results.length - powered;
    const total = simulationResult.results.length;
    const percentage = total > 0 ? Math.round((powered / total) * 100) : 0;

    // Prepare PDF data
    const reportData: PDFReportData = {
      circuitId: simulationResult.circuitId,
      circuitName: simulationResult.circuitName,
      organizationName: organization.name,
      timestamp: simulationResult.timestamp,
      states: simulationResult.states as ControlState[],
      results: simulationResult.results as ReceptorSimulationResult[],
      stats: {
        powered,
        notPowered,
        total,
        percentage,
      },
    };

    // Generate PDF
    const pdfBuffer = await renderToBuffer(CircuitReport({ data: reportData }));

    // Generate filename
    const sanitizedName = circuit.name
      .replace(/[^a-zA-Z0-9-_]/g, "_")
      .toLowerCase();
    const timestamp = new Date().toISOString().split("T")[0];
    const filename = `rapport-${sanitizedName}-${timestamp}.pdf`;

    // Return PDF as response
    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  });
