import {
  certificatePayloadSchema,
  deleteCertificate,
  getCertificate,
  updateCertificate,
} from "@/lib/certificates";
import { getCurrentUsername } from "@/lib/current-user";
import {
  createCertificateDeletedNotification,
  createCertificateUpdatedNotification,
  getCertificateFieldChanges,
  mapCertificatePayloadToRecord,
} from "@/lib/notifications";

type CertificateRouteContext = {
  params: Promise<{
    certificateId: string;
  }>;
};

export async function GET(
  _request: Request,
  { params }: CertificateRouteContext,
) {
  const { certificateId } = await params;
  const certificate = await getCertificate(decodeURIComponent(certificateId));

  if (!certificate) {
    return Response.json(
      { error: "Data sertifikat tidak ditemukan." },
      { status: 404 },
    );
  }

  return Response.json({ data: certificate });
}

export async function PUT(
  request: Request,
  { params }: CertificateRouteContext,
) {
  const { certificateId } = await params;
  const payload = await request.json();
  const result = certificatePayloadSchema.safeParse(payload);

  if (!result.success) {
    return Response.json(
      { error: "Data sertifikat tidak valid.", issues: result.error.issues },
      { status: 400 },
    );
  }

  const decodedCertificateId = decodeURIComponent(certificateId);
  const previousCertificate = await getCertificate(decodedCertificateId);

  if (!previousCertificate) {
    return Response.json(
      { error: "Data sertifikat tidak ditemukan." },
      { status: 404 },
    );
  }

  const certificate = await updateCertificate(
    decodedCertificateId,
    result.data,
  );

  if (!certificate) {
    return Response.json(
      { error: "Data sertifikat tidak ditemukan." },
      { status: 404 },
    );
  }

  const changes = getCertificateFieldChanges(
    previousCertificate,
    mapCertificatePayloadToRecord(result.data),
  );
  const actorUsername = await getCurrentUsername();

  await createCertificateUpdatedNotification(
    certificate,
    actorUsername,
    changes,
  );

  return Response.json({ data: certificate });
}

export async function DELETE(
  _request: Request,
  { params }: CertificateRouteContext,
) {
  const { certificateId } = await params;
  const decodedCertificateId = decodeURIComponent(certificateId);
  const certificate = await getCertificate(decodedCertificateId);

  if (!certificate) {
    return Response.json(
      { error: "Data sertifikat tidak ditemukan." },
      { status: 404 },
    );
  }

  const isDeleted = await deleteCertificate(decodedCertificateId);

  if (!isDeleted) {
    return Response.json(
      { error: "Data sertifikat tidak ditemukan." },
      { status: 404 },
    );
  }

  const actorUsername = await getCurrentUsername();

  await createCertificateDeletedNotification(certificate, actorUsername);

  return Response.json({ data: { id: certificateId } });
}
