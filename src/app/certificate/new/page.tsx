"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  CertificateForm,
  type CertificateFormValues,
  mapFormValuesToCertificatePayload,
} from "@/components/dashboard/certificate-form";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { toast } from "@/components/ui/toaster";

export default function NewCertificatePage() {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  async function handleSave(values: CertificateFormValues) {
    const response = await fetch("/api/certificates", {
      body: JSON.stringify(mapFormValuesToCertificatePayload(values)),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    });

    if (!response.ok) {
      toast({
        description: "Data sertifikat belum berhasil disimpan.",
        title: "Gagal menambahkan sertifikat",
        variant: "destructive",
      });
      return;
    }

    toast({
      description: "Data baru sudah masuk ke manajemen sertifikat.",
      title: "Sertifikat berhasil ditambahkan",
      variant: "success",
    });
    router.push("/certificate");
    router.refresh();
  }

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
            title="Tambah Sertifikat"
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          <main className="flex-1 overflow-hidden">
            <CertificateForm
              className="min-h-full rounded-none border-0 shadow-none"
              onCancel={() => router.push("/certificate")}
              onSave={handleSave}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
