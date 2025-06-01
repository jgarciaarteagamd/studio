"use client";

import { useEffect, useState, useCallback } from "react"; // Importamos useCallback
import { useParams, useRouter } from "next/navigation";
import { PatientForm } from "@/components/patients/PatientForm";
import { FileUploadSection } from "@/components/patients/FileUploadSection";
import { ReportGenerationSection } from "@/components/patients/ReportGenerationSection";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
// Ya no necesitamos importar estas funciones de mock-data
// import { getPatientById, updatePatient } from "@/lib/mock-data"; 

// Importamos las Server Actions relevantes
import { 
  fetchPatientRecord, 
  updatePatientRecord, 
  addPatientAttachment, // Importamos las acciones para adjuntos (aún simuladas)
  deletePatientAttachments // Importamos las acciones para adjuntos (aún simuladas)
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
  const [isUpdating, setIsUpdating] = useState(false); // Estado para la carga de actualización
  const [isDeletingAttachments, setIsDeletingAttachments] = useState(false); // State for attachment deletion loading

  const [currentLocale, setCurrentLocale] = useState('es-ES'); // Default to Spanish

  // Helper to get full name, assuming personalDetails has nombres and apellidos
  const getPatientFullName = (patient: PatientRecord | null) => {
    if (!patient?.personalDetails) return "Paciente Desconocido";
    return `${patient.personalDetails.nombres || ''} ${patient.personalDetails.apellidos || ''}`.trim();
  };

  const patientId = Array.isArray(params.id) ? params.id[0] : params.id;

  // Función para cargar los datos del paciente
  const loadPatient = useCallback(async () => {
    if (!patientId) return;

    setIsLoading(true);
    try {
      // Llama a la Server Action para obtener el paciente por ID
      const fetchedPatient = await fetchPatientRecord(patientId as string);
      if (fetchedPatient) {
        // Ajustamos la fecha de nacimiento si existe para que sea un objeto Date, 
        // ya que el formulario espera un Date.
        if (fetchedPatient.personalDetails?.fechaNacimiento) {
          // Verificar si fechaNacimiento es una cadena de fecha válida
          const dateFromFirestore = new Date(fetchedPatient.personalDetails.fechaNacimiento);
           if (isValid(dateFromFirestore)) {
              fetchedPatient.personalDetails.fechaNacimiento = dateFromFirestore as any; // Casteamos temporalmente
           } else {
              console.warn("Fecha de nacimiento inválida de Firestore:", fetchedPatient.personalDetails.fechaNacimiento);
               fetchedPatient.personalDetails.fechaNacimiento = undefined as any; // O manejar de otra forma
           }
        }
        setPatient(fetchedPatient);
      } else {
        toast({
          title: "Error",
          description: "Historial del paciente no encontrado.",
          variant: "destructive",
        });
        router.push("/patients"); // Redirigir si no se encuentra el paciente
      }
    } catch (error) {
      console.error("Error loading patient:", error);
       toast({
          title: "Error",
          description: "No se pudieron cargar los detalles del paciente.",
          variant: "destructive",
        });
       router.push("/patients"); // Redirigir en caso de error de carga
    } finally {
      setIsLoading(false);
    }
  }, [patientId, router, toast]); // Dependencias de useCallback

  useEffect(() => {
    // Set locale from browser, fallback to Spanish
    setCurrentLocale(navigator.language || 'es-ES');
    loadPatient(); // Llama a la función de carga al montar o si patientId cambia
  }, [loadPatient]); // Dependencia de useEffect es la función loadPatient

  // Define el tipo para los datos recibidos directamente del formulario
  // La fecha de nacimiento llega como Date del componente de formulario
  interface PatientFormData {
 personalDetails: Omit<PersonalDetails, 'fechaNacimiento'> & { fechaNacimiento: Date };
    datosFacturacion?: DatosFacturacion | null;
    backgroundInformation?: BackgroundInformation | null;
  }

  const handleFormSubmit = async (data: PatientFormData) => {
    if (!patient) return;

    setIsUpdating(true); // Iniciar estado de actualización

    // Formatear la fecha de nacimiento a string ISO 8601 para Firestore
    const formattedData = {
      ...data,
      personalDetails: {
        ...data.personalDetails,
        fechaNacimiento: data.personalDetails.fechaNacimiento && isValid(data.personalDetails.fechaNacimiento) ?
          format(data.personalDetails.fechaNacimiento, 'yyyy-MM-dd') : null, // O undefined, o manejar según tu esquema
      },
    };

    try {
      // Llama a la Server Action para actualizar el paciente
      // Ajustamos el tipo de 'updates' para que coincida con la Server Action
      const updatedRecord = await updatePatientRecord(patient.id, formattedData as Partial<Omit<PatientRecord, 'id' | 'createdAt' | 'medicalEncounters' | 'recipes' | 'attachments'>>);
      
      if (updatedRecord) {
         // Si la actualización fue exitosa y la Server Action devuelve el registro actualizado
         // Firestore devuelve la fecha como string, la convertimos de nuevo a Date para el formulario si existe
        if (updatedRecord.personalDetails?.fechaNacimiento && typeof updatedRecord.personalDetails.fechaNacimiento === 'string') {
             const dateFromFirestore = new Date(updatedRecord.personalDetails.fechaNacimiento);
             if (isValid(dateFromFirestore)) {
                 (updatedRecord.personalDetails as any).fechaNacimiento = dateFromFirestore;
             } else {
                console.warn("Fecha de nacimiento inválida recibida después de la actualización:", updatedRecord.personalDetails.fechaNacimiento);
                 (updatedRecord.personalDetails as any).fechaNacimiento = undefined;
             }
        }
        setPatient(updatedRecord); // Actualiza el estado local con los datos de Firestore
        toast({
          title: "Historial Actualizado",
          description: `El historial de ${getPatientFullName(updatedRecord)} ha sido actualizado exitosamente.`,
        });
      } else {
         // Si la Server Action devuelve null (ej: paciente no encontrado durante la actualización)
          toast({
             title: "Error de Actualización",
             description: `No se pudo encontrar el paciente con ID ${patient.id} para actualizar.`,
             variant: "destructive",
           });
           // Considerar recargar el paciente o redirigir
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
      setIsUpdating(false); // Finalizar estado de actualización
    }
  };

  // **Nota:** handleFileUpload y handleDeleteAttachments aún usan lógica simulada.
  // Deberán ser adaptadas para usar las Server Actions addPatientAttachment y deletePatientAttachments
  // una vez que estas últimas interactúen realmente con Firestore y Cloud Storage.

  const handleDeleteAttachments = async (attachmentIds: string[]) => {
    if (!patient) return;

    setIsDeletingAttachments(true);
    try {
        // TODO: Llamar a la Server Action deletePatientAttachments aquí
        console.warn("handleDeleteAttachments: Usando lógica simulada. Implementar llamada a Server Action.");
        
        // Lógica simulada actual (reemplazar con llamada a Server Action y manejo de respuesta)
        const updatedAttachments = patient.attachments.filter(
          (attachment) => !attachmentIds.includes(attachment.id)
        );
        const updatedRecord = { ...patient, attachments: updatedAttachments }; // Simular actualización
        setPatient(updatedRecord); // Actualizar estado local simulado

        toast({
          title: "Archivos Eliminados (Simulado)",
          description: `${attachmentIds.length} archivo(s) adjunto(s) han sido eliminados (simulado).`,
        });

    } catch (error) {
      console.error("Error deleting attachments:", error);
      toast({ title: "Error al eliminar", description: "No se pudieron eliminar los archivos.", variant: "destructive" });
    } finally {
      setIsDeletingAttachments(false);
    }
  };

  const handleFileUpload = async (file: File) => {
     if (!patient) return;

     // TODO: Llamar a la Server Action addPatientAttachment aquí
     console.warn("handleFileUpload: Usando lógica simulada. Implementar llamada a Server Action.");

    // Lógica simulada actual (reemplazar con llamada a Server Action y manejo de respuesta)
    const newAttachment: Attachment = {
        id: `attach-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        type: file.type.startsWith('image/') ? 'image' : (file.type === 'application/pdf' ? 'pdf' : 'other'),
        driveLink: '#', // Placeholder o URL simulada
        uploadedAt: new Date().toISOString(), // O simular serverTimestamp
      };
      const updatedAttachments = [...patient.attachments, newAttachment];
      const updatedRecord = { ...patient, attachments: updatedAttachments }; // Simular actualización
      setPatient(updatedRecord); // Actualizar estado local simulado

      toast({
        title: "Archivo Adjuntado (Simulado)",
        description: `${file.name} ha sido adjuntado (simulado).`,
      });
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
    // Esto debería ser manejado por la redirección en loadPatient, 
    // pero es una salvaguarda.
    return null; 
  }

  // Convertir la fecha de nacimiento de Date (para el formulario) a string si es necesario para mostrar
  const displayFechaNacimiento = patient.personalDetails?.fechaNacimiento 
    ? (patient.personalDetails.fechaNacimiento instanceof Date && isValid(patient.personalDetails.fechaNacimiento) 
        ? patient.personalDetails.fechaNacimiento.toLocaleDateString(currentLocale) 
        : (typeof patient.personalDetails.fechaNacimiento === 'string' ? new Date(patient.personalDetails.fechaNacimiento).toLocaleDateString(currentLocale) : 'N/A') // Manejar si viene como string inicial
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
              {/* Pasamos el estado de actualización al formulario si es necesario */}
              <PatientForm 
                onSubmit={handleFormSubmit} 
                initialData={patient}
                submitButtonText={isUpdating ? "Guardando..." : "Guardar Cambios"}
                // Puedes pasar otras props relacionadas con roles/permisos aquí si las tienes
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
                attachments={patient.attachments || []} // Aseguramos que sea un array
                onFileUpload={handleFileUpload} 
                onDeleteAttachments={handleDeleteAttachments}
                isDeleting={isDeletingAttachments} // Pasamos el estado de carga de eliminación
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
