// src/app/dashboard/recipes/page.tsx
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FileSignature, Construction } from "lucide-react";

export default function RecipesPage() {
  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileSignature className="h-8 w-8 text-primary" />
            <CardTitle className="text-3xl">Gestión de Recetas Médicas</CardTitle>
          </div>
          <CardDescription>
            Esta sección está destinada a la generación y gestión de recetas médicas para los pacientes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Desde aquí, los médicos podrán crear nuevas recetas, seleccionar pacientes, añadir medicamentos
            con sus respectivas dosis, indicaciones y duración del tratamiento. El objetivo final es
            generar un documento de receta listo para imprimir o enviar digitalmente.
          </p>
          <p className="mb-4">
            Esta funcionalidad se encuentra actualmente en desarrollo.
          </p>
          <Button variant="outline" disabled>
            <Construction className="mr-2 h-4 w-4" />
            Generar Nueva Receta (Próximamente)
          </Button>
        </CardContent>
      </Card>

      <Card className="shadow-md">
        <CardHeader>
            <CardTitle className="text-xl">Funcionalidades Futuras Planeadas</CardTitle>
        </CardHeader>
        <CardContent>
            <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>Selección de paciente para asociar la receta.</li>
                <li>Formulario detallado para añadir medicamentos, dosis, vías de administración, frecuencia e indicaciones.</li>
                <li>Búsqueda y autocompletado de medicamentos comunes.</li>
                <li>Plantillas de recetas personalizables.</li>
                <li>Generación de PDF para impresión.</li>
                <li>Historial de recetas emitidas por paciente.</li>
                <li>Posible integración con IA para sugerencias o validaciones (opcional).</li>
            </ul>
        </CardContent>
      </Card>
    </div>
  );
}
