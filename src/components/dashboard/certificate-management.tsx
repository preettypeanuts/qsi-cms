"use client";

import { Edit3, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import type {
  CertificateRecord,
  CertificateStatus,
} from "@/components/dashboard/dashboard-data";
import { statusVariant } from "@/components/dashboard/dashboard-data";
import { SearchField } from "@/components/dashboard/search-field";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "@/components/ui/toaster";
import { formatIndonesianDate } from "@/lib/date-format";

type StatusFilter = "all" | CertificateStatus;

export function CertificateManagement() {
  const [certificates, setCertificates] = useState<CertificateRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [certificateToDelete, setCertificateToDelete] =
    useState<CertificateRecord | null>(null);

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

    return certificates.filter((certificate) => {
      const matchesStatus =
        statusFilter === "all" || certificate.status === statusFilter;

      const matchesSearch =
        !normalizedQuery ||
        [
          certificate.company,
          certificate.standard,
          certificate.id,
          certificate.auditor,
          certificate.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [certificates, query, statusFilter]);

  async function handleDelete() {
    if (!certificateToDelete) {
      return;
    }

    const response = await fetch(
      `/api/certificates/${encodeURIComponent(certificateToDelete.id)}`,
      {
        method: "DELETE",
      },
    );

    if (!response.ok) {
      toast({
        description: "Data certificate belum berhasil dihapus.",
        title: "Gagal menghapus certificate",
        variant: "destructive",
      });
      return;
    }

    setCertificates((currentCertificates) =>
      currentCertificates.filter(
        (certificate) => certificate.id !== certificateToDelete.id,
      ),
    );
    setCertificateToDelete(null);
    toast({
      description: `${certificateToDelete.id} sudah dihapus dari daftar certificate.`,
      title: "Certificate berhasil dihapus",
      variant: "success",
    });
  }

  return (
    <>
      <Card className="flex h-full flex-col rounded-none border-0 shadow-none">
        <CardHeader className="gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <CardTitle>Certificate Management</CardTitle>
            <CardDescription>
              Kelola data sertifikat klien, surveillance, status, dan auditor.
            </CardDescription>
          </div>
          <Button asChild className="w-full sm:w-auto">
            <Link href="/certificate/new">
              <Plus className="size-4" />
              Add Certificate
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="flex min-h-0 flex-1 flex-col space-y-4">
          <div className="grid gap-3 md:grid-cols-[1fr_220px]">
            <SearchField
              placeholder="Search client, certificate number, auditor..."
              value={query}
              onSearch={setQuery}
            />
            <Select
              value={statusFilter}
              onValueChange={(value) => setStatusFilter(value as StatusFilter)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Aktif">Aktif</SelectItem>
                <SelectItem value="Nonaktif">Nonaktif</SelectItem>
                <SelectItem value="Kadaluarsa">Kadaluarsa</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <CertificateLoadingState />
          ) : filteredCertificates.length > 0 ? (
            <CertificateManagementTable
              certificates={filteredCertificates}
              onDeleteClick={setCertificateToDelete}
            />
          ) : (
            <CertificateManagementEmptyState />
          )}
        </CardContent>
      </Card>

      <AlertDialog
        open={Boolean(certificateToDelete)}
        onOpenChange={(open) => {
          if (!open) {
            setCertificateToDelete(null);
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete certificate?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove{" "}
              <span className="font-medium text-slate-700">
                {certificateToDelete?.id}
              </span>{" "}
              from the certificate list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => void handleDelete()}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

function CertificateManagementTable({
  certificates,
  onDeleteClick,
}: {
  certificates: CertificateRecord[];
  onDeleteClick: (certificate: CertificateRecord) => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-y-scroll rounded-2xl border border-slate-100 max-h-[calc(100vh-220px)]">
      <Table className="min-w-[1280px]">
        <TableHeader className="sticky top-0 z-10 bg-white">
          <TableRow>
            <TableHead>Nama Klien</TableHead>
            <TableHead>Jenis Sertifikasi</TableHead>
            <TableHead>Nomor Sertifikat</TableHead>
            <TableHead>Tanggal Terbit</TableHead>
            <TableHead>Tanggal Kadaluarsa</TableHead>
            <TableHead>Surveillance 1</TableHead>
            <TableHead>Surveillance 2</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Auditor</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {certificates.map((certificate) => (
            <TableRow key={certificate.id} className="hover:bg-slate-50">
              <TableCell className="min-w-48 font-medium">
                {certificate.company}
              </TableCell>
              <TableCell>{certificate.standard}</TableCell>
              <TableCell className="font-mono text-xs">
                {certificate.id}
              </TableCell>
              <TableCell className="text-slate-500">
                {formatIndonesianDate(certificate.issuedDate)}
              </TableCell>
              <TableCell className="text-slate-500">
                {formatIndonesianDate(certificate.expiryDate)}
              </TableCell>
              <TableCell className="text-slate-500">
                {formatIndonesianDate(certificate.surveillance1)}
              </TableCell>
              <TableCell className="text-slate-500">
                {formatIndonesianDate(certificate.surveillance2)}
              </TableCell>
              <TableCell>
                <Badge variant={statusVariant[certificate.status]}>
                  {certificate.status}
                </Badge>
              </TableCell>
              <TableCell>{certificate.auditor}</TableCell>
              <TableCell>
                <div className="flex justify-end gap-2">
                  <Button asChild variant="outline" size="icon-sm">
                    <Link
                      href={`/certificate/${certificate.id}/edit`}
                      aria-label={`Edit ${certificate.id}`}
                    >
                      <Edit3 className="size-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    aria-label="Delete"
                    onClick={() => onDeleteClick(certificate)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function CertificateManagementEmptyState() {
  return (
    <div className="rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
      <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-slate-100 text-slate-500">
        <Search className="size-5" />
      </div>
      <h2 className="mt-4 font-semibold">No certificates found</h2>
      <p className="mx-auto mt-2 max-w-sm text-slate-500 text-sm">
        Try changing the search keyword or status filter.
      </p>
    </div>
  );
}

function CertificateLoadingState() {
  return (
    <div className="grid flex-1 place-items-center rounded-2xl border border-dashed border-slate-200 px-6 py-12 text-center">
      <div>
        <div className="mx-auto size-8 animate-spin rounded-full border-2 border-slate-200 border-t-slate-950" />
        <p className="mt-4 font-medium">Loading certificates...</p>
      </div>
    </div>
  );
}
