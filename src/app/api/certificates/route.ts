import {
  certificatePayloadSchema,
  createCertificate,
  getCertificates,
} from "@/lib/certificates";
import { getCurrentUsername } from "@/lib/current-user";
import { createCertificateCreatedNotification } from "@/lib/notifications";

export async function GET() {
  const certificates = await getCertificates();

  return Response.json({ data: certificates });
}

export async function POST(request: Request) {
  const payload = await request.json();
  const result = certificatePayloadSchema.safeParse(payload);

  if (!result.success) {
    return Response.json(
      { error: "Invalid certificate payload.", issues: result.error.issues },
      { status: 400 },
    );
  }

  try {
    const certificate = await createCertificate(result.data);
    const actorUsername = await getCurrentUsername();

    await createCertificateCreatedNotification(certificate, actorUsername);

    return Response.json({ data: certificate }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create certificate.";

    return Response.json({ error: message }, { status: 500 });
  }
}
