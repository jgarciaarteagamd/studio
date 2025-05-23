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
  telefono1?: string;
  telefono2?: string;
  email?: string;
}

export interface DatosFacturacion {
  ruc?: string;
  direccionFiscal?: string;
  telefonoFacturacion?: string;
  emailFacturacion?: string;
}

export interface BackgroundInformation {
  personalHistory?: string | null;
  allergies?: string | null;
  habitualMedication?: string | null;
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
  datosFacturacion?: DatosFacturacion | null;
  backgroundInformation?: BackgroundInformation | null;
  medicalEncounters: MedicalEncounter[];
  recipes: Recipe[];
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

// --- Tipos para Perfil del Médico ---
export interface DoctorContactDetails {
  nombreCompleto: string;
  emailContacto: string;
  telefonoPrincipal: string;
  direccionConsultorio: string;
}

export interface DoctorProfessionalDetails {
  especialidadPrincipal: string;
  otrasEspecialidades?: string;
  numeroMatricula: string;
  otrosRegistros?: string;
}

export interface DoctorFiscalDetails {
  razonSocialFacturacion: string;
  identificacionTributaria: string; // RUC, CUIT, NIF, etc.
  domicilioFiscalCompleto: string;
  condicionIVA?: string;
}

export interface DoctorProfile {
  id: string; // Podría ser el ID de usuario de Google
  contactDetails: DoctorContactDetails;
  professionalDetails: DoctorProfessionalDetails;
  fiscalDetails: DoctorFiscalDetails;
  logotipoUrl?: string; // URL del logotipo subido
  driveFolderId?: string; // ID de la carpeta "MedLog" en Drive
  updatedAt: string;
}

// --- Tipos para Facturación ---
export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export type InvoiceStatus = 'borrador' | 'emitida' | 'pagada' | 'anulada' | 'vencida';

export interface Invoice {
  id: string;
  invoiceNumber: string; // Ej. F001-0000123
  patientId: string;
  patientName: string; // Denormalizado para fácil visualización
  dateIssued: string; // ISO date string
  dateDue?: string; // ISO date string
  items: InvoiceItem[];
  subtotal: number;
  taxRate?: number; // Ej. 0.12 para 12%
  taxAmount?: number;
  totalAmount: number;
  status: InvoiceStatus;
  notes?: string;
  // Referencia a datos fiscales del médico usados en esta factura
  doctorFiscalDetailsSnapshot: DoctorFiscalDetails;
  updatedAt?: string; // Para rastrear cuándo se actualizó el estado, por ejemplo
}

// --- Tipos para Gestión de Usuarios Asistenciales ---
export interface AssistantPermissions {
   patients: {
    canCreate: boolean;
    canModifyPersonalAndBilling: boolean; // Modificar datos personales y de facturación
    // canModifyBackground: boolean; // Antecedentes solo médico
    canAddAttachments: boolean;
  };
  schedule: {
    canProgramAppointments: boolean;
    canBlockTime: boolean;
    canChangeStatus: boolean;
    canDeleteAppointments: boolean;
  };
  billing: {
    canAccess: boolean;
  };
}

export interface AssistantUser {
  id: string;
  username: string; // ej. gonmar08
  nombreCompleto: string;
  email: string; // Email para notificaciones / restablecimiento
  estado: 'activo' | 'inactivo' | 'pendiente_aprobacion';
  permissions: AssistantPermissions;
  createdAt: string;
  lastActivity?: string;
}
