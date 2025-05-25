// src/app/actions/patient-actions.ts
'use server';

import { addPatient as dbAddPatient, updatePatient as dbUpdatePatient, getPatientById } from '@/lib/mock-data';
import type { PatientRecord, PersonalDetails, DatosFacturacion, BackgroundInformation, Attachment } from '@/lib/types';

// Simular latencia de red
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
    // Lógica futura con Firestore:
    // const firestore = getFirestore();
    // const patientCollection = collection(firestore, 'patients');
    // const docRef = await addDoc(patientCollection, {
    //   ...data,
    //   createdAt: new Date().toISOString(),
    //   updatedAt: new Date().toISOString(),
    //   medicalEncounters: [],
    //   recipes: [],
    //   attachments: [],
    // });
    // return { id: docRef.id, ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), medicalEncounters: [], recipes: [], attachments: [] };
    
    const newPatient = dbAddPatient(data);
    if (!newPatient) {
      throw new Error("Error simulado: No se pudo crear el paciente en la base de datos simulada.");
    }
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
  updates: Partial<Omit<PatientRecord, 'id' | 'createdAt'>>
): Promise<PatientRecord | null> {
  await simulateDelay();
  try {
    // Lógica futura con Firestore:
    // const firestore = getFirestore();
    // const patientDocRef = doc(firestore, 'patients', patientId);
    // await updateDoc(patientDocRef, { ...updates, updatedAt: new Date().toISOString() });
    // const updatedDocSnap = await getDoc(patientDocRef);
    // if (!updatedDocSnap.exists()) return null;
    // return { id: updatedDocSnap.id, ...updatedDocSnap.data() } as PatientRecord;

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
  attachmentData: Omit<Attachment, 'id'> // name, type, driveLink (será URL de Cloud Storage), uploadedAt
): Promise<PatientRecord | null> {
  await simulateDelay();
  try {
    // Lógica futura con Firestore y Cloud Storage:
    // 1. Subir archivo a Cloud Storage y obtener la URL.
    //    const storageUrl = await uploadFileToCloudStorage(file, `patients/${patientId}/attachments/${fileName}`);
    //    const newAttachmentData = { ...attachmentData, driveLink: storageUrl, uploadedAt: new Date().toISOString() };
    // 2. Actualizar el array de attachments del paciente en Firestore.
    //    const patientDocRef = doc(getFirestore(), 'patients', patientId);
    //    await updateDoc(patientDocRef, {
    //      attachments: arrayUnion(newAttachmentData), // arrayUnion para añadir al array
    //      updatedAt: new Date().toISOString()
    //    });
    //    const updatedPatientSnap = await getDoc(patientDocRef);
    //    return updatedPatientSnap.data() as PatientRecord | null;

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
    // Lógica futura con Firestore y potencialmente Cloud Storage (para borrar el archivo físico):
    // 1. Obtener el paciente de Firestore.
    // 2. Filtrar los attachments a eliminar y obtener sus URLs de Cloud Storage.
    // 3. (Opcional) Eliminar los archivos de Cloud Storage.
    //    for (const attachmentToDelete of attachmentsBeingDeleted) {
    //      await deleteFileFromCloudStorage(attachmentToDelete.driveLink);
    //    }
    // 4. Actualizar el array de attachments en Firestore.
    //    const patientDocRef = doc(getFirestore(), 'patients', patientId);
    //    const currentPatientData = (await getDoc(patientDocRef)).data();
    //    const newAttachmentsArray = currentPatientData.attachments.filter(att => !attachmentIds.includes(att.id));
    //    await updateDoc(patientDocRef, {
    //      attachments: newAttachmentsArray,
    //      updatedAt: new Date().toISOString()
    //    });
    //    return { ...currentPatientData, attachments: newAttachmentsArray, updatedAt: new Date().toISOString() } as PatientRecord;
    
    const patient = getPatientById(patientId);
    if (!patient) {
      console.error(`Server Action deletePatientAttachments: Patient with ID ${patientId} not found.`);
      throw new Error("Paciente no encontrado");
    }

    const updatedAttachments = patient.attachments.filter(
      (att) => !attachmentIds.includes(att.id)
    );
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
