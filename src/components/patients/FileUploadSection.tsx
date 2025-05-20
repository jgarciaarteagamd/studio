
// src/components/patients/FileUploadSection.tsx
"use client";

import type React from 'react';
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Attachment } from "@/lib/types";
import { UploadCloud, Trash2, FileText, FileImage, FileArchive, Download } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadSectionProps {
  attachments: Attachment[];
  onFileUpload: (file: File) => void;
  // onFileDelete: (attachmentIds: string[]) => void; // Futura implementación para eliminación real
}

export function FileUploadSection({ attachments, onFileUpload }: FileUploadSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentLocale, setCurrentLocale] = useState('es-ES');
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);

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
      setSelectedAttachmentIds([]); // Deseleccionar todo después de subir un nuevo archivo
    } else {
      alert("Por favor, seleccione un archivo primero.");
    }
  };
  
  const handleOpenFile = (driveLink: string) => {
    alert(`Abriendo/Descargando archivo (simulado): ${driveLink}. En una aplicación real, esto abriría o descargaría el archivo de Google Drive.`);
  };

  const handleSelectAttachment = (attachmentId: string) => {
    setSelectedAttachmentIds(prevSelected =>
      prevSelected.includes(attachmentId)
        ? prevSelected.filter(id => id !== attachmentId)
        : [...prevSelected, attachmentId]
    );
  };

  const handleSelectAll = () => {
    if (selectedAttachmentIds.length === attachments.length && attachments.length > 0) {
      setSelectedAttachmentIds([]);
    } else {
      setSelectedAttachmentIds(attachments.map(att => att.id));
    }
  };

  const handleDeleteSelected = () => {
    if (selectedAttachmentIds.length === 0) {
      alert("No hay archivos seleccionados para eliminar.");
      return;
    }
    if (confirm(`¿Está seguro de que desea eliminar ${selectedAttachmentIds.length} archivo(s) adjunto(s)? Esta acción podría ser irreversible.`)) {
      alert(`Eliminando archivos adjuntos con IDs: ${selectedAttachmentIds.join(', ')} (simulado).`);
      // Aquí iría la lógica para llamar a onFileDelete(selectedAttachmentIds)
      // y actualizar la lista de adjuntos.
      // Por ahora, solo deseleccionamos:
      setSelectedAttachmentIds([]);
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
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <CardTitle>Archivos Adjuntos</CardTitle>
            {attachments.length > 0 && (
              <Button 
                variant="destructive" 
                onClick={handleDeleteSelected} 
                disabled={selectedAttachmentIds.length === 0}
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Seleccionados ({selectedAttachmentIds.length})
              </Button>
            )}
          </div>
          {attachments.length > 0 && (
             <div className="flex items-center space-x-2 pt-8 border-t mt-8"> {/* mt-10 cambiado a mt-8 */}
                <Checkbox
                    id="selectAllAttachments"
                    checked={selectedAttachmentIds.length === attachments.length && attachments.length > 0}
                    onCheckedChange={handleSelectAll}
                    aria-label="Seleccionar todos los adjuntos"
                />
                <label
                    htmlFor="selectAllAttachments"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                    Seleccionar Todos ({attachments.length})
                </label>
            </div>
          )}
        </CardHeader>
        <CardContent> 
          {attachments.length > 0 ? (
            <ul className="space-y-3">
              {attachments.map((attachment) => (
                <li 
                  key={attachment.id} 
                  className={cn(
                    "flex items-center gap-3 p-3 border rounded-md transition-colors",
                    selectedAttachmentIds.includes(attachment.id) ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                  )}
                >
                  <Checkbox
                    id={`attachment-${attachment.id}`}
                    checked={selectedAttachmentIds.includes(attachment.id)}
                    onCheckedChange={() => handleSelectAttachment(attachment.id)}
                    aria-labelledby={`attachment-name-${attachment.id}`}
                    className="flex-shrink-0"
                  />
                  <div className="flex-grow min-w-0"> 
                    <button 
                      id={`attachment-name-${attachment.id}`}
                      onClick={() => handleOpenFile(attachment.driveLink)} 
                      className="font-medium text-primary hover:underline truncate text-left block w-full"
                      title={attachment.name}
                    >
                      {attachment.name}
                    </button>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Subido: {new Date(attachment.uploadedAt).toLocaleDateString(currentLocale)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-center py-4">Aún no hay archivos adjuntos a este historial.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
