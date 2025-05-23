// src/lib/mock-data.ts
import type {
  PatientRecord, PersonalDetails, BackgroundInformation, MedicalEncounter, Attachment, Appointment, DatosFacturacion, Recipe, MedicationItem,
  DoctorProfile, DoctorContactDetails, DoctorProfessionalDetails, DoctorFiscalDetails,
  Invoice, InvoiceItem, InvoiceStatus,
  AssistantUser, AssistantPermissions
} from './types';
import { parseISO, setHours, setMinutes, format, differenceInYears } from 'date-fns';
import { es } from 'date-fns/locale';


const today = new Date();
const todayISO = today.toISOString();
const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toISOString();
const tomorrow = new Date(new Date().setDate(new Date().getDate() + 1));
const threeMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 3)).toISOString();
const sixMonthsAgo = new Date(new Date().setMonth(new Date().getMonth() - 6)).toISOString();
const oneWeekAgo = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();
const oneMonthAgo = new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();


// --- SIMULACIÓN DE ROLES Y PERMISOS ---
export let SIMULATED_CURRENT_ROLE: 'doctor' | 'secretary' = 'doctor'; // o 'secretary'

export const SIMULATED_SECRETARY_PERMISSIONS: AssistantPermissions = {
  patients: {
    canCreate: true,
    canModifyPersonalAndBilling: true,
    canAddAttachments: true,
  },
  schedule: {
    canProgramAppointments: true,
    canBlockTime: true,
    canChangeStatus: true,
    canDeleteAppointments: true,
  },
  billing: {
    canAccess: true,
  },
};

export const setSimulatedRole = (role: 'doctor' | 'secretary') => {
  SIMULATED_CURRENT_ROLE = role;
  console.log(`Simulated role set to: ${role}`);
};
// --- FIN SIMULACIÓN DE ROLES ---


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
    recipes: [
      {
        id: 'recipe1-1',
        patientId: '1',
        date: oneWeekAgo,
        medications: [
          { id: 'med1-1-1', drugName: 'Amoxicilina + Ácido Clavulánico', presentation: 'Comprimidos 875mg/125mg', indications: 'Tomar 1 comprimido cada 12 horas por 7 días.'},
          { id: 'med1-1-2', drugName: 'Paracetamol', presentation: 'Comprimidos 500mg', indications: 'Tomar 1 comprimido cada 6-8 horas si presenta fiebre o dolor.'},
        ],
        preventiveMeasures: 'Reposo relativo. Aumentar ingesta de líquidos. Evitar cambios bruscos de temperatura.',
        diagnoses: 'Faringoamigdalitis Aguda Bacteriana',
        observations: 'Paciente refiere buena tolerancia gástrica a medicación previa similar.',
      }
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
    recipes: [],
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
    datosFacturacion: null,
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
    recipes: [],
    attachments: [],
    createdAt: yesterday,
    updatedAt: yesterday,
  },
];

export const getPatientById = (id: string): PatientRecord | undefined => {
  const patient = mockPatients.find(p => p.id === id);
  return patient ? { ...patient } : undefined; // Return a copy
};

export const addPatient = (
  data: {
    personalDetails: PersonalDetails;
    datosFacturacion?: DatosFacturacion | null;
    backgroundInformation?: BackgroundInformation | null;
  }
): PatientRecord => {
  const newPatient: PatientRecord = {
    id: String(mockPatients.length + 1 + Math.random()),
    personalDetails: data.personalDetails,
    datosFacturacion: data.datosFacturacion || null,
    backgroundInformation: data.backgroundInformation || { personalHistory: '', allergies: '', habitualMedication: '' }, // Default to empty object
    medicalEncounters: [],
    recipes: [],
    attachments: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  mockPatients.push(newPatient);
  return {...newPatient};
};

export const updatePatient = (id: string, updates: Partial<Omit<PatientRecord, 'id' | 'createdAt' >>): PatientRecord | undefined => {
  const patientIndex = mockPatients.findIndex(p => p.id === id);
  if (patientIndex !== -1) {
    const currentPatient = mockPatients[patientIndex];
    const updatedPatientData: PatientRecord = {
      ...currentPatient,
      ...updates,
      personalDetails: updates.personalDetails || currentPatient.personalDetails,
      datosFacturacion: updates.datosFacturacion !== undefined ? updates.datosFacturacion : currentPatient.datosFacturacion,
      backgroundInformation: updates.backgroundInformation !== undefined ? updates.backgroundInformation : currentPatient.backgroundInformation,
      medicalEncounters: updates.medicalEncounters || currentPatient.medicalEncounters,
      recipes: updates.recipes || currentPatient.recipes,
      attachments: updates.attachments || currentPatient.attachments,
      updatedAt: new Date().toISOString(),
    };
    mockPatients[patientIndex] = updatedPatientData;
    return {...mockPatients[patientIndex]};
  }
  return undefined;
};

export interface NewConsultationData {
  anamnesis: string;
  exploracionFisica: string;
  estudiosComplementarios?: string;
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

  const currentPatient = mockPatients[patientIndex];
  const updatedEncounters = [newEncounter, ...currentPatient.medicalEncounters].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const updatedPatientData: PatientRecord = {
    ...currentPatient,
    medicalEncounters: updatedEncounters,
    updatedAt: new Date().toISOString(),
  };
  mockPatients[patientIndex] = updatedPatientData;

  return { ...updatedPatientData }; // Return a new object reference
};

export const addRecipeToPatient = (patientId: string, recipeData: Omit<Recipe, 'id' | 'patientId' | 'date'>): PatientRecord | undefined => {
  const patientIndex = mockPatients.findIndex(p => p.id === patientId);
  if (patientIndex === -1) {
    console.error(`Patient with id ${patientId} not found.`);
    return undefined;
  }

  const newRecipe: Recipe = {
    id: `recipe-${patientId}-${Date.now()}`,
    patientId: patientId,
    date: new Date().toISOString(),
    ...recipeData,
  };

  const currentPatient = mockPatients[patientIndex];
  const updatedRecipes = [newRecipe, ...currentPatient.recipes].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  
  const updatedPatientData: PatientRecord = {
    ...currentPatient,
    recipes: updatedRecipes,
    updatedAt: new Date().toISOString(),
  };

  mockPatients[patientIndex] = updatedPatientData;

  return { ...updatedPatientData }; // Return a new object reference
};


export let mockAppointments: Appointment[] = [
  {
    id: 'appt1',
    patientId: '1',
    patientName: 'Maria Gonzalez Perez',
    dateTime: setHours(setMinutes(today, 0), 10).toISOString(),
    durationMinutes: 30,
    status: 'confirmada',
    notes: 'Control de diabetes.',
    isBlocker: false,
  },
  {
    id: 'appt-block-lunch',
    dateTime: setHours(setMinutes(today, 0), 13).toISOString(),
    durationMinutes: 60,
    status: 'programada',
    isBlocker: true,
    blockerReason: 'Almuerzo del Personal',
  },
  {
    id: 'appt2',
    patientId: '2',
    patientName: 'Carlos Rodriguez Lopez',
    dateTime: setHours(setMinutes(today, 30), 11).toISOString(),
    durationMinutes: 45,
    status: 'programada',
    notes: 'Seguimiento hipotiroidismo.',
    isBlocker: false,
  },
  {
    id: 'appt3',
    patientId: '3',
    patientName: 'Ana Martinez Silva',
    dateTime: setHours(setMinutes(tomorrow, 0), 9).toISOString(),
    durationMinutes: 60,
    status: 'programada',
    notes: 'Consulta SOP.',
    isBlocker: false,
  }
];

export const getAppointments = (): Appointment[] => {
  return [...mockAppointments].sort((a,b) => parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime());
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
    id: `appt-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    patientId: data.isBlocker ? undefined : data.patientId,
    patientName: patientNameResolved,
    dateTime: data.dateTime,
    durationMinutes: data.durationMinutes,
    notes: data.isBlocker ? undefined : data.notes,
    status: data.isBlocker ? 'programada' : data.status,
    isBlocker: data.isBlocker || false,
    blockerReason: data.isBlocker ? data.blockerReason : undefined,
  };
  mockAppointments.push(newAppointment);
  mockAppointments.sort((a,b) => parseISO(a.dateTime).getTime() - parseISO(b.dateTime).getTime());
  return {...newAppointment};
};

export const updateAppointmentStatus = (appointmentId: string, newStatus: Appointment['status']): Appointment | undefined => {
  const appointmentIndex = mockAppointments.findIndex(app => app.id === appointmentId);
  if (appointmentIndex !== -1) {
    mockAppointments[appointmentIndex].status = newStatus;
    return { ...mockAppointments[appointmentIndex] };
  }
  return undefined;
};

export const deleteAppointment = (appointmentId: string): boolean => {
  const initialLength = mockAppointments.length;
  mockAppointments = mockAppointments.filter(app => app.id !== appointmentId);
  return mockAppointments.length < initialLength;
};


export const getPatientFullName = (patient: PatientRecord | PersonalDetails | undefined | null): string => {
  if (!patient) return 'Nombre no disponible';
  if ('personalDetails' in patient && patient.personalDetails) { // PatientRecord
    return `${patient.personalDetails.nombres || ''} ${patient.personalDetails.apellidos || ''}`.trim() || 'Nombre no disponible';
  }
  if ('nombres' in patient && 'apellidos' in patient) { // PersonalDetails
     return `${patient.nombres || ''} ${patient.apellidos || ''}`.trim() || 'Nombre no disponible';
  }
  return 'Nombre no disponible';
};


export const calculateAge = (birthDate: string | undefined): string => {
  if (!birthDate) return "N/A";
  try {
    const age = differenceInYears(new Date(), new Date(birthDate));
    return `${age} años`;
  } catch {
    return "N/A";
  }
};

export const getLastConsultationDate = (patient: PatientRecord): string => {
  if (!patient.medicalEncounters || patient.medicalEncounters.length === 0) {
    return "N/A";
  }
  const sortedEncounters = [...patient.medicalEncounters].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return format(new Date(sortedEncounters[0].date), "P", { locale: es });
};

// --- Datos para Perfil del Médico ---
let mockDoctorProfileData: DoctorProfile = {
  id: 'doc123', // Ejemplo
  contactDetails: {
    nombreCompleto: 'Dr. Admin Médico',
    emailContacto: 'admin@medlog.cloud',
    telefonoPrincipal: '0991234567',
    direccionConsultorio: 'Av. Principal 123, Consultorio 401, Quito',
  },
  professionalDetails: {
    especialidadPrincipal: 'Medicina General',
    otrasEspecialidades: 'Endocrinología (en formación)',
    numeroMatricula: 'MSP-12345',
    otrosRegistros: ' Colegio Médico Pichincha: 6789',
    logotipoUrl: "", // Anteriormente en branding
  },
  fiscalDetails: {
    razonSocialFacturacion: 'Admin Médico Servicios Profesionales S.A.S.',
    identificacionTributaria: '1798765432001',
    domicilioFiscalCompleto: 'Av. Amazonas N20-30 y Patria, Edificio MedCenter, Of. 101, Quito, Pichincha, Ecuador',
    condicionIVA: 'Agente de Retención',
  },
  logotipoUrl: undefined, // 'https://placehold.co/200x80.png?text=Mi+Logo', // Placeholder
  driveFolderId: undefined,
  updatedAt: new Date().toISOString(),
};

export const getDoctorProfile = (): DoctorProfile => {
  return { ...mockDoctorProfileData }; // Devuelve una copia
};

export const updateDoctorProfile = (updates: Partial<DoctorProfile>): DoctorProfile => {
  mockDoctorProfileData = {
    ...mockDoctorProfileData,
    ...updates,
    contactDetails: updates.contactDetails ? { ...mockDoctorProfileData.contactDetails, ...updates.contactDetails } : mockDoctorProfileData.contactDetails,
    professionalDetails: updates.professionalDetails ? { ...mockDoctorProfileData.professionalDetails, ...updates.professionalDetails } : mockDoctorProfileData.professionalDetails,
    fiscalDetails: updates.fiscalDetails ? { ...mockDoctorProfileData.fiscalDetails, ...updates.fiscalDetails } : mockDoctorProfileData.fiscalDetails,
    updatedAt: new Date().toISOString(),
  };
  return { ...mockDoctorProfileData };
};


// --- Datos para Facturación ---
export let mockInvoices: Invoice[] = [
  {
    id: 'inv-001',
    invoiceNumber: 'F001-0000001',
    patientId: '1',
    patientName: 'Maria Gonzalez Perez',
    dateIssued: oneWeekAgo,
    dateDue: todayISO,
    items: [
      { id: 'item1', description: 'Consulta Médica General', quantity: 1, unitPrice: 50, total: 50 },
      { id: 'item2', description: 'Examen de Glucosa', quantity: 1, unitPrice: 15, total: 15 },
    ],
    subtotal: 65,
    taxRate: 0.12, // 12% IVA Ecuador (ejemplo)
    taxAmount: 7.80,
    totalAmount: 72.80,
    status: 'emitida',
    doctorFiscalDetailsSnapshot: mockDoctorProfileData.fiscalDetails, // Tomar una instantánea
    updatedAt: oneWeekAgo,
  },
  {
    id: 'inv-002',
    invoiceNumber: 'F001-0000002',
    patientId: '2',
    patientName: 'Carlos Rodriguez Lopez',
    dateIssued: oneMonthAgo,
    dateDue: oneWeekAgo,
    items: [
      { id: 'item3', description: 'Consulta de Seguimiento Hipotiroidismo', quantity: 1, unitPrice: 40, total: 40 },
    ],
    subtotal: 40,
    taxRate: 0.12,
    taxAmount: 4.80,
    totalAmount: 44.80,
    status: 'pagada',
    doctorFiscalDetailsSnapshot: mockDoctorProfileData.fiscalDetails,
    updatedAt: oneMonthAgo,
  }
];

export const getMockInvoices = (): Invoice[] => {
  return [...mockInvoices].sort((a,b) => new Date(b.dateIssued).getTime() - new Date(a.dateIssued).getTime());
};

export const updateInvoiceStatus = (invoiceId: string, newStatus: InvoiceStatus): Invoice | undefined => {
  const invoiceIndex = mockInvoices.findIndex(inv => inv.id === invoiceId);
  if (invoiceIndex !== -1) {
    mockInvoices[invoiceIndex].status = newStatus;
    mockInvoices[invoiceIndex].updatedAt = new Date().toISOString();
    return { ...mockInvoices[invoiceIndex] }; // Return a new object reference
  }
  return undefined;
};


// --- Datos para Gestión de Usuarios Asistenciales ---
export let mockAssistants: AssistantUser[] = [
  {
    id: 'assist-001',
    username: 'perros01', // perez.rosa
    nombreCompleto: 'Rosa Pérez',
    email: 'rosa.perez@example.com',
    estado: 'activo',
    permissions: {
      patients: { canCreate: true, canModifyPersonalAndBilling: true, canAddAttachments: true },
      schedule: { canProgramAppointments: true, canBlockTime: true, canChangeStatus: true, canDeleteAppointments: true },
      billing: { canAccess: true },
    },
    createdAt: threeMonthsAgo,
    lastActivity: yesterday,
  },
  {
    id: 'assist-002',
    username: 'lopjua07', // lopez.juan
    nombreCompleto: 'Juan López',
    email: 'juan.lopez@example.com',
    estado: 'pendiente_aprobacion',
    permissions: { // Permisos por defecto más restrictivos
      patients: { canCreate: false, canModifyPersonalAndBilling: false, canAddAttachments: false },
      schedule: { canProgramAppointments: false, canBlockTime: false, canChangeStatus: false, canDeleteAppointments: false },
      billing: { canAccess: false },
    },
    createdAt: oneWeekAgo,
  },
   {
    id: 'assist-003',
    username: 'sanana03', // sanchez.ana
    nombreCompleto: 'Ana Sánchez',
    email: 'ana.sanchez@example.com',
    estado: 'inactivo',
    permissions: {
      patients: { canCreate: true, canModifyPersonalAndBilling: false, canAddAttachments: false },
      schedule: { canProgramAppointments: true, canBlockTime: false, canChangeStatus: false, canDeleteAppointments: false },
      billing: { canAccess: false },
    },
    createdAt: sixMonthsAgo,
    lastActivity: oneMonthAgo,
  }
];

export const getMockAssistants = (): AssistantUser[] => {
  return [...mockAssistants];
};
