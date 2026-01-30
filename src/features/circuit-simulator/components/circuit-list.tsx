"use client";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dialogManager } from "@/features/dialog-manager/dialog-manager";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  Clock,
  History,
  MoreVertical,
  Plus,
  Trash2,
  Zap,
} from "lucide-react";
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
  version: number;
  parentCircuitId: string | null;
};

type CircuitListProps = {
  circuits: CircuitListItem[];
  orgSlug: string;
  clientId: string;
};

// Group circuits by family (parent or self) and return only the latest version
function groupCircuitsByFamily(circuits: CircuitListItem[]) {
  const familyMap = new Map<string, { latest: CircuitListItem; count: number }>();

  for (const circuit of circuits) {
    // The family ID is the parentCircuitId if it exists, otherwise the circuit's own ID
    const familyId = circuit.parentCircuitId ?? circuit.id;

    const existing = familyMap.get(familyId);
    if (!existing) {
      familyMap.set(familyId, { latest: circuit, count: 1 });
    } else {
      existing.count++;
      // Keep the one with the highest version number
      if (circuit.version > existing.latest.version) {
        existing.latest = circuit;
      }
    }
  }

  return Array.from(familyMap.values());
}

export function CircuitList({ circuits, orgSlug, clientId }: CircuitListProps) {
  const router = useRouter();

  const handleDelete = (e: React.MouseEvent, circuit: CircuitListItem) => {
    e.preventDefault();
    e.stopPropagation();
    dialogManager.confirm({
      title: "Supprimer le schéma",
      description: `Êtes-vous sûr de vouloir supprimer "${circuit.name}" ? Cette action est irréversible.`,
      variant: "destructive",
      action: {
        label: "Supprimer",
        variant: "destructive",
        onClick: async () => {
          await resolveActionResult(deleteCircuitAction({ id: circuit.id }));
          toast.success("Schéma supprimé");
          router.refresh();
        },
      },
    });
  };

  if (circuits.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/20 px-6 py-16">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10">
          <Zap className="size-7 text-primary" />
        </div>
        <h3 className="mt-5 text-lg font-semibold">Aucun schéma</h3>
        <p className="mt-2 max-w-xs text-center text-sm text-muted-foreground">
          Importez votre premier schéma Formelec pour simuler la logique
          électrique.
        </p>
        <Link
          href={`/orgs/${orgSlug}/clients/${clientId}/circuits/import`}
          className={cn(buttonVariants(), "mt-6")}
        >
          <Plus className="mr-2 size-4" />
          Importer un schéma
        </Link>
      </div>
    );
  }

  const groupedCircuits = groupCircuitsByFamily(circuits);

  return (
    <div className="flex flex-col gap-3">
      {groupedCircuits.map(({ latest: circuit, count }) => (
        <Link
          key={circuit.id}
          href={`/orgs/${orgSlug}/clients/${clientId}/circuits/${circuit.id}/simulate`}
          className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-md"
        >
          <div className="flex items-center gap-4">
            {/* Circuit icon */}
            <div className="flex size-11 items-center justify-center rounded-xl bg-gradient-to-br from-primary/15 to-primary/5">
              <Zap className="size-5 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{circuit.name}</span>
                {count > 1 && (
                  <Badge
                    variant="secondary"
                    className="gap-1 rounded-full px-2 text-xs"
                  >
                    <History className="size-3" />
                    {count} versions
                  </Badge>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Zap className="size-3" />
                  {circuit.receptorCount} récepteur
                  {circuit.receptorCount !== 1 ? "s" : ""}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="size-3" />
                  {new Date(circuit.updatedAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                  })}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge
              variant="secondary"
              className="hidden bg-powered/10 text-powered sm:flex"
            >
              v{circuit.version}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.preventDefault()}
                >
                  <MoreVertical className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={(e) => handleDelete(e, circuit)}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="mr-2 size-4" />
                  Supprimer
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <ChevronRight className="size-4 text-muted-foreground" />
          </div>
        </Link>
      ))}
    </div>
  );
}
