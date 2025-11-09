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
    async (markdownContent: string, options: PdfGenerationOptions = {}) => {
      setState((prev) => ({
        ...prev,
        isGenerating: true,
        error: null,
        phase: "waking",
      }));

      const config = resolvePdfOptions(options);

      try {
        const isServerReady = await pingPdfServer(config.apiEndpoint);

        if (!isServerReady) {
          throw new Error(
            "PDF server is not responding. Please try again later."
          );
        }

        setState((prev) => ({
          ...prev,
          phase: "generating",
        }));

        await generateAndDownloadPdf(markdownContent, config);

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          phase: "idle",
        }));
      } catch (e: any) {
        console.error("PDF generation failed:", e);
        const errorMessage =
          e.message || "An unknown error occurred during PDF generation.";
        setState((prev) => ({
          ...prev,
          isGenerating: false,
          error: errorMessage,
          phase: "idle",
        }));
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