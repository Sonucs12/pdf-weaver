import { useState, useCallback, useRef } from "react";
import {
  PdfGeneratorService,
  PdfGenerationOptions,
  validateMarkdownContent,
} from "../lib/pdfGenerator";

type Phase = "idle" | "validating" | "waking" | "generating" | "downloading";

interface PdfGeneratorState {
  isGenerating: boolean;
  error: string | null;
  isValidContent: boolean;
  phase: Phase;
  progress: number;
}

interface UsePdfGeneratorReturn {
  isGenerating: boolean;
  error: string | null;
  isValidContent: boolean;
  phase: Phase;
  progress: number;
  generatePdf: (
    markdownContent: string,
    options?: PdfGenerationOptions
  ) => Promise<void>;
  clearError: () => void;
  validateContent: (markdownContent: string) => boolean;
  cancelGeneration: () => void;
}

export const usePdfGenerator = (): UsePdfGeneratorReturn => {
  const [state, setState] = useState<PdfGeneratorState>({
    isGenerating: false,
    error: null,
    isValidContent: false,
    phase: "idle",
    progress: 0,
  });

  const abortControllerRef = useRef<AbortController | null>(null);

  const updateState = useCallback(
    (updates: Partial<PdfGeneratorState>) => {
      setState((prev) => ({ ...prev, ...updates }));
    },
    []
  );

  const setPhase = useCallback(
    (phase: Phase, progress: number) => {
      updateState({ phase, progress });
    },
    [updateState]
  );

  const generatePdf = useCallback(
    async (
      markdownContent: string,
      options: PdfGenerationOptions = {}
    ): Promise<void> => {
      updateState({
        isGenerating: true,
        error: null,
        phase: "validating",
        progress: 0,
      });

      abortControllerRef.current = new AbortController();

      try {
        // Validation
        setPhase("validating", 10);
        const validation = validateMarkdownContent(markdownContent);
        if (!validation.isValid) {
          throw new Error(validation.error || "Invalid content");
        }

        // Server wake-up
        setPhase("waking", 20);
        console.log("Waking up PDF server...");

        // Generation
        setPhase("generating", 50);
        console.log("Generating PDF...");

        const service = new PdfGeneratorService(options);
        const blob = await service.generate(markdownContent);

        // 
        if (abortControllerRef.current?.signal.aborted) {
          throw new Error("Generation cancelled by user");
        }

        //  Downloading
        setPhase("downloading", 90);
        console.log("Downloading PDF...");

        // Download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = options.filename || "pdfwrite.pdf";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Success
        updateState({
          isGenerating: false,
          error: null,
          isValidContent: true,
          phase: "idle",
          progress: 100,
        });

        console.log("PDF generation completed successfully");
      } catch (error: any) {
        console.error("PDF generation failed:", error);

        const errorMessage =
          error.message || "An unknown error occurred during PDF generation.";

        updateState({
          isGenerating: false,
          error: errorMessage,
          isValidContent: false,
          phase: "idle",
          progress: 0,
        });

        throw error;
      } finally {
        abortControllerRef.current = null;
      }
    },
    [updateState, setPhase]
  );

  const clearError = useCallback(() => {
    updateState({ error: null });
  }, [updateState]);

  const validateContent = useCallback(
    (markdownContent: string): boolean => {
      const validation = validateMarkdownContent(markdownContent);
      updateState({
        isValidContent: validation.isValid,
        error: validation.isValid ? null : validation.error || null,
      });
      return validation.isValid;
    },
    [updateState]
  );

  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      updateState({
        isGenerating: false,
        error: "Generation cancelled",
        phase: "idle",
        progress: 0,
      });
    }
  }, [updateState]);

  return {
    isGenerating: state.isGenerating,
    error: state.error,
    isValidContent: state.isValidContent,
    phase: state.phase,
    progress: state.progress,
    generatePdf,
    clearError,
    validateContent,
    cancelGeneration,
  };
};