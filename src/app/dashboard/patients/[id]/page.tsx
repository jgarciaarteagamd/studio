// src/app/dashboard/patients/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PatientForm } from "@/components/patients/PatientForm";
import { FileUploadSection } from "@/components/patients/FileUploadSection";
import { ReportGenerationSection } from "@/components/patients/ReportGenerationSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPatientById, updatePatient } from "@/lib/mock-data";
import type { PatientRecord, Attachment, PersonalDetails, BackgroundInformation, MedicalEncounter } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileEdit, Paperclip, Activity, History, PlusCircle, CalendarDays, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";


// Type for the data structure handled by PatientForm
type PatientFormData = {
  personalDetails: PersonalDetails;
  backgroundInformation?: BackgroundInformation | null;
};

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocale, setCurrentLocale] = useState('es-ES');

  // Simulación de rol: true para médico, false para secretaria
  // Esto determinará si se pueden editar antecedentes o añadir consultas.
  const isDoctorRole = true; 

  const patientId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
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
        router.push("/dashboard/patients");
      }
      setIsLoading(false);
    }
  }, [patientId, router, toast]);

  const handleFormSubmit = useCallback((data: PatientFormData) => {
    if (patient) {
      const updatedPatientData: Partial<Omit<PatientRecord, 'id' | 'createdAt'>> = {
        personalDetails: data.personalDetails,
        backgroundInformation: isDoctorRole ? data.backgroundInformation : patient.backgroundInformation, // Secretaria no modifica esto
        medicalEncounters: patient.medicalEncounters,
        attachments: patient.attachments,
        updatedAt: new Date().toISOString(),
      };

      const updatedRecord = updatePatient(patient.id, updatedPatientData);
      setPatient(updatedRecord || patient);
      toast({
        title: "Historial Actualizado",
        description: `El historial de ${patient.personalDetails.name} ha sido actualizado exitosamente.`,
      });
    }
  }, [patient, toast, isDoctorRole]);


  const handleFileUpload = (file: File) => {
    if (patient) {
      const newAttachment: Attachment = {
        id: `attach-${Date.now()}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : (file.type === 'application/pdf' ? 'pdf' : 'other'),
        driveLink: '#', 
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
  
  const handleNavigateToNewConsultation = () => {
    if (patientId) {
      // En un futuro, esto podría llevar a /dashboard/consultations/[patientId]/new o similar
      // Por ahora, un toast informativo.
      toast({
        title: "Registrar Nueva Consulta",
        description: `Para registrar una nueva consulta para ${patient?.personalDetails.name}, diríjase a la sección 'Consultas' del menú. (Funcionalidad en desarrollo).`,
        variant: "default",
        duration: 5000,
      });
      // router.push(`/dashboard/consultations/${patientId}/new`); // Descomentar cuando la página exista
    }
  };


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p>Cargando detalles del paciente...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center">
        <p className="text-xl text-muted-foreground">Paciente no encontrado.</p>
        <Button asChild className="mt-4">
          <Link href="/dashboard/patients">Ir a la Lista de Pacientes</Link>
        </Button>
      </div>
    );
  }
  
  const patientFormInitialData: PatientFormData = {
    personalDetails: patient.personalDetails,
    backgroundInformation: patient.backgroundInformation || { personalHistory: '', allergies: '', habitualMedication: '' },
  };

  return (
    <div className="space-y-6">
       <Button variant="outline" size="sm" asChild className="mb-4">
        <Link href="/dashboard/patients">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a Pacientes
        </Link>
      </Button>
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">{patient.personalDetails.name}</CardTitle>
          <CardDescription>
            Fecha de Nacimiento: {new Date(patient.personalDetails.dateOfBirth).toLocaleDateString(currentLocale)} | Contacto: {patient.personalDetails.contactInfo}
          </CardDescription>
           <Badge variant="secondary" className="w-fit mt-2">
            Última actualización general: {new Date(patient.updatedAt).toLocaleDateString(currentLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
        </CardHeader>
      </Card>

      <Tabs defaultValue="encounters" className="w-full">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 md:max-w-2xl">
          <TabsTrigger value="encounters"><History className="mr-1 h-4 w-4 sm:mr-2"/> Hist. Consultas</TabsTrigger>
          <TabsTrigger value="details"><FileEdit className="mr-1 h-4 w-4 sm:mr-2"/> Editar Datos</TabsTrigger>
          <TabsTrigger value="attachments"><Paperclip className="mr-1 h-4 w-4 sm:mr-2"/> Adjuntos</TabsTrigger>
          {isDoctorRole && ( // Solo el médico ve informes IA
            <TabsTrigger value="reports"><Activity className="mr-1 h-4 w-4 sm:mr-2"/> Informes IA</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="encounters">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Historial de Consultas Médicas</CardTitle>
                {isDoctorRole && ( // Solo el médico puede añadir consultas desde aquí (o se le indica ir a la sección)
                  <Button onClick={handleNavigateToNewConsultation} size="sm">
                    <Stethoscope className="mr-2 h-4 w-4" /> 
                    Registrar Nueva Consulta
                  </Button>
                )}
              </div>
              <CardDescription>Revise las consultas anteriores del paciente. La más reciente primero.</CardDescription>
            </CardHeader>
            <CardContent>
              {patient.medicalEncounters && patient.medicalEncounters.length > 0 ? (
                <ScrollArea className="h-[600px] pr-4"> 
                  <div className="space-y-4">
                    {[...patient.medicalEncounters].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(encounter => (
                      <Card key={encounter.id} className="shadow-md">
                        <CardHeader>
                          <CardTitle className="text-lg flex items-center">
                            <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                            Consulta del: {format(new Date(encounter.date), "PPP", { locale: es })}
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm whitespace-pre-wrap">{encounter.details}</p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <p className="text-muted-foreground text-center py-6">No hay consultas registradas para este paciente.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="details">
          <Card>
            <CardHeader>
              <CardTitle>Editar Datos del Paciente</CardTitle>
              <CardDescription>
                {isDoctorRole 
                  ? "Actualice los datos personales y antecedentes del paciente."
                  : "Actualice los datos personales del paciente. Los antecedentes solo pueden ser modificados por personal médico."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientForm 
                onSubmit={handleFormSubmit} 
                initialData={patientFormInitialData}
                submitButtonText="Guardar Cambios"
                allowEditBackgroundInfo={isDoctorRole} // Secretaria no puede editar antecedentes
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="attachments">
          <Card>
            <CardHeader>
              <CardTitle>Archivos Adjuntos</CardTitle>
              <CardDescription>Administre archivos vinculados a este paciente.</CardDescription>
            </CardHeader>
            <CardContent>
              <FileUploadSection 
                attachments={patient.attachments} 
                onFileUpload={handleFileUpload} 
              />
            </CardContent>
          </Card>
        </TabsContent>

        {isDoctorRole && (
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
        )}
      </Tabs>
    </div>
  );
}
