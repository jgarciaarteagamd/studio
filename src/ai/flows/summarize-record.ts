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
import type { PersonalDetails, BackgroundInformation, MedicalEncounter } from '@/lib/types'; // Import new types

// Define Zod schemas for the new structured input
const PersonalDetailsSchema = z.object({
  name: z.string(),
  dateOfBirth: z.string(),
  contactInfo: z.string(),
});

const BackgroundInformationSchema = z.object({
  personalHistory: z.string().optional(),
  allergies: z.string().optional(),
  habitualMedication: z.string().optional(),
});

const MedicalEncounterSchema = z.object({
  id: z.string(),
  date: z.string(),
  details: z.string(),
});

const SummarizeRecordInputSchema = z.object({
  personalDetails: PersonalDetailsSchema.describe("Detalles personales del paciente."),
  backgroundInformation: BackgroundInformationSchema.describe("Antecedentes e información general del paciente."),
  medicalEncounters: z.array(MedicalEncounterSchema).describe("Lista de encuentros o consultas médicas del paciente."),
});
export type SummarizeRecordInput = z.infer<typeof SummarizeRecordInputSchema>;

const SummarizeRecordOutputSchema = z.object({
  summary: z.string().describe('The AI-generated summary of the medical record.'),
});
export type SummarizeRecordOutput = z.infer<typeof SummarizeRecordOutputSchema>;

export async function summarizeRecord(input: SummarizeRecordInput): Promise<SummarizeRecordOutput> {
  return summarizeRecordFlow(input);
}

// Helper function to format encounters for the prompt
function formatEncountersForPrompt(encounters: MedicalEncounter[]): string {
  if (!encounters || encounters.length === 0) {
    return "No hay consultas médicas registradas.";
  }
  return encounters
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, most recent first
    .map(enc => `Fecha: ${new Date(enc.date).toLocaleDateString('es-ES')}\nDetalles: ${enc.details}`)
    .join('\n\n---\n\n');
}

const prompt = ai.definePrompt({
  name: 'summarizeRecordPrompt',
  input: {schema: SummarizeRecordInputSchema},
  output: {schema: SummarizeRecordOutputSchema},
  prompt: `Eres un asistente de IA que resume historiales médicos para doctores.

  Por favor, proporciona un resumen conciso y preciso del siguiente historial médico:

  === Detalles Personales ===
  Nombre: {{{personalDetails.name}}}
  Fecha de Nacimiento: {{{personalDetails.dateOfBirth}}}
  Contacto: {{{personalDetails.contactInfo}}}

  === Antecedentes e Información General ===
  Antecedentes Personales: {{{backgroundInformation.personalHistory}}}
  Alergias: {{{backgroundInformation.allergies}}}
  Medicación Habitual: {{{backgroundInformation.habitualMedication}}}

  === Historial de Consultas Médicas ===
  {{{formatEncountersForPrompt medicalEncounters}}}

  Proporciona un resumen que integre la información más relevante de todas las secciones.
  `,
  customize: (model) => {
    // Register the helper with Handlebars - IMPORTANT for server-side rendering of prompts
    const Handlebars = model.registry?.lookupHandler('handlebars');
    if (Handlebars) {
      Handlebars.registerHelper('formatEncountersForPrompt', formatEncountersForPrompt);
    }
  }
});

const summarizeRecordFlow = ai.defineFlow(
  {
    name: 'summarizeRecordFlow',
    inputSchema: SummarizeRecordInputSchema,
    outputSchema: SummarizeRecordOutputSchema,
  },
  async (input: SummarizeRecordInput) => {
    const {output} = await prompt(input);
    return output!;
  }
);
