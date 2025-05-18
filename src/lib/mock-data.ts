
// src/lib/mock-data.ts
import type { PatientRecord, PersonalDetails, BackgroundInformation, MedicalEncounter, Attachment, Appointment, DatosFacturacion } from './types';
import { addMinutes, formatISO, parseISO, setHours, setMinutes } from 'date-fns';

const today = new Date();
const todayISO = today.toISOString();
const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString();
const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
const threeMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString();
const sixMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString();

export const mockAttachments: Attachment[] = [
  { id: 'attach1', name: 'Lab_Results_Jan2024.pdf', type: 'pdf', driveLink: '#', uploadedAt: todayISO },
  { id: 'attach2', name: 'Thyroid_Scan.jpg', type: 'image', driveLink: '#', uploadedAt: yesterday },
];

export const mockPatients: PatientRecord[] = [
  {
    id: '1',
    personalDetails: {
      nombres: 'Maria',
      apellidos: 'Gonzalez Perez',
      documentoIdentidad: '12345678A',
      fechaNacimiento: '1985-05-15',
      email: 'maria.gonzalez@example.com',
      telefono1: '555-0101',
    },
    datosFacturacion: {
      ruc: '12345678901',
      direccionFiscal: 'Av. Siempreviva 742',
      emailFacturacion: 'facturacion.maria@example.com',
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
        date: todayISO,
        details: 'Control trimestral. A1c: 7.2%, TA: 135/85 mmHg. Refiere buena adherencia al tratamiento. Se ajusta dosis de Lisinopril a 20mg OD por picos tensionales ocasionales. Se solicita perfil lipídico.',
      },
    ],
    attachments: [mockAttachments[0]],
    createdAt: sixMonthsAgo,
    updatedAt: todayISO,
  },
  {
    id: '2',
    personalDetails: {
      nombres: 'John',
      apellidos: 'Smith Miller',
      documentoIdentidad: '87654321B',
      fechaNacimiento: '1970-11-22',
      email: 'john.smith@example.com',
      telefono1: '555-0102',
    },
    datosFacturacion: {
      ruc: '10987654321',
      direccionFiscal: 'Calle Falsa 123',
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
      nombres: 'Luisa',
      apellidos: 'Fernandez Garcia',
      documentoIdentidad: '11223344C',
      fechaNacimiento: '1992-08-01',
      email: 'luisa.fernandez@example.com',
      telefono1: '555-0103',
    },
    // No datosFacturacion for this patient initially
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
export const addPatient = (
  data: { 
    personalDetails: PersonalDetails; 
    datosFacturacion?: DatosFacturacion;
    backgroundInformation?: BackgroundInformation 
  }
): PatientRecord => {
  const newPatient: PatientRecord = {
    id: String(mockPatients.length + 1 + Math.random()), // simple unique ID
    personalDetails: data.personalDetails,
    datosFacturacion: data.datosFacturacion || { ruc: '', direccionFiscal: '', telefonoFacturacion: '', emailFacturacion: ''},
    backgroundInformation: data.backgroundInformation || { personalHistory: '', allergies: '', habitualMedication: '' }, 
    medicalEncounters: [], 
    attachments: [], 
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockPatients.push(newPatient);
  return newPatient;
};

// Function to update a patient (mock)
export const updatePatient = (id: string, updates: Partial<Omit<PatientRecord, 'id' | 'createdAt' >>): PatientRecord | undefined => {
  const patientIndex = mockPatients.findIndex(p => p.id === id);
  if (patientIndex !== -1) {
    const currentPatient = mockPatients[patientIndex];
    const updatedPatientData = {
      ...currentPatient,
      ...updates,
      personalDetails: updates.personalDetails || currentPatient.personalDetails,
      datosFacturacion: updates.datosFacturacion !== undefined ? updates.datosFacturacion : currentPatient.datosFacturacion,
      backgroundInformation: updates.backgroundInformation !== undefined ? updates.backgroundInformation : currentPatient.backgroundInformation,
      medicalEncounters: updates.medicalEncounters || currentPatient.medicalEncounters,
      attachments: updates.attachments || currentPatient.attachments,
      updatedAt: new Date().toISOString(),
    };
    mockPatients[patientIndex] = updatedPatientData;
    return mockPatients[patientIndex];
  }
  return undefined;
};


// Appointments Mock Data
export let mockAppointments: Appointment[] = [
  {
    id: 'appt1',
    patientId: '1',
    patientName: 'Maria Gonzalez Perez', 
    dateTime: setHours(setMinutes(today, 0), 10).toISOString(), // Hoy a las 10:00
    durationMinutes: 30,
    status: 'confirmada',
    notes: 'Control de diabetes.',
    isBlocker: false,
  },
  {
    id: 'appt-block-lunch',
    dateTime: setHours(setMinutes(today, 0), 13).toISOString(), // Hoy a las 13:00
    durationMinutes: 60,
    status: 'programada', 
    isBlocker: true,
    blockerReason: 'Almuerzo del Personal',
  },
  {
    id: 'appt2',
    patientId: '2',
    patientName: 'John Smith Miller', 
    dateTime: setHours(setMinutes(today, 30), 11).toISOString(), // Hoy a las 11:30
    durationMinutes: 45,
    status: 'programada',
    notes: 'Seguimiento hipotiroidismo.',
    isBlocker: false,
  },
  {
    id: 'appt3',
    patientId: '3',
    patientName: 'Luisa Fernandez Garcia', 
    dateTime: setHours(setMinutes(tomorrow, 0), 9).toISOString(), // Mañana a las 09:00
    durationMinutes: 60,
    status: 'programada',
    notes: 'Consulta SOP.',
    isBlocker: false,
  }
];

export const getAppointments = (): Appointment[] => {
  return mockAppointments.sort((a,b) => parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime());
};

export const addAppointment = (data: Omit<Appointment, 'id' | 'patientName'> & { patientName?: string }): Appointment => {
  let patientNameResolved = data.patientName; // Use let for reassignment
  if (data.patientId && !data.isBlocker) {
    const patient = getPatientById(data.patientId);
    if (!patient) {
      throw new Error("Paciente no encontrado para la cita.");
    }
    // Use getPatientFullName for consistency if patient object is PatientRecord
    patientNameResolved = getPatientFullName(patient);
  } else if (data.isBlocker) {
    patientNameResolved = undefined; // No patient name for blockers
  }


  const newAppointment: Appointment = {
    id: `appt-${Date.now()}`,
    patientId: data.isBlocker ? undefined : data.patientId,
    patientName: patientNameResolved,
    dateTime: data.dateTime,
    durationMinutes: data.durationMinutes,
    notes: data.isBlocker ? undefined : data.notes,
    status: data.status,
    isBlocker: data.isBlocker || false,
    blockerReason: data.isBlocker ? data.blockerReason : undefined,
  };
  mockAppointments.push(newAppointment);
  return newAppointment;
};

// Helper function to get patient full name for display
export const getPatientFullName = (patient: PatientRecord | PersonalDetails): string => {
  if ('personalDetails' in patient) { // It's a PatientRecord
    return `${patient.personalDetails.nombres} ${patient.personalDetails.apellidos}`;
  }
  // It's PersonalDetails (e.g. from form values before full record creation)
  return `${patient.nombres} ${patient.apellidos}`;
};

    