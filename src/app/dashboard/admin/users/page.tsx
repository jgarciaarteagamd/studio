// src/app/dashboard/admin/users/page.tsx
"use client";

import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { UserPlus, MoreHorizontal, UserCog, AtSign, Fingerprint, ShieldCheck, ShieldOff, MailWarning, Trash2, ChevronLeft, ChevronRight, Settings } from "lucide-react";
import type { AssistantUser } from "@/lib/types";
import { getMockAssistants, SIMULATED_CURRENT_ROLE } from "@/lib/mock-data";


const ITEMS_PER_PAGE = 6;

export default function UserManagementPage() {
  const [assistants, setAssistants] = useState<AssistantUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  if (SIMULATED_CURRENT_ROLE !== 'doctor') {
    return (
      <div className="space-y-6 max-w-5xl mx-auto w-full">
        <Card className="shadow-lg w-full">
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

  const filteredAssistants = useMemo(() => assistants.filter(assistant =>
    assistant.nombreCompleto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assistant.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    assistant.email.toLowerCase().includes(searchTerm.toLowerCase())
  ), [assistants, searchTerm]);

  const totalPages = Math.ceil(filteredAssistants.length / ITEMS_PER_PAGE);
  const paginatedAssistants = useMemo(() => filteredAssistants.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ), [filteredAssistants, currentPage]);

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
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      <Card className="shadow-lg w-full">
        <CardHeader>
          <div className="flex items-center gap-3 mb-2">
              <Settings className="h-8 w-8 text-primary" />
              <CardTitle className="text-3xl">Gestión de Usuarios Asistenciales</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6 p-6 pt-0">
          <CardDescription>
            Administre las cuentas y permisos del personal asistencial (secretarios/as).
          </CardDescription>
          <Button
            onClick={() => alert("Abrir modal para crear nuevo usuario asistencial (no implementado).")}
            disabled
            className="w-full sm:w-auto"
            size="lg"
          >
            <UserPlus className="mr-2 h-5 w-5" />
            Crear Usuario Asistencial
          </Button>
          <Input
            placeholder="Buscar por nombre, usuario o email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="max-w-md"
          />
          {isLoading ? (
            <p>Cargando usuarios...</p>
          ) : paginatedAssistants.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedAssistants.map((assistant) => (
                <Card key={assistant.id} className="shadow-md hover:shadow-lg transition-shadow flex flex-col">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg font-semibold text-primary">{assistant.nombreCompleto}</CardTitle>
                       <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0 -mr-2 -mt-1" disabled>
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => alert(`Editar permisos de ${assistant.nombreCompleto} (no implementado).`)} disabled>
                            <UserCog className="mr-2 h-4 w-4" /> Editar Permisos
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
                    </div>
                     <Badge variant={getStatusBadgeVariant(assistant.estado)} className="text-xs w-fit mt-1">
                        {getStatusText(assistant.estado)}
                      </Badge>
                  </CardHeader>
                  <CardContent className="space-y-1.5 text-sm flex-grow">
                    <div className="flex items-center text-muted-foreground">
                      <Fingerprint className="mr-2 h-4 w-4 " />
                      <span>Usuario: {assistant.username}</span>
                    </div>
                    <div className="flex items-center text-muted-foreground">
                      <AtSign className="mr-2 h-4 w-4 " />
                      <span>Email: {assistant.email}</span>
                    </div>
                     <p className="text-xs text-muted-foreground/80 pt-2">Últ. Actividad: {assistant.lastActivity ? new Date(assistant.lastActivity).toLocaleDateString('es-ES') : 'N/A'}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-10">
              {searchTerm ? `No se encontraron usuarios para "${searchTerm}".` : "No hay usuarios asistenciales registrados."}
            </p>
          )}

          {totalPages > 1 && paginatedAssistants.length > 0 && (
            <div className="flex items-center justify-between pt-8 mt-6 border-t">
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

          <CardFooter className="pt-8 mt-6 border-t">
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
