"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertTriangle,
  Check,
  ChevronRight,
  Loader2,
  Zap,
} from "lucide-react";
import { useState } from "react";

import type { ParsedComponent, ParsedPdfResult, CircuitBuildResult } from "../pdf-import/types";

type PdfPreviewProps = {
  parsed: ParsedPdfResult;
  buildResult: CircuitBuildResult;
  pdfInfo: {
    numPages: number;
    title?: string;
  };
  onImport: (customName?: string) => void;
  onCancel: () => void;
  isImporting?: boolean;
};

export function PdfPreview({
  parsed,
  buildResult,
  pdfInfo,
  onImport,
  onCancel,
  isImporting = false,
}: PdfPreviewProps) {
  const [customName, setCustomName] = useState(
    buildResult.circuitInput?.name ?? parsed.documentName.replace(/\.pdf$/i, "")
  );

  // Group components by type
  const mainBreaker = parsed.components.find((c) => c.isMainBreaker);
  const differentials = parsed.components.filter(
    (c) => c.isDifferential && !c.isMainBreaker
  );
  const finalCircuits = parsed.components.filter((c) => c.isFinalCircuit);

  return (
    <div className="flex flex-col gap-6">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Aperçu de l'import
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Document:</span>
              <p className="font-medium">{parsed.documentName}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Pages:</span>
              <p className="font-medium">{pdfInfo.numPages}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Composants détectés:</span>
              <p className="font-medium">{parsed.components.length}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Récepteurs:</span>
              <p className="font-medium">{finalCircuits.length}</p>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="circuit-name">Nom du circuit</Label>
            <Input
              id="circuit-name"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nom du circuit"
            />
          </div>
        </CardContent>
      </Card>

      {/* Component Tree */}
      <Card>
        <CardHeader>
          <CardTitle>Structure détectée</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {/* Main Breaker */}
            {mainBreaker && (
              <ComponentRow component={mainBreaker} level={0} />
            )}

            {/* Differentials and their children */}
            {differentials.map((diff) => (
              <div key={diff.repere}>
                <ComponentRow component={diff} level={1} />
                {finalCircuits
                  .filter((c) => c.parentRepere === diff.repere)
                  .map((circuit) => (
                    <ComponentRow
                      key={circuit.repere}
                      component={circuit}
                      level={2}
                    />
                  ))}
              </div>
            ))}

            {/* Orphan final circuits (no parent differential) */}
            {finalCircuits
              .filter(
                (c) =>
                  !c.parentRepere ||
                  !differentials.some((d) => d.repere === c.parentRepere)
              )
              .map((circuit) => (
                <ComponentRow
                  key={circuit.repere}
                  component={circuit}
                  level={1}
                />
              ))}
          </div>
        </CardContent>
      </Card>

      {/* Errors/Warnings */}
      {(parsed.errors.length > 0 || buildResult.errors.length > 0) && (
        <Card className="border-yellow-500/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600">
              <AlertTriangle className="h-5 w-5" />
              Avertissements
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-inside list-disc text-sm text-muted-foreground">
              {parsed.errors.map((error, i) => (
                <li key={`parse-${i}`}>{error}</li>
              ))}
              {buildResult.errors.map((error, i) => (
                <li key={`build-${i}`}>{error}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel} disabled={isImporting}>
          Annuler
        </Button>
        <Button
          onClick={() => onImport(customName)}
          disabled={!buildResult.success || isImporting}
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Import en cours...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Importer le circuit
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function ComponentRow({
  component,
  level,
}: {
  component: ParsedComponent;
  level: number;
}) {
  return (
    <div
      className="flex items-center gap-2 rounded-lg border p-2"
      style={{ marginLeft: `${level * 24}px` }}
    >
      {level > 0 && (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      )}
      <Badge variant={getVariantForComponent(component)}>
        {component.repere}
      </Badge>
      <span className="flex-1 truncate text-sm">{component.designation}</span>
      {component.cable && (
        <Badge variant="outline" className="text-xs">
          {component.cable}
        </Badge>
      )}
      <Badge variant="secondary" className="text-xs">
        {component.protection}
      </Badge>
    </div>
  );
}

function getVariantForComponent(
  component: ParsedComponent
): "default" | "secondary" | "outline" {
  if (component.isMainBreaker) return "default";
  if (component.isDifferential) return "secondary";
  return "outline";
}
