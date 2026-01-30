"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Check, Pencil, Shield, Trash2, X, Zap } from "lucide-react";
import { useState } from "react";

import type { AIParserComponent, ComponentType } from "../pdf-import/types";

type ComponentEditorProps = {
  component: AIParserComponent;
  isSelected: boolean;
  onToggle: () => void;
  onUpdate: (updated: AIParserComponent) => void;
  onDelete: () => void;
};

const COMPONENT_TYPES: { value: ComponentType; label: string }[] = [
  { value: "main_breaker", label: "Disjoncteur principal" },
  { value: "differential", label: "Différentiel" },
  { value: "circuit_breaker", label: "Disjoncteur" },
  { value: "final_circuit", label: "Circuit final" },
];

export function ComponentEditor({
  component,
  isSelected,
  onToggle,
  onUpdate,
  onDelete,
}: ComponentEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedComponent, setEditedComponent] =
    useState<AIParserComponent>(component);

  const handleSave = () => {
    onUpdate(editedComponent);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedComponent(component);
    setIsEditing(false);
  };

  const isMainBreaker = component.type === "main_breaker";
  const isDifferential = component.type === "differential";
  const isFinal = component.type === "final_circuit";

  if (isEditing) {
    return (
      <div className="rounded-lg border bg-card p-4">
        <div className="grid gap-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Repère
              </label>
              <Input
                value={editedComponent.repere}
                onChange={(e) =>
                  setEditedComponent({ ...editedComponent, repere: e.target.value })
                }
                placeholder="Q1, Q2.1..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Type
              </label>
              <Select
                value={editedComponent.type}
                onValueChange={(value: ComponentType) =>
                  setEditedComponent({ ...editedComponent, type: value })
                }
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COMPONENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Désignation
            </label>
            <Input
              value={editedComponent.designation}
              onChange={(e) =>
                setEditedComponent({
                  ...editedComponent,
                  designation: e.target.value,
                })
              }
              placeholder="Éclairage chambre..."
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Protection
              </label>
              <Input
                value={editedComponent.protection}
                onChange={(e) =>
                  setEditedComponent({
                    ...editedComponent,
                    protection: e.target.value,
                  })
                }
                placeholder="10A, 25A/30mA..."
                className="mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Câble
              </label>
              <Input
                value={editedComponent.cable ?? ""}
                onChange={(e) =>
                  setEditedComponent({
                    ...editedComponent,
                    cable: e.target.value || null,
                  })
                }
                placeholder="3G1.5, 3G2.5..."
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Parent
            </label>
            <Input
              value={editedComponent.parentRepere ?? ""}
              onChange={(e) =>
                setEditedComponent({
                  ...editedComponent,
                  parentRepere: e.target.value || null,
                })
              }
              placeholder="Q2 (laisser vide si aucun)"
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="mr-1 size-4" />
              Annuler
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Check className="mr-1 size-4" />
              Enregistrer
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-colors",
        isSelected ? "border-primary/50 bg-primary/5" : "border-transparent bg-muted/30",
        !isSelected && "opacity-50"
      )}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
          isSelected
            ? "border-primary bg-primary text-primary-foreground"
            : "border-muted-foreground/30"
        )}
      >
        {isSelected && <Check className="size-3" />}
      </button>

      <div
        className={cn(
          "flex size-8 shrink-0 items-center justify-center rounded-lg",
          isMainBreaker && "bg-primary/10 text-primary",
          isDifferential && "bg-warning/10 text-warning",
          isFinal && "bg-powered/10 text-powered",
          !isMainBreaker && !isDifferential && !isFinal && "bg-muted text-muted-foreground"
        )}
      >
        {(isMainBreaker || isDifferential) && <Shield className="size-4" />}
        {isFinal && <Zap className="size-4" />}
        {!isMainBreaker && !isDifferential && !isFinal && (
          <Shield className="size-4" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <Badge
            variant={isMainBreaker ? "default" : "secondary"}
            className="shrink-0"
          >
            {component.repere}
          </Badge>
          <span className="truncate text-sm">
            {component.designation || "(sans désignation)"}
          </span>
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
          {component.protection || "—"}
        </Badge>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={() => setIsEditing(true)}
        >
          <Pencil className="size-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="size-8 text-destructive hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="size-3.5" />
        </Button>
      </div>
    </div>
  );
}
