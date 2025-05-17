// src/lib/mock-data.ts
import type { PatientRecord, PersonalDetails, BackgroundInformation, MedicalEncounter, Attachment } from './types';

const today = new Date().toISOString();
const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString();
const threeMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString();
const sixMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString();

export const mockAttachments: Attachment[] = [
  { id: 'attach1', name: 'Lab_Results_Jan2024.pdf', type: 'pdf', driveLink: '#', uploadedAt: today },
  { id: 'attach2', name: 'Thyroid_Scan.jpg', type: 'image', driveLink: '#', uploadedAt: yesterday },
];

export const mockPatients: PatientRecord[] = [
  {
    id: '1',
    personalDetails: {
      name: 'Maria Gonzalez',
      dateOfBirth: '1985-05-15',
      contactInfo: 'maria.gonzalez@example.com | 555-0101',
    },
    backgroundInformation: {
      personalHistory: 'Diabetes tipo 2 diagnosticada en 2020. Hipertensión.',
      allergies: 'Penicilina (rash cutáneo).',
      habitualMedication: 'Metformina 1000mg BID, Lisinopril 10mg OD.',
    },
    medicalEncounters: [
      {
        id: 'enc1-1',
        date: threeMonthsAgo,
        details: 'Consulta de seguimiento diabetes. A1c: 7.5%, TA: 140/90 mmHg. Peso: 75kg. Se recomienda continuar tratamiento y reforzar cambios en estilo de vida. Próximo control en 3 meses.',
      },
      {
        id: 'enc1-2',
        date: today,
        details: 'Control trimestral. A1c: 7.2%, TA: 135/85 mmHg. Refiere buena adherencia al tratamiento. Se ajusta dosis de Lisinopril a 20mg OD por picos tensionales ocasionales. Se solicita perfil lipídico.',
      },
    ],
    attachments: [mockAttachments[0]],
    createdAt: sixMonthsAgo,
    updatedAt: today,
  },
  {
    id: '2',
    personalDetails: {
      name: 'John Smith',
      dateOfBirth: '1970-11-22',
      contactInfo: 'john.smith@example.com | 555-0102',
    },
    backgroundInformation: {
      personalHistory: 'Hipotiroidismo diagnosticado en 2015. Hiperlipidemia.',
      allergies: 'No conocidas.',
      habitualMedication: 'Levotiroxina 100mcg OD, Atorvastatina 20mg OD.',
    },
    medicalEncounters: [
      {
        id: 'enc2-1',
        date: sixMonthsAgo,
        details: 'Control anual hipotiroidismo. TSH: 3.2 mUI/L (en rango). LDL: 130 mg/dL. Peso: 88kg. Continuar mismo tratamiento. Próximo control en 1 año.',
      },
    ],
    attachments: mockAttachments,
    createdAt: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
    updatedAt: sixMonthsAgo,
  },
  {
    id: '3',
    personalDetails: {
      name: 'Luisa Fernandez',
      dateOfBirth: '1992-08-01',
      contactInfo: 'luisa.fernandez@example.com | 555-0103',
    },
    backgroundInformation: {
      personalHistory: 'Síndrome de Ovario Poliquístico (SOP). Buscando embarazo.',
      allergies: 'AINEs (malestar gástrico).',
      habitualMedication: 'Ácido fólico 5mg OD.',
    },
    medicalEncounters: [
      {
        id: 'enc3-1',
        date: yesterday,
        details: 'Consulta por SOP e infertilidad. Menstruaciones irregulares, hirsutismo leve. Ecografía confirma ovarios poliquísticos. IMC: 28. Se inicia Metformina 500mg BID para mejorar sensibilidad a la insulina. Se discute Clomifeno para inducción de ovulación. Asesoramiento sobre manejo de peso.',
      },
    ],
    attachments: [],
    createdAt: yesterday,
    updatedAt: yesterday,
  },
];

// Function to get a single patient by ID (mock)
export const getPatientById = (id: string): PatientRecord | undefined => {
  return mockPatients.find(p => p.id === id);
};

// Function to add a patient (mock)
// For adding, medicalEncounters and attachments are typically empty or minimal initially.
export const addPatient = (
  data: { personalDetails: PersonalDetails; backgroundInformation: BackgroundInformation }
): PatientRecord => {
  const newPatient: PatientRecord = {
    id: String(mockPatients.length + 1 + Math.random()), // simple unique ID
    personalDetails: data.personalDetails,
    backgroundInformation: data.backgroundInformation,
    medicalEncounters: [], // Start with no encounters
    attachments: [], // Start with no attachments
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockPatients.push(newPatient);
  console.log("Added new patient (mock):", newPatient);
  return newPatient;
};

// Function to update a patient (mock)
// This can update personalDetails, backgroundInformation, or add new encounters/attachments.
export const updatePatient = (id: string, updates: Partial<Omit<PatientRecord, 'id' | 'createdAt' >>): PatientRecord | undefined => {
  const patientIndex = mockPatients.findIndex(p => p.id === id);
  if (patientIndex !== -1) {
    // Merge updates, ensuring arrays are handled correctly if needed (e.g., adding to encounters)
    const currentPatient = mockPatients[patientIndex];
    const updatedPatientData = {
      ...currentPatient,
      ...updates,
      // If encounters are part of updates, ensure they are merged or replaced as intended
      // For this example, we'll assume 'updates' might replace encounters or add to them if handled by caller
      medicalEncounters: updates.medicalEncounters || currentPatient.medicalEncounters,
      attachments: updates.attachments || currentPatient.attachments,
      updatedAt: new Date().toISOString(),
    };
    mockPatients[patientIndex] = updatedPatientData;
    console.log("Updated patient (mock):", mockPatients[patientIndex]);
    return mockPatients[patientIndex];
  }
  return undefined;
};
