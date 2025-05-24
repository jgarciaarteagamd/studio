// src/app/dashboard/patients/new/page.tsx
"use client";

import { PatientForm, type PatientFormValues } from "@/components/patients/PatientForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SIMULATED_CURRENT_ROLE, SIMULATED_SECRETARY_PERMISSIONS, getPatientFullName } from "@/lib/mock-data";
import type { PersonalDetails, BackgroundInformation, DatosFacturacion } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createPatientRecord } from "@/app/actions/patient-actions"; // Import Server Action

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();

  const isDoctor = SIMULATED_CURRENT_ROLE === 'doctor';
  const canSecretaryCreate = SIMULATED_CURRENT_ROLE === 'secretary' && SIMULATED_SECRETARY_PERMISSIONS.patients.canCreate;

  const handleSubmit = async (data: PatientFormValues) => { // Make async
    const patientDataForCreation: {
      personalDetails: PersonalDetails;
      datosFacturacion?: DatosFacturacion | null;
      backgroundInformation?: BackgroundInformation | null;
    } = {
      personalDetails: data.personalDetails,
      // Ensure optional fields are passed correctly, even if empty objects from form
      datosFacturacion: (data.datosFacturacion && Object.values(data.datosFacturacion).some(val => val && val !== '')) 
        ? data.datosFacturacion 
        : null,
      backgroundInformation: (isDoctor && data.backgroundInformation && Object.values(data.backgroundInformation).some(val => val && val !== ''))
        ? data.backgroundInformation 
        : null,
    };

    const newPatient = await createPatientRecord(patientDataForCreation); // Call Server Action

    if (newPatient) {
      toast({
        title: "Paciente Agregado",
        description: `El historial de ${getPatientFullName(newPatient)} ha sido creado exitosamente.`,
        variant: "default",
      });
      router.push(`/dashboard/patients/${newPatient.id}`);
    } else {
      toast({
        title: "Error al Agregar Paciente",
        description: "No se pudo crear el paciente. Intente nuevamente.",
        variant: "destructive",
      });
    }
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
            showBackgroundInformationSection={isDoctor}
            allowEditFacturacionInfo={isDoctor || (SIMULATED_CURRENT_ROLE === 'secretary' && SIMULATED_SECRETARY_PERMISSIONS.patients.canModifyPersonalAndBilling)}
            allowEditBackgroundInfo={isDoctor}
          />
        </CardContent>
      </Card>
    </div>
  );
}
