// src/app/dashboard/patients/new/page.tsx (Anteriormente src/app/patients/new/page.tsx)
"use client";

import { PatientForm } from "@/components/patients/PatientForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addPatient } from "@/lib/mock-data"; 
import type { PatientRecord } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (data: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt' | 'attachments'>) => {
    const newPatient = addPatient(data); 
    console.log("Nuevos datos del paciente (guardado simulado):", newPatient);
    toast({
      title: "Historial del Paciente Creado",
      description: `El historial de ${newPatient.name} ha sido creado exitosamente.`,
      variant: "default", 
    });
    router.push(`/dashboard/patients/${newPatient.id}`); 
  };

  const initialValues: Partial<PatientRecord> = {
    name: '',
    dateOfBirth: '',
    contactInfo: '',
    medicalHistory: '',
    examinationResults: '',
    treatmentPlans: '',
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
