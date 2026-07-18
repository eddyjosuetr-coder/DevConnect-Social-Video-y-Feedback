import { eq, and, sql } from "drizzle-orm";
import { getDb } from "./connection";
import { reposts, posts } from "@db/schema";
import { mockPosts } from "./posts";

const isMock = !process.env.DATABASE_URL;

const mockReposts = new Set<string>(); // "userId:postId"

export async function toggleRepost(
  postId: number,
  userId: number,
): Promise<{ reposted: boolean; postOwnerId: number | null }> {
  if (isMock) {
    const key = `${userId}:${postId}`;
    const post = mockPosts.find((p) => p.id === postId);
    if (!post) return { reposted: false, postOwnerId: null };
    if (mockReposts.has(key)) {
      mockReposts.delete(key);
      post.repostsCount = Math.max(0, post.repostsCount - 1);
      return { reposted: false, postOwnerId: post.userId };
    }
    mockReposts.add(key);
    post.repostsCount += 1;
    return { reposted: true, postOwnerId: post.userId };
  }

  const db = getDb();
  const [postRow] = await db.select({ userId: posts.userId }).from(posts).where(eq(posts.id, postId)).limit(1);
  const postOwnerId = postRow?.userId ?? null;

  const existing = await db
    .select()
    .from(reposts)
    .where(and(eq(reposts.postId, postId), eq(reposts.userId, userId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(reposts).where(eq(reposts.id, existing[0].id));
    await db
      .update(posts)
      .set({ repostsCount: sql`GREATEST(0, ${posts.repostsCount} - 1)` })
      .where(eq(posts.id, postId));
    return { reposted: false, postOwnerId };
  }

  await db.insert(reposts).values({ postId, userId });
  await db
    .update(posts)
    .set({ repostsCount: sql`${posts.repostsCount} + 1` })
    .where(eq(posts.id, postId));
  return { reposted: true, postOwnerId };
}

export async function isReposted(postId: number, userId: number): Promise<boolean> {
  if (isMock) return mockReposts.has(`${userId}:${postId}`);
  const db = getDb();
  const existing = await db
    .select()
    .from(reposts)
    .where(and(eq(reposts.postId, postId), eq(reposts.userId, userId)))
    .limit(1);
  return existing.length > 0;
}
