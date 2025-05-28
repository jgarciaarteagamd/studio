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
}).optional().nullable();


const BackgroundInformationSchema = z.object({
  personalHistory: z.string().optional().nullable(),
  allergies: z.string().optional().nullable(),
  habitualMedication: z.string().optional().nullable(),
}).optional().nullable();

const MedicalEncounterSchema = z.object({
  id: z.string(),
  date: z.string(), // Keep as string for AI, will be ISO date
  details: z.string(),
});

const GenerateReportInputSchema = z.object({
  personalDetails: PersonalDetailsSchema.describe("Detalles personales del paciente."),
  datosFacturacion: DatosFacturacionSchema.describe("Datos de facturación del paciente (opcional para el informe clínico)."),
  backgroundInformation: BackgroundInformationSchema.describe("Antecedentes e información general del paciente."),
  medicalEncounters: z.array(MedicalEncounterSchema).describe("Lista de encuentros o consultas médicas del paciente."),
  formattedMedicalEncounters: z.string().describe("Cadena pre-formateada del historial de consultas."),
});
export type GenerateReportInput = z.infer<typeof GenerateReportInputSchema>;

const GenerateReportOutputSchema = z.object({
  report: z.string().describe('The generated patient report.'),
});
export type GenerateReportOutput = z.infer<typeof GenerateReportOutputSchema>;

// Helper function to format encounters for the report
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

export async function generateReport(input: Omit<GenerateReportInput, 'formattedMedicalEncounters'>): Promise<GenerateReportOutput> {
  const formattedEncounters = formatEncountersForReport(input.medicalEncounters);
  return generateReportFlow({ ...input, formattedMedicalEncounters: formattedEncounters });
}

const generateReportPrompt = ai.definePrompt({
  name: 'generateReportPrompt',
  input: {schema: GenerateReportInputSchema},
  output: {schema: GenerateReportOutputSchema},
  prompt: `Eres un asistente de IA que genera informes médicos detallados para doctores.

  Genera un informe médico completo para el paciente basado en la siguiente información:

  **DATOS DEL PACIENTE**
  Nombre Completo: {{{personalDetails.nombres}}} {{{personalDetails.apellidos}}}
  Documento de Identidad: {{#if personalDetails.documentoIdentidad}}{{{personalDetails.documentoIdentidad}}}{{else}}No registrado{{/if}}
  Fecha de Nacimiento: {{{personalDetails.fechaNacimiento}}}
  Teléfono Principal: {{#if personalDetails.telefono1}}{{{personalDetails.telefono1}}}{{else}}No registrado{{/if}}
  Correo Electrónico: {{#if personalDetails.email}}{{{personalDetails.email}}}{{else}}No registrado{{/if}}

  {{#if datosFacturacion.ruc}}
  **DATOS DE FACTURACIÓN (Si es relevante para el contexto del informe)**
  RUC: {{{datosFacturacion.ruc}}}
  Dirección Fiscal: {{{datosFacturacion.direccionFiscal}}}
  {{/if}}

  **ANTECEDENTES Y MEDICACIÓN HABITUAL**
  {{#if backgroundInformation}}
  Antecedentes Personales Relevantes:
  {{{backgroundInformation.personalHistory}}}

  Alergias Conocidas:
  {{{backgroundInformation.allergies}}}

  Medicación Habitual:
  {{{backgroundInformation.habitualMedication}}}
  {{else}}
  No se proporcionaron antecedentes o medicación habitual.
  {{/if}}

  **HISTORIAL DE CONSULTAS**
  (Ordenado de la más reciente a la más antigua)
  {{{formattedMedicalEncounters}}}

  **CONCLUSIONES Y RECOMENDACIONES GENERALES**
  (Basado en toda la información, si es aplicable, o dejar espacio para que el médico complete)
  -
  -

  El informe debe ser bien estructurado, fácil de leer y contener toda la información relevante de forma clara y profesional.
  Utiliza Markdown para el formato del informe (encabezados, negritas, listas).
  `,
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
