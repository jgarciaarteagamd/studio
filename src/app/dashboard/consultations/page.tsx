// src/app/dashboard/consultations/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Stethoscope, Users } from "lucide-react";

export default function ConsultationsPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Stethoscope className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Gestión de Consultas</CardTitle>
          </div>
          <CardDescription>
            Esta sección está dedicada al registro y visualización de las consultas médicas de los pacientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Desde aquí, los médicos podrán añadir nuevas consultas al historial de un paciente, detallando
            el motivo, examen físico, diagnóstico y plan de tratamiento para cada encuentro.
          </p>
          <p className="mb-4">
            Para registrar una nueva consulta, primero seleccione un paciente de la lista de pacientes.
            (La funcionalidad completa de esta sección se implementará en futuras actualizaciones).
          </p>
          <Button asChild>
            <Link href="/dashboard/patients">
              <Users className="mr-2 h-4 w-4" />
              Ver Lista de Pacientes
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl">Funcionalidad Futura</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>Seleccionar un paciente para ver su historial de consultas.</li>
                <li>Formulario para añadir una nueva consulta a un paciente existente.</li>
                <li>Editar o ver detalles de consultas pasadas.</li>
                <li>Integración con la generación de informes IA basada en las consultas.</li>
            </ul>
             <p className="mt-4 text-sm">
                Actualmente, las consultas se registran como parte del historial del paciente y son visibles en la pestaña "Hist. Consultas" dentro de la página de detalle de cada paciente.
             </p>
        </CardContent>
      </Card>
    </div>
  );
}
