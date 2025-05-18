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
  nombres: string;
  apellidos: string;
  documentoIdentidad?: string;
  fechaNacimiento: string; // ISO date string
  telefono1?: string; // Renamed from "Teléfono móvil (1)"
  telefono2?: string; // Renamed from "Teléfono opcional (2)"
  email?: string;
}

export interface DatosFacturacion {
  ruc?: string;
  direccionFiscal?: string;
  telefonoFacturacion?: string;
  emailFacturacion?: string;
}

export interface BackgroundInformation {
  personalHistory?: string;
  allergies?: string;
  habitualMedication?: string;
}

export interface MedicalEncounter {
  id: string;
  date: string; // ISO date string of the encounter
  details: string;
}

export interface MedicationItem {
  id: string; // For react-hook-form field array key
  drugName: string;
  presentation: string;
  indications: string;
}

export interface Recipe {
  id: string;
  patientId: string;
  date: string; // ISO date string
  medications: MedicationItem[];
  preventiveMeasures: string;
  diagnoses?: string;
  observations?: string;
}

export interface PatientRecord {
  id: string;
  personalDetails: PersonalDetails;
  datosFacturacion?: DatosFacturacion;
  backgroundInformation?: BackgroundInformation;
  medicalEncounters: MedicalEncounter[];
  recipes: Recipe[]; // Added for recipe history
  attachments: Attachment[];
  createdAt: string; // ISO date string
  updatedAt: string; // Date of the last general update or last encounter/recipe
}

export interface Appointment {
  id: string;
  patientId?: string;
  patientName?: string;
  dateTime: string; // ISO string for full date and time
  durationMinutes: number;
  notes?: string;
  status: 'programada' | 'confirmada' | 'cancelada' | 'completada';
  isBlocker?: boolean;
  blockerReason?: string;
}
