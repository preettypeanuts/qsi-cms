"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { CertificatesTable } from "@/components/dashboard/certificates-table";
import {
  type CertificateRecord,
  getDashboardStats,
} from "@/components/dashboard/dashboard-data";
import { ExpiredCertificatesWidget } from "@/components/dashboard/expired-certificates-widget";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { TopNavbar } from "@/components/dashboard/top-navbar";

export default function Home() {
  const router = useRouter();
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function loadCertificates() {
      setIsLoading(true);

      const response = await fetch("/api/certificates");

      if (!response.ok) {
        setIsLoading(false);
        return;
      }

      const result = (await response.json()) as { data: CertificateRecord[] };
      setCertificates(result.data);
      setIsLoading(false);
    }

    void loadCertificates();
  }, []);

  const stats = useMemo(() => getDashboardStats(certificates), [certificates]);

  function handleDashboardSearch(value: string) {
    const trimmedValue = value.trim();
    const targetPath = trimmedValue
      ? `/certificate?q=${encodeURIComponent(trimmedValue)}`
      : "/certificate";

    router.push(targetPath);
  }

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
            query=""
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onQueryChange={handleDashboardSearch}
          />

          <main className="min-h-0 flex-1 space-y-5 overflow-y-auto p-4 sm:p-6">
            <StatsGrid isLoading={isLoading} stats={stats} />
            <ExpiredCertificatesWidget
              certificates={certificates}
              isLoading={isLoading}
            />
            <CertificatesTable
              certificates={certificates}
              isLoading={isLoading}
              query=""
              onQueryChange={handleDashboardSearch}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
