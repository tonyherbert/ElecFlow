"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowRight,
  Brain,
  Check,
  Loader2,
  Plus,
} from "lucide-react";
import { useState } from "react";

import type { AIParserComponent, AIParseResult } from "../pdf-import/types";
import { ComponentEditor } from "./component-editor";

type ComponentValidationFormProps = {
  aiResult: AIParseResult;
  pdfInfo: {
    numPages: number;
    title?: string;
  };
  fileName: string;
  onValidate: (components: AIParserComponent[], name: string) => void;
  onCancel: () => void;
  isValidating?: boolean;
};

export function ComponentValidationForm({
  aiResult,
  pdfInfo,
  fileName,
  onValidate,
  onCancel,
  isValidating = false,
}: ComponentValidationFormProps) {
  const [components, setComponents] = useState<AIParserComponent[]>(
    aiResult.components
  );
  const [selectedIds, setSelectedIds] = useState<Set<string>>(
    new Set(aiResult.components.map((c) => c.repere))
  );
  const [circuitName, setCircuitName] = useState(
    pdfInfo.title ?? fileName.replace(/\.pdf$/i, "")
  );
  const [showAddForm, setShowAddForm] = useState(false);

  const toggleComponent = (repere: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(repere)) {
      newSelected.delete(repere);
    } else {
      newSelected.add(repere);
    }
    setSelectedIds(newSelected);
  };

  const updateComponent = (
    index: number,
    updated: AIParserComponent
  ) => {
    const newComponents = [...components];
    const oldRepere = newComponents[index].repere;
    newComponents[index] = updated;
    setComponents(newComponents);

    // Update selected set if repere changed
    if (oldRepere !== updated.repere && selectedIds.has(oldRepere)) {
      const newSelected = new Set(selectedIds);
      newSelected.delete(oldRepere);
      newSelected.add(updated.repere);
      setSelectedIds(newSelected);
    }
  };

  const deleteComponent = (index: number) => {
    const repere = components[index].repere;
    setComponents(components.filter((_, i) => i !== index));
    const newSelected = new Set(selectedIds);
    newSelected.delete(repere);
    setSelectedIds(newSelected);
  };

  const addComponent = (component: AIParserComponent) => {
    setComponents([...components, component]);
    setSelectedIds(new Set([...selectedIds, component.repere]));
    setShowAddForm(false);
  };

  const handleValidate = () => {
    const selectedComponents = components.filter((c) =>
      selectedIds.has(c.repere)
    );
    onValidate(selectedComponents, circuitName);
  };

  const selectedCount = selectedIds.size;
  const confidencePercent = Math.round(aiResult.confidence * 100);
  const isLowConfidence = aiResult.confidence < 0.5;

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
          <span className="font-medium">Validation</span>
        </div>
        <ArrowRight className="size-4 text-muted-foreground" />
        <div className="flex items-center gap-2 text-muted-foreground">
          <div className="flex size-6 items-center justify-center rounded-full border-2 border-current">
            3
          </div>
          <span>Import</span>
        </div>
      </div>

      {/* AI Confidence Header */}
      <div className="rounded-xl border bg-card p-5">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex size-12 items-center justify-center rounded-xl",
              isLowConfidence ? "bg-warning/10" : "bg-primary/10"
            )}
          >
            <Brain
              className={cn(
                "size-6",
                isLowConfidence ? "text-warning" : "text-primary"
              )}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <Input
                value={circuitName}
                onChange={(e) => setCircuitName(e.target.value)}
                placeholder="Nom du schéma"
                className="h-auto border-0 bg-transparent p-0 text-xl font-semibold focus-visible:ring-0"
              />
              <Badge
                variant="secondary"
                className={cn(
                  "shrink-0",
                  isLowConfidence && "bg-warning/10 text-warning"
                )}
              >
                Confiance: {confidencePercent}%
              </Badge>
            </div>
            <p className="mt-1.5 text-sm text-muted-foreground">
              {components.length} composants détectés • {selectedCount}{" "}
              sélectionnés
            </p>
            {aiResult.notes && (
              <p className="mt-2 text-sm text-muted-foreground italic">
                {aiResult.notes}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Low confidence warning */}
      {isLowConfidence && (
        <div className="flex items-start gap-3 rounded-xl border border-warning/30 bg-warning/5 p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warning" />
          <div>
            <p className="font-medium text-warning">
              Confiance faible dans l&apos;analyse
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              L&apos;IA n&apos;est pas certaine de sa détection. Veuillez
              vérifier attentivement chaque composant et corriger si nécessaire.
            </p>
          </div>
        </div>
      )}

      {/* Components List */}
      <div className="rounded-xl border bg-card">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <h3 className="font-semibold">Composants détectés</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Cochez les composants à importer, éditez ou supprimez si besoin
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAddForm(true)}
          >
            <Plus className="mr-1.5 size-4" />
            Ajouter
          </Button>
        </div>

        <div className="flex flex-col gap-2 p-4">
          {showAddForm && (
            <AddComponentForm
              onAdd={addComponent}
              onCancel={() => setShowAddForm(false)}
              existingReperes={components.map((c) => c.repere)}
            />
          )}

          {components.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <p>Aucun composant détecté</p>
              <p className="mt-1 text-sm">
                Ajoutez manuellement les composants de votre schéma
              </p>
            </div>
          ) : (
            components.map((component, index) => (
              <ComponentEditor
                key={`${component.repere}-${index}`}
                component={component}
                isSelected={selectedIds.has(component.repere)}
                onToggle={() => toggleComponent(component.repere)}
                onUpdate={(updated) => updateComponent(index, updated)}
                onDelete={() => deleteComponent(index)}
              />
            ))
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={onCancel} disabled={isValidating}>
          Annuler
        </Button>
        <Button
          onClick={handleValidate}
          disabled={selectedCount === 0 || isValidating}
          size="lg"
        >
          {isValidating ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Validation...
            </>
          ) : (
            <>
              <Check className="mr-2 size-4" />
              Valider et importer ({selectedCount})
            </>
          )}
        </Button>
      </div>
    </div>
  );
}

function AddComponentForm({
  onAdd,
  onCancel,
  existingReperes,
}: {
  onAdd: (component: AIParserComponent) => void;
  onCancel: () => void;
  existingReperes: string[];
}) {
  const [repere, setRepere] = useState("");
  const [designation, setDesignation] = useState("");
  const [protection, setProtection] = useState("");
  const [cable, setCable] = useState("");

  const handleSubmit = () => {
    if (!repere.trim()) return;

    // Determine type based on common patterns
    let type: AIParserComponent["type"] = "circuit_breaker";
    if (repere === "Q1" || repere.toLowerCase().includes("db")) {
      type = "main_breaker";
    } else if (protection.toLowerCase().includes("ma")) {
      type = "differential";
    } else if (cable.trim()) {
      type = "final_circuit";
    }

    // Determine parent
    let parentRepere: string | null = null;
    if (repere.includes(".")) {
      parentRepere = repere.split(".")[0];
    }

    onAdd({
      repere: repere.trim(),
      designation: designation.trim(),
      protection: protection.trim(),
      cable: cable.trim() || null,
      parentRepere,
      type,
    });
  };

  const isRepereValid = repere.trim() && !existingReperes.includes(repere.trim());

  return (
    <div className="rounded-lg border border-dashed border-primary/50 bg-primary/5 p-4">
      <p className="mb-3 text-sm font-medium">Ajouter un composant</p>
      <div className="grid gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Input
            value={repere}
            onChange={(e) => setRepere(e.target.value)}
            placeholder="Repère (Q1, Q2.1...)"
            className={cn(
              !isRepereValid && repere && "border-destructive"
            )}
          />
          <Input
            value={protection}
            onChange={(e) => setProtection(e.target.value)}
            placeholder="Protection (10A, 25A/30mA...)"
          />
        </div>
        <Input
          value={designation}
          onChange={(e) => setDesignation(e.target.value)}
          placeholder="Désignation (Éclairage chambre...)"
        />
        <Input
          value={cable}
          onChange={(e) => setCable(e.target.value)}
          placeholder="Câble optionnel (3G1.5, 3G2.5...)"
        />
        <div className="flex justify-end gap-2">
          <Button variant="ghost" size="sm" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={handleSubmit}
            disabled={!isRepereValid}
          >
            <Plus className="mr-1 size-4" />
            Ajouter
          </Button>
        </div>
      </div>
    </div>
  );
}
