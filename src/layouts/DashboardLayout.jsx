import React from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { TopNav } from "@/components/layout/TopNav";

export function DashboardLayout({ children, role }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar role={role} />
        <div className="flex flex-1 flex-col">
          <TopNav userRole={role} />
          <main className="flex-1 p-6 bg-background">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
