import { randomUUID } from "node:crypto";

import type { CertificateRecord } from "@/components/dashboard/dashboard-data";
import {
  type CertificatePayload,
  ensureCertificatesSchema,
} from "@/lib/certificates";
import { db } from "@/lib/db";

export type NotificationRecord = {
  actorUsername: string | null;
  certificateId: string | null;
  createdAt: string;
  id: string;
  isRead: boolean;
  message: string;
  title: string;
  type: NotificationType;
};

type NotificationType =
  | "certificate_created"
  | "certificate_deleted"
  | "certificate_updated"
  | "certificate_expired"
  | "certificate_expiring";

type NotificationRow = {
  actor_username: string | null;
  certificate_id: string | null;
  created_at: Date | string;
  id: string;
  is_read: boolean;
  message: string;
  title: string;
  type: NotificationType;
};

export type CertificateFieldChange = {
  fieldName: string;
  nextValue: string;
  previousValue: string;
};

type ExpiryCandidateRow = {
  company: string;
  expiry_date: Date | string;
  id: string;
};

const certificateFields: Array<{
  key: keyof CertificateRecord;
  label: string;
}> = [
  { key: "company", label: "Nama Klien" },
  { key: "standard", label: "Jenis Sertifikasi" },
  { key: "id", label: "Nomor Sertifikat" },
  { key: "issuedDate", label: "Tanggal Terbit" },
  { key: "expiryDate", label: "Tanggal Kadaluarsa" },
  { key: "surveillance1", label: "Surveillance 1" },
  { key: "surveillance2", label: "Surveillance 2" },
  { key: "status", label: "Status" },
  { key: "auditor", label: "Auditor" },
];

let isNotificationsSchemaReady = false;

export async function ensureNotificationsSchema() {
  if (isNotificationsSchemaReady) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      certificate_id TEXT,
      actor_username TEXT,
      is_read BOOLEAN NOT NULL DEFAULT FALSE,
      dedupe_key TEXT UNIQUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.query(`
    CREATE TABLE IF NOT EXISTS certificate_audit_logs (
      id TEXT PRIMARY KEY,
      certificate_id TEXT NOT NULL,
      field_name TEXT NOT NULL,
      previous_value TEXT,
      next_value TEXT,
      actor_username TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS notifications_created_at_idx
    ON notifications (created_at DESC)
  `);

  await db.query(`
    CREATE INDEX IF NOT EXISTS certificate_audit_logs_certificate_id_idx
    ON certificate_audit_logs (certificate_id, created_at DESC)
  `);

  isNotificationsSchemaReady = true;
}

export async function getNotifications() {
  await ensureNotificationsSchema();
  await syncCertificateExpiryNotifications();

  const [notificationsResult, unreadResult] = await Promise.all([
    db.query<NotificationRow>(`
      SELECT id, type, title, message, certificate_id, actor_username, is_read, created_at
      FROM notifications
      ORDER BY created_at DESC
      LIMIT 20
    `),
    db.query<{ count: string }>(`
      SELECT COUNT(*)::text AS count
      FROM notifications
      WHERE is_read = FALSE
    `),
  ]);

  return {
    notifications: notificationsResult.rows.map(mapNotificationRow),
    unreadCount: Number(unreadResult.rows[0]?.count ?? 0),
  };
}

export async function markNotificationsAsRead() {
  await ensureNotificationsSchema();

  await db.query(`
    UPDATE notifications
    SET is_read = TRUE
    WHERE is_read = FALSE
  `);
}

export function getCertificateFieldChanges(
  previous: CertificateRecord,
  next: CertificateRecord,
) {
  return certificateFields.reduce<CertificateFieldChange[]>(
    (changes, field) => {
      const previousValue = String(previous[field.key] ?? "");
      const nextValue = String(next[field.key] ?? "");

      if (previousValue !== nextValue) {
        changes.push({
          fieldName: field.label,
          nextValue,
          previousValue,
        });
      }

      return changes;
    },
    [],
  );
}

export function mapCertificatePayloadToRecord(
  payload: CertificatePayload,
): CertificateRecord {
  return {
    auditor: payload.auditor,
    company: payload.company,
    expiryDate: toInputDate(payload.expiryDate),
    id: payload.id,
    issuedDate: toInputDate(payload.issuedDate),
    standard: payload.standard,
    status: payload.status,
    surveillance1: toInputDate(payload.surveillance1),
    surveillance2: toInputDate(payload.surveillance2),
  };
}

export async function createCertificateCreatedNotification(
  certificate: CertificateRecord,
  actorUsername: string,
) {
  await createNotification({
    actorUsername,
    certificateId: certificate.id,
    message: `${actorUsername} menambahkan data baru untuk ${certificate.company} (${certificate.id}).`,
    title: "Data certificate baru",
    type: "certificate_created",
  });
}

export async function createCertificateUpdatedNotification(
  certificate: CertificateRecord,
  actorUsername: string,
  changes: CertificateFieldChange[],
) {
  if (changes.length === 0) {
    return;
  }

  await recordCertificateAuditLogs(certificate.id, actorUsername, changes);
  await createNotification({
    actorUsername,
    certificateId: certificate.id,
    message: `${actorUsername} mengubah ${changes.length} field: ${changes
      .map((change) => change.fieldName)
      .join(", ")}.`,
    title: `Update ${certificate.company}`,
    type: "certificate_updated",
  });
}

export async function createCertificateDeletedNotification(
  certificate: CertificateRecord,
  actorUsername: string,
) {
  await createNotification({
    actorUsername,
    certificateId: certificate.id,
    message: `${actorUsername} menghapus data ${certificate.company} (${certificate.id}).`,
    title: "Data certificate dihapus",
    type: "certificate_deleted",
  });
}

async function syncCertificateExpiryNotifications() {
  await ensureCertificatesSchema();

  const { rows: expiringRows } = await db.query<ExpiryCandidateRow>(`
    SELECT id, company, expiry_date
    FROM certificates
    WHERE status <> 'Kadaluarsa'
      AND expiry_date >= CURRENT_DATE
      AND expiry_date <= CURRENT_DATE + INTERVAL '30 days'
  `);

  for (const certificate of expiringRows) {
    const expiryDate = toInputDate(certificate.expiry_date);

    await createNotification({
      certificateId: certificate.id,
      dedupeKey: `certificate-expiring:${certificate.id}:${expiryDate}`,
      message: `${certificate.company} (${certificate.id}) akan expired pada ${expiryDate}.`,
      title: "Certificate akan expired",
      type: "certificate_expiring",
    });
  }

  const { rows: expiredRows } = await db.query<ExpiryCandidateRow>(`
    SELECT id, company, expiry_date
    FROM certificates
    WHERE status <> 'Kadaluarsa'
      AND expiry_date < CURRENT_DATE
  `);

  for (const certificate of expiredRows) {
    const expiryDate = toInputDate(certificate.expiry_date);

    await createNotification({
      certificateId: certificate.id,
      dedupeKey: `certificate-expired:${certificate.id}:${expiryDate}`,
      message: `${certificate.company} (${certificate.id}) sudah expired sejak ${expiryDate}.`,
      title: "Certificate expired",
      type: "certificate_expired",
    });
  }
}

async function createNotification({
  actorUsername = null,
  certificateId = null,
  dedupeKey = null,
  message,
  title,
  type,
}: {
  actorUsername?: string | null;
  certificateId?: string | null;
  dedupeKey?: string | null;
  message: string;
  title: string;
  type: NotificationType;
}) {
  await ensureNotificationsSchema();

  await db.query(
    `
      INSERT INTO notifications (
        id, type, title, message, certificate_id, actor_username, dedupe_key
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      ON CONFLICT (dedupe_key) DO NOTHING
    `,
    [
      randomUUID(),
      type,
      title,
      message,
      certificateId,
      actorUsername,
      dedupeKey,
    ],
  );
}

async function recordCertificateAuditLogs(
  certificateId: string,
  actorUsername: string,
  changes: CertificateFieldChange[],
) {
  await ensureNotificationsSchema();

  for (const change of changes) {
    await db.query(
      `
        INSERT INTO certificate_audit_logs (
          id, certificate_id, field_name, previous_value, next_value, actor_username
        )
        VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [
        randomUUID(),
        certificateId,
        change.fieldName,
        change.previousValue,
        change.nextValue,
        actorUsername,
      ],
    );
  }
}

function mapNotificationRow(row: NotificationRow): NotificationRecord {
  return {
    actorUsername: row.actor_username,
    certificateId: row.certificate_id,
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
    id: row.id,
    isRead: row.is_read,
    message: row.message,
    title: row.title,
    type: row.type,
  };
}

function toInputDate(value: Date | string) {
  if (value instanceof Date) {
    return value.toISOString().slice(0, 10);
  }

  return value.slice(0, 10);
}
