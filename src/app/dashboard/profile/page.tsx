// src/app/dashboard/profile/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserCircle, Construction, Edit3, Briefcase, Building, Image as ImageIcon, ShieldCheck } from "lucide-react";

export default function ProfilePage() {
  // En un sistema real, aquí se verificaría el rol del médico.
  // El acceso a esta página ya está controlado por SidebarNav.

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <UserCircle className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Perfil del Médico</CardTitle>
          </div>
          <CardDescription>
            Gestione su información personal, profesional, fiscal y de marca. Esta sección es exclusiva para el médico administrador.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            Esta sección es fundamental para personalizar su experiencia en "medlog cloud" y asegurar que la información
            que aparece en documentos como recetas, informes y facturas sea correcta y profesional. Mantener estos datos
            actualizados es clave para una gestión eficiente.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg flex items-center"><Edit3 className="mr-2 h-5 w-5 text-primary" /> Datos Personales y de Contacto</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Nombre y Apellidos</li>
                    <li>Correo Electrónico de Contacto</li>
                    <li>Teléfono Principal</li>
                    <li>Dirección del Consultorio</li>
                </ul>
            </div>
            <div className="space-y-2 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg flex items-center"><Briefcase className="mr-2 h-5 w-5 text-primary" /> Datos Profesionales</h4>
                 <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Especialidad(es) Médica(s)</li>
                    <li>Número de Matrícula Profesional / Licencia</li>
                    <li>Otros Registros Profesionales (opcional)</li>
                </ul>
            </div>
            <div className="space-y-2 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg flex items-center"><Building className="mr-2 h-5 w-5 text-primary" /> Datos Tributarios y de Facturación</h4>
                 <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Razón Social / Nombre para Facturación</li>
                    <li>Número de Identificación Tributaria (RUC, CUIT, NIF, etc.)</li>
                    <li>Domicilio Fiscal Completo</li>
                    <li>Condición ante IVA/Impuestos</li>
                </ul>
            </div>
            <div className="space-y-2 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-1">
                <h4 className="font-semibold text-lg flex items-center"><ImageIcon className="mr-2 h-5 w-5 text-primary" /> Logotipo Personal o de Clínica</h4>
                <p className="text-sm text-muted-foreground">
                    Suba una imagen (PNG, JPG, SVG) de su logotipo. Este se utilizará para personalizar
                    la cabecera de recetas, informes y facturas generadas por el sistema.
                </p>
            </div>
             <div className="space-y-2 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow md:col-span-1 lg:col-span-2">
                <h4 className="font-semibold text-lg flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary" /> Seguridad y Configuración</h4>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                    <li>Cambio de Contraseña (si aplica para el login de médico)</li>
                    <li>Preferencias de Notificaciones</li>
                    <li>Configuración de Integración con Google Drive (estado, reconectar)</li>
                </ul>
            </div>
          </div>
          <p className="mb-4 text-center font-semibold">
            La funcionalidad completa de edición se encuentra actualmente en desarrollo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="outline" disabled>
              <Construction className="mr-2 h-4 w-4" />
              Editar Mis Datos (Próximamente)
            </Button>
             <Button variant="outline" disabled>
              <ImageIcon className="mr-2 h-4 w-4" />
              Gestionar Logotipo (Próximamente)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
