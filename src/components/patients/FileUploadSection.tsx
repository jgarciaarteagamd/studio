
// src/components/patients/FileUploadSection.tsx
"use client";

import type React from 'react';
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import type { Attachment } from "@/lib/types";
import { UploadCloud, Trash2, FileArchive, FileText, Image as ImageIcon, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";


interface FileUploadSectionProps {
  attachments: Attachment[];
  onFileUpload: (file: File) => void;
  onDeleteAttachments: (attachmentIdsToDelete: string[]) => void;
  className?: string;
}

const getFileIcon = (type: Attachment['type']) => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />;
    case 'image':
      return <ImageIcon className="h-5 w-5 text-blue-500 flex-shrink-0" />;
    default:
      return <FileArchive className="h-5 w-5 text-gray-500 flex-shrink-0" />;
  }
};

export function FileUploadSection({ attachments, onFileUpload, onDeleteAttachments, className }: FileUploadSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const hiddenFileInputRef = useRef<HTMLInputElement>(null);
  const [currentLocale, setCurrentLocale] = useState('es-ES');
  const [selectedAttachmentIds, setSelectedAttachmentIds] = useState<string[]>([]);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);


  useEffect(() => {
    setCurrentLocale(navigator.language || 'es-ES');
  }, []);

  // Reset selection when attachments list changes (e.g., after deletion from parent)
  useEffect(() => {
    setSelectedAttachmentIds([]);
  }, [attachments]);


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleUploadClick = () => {
    if (selectedFile) {
      onFileUpload(selectedFile);
      setSelectedFile(null);
      if (hiddenFileInputRef.current) {
        hiddenFileInputRef.current.value = ""; 
      }
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

  const prepareToDeleteSelected = () => {
    if (selectedAttachmentIds.length === 0) {
      alert("No hay archivos seleccionados para eliminar.");
      return;
    }
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDeleteSelected = () => {
    onDeleteAttachments(selectedAttachmentIds);
    setIsDeleteDialogOpen(false);
    // selectedAttachmentIds will be reset by the useEffect watching `attachments` prop
  };
  

  return (
    <div className={cn("space-y-4 w-full", className)}>
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Subir Nuevo Adjunto</CardTitle>
          <CardDescription>Seleccione un archivo (PDF, imagen, etc.).</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-center gap-4">
          <div className="flex flex-col items-start gap-1 flex-grow">
            <p className="text-sm text-muted-foreground h-6 flex items-center">
              {selectedFile ? selectedFile.name : "Nada seleccionado"}
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full sm:w-auto"
              onClick={() => hiddenFileInputRef.current?.click()}
            >
              Seleccionar archivo
            </Button>
            <Input
              type="file"
              onChange={handleFileChange}
              ref={hiddenFileInputRef}
              className="hidden"
            />
          </div>
          <Button onClick={handleUploadClick} disabled={!selectedFile}>
            <UploadCloud className="mr-2 h-4 w-4" />
            Subir Archivo
          </Button>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader className="flex flex-col p-6 gap-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
            <CardTitle>Archivos Adjuntos</CardTitle>
            {attachments.length > 0 && (
              <Button
                variant="destructive"
                onClick={prepareToDeleteSelected}
                disabled={selectedAttachmentIds.length === 0}
                size="sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar Seleccionados ({selectedAttachmentIds.length})
              </Button>
            )}
          </div>
          {attachments.length > 0 && (
             <div className="flex items-center space-x-2 mt-8 pt-8">
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
                      "flex items-center gap-3 p-3 border rounded-md transition-colors hover:bg-muted/50 overflow-hidden", 
                      selectedAttachmentIds.includes(attachment.id) ? "bg-primary/10 border-primary" : ""
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
             <div className="flex flex-col items-center justify-center py-10 text-center h-full">
                <FileArchive className="h-12 w-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">Aún no hay archivos adjuntos a este historial.</p>
             </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Está seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará los archivos seleccionados de forma simulada. En una aplicación real, esto podría ser irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSelected}>
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

