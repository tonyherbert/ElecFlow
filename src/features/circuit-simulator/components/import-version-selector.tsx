"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { GitBranch, Plus } from "lucide-react";

type VersionMatch = {
  id: string;
  name: string;
  version: number;
  createdAt: Date;
  latestVersion: number;
};

type VersionSelectorProps = {
  matches: VersionMatch[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  onContinue: () => void;
  isLoading?: boolean;
};

export function VersionSelector({
  matches,
  selected,
  onSelect,
  onContinue,
  isLoading,
}: VersionSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <GitBranch className="size-5" />
          <CardTitle>Plan similaire detecte</CardTitle>
        </div>
        <CardDescription>
          Ce schema semble correspondre a un plan existant. Voulez-vous creer
          une nouvelle version ?
        </CardDescription>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selected ?? "new"}
          onValueChange={(val) => onSelect(val === "new" ? null : val)}
          className="flex flex-col gap-3"
        >
          {matches.map((match) => (
            <div
              key={match.id}
              className="flex items-center gap-3 rounded-lg border p-3"
            >
              <RadioGroupItem value={match.id} id={match.id} />
              <Label htmlFor={match.id} className="flex-1 cursor-pointer">
                <div className="font-medium">{match.name}</div>
                <div className="text-sm text-muted-foreground">
                  Actuellement v{match.latestVersion} - Cree le{" "}
                  {new Date(match.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </Label>
            </div>
          ))}
          <div className="flex items-center gap-3 rounded-lg border p-3">
            <RadioGroupItem value="new" id="new" />
            <Label htmlFor="new" className="flex-1 cursor-pointer">
              <div className="flex items-center gap-2 font-medium">
                <Plus className="size-4" />
                Creer un nouveau plan
              </div>
              <div className="text-sm text-muted-foreground">
                Ne pas lier a un plan existant
              </div>
            </Label>
          </div>
        </RadioGroup>
        <div className="mt-4 flex justify-end">
          <Button onClick={onContinue} disabled={isLoading}>
            {isLoading ? "Import en cours..." : "Continuer"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
