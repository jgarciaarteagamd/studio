// src/app/superadmin/page.tsx
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Redirige al dashboard del superadmin. En un futuro, podría redirigir al login si no hay sesión.
export default function SuperAdminRootPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/superadmin/dashboard'); // O '/superadmin/login'
  }, [router]);

  return (
    <div>
      <p>Redirigiendo al panel de SuperAdmin...</p>
    </div>
  );
}
