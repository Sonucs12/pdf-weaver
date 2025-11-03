'use server';

/**
 * @fileOverview Optimized PDF extraction - combines OCR + Formatting in single AI call
 * No Supabase storage needed, processes images directly from base64
 */

import { ai } from '@/ai/genkit';
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

// Single prompt that does OCR + Formatting together
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
  prompt: `You are an expert PDF text extractor and formatter. Extract all text from this PDF page image and format it into a well-structured markdown document.

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

Extract and format the text from this page.`,
});

const flow = ai.defineFlow(
  {
    name: 'extractAndFormatFlow',
    inputSchema: InputSchema,
    outputSchema: z.array(OutputSchema),
  },
  async (input) => {
    const { images, pageNumbers } = input;

    // Process all pages in parallel
    const promises = images.map(async (base64Image, index) => {
      const pageNum = pageNumbers[index];

      try {
        // Convert base64 to data URL for Genkit media
        const dataUrl = `data:image/jpeg;base64,${base64Image}`;
        
        const { output } = await prompt({
          image: dataUrl,
          pageNumber: pageNum,
        });

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
        console.error(`Error processing page ${pageNum}:`, error);
        return {
          pageNumber: pageNum,
          formattedText: '',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    });

    // Wait for all pages to complete
    const results = await Promise.all(promises);

    // Sort by page number to maintain order
    return results.sort((a, b) => a.pageNumber - b.pageNumber);
  }
);

export async function extractAndFormatPages(
  input: ExtractAndFormatInput
): Promise<ExtractAndFormatOutput[]> {
  return flow(input);
}