
// src/app/dashboard/patients/new/page.tsx
"use client";

import { PatientForm, type PatientFormValues } from "@/components/patients/PatientForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SIMULATED_CURRENT_ROLE, SIMULATED_SECRETARY_PERMISSIONS, getPatientFullName } from "@/lib/mock-data";
import type { PersonalDetails, BackgroundInformation, DatosFacturacion } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import { createPatientRecord } from "@/app/actions/patient-actions"; // Import Server Action
import { PlusCircle, Users } from "lucide-react";

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();

  const isDoctor = SIMULATED_CURRENT_ROLE === 'doctor';
  const isSecretary = SIMULATED_CURRENT_ROLE === 'secretary';
  const canSecretaryCreate = isSecretary && SIMULATED_SECRETARY_PERMISSIONS.patients.canCreate;
  const canSecretaryEditBilling = isSecretary && SIMULATED_SECRETARY_PERMISSIONS.patients.canModifyPersonalAndBilling;


  const handleSubmit = async (data: PatientFormValues) => { 
    const patientDataForCreation: {
      personalDetails: PersonalDetails;
      datosFacturacion?: DatosFacturacion | null;
      backgroundInformation?: BackgroundInformation | null;
    } = {
      personalDetails: {
        ...data.personalDetails,
        fechaNacimiento: new Date(data.personalDetails.fechaNacimiento).toISOString().split('T')[0], // Convert Date to YYYY-MM-DD string
      },
      datosFacturacion: (data.datosFacturacion && Object.values(data.datosFacturacion).some(val => val && val !== '')) 
        ? data.datosFacturacion 
        : null,
      backgroundInformation: (isDoctor && data.backgroundInformation && Object.values(data.backgroundInformation).some(val => val && val !== ''))
        ? data.backgroundInformation 
        : null,
    };

    const newPatient = await createPatientRecord(patientDataForCreation); 

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
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        <Card className="w-full shadow-lg">
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
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <Card className="w-full shadow-lg">
        <CardHeader className="p-6">
           <div className="flex items-center gap-3 mb-2">
            <PlusCircle className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Agregar Nuevo Paciente</CardTitle>
          </div>
          {isDoctor ? (
            <CardDescription>
              Complete todos los detalles del paciente. El historial de consultas y recetas se gestionará por separado.
            </CardDescription>
          ) : ( 
            <CardDescription>
              Complete los datos personales, de contacto y (opcionalmente) de facturación del paciente. Los antecedentes médicos y el historial clínico serán gestionados por el personal médico.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="p-6 pt-0">
          <PatientForm
            onSubmit={handleSubmit}
            initialData={initialValues as any} 
            submitButtonText="Agregar Paciente"
            showPersonalDetailsSection={true}
            showDatosFacturacionSection={true}
            showBackgroundInformationSection={isDoctor} 
            allowEditFacturacionInfo={isDoctor || canSecretaryEditBilling} 
            allowEditBackgroundInfo={isDoctor} 
          />
        </CardContent>
      </Card>
    </div>
  );
}
