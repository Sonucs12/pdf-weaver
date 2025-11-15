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
  retries = 8,
  delay = 3000,
  timeoutMs = 30000
): Promise<boolean> {
  const healthUrl = getHealthEndpointFromApi(apiEndpoint);

  for (let i = 0; i < retries; i++) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const response = await fetch(healthUrl, {
        method: "GET",
        signal: controller.signal,
        cache: 'no-store',
      });
      clearTimeout(timeout);
      
      if (response.ok) {
        console.log(`PDF server is healthy (attempt ${i + 1}/${retries})`);
        await new Promise((resolve) => setTimeout(resolve, 2000));
        return true;
      }
    } catch (e: any) {
      clearTimeout(timeout);
      if (e?.name === "AbortError") {
        console.warn(`PDF health ping attempt ${i + 1}/${retries} timed out.`);
      } else {
        console.warn(`PDF health ping attempt ${i + 1}/${retries} failed:`, e.message);
      }
    }

    if (i < retries - 1) {
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  console.error("PDF server is unresponsive after multiple attempts.");
  return false;
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
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Noto Color Emoji', 'Segoe UI Emoji', 'Apple Color Emoji'; 
    line-height: 1.8;
    color: #1f2937;
    padding: 60px 80px;
    max-width: none;
    font-size: 16px;
  }
  
  h1, h2, h3, h4, h5, h6 {
    color: #1e40af;
    margin-top: 32px;
    margin-bottom: 16px;
    line-height: 1.3;
    font-weight: 600;
  }
  
  h1 { 
    font-size: 2em;
    border-bottom: 2px solid #3b82f6;
    padding-bottom: 8px;
    font-weight: 700;
    margin-top: 0;
  }
  
  h2 { 
    font-size: 1.6em;
    font-weight: 650;
    padding-bottom: 4px;
    border-bottom: 1px solid #e5e7eb;
  }
  
  h3 { 
    font-size: 1.35em;
    font-weight: 600;
  }
  
  h4 { 
    font-size: 1.15em;
    font-weight: 600;
    color: #374151;
  }
  
  h5 { 
    font-size: 1.05em;
    font-weight: 600;
    color: #374151;
  }
  
  h6 { 
    font-size: 0.95em;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  p {
    margin: 12px 0;
    text-align: justify;
    color: #374151;
  }
  
  ul, ol {
    margin: 16px 0;
    padding-left: 32px;
  }
  
  li {
    margin: 8px 0;
    line-height: 1.7;
    color: #374151;
  }
  
  li::marker {
    color: #3b82f6;
  }
  
  table {
    border-collapse: collapse;
    width: 100%;
    margin: 24px 0;
    font-size: 0.9em;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  }
  
  table, th, td {
    border: 1px solid #d1d5db;
  }
  
  th, td {
    padding: 12px 16px;
    text-align: left;
  }
  
  th {
    background-color: #f3f4f6;
    font-weight: 600;
    color: #1f2937;
    border-bottom: 2px solid #9ca3af;
  }
  
  tr:nth-child(even) {
    background-color: #f9fafb;
  }
  
  tr:hover {
    background-color: #f3f4f6;
  }
  
  code {
    background-color: #f3f4f6;
    padding: 3px 8px;
    border-radius: 4px;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.88em;
    color: #dc2626;
    border: 1px solid #e5e7eb;
  }
  
  pre {
    background-color: #1f2937;
    color: #f9fafb;
    padding: 0px;
    border-radius: 8px;
    overflow-x: auto;
    margin: 20px 0;
    font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
    font-size: 0.88em;
    line-height: 1.6;
    border: 1px solid #374151;
  }
  
  pre code {
    background: none;
    color: inherit;
    padding: 0;
    border: none;
  }
  
  blockquote {
    border-left: 4px solid #3b82f6;
    padding-left: 20px;
    margin: 24px 0;
    font-style: italic;
    color: #4b5563;
    background-color: #f8fafc;
    padding: 16px 20px;
    border-radius: 0 8px 8px 0;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }
  
  blockquote p {
    margin: 8px 0;
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
    color: #2563eb;
    text-decoration: none;
    border-bottom: 1px solid transparent;
    transition: border-bottom-color 0.2s;
  }
  
  a:hover {
    border-bottom-color: #2563eb;
  }
  
  img {
    max-width: 100%;
    height: auto;
    margin: 24px 0;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }
  
  hr {
    border: none;
    border-top: 2px solid #e5e7eb;
    margin: 32px 0;
  }
  
  @media print {
    body {
      padding: 40px;
      font-size: 12pt;
    }
    
    h1 {
      font-size: 1.8em;
      page-break-after: avoid;
    }
    
    h2 {
      font-size: 1.5em;
      page-break-after: avoid;
    }
    
    h3, h4, h5, h6 {
      page-break-after: avoid;
    }
    
    table, pre, blockquote, img {
      page-break-inside: avoid;
    }
    
    a {
      color: #2563eb;
      text-decoration: underline;
    }
    
    pre {
      border: 1px solid #d1d5db;
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
  apiEndpoint: string = defaultOptions.apiEndpoint,
  timeoutMs: number = 60000
): Promise<Blob> => {
  console.log("Sending request to generate PDF...");

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(apiEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/pdf",
      },
      body: JSON.stringify({ html }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

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
  } catch (error: any) {
    clearTimeout(timeout);
    
    if (error?.name === "AbortError") {
      throw new Error("PDF generation timed out. The server took too long to respond.");
    }
    
    throw error;
  }
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

  const html = convertMarkdownToHtml(markdownContent, config.title);
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