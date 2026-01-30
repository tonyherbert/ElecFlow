"use client";

import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { assignClientAction } from "../actions/circuit.action";

type Client = {
  id: string;
  name: string;
};

type ClientAssignmentProps = {
  circuitId: string;
  currentClientId: string | null;
  currentClientName: string | null;
  clients: Client[];
};

export function ClientAssignment({
  circuitId,
  currentClientId,
  currentClientName,
  clients,
}: ClientAssignmentProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);

  const handleClientChange = async (value: string) => {
    const newClientId = value === "none" ? null : value;

    // Don't update if same value
    if (newClientId === currentClientId) return;

    setIsUpdating(true);
    try {
      await resolveActionResult(
        assignClientAction({
          circuitId,
          clientId: newClientId,
        })
      );
      toast.success(
        newClientId
          ? "Client assigné"
          : "Schéma retiré du client"
      );
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'assignation"
      );
    } finally {
      setIsUpdating(false);
    }
  };

  // If no clients available, show a badge only
  if (clients.length === 0) {
    return currentClientName ? (
      <Badge variant="secondary" className="gap-1.5">
        <Users className="size-3" />
        {currentClientName}
      </Badge>
    ) : (
      <Badge variant="secondary" className="bg-warning/10 text-warning gap-1.5">
        <Users className="size-3" />
        Non assigné
      </Badge>
    );
  }

  return (
    <Select
      value={currentClientId ?? "none"}
      onValueChange={handleClientChange}
      disabled={isUpdating}
    >
      <SelectTrigger className="h-8 w-auto gap-2 min-w-[140px]">
        <Users className="size-3.5 text-muted-foreground" />
        <SelectValue>
          {currentClientName ?? "Non assigné"}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="none">
          <span className="text-warning">Non assigné</span>
        </SelectItem>
        {clients.map((client) => (
          <SelectItem key={client.id} value={client.id}>
            {client.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
