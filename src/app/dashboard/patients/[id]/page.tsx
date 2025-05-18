// src/app/dashboard/patients/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { PatientForm, type PatientFormValues } from "@/components/patients/PatientForm";
import { FileUploadSection } from "@/components/patients/FileUploadSection";
import { ReportGenerationSection } from "@/components/patients/ReportGenerationSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getPatientById, updatePatient, getPatientFullName } from "@/lib/mock-data";
import type { PatientRecord, Attachment, PersonalDetails, BackgroundInformation, MedicalEncounter, DatosFacturacion } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, FileEdit, Paperclip, Activity, History, PlusCircle, CalendarDays, Stethoscope, User, FileTextIcon, BuildingIcon, PhoneCall } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format, differenceInYears } from "date-fns";
import { es } from 'date-fns/locale';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";


// Type for the data structure handled by PatientForm
// PatientFormValues is imported from PatientForm

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [patient, setPatient] = useState<PatientRecord | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentLocale, setCurrentLocale] = useState('es-ES');
  const [calculatedAge, setCalculatedAge] = useState<string | null>(null);

  // Simulación de rol: true para médico, false para secretaria
  // Esto determinará si se pueden editar antecedentes o añadir consultas.
  const SIMULATED_ROLE = 'doctor'; // Cambiar a 'secretary' para probar


  const patientId = Array.isArray(params.id) ? params.id[0] : params.id;

  useEffect(() => {
    setCurrentLocale(navigator.language || 'es-ES');
    if (patientId) {
      const fetchedPatient = getPatientById(patientId as string);
      if (fetchedPatient) {
        setPatient(fetchedPatient);
        if (fetchedPatient.personalDetails.fechaNacimiento) {
            try {
                const age = differenceInYears(new Date(), new Date(fetchedPatient.personalDetails.fechaNacimiento));
                setCalculatedAge(`${age} años`);
            } catch (e) {
                console.error("Error calculating age from date:", fetchedPatient.personalDetails.fechaNacimiento);
                setCalculatedAge("Edad no disponible");
            }
        } else {
             setCalculatedAge("Edad no disponible");
        }
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

  const handleFormSubmit = useCallback((data: PatientFormValues) => {
    if (patient) {
      const updatedPatientData: Partial<Omit<PatientRecord, 'id' | 'createdAt'>> = {
        personalDetails: data.personalDetails,
        datosFacturacion: SIMULATED_ROLE === 'doctor' ? data.datosFacturacion : patient.datosFacturacion,
        backgroundInformation: SIMULATED_ROLE === 'doctor' ? data.backgroundInformation : patient.backgroundInformation,
        medicalEncounters: patient.medicalEncounters,
        attachments: patient.attachments,
        updatedAt: new Date().toISOString(),
      };

      const updatedRecord = updatePatient(patient.id, updatedPatientData);
      if (updatedRecord) {
        setPatient(updatedRecord); // Actualizar estado local con el paciente completamente actualizado
         if (updatedRecord.personalDetails.fechaNacimiento) {
            const age = differenceInYears(new Date(), new Date(updatedRecord.personalDetails.fechaNacimiento));
            setCalculatedAge(`${age} años`);
        }
      }
      
      toast({
        title: "Historial Actualizado",
        description: `El historial de ${getPatientFullName(updatedRecord || patient)} ha sido actualizado exitosamente.`,
      });
    }
  }, [patient, toast, SIMULATED_ROLE]);


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
      if (updatedRecord) setPatient(updatedRecord);
      toast({
        title: "Archivo Adjuntado",
        description: `${file.name} ha sido adjuntado.`,
      });
    }
  };
  
  const handleNavigateToNewConsultation = () => {
    if (patientId) {
      toast({
        title: "Registrar Nueva Consulta",
        description: `Para registrar una nueva consulta para ${getPatientFullName(patient!)}, diríjase a la sección 'Consultas' del menú. (Funcionalidad en desarrollo).`,
        variant: "default",
        duration: 5000,
      });
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
  
  const patientFormInitialData: PatientFormValues = {
    personalDetails: patient.personalDetails,
    datosFacturacion: patient.datosFacturacion || { ruc: '', direccionFiscal: '', telefonoFacturacion: '', emailFacturacion: '' },
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
          <CardTitle className="text-3xl">{getPatientFullName(patient)}</CardTitle>
          <div className="text-sm text-muted-foreground space-y-1 mt-1">
            {patient.personalDetails.documentoIdentidad && (
                <p className="flex items-center"><FileTextIcon className="mr-2 h-4 w-4 text-primary/70" /> Doc. Identidad: {patient.personalDetails.documentoIdentidad}</p>
            )}
            {patient.personalDetails.fechaNacimiento && (
             <p>Fecha de Nacimiento: {format(new Date(patient.personalDetails.fechaNacimiento), "PPP", { locale: es })} {calculatedAge && `(${calculatedAge})`}</p>
            )}
            {patient.personalDetails.email && (<p className="flex items-center"><User className="mr-2 h-4 w-4 text-primary/70" /> Email: {patient.personalDetails.email}</p>)}
            {patient.personalDetails.telefono1 && (<p className="flex items-center"><PhoneCall className="mr-2 h-4 w-4 text-primary/70" /> Teléfono móvil (1): {patient.personalDetails.telefono1}</p>)}
            {patient.personalDetails.telefono2 && (<p className="flex items-center"><PhoneCall className="mr-2 h-4 w-4 text-primary/70" /> Teléfono opcional (2): {patient.personalDetails.telefono2}</p>)}
          </div>
           <Badge variant="secondary" className="w-fit mt-3">
            Última actualización general: {new Date(patient.updatedAt).toLocaleDateString(currentLocale, { year: 'numeric', month: 'long', day: 'numeric' })}
          </Badge>
        </CardHeader>
        {patient.datosFacturacion && (patient.datosFacturacion.ruc || patient.datosFacturacion.direccionFiscal) && (
          <>
            <Separator className="my-0" />
            <CardContent className="pt-4 pb-2">
              <h4 className="text-sm font-medium mb-2 flex items-center"><BuildingIcon className="mr-2 h-4 w-4 text-primary/70" /> Datos de Facturación Rápidos</h4>
              <div className="text-xs text-muted-foreground space-y-0.5">
                {patient.datosFacturacion.ruc && <p>RUC: {patient.datosFacturacion.ruc}</p>}
                {patient.datosFacturacion.direccionFiscal && <p>Dirección: {patient.datosFacturacion.direccionFiscal}</p>}
              </div>
            </CardContent>
          </>
        )}
      </Card>

      <Tabs defaultValue="encounters" className="w-full">
         <TabsList className={cn(
            "w-full h-auto mb-4 p-1 bg-muted rounded-md",
            "flex flex-wrap justify-center gap-1", // Móvil: flex wrap
            "md:grid md:grid-cols-4 md:max-w-3xl md:gap-0" // Desktop: grid
            )}>
          <TabsTrigger value="encounters" className="flex-grow md:flex-grow-0"><History className="mr-1 h-4 w-4 sm:mr-2"/> Hist. Consultas</TabsTrigger>
          <TabsTrigger value="details" className="flex-grow md:flex-grow-0"><FileEdit className="mr-1 h-4 w-4 sm:mr-2"/> Editar Datos</TabsTrigger>
          <TabsTrigger value="attachments" className="flex-grow md:flex-grow-0"><Paperclip className="mr-1 h-4 w-4 sm:mr-2"/> Adjuntos</TabsTrigger>
          {SIMULATED_ROLE === 'doctor' && ( 
            <TabsTrigger value="reports" className="flex-grow md:flex-grow-0"><Activity className="mr-1 h-4 w-4 sm:mr-2"/> Informes IA</TabsTrigger>
          )}
        </TabsList>
        
        <TabsContent value="encounters">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Historial de Consultas Médicas</CardTitle>
                {SIMULATED_ROLE === 'doctor' && ( 
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
                {SIMULATED_ROLE === 'doctor' 
                  ? "Actualice los datos personales, de contacto, facturación y antecedentes del paciente."
                  : "Actualice los datos personales y de contacto. Otros datos solo pueden ser modificados por personal médico."
                }
              </CardDescription>
            </CardHeader>
            <CardContent>
              <PatientForm 
                onSubmit={handleFormSubmit} 
                initialData={patientFormInitialData}
                submitButtonText="Guardar Cambios"
                allowEditBackgroundInfo={SIMULATED_ROLE === 'doctor'}
                allowEditFacturacionInfo={SIMULATED_ROLE === 'doctor'}
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

        {SIMULATED_ROLE === 'doctor' && (
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

    