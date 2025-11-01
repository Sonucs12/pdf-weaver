'use server';

/**
 * @fileOverview An AI agent to intelligently extract text from PDFs, preserving structure.
 *
 * - extractTextFromPdf - A function that handles the text extraction process.
 * - ExtractTextFromPdfInput - The input type for the extractTextFromPdf function.
 * - ExtractTextFromPdfOutput - The return type for the extractTextFromPdf function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExtractTextFromPdfInputSchema = z.object({
  pdfDataUri: z
    .string()
    .describe(
      "A PDF file as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExtractTextFromPdfInput = z.infer<typeof ExtractTextFromPdfInputSchema>;

const ExtractTextFromPdfOutputSchema = z.object({
  extractedText:
    z.string().describe('The extracted text content from the PDF, preserving structure.'),
});
export type ExtractTextFromPdfOutput = z.infer<typeof ExtractTextFromPdfOutputSchema>;

export async function extractTextFromPdf(input: ExtractTextFromPdfInput): Promise<ExtractTextFromPdfOutput> {
  return extractTextFromPdfFlow(input);
}

const extractTextPrompt = ai.definePrompt({
  name: 'extractTextPrompt',
  input: {schema: ExtractTextFromPdfInputSchema},
  output: {schema: ExtractTextFromPdfOutputSchema},
  prompt: `You are an expert in extracting text from PDF documents while preserving the original structure.

  Your goal is to accurately extract the text content, including headings, paragraphs, lists, and other formatting elements, from the given PDF data.
  The PDF is provided as a data URI. Use your advanced OCR and text extraction capabilities to achieve the best possible result.

  Here is the PDF data:
  {{media url=pdfDataUri}}
  
  Return the extracted text, ensuring that the structure is preserved as closely as possible to the original PDF.
  `,
});

const extractTextFromPdfFlow = ai.defineFlow(
  {
    name: 'extractTextFromPdfFlow',
    inputSchema: ExtractTextFromPdfInputSchema,
    outputSchema: ExtractTextFromPdfOutputSchema,
  },
  async input => {
    const {output} = await extractTextPrompt(input);
    return output!;
  }
);
