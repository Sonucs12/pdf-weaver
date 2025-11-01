'use server';

/**
 * @fileOverview Formats extracted text into a structured format similar to Notion's import style.
 *
 * - formatContent - A function that formats the extracted content.
 * - FormatContentInput - The input type for the formatContent function.
 * - FormatContentOutput - The return type for the formatContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatContentInputSchema = z.object({
  text: z
    .string()
    .describe("The extracted text from the PDF that needs to be formatted."),
});
export type FormatContentInput = z.infer<typeof FormatContentInputSchema>;

const FormatContentOutputSchema = z.object({
  formattedText: z
    .string()
    .describe("The formatted text, structured with headings, bullet points, and paragraphs."),
});
export type FormatContentOutput = z.infer<typeof FormatContentOutputSchema>;

export async function formatContent(input: FormatContentInput): Promise<FormatContentOutput> {
  return formatContentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formatContentPrompt',
  input: {schema: FormatContentInputSchema},
  output: {schema: FormatContentOutputSchema},
  prompt: `You are a text formatting expert. Your task is to take the raw extracted text from a PDF and format it into a well-structured document, similar to how Notion imports text. Please pay attention to potential headings, subheadings, bulleted lists, and paragraphs.\n\n  Here are some of the guidelines:\n\n  1.  **Headings**: Identify headings based on font size, positioning, and surrounding context. Format them using markdown headings (e.g., # Heading 1, ## Heading 2).\n  2.  **Lists**: Recognize bulleted or numbered lists and represent them using markdown list syntax (e.g., - Item 1, 1. Item 1).\n  3.  **Paragraphs**: Separate distinct paragraphs with blank lines. Ensure paragraphs are readable and well-organized.\n  4.  **Emphasis**: Use bold or italics where appropriate to highlight key information.\n  5.  **Whitespace**: Use whitespace effectively to improve readability and visual structure.\n\n  Here is the text to format:\n\n  {{{text}}}\n  `,
});

const formatContentFlow = ai.defineFlow(
  {
    name: 'formatContentFlow',
    inputSchema: FormatContentInputSchema,
    outputSchema: FormatContentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
