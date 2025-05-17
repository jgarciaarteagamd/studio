// src/app/dashboard/page.tsx (Anteriormente src/app/page.tsx)
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { mockPatients } from "@/lib/mock-data";
import { FileText, Users, BarChart3, AlertTriangle } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';
import { useState, useEffect } from 'react'; 

// Helper component to render date on client-side to avoid hydration mismatch
const PatientLastUpdatedDisplay = ({ updatedAt }: { updatedAt: string }) => {
  const [formattedDate, setFormattedDate] = useState<string | null>(null);
  const [currentLocale, setCurrentLocale] = useState('es-ES');

  useEffect(() => {
    setCurrentLocale(navigator.language || 'es-ES');
    // This effect runs only on the client, after initial hydration
    setFormattedDate(new Date(updatedAt).toLocaleDateString(navigator.language || 'es-ES')); // Prioritize browser locale, fallback to Spanish
  }, [updatedAt]); // Recalculate if updatedAt changes

  // Render placeholder during SSR and initial client render, then client-side formatted date
  return <>{formattedDate || "..."}</>;
};

export default function DashboardPage() {
  const recentPatients = mockPatients.slice(0, 3); // Show 3 most recent for demo

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-3xl">Bienvenido a EndoCloud Notes</CardTitle>
          <CardDescription>Tu centro de gestión de pacientes de endocrinología.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            Gestiona eficientemente los historiales de los pacientes, genera informes detallados y optimiza tu flujo de trabajo.
            Todos tus datos pueden almacenarse y gestionarse de forma segura en tu Google Drive.
          </p>
          <Button onClick={() => alert("Acción Conectar a Google Drive (no implementada)")}>
            <AlertTriangle className="mr-2 h-4 w-4" />
            Conectar a Google Drive
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pacientes Totales</CardTitle>
            <Users className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockPatients.length}</div>
            <p className="text-xs text-muted-foreground">
              Historiales de pacientes gestionados actualmente
            </p>
            <Button asChild size="sm" className="mt-4 w-full">
              <Link href="/dashboard/patients">Ver Todos los Pacientes</Link>
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Informes Generados</CardTitle>
            <FileText className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0 <span className="text-sm text-muted-foreground">(Ejemplo)</span></div>
            <p className="text-xs text-muted-foreground">
              Informes creados con IA
            </p>
             <Button size="sm" className="mt-4 w-full" variant="outline" onClick={() => alert("Funcionalidad no implementada completamente")}>
              Generar Nuevo Informe
            </Button>
          </CardContent>
        </Card>
        <Card className="shadow-md hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Almacenamiento en Drive</CardTitle>
            <BarChart3 className="h-5 w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">N/A</div>
            <p className="text-xs text-muted-foreground">
              Conecta Google Drive para ver el uso
            </p>
            <Button size="sm" className="mt-4 w-full" variant="outline" onClick={() => alert("Acción Conectar a Google Drive (no implementada)")}>
              Verificar Almacenamiento
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Pacientes Recientemente Accedidos</CardTitle>
        </CardHeader>
        <CardContent>
          {recentPatients.length > 0 ? (
            <ul className="space-y-3">
              {recentPatients.map((patient) => (
                <li key={patient.id} className="flex items-center justify-between rounded-md border p-3 hover:bg-muted/50 transition-colors">
                  <div>
                    <Link href={`/dashboard/patients/${patient.id}`} className="font-medium text-primary hover:underline">
                      {patient.name}
                    </Link>
                    <p className="text-sm text-muted-foreground">Última actualización: <PatientLastUpdatedDisplay updatedAt={patient.updatedAt} /></p>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/dashboard/patients/${patient.id}`}>Ver Historial</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground">No hay pacientes recientes para mostrar.</p>
          )}
        </CardContent>
      </Card>
       <div className="mt-8 p-6 bg-card rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Placeholder Visual de la App</h3>
        <Image 
          src="https://placehold.co/800x300.png" 
          alt="Placeholder Visual de la App" 
          width={800} 
          height={300} 
          className="rounded-md object-cover"
          data-ai-hint="medical dashboard" 
        />
        <p className="text-sm text-muted-foreground mt-2">Esta es una imagen de marcador de posición que representa una posible interfaz de usuario o visualización de datos dentro de la aplicación.</p>
      </div>
    </div>
  );
}
