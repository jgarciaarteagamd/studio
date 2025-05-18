// src/app/dashboard/patients/new/page.tsx
"use client";

import { PatientForm } from "@/components/patients/PatientForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addPatient } from "@/lib/mock-data"; 
import type { PatientRecord, PersonalDetails, BackgroundInformation } from "@/lib/types"; 
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Type for the data structure handled by PatientForm
type PatientFormData = {
  personalDetails: PersonalDetails;
  backgroundInformation?: BackgroundInformation | null; // Puede ser null o undefined si no se edita
};

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Simulando el rol de secretaria para la creación:
  // Solo se permite ingresar datos personales.
  // BackgroundInformation se pasará como undefined o vacío.
  const isSecretaryRole = true; // Cambiar esto para simular rol de médico

  const handleSubmit = (data: PatientFormData) => {
    const patientDataForCreation: {
      personalDetails: PersonalDetails;
      backgroundInformation?: BackgroundInformation;
    } = {
      personalDetails: data.personalDetails,
      // Si es secretaria, backgroundInformation no se envía o es un objeto vacío.
      // PatientForm ya maneja no enviar backgroundInformation si allowEditBackgroundInfo es false.
      // Aquí, aseguramos que addPatient reciba la estructura correcta.
      backgroundInformation: data.backgroundInformation || undefined,
    };

    const newPatient = addPatient(patientDataForCreation); 
    
    console.log("Nuevos datos del paciente (guardado simulado):", newPatient);
    toast({
      title: "Historial del Paciente Creado",
      description: `El historial de ${newPatient.personalDetails.name} ha sido creado exitosamente.`,
      variant: "default", 
    });
    router.push(`/dashboard/patients/${newPatient.id}`); 
  };

  // Initial values for the form
  const initialValues: Partial<Pick<PatientRecord, 'personalDetails' | 'backgroundInformation'>> = {
    personalDetails: {
      name: '',
      dateOfBirth: '', 
      contactInfo: '',
    },
    // Para el rol de secretaria, estos campos estarán deshabilitados y no deberían ser llenados.
    // PatientForm controlará la deshabilitación visual.
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
          <CardTitle className="text-3xl">Crear Nuevo Historial de Paciente</CardTitle>
          {isSecretaryRole ? (
            <CardDescription>
              Complete los detalles personales del paciente. Los antecedentes médicos y consultas se gestionarán por el personal médico.
            </CardDescription>
          ) : (
            <CardDescription>
              Complete los detalles personales y antecedentes del paciente. El historial de consultas se gestionará por separado.
            </CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <PatientForm 
            onSubmit={handleSubmit} 
            initialData={initialValues} 
            submitButtonText="Crear Historial de Paciente"
            allowEditBackgroundInfo={!isSecretaryRole} // Secretaria no puede editar antecedentes aquí
          />
        </CardContent>
      </Card>
    </div>
  );
}
