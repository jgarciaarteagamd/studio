// src/app/patients/new/page.tsx
"use client";

import { PatientForm } from "@/components/patients/PatientForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addPatient } from "@/lib/mock-data"; 
import type { PatientRecord } from "@/lib/types";
import { getPatientFullName } from "@/lib/mock-data";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();

  type PatientFormData = Pick<PatientRecord, 'personalDetails' | 'backgroundInformation' | 'datosFacturacion'> & {
    personalDetails: {
      // PatientForm returns fechaNacimiento as a Date object, but the PatientRecord type expects a string.
      // We will convert it to a Date object before passing it to addPatient.
 fechaNacimiento: Date | string | null | undefined;
    };
  };

  // This comment was incorrect based on the error. PatientForm seems to return a Date object.
  type PatientFormDataCorrected = Pick<PatientRecord, 'personalDetails' | 'backgroundInformation' | 'datosFacturacion'> & {
    personalDetails: {
 fechaNacimiento: Date;
    };
  };
  const handleSubmit = (data: PatientFormData) => {
    console.log("Nuevos datos del paciente (guardado simulado):", newPatient);
    toast({
      title: "Historial del Paciente Creado",
      description: `El historial de ${getPatientFullName(newPatient)} ha sido creado exitosamente.`,
      variant: "default", 
    });
    router.push(`/patients/${newPatient.id}`); 
  };

  const initialValues: Partial<PatientRecord> = {
    personalDetails: {
      nombres: '',
      apellidos: '',
      fechaNacimiento: '',
    },
    backgroundInformation: {
      personalHistory: '',
      allergies: '',
      habitualMedication: '',
    },
    attachments: [], 
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Crear Nuevo Historial de Paciente</CardTitle>
          <CardDescription>
            Complete los detalles a continuación para agregar un nuevo paciente al sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm 
            onSubmit={handleSubmit} 
            initialData={initialValues}
            submitButtonText="Crear Historial de Paciente"
          />
        </CardContent>
      </Card>
    </div>
  );
}
