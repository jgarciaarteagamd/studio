// src/app/dashboard/admin/users/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, UserPlus, LockKeyhole, Settings, MoreHorizontal, Edit, Trash2, ShieldCheck, ShieldOff, MailWarning, ChevronLeft, ChevronRight } from "lucide-react";
import type { AssistantUser } from "@/lib/types";
import { getMockAssistants, SIMULATED_CURRENT_ROLE } from "@/lib/mock-data";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';


const ITEMS_PER_PAGE = 5;

export default function UserManagementPage() {
  const [assistants, setAssistants] = useState<AssistantUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  // El acceso a esta página ya está controlado por SidebarNav para SIMULATED_CURRENT_ROLE === 'doctor'
  if (SIMULATED_CURRENT_ROLE !== 'doctor') {
     return (
      <div className="space-y-6">
        <Card className="shadow-lg">
          <CardHeader><CardTitle className="text-3xl">Acceso Denegado</CardTitle></CardHeader>
          <CardContent><p>Esta sección es exclusiva para el médico administrador.</p></CardContent>
        </Card>
      </div>
    );
  }
  
  useEffect(() => {
    setAssistants(getMockAssistants());
    setIsLoading(false);
  }, []);

  const filteredAssistants = assistants.filter(assistant =>
    assistant.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assistant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assistant.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredAssistants.length / ITEMS_PER_PAGE);
  const paginatedAssistants = filteredAssistants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const getStatusBadgeVariant = (status: AssistantUser['estado']): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'activo': return 'default';
      case 'inactivo': return 'destructive';
      case 'pendiente_aprobacion': return 'secondary';
      default: return 'outline';
    }
  };
  
  const getStatusText = (status: AssistantUser['estado']): string => {
    const map: Record<AssistantUser['estado'], string> = {
      activo: "Activo",
      inactivo: "Inactivo",
      pendiente_aprobacion: "Pendiente Aprobación",
    };
    return map[status] || status;
  };


  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
                <Settings className="h-8 w-8 text-primary" />
                <CardTitle className="text-3xl">Gestión de Usuarios Asistenciales</CardTitle>
            </div>
            <Button onClick={() => alert("Abrir modal para crear nuevo usuario asistencial (no implementado).")} disabled>
              <UserPlus className="mr-2 h-5 w-5" />
              Crear Usuario Asistencial
            </Button>
          </div>
          <CardDescription>
            Administre las cuentas y permisos del personal asistencial (secretarios/as).
          </CardDescription>
        </CardHeader>
        <CardContent>
           <div className="mb-4">
            <Input
              placeholder="Buscar por nombre, usuario o email..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
              className="max-w-sm"
            />
          </div>
          {isLoading ? (
            <p>Cargando usuarios...</p>
          ) : paginatedAssistants.length > 0 ? (
            <>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuario</TableHead>
                    <TableHead>Nombre Completo</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                    <TableHead className="text-center">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAssistants.map((assistant) => (
                    <TableRow key={assistant.id}>
                      <TableCell className="font-medium">{assistant.username}</TableCell>
                      <TableCell>{assistant.nombreCompleto}</TableCell>
                      <TableCell>{assistant.email}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={getStatusBadgeVariant(assistant.estado)}>{getStatusText(assistant.estado)}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0" disabled>
                              <span className="sr-only">Abrir menú</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => alert(`Editar permisos de ${assistant.nombreCompleto} (no implementado).`)} disabled>
                              <LockKeyhole className="mr-2 h-4 w-4" /> Editar Permisos
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert(`Cambiar estado de ${assistant.nombreCompleto} (no implementado).`)} disabled>
                               {assistant.estado === 'activo' ? <ShieldOff className="mr-2 h-4 w-4" /> : <ShieldCheck className="mr-2 h-4 w-4" />}
                               {assistant.estado === 'activo' ? 'Desactivar' : 'Activar'}
                               {assistant.estado === 'pendiente_aprobacion' && ' / Aprobar'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => alert(`Restablecer contraseña de ${assistant.nombreCompleto} (no implementado).`)} disabled>
                              <MailWarning className="mr-2 h-4 w-4" /> Restablecer Contraseña
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive focus:bg-destructive/10 focus:text-destructive" onClick={() => alert(`Eliminar ${assistant.nombreCompleto} (no implementado).`)} disabled>
                              <Trash2 className="mr-2 h-4 w-4" /> Eliminar Usuario
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
            </>
          ) : (
            <p className="text-muted-foreground text-center py-4">
              {searchTerm ? `No se encontraron usuarios para "${searchTerm}".` : "No hay usuarios asistenciales registrados."}
            </p>
          )}
          <CardFooter className="pt-6">
            <ul className="text-xs text-muted-foreground list-disc pl-4 space-y-1">
                <li>La creación de nuevos usuarios, edición de permisos y otras acciones se implementarán en futuras versiones.</li>
                <li>La generación de nombres de usuario y contraseñas iniciales será automática.</li>
                <li>Los permisos detallados permitirán controlar el acceso a: creación y modificación de pacientes, gestión de adjuntos, programación en agenda, cambio de estado de citas, y acceso a la facturación.</li>
            </ul>
           </CardFooter>
        </CardContent>
      </Card>
    </div>
  );
}
