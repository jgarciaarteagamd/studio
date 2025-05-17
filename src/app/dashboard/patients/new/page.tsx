// src/app/dashboard/patients/new/page.tsx
"use client";

import { PatientForm } from "@/components/patients/PatientForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addPatient } from "@/lib/mock-data"; 
import type { PatientRecord, PersonalDetails, BackgroundInformation } from "@/lib/types"; // Updated types
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

// Type for the data structure handled by PatientForm
type PatientFormData = {
  personalDetails: PersonalDetails;
  backgroundInformation: BackgroundInformation;
};

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (data: PatientFormData) => {
    // addPatient now expects an object with personalDetails and backgroundInformation
    const newPatient = addPatient({
      personalDetails: data.personalDetails,
      backgroundInformation: data.backgroundInformation,
    }); 
    
    console.log("Nuevos datos del paciente (guardado simulado):", newPatient);
    toast({
      title: "Historial del Paciente Creado",
      description: `El historial de ${newPatient.personalDetails.name} ha sido creado exitosamente.`,
      variant: "default", 
    });
    router.push(`/dashboard/patients/${newPatient.id}`); 
  };

  // Initial values for the form, matching the structure PatientForm expects
  const initialValues: Partial<Pick<PatientRecord, 'personalDetails' | 'backgroundInformation'>> = {
    personalDetails: {
      name: '',
      dateOfBirth: '', 
      contactInfo: '',
    },
    backgroundInformation: {
      personalHistory: '',
      allergies: '',
      habitualMedication: '',
    },
    // medicalEncounters and attachments are not part of this form's initial data
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Crear Nuevo Historial de Paciente</CardTitle>
          <CardDescription>
            Complete los detalles personales y antecedentes del paciente a continuación. El historial de consultas se gestionará por separado.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm 
            onSubmit={handleSubmit} 
            initialData={initialValues} // Pass the correctly structured initial data
            submitButtonText="Crear Historial de Paciente"
          />
        </CardContent>
      </Card>
    </div>
  );
}
