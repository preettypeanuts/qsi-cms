import type { CertificateRecord } from "@/components/dashboard/dashboard-data";
import { getCertificate } from "@/lib/certificates";
import { formatIndonesianDate } from "@/lib/date-format";

type PublicCertificateRouteContext = {
  params: Promise<{
    certificateNumber: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: PublicCertificateRouteContext,
) {
  const { certificateNumber } = await params;
  const certificate = await getCertificate(
    decodeURIComponent(certificateNumber),
  );

  if (!certificate) {
    return publicJson(
      {
        data: null,
        error: "Certificate not found.",
      },
      404,
    );
  }

  return publicJson({
    data: mapPublicCertificate(certificate),
  });
}

export function OPTIONS() {
  return new Response(null, {
    headers: getPublicHeaders(),
    status: 204,
  });
}

function mapPublicCertificate(certificate: CertificateRecord) {
  return {
    auditor: certificate.auditor,
    certificateNumber: certificate.id,
    certificationType: certificate.standard,
    clientName: certificate.company,
    expiryDate: certificate.expiryDate,
    expiryDateText: formatIndonesianDate(certificate.expiryDate),
    issueDate: certificate.issuedDate,
    issueDateText: formatIndonesianDate(certificate.issuedDate),
    status: certificate.status,
    surveillance1: certificate.surveillance1,
    surveillance1Text: formatIndonesianDate(certificate.surveillance1),
    surveillance2: certificate.surveillance2,
    surveillance2Text: formatIndonesianDate(certificate.surveillance2),
  };
}

function publicJson(body: unknown, status = 200) {
  return Response.json(body, {
    headers: getPublicHeaders(),
    status,
  });
}

function getPublicHeaders() {
  return {
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Origin": "*",
    "Cache-Control": "no-store",
  };
}
