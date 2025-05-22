// src/app/dashboard/admin/users/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, LockKeyhole, Settings, Construction, ShieldCheck, MailWarning } from "lucide-react";
// El acceso a esta página ya está controlado por SidebarNav

export default function UserManagementPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Settings className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Gestión de Usuarios Asistenciales</CardTitle>
          </div>
          <CardDescription>
            Desde aquí, el médico administrador puede crear, aprobar y gestionar los permisos del personal asistencial (secretarios/as).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-6 text-muted-foreground">
            Esta sección es crucial para controlar el acceso y las funcionalidades disponibles para cada miembro del
            personal asistencial que colabora en la práctica médica. Una correcta gestión de usuarios y permisos
            asegura la confidencialidad de la información y la eficiencia operativa.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            <div className="space-y-2 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg flex items-center"><UserPlus className="mr-2 h-5 w-5 text-primary" /> Creación de Usuarios</h4>
                <p className="text-sm text-muted-foreground">
                    Genere nuevos usuarios para secretarios/as. El sistema podrá sugerir un nombre de usuario
                    (ej. basado en nombre/apellido) y asignará una contraseña inicial aleatoria y segura.
                </p>
            </div>
             <div className="space-y-2 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg flex items-center"><Users className="mr-2 h-5 w-5 text-primary" /> Listado y Estado de Usuarios</h4>
                <p className="text-sm text-muted-foreground">
                    Visualice todos los usuarios asistenciales creados, su estado (activo, pendiente de aprobación, inactivo)
                    y la fecha de última actividad.
                </p>
            </div>
            <div className="space-y-2 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg flex items-center"><ShieldCheck className="mr-2 h-5 w-5 text-primary" /> Aprobación y Activación</h4>
                <p className="text-sm text-muted-foreground">
                    Apruebe las solicitudes de nuevos usuarios o active/desactive cuentas existentes según sea necesario,
                    controlando quién puede acceder al sistema.
                </p>
            </div>
            <div className="space-y-2 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-lg flex items-center"><MailWarning className="mr-2 h-5 w-5 text-primary" /> Restablecimiento de Contraseña</h4>
                <p className="text-sm text-muted-foreground">
                    Envíe un enlace de restablecimiento de contraseña al correo electrónico del usuario asistencial en caso de olvido,
                    o genere una nueva contraseña temporal.
                </p>
            </div>
            <div className="space-y-2 p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow md:col-span-2 lg:col-span-3">
                <h4 className="font-semibold text-lg flex items-center"><LockKeyhole className="mr-2 h-5 w-5 text-primary" /> Gestión Detallada de Permisos</h4>
                <p className="text-sm text-muted-foreground mb-2">
                    Asigne permisos granulares a cada usuario asistencial para las diferentes secciones de la aplicación:
                </p>
                <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1 pl-4">
                    <li>
                        <strong>Pacientes:</strong>
                        <ul className="list-circle list-inside pl-4 space-y-0.5">
                            <li>Permitir creación de nuevos pacientes.</li>
                            <li>Permitir modificación de datos personales y de facturación.</li>
                            <li>Permitir agregar/eliminar archivos adjuntos.</li>
                            <li>(El acceso a antecedentes e historial clínico es exclusivo del médico).</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Agenda:</strong>
                         <ul className="list-circle list-inside pl-4 space-y-0.5">
                            <li>Permitir programar nuevas citas.</li>
                            <li>Permitir bloquear/desbloquear horarios.</li>
                            <li>Permitir cambiar estado de las citas (confirmada, cancelada, etc.).</li>
                            <li>Permitir eliminar citas/bloqueos.</li>
                        </ul>
                    </li>
                    <li>
                        <strong>Facturación:</strong>
                        <ul className="list-circle list-inside pl-4 space-y-0.5">
                            <li>Permitir acceso total a la sección de facturación (crear, ver, gestionar facturas).</li>
                            <li>Sin acceso a la sección de facturación.</li>
                        </ul>
                    </li>
                </ul>
            </div>
          </div>
          <p className="mb-4 text-center font-semibold">
            La interfaz para la gestión de usuarios y permisos se encuentra actualmente en diseño y desarrollo.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button variant="outline" disabled>
              <Construction className="mr-2 h-4 w-4" />
              Ver Prototipo de Gestión de Permisos (Próximamente)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
