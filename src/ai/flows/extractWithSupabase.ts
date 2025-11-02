'use server';

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_KEY!);

const InputSchema = z.object({
  imageUrl: z.string().describe("The public URL of the PDF page image stored in Supabase."),
  path: z.string().describe("The path of the image in Supabase storage, for deletion."),
  pageNumber: z.number().describe("The page number of the image."),
});

const OutputSchema = z.object({
  extractedText: z.string().describe("The extracted text from the PDF page image."),
});

export type ExtractWithSupabaseInput = z.infer<typeof InputSchema>;
export type ExtractWithSupabaseOutput = z.infer<typeof OutputSchema>;

export async function extractTextFromPdfSupabase(input: ExtractWithSupabaseInput): Promise<ExtractWithSupabaseOutput> {
  return flow(input);
}

const prompt = ai.definePrompt({
  name: 'supabaseOcrPrompt',
  input: { schema: InputSchema },
  output: { schema: OutputSchema },
  prompt: `
You are a PDF OCR expert. Your task is to extract clean, raw text from the provided image of a PDF page.
Preserve the structure such as paragraphs and lists as best as you can. Do not add any markdown formatting.

Page: {{pageNumber}}
Image: {{media url=imageUrl}}

Return only the raw text content.
`,
});

const flow = ai.defineFlow(
  {
    name: 'extractTextFromPdfSupabaseFlow',
    inputSchema: InputSchema,
    outputSchema: OutputSchema,
  },
  async input => {
    try {
      const { output } = await prompt(input);
      
      // Asynchronously delete the file after success, but don't wait for it
      supabase.storage.from('pdf-pages').remove([input.path]).catch(console.error);
      
      return output!;
    } catch(error) {
      // If the prompt fails, try to delete the file anyway
      supabase.storage.from('pdf-pages').remove([input.path]).catch(console.error);
      // Re-throw the error to be handled by the frontend
      throw error;
    }
  }
);
