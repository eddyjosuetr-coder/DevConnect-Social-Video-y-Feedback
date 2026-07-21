import { eq, and, count } from "drizzle-orm";
import { getDb } from "./connection";
import { follows, users } from "@db/schema";

const isMock = !process.env.DATABASE_URL;

// "followerId:followingId"
const mockFollows = new Set<string>();

export async function toggleFollow(
  followerId: number,
  followingId: number,
): Promise<{ following: boolean }> {
  if (followerId === followingId) return { following: false };

  if (isMock) {
    const key = `${followerId}:${followingId}`;
    if (mockFollows.has(key)) {
      mockFollows.delete(key);
      return { following: false };
    }
    mockFollows.add(key);
    return { following: true };
  }

  const db = getDb();
  const existing = await db
    .select()
    .from(follows)
    .where(
      and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)),
    )
    .limit(1);

  if (existing.length > 0) {
    await db.delete(follows).where(eq(follows.id, existing[0].id));
    return { following: false };
  }

  await db.insert(follows).values({ followerId, followingId });
  return { following: true };
}

export async function isFollowing(
  followerId: number,
  followingId: number,
): Promise<boolean> {
  if (isMock) return mockFollows.has(`${followerId}:${followingId}`);
  const db = getDb();
  const existing = await db
    .select()
    .from(follows)
    .where(
      and(eq(follows.followerId, followerId), eq(follows.followingId, followingId)),
    )
    .limit(1);
  return existing.length > 0;
}

export async function listFollowing(followerId: number): Promise<number[]> {
  if (isMock) {
    return [...mockFollows]
      .filter((k) => k.startsWith(`${followerId}:`))
      .map((k) => Number(k.split(":")[1]));
  }
  const db = getDb();
  const rows = await db
    .select({ followingId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, followerId));
  return rows.map((r) => r.followingId);
}

export async function getFollowerCount(userId: number): Promise<number> {
  if (isMock) {
    return [...mockFollows].filter((k) => k.endsWith(`:${userId}`)).length;
  }
  const db = getDb();
  const [row] = await db
    .select({ total: count() })
    .from(follows)
    .where(eq(follows.followingId, userId));
  return row?.total ?? 0;
}

export async function listFollowers(userId: number): Promise<Array<{ id: number; name: string | null; avatar: string | null; bio: string | null }>> {
  if (isMock) return [];
  const db = getDb();
  return db
    .select({ id: users.id, name: users.name, avatar: users.avatar, bio: users.bio })
    .from(follows)
    .innerJoin(users, eq(users.id, follows.followerId))
    .where(eq(follows.followingId, userId));
}

export async function listFollowingUsers(userId: number): Promise<Array<{ id: number; name: string | null; avatar: string | null; bio: string | null }>> {
  if (isMock) return [];
  const db = getDb();
  return db
    .select({ id: users.id, name: users.name, avatar: users.avatar, bio: users.bio })
    .from(follows)
    .innerJoin(users, eq(users.id, follows.followingId))
    .where(eq(follows.followerId, userId));
}

export async function getFollowingCount(userId: number): Promise<number> {
  if (isMock) {
    return [...mockFollows].filter((k) => k.startsWith(`${userId}:`)).length;
  }
  const db = getDb();
  const [row] = await db
    .select({ total: count() })
    .from(follows)
    .where(eq(follows.followerId, userId));
  return row?.total ?? 0;
}
