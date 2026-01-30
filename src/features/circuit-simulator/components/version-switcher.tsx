"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { History } from "lucide-react";
import { useRouter } from "next/navigation";

type Version = {
  id: string;
  name: string;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  receptorCount: number;
};

type VersionSwitcherProps = {
  versions: Version[];
  currentId: string;
  orgSlug: string;
  clientId?: string;
};

export function VersionSwitcher({
  versions,
  currentId,
  orgSlug,
  clientId,
}: VersionSwitcherProps) {
  const router = useRouter();

  // Don't show if only one version
  if (versions.length <= 1) return null;

  const currentVersion = versions.find((v) => v.id === currentId);

  const handleVersionChange = (versionId: string) => {
    // Use global route if no clientId
    const url = clientId
      ? `/orgs/${orgSlug}/clients/${clientId}/circuits/${versionId}/simulate`
      : `/orgs/${orgSlug}/circuits/${versionId}/simulate`;
    router.push(url);
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="flex items-center gap-2">
      <History className="size-4 text-muted-foreground" />
      <Select value={currentId} onValueChange={handleVersionChange}>
        <SelectTrigger className="h-8 w-auto gap-2">
          <SelectValue>
            v{currentVersion?.version} - {formatDate(currentVersion?.createdAt ?? new Date())}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {versions.map((v) => (
            <SelectItem key={v.id} value={v.id}>
              <div className="flex items-center gap-3">
                <span className="font-medium">v{v.version}</span>
                <span className="text-muted-foreground">
                  {formatDate(v.createdAt)}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({v.receptorCount} recepteur{v.receptorCount !== 1 ? "s" : ""})
                </span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
