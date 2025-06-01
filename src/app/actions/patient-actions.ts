'use server';

// Importamos las funciones del nuevo servicio de pacientes basado en Firestore
import { 
  getPatientById as dbGetPatientById, 
  addPatient as dbAddPatient, 
  updatePatient as dbUpdatePatient,
  // Importaremos funciones para manejar attachments, etc. más adelante
} from '@/lib/patient-service'; 

// Ya no necesitamos importar desde mock-data
// import { addPatient as dbAddPatient, updatePatient as dbUpdatePatient, getPatientById } from '@/lib/mock-data';

import type { PatientRecord, PersonalDetails, DatosFacturacion, BackgroundInformation, Attachment } from '@/lib/types';

// Mantenemos la simulación de latencia de red si aún la necesitas para pruebas
const simulateDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export async function createPatientRecord(
  data: {
    personalDetails: PersonalDetails;
    datosFacturacion?: DatosFacturacion | null;
    backgroundInformation?: BackgroundInformation | null;
  }
): Promise<PatientRecord | null> {
  await simulateDelay(); // Simular latencia

  try {
    // ¡Ahora llamamos a la función de nuestro servicio Firestore!
    const newPatient = await dbAddPatient(data);
    
    console.log("Server Action: createPatientRecord successful for", newPatient.id);
    return newPatient;
  } catch (error) {
    console.error("Error en Server Action createPatientRecord:", error);
    // En un backend real, aquí registrarías el error de forma más robusta.
    return null;
  }
}

export async function updatePatientRecord(
  patientId: string,
  // Aquí ajustamos el tipo de 'updates' para que coincida con lo que acepta dbUpdatePatient
  updates: Partial<Omit<PatientRecord, 'id' | 'createdAt' | 'medicalEncounters' | 'recipes' | 'attachments'>>
): Promise<PatientRecord | null> {
  await simulateDelay(); // Simular latencia

  try {
    // ¡Ahora llamamos a la función de nuestro servicio Firestore!
    const updatedPatient = await dbUpdatePatient(patientId, updates);

    if (!updatedPatient) {
      // dbUpdatePatient ahora devuelve undefined si no encuentra el paciente
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

// **Nota:** Las funciones addPatientAttachment y deletePatientAttachments 
// aún están usando lógica simulada o comentada para Firestore. 
// Necesitarán ser adaptadas para usar operaciones de arrays o subcolecciones 
// en Firestore, similar a como hicimos con addPatient y updatePatient.

// Deja estas funciones con la lógica comentada o simulada por ahora, 
// las abordaremos cuando migremos la gestión de adjuntos, encuentros y recetas.

export async function addPatientAttachment(
  patientId: string,
  attachmentData: Omit<Attachment, 'id'> // name, type, driveLink (será URL de Cloud Storage), uploadedAt
): Promise<PatientRecord | null> {
  await simulateDelay();
  try {
    // TODO: Implementar lógica real con Firestore y Cloud Storage
    console.warn("addPatientAttachment: Usando lógica simulada. Implementar con Firestore/Cloud Storage.");
    // ... lógica simulada actual o código comentado ...

    // Para que compile por ahora, puedes devolver un mock o null
    const patient = await dbGetPatientById(patientId); // Usar la nueva función de servicio
    if (!patient) return null;
    // Simular adición de adjunto
    const newAttachment: Attachment = {
        id: `attach-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        ...attachmentData,
        uploadedAt: new Date().toISOString(), // O usar serverTimestamp si se maneja la actualización del documento
    };
    // Esto no actualiza Firestore. Necesitarías usar updateDoc con arrayUnion
    // const updatedAttachments = [...patient.attachments, newAttachment];
    // const updatedPatient = await dbUpdatePatient(patientId, { attachments: updatedAttachments }); // Esto no funcionará como esperamos con el tipo actual de updatePatient

     // **Opción temporal:** Devolver el paciente original o null
     return patient;

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
    // TODO: Implementar lógica real con Firestore y potencialmente Cloud Storage
    console.warn("deletePatientAttachments: Usando lógica simulada. Implementar con Firestore/Cloud Storage.");
    // ... lógica simulada actual o código comentado ...

    // Para que compile por ahora, puedes devolver un mock o null
    const patient = await dbGetPatientById(patientId); // Usar la nueva función de servicio
     if (!patient) return null;
     // Simular eliminación de adjuntos
     // const updatedAttachments = patient.attachments.filter(att => !attachmentIds.includes(att.id));
     // Esto no actualiza Firestore. Necesitarías usar updateDoc con arrayRemove

     // **Opción temporal:** Devolver el paciente original o null
     return patient;

  } catch (error) {
    console.error(`Error en Server Action deletePatientAttachments for patient ${patientId}:`, error);
    return null;
  }
}

// También necesitarás una Server Action para obtener UN paciente específico
export async function fetchPatientRecord(patientId: string): Promise<PatientRecord | null> {
  await simulateDelay(); // Simular latencia
  try {
    const patient = await dbGetPatientById(patientId);
    return patient || null;
  } catch (error) {
    console.error(`Error en Server Action fetchPatientRecord for ID ${patientId}:`, error);
    return null;
  }
}

// Y una Server Action para obtener TODOS los pacientes (considerar paginación en producción)
export async function fetchAllPatientRecords(): Promise<PatientRecord[]> {
    await simulateDelay(); // Simular latencia
    try {
        // TODO: Implementar esta función en patient-service.ts
        console.warn("fetchAllPatientRecords: Usando mock data. Implementar con Firestore.");
        // Temporalmente devolvemos mockPatients para que la app no rompa, 
        // pero debemos reemplazar esto.
        // Para hacer que funcione con Firestore, necesitarás implementar getDocs 
        // en patient-service.ts
        return []; // Devolvemos un array vacío o mockPatients si lo mantienes temporalmente
    } catch (error) {
        console.error("Error en Server Action fetchAllPatientRecords:", error);
        return [];
    }
}
