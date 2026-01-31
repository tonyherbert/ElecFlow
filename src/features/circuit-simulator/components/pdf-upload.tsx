"use client";

import { cn } from "@/lib/utils";
import { FileText, Loader2, Upload, X } from "lucide-react";
import { useCallback, useState } from "react";

type PdfUploadProps = {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
  disabled?: boolean;
};

export function PdfUpload({
  onFileSelect,
  isLoading = false,
  disabled = false,
}: PdfUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files.length > 0) {
        const file = files[0];
        if (file.type === "application/pdf") {
          setSelectedFile(file);
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        setSelectedFile(file);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const clearFile = useCallback(() => {
    setSelectedFile(null);
  }, []);

  if (selectedFile) {
    return (
      <div className="flex items-center gap-4 rounded-xl border bg-card p-5">
        <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10">
          <FileText className="size-6 text-primary" />
        </div>
        <div className="flex-1">
          <p className="font-medium">{selectedFile.name}</p>
          <p className="text-sm text-muted-foreground">
            {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
          </p>
        </div>
        {isLoading ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin" />
            Analyse en cours...
          </div>
        ) : (
          <button
            type="button"
            onClick={clearFile}
            disabled={disabled}
            className="flex size-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    );
  }

  return (
    <label
      className={cn(
        "group relative flex cursor-pointer flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed bg-card px-6 py-16 transition-all",
        isDragging
          ? "border-primary bg-primary/5"
          : "border-border/50 hover:border-primary/30 hover:bg-primary/[0.02]",
        disabled && "cursor-not-allowed opacity-50"
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div
        className={cn(
          "flex size-16 items-center justify-center rounded-2xl transition-all",
          isDragging
            ? "bg-primary/20 text-primary"
            : "bg-primary/10 text-primary group-hover:bg-primary/15"
        )}
      >
        <Upload className="size-8" />
      </div>
      <div className="text-center">
        <p className="text-lg font-medium">
          Glissez-déposez votre schéma ici
        </p>
        <p className="mt-1 text-sm text-muted-foreground">
          ou cliquez pour parcourir vos fichiers
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-muted/50 px-4 py-2 text-xs text-muted-foreground">
        <FileText className="size-3.5" />
        Format PDF - Maximum 10 MB
      </div>
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileInput}
        disabled={disabled || isLoading}
        className="hidden"
      />
    </label>
  );
}
