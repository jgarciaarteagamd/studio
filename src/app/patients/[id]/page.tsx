"use client";

import { useEffect, useState, useCallback } from "react"; 
import { useParams, useRouter } from "next/navigation";
import { PatientForm } from "@/components/patients/PatientForm";
import { FileUploadSection } from "@/components/patients/FileUploadSection";
import { ReportGenerationSection } from "@/components/patients/ReportGenerationSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";

// Importamos las Server Actions relevantes
import { 
  fetchPatientRecord, 
  updatePatientRecord, 
  addPatientAttachment, 
  deletePatientAttachments 
} from "@/app/actions/patient-actions"; 

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
  const [isUpdating, setIsUpdating] = useState(false); 
  const [isDeletingAttachments, setIsDeletingAttachments] = useState(false); 

  const [currentLocale, setCurrentLocale] = useState('es-ES'); 

  const getPatientFullName = (patient: PatientRecord | null) => {
    if (!patient?.personalDetails) return "Paciente Desconocido";
    return `${patient.personalDetails.nombres || ''} ${patient.personalDetails.apellidos || ''}`.trim();
  };

  const patientId = Array.isArray(params.id) ? params.id[0] : params.id;

  const loadPatient = useCallback(async () => {
    if (!patientId) return;

    setIsLoading(true);
    try {
      const fetchedPatient = await fetchPatientRecord(patientId as string);
      if (fetchedPatient) {
        if (fetchedPatient.personalDetails?.fechaNacimiento && typeof fetchedPatient.personalDetails.fechaNacimiento === 'string') {
           const dateFromFirestore = new Date(fetchedPatient.personalDetails.fechaNacimiento);
            if (isValid(dateFromFirestore)) {
               fetchedPatient.personalDetails.fechaNacimiento = dateFromFirestore as any;
            } else {
               console.warn("Fecha de nacimiento inválida de Firestore:", fetchedPatient.personalDetails.fechaNacimiento);
               fetchedPatient.personalDetails.fechaNacimiento = undefined as any;
            }
         }
        setPatient(fetchedPatient);
      } else {
        toast({
          title: "Error",
          description: "Historial del paciente no encontrado.",
          variant: "destructive",
        });
        router.push("/patients"); 
      }
    } catch (error) {
      console.error("Error loading patient:", error);
       toast({
          title: "Error",
          description: "No se pudieron cargar los detalles del paciente.",
          variant: "destructive",
        });
       router.push("/patients"); 
    } finally {
      setIsLoading(false);
    }
  }, [patientId, router, toast]); 

  useEffect(() => {
    setCurrentLocale(navigator.language || 'es-ES');
    loadPatient(); 
  }, [loadPatient]); 

  interface PatientFormData {
    personalDetails: Omit<PersonalDetails, 'fechaNacimiento'> & { fechaNacimiento: Date };
    datosFacturacion?: DatosFacturacion | null;
    backgroundInformation?: BackgroundInformation | null;
  }

  const handleFormSubmit = async (data: PatientFormData) => {
    if (!patient) return;

    setIsUpdating(true); 

    const formattedData = {
      ...data,
      personalDetails: {
        ...data.personalDetails,
        fechaNacimiento: data.personalDetails.fechaNacimiento && isValid(data.personalDetails.fechaNacimiento) ?
          format(data.personalDetails.fechaNacimiento, 'yyyy-MM-dd') : null, 
      },
    };

    try {
      const updatedRecord = await updatePatientRecord(patient.id, formattedData as Partial<Omit<PatientRecord, 'id' | 'createdAt' | 'medicalEncounters' | 'recipes' | 'attachments'>>);
      
      if (updatedRecord) {
         if (updatedRecord.personalDetails?.fechaNacimiento && typeof updatedRecord.personalDetails.fechaNacimiento === 'string') {
             const dateFromFirestore = new Date(updatedRecord.personalDetails.fechaNacimiento);
             if (isValid(dateFromFirestore)) {
                 (updatedRecord.personalDetails as any).fechaNacimiento = dateFromFirestore;
             } else {
                console.warn("Fecha de nacimiento inválida recibida después de la actualización:", updatedRecord.personalDetails.fechaNacimiento);
                 (updatedRecord.personalDetails as any).fechaNacimiento = undefined;
             }
        }
        setPatient(updatedRecord); 
        toast({
          title: "Historial Actualizado",
          description: `El historial de ${getPatientFullName(updatedRecord)} ha sido actualizado exitosamente.`,
        });
      } else {
          toast({
             title: "Error de Actualización",
             description: `No se pudo encontrar el paciente con ID ${patient.id} para actualizar.`,
             variant: "destructive",
           });
           loadPatient(); 
      }
    } catch (error) {
      console.error("Error submitting patient form:", error);
      toast({
        title: "Error al Actualizar",
        description: "Ocurrió un error al intentar actualizar el historial del paciente.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false); 
    }
  };

  /**
   * Maneja la eliminación de adjuntos llamando a la Server Action.
   * @param attachmentIds Array de IDs de los adjuntos a eliminar.
   */
  const handleDeleteAttachments = async (attachmentIds: string[]) => {
    if (!patient) return;

    setIsDeletingAttachments(true);
    try {
        // Llama a la Server Action para eliminar adjuntos en Firestore
        const updatedPatient = await deletePatientAttachments(patient.id, attachmentIds);

        if (updatedPatient) {
            // Si la eliminación (de metadatos en Firestore) fue exitosa
            // La Server Action devuelve el paciente actualizado.
            // Es posible que necesites ajustar la fecha de nacimiento si se devuelve en el objeto
            if (updatedPatient.personalDetails?.fechaNacimiento && typeof updatedPatient.personalDetails.fechaNacimiento === 'string') {
                const dateFromFirestore = new Date(updatedPatient.personalDetails.fechaNacimiento);
                if (isValid(dateFromFirestore)) {
                    (updatedPatient.personalDetails as any).fechaNacimiento = dateFromFirestore;
                } else {
                   console.warn("Fecha de nacimiento inválida recibida después de eliminar adjuntos:", updatedPatient.personalDetails.fechaNacimiento);
                    (updatedPatient.personalDetails as any).fechaNacimiento = undefined;
                }
           }
            setPatient(updatedPatient); // Actualiza el estado local con los datos de Firestore
            toast({
                title: "Archivos Eliminados",
                description: `${attachmentIds.length} archivo(s) adjunto(s) han sido eliminados.`,
            });
        } else {
            // Si la Server Action devuelve null
            toast({
               title: "Error al eliminar",
               description: "No se pudieron encontrar los adjuntos o el paciente para eliminar.",
               variant: "destructive",
             });
             loadPatient(); // Considerar recargar el paciente para sincronizar el estado
        }

    } catch (error) {
      console.error("Error deleting attachments:", error);
      toast({ title: "Error al eliminar", description: "Ocurrió un error al intentar eliminar los archivos.", variant: "destructive" });
    } finally {
      setIsDeletingAttachments(false);
    }
  };

  /**
   * Maneja la subida de un archivo llamando a la Server Action.
   * @param file El archivo a adjuntar.
   */
  const handleFileUpload = async (file: File) => {
     if (!patient) return;

     // NOTA: Esta función AÚN NO SUBE EL ARCHIVO REAL a Cloud Storage.
     // Llama a la Server Action que solo actualiza los metadatos en Firestore.

     // Preparamos los metadatos básicos para el adjunto.
     // El ID y uploadedAt se generarán en la Server Action/Service.
     const attachmentData: Omit<Attachment, 'id' | 'uploadedAt'> = {
         name: file.name,
         type: file.type,
         driveLink: '#placeholder', // Esto DEBERÍA ser la URL real de Cloud Storage
     };

     try {
        // Llama a la Server Action para añadir el adjunto (metadatos) a Firestore
        const updatedPatient = await addPatientAttachment(patient.id, attachmentData);

        if (updatedPatient) {
             // Si la adición (de metadatos en Firestore) fue exitosa
             // La Server Action devuelve el paciente actualizado.
             // Es posible que necesites ajustar la fecha de nacimiento si se devuelve en el objeto
            if (updatedPatient.personalDetails?.fechaNacimiento && typeof updatedPatient.personalDetails.fechaNacimiento === 'string') {
                const dateFromFirestore = new Date(updatedPatient.personalDetails.fechaNacimiento);
                if (isValid(dateFromFirestore)) {
                    (updatedPatient.personalDetails as any).fechaNacimiento = dateFromFirestore;
                } else {
                   console.warn("Fecha de nacimiento inválida recibida después de añadir adjunto:", updatedPatient.personalDetails.fechaNacimiento);
                    (updatedPatient.personalDetails as any).fechaNacimiento = undefined;
                }
           }
            setPatient(updatedPatient); // Actualiza el estado local con los datos de Firestore
            toast({
              title: "Archivo Adjuntado",
              description: `${file.name} ha sido adjuntado.`,
            });
        } else {
             // Si la Server Action devuelve null
             toast({
                title: "Error al adjuntar",
                description: `No se pudo adjuntar el archivo ${file.name}.`,
                variant: "destructive",
              });
              loadPatient(); // Considerar recargar el paciente para sincronizar el estado
        }

     } catch (error) {
         console.error("Error uploading file:", error);
         toast({
            title: "Error al adjuntar",
            description: `Ocurrió un error al intentar adjuntar el archivo ${file.name}.`,
            variant: "destructive",
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
    return null; 
  }

  const displayFechaNacimiento = patient.personalDetails?.fechaNacimiento 
    ? (patient.personalDetails.fechaNacimiento instanceof Date && isValid(patient.personalDetails.fechaNacimiento) 
        ? patient.personalDetails.fechaNacimiento.toLocaleDateString(currentLocale) 
        : (typeof patient.personalDetails.fechaNacimiento === 'string' ? new Date(patient.personalDetails.fechaNacimiento).toLocaleDateString(currentLocale) : 'N/A') 
      )
    : 'N/A';


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
 Fecha de Nacimiento: {displayFechaNacimiento} | Contacto: {patient.personalDetails?.telefono1 || 'N/A'}
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
                submitButtonText={isUpdating ? "Guardando..." : "Guardar Cambios"}
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
                attachments={patient.attachments || []} 
                onFileUpload={handleFileUpload} 
                onDeleteAttachments={handleDeleteAttachments}
                isDeleting={isDeletingAttachments} 
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
