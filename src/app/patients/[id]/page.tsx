// src/app/patients/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { PatientForm } from "@/components/patients/PatientForm";
import { FileUploadSection } from "@/components/patients/FileUploadSection";
import { ReportGenerationSection } from "@/components/patients/ReportGenerationSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import { getPatientById, updatePatient } from "@/lib/mock-data";
import type { PatientRecord, Attachment, PersonalDetails, DatosFacturacion, BackgroundInformation } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileEdit, Paperclip, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, isValid } from "date-fns";
import Link from "next/link";

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false); // State for deletion loading

  const [currentLocale, setCurrentLocale] = useState('es-ES'); // Default to Spanish

  // Helper to get full name, assuming personalDetails has nombres and apellidos
  const getPatientFullName = (patient: PatientRecord | null) => {
    if (!patient?.personalDetails) return "Paciente Desconocido";
    return `${patient.personalDetails.nombres || ''} ${patient.personalDetails.apellidos || ''}`.trim();
  };

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

  // Define the type for data received directly from the form
  interface PatientFormData {
 personalDetails: Omit<PersonalDetails, 'fechaNacimiento'> & { fechaNacimiento: Date };
    datosFacturacion?: DatosFacturacion | null;
    backgroundInformation?: BackgroundInformation | null;
  }

  const handleFormSubmit = async (data: PatientFormData) => {
    const formattedData = {
      ...data,
      personalDetails: data.personalDetails.fechaNacimiento && isValid(new Date(data.personalDetails.fechaNacimiento)) ?
 {
        ...data.personalDetails,
        fechaNacimiento: format(new Date(data.personalDetails.fechaNacimiento), 'yyyy-MM-dd'),
      } :
 {
        ...data.personalDetails,
        fechaNacimiento: format(new Date(data.personalDetails.fechaNacimiento), 'yyyy-MM-dd'), // Should this fallback to data.personalDetails?
      },
    };

    if (patient) {
      const updatedRecord = updatePatient(patient.id, formattedData);
      setPatient(updatedRecord || patient); // Update local state
      toast({
        title: "Historial Actualizado",
        description: `El historial de ${getPatientFullName(patient)} ha sido actualizado exitosamente.`,
      });
    }
  };

  const handleDeleteAttachments = async (attachmentIds: string[]) => {
    if (!patient) return;

    setIsDeleting(true);
    try {
      // Mock deletion: Filter out the attachments to be deleted
      const updatedAttachments = patient.attachments.filter(
        (attachment) => !attachmentIds.includes(attachment.id)
      );

      // Update the patient record with the remaining attachments
      const updatedRecord = updatePatient(patient.id, { attachments: updatedAttachments });
      setPatient(updatedRecord || patient); // Update local state

      toast({
        title: "Archivos Eliminados",
        description: `${attachmentIds.length} archivo(s) adjunto(s) han sido eliminados.`,
      });
    } catch (error) {
      toast({ title: "Error al eliminar", description: "No se pudieron eliminar los archivos.", variant: "destructive" });
    } finally {
      setIsDeleting(false);
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

  // Use conditional rendering within a single return statement
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
          <CardTitle className="text-3xl">{getPatientFullName(patient)}</CardTitle>
          <CardDescription className="text-lg font-medium">
 Fecha de Nacimiento: {new Date(patient.personalDetails.fechaNacimiento).toLocaleDateString(currentLocale)} | Contacto: {patient.personalDetails.telefono1}
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
                onDeleteAttachments={handleDeleteAttachments}
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
