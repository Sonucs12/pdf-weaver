import { useState, useCallback } from "react";
import {
  generateAndDownloadPdf,
  validateMarkdownContent,
  PdfGenerationOptions,
  resolvePdfOptions,
  pingPdfServer,
} from "../lib/pdfGenerator";


interface PdfGeneratorState {
  isGenerating: boolean;
  error: string | null;
  isValidContent: boolean;
  phase: "idle" | "waking" | "generating";
}

interface UsePdfGeneratorReturn {
  isGenerating: boolean;
  error: string | null;
  isValidContent: boolean;
  phase: "idle" | "waking" | "generating";

  generatePdf: (
    markdownContent: string,
    options?: PdfGenerationOptions
  ) => Promise<void>;
  clearError: () => void;
  validateContent: (markdownContent: string) => boolean;
}

export const usePdfGenerator = (): UsePdfGeneratorReturn => {
  const [state, setState] = useState<PdfGeneratorState>({
    isGenerating: false,
    error: null,
    isValidContent: false,
    phase: "idle",
  });

  const generatePdf = useCallback(
    async (
      markdownContent: string,
      options?: PdfGenerationOptions
    ): Promise<void> => {
      const validation = validateMarkdownContent(markdownContent);
      if (!validation.isValid) {
        setState((prev) => ({
          ...prev,
          error: validation.error || "Invalid content",
          isValidContent: false,
          isGenerating: false,
          phase: "idle",
        }));
        return;
      }

      const cfg = resolvePdfOptions(options);

      // Phase: Waking server
      setState((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
        isValidContent: true,
        phase: "waking",
      }));
      await pingPdfServer(cfg.apiEndpoint).catch(() => {});

      // Phase: Generating PDF
      setState((prev) => ({ ...prev, phase: "generating" }));

      try {
        await generateAndDownloadPdf(markdownContent, options);

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          phase: "idle",
        }));

        try {
         
        } catch (trackErr) {
          console.warn("PDF generation tracking failed", trackErr);
        }
      } catch (err) {
        console.error("Error generating PDF:", err);
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          phase: "idle",
          error: err instanceof Error ? err.message : "Failed to generate PDF",
        }));
        throw err instanceof Error ? err : new Error("Failed to generate PDF");
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  const validateContent = useCallback((markdownContent: string): boolean => {
    const validation = validateMarkdownContent(markdownContent);
    setState((prev) => ({
      ...prev,
      isValidContent: validation.isValid,
      error: validation.isValid ? null : validation.error || null,
    }));

    return validation.isValid;
  }, []);

  return {
    isGenerating: state.isGenerating,
    error: state.error,
    isValidContent: state.isValidContent,
    phase: state.phase,
    generatePdf,
    clearError,
    validateContent,
  };
};