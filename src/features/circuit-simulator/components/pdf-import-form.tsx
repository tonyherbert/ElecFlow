"use client";

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

import {
  checkExistingVersionsAction,
  importPdfAction,
  parsePdfAction,
} from "../actions/pdf-import.action";
import type { CircuitBuildResult, ParsedPdfResult } from "../pdf-import/types";
import { PdfPreview } from "./pdf-preview";
import { PdfUpload } from "./pdf-upload";
import { VersionSelector } from "./version-selector";

type Client = {
  id: string;
  name: string;
};

type PdfImportFormProps = {
  orgSlug: string;
  clientId?: string;
  clients?: Client[];
};

type ParseResult = {
  parsed: ParsedPdfResult;
  buildResult: CircuitBuildResult;
  pdfInfo: {
    numPages: number;
    title?: string;
  };
  fingerprint: string | null;
};

type VersionMatch = {
  id: string;
  name: string;
  version: number;
  createdAt: Date;
  latestVersion: number;
};

export function PdfImportForm({ orgSlug, clientId: initialClientId, clients }: PdfImportFormProps) {
  const router = useRouter();
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // Client selection for global import
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(initialClientId);

  // Version matching state
  const [versionMatches, setVersionMatches] = useState<VersionMatch[]>([]);
  const [selectedParent, setSelectedParent] = useState<string | null>(null);
  const [showVersionSelector, setShowVersionSelector] = useState(false);

  const handleFileSelect = async (file: File) => {
    setIsParsing(true);
    setParseResult(null);
    setVersionMatches([]);
    setSelectedParent(null);
    setShowVersionSelector(false);

    try {
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      setFileBase64(base64);
      setFileName(file.name);

      // Parse PDF
      const result = await resolveActionResult(
        parsePdfAction({
          fileBase64: base64,
          fileName: file.name,
        })
      );

      setParseResult(result);

      if (result.parsed.components.length === 0) {
        toast.error("Aucun composant detecte dans le PDF");
      } else {
        toast.success(
          `${result.parsed.components.length} composants detectes`
        );

        // Check for existing versions if we have a fingerprint
        if (result.fingerprint) {
          const versionCheck = await resolveActionResult(
            checkExistingVersionsAction({
              fingerprint: result.fingerprint,
              clientId: selectedClientId,
            })
          );

          if (versionCheck.hasExistingVersions) {
            setVersionMatches(versionCheck.existingCircuits);
            setShowVersionSelector(true);
          }
        }
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'analyse"
      );
      setParseResult(null);
    } finally {
      setIsParsing(false);
    }
  };

  const handleImport = async (customName?: string) => {
    if (!fileBase64 || !fileName) return;

    setIsImporting(true);

    try {
      const result = await resolveActionResult(
        importPdfAction({
          fileBase64,
          fileName,
          clientId: selectedClientId,
          customName,
          createAsVersionOf: selectedParent ?? undefined,
        })
      );

      const message = result.isNewVersion
        ? `Circuit v${result.version} cree avec ${result.componentsCount} composants`
        : `Circuit cree avec ${result.componentsCount} composants`;

      toast.success(message);

      // Redirect to the circuit simulation page
      router.push(
        `/orgs/${orgSlug}/circuits/${result.circuitId}/simulate`
      );
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'import"
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setParseResult(null);
    setFileBase64(null);
    setFileName(null);
    setVersionMatches([]);
    setSelectedParent(null);
    setShowVersionSelector(false);
  };

  const handleVersionSelected = () => {
    setShowVersionSelector(false);
  };

  // Show version selector if matches found
  if (showVersionSelector && versionMatches.length > 0) {
    return (
      <VersionSelector
        matches={versionMatches}
        selected={selectedParent}
        onSelect={setSelectedParent}
        onContinue={handleVersionSelected}
      />
    );
  }

  if (parseResult) {
    return (
      <div className="flex flex-col gap-6">
        {/* Client selector for global import (only if clients list is provided) */}
        {clients && clients.length > 0 && (
          <div className="rounded-xl border bg-card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Users className="size-5 text-primary" />
              </div>
              <div>
                <p className="font-medium">Associer à un client</p>
                <p className="text-sm text-muted-foreground">
                  Optionnel - vous pourrez l'assigner plus tard
                </p>
              </div>
            </div>
            <Select value={selectedClientId ?? "none"} onValueChange={(v) => setSelectedClientId(v === "none" ? undefined : v)}>
              <SelectTrigger>
                <SelectValue placeholder="Aucun client (non assigné)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Aucun client (non assigné)</SelectItem>
                {clients.map((client) => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        <PdfPreview
          parsed={parseResult.parsed}
          buildResult={parseResult.buildResult}
          pdfInfo={parseResult.pdfInfo}
          onImport={handleImport}
          onCancel={handleCancel}
          isImporting={isImporting}
        />
      </div>
    );
  }

  return (
    <PdfUpload
      onFileSelect={handleFileSelect}
      isLoading={isParsing}
      disabled={isParsing}
    />
  );
}
