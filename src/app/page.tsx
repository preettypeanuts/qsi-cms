"use client";

import { useEffect, useMemo, useState } from "react";

import { CertificatesTable } from "@/components/dashboard/certificates-table";
import {
  type CertificateRecord,
  getDashboardStats,
} from "@/components/dashboard/dashboard-data";
import { MobileSidebar } from "@/components/dashboard/mobile-sidebar";
import { DashboardSidebar } from "@/components/dashboard/sidebar";
import { StatsGrid } from "@/components/dashboard/stats-grid";
import { TopNavbar } from "@/components/dashboard/top-navbar";

export default function Home() {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [query, setQuery] = useState("");
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

  const filteredCertificates = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return certificates;
    }

    return certificates.filter((item) =>
      [item.id, item.company, item.standard, item.status]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [query, certificates]);

  const stats = useMemo(() => getDashboardStats(certificates), [certificates]);

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
            query={query}
            onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
            onQueryChange={setQuery}
          />

          <main className="flex-1 space-y-5 p-4 sm:p-6">
            <StatsGrid isLoading={isLoading} stats={stats} />
            <CertificatesTable
              certificates={filteredCertificates}
              isLoading={isLoading}
              query={query}
              onQueryChange={setQuery}
            />
          </main>
        </div>
      </div>
    </div>
  );
}
