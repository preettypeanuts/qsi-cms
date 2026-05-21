"use client";

import { useState } from "react";

import { CertificateManagement } from "@/components/dashboard/certificate-management";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { TopNavbar } from "@/components/dashboard/top-navbar";

export default function CertificatePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="h-screen overflow-hidden bg-slate-100 text-slate-950">
      <div className="flex h-screen overflow-hidden bg-slate-50">
        <aside className="hidden h-screen max-h-screen shrink-0 border-slate-200 border-r bg-white p-4 md:flex md:flex-col">
          <DashboardSidebar />
        </aside>

        <MobileSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <div className="flex h-screen min-w-0 flex-1 flex-col overflow-hidden">
          <TopNavbar
            showSearch={false}
            title="Sertifikat"
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          <main className="min-h-0 flex-1 overflow-hidden">
            <CertificateManagement />
          </main>
        </div>
      </div>
    </div>
  );
}
