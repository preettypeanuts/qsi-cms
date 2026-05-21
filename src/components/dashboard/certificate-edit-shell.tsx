"use client";

import { format, parse } from "date-fns";
import { ArrowLeft, FileQuestion } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import {
  CertificateForm,
  type CertificateFormValues,
  mapFormValuesToCertificatePayload,
} from "@/components/dashboard/certificate-form";
import type { CertificateRecord } from "@/components/dashboard/dashboard-data";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { TopNavbar } from "@/components/dashboard/top-navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "@/components/ui/toaster";

type CertificateEditShellProps = {
  certificate?: CertificateRecord;
};

export function CertificateEditShell({
  certificate,
}: CertificateEditShellProps) {
  const router = useRouter();
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
            title="Ubah Sertifikat"
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          />

          <main className="min-h-0 flex-1 overflow-y-auto">
            {certificate ? (
              <CertificateForm
                mode="edit"
                className="min-h-full rounded-none border-0 shadow-none"
                initialValues={mapCertificateToFormValues(certificate)}
                onCancel={() => router.push("/certificate")}
                onSave={async (values) => {
                  const response = await fetch(
                    `/api/certificates/${encodeURIComponent(certificate.id)}`,
                    {
                      body: JSON.stringify(
                        mapFormValuesToCertificatePayload(values),
                      ),
                      headers: {
                        "Content-Type": "application/json",
                      },
                      method: "PUT",
                    },
                  );

                  if (!response.ok) {
                    toast({
                      description:
                        "Perubahan sertifikat belum berhasil disimpan.",
                      title: "Gagal menyimpan perubahan",
                      variant: "destructive",
                    });
                    return;
                  }

                  toast({
                    description: "Perubahan data sertifikat sudah tersimpan.",
                    title: "Sertifikat berhasil diperbarui",
                    variant: "success",
                  });
                  router.push("/certificate");
                  router.refresh();
                }}
              />
            ) : (
              <CertificateNotFound />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}

function CertificateNotFound() {
  return (
    <div className="grid min-h-full place-items-center p-4">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
            <FileQuestion className="size-5" />
          </div>
          <CardTitle>Sertifikat tidak ditemukan</CardTitle>
          <CardDescription>
            Data sertifikat yang ingin diubah tidak tersedia.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link href="/certificate">
              <ArrowLeft className="size-4" />
              Kembali ke daftar sertifikat
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function mapCertificateToFormValues(
  certificate: CertificateRecord,
): CertificateFormValues {
  return {
    auditorName: certificate.auditor,
    certificateNumber: certificate.id,
    certificateType: certificate.standard,
    companyName: certificate.company,
    expiryDate: toDatePickerValue(certificate.expiryDate),
    issueDate: toDatePickerValue(certificate.issuedDate),
    status: certificate.status,
    surveillance1: toDatePickerValue(certificate.surveillance1),
    surveillance2: toDatePickerValue(certificate.surveillance2),
  };
}

function toDatePickerValue(value: string) {
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) {
    return value.slice(0, 10);
  }

  return format(parse(value, "dd MMM yyyy", new Date()), "yyyy-MM-dd");
}
