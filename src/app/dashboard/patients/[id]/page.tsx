
// src/app/dashboard/patients/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PatientForm, type PatientFormValues } from "@/components/patients/PatientForm";
import { FileUploadSection } from "@/components/patients/FileUploadSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getPatientById, updatePatient, getPatientFullName, calculateAge, SIMULATED_CURRENT_ROLE, SIMULATED_SECRETARY_PERMISSIONS } from "@/lib/mock-data";
import type { PatientRecord, Attachment, PersonalDetails, BackgroundInformation, MedicalEncounter, DatosFacturacion } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileEdit, Paperclip, History, Stethoscope, User, FileTextIcon, BuildingIcon, PhoneCall, Download, CalendarDays, ClipboardList, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { es } from 'date-fns/locale';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";


export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocale, setCurrentLocale] = useState('es-ES');
  const [patientAge, setPatientAge] = useState<string | null>(null);
  const [isAttachmentDialogOpen, setIsAttachmentDialogOpen] = useState(false);

  const isDoctor = SIMULATED_CURRENT_ROLE === 'doctor';
  const secretaryPermissions = SIMULATED_SECRETARY_PERMISSIONS;

  const patientId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    setCurrentLocale(navigator.language || 'es-ES');
    if (patientId) {
      const fetchedPatient = getPatientById(patientId as string);
      if (fetchedPatient) {
        setPatient(fetchedPatient);
        setPatientAge(calculateAge(fetchedPatient.personalDetails.fechaNacimiento));
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

  const handleFormSubmit = useCallback((data: Partial<PatientFormValues>) => {
    if (patient) {
      const updatedPatientData: Partial<Omit<PatientRecord, 'id' | 'createdAt'>> = {
        personalDetails: data.personalDetails !== undefined ? data.personalDetails : patient.personalDetails,
        datosFacturacion: data.datosFacturacion !== undefined ? data.datosFacturacion : patient.datosFacturacion,
        backgroundInformation: data.backgroundInformation !== undefined ? data.backgroundInformation : patient.backgroundInformation,
        updatedAt: new Date().toISOString(),
      };

      const updatedRecord = updatePatient(patient.id, updatedPatientData);
      if (updatedRecord) {
        setPatient({...updatedRecord});
        setPatientAge(calculateAge(updatedRecord.personalDetails.fechaNacimiento));
         toast({
          title: "Historial Actualizado",
          description: `El historial de ${getPatientFullName(updatedRecord)} ha sido actualizado exitosamente.`,
        });
      } else {
        toast({
          title: "Error",
          description: "No se pudo actualizar el historial.",
          variant: "destructive",
        });
      }
    }
  }, [patient, toast]);


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
      if (updatedRecord) {
        setPatient({...updatedRecord}); 
      }
      toast({
        title: "Archivo Adjuntado",
        description: `${file.name} ha sido adjuntado.`,
      });
    }
  };

  const handleDeleteAttachments = (attachmentIdsToDelete: string[]) => {
    if (patient) {
      const currentAttachments = patient.attachments || [];
      const updatedAttachments = currentAttachments.filter(
        (att) => !attachmentIdsToDelete.includes(att.id)
      );
      const updatedRecord = updatePatient(patient.id, { attachments: updatedAttachments });
      if (updatedRecord) {
        setPatient({ ...updatedRecord }); 
        toast({
          title: "Adjuntos Eliminados",
          description: `${attachmentIdsToDelete.length} archivo(s) ha(n) sido eliminado(s) (simulado).`,
        });
      } else {
         toast({
          title: "Error",
          description: "No se pudieron eliminar los adjuntos.",
          variant: "destructive",
        });
      }
    }
  };


  const handleNavigateToNewConsultation = () => {
    router.push('/dashboard/consultations/new');
  };

  const handleDownloadConsultationPdf = (encounter: MedicalEncounter, patientName: string) => {
    let pdfContent = `== CONSULTA MÉDICA ==\n\n`;
    pdfContent += `Paciente: ${patientName}\n`;
    pdfContent += `Fecha de Consulta: ${format(new Date(encounter.date), "PPP", { locale: es })}\n\n`;
    pdfContent += `Detalles de la Consulta:\n${encounter.details}\n\n`;
    pdfContent += `\n\nFirma del Médico:\n_________________________`;
    alert("Descarga de Consulta Específica (simulada):\n\n" + pdfContent);
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

  const patientFormInitialData: PatientFormValues = {
    personalDetails: patient.personalDetails,
    datosFacturacion: patient.datosFacturacion || { ruc: '', direccionFiscal: '', telefonoFacturacion: '', emailFacturacion: '' },
    backgroundInformation: patient.backgroundInformation || { personalHistory: '', allergies: '', habitualMedication: '' },
  };
  
  const canSecretaryModifyPatientData = SIMULATED_CURRENT_ROLE === 'secretary' && secretaryPermissions.patients.canModifyPersonalAndBilling;
  const canSecretaryManageAttachments = SIMULATED_CURRENT_ROLE === 'secretary' && secretaryPermissions.patients.canAddAttachments;

  const numDoctorTabs = 4; // Datos, Antecedentes, Historial, Adjuntos
  const numSecretaryTabs = 1 + (canSecretaryManageAttachments ? 1 : 0); // Datos + Adjuntos (si tiene permiso)
  const gridColsClass = isDoctor ? `md:grid-cols-${numDoctorTabs}` : `md:grid-cols-${numSecretaryTabs}`;


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
          <CardTitle className="text-3xl">{getPatientFullName(patient)}</CardTitle>
          <div className="text-sm text-muted-foreground space-y-1 mt-1">
            {patient.personalDetails.documentoIdentidad && (
                <p className="flex items-center"><FileTextIcon className="mr-2 h-4 w-4 text-primary/70" /> Doc. Identidad: {patient.personalDetails.documentoIdentidad}</p>
            )}
            {patientAge && (
             <p className="flex items-center"><CalendarDays className="mr-2 h-4 w-4 text-primary/70" /> Edad: {patientAge}</p>
            )}
            {patient.personalDetails.email && (<p className="flex items-center"><User className="mr-2 h-4 w-4 text-primary/70" /> Email: {patient.personalDetails.email}</p>)}
            {patient.personalDetails.telefono1 && (<p className="flex items-center"><PhoneCall className="mr-2 h-4 w-4 text-primary/70" /> Teléfono móvil: {patient.personalDetails.telefono1}</p>)}
            {patient.personalDetails.telefono2 && (<p className="flex items-center"><PhoneCall className="mr-2 h-4 w-4 text-primary/70" /> Teléfono opcional: {patient.personalDetails.telefono2}</p>)}
          </div>
          {patient.datosFacturacion && (patient.datosFacturacion.ruc || patient.datosFacturacion.direccionFiscal) && (
            <>
              <Separator className="my-3" />
              <div className="pb-2">
                <h4 className="text-sm font-medium mb-2 flex items-center"><BuildingIcon className="mr-2 h-4 w-4 text-primary/70" /> Datos de Facturación Rápidos</h4>
                <div className="text-xs text-muted-foreground space-y-0.5">
                    {patient.datosFacturacion.ruc && <p>RUC: {patient.datosFacturacion.ruc}</p>}
                    {patient.datosFacturacion.direccionFiscal && <p>Dirección: {patient.datosFacturacion.direccionFiscal}</p>}
                </div>
              </div>
            </>
          )}
           <Badge variant="secondary" className="w-fit mt-4">
            Última actualización general: {new Date(patient.updatedAt).toLocaleDateString(currentLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
        </CardHeader>
      </Card>

      <Tabs defaultValue="personalData" className="w-full max-w-5xl mx-auto">
         <TabsList className={cn(
            "w-full h-auto mb-4 p-1 bg-muted rounded-md",
            "grid grid-cols-2 sm:flex sm:flex-wrap sm:justify-start gap-1",
             isDoctor ? "md:grid-cols-4" : (canSecretaryManageAttachments ? "md:grid-cols-2" : "md:grid-cols-1")
            )}>
          <TabsTrigger value="personalData" className="flex-grow md:flex-grow-0"><FileEdit className="mr-1 h-4 w-4 sm:mr-2"/> Datos</TabsTrigger>
          {isDoctor && (
            <>
              <TabsTrigger value="backgroundInfo" className="flex-grow md:flex-grow-0"><ClipboardList className="mr-1 h-4 w-4 sm:mr-2"/> Antecedentes</TabsTrigger>
              <TabsTrigger value="encounters" className="flex-grow md:flex-grow-0"><History className="mr-1 h-4 w-4 sm:mr-2"/> Historial</TabsTrigger>
            </>
          )}
          {(isDoctor || canSecretaryManageAttachments) && (
              <TabsTrigger value="attachments" className="flex-grow md:flex-grow-0"><Paperclip className="mr-1 h-4 w-4 sm:mr-2"/> Adjuntos</TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="personalData">
          <Card className="w-full">
            <CardHeader>
              <CardTitle>Información Personal y de Facturación</CardTitle>
              <CardDescription>
                Actualice los datos personales, de contacto y facturación del paciente.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientForm
                onSubmit={handleFormSubmit}
                initialData={patientFormInitialData}
                submitButtonText="Guardar Cambios"
                showPersonalDetailsSection={true}
                showDatosFacturacionSection={true}
                allowEditFacturacionInfo={isDoctor || canSecretaryModifyPatientData}
                showBackgroundInformationSection={false} // Antecedentes se manejan en su propia pestaña para el médico
                allowEditBackgroundInfo={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {isDoctor && (
           <TabsContent value="backgroundInfo">
             <Card className="w-full">
               <CardHeader>
                 <CardTitle>Antecedentes y Medicación Habitual</CardTitle>
                 <CardDescription>Actualice los antecedentes personales, alergias y medicación habitual del paciente.</CardDescription>
               </CardHeader>
               <CardContent>
                 <PatientForm
                   onSubmit={handleFormSubmit}
                   initialData={patientFormInitialData}
                   submitButtonText="Guardar Antecedentes"
                   showPersonalDetailsSection={false}
                   showDatosFacturacionSection={false}
                   showBackgroundInformationSection={true}
                   allowEditBackgroundInfo={true} // Solo médico puede editar aquí
                 />
               </CardContent>
             </Card>
           </TabsContent>
        )}


        {isDoctor && (
            <TabsContent value="encounters">
              <Card className="w-full">
                <CardHeader>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <CardTitle>Historial</CardTitle>
                    <Button onClick={handleNavigateToNewConsultation} size="sm">
                      <Stethoscope className="mr-2 h-4 w-4" />
                      Nueva Consulta
                    </Button>
                  </div>
                  <CardDescription>Revise las consultas anteriores del paciente. La más reciente primero.</CardDescription>
                </CardHeader>
                <CardContent>
                  {patient.medicalEncounters && patient.medicalEncounters.length > 0 ? (
                    <ScrollArea className="h-[600px] pr-4">
                      <div className="space-y-6">
                        {[...patient.medicalEncounters]
                          .sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                          .map((encounter, index) => (
                          <Card key={encounter.id} className="shadow-md">
                            <CardHeader className="pb-3">
                              <div className="flex justify-between items-center">
                                <CardTitle className="text-lg flex items-center">
                                  <CalendarDays className="mr-2 h-5 w-5 text-primary" />
                                  Consulta del: {format(new Date(encounter.date), "PPP", { locale: es })}
                                </CardTitle>
                                <Button
                                    variant="outline"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => handleDownloadConsultationPdf(encounter, getPatientFullName(patient))}
                                    title="Descargar Consulta (Simulado)"
                                >
                                    <Download className="h-4 w-4" />
                                </Button>
                              </div>
                            </CardHeader>
                            <CardContent>
                              {index === 0 ? (
                                <p className="text-sm whitespace-pre-wrap">{encounter.details}</p>
                              ) : (
                                <p className="text-sm whitespace-pre-wrap truncate line-clamp-3 hover:line-clamp-none transition-all duration-300 ease-in-out">
                                  {encounter.details.split('\n\n')[0]}
                                </p>
                              )}
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
        )}

        {(isDoctor || canSecretaryManageAttachments) && (
            <TabsContent value="attachments">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Archivos Adjuntos</CardTitle>
                  <CardDescription>Administre archivos vinculados a este paciente.</CardDescription>
                </CardHeader>
                <CardContent className="overflow-hidden">
                  <Dialog open={isAttachmentDialogOpen} onOpenChange={setIsAttachmentDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline">
                        <FolderOpen className="mr-2 h-4 w-4" /> Gestionar Archivos Adjuntos ({patient.attachments.length})
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-3xl max-h-[80vh] flex flex-col">
                      <DialogHeader>
                        <DialogTitle>Archivos Adjuntos de {getPatientFullName(patient)}</DialogTitle>
                        <DialogDescription>
                          Suba nuevos archivos o elimine existentes. Los archivos se guardarán en su Google Drive.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex-1 overflow-y-auto min-h-0">
                        <FileUploadSection
                          attachments={patient.attachments}
                          onFileUpload={handleFileUpload}
                          onDeleteAttachments={handleDeleteAttachments}
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                </CardContent>
              </Card>
            </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

