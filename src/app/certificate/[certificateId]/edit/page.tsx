import { CertificateEditShell } from "@/components/dashboard/certificate-edit-shell";
import { getCertificate } from "@/lib/certificates";

type EditCertificatePageProps = {
  params: Promise<{
    certificateId: string;
  }>;
};

export default async function EditCertificatePage({
  params,
}: EditCertificatePageProps) {
  const { certificateId } = await params;
  const certificate = await getCertificate(decodeURIComponent(certificateId));

  return <CertificateEditShell certificate={certificate ?? undefined} />;
}
