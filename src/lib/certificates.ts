import { z } from "zod";

import {
  type CertificateRecord,
  certificates as seedCertificates,
} from "@/components/dashboard/dashboard-data";
import { db } from "@/lib/db";

const statusSchema = z.enum(["Aktif", "Nonaktif", "Kadaluarsa"]);

export const certificatePayloadSchema = z.object({
  auditor: z.string().min(2),
  company: z.string().min(2),
  expiryDate: z.string().min(1),
  id: z.string().min(3),
  issuedDate: z.string().min(1),
  standard: z.string().min(1),
  status: statusSchema,
  surveillance1: z.string().min(1),
  surveillance2: z.string().min(1),
});

export type CertificatePayload = z.infer<typeof certificatePayloadSchema>;

type CertificateRow = {
  auditor: string;
  company: string;
  expiry_date: Date | string;
  id: string;
  issued_date: Date | string;
  standard: string;
  status: CertificateRecord["status"];
  surveillance1: Date | string;
  surveillance2: Date | string;
};

let isSchemaReady = false;

export async function ensureCertificatesSchema() {
  if (isSchemaReady) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY,
      company TEXT NOT NULL,
      standard TEXT NOT NULL,
      issued_date DATE NOT NULL,
      expiry_date DATE NOT NULL,
      surveillance1 DATE NOT NULL,
      surveillance2 DATE NOT NULL,
      status TEXT NOT NULL,
      auditor TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.query(
    "ALTER TABLE certificates DROP CONSTRAINT IF EXISTS certificates_status_check",
  );
  await db.query(`
    UPDATE certificates
    SET status = CASE status
      WHEN 'Active' THEN 'Aktif'
      WHEN 'Inactive' THEN 'Nonaktif'
      WHEN 'Expired' THEN 'Kadaluarsa'
      ELSE status
    END
  `);
  await db.query(`
    ALTER TABLE certificates
    ADD CONSTRAINT certificates_status_check
    CHECK (status IN ('Aktif', 'Nonaktif', 'Kadaluarsa'))
  `);

  const { rows } = await db.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM certificates",
  );

  if (rows[0]?.count === "0") {
    for (const certificate of seedCertificates) {
      await insertCertificate({
        auditor: certificate.auditor,
        company: certificate.company,
        expiryDate: toDatabaseDate(certificate.expiryDate),
        id: certificate.id,
        issuedDate: toDatabaseDate(certificate.issuedDate),
        standard: certificate.standard,
        status: certificate.status,
        surveillance1: toDatabaseDate(certificate.surveillance1),
        surveillance2: toDatabaseDate(certificate.surveillance2),
      });
    }
  }

  isSchemaReady = true;
}

export async function getCertificates() {
  await ensureCertificatesSchema();

  const { rows } = await db.query<CertificateRow>(`
    SELECT id, company, standard, issued_date, expiry_date, surveillance1, surveillance2, status, auditor
    FROM certificates
    ORDER BY created_at DESC, id ASC
  `);

  return rows.map(mapCertificateRow);
}

export async function getCertificate(id: string) {
  await ensureCertificatesSchema();

  const { rows } = await db.query<CertificateRow>(
    `
      SELECT id, company, standard, issued_date, expiry_date, surveillance1, surveillance2, status, auditor
      FROM certificates
      WHERE id = $1
      LIMIT 1
    `,
    [id],
  );

  return rows[0] ? mapCertificateRow(rows[0]) : null;
}

export async function createCertificate(payload: CertificatePayload) {
  await ensureCertificatesSchema();

  return insertCertificate(payload);
}

async function insertCertificate(payload: CertificatePayload) {
  const certificate = certificatePayloadSchema.parse(payload);

  const { rows } = await db.query<CertificateRow>(
    `
      INSERT INTO certificates (
        id, company, standard, issued_date, expiry_date, surveillance1, surveillance2, status, auditor
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, company, standard, issued_date, expiry_date, surveillance1, surveillance2, status, auditor
    `,
    [
      certificate.id,
      certificate.company,
      certificate.standard,
      certificate.issuedDate,
      certificate.expiryDate,
      certificate.surveillance1,
      certificate.surveillance2,
      certificate.status,
      certificate.auditor,
    ],
  );

  return mapCertificateRow(rows[0]);
}

export async function updateCertificate(
  id: string,
  payload: CertificatePayload,
) {
  await ensureCertificatesSchema();

  const certificate = certificatePayloadSchema.parse(payload);

  const { rows } = await db.query<CertificateRow>(
    `
      UPDATE certificates
      SET
        id = $1,
        company = $2,
        standard = $3,
        issued_date = $4,
        expiry_date = $5,
        surveillance1 = $6,
        surveillance2 = $7,
        status = $8,
        auditor = $9,
        updated_at = NOW()
      WHERE id = $10
      RETURNING id, company, standard, issued_date, expiry_date, surveillance1, surveillance2, status, auditor
    `,
    [
      certificate.id,
      certificate.company,
      certificate.standard,
      certificate.issuedDate,
      certificate.expiryDate,
      certificate.surveillance1,
      certificate.surveillance2,
      certificate.status,
      certificate.auditor,
      id,
    ],
  );

  return rows[0] ? mapCertificateRow(rows[0]) : null;
}

export async function deleteCertificate(id: string) {
  await ensureCertificatesSchema();

  const result = await db.query("DELETE FROM certificates WHERE id = $1", [id]);

  return (result.rowCount ?? 0) > 0;
}

function mapCertificateRow(row: CertificateRow): CertificateRecord {
  return {
    auditor: row.auditor,
    company: row.company,
    expiryDate: toInputDate(row.expiry_date),
    id: row.id,
    issuedDate: toInputDate(row.issued_date),
    standard: row.standard,
    status: row.status,
    surveillance1: toInputDate(row.surveillance1),
    surveillance2: toInputDate(row.surveillance2),
  };
}

function toInputDate(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}

function toDatabaseDate(value: string) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toISOString().slice(0, 10);
}
