import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser, User } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

// ── Mock store (used when DATABASE_URL is not set) ───────────────────────────
let mockNextUserId = 1;
export const mockUserById = new Map<number, User>();
const mockUserByUnionId = new Map<string, User>();

const isMock = !env.databaseUrl;

export async function findUserByUnionId(unionId: string): Promise<User | undefined> {
  if (isMock) return mockUserByUnionId.get(unionId);
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.unionId, unionId))
    .limit(1);
  return rows.at(0);
}

export async function findUserById(id: number): Promise<User | undefined> {
  if (isMock) return mockUserById.get(id);
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, id))
    .limit(1);
  return rows.at(0);
}

export async function upsertUser(data: InsertUser): Promise<void> {
  if (isMock) {
    const existing = mockUserByUnionId.get(data.unionId);
    const isOwner = data.unionId === env.ownerUnionId && !!env.ownerUnionId;
    const user: User = existing
      ? { ...existing, ...data, updatedAt: new Date(), lastSignInAt: data.lastSignInAt ?? new Date() }
      : {
          id: mockNextUserId++,
          unionId: data.unionId,
          name: data.name ?? null,
          email: data.email ?? null,
          avatar: data.avatar ?? null,
          bio: data.bio ?? null,
          role: isOwner ? "admin" : (data.role ?? "user"),
          createdAt: data.createdAt ?? new Date(),
          updatedAt: data.updatedAt ?? new Date(),
          lastSignInAt: data.lastSignInAt ?? new Date(),
        };
    mockUserByUnionId.set(data.unionId, user);
    mockUserById.set(user.id, user);
    return;
  }

  const values = { ...data };
  const updateSet: Partial<InsertUser> = { lastSignInAt: new Date(), ...data };

  if (values.role === undefined && values.unionId && values.unionId === env.ownerUnionId) {
    values.role = "admin";
    updateSet.role = "admin";
  }

  await getDb()
    .insert(schema.users)
    .values(values)
    .onDuplicateKeyUpdate({ set: updateSet });
}
