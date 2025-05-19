
// src/components/patients/FileUploadSection.tsx
"use client";

import type React from 'react';
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Attachment } from "@/lib/types";
import { UploadCloud, FileText, ImageIcon, Trash2, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadSectionProps {
  attachments: Attachment[];
  onFileUpload: (file: File) => void;
  // onFileDelete: (attachmentId: string) => void; // Future implementation
}

export function FileUploadSection({ attachments, onFileUpload }: FileUploadSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentLocale, setCurrentLocale] = useState('es-ES');

  useEffect(() => {
    setCurrentLocale(navigator.language || 'es-ES');
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Reset file input
      }
    } else {
      alert("Por favor, seleccione un archivo primero.");
    }
  };

  const getFileIcon = (type: Attachment['type']) => {
    if (type === 'pdf') return <FileText className="h-5 w-5 text-red-500" />;
    if (type === 'image') return <ImageIcon className="h-5 w-5 text-blue-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };
  
  const handleOpenFile = (driveLink: string) => {
    alert(`Abriendo archivo (simulado): ${driveLink}. En una aplicación real, esto abriría el archivo de Google Drive.`);
  };

  const handleDeleteFile = (attachmentId: string) => {
    if(confirm("¿Está seguro de que desea eliminar este archivo adjunto? Esta acción podría ser irreversible dependiendo de la configuración de Google Drive.")) {
      alert(`Eliminando archivo adjunto ${attachmentId} (no implementado)`);
      // Call onFileDelete(attachmentId) here when implemented
    }
  };


  return (
    <div className="space-y-6 w-full">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Subir Nuevo Adjunto</CardTitle>
          <CardDescription>Seleccione un archivo (PDF, imagen, etc.) para vincularlo al historial de este paciente. Los archivos se guardarán en su Google Drive.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <Input 
            type="file" 
            onChange={handleFileChange} 
            ref={fileInputRef} 
            className="flex-grow"
          />
          <Button onClick={handleUploadClick} disabled={!selectedFile}>
            <UploadCloud className="mr-2 h-4 w-4" />
            Subir Archivo
          </Button>
        </CardContent>
        {selectedFile && (
            <CardFooter>
                <p className="text-sm text-muted-foreground">Seleccionado: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>
            </CardFooter>
        )}
      </Card>

      <Card className="w-full">
        <CardHeader>
          <CardTitle>Archivos Adjuntos</CardTitle>
        </CardHeader>
        <CardContent>
          {attachments.length > 0 ? (
            <div className="rounded-md border"> {/* Se elimina w-full de este div */}
              <Table> 
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px]">Tipo</TableHead>
                    <TableHead>Nombre del Archivo</TableHead>
                    <TableHead className="hidden sm:table-cell">Subido</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attachments.map((attachment) => (
                    <TableRow key={attachment.id}>
                      <TableCell>{getFileIcon(attachment.type)}</TableCell>
                      <TableCell className="font-medium truncate max-w-xs">
                        <button onClick={() => handleOpenFile(attachment.driveLink)} className="hover:underline text-primary">
                          {attachment.name}
                        </button>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{new Date(attachment.uploadedAt).toLocaleDateString(currentLocale)}</TableCell>
                      <TableCell className="text-right space-x-2">
                         <Button variant="outline" size="icon" onClick={() => handleOpenFile(attachment.driveLink)} title="Abrir/Descargar Archivo (simulado)">
                           <Download className="h-4 w-4" />
                         </Button>
                         <Button variant="destructive" size="icon" onClick={() => handleDeleteFile(attachment.id)} title="Eliminar Archivo (simulado)">
                           <Trash2 className="h-4 w-4" />
                         </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">Aún no hay archivos adjuntos a este historial.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
