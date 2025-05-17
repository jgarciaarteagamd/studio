// src/components/layout/AppHeader.tsx
"use client";

import type React from 'react';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ActivitySquare, LogIn } from 'lucide-react';
import Link from 'next/link';

export function AppHeader() {
  const handleConnectDrive = () => {
    // Placeholder for Google Drive connection logic
    alert('Conectar a Google Drive (funcionalidad no implementada aún)');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-card px-4 shadow-sm sm:px-6 md:px-8">
      <div className="md:hidden">
        <SidebarTrigger />
      </div>
      <Link href="/dashboard" className="flex items-center gap-2 text-lg font-semibold md:text-base">
        <ActivitySquare className="h-6 w-6 text-primary" />
        <h1 className="text-xl font-bold text-foreground">EndoCloud</h1>
      </Link>
      <div className="ml-auto flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={handleConnectDrive}>
          <LogIn className="mr-2 h-4 w-4" />
          Conectar Google Drive
        </Button>
        {/* User profile/avatar placeholder could go here */}
      </div>
    </header>
  );
}
