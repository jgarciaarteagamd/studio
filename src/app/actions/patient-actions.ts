
'use server';

import { addPatient as dbAddPatient, updatePatient as dbUpdatePatient, getPatientById } from '@/lib/mock-data';
import type { PatientRecord, PersonalDetails, DatosFacturacion, BackgroundInformation, Attachment } from '@/lib/types';

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
    const newPatient = dbAddPatient(data);
    if (!newPatient) {
      throw new Error("Error simulado: No se pudo crear el paciente en la base de datos.");
    }
    console.log("Server Action: createPatientRecord successful for", newPatient.id);
    return newPatient;
  } catch (error) {
    console.error("Error en Server Action createPatientRecord:", error);
    return null;
  }
}

export async function updatePatientRecord(
  patientId: string,
  updates: Partial<Omit<PatientRecord, 'id' | 'createdAt'>>
): Promise<PatientRecord | null> {
  await simulateDelay();
  try {
    const updatedPatient = dbUpdatePatient(patientId, updates);
    if (!updatedPatient) {
      throw new Error(`Error simulado: No se pudo actualizar el paciente con ID ${patientId}. Paciente no encontrado.`);
    }
    console.log("Server Action: updatePatientRecord successful for", patientId);
    return updatedPatient;
  } catch (error) {
    console.error(`Error en Server Action updatePatientRecord for ID ${patientId}:`, error);
    return null;
  }
}

export async function addPatientAttachment(
  patientId: string,
  attachmentData: Omit<Attachment, 'id'> // name, type, driveLink, uploadedAt
): Promise<PatientRecord | null> {
  await simulateDelay();
  try {
    const patient = getPatientById(patientId);
    if (!patient) {
      console.error(`Server Action addPatientAttachment: Patient with ID ${patientId} not found.`);
      throw new Error("Paciente no encontrado");
    }

    const newAttachment: Attachment = {
      id: `attach-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      ...attachmentData,
    };

    const updatedAttachments = [...patient.attachments, newAttachment];
    // Ensure updatedAt is also part of the updates for consistency
    const updatedPatient = dbUpdatePatient(patientId, { attachments: updatedAttachments, updatedAt: new Date().toISOString() });

    if (!updatedPatient) {
      console.error(`Server Action addPatientAttachment: Failed to update patient ${patientId} after adding attachment.`);
      throw new Error("Error simulado: No se pudo añadir el adjunto al paciente.");
    }
    console.log("Server Action: addPatientAttachment successful for patient", patientId);
    return updatedPatient;
  } catch (error) {
    console.error(`Error en Server Action addPatientAttachment for patient ${patientId}:`, error);
    return null;
  }
}

export async function deletePatientAttachments(
  patientId: string,
  attachmentIds: string[]
): Promise<PatientRecord | null> {
  await simulateDelay();
  try {
    const patient = getPatientById(patientId);
    if (!patient) {
      console.error(`Server Action deletePatientAttachments: Patient with ID ${patientId} not found.`);
      throw new Error("Paciente no encontrado");
    }

    const updatedAttachments = patient.attachments.filter(
      (att) => !attachmentIds.includes(att.id)
    );
    // Ensure updatedAt is also part of the updates for consistency
    const updatedPatient = dbUpdatePatient(patientId, { attachments: updatedAttachments, updatedAt: new Date().toISOString() });
    
    if (!updatedPatient) {
      console.error(`Server Action deletePatientAttachments: Failed to update patient ${patientId} after deleting attachments.`);
      throw new Error("Error simulado: No se pudieron eliminar los adjuntos del paciente.");
    }
    console.log("Server Action: deletePatientAttachments successful for patient", patientId);
    return updatedPatient;
  } catch (error) {
    console.error(`Error en Server Action deletePatientAttachments for patient ${patientId}:`, error);
    return null;
  }
}
