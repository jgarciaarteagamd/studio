// src/lib/types.ts
export interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'other';
  driveLink: string; // Mock link to Google Drive
  uploadedAt: string; // ISO date string
  encounterId?: string; // Optional: to link attachment to a specific encounter
}

export interface PersonalDetails {
  name: string;
  dateOfBirth: string; // ISO date string
  contactInfo: string;
}

export interface BackgroundInformation {
  // Antecedentes personales no patológicos y patológicos relevantes
  personalHistory: string; 
  allergies: string; // Alergias conocidas
  habitualMedication: string; // Medicación que toma regularmente
}

export interface MedicalEncounter {
  id: string;
  date: string; // ISO date string of the encounter
  // Combinación de motivo, examen, diagnóstico, plan para esta consulta
  details: string; 
}

export interface PatientRecord {
  id: string;
  personalDetails: PersonalDetails;
  backgroundInformation: BackgroundInformation;
  medicalEncounters: MedicalEncounter[];
  // General attachments, or could be moved/linked to encounters
  attachments: Attachment[]; 
  createdAt: string; // ISO date string
  // Date of the last general update or last encounter
  updatedAt: string; 
}

export interface Appointment {
  id: string;
  patientId?: string; // Optional if it's a blocker
  patientName?: string; // Denormalized for easy display, optional for blockers
  dateTime: string; // ISO string for full date and time
  durationMinutes: number;
  notes?: string; // For regular appointments
  status: 'programada' | 'confirmada' | 'cancelada' | 'completada';
  isBlocker?: boolean; // True if this is a time block rather than a patient appointment
  blockerReason?: string; // Reason for the block (e.g., "Lunch", "Meeting")
}

