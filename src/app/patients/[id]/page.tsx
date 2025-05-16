// src/app/patients/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PatientForm } from "@/components/patients/PatientForm";
import { FileUploadSection } from "@/components/patients/FileUploadSection";
import { ReportGenerationSection } from "@/components/patients/ReportGenerationSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPatientById, updatePatient } from "@/lib/mock-data";
import type { PatientRecord, Attachment } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileEdit, Paperclip, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocale, setCurrentLocale] = useState('es-ES'); // Default to Spanish

  const patientId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    // Set locale from browser, fallback to Spanish
    setCurrentLocale(navigator.language || 'es-ES');

    if (patientId) {
      const fetchedPatient = getPatientById(patientId as string);
      if (fetchedPatient) {
        setPatient(fetchedPatient);
      } else {
        toast({
          title: "Error",
          description: "Historial del paciente no encontrado.",
          variant: "destructive",
        });
        router.push("/patients");
      }
      setIsLoading(false);
    }
  }, [patientId, router, toast]);

  const handleFormSubmit = (data: Omit<PatientRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (patient) {
      const updatedRecord = updatePatient(patient.id, data);
      setPatient(updatedRecord || patient); // Update local state
      toast({
        title: "Historial Actualizado",
        description: `El historial de ${patient.name} ha sido actualizado exitosamente.`,
      });
    }
  };

  const handleFileUpload = (file: File) => {
    // Mock file upload
    if (patient) {
      const newAttachment: Attachment = {
        id: `attach-${Date.now()}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : (file.type === 'application/pdf' ? 'pdf' : 'other'),
        driveLink: '#', // Placeholder
        uploadedAt: new Date().toISOString(),
      };
      const updatedAttachments = [...patient.attachments, newAttachment];
      const updatedRecord = updatePatient(patient.id, { attachments: updatedAttachments });
      setPatient(updatedRecord || patient);
      toast({
        title: "Archivo Adjuntado",
        description: `${file.name} ha sido adjuntado.`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando detalles del paciente...</p> {/* Replace with Skeleton loader */}
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center">
        <p className="text-xl text-muted-foreground">Paciente no encontrado.</p>
        <Button asChild className="mt-4">
          <Link href="/patients">Ir a la Lista de Pacientes</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
       <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/patients">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Pacientes
        </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">{patient.name}</CardTitle>
          <CardDescription>
            Fecha de Nacimiento: {new Date(patient.dateOfBirth).toLocaleDateString(currentLocale)} | Contacto: {patient.contactInfo}
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="details" className="w-full">
        <TabsList className="grid w-full grid-cols-3 md:max-w-md">
          <TabsTrigger value="details"><FileEdit className="mr-1 h-4 w-4 sm:mr-2"/> Detalles</TabsTrigger>
          <TabsTrigger value="attachments"><Paperclip className="mr-1 h-4 w-4 sm:mr-2"/> Adjuntos</TabsTrigger>
          <TabsTrigger value="reports"><Activity className="mr-1 h-4 w-4 sm:mr-2"/> Informes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Editar Historial del Paciente</CardTitle>
              <CardDescription>Actualice la información del paciente a continuación.</CardDescription>
            </CardHeader>
            <CardContent>
              <PatientForm 
                onSubmit={handleFormSubmit} 
                initialData={patient}
                submitButtonText="Guardar Cambios"
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle>Archivos Adjuntos</CardTitle>
              <CardDescription>Administre archivos como resultados de laboratorio o escaneos de imágenes vinculados a este paciente.</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploadSection 
                attachments={patient.attachments} 
                onFileUpload={handleFileUpload} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle>Informes con IA</CardTitle>
              <CardDescription>Genere resúmenes e informes completos para este paciente.</CardDescription>
            </CardHeader>
            <CardContent>
              <ReportGenerationSection patient={patient} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
