"use client";

import { resolveActionResult } from "@/lib/actions/actions-utils";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  parsePdfAction,
  importPdfAction,
} from "../actions/pdf-import.action";
import type { ParsedPdfResult, CircuitBuildResult } from "../pdf-import/types";
import { PdfPreview } from "./pdf-preview";
import { PdfUpload } from "./pdf-upload";

type PdfImportFormProps = {
  orgSlug: string;
  clientId: string;
};

type ParseResult = {
  parsed: ParsedPdfResult;
  buildResult: CircuitBuildResult;
  pdfInfo: {
    numPages: number;
    title?: string;
  };
};

export function PdfImportForm({ orgSlug, clientId }: PdfImportFormProps) {
  const router = useRouter();
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [fileBase64, setFileBase64] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileSelect = async (file: File) => {
    setIsParsing(true);
    setParseResult(null);

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
        toast.error("Aucun composant détecté dans le PDF");
      } else {
        toast.success(
          `${result.parsed.components.length} composants détectés`
        );
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
          clientId,
          customName,
        })
      );

      toast.success(`Circuit créé avec ${result.componentsCount} composants`);

      // Redirect to simulate the new circuit
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
    setParseResult(null);
    setFileBase64(null);
    setFileName(null);
  };

  if (parseResult) {
    return (
      <PdfPreview
        parsed={parseResult.parsed}
        buildResult={parseResult.buildResult}
        pdfInfo={parseResult.pdfInfo}
        onImport={handleImport}
        onCancel={handleCancel}
        isImporting={isImporting}
      />
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
