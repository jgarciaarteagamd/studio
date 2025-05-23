// src/app/dashboard/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserCircle, Edit3, Briefcase, Building, Image as ImageIcon, ShieldCheck, Save, Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getDoctorProfile, updateDoctorProfile, type DoctorProfile, type DoctorContactDetails, type DoctorProfessionalDetails, type DoctorFiscalDetails } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

const contactDetailsSchema = z.object({
  nombreCompleto: z.string().min(3, "Nombre completo es requerido."),
  emailContacto: z.string().email("Email inválido."),
  telefonoPrincipal: z.string().min(7, "Teléfono es requerido."),
  direccionConsultorio: z.string().min(5, "Dirección es requerida."),
});

const professionalDetailsSchema = z.object({
  especialidadPrincipal: z.string().min(3, "Especialidad es requerida."),
  otrasEspecialidades: z.string().optional(),
  numeroMatricula: z.string().min(3, "Matrícula es requerida."),
  otrosRegistros: z.string().optional(),
});

const fiscalDetailsSchema = z.object({
  razonSocialFacturacion: z.string().min(3, "Razón social es requerida."),
  identificacionTributaria: z.string().min(10, "Identificación tributaria es requerida (ej. RUC)."), // RUC Ecuador usualmente 13 o 10 dígitos
  domicilioFiscalCompleto: z.string().min(10, "Domicilio fiscal es requerido."),
  condicionIVA: z.string().optional(),
});

// Union de esquemas para el formulario completo
const profileFormSchema = z.object({
  contactDetails: contactDetailsSchema,
  professionalDetails: professionalDetailsSchema,
  fiscalDetails: fiscalDetailsSchema,
  logotipoUrl: z.string().url("URL de logotipo inválida").optional().or(z.literal('')), // Allow empty string
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export default function ProfilePage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentProfile, setCurrentProfile] = useState<DoctorProfile | null>(null);
  const [previewLogo, setPreviewLogo] = useState<string | undefined>(undefined);


  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      contactDetails: {
        nombreCompleto: "",
        emailContacto: "",
        telefonoPrincipal: "",
        direccionConsultorio: "",
      },
      professionalDetails: {
        especialidadPrincipal: "",
        otrasEspecialidades: "",
        numeroMatricula: "",
        otrosRegistros: "",
      },
      fiscalDetails: {
        razonSocialFacturacion: "",
        identificacionTributaria: "",
        domicilioFiscalCompleto: "",
        condicionIVA: "",
      },
      logotipoUrl: "",
    }
  });
  
  useEffect(() => {
    const profileData = getDoctorProfile();
    if (profileData) {
      setCurrentProfile(profileData);
      form.reset({
        contactDetails: profileData.contactDetails,
        professionalDetails: profileData.professionalDetails,
        fiscalDetails: profileData.fiscalDetails,
        logotipoUrl: profileData.logotipoUrl || "",
      });
      setPreviewLogo(profileData.logotipoUrl);
    }
    setIsLoading(false);
  }, [form]);

  const onSubmit: SubmitHandler<ProfileFormValues> = async (data) => {
    setIsSaving(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1000));
    const updatedProfile = updateDoctorProfile({
      contactDetails: data.contactDetails,
      professionalDetails: data.professionalDetails,
      fiscalDetails: data.fiscalDetails,
      logotipoUrl: data.logotipoUrl || undefined, // Guardar undefined si está vacío
    });
    setCurrentProfile(updatedProfile);
    setPreviewLogo(updatedProfile.logotipoUrl);
    setIsSaving(false);
    toast({
      title: "Perfil Actualizado",
      description: "Sus datos han sido guardados exitosamente.",
    });
  };

  const handleLogoUrlChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const url = event.target.value;
    form.setValue("logotipoUrl", url, { shouldValidate: true });
    if (form.getFieldState("logotipoUrl").invalid || !url) {
       setPreviewLogo(getDoctorProfile().logotipoUrl); // Revert to original if invalid or empty
    } else {
       setPreviewLogo(url);
    }
  };


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin" /> Cargando perfil...</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Perfil del Médico</CardTitle>
          </div>
          <CardDescription>
            Gestione su información personal, profesional, fiscal y de marca.
          </CardDescription>
        </CardHeader>
      </Card>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <Tabs defaultValue="contact" className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-6">
              <TabsTrigger value="contact"><Edit3 className="mr-2 h-4 w-4" />Contacto</TabsTrigger>
              <TabsTrigger value="professional"><Briefcase className="mr-2 h-4 w-4" />Profesional</TabsTrigger>
              <TabsTrigger value="fiscal"><Building className="mr-2 h-4 w-4" />Fiscal</TabsTrigger>
              <TabsTrigger value="branding"><ImageIcon className="mr-2 h-4 w-4" />Logotipo</TabsTrigger>
              <TabsTrigger value="security"><ShieldCheck className="mr-2 h-4 w-4" />Seguridad</TabsTrigger>
            </TabsList>

            <TabsContent value="contact" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Datos Personales y de Contacto</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="contactDetails.nombreCompleto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre Completo</FormLabel>
                        <FormControl><Input placeholder="Ej: Dr. Juan Pérez" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactDetails.emailContacto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Correo Electrónico de Contacto</FormLabel>
                        <FormControl><Input type="email" placeholder="juan.perez@consultorio.com" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactDetails.telefonoPrincipal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Teléfono Principal</FormLabel>
                        <FormControl><Input type="tel" placeholder="0991234567" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="contactDetails.direccionConsultorio"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Dirección del Consultorio</FormLabel>
                        <FormControl><Textarea placeholder="Av. Amazonas N30-100 y Gaspar de Villarroel, Quito" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Datos Profesionales</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="professionalDetails.especialidadPrincipal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Especialidad Principal</FormLabel>
                        <FormControl><Input placeholder="Ej: Endocrinología" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="professionalDetails.otrasEspecialidades"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Otras Especialidades (Opcional)</FormLabel>
                        <FormControl><Input placeholder="Ej: Medicina Interna" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="professionalDetails.numeroMatricula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Matrícula Profesional / Licencia</FormLabel>
                        <FormControl><Input placeholder="Ej: MSP-12345 / ACESS-54321" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="professionalDetails.otrosRegistros"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Otros Registros Profesionales (Opcional)</FormLabel>
                        <FormControl><Input placeholder="Ej: Colegio Médico Pichincha: 6789" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fiscal" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Datos Fiscales y de Facturación</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                   <FormField
                    control={form.control}
                    name="fiscalDetails.razonSocialFacturacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Razón Social / Nombre para Facturación</FormLabel>
                        <FormControl><Input placeholder="Ej: Juan Pérez Consultorios Médicos S.A." {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fiscalDetails.identificacionTributaria"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Identificación Tributaria (RUC/NIF/etc.)</FormLabel>
                        <FormControl><Input placeholder="Ej: 1700000000001 (RUC Ecuador)" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="fiscalDetails.domicilioFiscalCompleto"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Domicilio Fiscal Completo</FormLabel>
                        <FormControl><Textarea placeholder="Av. Principal 123, Edificio Profesional, Piso 2, Of. 201, Ciudad, Provincia, Ecuador" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                   <FormField
                    control={form.control}
                    name="fiscalDetails.condicionIVA"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Condición ante IVA/Impuestos (Opcional)</FormLabel>
                        <FormControl><Input placeholder="Ej: Agente de Retención, Contribuyente Especial" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="branding" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Logotipo Personal o de Clínica</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="logotipoUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>URL del Logotipo</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="https://ejemplo.com/logo.png" 
                            {...field} 
                            onChange={handleLogoUrlChange} 
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormDescription>
                          Ingrese la URL pública de su imagen de logotipo (PNG, JPG, SVG).
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  {previewLogo && (
                    <div className="mt-4 p-4 border rounded-md bg-muted/50 flex flex-col items-center">
                      <FormLabel className="mb-2">Vista Previa del Logotipo:</FormLabel>
                      <img 
                        src={previewLogo} 
                        alt="Vista previa del logotipo" 
                        className="max-w-xs max-h-24 object-contain rounded"
                        onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none'; // Hide if broken
                            (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden'); // Show error message
                        }}
                       />
                       <p className="text-destructive text-sm mt-2 hidden"><AlertTriangle className="inline mr-1 h-4 w-4"/> No se pudo cargar la imagen. Verifique la URL.</p>
                    </div>
                  )}
                  {!previewLogo && currentProfile?.logotipoUrl && (
                     <p className="text-muted-foreground text-sm">Actualmente no hay un logotipo configurado o la URL es inválida.</p>
                  )}
                   <p className="text-xs text-muted-foreground">
                    Idealmente, use una imagen optimizada para la web. El logotipo se usará en recetas, informes y facturas.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="mt-6">
              <Card>
                <CardHeader><CardTitle>Seguridad y Configuración</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-1">Cambio de Contraseña</h4>
                    <p className="text-sm text-muted-foreground mb-2">Esta funcionalidad no está disponible ya que accede con Google.</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Preferencias de Notificaciones</h4>
                    <p className="text-sm text-muted-foreground mb-2">(Configuración futura para notificaciones por email o dentro de la app).</p>
                    <Button variant="outline" disabled>Configurar Notificaciones (Próximamente)</Button>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Integración con Google Drive</h4>
                    <p className="text-sm text-muted-foreground mb-2">Estado: {currentProfile?.driveFolderId ? `Conectado (Carpeta ID: ${currentProfile.driveFolderId})` : 'No conectado'}</p>
                    <Button variant="outline" disabled>
                      {currentProfile?.driveFolderId ? 'Verificar/Reconectar Google Drive' : 'Conectar Google Drive'} (Próximamente)
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-end sticky bottom-0 bg-background/80 backdrop-blur-sm py-4 px-2 border-t">
            <Button type="submit" size="lg" disabled={isSaving}>
              {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Save className="mr-2 h-5 w-5" />}
              {isSaving ? "Guardando Cambios..." : "Guardar Cambios en Perfil"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

    