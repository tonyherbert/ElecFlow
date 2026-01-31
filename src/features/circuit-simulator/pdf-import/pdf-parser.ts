/**
 * PDF text extraction using pdf-parse v1
 *
 * Note: pdf-parse has a bug where it tries to load a test file on require.
 * We work around this by importing the actual parser function directly.
 */

import pdf from "pdf-parse/lib/pdf-parse.js";

export type PdfExtractionResult = {
  /** Extracted text content */
  text: string;
  /** Number of pages */
  numPages: number;
  /** Document info (title, author, etc.) */
  info: {
    title?: string;
    author?: string;
    creator?: string;
  };
};

/**
 * Extract text content from a PDF buffer
 * @param buffer - PDF file as Buffer
 * @returns Extracted text and metadata
 */
export async function extractTextFromPdf(
  buffer: Buffer
): Promise<PdfExtractionResult> {
  const data = await pdf(buffer);

  // data.info may be undefined for some PDFs
  const info = data.info as Record<string, string> | undefined;

  return {
    text: data.text,
    numPages: data.numpages,
    info: {
      title: info?.Title,
      author: info?.Author,
      creator: info?.Creator,
    },
  };
}

/**
 * Extract text from specific pages of a PDF
 * Note: pdf-parse v1 extracts all text at once
 */
export async function extractTextFromPdfPages(
  buffer: Buffer,
  _startPage?: number,
  _endPage?: number
): Promise<PdfExtractionResult> {
  // pdf-parse v1 doesn't support page-specific extraction
  // For now, we extract all text and let the schema parser handle filtering
  return extractTextFromPdf(buffer);
}
