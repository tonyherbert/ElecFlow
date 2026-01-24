"use client";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import {
  AlertTriangle,
  CheckCircle,
  Play,
  XCircle,
  Zap,
  ArrowRight,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { runSimulationAction } from "../actions/simulation.action";
import type { Circuit, CircuitSimulationResult } from "../types/circuit.types";

type SimulationPanelProps = {
  circuit: Circuit;
};

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

  return (
    <div className="flex flex-col gap-6">
      {/* Control States */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            États de commande
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {circuit.states.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Ce circuit n'a pas d'états de commande.
            </p>
          ) : (
            circuit.states.map((state) => (
              <div
                key={state.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex flex-col">
                  <Label htmlFor={state.id} className="font-medium">
                    {state.name}
                  </Label>
                  <span className="text-xs text-muted-foreground">
                    {stateOverrides[state.id] ? "Actif (ON)" : "Inactif (OFF)"}
                  </span>
                </div>
                <Switch
                  id={state.id}
                  checked={stateOverrides[state.id]}
                  onCheckedChange={() => toggleState(state.id)}
                />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Run Simulation Button */}
      <Button
        onClick={runSimulation}
        disabled={isSimulating}
        size="lg"
        className="w-full"
      >
        <Play className="mr-2 h-5 w-5" />
        {isSimulating ? "Simulation en cours..." : "Lancer la simulation"}
      </Button>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Résultats de la simulation</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {result.results.map((receptorResult) => (
              <Alert
                key={receptorResult.receptorId}
                variant={receptorResult.isPowered ? "default" : "destructive"}
              >
                {receptorResult.isPowered ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <AlertTitle className="flex items-center gap-2">
                  {receptorResult.receptorName}
                  <Badge
                    variant={receptorResult.isPowered ? "default" : "destructive"}
                  >
                    {receptorResult.isPowered ? "ALIMENTÉ" : "NON ALIMENTÉ"}
                  </Badge>
                </AlertTitle>
                <AlertDescription>
                  {receptorResult.isPowered ? (
                    <div className="mt-2">
                      <p className="text-sm font-medium">Chemin actif :</p>
                      <div className="mt-1 flex flex-wrap items-center gap-1">
                        {receptorResult.activePath?.map((segment, index) => (
                          <span key={`${segment.linkId}-${index}`} className="flex items-center">
                            {index > 0 && (
                              <ArrowRight className="mx-1 h-3 w-3 text-muted-foreground" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {segment.linkName}
                            </Badge>
                          </span>
                        ))}
                      </div>
                    </div>
                  ) : (
                    receptorResult.cutoffPoint && (
                      <div className="mt-2 flex items-start gap-2">
                        <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium">
                            Coupure à : {receptorResult.cutoffPoint.linkName}
                          </p>
                          <p className="text-sm">
                            {receptorResult.cutoffPoint.reason}
                          </p>
                        </div>
                      </div>
                    )
                  )}
                </AlertDescription>
              </Alert>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
