
// src/app/dashboard/patients/new/page.tsx
"use client";

import { PatientForm, type PatientFormValues } from "@/components/patients/PatientForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addPatient, getPatientFullName } from "@/lib/mock-data";
import type { PatientRecord, PersonalDetails, BackgroundInformation, DatosFacturacion } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Simulación de rol
  const SIMULATED_ROLE = 'secretary'; // Cambiar a 'doctor' para probar

  const handleSubmit = (data: PatientFormValues) => {
    // Secretaria puede enviar datos personales, de contacto y facturación (opcional).
    // BackgroundInformation solo si es médico.
    const patientDataForCreation: {
      personalDetails: PersonalDetails;
      datosFacturacion?: DatosFacturacion;
      backgroundInformation?: BackgroundInformation;
    } = {
      personalDetails: data.personalDetails,
      datosFacturacion: data.datosFacturacion, // Permitir siempre, los campos internos son opcionales
      backgroundInformation: SIMULATED_ROLE === 'doctor' ? data.backgroundInformation : undefined,
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
      fechaNacimiento: undefined as unknown as Date, // Forcing type for initial state
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

  return (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Agregar Nuevo Paciente</CardTitle>
          {SIMULATED_ROLE === 'secretary' ? (
            <CardDescription>
              Complete los datos personales, de contacto y facturación (opcional) del paciente. Los antecedentes médicos se gestionarán por personal médico.
            </CardDescription>
          ) : ( // Doctor
            <CardDescription>
              Complete todos los detalles del paciente. El historial de consultas se gestionará por separado.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <PatientForm
            onSubmit={handleSubmit}
            initialData={initialValues as any} // Cast to any to satisfy PatientForm's initialData prop type
            submitButtonText="Agregar Paciente"
            allowEditBackgroundInfo={SIMULATED_ROLE === 'doctor'}
            allowEditFacturacionInfo={true} // Permitir a la secretaria ingresar datos de facturación al crear
          />
        </CardContent>
      </Card>
    </div>
  );
}
