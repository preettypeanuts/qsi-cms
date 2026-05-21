import {
  certificatePayloadSchema,
  deleteCertificate,
  getCertificate,
  updateCertificate,
} from "@/lib/certificates";

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
    return Response.json({ error: "Certificate not found." }, { status: 404 });
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
      { error: "Invalid certificate payload.", issues: result.error.issues },
      { status: 400 },
    );
  }

  const certificate = await updateCertificate(
    decodeURIComponent(certificateId),
    result.data,
  );

  if (!certificate) {
    return Response.json({ error: "Certificate not found." }, { status: 404 });
  }

  return Response.json({ data: certificate });
}

export async function DELETE(
  _request: Request,
  { params }: CertificateRouteContext,
) {
  const { certificateId } = await params;
  const isDeleted = await deleteCertificate(decodeURIComponent(certificateId));

  if (!isDeleted) {
    return Response.json({ error: "Certificate not found." }, { status: 404 });
  }

  return Response.json({ data: { id: certificateId } });
}
