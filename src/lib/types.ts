// src/lib/types.ts
export interface Attachment {
  id: string;
  name: string;
  type: 'pdf' | 'image' | 'other'; // e.g., 'application/pdf', 'image/jpeg'
  driveLink: string; // Mock link to Google Drive
  uploadedAt: string; // ISO date string
}

export interface PatientRecord {
  id: string;
  name: string;
  dateOfBirth: string; // ISO date string
  contactInfo: string;
  medicalHistory: string;
  examinationResults: string;
  treatmentPlans: string;
  attachments: Attachment[];
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
}
