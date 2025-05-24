'use server';

import { addPatient as dbAddPatient, updatePatient as dbUpdatePatient } from '@/lib/mock-data';
import type { PatientRecord, PersonalDetails, DatosFacturacion, BackgroundInformation } from '@/lib/types';

// Simulate network delay
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export async function createPatientRecord(
  data: {
    personalDetails: PersonalDetails;
    datosFacturacion?: DatosFacturacion | null;
    backgroundInformation?: BackgroundInformation | null;
  }
): Promise<PatientRecord | null> {
  await simulateDelay();
  try {
    // In a real app, here you would interact with your database or Google Sheets API
    const newPatient = dbAddPatient(data);
    if (!newPatient) {
      // This case might not happen with current mock, but good for real DB
      throw new Error("Error simulado: No se pudo crear el paciente en la base de datos.");
    }
    console.log("Server Action: createPatientRecord successful for", newPatient.id);
    return newPatient;
  } catch (error) {
    console.error("Error en Server Action createPatientRecord:", error);
    // In a real app, you might re-throw a more specific error or return a structured error response
    // For the client, returning null indicates failure.
    return null;
  }
}

export async function updatePatientRecord(
  patientId: string,
  updates: Partial<Omit<PatientRecord, 'id' | 'createdAt'>>
): Promise<PatientRecord | null> {
  await simulateDelay();
  try {
    // In a real app, here you would interact with your database or Google Sheets API
    const updatedPatient = dbUpdatePatient(patientId, updates);
    if (!updatedPatient) {
      // This case might happen if patientId is not found
      throw new Error(`Error simulado: No se pudo actualizar el paciente con ID ${patientId}. Paciente no encontrado.`);
    }
    console.log("Server Action: updatePatientRecord successful for", patientId);
    return updatedPatient;
  } catch (error) {
    console.error(`Error en Server Action updatePatientRecord for ID ${patientId}:`, error);
    return null;
  }
}
