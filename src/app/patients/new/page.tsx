// src/app/patients/new/page.tsx
"use client";

import { PatientForm } from "@/components/patients/PatientForm";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { addPatient, mockAttachments } from "@/lib/mock-data"; // Using mockAttachments for initial example
import type { PatientRecord } from "@/lib/types";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";

export default function NewPatientPage() {
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = (data: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    // In a real app, you'd send this to your backend/Google Sheets
    const newPatient = addPatient(data); 
    console.log("New patient data (mock save):", newPatient);
    toast({
      title: "Patient Record Created",
      description: `${newPatient.name}'s record has been successfully created.`,
      variant: "default", // 'default' variant will use accent color from theme if styled correctly
    });
    router.push(`/patients/${newPatient.id}`); // Redirect to the new patient's detail page
  };

  const initialValues: Partial<PatientRecord> = {
    name: '',
    dateOfBirth: '',
    contactInfo: '',
    medicalHistory: '',
    examinationResults: '',
    treatmentPlans: '',
    attachments: [], // Start with no attachments for a new record
  };

  return (
    <div className="space-y-6">
      <Card className="max-w-4xl mx-auto shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Create New Patient Record</CardTitle>
          <CardDescription>
            Fill in the details below to add a new patient to the system.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PatientForm 
            onSubmit={handleSubmit} 
            initialData={initialValues}
            submitButtonText="Create Patient Record"
          />
        </CardContent>
      </Card>
    </div>
  );
}
