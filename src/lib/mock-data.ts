// src/lib/mock-data.ts
import type { PatientRecord, Attachment } from './types';

const today = new Date().toISOString();

export const mockAttachments: Attachment[] = [
  { id: 'attach1', name: 'Lab_Results_Jan2024.pdf', type: 'pdf', driveLink: '#', uploadedAt: today },
  { id: 'attach2', name: 'Thyroid_Scan.jpg', type: 'image', driveLink: '#', uploadedAt: today },
];

export const mockPatients: PatientRecord[] = [
  {
    id: '1',
    name: 'Maria Gonzalez',
    dateOfBirth: '1985-05-15',
    contactInfo: 'maria.gonzalez@example.com | 555-0101',
    medicalHistory: 'Type 2 Diabetes diagnosed in 2020, Hypertension. No known drug allergies.',
    examinationResults: 'A1c: 7.5%, BP: 140/90 mmHg. Thyroid normal on palpation. Weight: 75kg.',
    treatmentPlans: 'Metformin 1000mg BID, Lisinopril 10mg OD. Recommended lifestyle changes including diet and exercise. Follow-up in 3 months.',
    attachments: [mockAttachments[0]],
    createdAt: today,
    updatedAt: today,
  },
  {
    id: '2',
    name: 'John Smith',
    dateOfBirth: '1970-11-22',
    contactInfo: 'john.smith@example.com | 555-0102',
    medicalHistory: 'Hypothyroidism diagnosed in 2015. History of hyperlipidemia.',
    examinationResults: 'TSH: 3.2 mIU/L (within target range on current Levo dose). LDL: 130 mg/dL. Weight: 88kg.',
    treatmentPlans: 'Levothyroxine 100mcg OD. Atorvastatin 20mg OD. Continue current management. Annual follow-up.',
    attachments: mockAttachments,
    createdAt: today,
    updatedAt: today,
  },
  {
    id: '3',
    name: 'Luisa Fernandez',
    dateOfBirth: '1992-08-01',
    contactInfo: 'luisa.fernandez@example.com | 555-0103',
    medicalHistory: 'Polycystic Ovary Syndrome (PCOS). Trying to conceive.',
    examinationResults: 'Irregular menses. Mild hirsutism. Ultrasound confirms polycystic ovaries. BMI: 28.',
    treatmentPlans: 'Metformin 500mg BID to improve insulin sensitivity. Clomiphene citrate for ovulation induction. Advised on weight management.',
    attachments: [],
    createdAt: today,
    updatedAt: today,
  },
];

// Function to get a single patient by ID (mock)
export const getPatientById = (id: string): PatientRecord | undefined => {
  return mockPatients.find(p => p.id === id);
};

// Function to add a patient (mock)
export const addPatient = (patient: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt' | 'attachments'> & { attachments?: Attachment[] }): PatientRecord => {
  const newPatient: PatientRecord = {
    ...patient,
    id: String(mockPatients.length + 1 + Math.random()), // simple unique ID
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    attachments: patient.attachments || [],
  };
  mockPatients.push(newPatient);
  console.log("Added new patient (mock):", newPatient);
  return newPatient;
};

// Function to update a patient (mock)
export const updatePatient = (id: string, updates: Partial<PatientRecord>): PatientRecord | undefined => {
  const patientIndex = mockPatients.findIndex(p => p.id === id);
  if (patientIndex !== -1) {
    mockPatients[patientIndex] = { ...mockPatients[patientIndex], ...updates, updatedAt: new Date().toISOString() };
    console.log("Updated patient (mock):", mockPatients[patientIndex]);
    return mockPatients[patientIndex];
  }
  return undefined;
};
