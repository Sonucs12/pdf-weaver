'use server';

import { ai, getAi, getGeminiApiKeys } from '@/ai/genkit';
import { z } from 'genkit';

const InputSchema = z.object({
  images: z.array(z.string()).describe('Array of base64-encoded images'),
  pageNumbers: z.array(z.number()).describe('Corresponding page numbers'),
});

const OutputSchema = z.object({
  pageNumber: z.number(),
  formattedText: z.string(),
  success: z.boolean(),
  error: z.string().optional(),
});

export type ExtractAndFormatInput = z.infer<typeof InputSchema>;
export type ExtractAndFormatOutput = z.infer<typeof OutputSchema>;

const PROMPT_TEMPLATE = `
You are an expert PDF text extractor and formatter. Extract all text from this PDF page image and format it into a well-structured markdown document. 

**Formatting Guidelines:** 

1. **Headings**: Identify headings based on font size and context. Use markdown headings (# H1, ## H2, ### H3) and maintain hierarchy. 
2. **Lists**: Recognize bulleted or numbered lists and format them using markdown syntax (-, 1., 2.). 
3. **Paragraphs**: Separate distinct paragraphs with blank lines for readability. 
4. **Code Blocks**: If you detect code, wrap it in \`\`\` with the appropriate language. 
5. **Emphasis**: Use **bold** or *italics* to highlight key information. 
6. **Tables**: - If content has two or more columns (like comparison or difference tables), convert it into a Markdown table. - Detect rows by horizontal separators or aligned content. 
7. **Whitespace**: Use whitespace effectively to improve readability. 

**Important**: 
- Extract ALL text accurately, and filter out dublicate content including headers, footers, captions and watermarks etc. 
- You can also structured content in your own way to look organise and professional 
- Return ONLY the formatted markdown text, no explanations
- Do NOT break or corrupt Markdown syntax. 

Page: {{pageNumber}}
Image: {{media url=image}}

Extract and format the text from this page.`;

const RETRYABLE_ERROR_PATTERNS = ['rate', 'quota', 'limit', '429', 'unauthorized', 'key', 'api'];

class ApiKeyManager {
  private static instance: ApiKeyManager;
  private fallbackKeys: string[];

  private constructor() {
    this.fallbackKeys = getGeminiApiKeys();
  }

  static getInstance(): ApiKeyManager {
    if (!ApiKeyManager.instance) {
      ApiKeyManager.instance = new ApiKeyManager();
    }
    return ApiKeyManager.instance;
  }

  getFallbackKeys(): string[] {
    return this.fallbackKeys;
  }

  maskKey(key: string): string {
    return key.length <= 8 ? '***' : `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
  }

  isRetryableError(error: unknown): boolean {
    const errorMsg = error instanceof Error ? error.message.toLowerCase() : '';
    return RETRYABLE_ERROR_PATTERNS.some(pattern => errorMsg.includes(pattern));
  }
}

class PromptExecutor {
  private keyManager: ApiKeyManager;
  private promptCache: Map<string, any> = new Map();

  constructor() {
    this.keyManager = ApiKeyManager.getInstance();
  }

  private getOrCreatePrompt(key?: string) {
    const cacheKey = key || 'default';
    
    if (this.promptCache.has(cacheKey)) {
      return this.promptCache.get(cacheKey);
    }

    const aiInstance = key ? getAi({ apiKey: key }) : ai;
    const prompt = aiInstance.definePrompt({
      name: `extractAndFormatPrompt_${cacheKey}`,
      input: { 
        schema: z.object({
          image: z.string(),
          pageNumber: z.number(),
        })
      },
      output: { 
        schema: z.object({
          formattedText: z.string(),
        })
      },
      prompt: PROMPT_TEMPLATE,
    });

    this.promptCache.set(cacheKey, prompt);
    return prompt;
  }

  async executeWithFailover(params: { image: string; pageNumber: number }): Promise<{ formattedText: string }> {
    try {
      console.log(`[Page ${params.pageNumber}] Using default API key`);
      const { output } = await this.getOrCreatePrompt()(params);
      return output;
    } catch (err) {
      if (!this.keyManager.isRetryableError(err)) throw err;

      const fallbackKeys = this.keyManager.getFallbackKeys();
      if (fallbackKeys.length === 0) {
        console.error(`[Page ${params.pageNumber}] No fallback keys available`);
        throw err;
      }

      console.warn(`[Page ${params.pageNumber}] Default key failed, trying ${fallbackKeys.length} fallback key(s)`);

      for (let i = 0; i < fallbackKeys.length; i++) {
        try {
          console.log(`[Page ${params.pageNumber}] Attempting fallback key ${i + 1}/${fallbackKeys.length} (${this.keyManager.maskKey(fallbackKeys[i])})`);
          const { output } = await this.getOrCreatePrompt(fallbackKeys[i])(params);
          console.log(`[Page ${params.pageNumber}] ✓ Success with fallback key ${i + 1}`);
          return output;
        } catch (e) {
          console.warn(`[Page ${params.pageNumber}] ✗ Fallback key ${i + 1} failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
          if (!this.keyManager.isRetryableError(e)) throw e;
        }
      }

      console.error(`[Page ${params.pageNumber}] All API keys exhausted`);
      throw err;
    }
  }
}

class PageProcessor {
  private executor: PromptExecutor;

  constructor() {
    this.executor = new PromptExecutor();
  }

  async processPage(base64Image: string, pageNumber: number): Promise<ExtractAndFormatOutput> {
    try {
      const output = await this.executor.executeWithFailover({ 
        image: `data:image/jpeg;base64,${base64Image}`, 
        pageNumber 
      });

      if (!output?.formattedText?.trim()) {
        return { pageNumber, formattedText: '', success: false, error: 'No text extracted from page' };
      }

      return { pageNumber, formattedText: output.formattedText.trim(), success: true };
    } catch (error) {
      console.error(`[Page ${pageNumber}] Processing failed:`, error instanceof Error ? error.message : 'Unknown error');
      return {
        pageNumber,
        formattedText: '',
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async processBatch(images: string[], pageNumbers: number[]): Promise<ExtractAndFormatOutput[]> {
    const results = await Promise.all(
      images.map((image, index) => this.processPage(image, pageNumbers[index]))
    );
    return results.sort((a, b) => a.pageNumber - b.pageNumber);
  }
}

const flow = ai.defineFlow(
  {
    name: 'extractAndFormatFlow',
    inputSchema: InputSchema,
    outputSchema: z.array(OutputSchema),
  },
  async (input) => new PageProcessor().processBatch(input.images, input.pageNumbers)
);

export async function extractAndFormatPages(input: ExtractAndFormatInput): Promise<ExtractAndFormatOutput[]> {
  return flow(input);
}