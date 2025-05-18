// This file can be deleted or kept as a redirect if direct access is attempted.
// For now, to ensure no errors if a direct navigation occurs, we'll make it a simple redirect to the new page.
// In a real app, you might remove this or handle it differently.
"use client";
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ConsultationsRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/dashboard/consultations/new');
  }, [router]);

  return (
    <div>
      <p>Redirigiendo a la nueva página de consultas...</p>
    </div>
  );
}
