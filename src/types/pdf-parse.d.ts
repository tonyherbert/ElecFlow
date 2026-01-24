declare module "pdf-parse/lib/pdf-parse.js" {
  type PdfParseOptions = {
    pagerender?: (pageData: unknown) => Promise<string>;
    max?: number;
    version?: string;
  };

  type PdfParseResult = {
    numpages: number;
    numrender: number;
    info: {
      PDFFormatVersion?: string;
      IsAcroFormPresent?: boolean;
      IsXFAPresent?: boolean;
      Title?: string;
      Author?: string;
      Subject?: string;
      Keywords?: string;
      Creator?: string;
      Producer?: string;
      CreationDate?: string;
      ModDate?: string;
    };
    metadata: unknown;
    text: string;
    version: string;
  };

  function pdfParse(
    buffer: Buffer,
    options?: PdfParseOptions
  ): Promise<PdfParseResult>;

  export default pdfParse;
}
