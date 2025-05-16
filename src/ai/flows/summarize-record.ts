'use server';

/**
 * @fileOverview Summarizes a patient's medical record using AI.
 *
 * - summarizeRecord - A function that generates a summary of a patient's medical record.
 * - SummarizeRecordInput - The input type for the summarizeRecord function.
 * - SummarizeRecordOutput - The return type for the summarizeRecord function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SummarizeRecordInputSchema = z.object({
  recordText: z
    .string()
    .describe('The text content of the patient medical record to summarize.'),
});
export type SummarizeRecordInput = z.infer<typeof SummarizeRecordInputSchema>;

const SummarizeRecordOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the medical record.'),
});
export type SummarizeRecordOutput = z.infer<typeof SummarizeRecordOutputSchema>;

export async function summarizeRecord(input: SummarizeRecordInput): Promise<SummarizeRecordOutput> {
  return summarizeRecordFlow(input);
}

const prompt = ai.definePrompt({
  name: 'summarizeRecordPrompt',
  input: {schema: SummarizeRecordInputSchema},
  output: {schema: SummarizeRecordOutputSchema},
  prompt: `You are an AI assistant that summarizes medical records for doctors.

  Please provide a concise and accurate summary of the following medical record:

  {{{recordText}}}
  `,
});

const summarizeRecordFlow = ai.defineFlow(
  {
    name: 'summarizeRecordFlow',
    inputSchema: SummarizeRecordInputSchema,
    outputSchema: SummarizeRecordOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
