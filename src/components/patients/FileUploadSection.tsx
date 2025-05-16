// src/components/patients/FileUploadSection.tsx
"use client";

import type React from 'react';
import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { Attachment } from "@/lib/types";
import { UploadCloud, FileText, ImageIcon, Trash2, Download } from "lucide-react";

interface FileUploadSectionProps {
  attachments: Attachment[];
  onFileUpload: (file: File) => void;
  // onFileDelete: (attachmentId: string) => void; // Future implementation
}

export function FileUploadSection({ attachments, onFileUpload }: FileUploadSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      alert("Please select a file first.");
    }
  };

  const getFileIcon = (type: Attachment['type']) => {
    if (type === 'pdf') return <FileText className="h-5 w-5 text-red-500" />;
    if (type === 'image') return <ImageIcon className="h-5 w-5 text-blue-500" />;
    return <FileText className="h-5 w-5 text-gray-500" />;
  };
  
  const handleOpenFile = (driveLink: string) => {
    alert(`Opening file (mock): ${driveLink}. In a real app, this would open the Google Drive file.`);
  };

  const handleDeleteFile = (attachmentId: string) => {
    if(confirm("Are you sure you want to delete this attachment? This action might be irreversible depending on Google Drive settings.")) {
      alert(`Deleting attachment ${attachmentId} (not implemented)`);
      // Call onFileDelete(attachmentId) here when implemented
    }
  };


  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload New Attachment</CardTitle>
          <CardDescription>Select a file (PDF, image, etc.) to link to this patient's record. Files will be stored in your Google Drive.</CardDescription>
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
            Upload File
          </Button>
        </CardContent>
        {selectedFile && (
            <CardFooter>
                <p className="text-sm text-muted-foreground">Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(2)} KB)</p>
            </CardFooter>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Attached Files</CardTitle>
        </CardHeader>
        <CardContent>
          {attachments.length > 0 ? (
            <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">Type</TableHead>
                  <TableHead>File Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Uploaded</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
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
                    <TableCell className="hidden sm:table-cell">{new Date(attachment.uploadedAt).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right space-x-2">
                       <Button variant="outline" size="icon" onClick={() => handleOpenFile(attachment.driveLink)} title="Open/Download File (mock)">
                         <Download className="h-4 w-4" />
                       </Button>
                       <Button variant="destructive" size="icon" onClick={() => handleDeleteFile(attachment.id)} title="Delete File (mock)">
                         <Trash2 className="h-4 w-4" />
                       </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-4">No files attached to this record yet.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
