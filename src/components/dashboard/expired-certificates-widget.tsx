import { AlertTriangle, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

import type { CertificateRecord } from "@/components/dashboard/dashboard-data";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { formatIndonesianDate } from "@/lib/date-format";

type ExpiredCertificatesWidgetProps = {
  certificates: CertificateRecord[];
  isLoading: boolean;
};

export function ExpiredCertificatesWidget({
  certificates,
  isLoading,
}: ExpiredCertificatesWidgetProps) {
  const expiredCertificates = certificates
    .filter(isCertificateExpired)
    .sort(
      (left, right) =>
        new Date(left.expiryDate).getTime() -
        new Date(right.expiryDate).getTime(),
    );
  const visibleCertificates = expiredCertificates.slice(0, 4);

  return (
    <Card className="overflow-hidden border-red-100 bg-linear-to-br from-white to-red-50/60">
      <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="grid size-10 place-items-center rounded-2xl bg-red-50 text-red-600">
              <AlertTriangle className="size-5" />
            </div>
            <div>
              <CardTitle>Sertifikat Kadaluarsa</CardTitle>
              <CardDescription>
                Sertifikat yang sudah melewati tanggal kadaluarsa atau berstatus
                kadaluarsa.
              </CardDescription>
            </div>
          </div>
        </div>
        <Button asChild variant="outline" size="sm">
          <Link href="/certificate?expiry=expired">
            Lihat semua
            <ArrowRight className="size-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <ExpiredWidgetSkeleton />
        ) : expiredCertificates.length > 0 ? (
          <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
            <div className="rounded-2xl border border-red-100 bg-white/80 p-4">
              <p className="text-red-600 text-sm">Total kadaluarsa</p>
              <p className="mt-2 font-semibold text-4xl text-red-700">
                {expiredCertificates.length}
              </p>
              <p className="mt-3 text-slate-500 text-sm">
                Perlu ditinjau untuk pembaruan status atau perpanjangan.
              </p>
            </div>
            <div className="grid gap-3 md:grid-cols-2">
              {visibleCertificates.map((certificate) => (
                <ExpiredCertificateItem
                  key={certificate.id}
                  certificate={certificate}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 text-emerald-700">
            <div className="grid size-10 place-items-center rounded-2xl bg-white">
              <CheckCircle2 className="size-5" />
            </div>
            <div>
              <p className="font-medium">Tidak ada sertifikat kadaluarsa</p>
              <p className="text-emerald-700/80 text-sm">
                Semua sertifikat masih berada dalam masa berlaku.
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ExpiredCertificateItem({
  certificate,
}: {
  certificate: CertificateRecord;
}) {
  return (
    <Link
      href={`/certificate/${certificate.id}/edit`}
      className="rounded-2xl border border-red-100 bg-white/90 p-4 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-medium">{certificate.company}</p>
          <p className="mt-1 font-mono text-slate-500 text-xs">
            {certificate.id}
          </p>
        </div>
        <Badge variant="expired">Kadaluarsa</Badge>
      </div>
      <div className="mt-4 flex items-center justify-between gap-3 text-sm">
        <span className="text-slate-500">Tanggal kadaluarsa</span>
        <span className="font-medium text-red-700">
          {formatIndonesianDate(certificate.expiryDate)}
        </span>
      </div>
    </Link>
  );
}

function ExpiredWidgetSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
      <div className="rounded-2xl border border-slate-100 bg-white/80 p-4">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="mt-3 h-10 w-16" />
        <Skeleton className="mt-4 h-4 w-full" />
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {["expired-1", "expired-2", "expired-3", "expired-4"].map((row) => (
          <div key={row} className="rounded-2xl border border-slate-100 p-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-3 h-4 w-32" />
            <Skeleton className="mt-5 h-4 w-full" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function isCertificateExpired(certificate: CertificateRecord) {
  if (certificate.status === "Kadaluarsa") {
    return true;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expiryDate = new Date(`${certificate.expiryDate}T00:00:00`);

  return !Number.isNaN(expiryDate.getTime()) && expiryDate < today;
}
