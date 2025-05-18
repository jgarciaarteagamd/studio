
// src/components/patients/PatientTable.tsx
"use client";

import type React from 'react';
import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { PatientRecord } from "@/lib/types";
import { MoreHorizontal, FileEdit, FileText, Trash2, ChevronLeft, ChevronRight, Users } from "lucide-react";
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { getPatientFullName } from "@/lib/mock-data";


interface PatientTableProps {
  patients: PatientRecord[];
}

const ITEMS_PER_PAGE = 10;
// Simulación de rol para esta tabla
const SIMULATED_TABLE_ROLE = 'doctor'; // Cambiar a 'secretary' para probar

export function PatientTable({ patients: initialPatients }: PatientTableProps) {
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState('es-ES');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [patients, setPatients] = useState<PatientRecord[]>(initialPatients);


  useEffect(() => {
    setCurrentLocale(navigator.language || 'es-ES');
    setPatients(initialPatients); // Sincronizar con prop si cambia
  }, [initialPatients]);
  
  // Filtrado de pacientes
  const filteredPatients = useMemo(() => {
    if (!searchTerm) return patients;
    return patients.filter(patient => {
      const fullName = `${patient.personalDetails.nombres} ${patient.personalDetails.apellidos}`.toLowerCase();
      const doc = patient.personalDetails.documentoIdentidad?.toLowerCase() || '';
      const term = searchTerm.toLowerCase();
      return fullName.includes(term) || doc.includes(term);
    });
  }, [searchTerm, patients]);

  // Paginación
  const totalPages = Math.ceil(filteredPatients.length / ITEMS_PER_PAGE);
  const paginatedPatients = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredPatients.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredPatients, currentPage]);

  const handleGenerateReport = (patientId: string) => {
    // Navegar a la pestaña de Informes IA dentro de la página de detalles del paciente
    const patientDetailPage = `/dashboard/patients/${patientId}`;
    // Aquí asumimos que la ReportGenerationSection está en una pestaña con valor "reports"
    router.push(`${patientDetailPage}#reports-tab`); 
    // O si queremos que el Tab se active programáticamente:
    // router.push({ pathname: patientDetailPage, query: { tab: 'reports' } });
    // Y luego en PatientDetailPage, leer el query param para activar el tab.
    // Por simplicidad, el hash es más directo si el Tab ya existe con ese id/value.
    // Como el TabsTrigger tiene value="reports", podemos usar el hash.
    // Sin embargo, para que un hash active un tab, el TabsContent necesita un id y
    // el TabsTrigger un href al id del TabsContent, o JS que maneje el hash.
    // Por ahora, la manera más simple es ir a la página, y el usuario hará click en la pestaña.
    // Actualización: El TabsTrigger en PatientDetailPage usa value="reports", no un ID de hash.
    // Para la navegación directa a la pestaña Informes IA, necesitamos ir a la página del paciente
    // y el usuario seleccionará la pestaña. Para una mejor UX, se necesitaría una lógica
    // más compleja para activar el tab programáticamente o usar un query param.
    // Por ahora, simplemente navegar a la página del paciente es suficiente, y
    // el usuario puede hacer clic en la pestaña "Informes IA".
    // Una forma más directa es enfocar el tab:
    router.push(`/dashboard/patients/${patientId}`);
    // Pequeño delay para asegurar que la página ha cargado antes de intentar enfocar.
    setTimeout(() => {
      // Intentar seleccionar la pestaña 'reports' si existe.
      // Esto es una simplificación y puede necesitar ajustes dependiendo de la estructura exacta del DOM.
      const reportTabTrigger = document.querySelector('button[data-state][value="reports"]') as HTMLElement;
      if (reportTabTrigger) {
        reportTabTrigger.click();
      } else {
        // Si no se puede hacer clic, al menos hemos navegado a la página del paciente.
        // console.warn("No se pudo encontrar el activador de la pestaña de informes para hacer clic programático.");
      }
    }, 100);
    
  };
  
  const handleDeletePatient = (patientId: string) => {
    if (confirm("¿Está seguro de que desea eliminar este historial de paciente? Esta acción no se puede deshacer.")) {
      alert(`Eliminar paciente ${patientId} (simulado - no se elimina de mock data permanentemente)`);
      // En una aplicación real, aquí se llamaría a una API para eliminar
      // Por ahora, podemos filtrar el estado local para simular la eliminación en la UI:
      // setPatients(prev => prev.filter(p => p.id !== patientId));
      // Esto causaría problemas si la prop `initialPatients` no se actualiza,
      // así que para este mock es mejor solo mostrar el alert.
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  if (!patients.length && !searchTerm) {
    return (
        <div className="text-center py-10">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">No hay pacientes registrados.</p>
          <Button asChild className="mt-6">
            <Link href="/dashboard/patients/new">Crear Primer Historial de Paciente</Link>
          </Button>
        </div>
      );
  }


  return (
    <div className="space-y-4">
      <Input
        placeholder="Buscar por nombre, apellidos o documento..."
        value={searchTerm}
        onChange={(e) => {
          setSearchTerm(e.target.value);
          setCurrentPage(1); // Reset a la primera página con cada búsqueda
        }}
        className="max-w-sm"
      />
      {paginatedPatients.length === 0 && searchTerm && (
        <p className="text-muted-foreground text-center py-4">No se encontraron pacientes con "{searchTerm}".</p>
      )}
      {paginatedPatients.length > 0 && (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre Completo</TableHead>
                <TableHead className="hidden sm:table-cell">Documento</TableHead>
                <TableHead className="hidden md:table-cell">Fecha de Nacimiento</TableHead>
                <TableHead className="hidden lg:table-cell">Contacto Principal</TableHead>
                <TableHead>Última Actualización</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedPatients.map((patient) => (
                <TableRow key={patient.id}>
                  <TableCell className="font-medium">
                    <Link href={`/dashboard/patients/${patient.id}`} className="hover:underline text-primary">
                      {getPatientFullName(patient)}
                    </Link>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{patient.personalDetails.documentoIdentidad || 'N/A'}</TableCell>
                  <TableCell className="hidden md:table-cell">{format(new Date(patient.personalDetails.fechaNacimiento), "P", { locale: es })}</TableCell>
                  <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-xs">
                    {patient.personalDetails.email || patient.personalDetails.telefono1 || 'N/A'}
                  </TableCell>
                  <TableCell>{format(new Date(patient.updatedAt), "P", { locale: es })}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menú</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => router.push(`/dashboard/patients/${patient.id}`)}>
                          <FileEdit className="mr-2 h-4 w-4" />
                          Ver/Editar Historial
                        </DropdownMenuItem>
                        {SIMULATED_TABLE_ROLE === 'doctor' && (
                          <>
                            <DropdownMenuItem onClick={() => handleGenerateReport(patient.id)}>
                              <FileText className="mr-2 h-4 w-4" />
                              Generar Informe IA
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeletePatient(patient.id)} 
                              className="text-destructive focus:text-destructive focus:bg-destructive/10"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}

    