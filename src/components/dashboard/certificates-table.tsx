import { Search } from "lucide-react";

import type { CertificateRecord } from "@/components/dashboard/dashboard-data";
import { statusVariant } from "@/components/dashboard/dashboard-data";
import { SearchField } from "@/components/dashboard/search-field";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatIndonesianDate } from "@/lib/date-format";

const skeletonRows = ["row-1", "row-2", "row-3", "row-4", "row-5"];

type CertificatesTableProps = {
  certificates: CertificateRecord[];
  isLoading: boolean;
  query: string;
  onQueryChange: (value: string) => void;
};

export function CertificatesTable({
  certificates,
  isLoading,
  query,
  onQueryChange,
}: CertificatesTableProps) {
  return (
    <Card>
      <CardHeader className="gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Sertifikat Terbaru</CardTitle>
          <CardDescription>
            Data sertifikat terakhir beserta statusnya.
          </CardDescription>
        </div>
        <SearchField
          className="sm:w-80"
          placeholder="Cari di tabel..."
          value={query}
          onSearch={onQueryChange}
        />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <CertificateTableSkeleton />
        ) : certificates.length > 0 ? (
          <CertificateRows certificates={certificates} />
        ) : (
          <CertificateEmptyState />
        )}
      </CardContent>
    </Card>
  );
}

function CertificateRows({
  certificates,
}: {
  certificates: CertificateRecord[];
}) {
  return (
    <Table className="min-w-[820px]">
      <TableHeader>
        <TableRow>
          <TableHead>Nomor Sertifikat</TableHead>
          <TableHead>Nama Klien</TableHead>
          <TableHead>Standar</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Tanggal Terbit</TableHead>
          <TableHead>Kadaluarsa</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {certificates.map((item) => (
          <TableRow key={item.id} className="hover:bg-slate-50">
            <TableCell className="font-medium">{item.id}</TableCell>
            <TableCell>{item.company}</TableCell>
            <TableCell>{item.standard}</TableCell>
            <TableCell>
              <Badge variant={statusVariant[item.status]}>{item.status}</Badge>
            </TableCell>
            <TableCell className="text-slate-500">
              {formatIndonesianDate(item.issuedDate)}
            </TableCell>
            <TableCell className="text-slate-500">
              {formatIndonesianDate(item.expiryDate)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

function CertificateEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <Search className="size-5" />
      </div>
      <h2 className="mt-4 font-semibold">Sertifikat tidak ditemukan</h2>
      <p className="mx-auto mt-2 max-w-sm text-slate-500 text-sm">
        Coba cari berdasarkan nomor sertifikat, nama klien, standar, atau
        status.
      </p>
    </div>
  );
}

function CertificateTableSkeleton() {
  return (
    <div className="space-y-3">
      {skeletonRows.map((row) => (
        <div
          key={row}
          className="grid gap-3 rounded-xl border border-slate-100 p-4 sm:grid-cols-6"
        >
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
          <Skeleton className="h-5" />
        </div>
      ))}
    </div>
  );
}
