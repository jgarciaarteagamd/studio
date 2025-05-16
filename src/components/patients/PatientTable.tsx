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

interface PatientTableProps {
  patients: PatientRecord[];
}

export function PatientTable({ patients }: PatientTableProps) {
  const router = useRouter();

  const handleGenerateReport = (patientId: string) => {
    alert(`Generate report for patient ${patientId} (not implemented)`);
    // Potentially navigate to a report generation page or open a modal
    // router.push(`/patients/${patientId}/report`);
  };
  
  const handleDeletePatient = (patientId: string) => {
    if (confirm("Are you sure you want to delete this patient record? This action cannot be undone.")) {
      alert(`Delete patient ${patientId} (not implemented)`);
      // Add logic to remove patient from mock data or call API
    }
  };


  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead className="hidden md:table-cell">Date of Birth</TableHead>
            <TableHead className="hidden lg:table-cell">Contact Info</TableHead>
            <TableHead>Last Updated</TableHead>
            <TableHead className="text-right">Actions</TableHead>
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
              <TableCell className="hidden md:table-cell">{new Date(patient.dateOfBirth).toLocaleDateString()}</TableCell>
              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground truncate max-w-xs">{patient.contactInfo}</TableCell>
              <TableCell>{new Date(patient.updatedAt).toLocaleDateString()}</TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={() => router.push(`/patients/${patient.id}`)}>
                      <FileEdit className="mr-2 h-4 w-4" />
                      View/Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleGenerateReport(patient.id)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Generate Report
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeletePatient(patient.id)} 
                      className="text-destructive focus:text-destructive focus:bg-destructive/10"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
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
