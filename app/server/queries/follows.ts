import { eq, and } from "drizzle-orm";
import { getDb } from "./connection";
import { follows } from "@db/schema";

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
