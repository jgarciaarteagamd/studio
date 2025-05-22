
// src/app/dashboard/admin/users/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, UserPlus, LockKeyhole, Construction } from "lucide-react";
// import { useRouter } from "next/navigation"; // Descomentar si se implementa lógica de roles real
// import { SIMULATED_CURRENT_ROLE } from '@/lib/mock-data';

export default function UserManagementPage() {
  // const router = useRouter();
  // En un sistema real, aquí se verificaría el rol del usuario.
  // if (SIMULATED_CURRENT_ROLE !== 'doctor') { router.push('/dashboard'); return null; }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Users className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Gestión de Usuarios Asistenciales</CardTitle>
          </div>
          <CardDescription>
            Desde aquí, el médico administrador puede crear, aprobar, y gestionar los permisos del personal asistencial (secretarios/as).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Esta sección permitirá al médico administrador controlar el acceso y las funcionalidades disponibles para cada miembro del personal asistencial.
            Se podrán generar usuarios con contraseñas iniciales aleatorias y asignar permisos detallados para las secciones de Pacientes, Agenda y Facturación.
          </p>
          <p className="mb-4">
            La funcionalidad completa se encuentra actualmente en desarrollo.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button variant="outline" disabled>
              <UserPlus className="mr-2 h-4 w-4" />
              Crear Nuevo Usuario (Próximamente)
            </Button>
            <Button variant="outline" disabled>
              <LockKeyhole className="mr-2 h-4 w-4" />
              Gestionar Permisos (Próximamente)
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl">Funcionalidades Planeadas</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>Creación de usuarios para secretarios/as con nombre de usuario autogenerado y contraseña inicial.</li>
                <li>Listado de usuarios asistenciales existentes.</li>
                <li>Opción para aprobar/desaprobar usuarios.</li>
                <li>Opción para enviar restablecimiento de contraseña.</li>
                <li>Interfaz para habilitar/deshabilitar permisos específicos por usuario:
                    <ul className="list-disc space-y-1 pl-5 mt-1">
                        <li>Pacientes: Crear, Modificar datos, Agregar adjuntos.</li>
                        <li>Agenda: Programar citas, Bloquear horarios, Cambiar estados.</li>
                        <li>Facturación: Acceso total o ninguno.</li>
                    </ul>
                </li>
            </ul>
             <Button variant="secondary" disabled className="mt-4">
                <Construction className="mr-2 h-4 w-4" />
                Ver Prototipo de Asignación de Permisos (Próximamente)
            </Button>
        </CardContent>
      </Card>
    </div>
  );
}
