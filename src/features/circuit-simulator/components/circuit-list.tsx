"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dialogManager } from "@/features/dialog-manager/dialog-manager";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { MoreVertical, Play, Trash2, Upload, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteCircuitAction } from "../actions/circuit.action";

type CircuitListItem = {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  receptorCount: number;
};

type CircuitListProps = {
  circuits: CircuitListItem[];
  orgSlug: string;
};

export function CircuitList({ circuits, orgSlug }: CircuitListProps) {
  const router = useRouter();

  const handleDelete = (circuit: CircuitListItem) => {
    dialogManager.confirm({
      title: "Supprimer le circuit",
      description: `Êtes-vous sûr de vouloir supprimer "${circuit.name}" ? Cette action est irréversible.`,
      variant: "destructive",
      action: {
        label: "Supprimer",
        variant: "destructive",
        onClick: async () => {
          await resolveActionResult(deleteCircuitAction({ id: circuit.id }));
          toast.success("Circuit supprimé");
          router.refresh();
        },
      },
      cancel: {
        label: "Annuler",
      },
    });
  };

  if (circuits.length === 0) {
    return (
      <Card>
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
            <Zap className="h-6 w-6 text-muted-foreground" />
          </div>
          <CardTitle>Aucun circuit</CardTitle>
          <CardDescription>
            Importez votre premier schéma Formelec pour commencer à simuler la logique électrique.
          </CardDescription>
          <div className="pt-4">
            <Button asChild>
              <Link href={`/orgs/${orgSlug}/circuits/import`}>
                <Upload className="mr-2 h-4 w-4" />
                Importer un schéma
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {circuits.map((circuit) => (
        <Card key={circuit.id} className="flex items-center justify-between p-4">
          <div className="flex flex-col gap-1">
            <Link
              href={`/orgs/${orgSlug}/circuits/${circuit.id}/simulate`}
              className="font-medium hover:underline"
            >
              {circuit.name}
            </Link>
            {circuit.description && (
              <p className="text-sm text-muted-foreground">
                {circuit.description}
              </p>
            )}
            <p className="text-xs text-muted-foreground">
              {circuit.receptorCount} récepteur
              {circuit.receptorCount !== 1 ? "s" : ""} - Mis à jour le{" "}
              {new Date(circuit.updatedAt).toLocaleDateString("fr-FR")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/orgs/${orgSlug}/circuits/${circuit.id}/simulate`}>
                <Play className="mr-1 h-4 w-4" />
                Simuler
              </Link>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => handleDelete(circuit)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}
    </div>
  );
}
