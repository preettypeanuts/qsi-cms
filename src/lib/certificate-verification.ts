const DEFAULT_CERTIFICATE_VERIFICATION_BASE_URL =
  "https://www.qsicerti.co.id/cek-sertifikat";

export function getCertificateVerificationUrl(certificateId: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_CERTIFICATE_VERIFICATION_BASE_URL ??
    DEFAULT_CERTIFICATE_VERIFICATION_BASE_URL;

  return `${baseUrl.replace(/\/$/, "")}/${encodeURIComponent(certificateId)}`;
}
