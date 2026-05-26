"use client";

import { Download, ExternalLink } from "lucide-react";
import { useRef } from "react";
import { QRCodeCanvas } from "qrcode.react";

import type { CertificateRecord } from "@/components/dashboard/dashboard-data";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { getCertificateVerificationUrl } from "@/lib/certificate-verification";

type CertificateQrDialogProps = {
  certificate: CertificateRecord | null;
  onOpenChange: (open: boolean) => void;
  open: boolean;
};

export function CertificateQrDialog({
  certificate,
  onOpenChange,
  open,
}: CertificateQrDialogProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const verificationUrl = certificate
    ? getCertificateVerificationUrl(certificate.id)
    : "";

  function handleDownloadQr() {
    if (!canvasRef.current || !certificate) {
      return;
    }

    const downloadLink = document.createElement("a");
    downloadLink.download = `qr-${certificate.id}.png`;
    downloadLink.href = canvasRef.current.toDataURL("image/png");
    downloadLink.click();
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>QR Verifikasi Sertifikat</AlertDialogTitle>
          <AlertDialogDescription>
            Scan QR ini untuk membuka halaman cek sertifikat resmi QSI.
          </AlertDialogDescription>
        </AlertDialogHeader>

        {certificate ? (
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <p className="font-semibold text-slate-900">
                {certificate.company}
              </p>
              <p className="mt-1 font-mono text-slate-500 text-xs">
                {certificate.id}
              </p>
            </div>

            <div className="grid place-items-center rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <QRCodeCanvas
                ref={canvasRef}
                value={verificationUrl}
                size={220}
                level="H"
                marginSize={2}
                title={`QR verifikasi ${certificate.id}`}
              />
            </div>

            <div className="rounded-2xl bg-slate-50 p-3">
              <p className="font-medium text-slate-500 text-xs">
                Link verifikasi
              </p>
              <p className="mt-1 break-all font-mono text-slate-800 text-xs">
                {verificationUrl}
              </p>
            </div>
          </div>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel>Tutup</AlertDialogCancel>
          <Button asChild variant="outline">
            <a href={verificationUrl} target="_blank" rel="noreferrer">
              <ExternalLink className="size-4" />
              Buka Link
            </a>
          </Button>
          <Button type="button" onClick={handleDownloadQr}>
            <Download className="size-4" />
            Unduh QR
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
