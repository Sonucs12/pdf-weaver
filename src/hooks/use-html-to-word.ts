import { useCallback, useState } from "react";

interface UseHtmlToWordReturn {
  convertAndDownload: (html: string, filename?: string) => Promise<void>;
  convertToBlob: (html: string, filename?: string) => Promise<Blob>;
  copyToClipboard: (html: string, filename?: string) => Promise<void>;
  isConverting: boolean;
  error: string | null;
}

interface DocumentOptions {
  orientation?: "portrait" | "landscape";
  margins?: {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
  };
}

export function useHtmlToWord(): UseHtmlToWordReturn {
  const [isConverting, setIsConverting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buildCompleteHtml = useCallback((html: string, filename: string) => {
    return `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <title>${filename}</title>
          <style>
            body {
              font-family: 'Calibri', 'Arial', sans-serif;
              font-size: 11pt;
              line-height: 1.5;
              color: #000000;
            }
            h1 { font-size: 24pt; font-weight: bold; margin: 12pt 0; color: #000000; }
            h2 { font-size: 18pt; font-weight: bold; margin: 10pt 0; color: #000000; }
            h3 { font-size: 14pt; font-weight: bold; margin: 8pt 0; color: #000000; }
            h4 { font-size: 12pt; font-weight: bold; margin: 6pt 0; color: #000000; }
            h5 { font-size: 11pt; font-weight: bold; margin: 4pt 0; color: #000000; }
            h6 { font-size: 10pt; font-weight: bold; margin: 2pt 0; color: #000000; }
            p { margin: 6pt 0; }
            ul, ol { margin: 6pt 0; padding-left: 30pt; }
            li { margin: 3pt 0; }
            blockquote {
              margin: 12pt 0;
              padding: 6pt 12pt;
              border-left: 3pt solid #cccccc;
              background-color: #f5f5f5;
            }
            pre {
              font-family: 'Courier New', monospace;
              background-color: #f5f5f5;
              padding: 12pt;
              border: 1pt solid #dddddd;
              white-space: pre-wrap;
              word-wrap: break-word;
            }
            code {
              font-family: 'Courier New', monospace;
              background-color: #f5f5f5;
              padding: 2pt 4pt;
            }
            strong, b { font-weight: bold; }
            em, i { font-style: italic; }
            u { text-decoration: underline; }
            s, strike { text-decoration: line-through; }
            a { color: #0563c1; text-decoration: underline; }
            img { max-width: 100%; height: auto; }
            table {
              border-collapse: collapse;
              width: 100%;
              margin: 12pt 0;
            }
            table, th, td {
              border: 1pt solid #000000;
              padding: 6pt;
            }
            th {
              background-color: #f0f0f0;
              font-weight: bold;
            }
            hr {
              border: none;
              border-top: 1pt solid #000000;
              margin: 12pt 0;
            }
          </style>
        </head>
        <body>
          ${html}
        </body>
        </html>
      `;
  }, []);

  const convertToBlob = useCallback(async (html: string, filename = "document") => {
    const { asBlob } = await import("html-docx-js-typescript");
    const completeHtml = buildCompleteHtml(html, filename);
    const options: DocumentOptions = {
      orientation: "portrait",
      margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
    };
    const result = await asBlob(completeHtml, options);
    const blob = result instanceof Blob
      ? result
      : new Blob([result as any], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    return blob as Blob;
  }, [buildCompleteHtml]);

  const convertAndDownload = useCallback(async (html: string, filename = "document") => {
    setIsConverting(true);
    setError(null);

    try {
      const docFilename = filename.endsWith(".docx") ? filename : `${filename}.docx`;

      const blob = await convertToBlob(html, filename);

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = docFilename;

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsConverting(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to convert HTML to Word";
      setError(errorMessage);
      setIsConverting(false);
      console.error("Error converting HTML to Word:", err);
    }
  }, []);

  const copyToClipboard = useCallback(async (html: string, filename = "document") => {
    try {
      const blob = await convertToBlob(html, filename);
      const item = new ClipboardItem({
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': blob,
      });
      await navigator.clipboard.write([item]);
    } catch (err) {
      throw err;
    }
  }, [convertToBlob]);

  return {
    convertAndDownload,
    convertToBlob,
    copyToClipboard,
    isConverting,
    error,
  };
}

