"use client";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { dialogManager } from "@/features/dialog-manager/dialog-manager";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { FileText, Mail, MoreVertical, Pencil, Phone, Trash2, Users } from "lucide-react";
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

  const handleDelete = (client: Client) => {
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

  if (clients.length === 0) {
    return (
      <Card className="flex flex-col items-center justify-center p-12 text-center">
        <Users className="text-muted-foreground mb-4 size-12" />
        <h3 className="mb-2 text-lg font-semibold">Aucun client</h3>
        <p className="text-muted-foreground mb-4">
          Créez votre premier client pour organiser vos schémas électriques.
        </p>
        <Link
          href={`/orgs/${orgSlug}/clients/new`}
          className={buttonVariants()}
        >
          Créer un client
        </Link>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {clients.map((client) => (
        <Card
          key={client.id}
          className="relative cursor-pointer transition-colors hover:bg-muted/50"
          onClick={() => router.push(`/orgs/${orgSlug}/clients/${client.id}`)}
        >
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{client.name}</CardTitle>
              <DropdownMenu>
                <DropdownMenuTrigger
                  className="hover:bg-muted rounded p-1"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="size-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/orgs/${orgSlug}/clients/${client.id}/edit`);
                    }}
                  >
                    <Pencil className="mr-2 size-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(client);
                    }}
                  >
                    <Trash2 className="mr-2 size-4" />
                    Supprimer
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-muted-foreground flex flex-col gap-1 text-sm">
              {client.email && (
                <div className="flex items-center gap-2">
                  <Mail className="size-3" />
                  <span className="truncate">{client.email}</span>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="size-3" />
                  <span>{client.phone}</span>
                </div>
              )}
              <div className="mt-2 flex items-center gap-2">
                <FileText className="size-3" />
                <span>
                  {client.circuitCount} circuit{client.circuitCount !== 1 ? "s" : ""}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
