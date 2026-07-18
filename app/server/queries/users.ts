import { eq } from "drizzle-orm";
import * as schema from "@db/schema";
import type { InsertUser, User } from "@db/schema";
import { getDb } from "./connection";
import { env } from "../lib/env";

// ── Mock store (used when DATABASE_URL is not set) ───────────────────────────
export const mockUserById = new Map<number, User>();
const mockUserByUnionId = new Map<string, User>();
let mockNextUserId = 5; // start after pre-seeded users

const isMock = !env.databaseUrl;

// Pre-seed the demo user so JWT sessions survive serverless cold starts.
// Without this, a new function instance has an empty user store and every
// authenticated request after login fails with "User not found".
if (isMock) {
  const seed = (u: User) => { mockUserById.set(u.id, u); mockUserByUnionId.set(u.unionId, u); };
  const ts = new Date(0);
  seed({ id: 1, unionId: "dev-user-local", name: "Dev User", email: null, avatar: null, bio: null, role: "user", createdAt: ts, updatedAt: ts, lastSignInAt: ts });
  seed({ id: 2, unionId: "mock-alejandro", name: "Alejandro Marin", email: null, avatar: null, bio: null, role: "user", createdAt: ts, updatedAt: ts, lastSignInAt: ts });
  seed({ id: 3, unionId: "mock-sofia", name: "Sofia Jimenez", email: null, avatar: null, bio: null, role: "user", createdAt: ts, updatedAt: ts, lastSignInAt: ts });
  seed({ id: 4, unionId: "mock-carlos", name: "Carlos Rivera", email: null, avatar: null, bio: null, role: "user", createdAt: ts, updatedAt: ts, lastSignInAt: ts });
}

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

export async function updateUserProfile(
  id: number,
  data: { name?: string; bio?: string; avatar?: string; banner?: string }
): Promise<void> {
  if (isMock) {
    const user = mockUserById.get(id);
    if (user) {
      const updated: User = { ...user, ...data, updatedAt: new Date() };
      mockUserById.set(id, updated);
      mockUserByUnionId.set(user.unionId, updated);
    }
    return;
  }
  await getDb()
    .update(schema.users)
    .set({ ...data })
    .where(eq(schema.users.id, id));
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
