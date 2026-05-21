import { Search } from "lucide-react";

import type { CertificateRecord } from "@/components/dashboard/dashboard-data";
import { statusVariant } from "@/components/dashboard/dashboard-data";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
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
          <CardTitle>Recent Certificates</CardTitle>
          <CardDescription>
            Latest certificate records and current status.
          </CardDescription>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="-translate-y-1/2 absolute top-1/2 left-3 size-4 text-slate-400" />
          <Input
            className="pl-9"
            placeholder="Filter table..."
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
          />
        </div>
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
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Certificate ID</TableHead>
          <TableHead>Company</TableHead>
          <TableHead>Standard</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Issued</TableHead>
          <TableHead>Expiry</TableHead>
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
      <h2 className="mt-4 font-semibold">No certificates found</h2>
      <p className="mx-auto mt-2 max-w-sm text-slate-500 text-sm">
        Try searching by certificate ID, company, standard, or status.
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
