import { marked } from "marked";

// Configuration Class - Single Responsibility
class PdfConfig {
  readonly title: string;
  readonly apiEndpoint: string;
  readonly filename: string;
  readonly healthCheckRetries: number;
  readonly healthCheckDelay: number;
  readonly healthCheckTimeout: number;
  readonly generationRetries: number;
  readonly generationTimeout: number;

  constructor(options: Partial<PdfGenerationOptions> = {}) {
    const defaults = this.getDefaults();
    this.title = options.title || defaults.title;
    this.apiEndpoint = options.apiEndpoint || defaults.apiEndpoint;
    this.filename = options.filename || defaults.filename;
    this.healthCheckRetries = options.healthCheckRetries || 8;
    this.healthCheckDelay = options.healthCheckDelay || 3000;
    this.healthCheckTimeout = options.healthCheckTimeout || 30000;
    this.generationRetries = options.generationRetries || 3;
    this.generationTimeout = options.generationTimeout || 90000; // Increased
  }

  private getDefaults() {
    return {
      title: "Generated PDF",
      apiEndpoint:
        process.env.NEXT_PUBLIC_PDF_SERVER_BASE_URL ||
        "https://readmecode-pdf.onrender.com/generate-pdf",
      filename: "pdfwrite.pdf",
    };
  }

  getHealthEndpoint(): string {
    const explicit = process.env.NEXT_PUBLIC_PDF_HEALTH_URL;
    if (explicit?.startsWith("http")) return explicit;

    try {
      const url = new URL(this.apiEndpoint);
      url.pathname = url.pathname.replace(/\/generate-pdf$/, "") + "/health";
      url.search = "";
      return url.toString();
    } catch {
      return this.apiEndpoint.replace(/\/generate-pdf$/, "") + "/health";
    }
  }
}

// Health Check Service - Single Responsibility
class HealthCheckService {
  constructor(private config: PdfConfig) {}

  async ping(): Promise<boolean> {
    const healthUrl = this.config.getHealthEndpoint();

    for (
      let attempt = 1;
      attempt <= this.config.healthCheckRetries;
      attempt++
    ) {
      console.log(
        `Health check attempt ${attempt}/${this.config.healthCheckRetries}`
      );

      try {
        const isHealthy = await this.singlePing(healthUrl);
        if (isHealthy) {
          console.log(`Server is healthy. Waiting for stabilization...`);
          await this.delay(3000); // Increased stabilization time
          return true;
        }
      } catch (error: any) {
        console.warn(`Health check ${attempt} failed:`, error.message);
      }

      if (attempt < this.config.healthCheckRetries) {
        await this.delay(this.config.healthCheckDelay);
      }
    }

    return false;
  }

  private async singlePing(url: string): Promise<boolean> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.healthCheckTimeout
    );

    try {
      const response = await fetch(url, {
        method: "GET",
        signal: controller.signal,
        cache: "no-store",
      });
      return response.ok;
    } finally {
      clearTimeout(timeout);
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// HTML Template Generator - Single Responsibility
class HtmlTemplateGenerator {
  static generate(content: string, title: string): string {
    marked.setOptions({ breaks: true, gfm: true });

    let renderedHtml: string;
    try {
      renderedHtml = marked.parse(content) as string;
    } catch (error) {
      console.error("Markdown parsing error:", error);
      renderedHtml = `<pre>${this.escapeHtml(content)}</pre>`;
    }

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${this.escapeHtml(title)}</title>
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Color+Emoji">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
  ${this.getStyles()}
</head>
<body>
  ${renderedHtml}
</body>
<script>hljs.highlightAll();</script>
</html>`;
  }

  private static escapeHtml(text: string): string {
    return text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  private static getStyles(): string {
    return `<style>
* { box-sizing: border-box; margin: 0; padding: 0; }
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif, 'Noto Color Emoji';
  line-height: 1.5; color: #1f2937; padding: 60px 80px; font-size: 16px;
}
h1, h2, h3, h4, h5, h6 { color: #1e40af; margin-top: 32px; margin-bottom: 16px; font-weight: 600; }
h1 { font-size: 2em; border-bottom: 2px solid #3b82f6; padding-bottom: 8px; margin-top: 0; }
h2 { font-size: 1.4em; }
h3 { font-size: 1.3em; }
p { margin: 12px 0; text-align: justify; color: #374151; }
ul, ol { margin: 16px 0; padding-left: 32px; }
li { margin: 8px 0; line-height: 1.7; color: #374151; }
li::marker { color: #3b82f6; }
code {
  background-color: #f3f4f6; padding: 2px 5px; border-radius: 4px;
  font-family: 'Consolas', 'Monaco', monospace; font-size: 0.85em;
  color: #dc2626; border: 1px solid #e5e7eb; word-wrap: break-word;
}
pre {
  background-color: #1f2937; color: #f9fafb; padding: 16px;
  border-radius: 8px; margin: 20px 0; font-size: 0.90em;
  white-space: pre-wrap; word-wrap: break-word; overflow-x: auto;
}
pre code { background: none; color: inherit; padding: 0; border: none; }
blockquote {
  border-left: 4px solid #3b82f6; padding: 16px 20px; margin: 24px 0;
  font-style: italic; color: #4b5563; background-color: #f8fafc;
  border-radius: 0 8px 8px 0;
}
table { border-collapse: collapse; width: 100%; margin: 24px 0; }
th, td { padding: 12px 16px; text-align: left; border: 1px solid #d1d5db; }
th { background-color: #f3f4f6; font-weight: 600; }
a { color: #2563eb; text-decoration: none; word-wrap: break-word; }
img { max-width: 100%; height: auto; margin: 24px 0; border-radius: 8px; }
@media print {
  body { padding: 40px; font-size: 12pt; }
  pre { white-space: pre-wrap; }
}
</style>`;
  }
}

// PDF API Client - Single Responsibility
class PdfApiClient {
  constructor(private config: PdfConfig) {}

  async generatePdf(html: string, attemptNumber: number = 1): Promise<Blob> {
    console.log(
      `PDF generation attempt ${attemptNumber}/${this.config.generationRetries}`
    );

    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      this.config.generationTimeout
    );

    try {
      const response = await fetch(this.config.apiEndpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/pdf",
        },
        body: JSON.stringify({
          html,
          brandName: "https://pdfwrite.vercel.app",
          options: {
            // Add options to help Puppeteer stability
            waitForNetworkIdle: true,
            timeout: 60000,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(await this.extractErrorMessage(response));
      }

      const blob = await response.blob();
      if (blob.size === 0) {
        throw new Error("Received empty PDF file");
      }

      console.log(`PDF generated successfully (${blob.size} bytes)`);
      return blob;
    } finally {
      clearTimeout(timeout);
    }
  }

  private async extractErrorMessage(response: Response): Promise<string> {
    let errorMessage = `Server error: ${response.status}`;
    try {
      const contentType = response.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        const data = await response.json();
        errorMessage = data.error || data.message || errorMessage;
      } else {
        const text = await response.text();
        errorMessage = text || errorMessage;
      }
    } catch {
      // Use default message
    }
    return errorMessage;
  }
}

// Validator - Single Responsibility
class ContentValidator {
  static validate(markdown: string): ValidationResult {
    if (!markdown) {
      return { isValid: false, error: "Markdown content is required" };
    }
    if (!markdown.trim()) {
      return { isValid: false, error: "Please enter some markdown content" };
    }
    return { isValid: true };
  }
}

// Main PDF Generator Service - Orchestration
export class PdfGeneratorService {
  private config: PdfConfig;
  private healthCheck: HealthCheckService;
  private apiClient: PdfApiClient;

  constructor(options: Partial<PdfGenerationOptions> = {}) {
    this.config = new PdfConfig(options);
    this.healthCheck = new HealthCheckService(this.config);
    this.apiClient = new PdfApiClient(this.config);
  }

  async generate(markdownContent: string): Promise<Blob> {
    // Validate content
    const validation = ContentValidator.validate(markdownContent);
    if (!validation.isValid) {
      throw new Error(validation.error);
    }

    // Wake up server
    const isHealthy = await this.healthCheck.ping();
    if (!isHealthy) {
      throw new Error(
        "PDF server is not responding. Please try again in a few moments."
      );
    }

    // Generate HTML
    const html = HtmlTemplateGenerator.generate(
      markdownContent,
      this.config.title
    );

    // Generate PDF with retry logic
    return await this.generateWithRetry(html);
  }

  private async generateWithRetry(html: string): Promise<Blob> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.generationRetries; attempt++) {
      try {
        return await this.apiClient.generatePdf(html, attempt);
      } catch (error: any) {
        lastError = error;
        console.error(`Attempt ${attempt} failed:`, error.message);

        if (attempt < this.config.generationRetries) {
          // Wait before retry with exponential backoff
          const waitTime = Math.min(3000 * attempt, 10000);
          console.log(`Retrying in ${waitTime}ms...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }
      }
    }

    throw new Error(
      `PDF generation failed after ${this.config.generationRetries} attempts: ${lastError?.message}`
    );
  }

  async generateAndDownload(markdownContent: string): Promise<void> {
    const blob = await this.generate(markdownContent);
    this.downloadBlob(blob);
  }

  private downloadBlob(blob: Blob): void {
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = this.config.filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    console.log("PDF download completed");
  }
}

// Type Definitions
export interface PdfGenerationOptions {
  title?: string;
  apiEndpoint?: string;
  filename?: string;
  healthCheckRetries?: number;
  healthCheckDelay?: number;
  healthCheckTimeout?: number;
  generationRetries?: number;
  generationTimeout?: number;
}

interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// Legacy API compatibility
export const generateAndDownloadPdf = async (
  markdownContent: string,
  options: PdfGenerationOptions = {}
): Promise<void> => {
  const service = new PdfGeneratorService(options);
  return service.generateAndDownload(markdownContent);
};

export const validateMarkdownContent = (markdown: string): ValidationResult => {
  return ContentValidator.validate(markdown);
};
