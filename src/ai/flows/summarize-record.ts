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
import type { PersonalDetails, BackgroundInformation, MedicalEncounter, DatosFacturacion } from '@/lib/types';

// Define Zod schemas for the new structured input
const PersonalDetailsSchema = z.object({
  nombres: z.string(),
  apellidos: z.string(),
  documentoIdentidad: z.string().optional(),
  fechaNacimiento: z.string(), // Keep as string for AI, will be ISO date
  telefono1: z.string().optional(),
  telefono2: z.string().optional(),
  email: z.string().email().optional(),
});

const DatosFacturacionSchema = z.object({
  ruc: z.string().optional(),
  direccionFiscal: z.string().optional(),
  telefonoFacturacion: z.string().optional(),
  emailFacturacion: z.string().email().optional(),
}).optional();


const BackgroundInformationSchema = z.object({
  personalHistory: z.string().optional(),
  allergies: z.string().optional(),
  habitualMedication: z.string().optional(),
}).optional(); // Make the whole object optional

const MedicalEncounterSchema = z.object({
  id: z.string(),
  date: z.string(), // Keep as string for AI, will be ISO date
  details: z.string(),
});

const SummarizeRecordInputSchema = z.object({
  personalDetails: PersonalDetailsSchema.describe("Detalles personales del paciente."),
  // datosFacturacion is not typically needed for a medical summary, so we omit it here
  backgroundInformation: BackgroundInformationSchema.describe("Antecedentes e información general del paciente.").nullable(),
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
  Nombre Completo: {{{personalDetails.nombres}}} {{{personalDetails.apellidos}}}
  Fecha de Nacimiento: {{{personalDetails.fechaNacimiento}}}
  Documento: {{{personalDetails.documentoIdentidad}}}
  Contacto: Email: {{{personalDetails.email}}}, Tel1: {{{personalDetails.telefono1}}}, Tel2: {{{personalDetails.telefono2}}}

  === Antecedentes e Información General ===
  {{#if backgroundInformation}}
  Antecedentes Personales: {{{backgroundInformation.personalHistory}}}
  Alergias: {{{backgroundInformation.allergies}}}
  Medicación Habitual: {{{backgroundInformation.habitualMedication}}}
  {{else}}
  No se proporcionaron antecedentes o medicación habitual.
  {{/if}}

  === Historial de Consultas Médicas ===
  {{{formatEncountersForPrompt medicalEncounters}}}

  Proporciona un resumen que integre la información más relevante de todas las secciones.
  `,
  customize: (model) => {
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
