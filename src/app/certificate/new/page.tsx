"use client";

import { useState } from "react";

import { CertificateForm } from "@/components/dashboard/certificate-form";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { TopNavbar } from "@/components/dashboard/top-navbar";

export default function NewCertificatePage() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="flex min-h-screen overflow-hidden bg-slate-50">
        <aside className="hidden w-64 shrink-0 border-slate-200 border-r bg-white p-4 md:flex md:flex-col">
          <DashboardSidebar />
        </aside>

        <MobileSidebar
          isOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
        />

        <div className="flex min-w-0 flex-1 flex-col">
          <TopNavbar
            showSearch={false}
            title="New Certificate"
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          <main className="flex-1 overflow-hidden">
            <CertificateForm className="min-h-full rounded-none border-0 shadow-none" />
          </main>
        </div>
      </div>
    </div>
  );
}
