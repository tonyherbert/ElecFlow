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
  ArrowUpRight,
  ChevronRight,
  FileText,
  MoreVertical,
  Plus,
  Trash2,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { deleteClientAction } from "../actions/client.action";

type Client = {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  createdAt: Date;
  updatedAt: Date;
  circuitCount: number;
};

type ClientListProps = {
  clients: Client[];
  orgSlug: string;
};

export function ClientList({ clients, orgSlug }: ClientListProps) {
  const router = useRouter();

  const handleDelete = (e: React.MouseEvent, client: Client) => {
    e.preventDefault();
    e.stopPropagation();
    dialogManager.confirm({
      title: "Supprimer le client",
      description: `Êtes-vous sûr de vouloir supprimer "${client.name}" ? Cette action supprimera également tous les circuits associés.`,
      confirmText: "SUPPRIMER",
      variant: "destructive",
      action: {
        label: "Supprimer",
        variant: "destructive",
        onClick: async () => {
          await resolveActionResult(deleteClientAction({ id: client.id }));
          toast.success("Client supprimé");
          router.refresh();
        },
      },
    });
  };

  // Calculate stats
  const totalCircuits = clients.reduce((sum, c) => sum + c.circuitCount, 0);

  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/20 px-6 py-20">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Users className="size-8 text-primary" />
        </div>
        <h3 className="mt-6 text-xl font-semibold">Bienvenue sur ElecFlow</h3>
        <p className="mt-2 max-w-sm text-center text-muted-foreground">
          Créez votre premier client pour commencer à importer et simuler vos
          schémas électriques.
        </p>
        <Link
          href={`/orgs/${orgSlug}/clients/new`}
          className={cn(buttonVariants({ size: "lg" }), "mt-8")}
        >
          <Plus className="mr-2 size-4" />
          Créer mon premier client
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
            <Users className="size-6 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total clients
            </p>
            <p className="text-3xl font-bold">{clients.length}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
          <div className="flex size-12 items-center justify-center rounded-xl bg-powered/10">
            <Zap className="size-6 text-powered" />
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Total schémas
            </p>
            <p className="text-3xl font-bold">{totalCircuits}</p>
          </div>
        </div>
        <div className="hidden items-center gap-4 rounded-xl border bg-gradient-to-br from-primary/5 to-primary/10 p-5 lg:flex">
          <div className="flex-1">
            <p className="font-medium">Importer un schéma</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Glissez un PDF
            </p>
          </div>
          <ArrowUpRight className="size-5 text-primary" />
        </div>
      </div>

      {/* Client List */}
      <div className="flex flex-col gap-2">
          {clients.map((client) => (
            <Link
              key={client.id}
              href={`/orgs/${orgSlug}/clients/${client.id}`}
              className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/20 hover:bg-primary/[0.02] hover:shadow-md"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex size-11 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 font-semibold text-primary">
                  {client.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{client.name}</span>
                  </div>
                  <div className="mt-0.5 flex items-center gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1.5">
                      <FileText className="size-3.5" />
                      {client.circuitCount} schéma
                      {client.circuitCount !== 1 ? "s" : ""}
                    </span>
                    {client.email && (
                      <span className="hidden sm:inline">{client.email}</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {client.circuitCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="hidden bg-powered/10 text-powered sm:flex"
                  >
                    <Zap className="mr-1 size-3" />
                    Actif
                  </Badge>
                )}
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
                      onClick={(e) => handleDelete(e, client)}
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
    </div>
  );
}
