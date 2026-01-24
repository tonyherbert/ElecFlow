"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { FileUp, Loader2, X } from "lucide-react";
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

  return (
    <Card>
      <CardContent className="pt-6">
        {selectedFile ? (
          <div className="flex items-center justify-between rounded-lg border border-dashed p-4">
            <div className="flex items-center gap-3">
              <FileUp className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-medium">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
              {!isLoading && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={clearFile}
                  disabled={disabled}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        ) : (
          <label
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center gap-4 rounded-lg border-2 border-dashed p-8 transition-colors",
              isDragging
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-primary/50",
              disabled && "cursor-not-allowed opacity-50"
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileUp className="h-12 w-12 text-muted-foreground" />
            <div className="text-center">
              <p className="font-medium">
                Glissez-déposez votre PDF ici
              </p>
              <p className="text-sm text-muted-foreground">
                ou cliquez pour parcourir
              </p>
            </div>
            <p className="text-xs text-muted-foreground">
              Format Formelec uniquement - Maximum 10 MB
            </p>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileInput}
              disabled={disabled || isLoading}
              className="hidden"
            />
          </label>
        )}
      </CardContent>
    </Card>
  );
}
