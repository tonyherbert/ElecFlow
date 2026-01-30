"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { resolveActionResult } from "@/lib/actions/actions-utils";
import { SiteConfig } from "@/site-config";
import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  aiParsePdfAction,
  validateAndBuildAction,
} from "../actions/ai-parse.action";
import {
  checkExistingVersionsAction,
  importPdfAction,
  parsePdfAction,
} from "../actions/pdf-import.action";
import type {
  AIParserComponent,
  AIParseResult,
  CircuitBuildResult,
  ParsedPdfResult,
} from "../pdf-import/types";
import { ComponentValidationForm } from "./component-validation-form";
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

// Legacy parse result (for preview step)
type ParseResult = {
  parsed: ParsedPdfResult;
  buildResult: CircuitBuildResult;
  pdfInfo: {
    numPages: number;
    title?: string;
  };
  fingerprint: string | null;
};

// AI parse result
type AIParseResultState = {
  aiResult: AIParseResult;
  pdfInfo: {
    numPages: number;
    title?: string;
  };
  rawText: string;
};

type VersionMatch = {
  id: string;
  name: string;
  version: number;
  createdAt: Date;
  latestVersion: number;
};

type ImportStep = "upload" | "ai-validation" | "version-select" | "preview";

// Feature flag for AI parsing
const ENABLE_AI_PARSING = SiteConfig.features.enableAIParsing;

export function PdfImportForm({
  orgSlug,
  clientId: initialClientId,
  clients,
}: PdfImportFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<ImportStep>("upload");
  const [isParsing, setIsParsing] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  // File state
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  // AI parsing state
  const [aiParseResult, setAIParseResult] = useState<AIParseResultState | null>(
    null
  );

  // Validated result (after AI validation or legacy parsing)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);

  // Client selection for global import
  const [selectedClientId, setSelectedClientId] = useState<string | undefined>(
    initialClientId
  );

  // Version matching state
  const [versionMatches, setVersionMatches] = useState<VersionMatch[]>([]);
  const [selectedParent, setSelectedParent] = useState<string | null>(null);

  // Legacy parsing (regex-based, no AI)
  const handleFileSelectLegacy = async (file: File) => {
    setIsParsing(true);
    setParseResult(null);
    setVersionMatches([]);
    setSelectedParent(null);

    try {
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      setFileBase64(base64);
      setFileName(file.name);

      // Parse PDF with legacy parser
      const result = await resolveActionResult(
        parsePdfAction({
          fileBase64: base64,
          fileName: file.name,
        })
      );

      setParseResult(result);

      if (result.parsed.components.length === 0) {
        toast.error("Aucun composant détecté dans le PDF");
      } else {
        toast.success(
          `${result.parsed.components.length} composants détectés`
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
            setStep("version-select");
            return;
          }
        }

        // No version matches, go directly to preview
        setStep("preview");
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

  // AI parsing (Claude-based)
  const handleFileSelectAI = async (file: File) => {
    setIsParsing(true);
    setAIParseResult(null);
    setParseResult(null);
    setVersionMatches([]);
    setSelectedParent(null);

    try {
      // Convert file to base64
      const buffer = await file.arrayBuffer();
      const base64 = Buffer.from(buffer).toString("base64");
      setFileBase64(base64);
      setFileName(file.name);

      // Parse PDF with AI
      const result = await resolveActionResult(
        aiParsePdfAction({
          fileBase64: base64,
          fileName: file.name,
        })
      );

      setAIParseResult(result);

      if (result.aiResult.components.length === 0) {
        toast.error("Aucun composant détecté dans le PDF");
      } else {
        toast.success(
          `${result.aiResult.components.length} composants détectés par l'IA`
        );
        setStep("ai-validation");
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'analyse"
      );
      setAIParseResult(null);
    } finally {
      setIsParsing(false);
    }
  };

  // Choose parsing method based on feature flag
  const handleFileSelect = ENABLE_AI_PARSING
    ? handleFileSelectAI
    : handleFileSelectLegacy;

  const handleAIValidation = async (
    components: AIParserComponent[],
    name: string
  ) => {
    setIsValidating(true);

    try {
      // Validate and build circuit
      const result = await resolveActionResult(
        validateAndBuildAction({
          components,
          name,
        })
      );

      // Create parse result for preview
      const parsed: ParsedPdfResult = {
        documentName: name,
        components: result.parsedComponents,
        errors: [],
      };

      setParseResult({
        parsed,
        buildResult: result.buildResult,
        pdfInfo: aiParseResult?.pdfInfo ?? { numPages: 1 },
        fingerprint: result.fingerprint,
      });

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
          setStep("version-select");
          return;
        }
      }

      // No version matches, go to preview
      setStep("preview");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de la validation"
      );
    } finally {
      setIsValidating(false);
    }
  };

  const handleVersionSelected = () => {
    setStep("preview");
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
        ? `Circuit v${result.version} créé avec ${result.componentsCount} composants`
        : `Circuit créé avec ${result.componentsCount} composants`;

      toast.success(message);

      // Redirect to the circuit simulation page
      router.push(`/orgs/${orgSlug}/circuits/${result.circuitId}/simulate`);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Erreur lors de l'import"
      );
    } finally {
      setIsImporting(false);
    }
  };

  const handleCancel = () => {
    setStep("upload");
    setAIParseResult(null);
    setParseResult(null);
    setFileBase64(null);
    setFileName(null);
    setVersionMatches([]);
    setSelectedParent(null);
  };

  // Client selector component (reused across steps)
  const ClientSelector = () => {
    if (!clients || clients.length === 0) return null;

    return (
      <div className="rounded-xl border bg-card p-5">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="size-5 text-primary" />
          </div>
          <div>
            <p className="font-medium">Associer à un client</p>
            <p className="text-sm text-muted-foreground">
              Optionnel - vous pourrez l&apos;assigner plus tard
            </p>
          </div>
        </div>
        <Select
          value={selectedClientId ?? "none"}
          onValueChange={(v) =>
            setSelectedClientId(v === "none" ? undefined : v)
          }
        >
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
    );
  };

  // Step: Version selector
  if (step === "version-select" && versionMatches.length > 0) {
    return (
      <VersionSelector
        matches={versionMatches}
        selected={selectedParent}
        onSelect={setSelectedParent}
        onContinue={handleVersionSelected}
      />
    );
  }

  // Step: Preview (final confirmation)
  if (step === "preview" && parseResult) {
    return (
      <div className="flex flex-col gap-6">
        <ClientSelector />
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

  // Step: AI Validation (only when AI parsing is enabled)
  if (
    ENABLE_AI_PARSING &&
    step === "ai-validation" &&
    aiParseResult &&
    fileName
  ) {
    return (
      <div className="flex flex-col gap-6">
        <ClientSelector />
        <ComponentValidationForm
          aiResult={aiParseResult.aiResult}
          pdfInfo={aiParseResult.pdfInfo}
          fileName={fileName}
          onValidate={handleAIValidation}
          onCancel={handleCancel}
          isValidating={isValidating}
        />
      </div>
    );
  }

  // Step: Upload
  return (
    <PdfUpload
      onFileSelect={handleFileSelect}
      isLoading={isParsing}
      disabled={isParsing}
    />
  );
}
