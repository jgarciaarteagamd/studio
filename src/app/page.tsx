"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PatientTable } from "@/components/patients/PatientTable";
// Ya no necesitamos importar mockPatients directamente
// import { mockPatients } from "@/lib/mock-data"; 

// Importamos la Server Action para obtener todos los pacientes
import { fetchAllPatientRecords } from "@/app/actions/patient-actions"; 

import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { useState, useEffect } from 'react';
import type { PatientRecord } from '@/lib/types';
import { useToast } from "@/hooks/use-toast"; // Importamos useToast para mostrar errores si es necesario

export default function PatientsPage() {
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast(); // Inicializamos el hook de toast

  useEffect(() => {
    // Función asíncrona para cargar los pacientes
    const loadPatients = async () => {
      setIsLoading(true);
      try {
        // Llama a la Server Action para obtener los pacientes de Firestore
        const patientsData = await fetchAllPatientRecords(); 
        setPatients(patientsData);
      } catch (error) {
        console.error("Error loading patients:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los historiales de pacientes.",
          variant: "destructive",
        });
        setPatients([]); // Aseguramos que patients sea un array vacío en caso de error
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients(); // Llama a la función de carga al montar el componente
  }, [toast]); // Añadimos toast como dependencia para que el efecto se ejecute si toast cambia (raro, pero buena práctica)

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Historiales de Pacientes</h1>
          <p className="text-muted-foreground">
            Ver, gestionar y crear historiales de pacientes.
          </p>
        </div>
        <Button asChild size="lg">
          <Link href="/patients/new">
            <PlusCircle className="mr-2 h-5 w-5" />
            Agregar Nuevo Paciente
          </Link>
        </Button>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Todos los Pacientes</CardTitle>
          <CardDescription>
            Una lista de todos los historiales de pacientes en el sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p>Cargando datos de pacientes...</p> {/* Considerar usar un Skeleton Loader real */}
          ) : patients.length > 0 ? (
            <PatientTable patients={patients} />
          ) : (
            // Mensaje cuando no hay pacientes (ahora de Firestore)
            <div className="text-center py-10">
              <p className="text-lg text-muted-foreground">No se encontraron pacientes.</p>
              <Button asChild className="mt-4">
                <Link href="/patients/new">Crear Primer Historial de Paciente</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
