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
import type { PersonalDetails, BackgroundInformation, MedicalEncounter } from '@/lib/types'; // Import new types

// Define Zod schemas for the new structured input, similar to summarize-record.ts
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

const GenerateReportInputSchema = z.object({
  personalDetails: PersonalDetailsSchema.describe("Detalles personales del paciente."),
  backgroundInformation: BackgroundInformationSchema.describe("Antecedentes e información general del paciente."),
  medicalEncounters: z.array(MedicalEncounterSchema).describe("Lista de encuentros o consultas médicas del paciente."),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  report: z.string().describe('The generated patient report.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

export async function generateReport(input: GenerateReportInput): Promise<GenerateReportOutput> {
  return generateReportFlow(input);
}

// Helper function to format encounters for the prompt
function formatEncountersForReport(encounters: MedicalEncounter[]): string {
  if (!encounters || encounters.length === 0) {
    return "No hay consultas médicas registradas para incluir en el informe.";
  }
  return encounters
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()) // Sort by date, most recent first
    .map(enc => `
**Fecha de Consulta:** ${new Date(enc.date).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
**Detalles de la Consulta:**
${enc.details}
    `)
    .join('\n------------------------------------\n');
}


const generateReportPrompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `Eres un asistente de IA que genera informes médicos detallados para doctores.

  Genera un informe médico completo para el paciente basado en la siguiente información:

  **DATOS DEL PACIENTE**
  Nombre: {{{personalDetails.name}}}
  Fecha de Nacimiento: {{{personalDetails.dateOfBirth}}}
  Información de Contacto: {{{personalDetails.contactInfo}}}

  **ANTECEDENTES Y MEDICACIÓN HABITUAL**
  Antecedentes Personales Relevantes:
  {{{backgroundInformation.personalHistory}}}

  Alergias Conocidas:
  {{{backgroundInformation.allergies}}}

  Medicación Habitual:
  {{{backgroundInformation.habitualMedication}}}

  **HISTORIAL DE CONSULTAS**
  (Ordenado de la más reciente a la más antigua)
  {{{formatEncountersForReport medicalEncounters}}}

  **CONCLUSIONES Y RECOMENDACIONES GENERALES**
  (Basado en toda la información, si es aplicable, o dejar espacio para que el médico complete)
  -
  -

  El informe debe ser bien estructurado, fácil de leer y contener toda la información relevante de forma clara y profesional.
  Utiliza Markdown para el formato del informe (encabezados, negritas, listas).
  `,
  customize: (model) => {
    // Register the helper with Handlebars
    const Handlebars = model.registry?.lookupHandler('handlebars');
    if (Handlebars) {
      Handlebars.registerHelper('formatEncountersForReport', formatEncountersForReport);
    }
  }
});

const generateReportFlow = ai.defineFlow(
  {
    name: 'generateReportFlow',
    inputSchema: GenerateReportInputSchema,
    outputSchema: GenerateReportOutputSchema,
  },
  async (input: GenerateReportInput) => {
    const {output} = await generateReportPrompt(input);
    return output!;
  }
);
