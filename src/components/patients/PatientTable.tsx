// src/components/patients/PatientTable.tsx
"use client";

import type React from 'react';
import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { PatientRecord } from "@/lib/types";
import { MoreHorizontal, FileEdit, FileText, Trash2 } from "lucide-react";
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';


interface PatientTableProps {
  patients: PatientRecord[];
}

export function PatientTable({ patients }: PatientTableProps) {
  const router = useRouter();
  const [currentLocale, setCurrentLocale] = useState('es-ES');

  useEffect(() => {
    setCurrentLocale(navigator.language || 'es-ES');
  }, []);

  const handleGenerateReport = (patientId: string) => {
    alert(`Generar informe para el paciente ${patientId} (no implementado)`);
    // Potentially navigate to a report generation page or open a modal
    // router.push(`/patients/${patientId}/report`);
  };
  
  const handleDeletePatient = (patientId: string) => {
    if (confirm("¿Está seguro de que desea eliminar este historial de paciente? Esta acción no se puede deshacer.")) {
      alert(`Eliminar paciente ${patientId} (no implementado)`);
      // Add logic to remove patient from mock data or call API
    }
  };


  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead className="hidden md:table-cell">Fecha de Nacimiento</TableHead>
            <TableHead className="hidden lg:table-cell">Información de Contacto</TableHead>
            <TableHead>Última Actualización</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {patients.map((patient) => (
            <TableRow key={patient.id}>
              <TableCell className="font-medium">
                <Link href={`/patients/${patient.id}`} className="hover:underline text-primary">
                  {patient.name}
                </Link>
              </TableCell>
              <TableCell className="hidden md:table-cell">{new Date(patient.dateOfBirth).toLocaleDateString(currentLocale)}</TableCell>
              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-xs">{patient.contactInfo}</TableCell>
              <TableCell>{new Date(patient.updatedAt).toLocaleDateString(currentLocale)}</TableCell>
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
                    <DropdownMenuItem onClick={() => router.push(`/patients/${patient.id}`)}>
                      <FileEdit className="mr-2 h-4 w-4" />
                      Ver/Editar
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleGenerateReport(patient.id)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Generar Informe
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeletePatient(patient.id)} 
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Eliminar
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
