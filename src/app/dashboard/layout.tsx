// src/app/dashboard/layout.tsx
import type { Metadata } from 'next';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/layout/AppSidebar';
import { AppHeader } from '@/components/layout/AppHeader';
// Toaster y fuentes están en el RootLayout (src/app/layout.tsx)
// globals.css se importa en RootLayout

// No necesitamos importar Geist aquí ya que se maneja en el RootLayout
// y las variables de fuente estarán disponibles.

export const metadata: Metadata = {
  title: 'Panel | EndoCloud',
  description: 'Panel de administración de EndoCloud.',
};

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <AppSidebar />
        <div className="flex flex-1 flex-col">
          <AppHeader />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
