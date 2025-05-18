// src/components/layout/SidebarNav.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { LayoutDashboard, Users, CalendarDays, FileSignature, Receipt, UserCircle } from "lucide-react"; // Stethoscope removido
import { cn } from "@/lib/utils";

// En un futuro, este array podría filtrarse según el rol del usuario.
// const userRole = "doctor"; // o "secretary", obtenido del contexto de autenticación

const navItems = [
  { href: "/dashboard", label: "Panel", icon: LayoutDashboard, roles: ["doctor", "secretary"] },
  { href: "/dashboard/patients", label: "Pacientes", icon: Users, roles: ["doctor", "secretary"] },
  // { href: "/dashboard/consultations", label: "Consultas", icon: Stethoscope, roles: ["doctor"] }, // Eliminado
  { href: "/dashboard/recipes", label: "Recetas", icon: FileSignature, roles: ["doctor"] },
  { href: "/dashboard/schedule", label: "Agenda", icon: CalendarDays, roles: ["doctor", "secretary"] },
  { href: "/dashboard/billing", label: "Facturación", icon: Receipt, roles: ["doctor", "secretary"] },
  { href: "/dashboard/profile", label: "Perfil", icon: UserCircle, roles: ["doctor"] },
];

export function SidebarNav() {
  const pathname = usePathname();
  // const userRole = getCurrentUserRole(); // Función hipotética para obtener el rol actual

  return (
    <SidebarMenu>
      {navItems.map((item) => {
        // Lógica de visibilidad por rol (ejemplo conceptual)
        // if (!item.roles.includes(userRole)) {
        //   return null; 
        // }

        const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
        return (
          <SidebarMenuItem key={item.href}>
            <Link href={item.href} passHref legacyBehavior>
              <SidebarMenuButton
                asChild
                isActive={isActive}
                tooltip={{ children: item.label, side: "right", align: "center" }}
                className={cn(
                  isActive ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                <a>
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                </a>
              </SidebarMenuButton>
            </Link>
          </SidebarMenuItem>
        );
      })}
    </SidebarMenu>
  );
}
