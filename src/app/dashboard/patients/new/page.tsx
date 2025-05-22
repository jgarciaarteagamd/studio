
// src/app/dashboard/patients/new/page.tsx
"use client";

import { PatientForm, type PatientFormValues } from "@/components/patients/PatientForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addPatient, getPatientFullName, SIMULATED_CURRENT_ROLE, SIMULATED_SECRETARY_PERMISSIONS } from "@/lib/mock-data";
import type { PatientRecord, PersonalDetails, BackgroundInformation, DatosFacturacion } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();

  const isDoctor = SIMULATED_CURRENT_ROLE === 'doctor';
  const canSecretaryCreate = SIMULATED_CURRENT_ROLE === 'secretary' && SIMULATED_SECRETARY_PERMISSIONS.patients.canCreate;

  const handleSubmit = (data: PatientFormValues) => {
    const patientDataForCreation: {
      personalDetails: PersonalDetails;
      datosFacturacion?: DatosFacturacion;
      backgroundInformation?: BackgroundInformation;
    } = {
      personalDetails: data.personalDetails,
      datosFacturacion: data.datosFacturacion, 
      backgroundInformation: isDoctor ? data.backgroundInformation : undefined,
    };

    const newPatient = addPatient(patientDataForCreation);

    toast({
      title: "Paciente Agregado",
      description: `El historial de ${getPatientFullName(newPatient)} ha sido creado exitosamente.`,
      variant: "default",
    });
    router.push(`/dashboard/patients/${newPatient.id}`);
  };

  const initialValues: PatientFormValues = {
    personalDetails: {
      nombres: '',
      apellidos: '',
      documentoIdentidad: '',
      fechaNacimiento: undefined as unknown as Date, 
      telefono1: '',
      telefono2: '',
      email: '',
    },
    datosFacturacion: {
      ruc: '',
      direccionFiscal: '',
      telefonoFacturacion: '',
      emailFacturacion: '',
    },
    backgroundInformation: {
      personalHistory: '',
      allergies: '',
      habitualMedication: '',
    },
  };

  if (!isDoctor && !canSecretaryCreate) {
    return (
      <div className="space-y-6">
        <Card className="max-w-4xl mx-auto shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl">Acceso Denegado</CardTitle>
          </CardHeader>
          <CardContent>
            <p>No tiene permisos para agregar nuevos pacientes.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Agregar Nuevo Paciente</CardTitle>
          {isDoctor ? (
            <CardDescription>
              Complete todos los detalles del paciente. El historial de consultas y recetas se gestionará por separado.
            </CardDescription>
          ) : ( // Secretaria
            <CardDescription>
              Complete los datos personales, de contacto y (opcionalmente) de facturación del paciente. Los antecedentes médicos y el historial clínico serán gestionados por el personal médico.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <PatientForm
            onSubmit={handleSubmit}
            initialData={initialValues as any} 
            submitButtonText="Agregar Paciente"
            showPersonalDetailsSection={true}
            showDatosFacturacionSection={true}
            showBackgroundInformationSection={isDoctor} // Solo el médico ve esta sección al crear
            allowEditFacturacionInfo={isDoctor || (SIMULATED_CURRENT_ROLE === 'secretary' && SIMULATED_SECRETARY_PERMISSIONS.patients.canModifyPersonalAndBilling)}
            allowEditBackgroundInfo={isDoctor}
          />
        </CardContent>
      </Card>
    </div>
  );
}

