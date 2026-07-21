import { eq, like, sql, desc, notInArray } from "drizzle-orm";
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

export async function searchUsers(query: string): Promise<Array<{ id: number; name: string | null; avatar: string | null }>> {
  if (!query.trim()) return [];
  if (isMock) {
    return [...mockUserById.values()]
      .filter((u) => u.name?.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 10)
      .map((u) => ({ id: u.id, name: u.name, avatar: u.avatar }));
  }
  const db = getDb();
  return db
    .select({ id: schema.users.id, name: schema.users.name, avatar: schema.users.avatar })
    .from(schema.users)
    .where(like(schema.users.name, `%${query}%`))
    .limit(10);
}

export async function getTrendingTags(limit = 10): Promise<Array<{ tag: string; count: number }>> {
  if (isMock) {
    return [
      { tag: "typescript", count: 42 },
      { tag: "react", count: 38 },
      { tag: "nextjs", count: 29 },
      { tag: "nodejs", count: 25 },
      { tag: "css", count: 20 },
    ].slice(0, limit);
  }
  const db = getDb();
  const result = await db.execute(sql`
    SELECT tag, COUNT(*) AS tagCount
    FROM (
      SELECT TRIM(SUBSTRING_INDEX(SUBSTRING_INDEX(tags, ',', n.n), ',', -1)) AS tag
      FROM \`posts\`
      CROSS JOIN (
        SELECT 1 AS n UNION ALL SELECT 2 UNION ALL SELECT 3
        UNION ALL SELECT 4 UNION ALL SELECT 5
      ) n
      WHERE n.n <= 1 + (LENGTH(tags) - LENGTH(REPLACE(tags, ',', '')))
        AND tags IS NOT NULL AND tags != ''
    ) t
    WHERE tag != ''
    GROUP BY tag
    ORDER BY tagCount DESC
    LIMIT ${limit}
  `);
  // db.execute may return [rows, fields] tuple or rows directly depending on driver
  const rawRows = (Array.isArray(result) && Array.isArray(result[0]))
    ? (result[0] as Array<{ tag: string; tagCount: string | number }>)
    : (result as unknown as Array<{ tag: string; tagCount: string | number }>);
  return rawRows
    .filter((r) => r && typeof r.tag === 'string' && r.tag.trim() !== '')
    .map((r) => ({
      tag: r.tag.trim(),
      count: Number(r.tagCount) || 0,
    }));
}

export async function getSuggestedUsers(
  limit = 5,
  excludeUserId?: number,
): Promise<Array<{ id: number; name: string | null; avatar: string | null; bio: string | null }>> {
  if (isMock) {
    return [...mockUserById.values()]
      .filter((u) => u.id !== excludeUserId)
      .slice(0, limit)
      .map((u) => ({ id: u.id, name: u.name, avatar: u.avatar, bio: u.bio }));
  }
  const db = getDb();
  const query = db
    .select({ id: schema.users.id, name: schema.users.name, avatar: schema.users.avatar, bio: schema.users.bio })
    .from(schema.users)
    .orderBy(desc(schema.users.createdAt))
    .limit(limit);

  if (excludeUserId) {
    return query.where(notInArray(schema.users.id, [excludeUserId]));
  }
  return query;
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
