"use client";

import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { dialogManager } from "@/features/dialog-manager/dialog-manager";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { cn } from "@/lib/utils";
import {
  ChevronRight,
  FileText,
  Mail,
  MoreVertical,
  Pencil,
  Phone,
  Plus,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
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
  const [search, setSearch] = useState("");

  const filteredClients = useMemo(() => {
    if (!search.trim()) return clients;
    const query = search.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(query) ||
        client.email?.toLowerCase().includes(query) ||
        client.phone?.includes(query)
    );
  }, [clients, search]);

  const handleDelete = (e: React.MouseEvent, client: Client) => {
    e.preventDefault();
    e.stopPropagation();
    dialogManager.confirm({
      title: "Supprimer le client",
      description: `Êtes-vous sûr de vouloir supprimer "${client.name}" ? Cette action supprimera également tous les schémas associés.`,
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

  // Empty state
  if (clients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border/50 bg-muted/20 px-6 py-20">
        <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10">
          <Users className="size-8 text-primary" />
        </div>
        <h3 className="mt-6 text-xl font-semibold">Aucun client</h3>
        <p className="mt-2 max-w-sm text-center text-muted-foreground">
          Créez votre premier client pour organiser vos projets et schémas
          électriques.
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
    <div className="flex flex-col gap-6">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Results count */}
      {search && (
        <p className="text-sm text-muted-foreground">
          {filteredClients.length} résultat{filteredClients.length !== 1 ? "s" : ""}
        </p>
      )}

      {/* Client List */}
      {filteredClients.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12">
          <p className="text-muted-foreground">Aucun client trouvé</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredClients.map((client) => (
            <Link
              key={client.id}
              href={`/orgs/${orgSlug}/clients/${client.id}`}
              className="group flex items-center justify-between rounded-xl border bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <div className="flex items-center gap-4">
                {/* Avatar */}
                <div className="flex size-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 text-lg font-semibold text-primary">
                  {client.name.charAt(0).toUpperCase()}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1">
                  <span className="font-medium">{client.name}</span>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                    {client.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail className="size-3.5" />
                        {client.email}
                      </span>
                    )}
                    {client.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone className="size-3.5" />
                        {client.phone}
                      </span>
                    )}
                    <span className="flex items-center gap-1.5">
                      <FileText className="size-3.5" />
                      {client.circuitCount} schéma{client.circuitCount !== 1 ? "s" : ""}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                {client.circuitCount > 0 && (
                  <Badge
                    variant="secondary"
                    className="hidden bg-powered/10 text-powered sm:flex"
                  >
                    {client.circuitCount} schéma{client.circuitCount !== 1 ? "s" : ""}
                  </Badge>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8 opacity-0 transition-opacity group-hover:opacity-100"
                      onClick={(e) => e.preventDefault()}
                    >
                      <MoreVertical className="size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/orgs/${orgSlug}/clients/${client.id}/edit`}>
                        <Pencil className="mr-2 size-4" />
                        Modifier
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={(e) => handleDelete(e, client)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="mr-2 size-4" />
                      Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
