"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ChartConfig } from "@/components/ui/chart";
import { ChartContainer } from "@/components/ui/chart";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Loader2,
  Play,
  Power,
  PowerOff,
  XCircle,
  Zap,
} from "lucide-react";
import { useMemo, useState } from "react";
import { Label as RechartsLabel, Pie, PieChart } from "recharts";
import { toast } from "sonner";

import { runSimulationAction } from "../actions/simulation.action";
import type { Circuit, CircuitSimulationResult } from "../types/circuit.types";

type SimulationPanelProps = {
  circuit: Circuit;
};

const chartConfig = {
  powered: {
    label: "Alimentés",
    color: "var(--powered)",
  },
  notPowered: {
    label: "Non alimentés",
    color: "var(--unpowered)",
  },
} satisfies ChartConfig;

export function SimulationPanel({ circuit }: SimulationPanelProps) {
  const [stateOverrides, setStateOverrides] = useState<Record<string, boolean>>(
    () => {
      const initial: Record<string, boolean> = {};
      for (const state of circuit.states) {
        initial[state.id] = state.isActive;
      }
      return initial;
    }
  );
  const [isSimulating, setIsSimulating] = useState(false);
  const [result, setResult] = useState<CircuitSimulationResult | null>(null);
  const [expandedReceptors, setExpandedReceptors] = useState<Set<string>>(
    new Set()
  );

  const toggleState = (stateId: string) => {
    setStateOverrides((prev) => ({
      ...prev,
      [stateId]: !prev[stateId],
    }));
  };

  const runSimulation = async () => {
    setIsSimulating(true);
    try {
      const simulationResult = await resolveActionResult(
        runSimulationAction({
          circuitId: circuit.id,
          stateOverrides,
        })
      );
      setResult(simulationResult);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Échec de la simulation"
      );
    } finally {
      setIsSimulating(false);
    }
  };

  const toggleReceptorExpanded = (receptorId: string) => {
    setExpandedReceptors((prev) => {
      const next = new Set(prev);
      if (next.has(receptorId)) {
        next.delete(receptorId);
      } else {
        next.add(receptorId);
      }
      return next;
    });
  };

  const stats = useMemo(() => {
    if (!result) return null;
    const powered = result.results.filter((r) => r.isPowered).length;
    const notPowered = result.results.length - powered;
    const percentage = Math.round((powered / result.results.length) * 100);
    return { powered, notPowered, total: result.results.length, percentage };
  }, [result]);

  const chartData = useMemo(() => {
    if (!stats) return [];
    return [
      { status: "powered", count: stats.powered, fill: "var(--color-powered)" },
      {
        status: "notPowered",
        count: stats.notPowered,
        fill: "var(--color-notPowered)",
      },
    ];
  }, [stats]);

  const activeCount = Object.values(stateOverrides).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-6">
      {/* Main Control Area - Sticky */}
      <div className="sticky top-0 z-10 -mx-4 -mt-4 flex flex-col gap-4 border-b bg-background/95 px-4 py-4 backdrop-blur supports-[backdrop-filter]:bg-background/80 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-primary/5">
            <Zap className="size-6 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Simulateur</h2>
            <p className="text-sm text-muted-foreground">
              {circuit.states.length} commande{circuit.states.length !== 1 ? "s" : ""} · {activeCount} active
              {activeCount !== 1 ? "s" : ""}
            </p>
          </div>
        </div>
        <Button
          onClick={runSimulation}
          disabled={isSimulating}
          size="lg"
          className="w-full lg:w-auto"
        >
          {isSimulating ? (
            <>
              <Loader2 className="mr-2 size-5 animate-spin" />
              Simulation en cours...
            </>
          ) : (
            <>
              <Play className="mr-2 size-5" />
              Lancer la simulation
            </>
          )}
        </Button>
      </div>

      {/* State Controls */}
      {circuit.states.length > 0 && (
        <div className="rounded-xl border bg-card">
          <div className="border-b px-5 py-4">
            <h3 className="font-semibold">États des commandes</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Activez ou désactivez les protections
            </p>
          </div>
          <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-3">
            {circuit.states.map((state) => {
              const isActive = stateOverrides[state.id];
              return (
                <button
                  key={state.id}
                  type="button"
                  onClick={() => toggleState(state.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border p-4 text-left transition-all",
                    isActive
                      ? "border-powered/30 bg-powered/5"
                      : "border-border hover:border-muted-foreground/30 hover:bg-muted/30"
                  )}
                >
                  <div
                    className={cn(
                      "flex size-10 shrink-0 items-center justify-center rounded-lg transition-colors",
                      isActive
                        ? "bg-powered text-powered-foreground"
                        : "bg-muted text-muted-foreground"
                    )}
                  >
                    {isActive ? (
                      <Power className="size-5" />
                    ) : (
                      <PowerOff className="size-5" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-medium">{state.name}</p>
                    <p
                      className={cn(
                        "text-xs",
                        isActive ? "text-powered" : "text-muted-foreground"
                      )}
                    >
                      {isActive ? "Activé" : "Désactivé"}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Results Section */}
      {!result ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/20 px-6 py-20">
          <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
            <Zap className="size-8 text-primary" />
          </div>
          <h3 className="mt-6 text-lg font-semibold">
            Prêt pour la simulation
          </h3>
          <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
            Configurez les états des commandes puis lancez la simulation pour
            vérifier la logique du circuit.
          </p>
        </div>
      ) : (
        <>
          {/* Stats Overview */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Chart Card */}
            <div className="flex items-center justify-center rounded-xl border bg-card p-6 lg:col-span-1">
              <ChartContainer
                config={chartConfig}
                className="aspect-square h-[160px]"
              >
                <PieChart>
                  <Pie
                    data={chartData}
                    dataKey="count"
                    nameKey="status"
                    innerRadius={50}
                    outerRadius={70}
                    strokeWidth={3}
                  >
                    <RechartsLabel
                      content={({ viewBox }) => {
                        if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                          return (
                            <text
                              x={viewBox.cx}
                              y={viewBox.cy}
                              textAnchor="middle"
                              dominantBaseline="middle"
                            >
                              <tspan
                                x={viewBox.cx}
                                y={viewBox.cy}
                                className="fill-foreground text-3xl font-bold"
                              >
                                {stats?.percentage}%
                              </tspan>
                            </text>
                          );
                        }
                      }}
                    />
                  </Pie>
                </PieChart>
              </ChartContainer>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-col gap-4 lg:col-span-2">
              <div className="flex items-center gap-4 rounded-xl border border-powered/20 bg-powered/5 p-5">
                <div className="flex size-12 items-center justify-center rounded-xl bg-powered/20">
                  <CheckCircle2 className="size-6 text-powered" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Récepteurs alimentés
                  </p>
                  <p className="text-3xl font-bold text-powered">
                    {stats?.powered}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-xl border border-unpowered/20 bg-unpowered/5 p-5">
                <div className="flex size-12 items-center justify-center rounded-xl bg-unpowered/20">
                  <XCircle className="size-6 text-unpowered" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    Récepteurs non alimentés
                  </p>
                  <p className="text-3xl font-bold text-unpowered">
                    {stats?.notPowered}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Receptors List */}
          <div className="rounded-xl border bg-card">
            <div className="border-b px-5 py-4">
              <h3 className="font-semibold">Détails des récepteurs</h3>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {stats?.total} récepteur{stats?.total !== 1 ? "s" : ""} analysé
                {stats?.total !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-col divide-y">
              {result.results.map((receptorResult) => {
                const hasDetails =
                  (receptorResult.isPowered &&
                    receptorResult.activePath &&
                    receptorResult.activePath.length > 0) ||
                  (!receptorResult.isPowered && receptorResult.cutoffPoint);

                if (!hasDetails) {
                  return (
                    <div
                      key={receptorResult.receptorId}
                      className="flex items-center justify-between px-5 py-4"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-9 items-center justify-center rounded-lg",
                            receptorResult.isPowered
                              ? "bg-powered/10"
                              : "bg-unpowered/10"
                          )}
                        >
                          {receptorResult.isPowered ? (
                            <CheckCircle2 className="size-5 text-powered" />
                          ) : (
                            <XCircle className="size-5 text-unpowered" />
                          )}
                        </div>
                        <span className="font-medium">
                          {receptorResult.receptorName}
                        </span>
                      </div>
                      <Badge
                        className={cn(
                          receptorResult.isPowered
                            ? "bg-powered/10 text-powered hover:bg-powered/20"
                            : "bg-unpowered/10 text-unpowered hover:bg-unpowered/20"
                        )}
                      >
                        {receptorResult.isPowered ? "Alimenté" : "Non alimenté"}
                      </Badge>
                    </div>
                  );
                }

                return (
                  <Collapsible
                    key={receptorResult.receptorId}
                    open={expandedReceptors.has(receptorResult.receptorId)}
                    onOpenChange={() =>
                      toggleReceptorExpanded(receptorResult.receptorId)
                    }
                  >
                    <CollapsibleTrigger asChild>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between px-5 py-4 transition-colors hover:bg-muted/30"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={cn(
                              "flex size-9 items-center justify-center rounded-lg",
                              receptorResult.isPowered
                                ? "bg-powered/10"
                                : "bg-unpowered/10"
                            )}
                          >
                            {receptorResult.isPowered ? (
                              <CheckCircle2 className="size-5 text-powered" />
                            ) : (
                              <XCircle className="size-5 text-unpowered" />
                            )}
                          </div>
                          <span className="font-medium">
                            {receptorResult.receptorName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            className={cn(
                              receptorResult.isPowered
                                ? "bg-powered/10 text-powered hover:bg-powered/20"
                                : "bg-unpowered/10 text-unpowered hover:bg-unpowered/20"
                            )}
                          >
                            {receptorResult.isPowered
                              ? "Alimenté"
                              : "Non alimenté"}
                          </Badge>
                          <ChevronDown
                            className={cn(
                              "size-4 text-muted-foreground transition-transform",
                              expandedReceptors.has(receptorResult.receptorId) &&
                                "rotate-180"
                            )}
                          />
                        </div>
                      </button>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="border-t bg-muted/20 px-5 py-4">
                        {receptorResult.isPowered &&
                          receptorResult.activePath &&
                          receptorResult.activePath.length > 0 && (
                            <div className="flex flex-wrap items-center gap-1">
                              <span className="mr-2 text-xs font-medium text-muted-foreground">
                                Chemin d'alimentation :
                              </span>
                              {receptorResult.activePath.map((segment, index) => (
                                <span
                                  key={`${segment.linkId}-${index}`}
                                  className="flex items-center"
                                >
                                  {index > 0 && (
                                    <ArrowRight className="mx-1 size-3 text-muted-foreground" />
                                  )}
                                  <Badge variant="outline" className="text-xs">
                                    {segment.linkName}
                                  </Badge>
                                </span>
                              ))}
                            </div>
                          )}
                        {!receptorResult.isPowered &&
                          receptorResult.cutoffPoint && (
                            <div className="flex items-center gap-2">
                              <AlertTriangle className="size-4 text-warning" />
                              <span className="text-sm text-muted-foreground">
                                Point de coupure :
                              </span>
                              <Badge className="bg-warning/10 text-warning hover:bg-warning/20">
                                {receptorResult.cutoffPoint.linkName}
                              </Badge>
                            </div>
                          )}
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
