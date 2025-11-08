import { marked } from "marked";
marked.setOptions({
  breaks: true,
  gfm: true,
});

export interface PdfGenerationOptions {
  title?: string;
  apiEndpoint?: string;
  filename?: string;
}

const defaultOptions: Required<PdfGenerationOptions> = {
  title: "Generated PDF",
  apiEndpoint:
    process.env.NEXT_PUBLIC_PDF_SERVER_BASE_URL ||
    "https://readmecode-pdf.onrender.com/generate-pdf",

  filename: `pdfwrite.pdf`,
};

export function resolvePdfOptions(
  options: PdfGenerationOptions = {}
): Required<PdfGenerationOptions> {
  return { ...defaultOptions, ...options };
}

function getHealthEndpointFromApi(apiEndpoint: string): string {
  const explicit = process.env.NEXT_PUBLIC_PDF_HEALTH_URL;
  if (explicit && explicit.startsWith("http")) return explicit;

  try {
    const url = new URL(apiEndpoint);

    if (url.pathname.endsWith("/health")) {
      return url.toString();
    }

    if (url.pathname.endsWith("/generate-pdf")) {
      url.pathname = "/health";
      url.search = "";
      return url.toString();
    }

    url.pathname = "/health";
    url.search = "";
    return url.toString();
  } catch {
    if (apiEndpoint.includes("/generate-pdf")) {
      return apiEndpoint.replace(/\/generate-pdf$/, "/health");
    }
    return apiEndpoint.replace(/\/?$/, "/health");
  }
}

export async function pingPdfServer(
  apiEndpoint: string,
  timeoutMs = 60000
): Promise<void> {
  const healthUrl = getHealthEndpointFromApi(apiEndpoint);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(healthUrl, { method: "GET", signal: controller.signal });
  } catch (e: any) {
    if (e?.name === "AbortError") {
      console.warn("PDF health ping timed out", healthUrl);
    } else {
      console.warn("PDF health ping failed", e);
    }
  } finally {
    clearTimeout(timeout);
  }
}

export const convertMarkdownToHtml = (
  markdownContent: string,
  title: string = "Generated PDF"
): string => {
  let renderedHtml: string;

  try {
    renderedHtml = marked.parse(markdownContent) as string;
  } catch (error) {
    console.error("Markdown parsing error:", error);
    renderedHtml = `<pre>${markdownContent.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre>`;
  }

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${title}</title>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji">
         <link rel="stylesheet"
    href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
 
        <style>
          * {
            box-sizing: border-box;
            margin: 0;
            padding: 0;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif,'Noto Color Emoji', 'Segoe UI Emoji', 'Apple Color Emoji'; 
            line-height: 1.6;
             color: #333;
             padding: 40px; max-width: none;
          }
          
          h1, h2, h3, h4, h5, h6 {
            color: #1d4ed8;
            margin: 20px 0 5px 0;
          }
          
          h1 { 
            font-size: 2.5em; 
            border-bottom: 3px solid #1d4ed8;
            padding-bottom: 5px;
            font-weight: 800;
          }
          
          h2 { 
            font-size: 2.2em; 
            font-weight: 600;
          }
          
          h3 { 
            font-size: 1.7em; 
            font-weight: 600;
          }
           h4 { 
            font-size: 1.4em; 
            font-weight: 500;
          }
          h5 { 
            font-size: 1.3em; 
            font-weight: 500;
          }
          h6 { 
            font-size: 1em; 
            font-weight: 500;
          }
          p {
            margin: 10px 0;
            text-align: justify;
          }
          
          ul, ol {
            margin: 10px 0;
            padding-left: 30px;
          }
          
          li {
            margin: 5px 0;
          }
          
          table {
            border-collapse: collapse;
            width: 100%;
            margin: 20px 0;
            font-size: 0.9em;
          }
          
          table, th, td {
            border: 1px solid #d1d5db;
          }
          
          th, td {
            padding: 12px;
            text-align: left;
          }
          
          th {
            background-color: #f9fafb;
            font-weight: 600;
            color: #374151;
          }
          
          tr:nth-child(even) {
            background-color: #f9fafb;
          }
          
          code {
            background-color: #f3f4f6;
            padding: 2px 6px;
            border-radius: 4px;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
            font-size: 0.9em;
            color: #dc2626;
          }
          
          pre {
            background-color: #1f2937;
            color: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            overflow-x: auto;
            margin: 15px 0;
            font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          }
          
          pre code {
            background: none;
            color: inherit;
            padding: 0;
          }
          
          blockquote {
            border-left: 4px solid #1d4ed8;
            padding-left: 20px;
            margin: 20px 0;
            font-style: italic;
            color: #6b7280;
            background-color: #f8fafc;
            padding: 15px 20px;
            border-radius: 0 8px 8px 0;
          }
          
          strong {
            font-weight: 600;
            color: #111827;
          }
          
          em {
            font-style: italic;
            color: #4b5563;
          }
          
          a {
            color: #1d4ed8;
            text-decoration: none;
            border-bottom: 1px solid transparent;
          }
          
          a:hover {
            border-bottom-color: #1d4ed8;
          }
          
          img {
            max-width: 100%;
            height: auto;
            margin: 20px 0;
            border-radius: 8px;
          }
          


          @media print {
            body {
              padding: 20px;
            }
            
            h1 {
              page-break-after: avoid;
            }
            
            table, pre, blockquote {
              page-break-inside: avoid;
            }
          }
        </style>
         
      </head>
      <body>
        ${renderedHtml}
      </body>
       <script>hljs.highlightAll();</script>
    </html>
  `;
};

export const generatePdfFromHtml = async (
  html: string,
  apiEndpoint: string = defaultOptions.apiEndpoint
): Promise<Blob> => {
  console.log("Sending request to generate PDF...");

  const response = await fetch(apiEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/pdf",
    },
    body: JSON.stringify({ html }),
  });

  if (!response.ok) {
    let errorMessage = `Server responded with status ${response.status}`;

    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const errorData = await response.json();
        errorMessage = errorData.error || errorData.message || errorMessage;
      } else {
        const errorText = await response.text();
        errorMessage = errorText || errorMessage;
      }
    } catch (parseError) {
      console.error("Error parsing error response:", parseError);
    }

    throw new Error(errorMessage);
  }

  console.log("PDF generated successfully...");
  const blob = await response.blob();

  if (blob.size === 0) {
    throw new Error("Received empty PDF file");
  }

  return blob;
};

export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
  console.log("PDF download completed");
};

export const generateAndDownloadPdf = async (
  markdownContent: string,
  options: PdfGenerationOptions = {}
): Promise<void> => {
  const config = { ...defaultOptions, ...options };

  if (!markdownContent.trim()) {
    throw new Error("Please provide markdown content");
  }

  // Convert markdown to HTML
  const html = convertMarkdownToHtml(markdownContent, config.title);

  // Generate PDF from HTML
  const pdfBlob = await generatePdfFromHtml(html, config.apiEndpoint);

  downloadBlob(pdfBlob, config.filename);
};

export const validateMarkdownContent = (
  markdown: string
): {
  isValid: boolean;
  error?: string;
} => {
  if (!markdown) {
    return { isValid: false, error: "Markdown content is required" };
  }

  if (!markdown.trim()) {
    return { isValid: false, error: "Please enter some markdown content" };
  }

  return { isValid: true };
};