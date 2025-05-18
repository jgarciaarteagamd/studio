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

export let mockPatients: PatientRecord[] = [
  {
    id: '1',
    personalDetails: {
      nombres: 'Maria',
      apellidos: 'Gonzalez Perez',
      documentoIdentidad: '12345678A',
      fechaNacimiento: '1985-05-15',
      email: 'maria.gonzalez@example.com',
      telefono1: '0987654321',
      telefono2: '022555111',
    },
    datosFacturacion: {
      ruc: '1234567890001',
      direccionFiscal: 'Av. Amazonas N30-100 y Gaspar de Villarroel, Quito',
      emailFacturacion: 'facturacion.maria@example.com',
      telefonoFacturacion: '022999888',
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
        details: '**Anamnesis:**\nPaciente refiere control de diabetes. Sigue dieta con algunas transgresiones.\n\n**Exploración Física:**\nTA: 140/90 mmHg, FC: 78 lpm, Peso: 75kg, Talla: 1.60m. Murmullo vesicular conservado. Edema leve en miembros inferiores.\n\n**Estudios Complementarios:**\nA1c: 7.5% (previo 7.8%). Glucosa basal: 145 mg/dL.\n\n**Impresión Diagnóstica:**\nDiabetes Mellitus tipo 2, parcialmente controlada. Hipertensión Arterial Estadio 1.\n\n**Plan:**\nContinuar Metformina 1000mg BID. Continuar Lisinopril 10mg OD. Reforzar adherencia a dieta y ejercicio. Cita en 3 meses con nuevos exámenes.',
      },
      {
        id: 'enc1-2',
        date: todayISO,
        details: '**Anamnesis:**\nControl trimestral. Refiere mejor adherencia a la dieta, aunque con picos de estrés laboral que dificultan ejercicio regular. Presentó un episodio de cefalea tensional la semana pasada.\n\n**Exploración Física:**\nTA: 135/85 mmHg, FC: 72 lpm, Peso: 74kg. No edemas. Resto sin cambios significativos.\n\n**Estudios Complementarios:**\nA1c: 7.2%. Perfil lipídico: Col Total 190, LDL 110, HDL 45, TG 150.\n\n**Impresión Diagnóstica:**\nDiabetes Mellitus tipo 2, en mejoría. Hipertensión Arterial controlada. Dislipidemia mixta leve.\n\n**Plan:**\nContinuar Metformina 1000mg BID. Ajustar Lisinopril a 20mg OD por picos tensionales ocasionales reportados. Iniciar Atorvastatina 10mg OD. Cita en 3 meses con control de A1c y perfil lipídico.',
      },
    ],
    attachments: [mockAttachments[0]],
    createdAt: sixMonthsAgo,
    updatedAt: todayISO,
  },
  {
    id: '2',
    personalDetails: {
      nombres: 'Carlos',
      apellidos: 'Rodriguez Lopez',
      documentoIdentidad: '0987654321',
      fechaNacimiento: '1970-11-22',
      email: 'carlos.rodriguez@example.com',
      telefono1: '0991234567',
    },
    datosFacturacion: {
      ruc: '0987654321001',
      direccionFiscal: 'Calle Guayaquil 10-20 y Sucre, Cuenca',
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
        details: '**Anamnesis:**\nControl anual hipotiroidismo. Paciente asintomático, buena adherencia al tratamiento.\n\n**Exploración Física:**\nTA: 120/80 mmHg, FC: 68 lpm, Peso: 88kg. Piel y faneras normales. No bocio.\n\n**Estudios Complementarios:**\nTSH: 3.2 mUI/L (rango normal). Perfil lipídico: LDL 130 mg/dL.\n\n**Impresión Diagnóstica:**\nEutroidismo bajo tratamiento. Hiperlipidemia mixta.\n\n**Plan:**\nContinuar Levotiroxina 100mcg OD. Continuar Atorvastatina 20mg OD. Control anual o antes si hay síntomas.',
      },
    ],
    attachments: mockAttachments,
    createdAt: new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toISOString(),
    updatedAt: sixMonthsAgo,
  },
  {
    id: '3',
    personalDetails: {
      nombres: 'Ana',
      apellidos: 'Martinez Silva',
      documentoIdentidad: '1723456789',
      fechaNacimiento: '1992-08-01',
      email: 'ana.martinez@example.com',
      telefono1: '0976543210',
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
        details: '**Anamnesis:**\nConsulta por SOP e infertilidad. Ciclos menstruales irregulares (cada 45-60 días). Hirsutismo leve en rostro. Acné persistente. Niega galactorrea. Deseo gestacional activo desde hace 1 año sin éxito.\n\n**Exploración Física:**\nTA: 110/70 mmHg, Peso: 70kg, Talla: 1.65m (IMC 25.7). Hirsutismo facial leve (score Ferriman-Gallwey 9). Acné comedoniano en rostro y espalda. No bocio, no acantosis nigricans.\n\n**Estudios Complementarios:**\nEcografía transvaginal (previa): Ovarios de aspecto poliquístico (15 folículos en ovario derecho, 12 en izquierdo). Perfil hormonal (día 3 del ciclo, referido): FSH 6 UI/L, LH 15 UI/L, Testosterona Total 70 ng/dL, Prolactina 12 ng/mL.\n\n**Impresión Diagnóstica:**\nSíndrome de Ovario Poliquístico (fenotipo A: hiperandrogenismo clínico, oligoanovulación, ovarios poliquísticos por ecografía). Infertilidad primaria.\n\n**Plan:**\n1. Iniciar Metformina 500mg BID para mejorar sensibilidad a la insulina y regularizar ciclos. Indicar toma gradual para tolerancia.\n2. Continuar Ácido Fólico 5mg OD.\n3. Asesoramiento sobre cambios en estilo de vida: dieta baja en carbohidratos refinados, ejercicio regular (objetivo IMC < 25).\n4. Discutir opciones de inducción de ovulación: iniciar con Letrozol 2.5mg/día del día 3 al 7 del ciclo, una vez que se presente menstruación o se induzca con progestágenos. Seguimiento folicular ecográfico.\n5. Control en 1 mes para evaluar tolerancia a Metformina y planificar inicio de inducción.',
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

export interface NewConsultationData {
  anamnesis: string;
  exploracionFisica: string;
  estudiosComplementarios: string;
  impresionDiagnostica: string;
  plan: string;
}

export const addMedicalEncounterToPatient = (patientId: string, consultationData: NewConsultationData): PatientRecord | undefined => {
  const patientIndex = mockPatients.findIndex(p => p.id === patientId);
  if (patientIndex === -1) {
    console.error(`Patient with id ${patientId} not found.`);
    return undefined;
  }

  const details = `**Anamnesis:**\n${consultationData.anamnesis || 'No registrado.'}\n\n**Exploración Física:**\n${consultationData.exploracionFisica || 'No registrado.'}\n\n**Estudios Complementarios:**\n${consultationData.estudiosComplementarios || 'No registrado.'}\n\n**Impresión Diagnóstica:**\n${consultationData.impresionDiagnostica || 'No registrado.'}\n\n**Plan:**\n${consultationData.plan || 'No registrado.'}`;

  const newEncounter: MedicalEncounter = {
    id: `enc-${patientId}-${Date.now()}`,
    date: new Date().toISOString(),
    details: details,
  };

  mockPatients[patientIndex].medicalEncounters.push(newEncounter);
  mockPatients[patientIndex].updatedAt = new Date().toISOString();
  
  return mockPatients[patientIndex];
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
    patientName: 'Carlos Rodriguez Lopez', 
    dateTime: setHours(setMinutes(today, 30), 11).toISOString(), // Hoy a las 11:30
    durationMinutes: 45,
    status: 'programada',
    notes: 'Seguimiento hipotiroidismo.',
    isBlocker: false,
  },
  {
    id: 'appt3',
    patientId: '3',
    patientName: 'Ana Martinez Silva', 
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
  let patientNameResolved = data.patientName;
  if (data.patientId && !data.isBlocker) {
    const patient = getPatientById(data.patientId);
    if (!patient) {
      throw new Error("Paciente no encontrado para la cita.");
    }
    patientNameResolved = getPatientFullName(patient);
  } else if (data.isBlocker) {
    patientNameResolved = undefined; 
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
export const getPatientFullName = (patient: PatientRecord | PersonalDetails | undefined | null): string => {
  if (!patient) return 'Nombre no disponible';
  if ('personalDetails' in patient) { // It's a PatientRecord
    return `${patient.personalDetails.nombres} ${patient.personalDetails.apellidos}`;
  }
  // It's PersonalDetails (e.g. from form values before full record creation)
  return `${patient.nombres} ${patient.apellidos}`;
};
