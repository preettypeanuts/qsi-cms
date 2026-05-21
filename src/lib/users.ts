import {
  randomBytes,
  randomUUID,
  scryptSync,
  timingSafeEqual,
} from "node:crypto";
import { z } from "zod";

import { db } from "@/lib/db";

export type UserRecord = {
  createdAt: string;
  id: string;
  username: string;
};

type UserRow = {
  created_at: Date | string;
  id: string;
  password_hash: string;
  username: string;
};

export const createUserSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters."),
  username: z.string().min(3, "Username must be at least 3 characters."),
});

let isUsersSchemaReady = false;

export async function ensureUsersSchema() {
  if (isUsersSchemaReady) {
    return;
  }

  await db.query(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      username TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const { rows } = await db.query<{ count: string }>(
    "SELECT COUNT(*)::text AS count FROM users",
  );

  if (rows[0]?.count === "0") {
    await createUser({
      password: process.env.AUTH_PASSWORD ?? "admin123",
      username: process.env.AUTH_USERNAME ?? "admin",
    });
  }

  isUsersSchemaReady = true;
}

export async function getUsers() {
  await ensureUsersSchema();

  const { rows } = await db.query<UserRow>(`
    SELECT id, username, password_hash, created_at
    FROM users
    ORDER BY created_at DESC
  `);

  return rows.map(mapUserRow);
}

export async function createUser(input: z.infer<typeof createUserSchema>) {
  const user = createUserSchema.parse(input);
  const { rows } = await db.query<UserRow>(
    `
      INSERT INTO users (id, username, password_hash)
      VALUES ($1, $2, $3)
      RETURNING id, username, password_hash, created_at
    `,
    [randomUUID(), user.username, hashPassword(user.password)],
  );

  return mapUserRow(rows[0]);
}

export async function deleteUser(id: string) {
  await ensureUsersSchema();

  const result = await db.query("DELETE FROM users WHERE id = $1", [id]);

  return (result.rowCount ?? 0) > 0;
}

export async function verifyUserCredentials(
  username: string,
  password: string,
) {
  await ensureUsersSchema();

  const { rows } = await db.query<UserRow>(
    `
      SELECT id, username, password_hash, created_at
      FROM users
      WHERE username = $1
      LIMIT 1
    `,
    [username],
  );

  const user = rows[0];

  if (!user || !verifyPassword(password, user.password_hash)) {
    return null;
  }

  return mapUserRow(user);
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");

  return `${salt}:${hash}`;
}

function verifyPassword(password: string, storedValue: string) {
  const [salt, storedHash] = storedValue.split(":");

  if (!salt || !storedHash) {
    return false;
  }

  const hash = scryptSync(password, salt, 64);
  const storedBuffer = Buffer.from(storedHash, "hex");

  if (hash.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(hash, storedBuffer);
}

function mapUserRow(row: UserRow): UserRecord {
  return {
    createdAt:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : row.created_at,
    id: row.id,
    username: row.username,
  };
}
