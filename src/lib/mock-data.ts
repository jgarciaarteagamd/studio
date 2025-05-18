// src/lib/mock-data.ts
import type { PatientRecord, PersonalDetails, BackgroundInformation, MedicalEncounter, Attachment, Appointment } from './types';
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
export const addPatient = (
  data: { personalDetails: PersonalDetails; backgroundInformation?: BackgroundInformation } // backgroundInformation is now optional
): PatientRecord => {
  const newPatient: PatientRecord = {
    id: String(mockPatients.length + 1 + Math.random()), // simple unique ID
    personalDetails: data.personalDetails,
    backgroundInformation: data.backgroundInformation || { personalHistory: '', allergies: '', habitualMedication: '' }, // Provide default if not given
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
    patientName: 'Maria Gonzalez',
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
    patientName: 'John Smith',
    dateTime: setHours(setMinutes(today, 30), 11).toISOString(), // Hoy a las 11:30
    durationMinutes: 45,
    status: 'programada',
    notes: 'Seguimiento hipotiroidismo.',
    isBlocker: false,
  },
  {
    id: 'appt3',
    patientId: '3',
    patientName: 'Luisa Fernandez',
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
  let patientName = data.patientName;
  if (data.patientId && !data.isBlocker) {
    const patient = getPatientById(data.patientId);
    if (!patient) {
      throw new Error("Paciente no encontrado para la cita.");
    }
    patientName = patient.personalDetails.name;
  } else if (data.isBlocker) {
    patientName = undefined; // No patient name for blockers
  }


  const newAppointment: Appointment = {
    id: `appt-${Date.now()}`,
    patientId: data.isBlocker ? undefined : data.patientId,
    patientName: data.isBlocker ? undefined : patientName,
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
