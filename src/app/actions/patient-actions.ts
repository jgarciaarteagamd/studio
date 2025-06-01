'use server';

// Importamos las funciones del nuevo servicio de pacientes basado en Firestore
import { 
  getPatientById as dbGetPatientById, 
  addPatient as dbAddPatient, 
  updatePatient as dbUpdatePatient,
  getAllPatients as dbGetAllPatients, // Importamos la función para obtener todos los pacientes
  addPatientAttachmentToFirestore, // Importamos la función para añadir adjuntos a Firestore
  deletePatientAttachmentsFromFirestore // Importamos la función para eliminar adjuntos de Firestore
} from '@/lib/patient-service'; 

import type { PatientRecord, PersonalDetails, DatosFacturacion, BackgroundInformation, Attachment } from '@/lib/types';

// Mantenemos la simulación de latencia de red si aún la necesitas para pruebas
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// ... createPatientRecord function (sin cambios, usa dbAddPatient) ...
export async function createPatientRecord(
  data: {
    personalDetails: PersonalDetails;
    datosFacturacion?: DatosFacturacion | null;
    backgroundInformation?: BackgroundInformation | null;
  }
): Promise<PatientRecord | null> {
  await simulateDelay(); 
  try {
    const newPatient = await dbAddPatient(data);
    console.log("Server Action: createPatientRecord successful for", newPatient.id);
    return newPatient;
  } catch (error) {
    console.error("Error en Server Action createPatientRecord:", error);
    return null;
  }
}

// ... updatePatientRecord function (sin cambios, usa dbUpdatePatient) ...
export async function updatePatientRecord(
  patientId: string,
  updates: Partial<Omit<PatientRecord, 'id' | 'createdAt' | 'medicalEncounters' | 'recipes' | 'attachments'>>
): Promise<PatientRecord | null> {
  await simulateDelay(); 
  try {
    const updatedPatient = await dbUpdatePatient(patientId, updates);
    if (!updatedPatient) {
      console.error(`Server Action updatePatientRecord: Paciente con ID ${patientId} no encontrado.`);
      return null;
    }
    console.log("Server Action: updatePatientRecord successful for", patientId);
    return updatedPatient;
  } catch (error) {
    console.error(`Error en Server Action updatePatientRecord for ID ${patientId}:`, error);
    return null;
  }
}

/**
 * Server Action para añadir un adjunto a un paciente.
 * Actualmente solo actualiza los metadatos en Firestore.
 * NO MANEJA LA CARGA REAL DEL ARCHIVO a Cloud Storage.
 * @param patientId El ID del paciente.
 * @param attachmentData Los metadatos del adjunto a añadir (sin ID).
 * @param file (Opcional) El archivo a subir - IGNORADO POR AHORA.
 * @returns Una Promise que resuelve con el PatientRecord actualizado o null en caso de error.
 */
export async function addPatientAttachment(
  patientId: string,
  attachmentData: Omit<Attachment, 'id' | 'uploadedAt'>, // Solo esperamos name, type, driveLink (placeholder)
  // Aquí podrías tener un argumento 'file: File' si estuvieras manejando la carga real
): Promise<PatientRecord | null> {
  await simulateDelay(); // Simular latencia

  try {
    // TODO: Integrar lógica de Firebase Cloud Storage aquí para subir el archivo real
    console.warn("addPatientAttachment: TODO: Implementar carga de archivo a Cloud Storage.");

    // 1. Opcional pero recomendado: Verificar si el paciente existe
    const patientExists = await dbGetPatientById(patientId);
    if (!patientExists) {
        console.error(`Server Action addPatientAttachment: Paciente con ID ${patientId} no encontrado.`);
        return null;
    }

    // 2. Generar un ID único para el adjunto
    // Puedes usar un UUID o simplemente un timestamp + random string
    const newAttachmentId = `attach-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    // 3. Crear el objeto Attachment completo, incluyendo ID y uploadedAt (serverTimestamp se añade en el service)
    const attachmentToAdd: Attachment = {
        id: newAttachmentId,
        ...attachmentData,
        // El `uploadedAt` se manejará en el patient-service con serverTimestamp
        // driveLink debería ser la URL real de Cloud Storage después de la subida
        driveLink: attachmentData.driveLink || '#placeholder', // Usar el enlace proporcionado o un placeholder
        uploadedAt: new Date().toISOString(), // Añadimos uno temporal aquí, aunque Firestore usará serverTimestamp
    };

    // 4. Llamar a la función del servicio para añadir el adjunto a Firestore
    await addPatientAttachmentToFirestore(patientId, attachmentToAdd);

    // 5. Opcional: Leer el paciente actualizado para devolver los datos más recientes
    const updatedPatient = await dbGetPatientById(patientId);

    console.log("Server Action: addPatientAttachment successful for patient", patientId);
    return updatedPatient || patientExists; // Devolvemos el actualizado o el original si falla la lectura post-update

  } catch (error) {
    console.error(`Error en Server Action addPatientAttachment for patient ${patientId}:`, error);
    return null;
  }
}

/**
 * Server Action para eliminar adjuntos de un paciente.
 * Actualmente solo elimina los metadatos en Firestore.
 * NO MANEJA LA ELIMINACIÓN REAL DEL ARCHIVO de Cloud Storage.
 * @param patientId El ID del paciente.
 * @param attachmentIds Array de IDs de los adjuntos a eliminar.
 * @returns Una Promise que resuelve con el PatientRecord actualizado o null en caso de error.
 */
export async function deletePatientAttachments(
  patientId: string,
  attachmentIds: string[]
): Promise<PatientRecord | null> {
  await simulateDelay(); // Simular latencia

  try {
    // TODO: Integrar lógica de Firebase Cloud Storage aquí para eliminar los archivos reales
    console.warn("deletePatientAttachments: TODO: Implementar eliminación de archivo de Cloud Storage.");

    // 1. Opcional pero recomendado: Obtener el paciente para encontrar los objetos Attachment completos
    const patient = await dbGetPatientById(patientId);
    if (!patient) {
        console.error(`Server Action deletePatientAttachments: Paciente con ID ${patientId} no encontrado.`);
        return null;
    }

    // 2. Filtrar los objetos Attachment completos que corresponden a los IDs a eliminar
    const attachmentsToRemove = patient.attachments.filter(att => attachmentIds.includes(att.id));

    if (attachmentsToRemove.length === 0) {
        console.log(`Server Action deletePatientAttachments: No se encontraron adjuntos con los IDs proporcionados para el paciente ${patientId}.`);
        return patient; // No hay nada que eliminar, devolver el paciente actual
    }

    // 3. Llamar a la función del servicio para eliminar los adjuntos de Firestore
    await deletePatientAttachmentsFromFirestore(patientId, attachmentsToRemove);

    // 4. Opcional: Leer el paciente actualizado para devolver los datos más recientes
    const updatedPatient = await dbGetPatientById(patientId);

    console.log("Server Action: deletePatientAttachments successful for patient", patientId);
    return updatedPatient || patient; // Devolvemos el actualizado o el original si falla la lectura post-update

  } catch (error) {
    console.error(`Error en Server Action deletePatientAttachments for patient ${patientId}:`, error);
    return null;
  }
}


// ... fetchPatientRecord function (sin cambios, usa dbGetPatientById) ...
export async function fetchPatientRecord(patientId: string): Promise<PatientRecord | null> {
  await simulateDelay(); 
  try {
    const patient = await dbGetPatientById(patientId);
    return patient || null;
  } catch (error) {
    console.error(`Error en Server Action fetchPatientRecord for ID ${patientId}:`, error);
    return null;
  }
}

// ... fetchAllPatientRecords function (MODIFICADA para usar dbGetAllPatients) ...
export async function fetchAllPatientRecords(): Promise<PatientRecord[]> {
    await simulateDelay(); 
    try {
        // ¡Ahora llamamos a la función de nuestro servicio Firestore!
        const patients = await dbGetAllPatients();
        console.log("Server Action: fetchAllPatientRecords successful.");
        return patients;
    } catch (error) {
        console.error("Error en Server Action fetchAllPatientRecords:", error);
        // Devuelve un array vacío en caso de error para evitar romper la UI
        return []; 
    }
}
