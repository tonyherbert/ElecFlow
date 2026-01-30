"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Check,
  ChevronRight,
  FileText,
  Loader2,
  Shield,
  Zap,
} from "lucide-react";
import { useState } from "react";

import type {
  CircuitBuildResult,
  ParsedComponent,
  ParsedPdfResult,
} from "../pdf-import/types";

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
      {/* Step Indicator */}
      <div className="flex items-center justify-center gap-2 text-sm">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-powered text-powered-foreground">
            <Check className="size-3.5" />
          </div>
          <span className="font-medium text-powered">Fichier analysé</span>
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
            2
          </div>
          <span className="font-medium">Configuration</span>
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex size-6 items-center justify-center rounded-full border-2 border-current">
            3
          </div>
          <span>Import</span>
        </div>
      </div>

      {/* Summary Header */}
      <div className="rounded-xl border bg-card p-6">
        <div className="flex items-start gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="size-6 text-primary" />
          </div>
          <div className="flex-1">
            <Input
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              placeholder="Nom du schéma"
              className="h-auto border-0 bg-transparent p-0 text-xl font-semibold focus-visible:ring-0"
            />
            <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
              <span>{parsed.documentName}</span>
              <span className="size-1 rounded-full bg-muted-foreground/30" />
              <span>{pdfInfo.numPages} page{pdfInfo.numPages !== 1 ? "s" : ""}</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-6 grid grid-cols-3 gap-4">
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold">{parsed.components.length}</p>
            <p className="text-xs text-muted-foreground">Composants</p>
          </div>
          <div className="rounded-lg bg-muted/50 p-3 text-center">
            <p className="text-2xl font-bold">{differentials.length}</p>
            <p className="text-xs text-muted-foreground">Différentiels</p>
          </div>
          <div className="rounded-lg bg-powered/10 p-3 text-center">
            <p className="text-2xl font-bold text-powered">
              {finalCircuits.length}
            </p>
            <p className="text-xs text-muted-foreground">Récepteurs</p>
          </div>
        </div>
      </div>

      {/* Component Tree */}
      <div className="rounded-xl border bg-card">
        <div className="border-b px-5 py-4">
          <h3 className="font-semibold">Structure détectée</h3>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Arborescence des protections
          </p>
        </div>
        <div className="flex flex-col gap-1 p-4">
          {/* Main Breaker */}
          {mainBreaker && <ComponentRow component={mainBreaker} level={0} />}

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
              <ComponentRow key={circuit.repere} component={circuit} level={1} />
            ))}
        </div>
      </div>

      {/* Errors/Warnings */}
      {(parsed.errors.length > 0 || buildResult.errors.length > 0) && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
          <AlertTriangle className="mt-0.5 size-5 text-warning" />
          <div>
            <p className="font-medium text-warning">Avertissements</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {parsed.errors.map((error, i) => (
                <li key={`parse-${i}`}>{error}</li>
              ))}
              {buildResult.errors.map((error, i) => (
                <li key={`build-${i}`}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isImporting}>
          Annuler
        </Button>
        <Button
          onClick={() => onImport(customName)}
          disabled={!buildResult.success || isImporting}
          size="lg"
        >
          {isImporting ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Import en cours...
            </>
          ) : (
            <>
              <Check className="mr-2 size-4" />
              Importer le schéma
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
  const isMainBreaker = component.isMainBreaker;
  const isDifferential = component.isDifferential && !isMainBreaker;
  const isFinal = component.isFinalCircuit;

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors hover:bg-muted/50",
        level === 0 && "bg-primary/5",
        level === 1 && !isDifferential && "ml-6",
        level === 1 && isDifferential && "ml-6 mt-2 bg-muted/30",
        level === 2 && "ml-12"
      )}
    >
      {level > 0 && (
        <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
      )}
      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          isMainBreaker && "bg-primary/10 text-primary",
          isDifferential && "bg-warning/10 text-warning",
          isFinal && "bg-powered/10 text-powered"
        )}
      >
        {isMainBreaker && <Shield className="size-4" />}
        {isDifferential && <Shield className="size-4" />}
        {isFinal && <Zap className="size-4" />}
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge
            variant={isMainBreaker ? "default" : "secondary"}
            className="shrink-0"
          >
            {component.repere}
          </Badge>
          <span className="truncate text-sm">{component.designation}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {component.cable && (
          <Badge variant="outline" className="text-xs">
            {component.cable}
          </Badge>
        )}
        <Badge
          variant="secondary"
          className={cn(
            "text-xs",
            isDifferential && "bg-warning/10 text-warning"
          )}
        >
          {component.protection}
        </Badge>
      </div>
    </div>
  );
}
