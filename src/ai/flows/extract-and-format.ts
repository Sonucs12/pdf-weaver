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

const PROMPT_TEMPLATE = `You are an expert PDF text extractor and formatter. Extract all text from this PDF page image and format it into a well-structured markdown document.

**Formatting Guidelines:**
1. **Headings**: Identify headings based on font size and context. Use markdown headings (# H1, ## H2, ### H3).
2. **Lists**: Recognize bulleted or numbered lists and format them using markdown syntax (-, 1., 2.).
3. **Paragraphs**: Separate distinct paragraphs with blank lines for readability.
4. **Code Blocks**: If you detect code, wrap it in \`\`\` with the appropriate language.
5. **Emphasis**: Use **bold** or *italics* to highlight key information.
6. **Tables**: Format tables using markdown table syntax if present.
7. **Whitespace**: Use whitespace effectively to improve readability.

**Important**: 
- Extract ALL text accurately, including headers, footers, and captions
- Maintain the original document structure and hierarchy
- Return ONLY the formatted markdown text, no explanations

Page: {{pageNumber}}
Image: {{media url=image}}

Extract and format the text from this page.`;

const RETRYABLE_ERROR_PATTERNS = ['rate', 'quota', 'limit', '429', 'unauthorized', 'key', 'api'];

const prompt = ai.definePrompt({
  name: 'extractAndFormatPrompt',
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

const isRetryableError = (error: unknown): boolean => {
  const errorMsg = error instanceof Error ? error.message.toLowerCase() : '';
  return RETRYABLE_ERROR_PATTERNS.some(pattern => errorMsg.includes(pattern));
};

const maskApiKey = (key: string): string => {
  if (key.length <= 8) return '***';
  return `${key.substring(0, 4)}...${key.substring(key.length - 4)}`;
};

async function callPromptWithFailover(params: { image: string; pageNumber: number }) {
  try {
    console.log(`[Page ${params.pageNumber}] Using default API key`);
    const { output } = await prompt(params);
    return output;
  } catch (err) {
    if (!isRetryableError(err)) throw err;

    const keys = getGeminiApiKeys();
    if (keys.length === 0) {
      console.error(`[Page ${params.pageNumber}] No fallback keys available`);
      throw err;
    }

    console.warn(`[Page ${params.pageNumber}] Default key failed, trying ${keys.length} fallback key(s)`);

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      try {
        console.log(`[Page ${params.pageNumber}] Attempting fallback key ${i + 1}/${keys.length} (${maskApiKey(key)})`);
        
        const alt = getAi({ apiKey: key });
        const altPrompt = alt.definePrompt({
          name: `extractAndFormatPromptAlt_${i}`,
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
        
        const { output } = await altPrompt(params);
        console.log(`[Page ${params.pageNumber}] ✓ Success with fallback key ${i + 1}`);
        return output;
      } catch (e) {
        console.warn(`[Page ${params.pageNumber}] ✗ Fallback key ${i + 1} failed: ${e instanceof Error ? e.message : 'Unknown error'}`);
        if (!isRetryableError(e)) throw e;
      }
    }

    console.error(`[Page ${params.pageNumber}] All API keys exhausted`);
    throw err;
  }
}

const flow = ai.defineFlow(
  {
    name: 'extractAndFormatFlow',
    inputSchema: InputSchema,
    outputSchema: z.array(OutputSchema),
  },
  async (input) => {
    const { images, pageNumbers } = input;

    const promises = images.map(async (base64Image, index) => {
      const pageNum = pageNumbers[index];

      try {
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;
        const output = await callPromptWithFailover({ image: dataUrl, pageNumber: pageNum });

        if (!output?.formattedText?.trim()) {
          return {
            pageNumber: pageNum,
            formattedText: '',
            success: false,
            error: 'No text extracted from page',
          };
        }

        return {
          pageNumber: pageNum,
          formattedText: output.formattedText.trim(),
          success: true,
        };
      } catch (error) {
        console.error(`[Page ${pageNum}] Processing failed:`, error instanceof Error ? error.message : 'Unknown error');
        return {
          pageNumber: pageNum,
          formattedText: '',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    const results = await Promise.all(promises);
    return results.sort((a, b) => a.pageNumber - b.pageNumber);
  }
);

export async function extractAndFormatPages(
  input: ExtractAndFormatInput
): Promise<ExtractAndFormatOutput[]> {
  return flow(input);
}