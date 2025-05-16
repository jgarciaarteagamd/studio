// src/ai/flows/generate-report.ts
'use server';

/**
 * @fileOverview Generates a patient report from structured data.
 *
 * - generateReport - A function that generates a patient report.
 * - GenerateReportInput - The input type for the generateReport function.
 * - GenerateReportOutput - The return type for the generateReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateReportInputSchema = z.object({
  medicalHistory: z.string().describe('The patient\'s medical history.'),
  examinationResults: z.string().describe('The results of the patient\'s examination.'),
  treatmentPlans: z.string().describe('The patient\'s treatment plans.'),
  patientName: z.string().describe('The name of the patient.'),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  report: z.string().describe('The generated patient report.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

const generateReportPrompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `You are an AI assistant that generates medical reports for doctors.

  Generate a comprehensive medical report for the patient named {{{patientName}}} based on the following information:

  Medical History: {{{medicalHistory}}}
  Examination Results: {{{examinationResults}}}
  Treatment Plans: {{{treatmentPlans}}}

  The report should be well-structured, easy to read, and contain all relevant information.
  `, 
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async input => {
    const {output} = await generateReportPrompt(input);
    return output!;
  }
);
