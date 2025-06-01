// src/lib/patient-service.ts
import { db } from './firebase-config'; 
import { 
  doc, getDoc, collection, getDocs, query, where, 
  addDoc, updateDoc, deleteDoc, 
  serverTimestamp, 
  arrayUnion, arrayRemove // Importamos arrayRemove
} from 'firebase/firestore'; 

import type { PatientRecord, PersonalDetails, DatosFacturacion, BackgroundInformation, MedicalEncounter, Recipe, Attachment } from './types'; 

// ... getPatientById function (sin cambios) ...
export const getPatientById = async (id: string): Promise<PatientRecord | undefined> => {
  try {
    const patientRef = doc(db, "patients", id); 
    const patientSnap = await getDoc(patientRef); 

    if (patientSnap.exists()) {
      return { id: patientSnap.id, ...patientSnap.data() } as PatientRecord; 
    } else {
      console.log(`No se encontró el paciente con ID: ${id}`);
      return undefined;
    }
  } catch (error) {
    console.error(`Error al obtener el paciente con ID ${id}:`, error);
    return undefined;
  }
};

// ... addPatient function (sin cambios) ...
export const addPatient = async (
  patientData: {
    personalDetails: PersonalDetails;
    datosFacturacion?: DatosFacturacion | null;
    backgroundInformation?: BackgroundInformation | null;
  }
): Promise<PatientRecord> => {
  try {
    const patientCollectionRef = collection(db, "patients"); 

    const newPatientDocData = {
      ...patientData,
      medicalEncounters: [], 
      recipes: [],
      attachments: [], // Inicializamos vacío
      createdAt: serverTimestamp(), 
      updatedAt: serverTimestamp(),
    };

    const docRef = await addDoc(patientCollectionRef, newPatientDocData);

    const newDocSnap = await getDoc(docRef);
    if (!newDocSnap.exists()) {
        throw new Error("Error al recuperar el documento recién creado.");
    }

    return { id: newDocSnap.id, ...newDocSnap.data() } as PatientRecord;

  } catch (error) {
    console.error("Error al agregar un nuevo paciente:", error);
    throw error; 
  }
};

// ... updatePatient function (sin cambios) ...
export const updatePatient = async (
  id: string, 
  // NOTA: Este tipo NO incluye arrays como 'attachments'. Las actualizaciones de arrays 
  // deben manejarse con funciones específicas como addPatientAttachmentToFirestore.
  updates: Partial<Omit<PatientRecord, 'id' | 'createdAt' | 'medicalEncounters' | 'recipes' | 'attachments'>> 
): Promise<PatientRecord | undefined> => {
  try {
    const patientRef = doc(db, "patients", id); 

    const updatesWithTimestamp = {
      ...updates,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(patientRef, updatesWithTimestamp);

    const updatedDocSnap = await getDoc(patientRef);
    if (updatedDocSnap.exists()) {
        return { id: updatedDocSnap.id, ...updatedDocSnap.data() } as PatientRecord;
    } else {
        console.warn(`Documento de paciente con ID ${id} desaparecido después de la actualización.`);
        return undefined;
    }

  } catch (error) {
    console.error(`Error al actualizar el paciente con ID ${id}:`, error);
    throw error; 
  }
};

// ... getAllPatients function (sin cambios) ...
export const getAllPatients = async (): Promise<PatientRecord[]> => {
  try {
    const patientCollectionRef = collection(db, "patients"); 
    const querySnapshot = await getDocs(patientCollectionRef); 

    const patients: PatientRecord[] = [];
    querySnapshot.forEach((docSnap) => {
      patients.push({ id: docSnap.id, ...docSnap.data() } as PatientRecord);
    });

    return patients;

  } catch (error) {
    console.error("Error al obtener todos los pacientes:", error);
    throw error; 
  }
};

/**
 * Añade un adjunto al array 'attachments' de un paciente en Firestore.
 * @param patientId El ID del paciente.
 * @param attachmentData Los datos del adjunto a añadir (debe incluir un 'id' único).
 * @returns Una Promise que resuelve cuando la operación se completa.
 */
export const addPatientAttachmentToFirestore = async (
  patientId: string, 
  attachmentData: Attachment // Esperamos el objeto Attachment completo, incluyendo id
): Promise<void> => {
  try {
    const patientRef = doc(db, "patients", patientId); 

    // Usamos arrayUnion para añadir el nuevo adjunto al array 'attachments'
    await updateDoc(patientRef, {
      attachments: arrayUnion(attachmentData),
      updatedAt: serverTimestamp(), // Actualizamos la marca de tiempo
    });

    console.log(`Adjunto ${attachmentData.id} añadido al paciente ${patientId} en Firestore.`);

  } catch (error) {
    console.error(`Error al añadir adjunto al paciente ${patientId}:`, error);
    throw error; 
  }
};

/**
 * Elimina uno o varios adjuntos del array 'attachments' de un paciente en Firestore.
 * @param patientId El ID del paciente.
 * @param attachmentsToRemove Array de objetos Attachment a eliminar (se comparan por contenido).
 * @returns Una Promise que resuelve cuando la operación se completa.
 */
export const deletePatientAttachmentsFromFirestore = async (
  patientId: string, 
  attachmentsToRemove: Attachment[] // Esperamos un array de objetos Attachment a eliminar
): Promise<void> => {
  try {
    const patientRef = doc(db, "patients", patientId); 

    // Usamos arrayRemove para eliminar los adjuntos del array 'attachments'
    //arrayRemove compara los elementos por valor.
    await updateDoc(patientRef, {
      attachments: arrayRemove(...attachmentsToRemove), // Usamos spread (...) para pasar múltiples elementos
      updatedAt: serverTimestamp(), // Actualizamos la marca de tiempo
    });

    console.log(`${attachmentsToRemove.length} adjunto(s) eliminado(s) del paciente ${patientId} en Firestore.`);

  } catch (error) {
    console.error(`Error al eliminar adjunto(s) del paciente ${patientId}:`, error);
    throw error; 
  }
};


// Aquí se añadirían funciones para:
// - deletePatient: Eliminar un paciente
// - Funciones para manejar subcolecciones/arrays de encuentros médicos y recetas.
// - Posiblemente funciones para interactuar con Cloud Storage (subir/eliminar archivos).
