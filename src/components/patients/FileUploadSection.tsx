
// src/components/patients/FileUploadSection.tsx
"use client";

import type React from 'react';
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import type { Attachment } from "@/lib/types";
import { UploadCloud, Trash2, AlertCircle, FileText, FileImage, FileArchive } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileUploadSectionProps {
  attachments: Attachment[];
  onFileUpload: (file: File) => void;
}

export function FileUploadSection({ attachments, onFileUpload }: FileUploadSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [currentLocale, setCurrentLocale] = useState('es-ES');
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);

  useEffect(() => {
    setCurrentLocale(navigator.language || 'es-ES');
  }, []);

  useEffect(() => {
    // Reset selection when attachments list changes (e.g., after upload or deletion if implemented)
    setSelectedAttachmentIds([]);
  }, [attachments]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
      setSelectedFile(null); // Reset after upload
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear the file input
      }
    } else {
      alert("Por favor, seleccione un archivo primero.");
    }
  };
  
  const handleOpenFile = (driveLink: string) => {
    // In a real app, this would open the file from Google Drive or trigger a download
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
    // Placeholder for actual deletion logic
    // This should eventually call a function to update the patient's attachments array
    // and potentially delete from Google Drive
    if (confirm(`¿Está seguro de que desea eliminar ${selectedAttachmentIds.length} archivo(s) adjunto(s)? Esta acción podría ser irreversible.`)) {
      alert(`Eliminando archivos adjuntos con IDs: ${selectedAttachmentIds.join(', ')} (simulado).`);
      // Example: onFilesDelete(selectedAttachmentIds); // This prop would come from the parent page
      setSelectedAttachmentIds([]); // Clear selection after "deletion"
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
        <CardHeader className="flex flex-col p-6 gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
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
             <div className="flex items-center space-x-2 mt-10 pt-8">
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
                    <div
                      id={`attachment-name-${attachment.id}`}
                      onClick={() => handleOpenFile(attachment.driveLink)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleOpenFile(attachment.driveLink); }}
                      role="button"
                      tabIndex={0}
                      className="font-medium text-primary hover:underline text-left block w-full truncate cursor-pointer"
                      title={attachment.name}
                    >
                      {attachment.name}
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Subido: {new Date(attachment.uploadedAt).toLocaleDateString(currentLocale)}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
             <div className="flex flex-col items-center justify-center py-10 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Aún no hay archivos adjuntos a este historial.</p>
             </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
