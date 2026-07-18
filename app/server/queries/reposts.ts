import { eq, and, sql, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { reposts, posts, users } from "@db/schema";
import { mockPosts } from "./posts";

const isMock = !process.env.DATABASE_URL;

interface MockRepost {
  id: number;
  userId: number;
  postId: number;
  quoteText: string | null;
  createdAt: Date;
}

const mockReposts: MockRepost[] = [];
let mockRepostId = 100;

export type RepostEntry = {
  repostId: number;
  repostCreatedAt: Date;
  quoteText: string | null;
  post: {
    id: number;
    content: string;
    code: string | null;
    codeLanguage: string | null;
    tags: string | null;
    mediaUrl: string | null;
    mediaType: string | null;
    likesCount: number;
    commentsCount: number;
    repostsCount: number;
    createdAt: Date;
    authorId: number;
    authorName: string | null;
    authorAvatar: string | null;
  };
};

export async function toggleRepost(
  postId: number,
  userId: number,
): Promise<{ reposted: boolean; postOwnerId: number | null }> {
  if (isMock) {
    const post = mockPosts.find((p) => p.id === postId);
    if (!post) return { reposted: false, postOwnerId: null };
    const idx = mockReposts.findIndex((r) => r.userId === userId && r.postId === postId);
    if (idx >= 0) {
      mockReposts.splice(idx, 1);
      post.repostsCount = Math.max(0, post.repostsCount - 1);
      return { reposted: false, postOwnerId: post.userId };
    }
    mockReposts.push({ id: mockRepostId++, userId, postId, quoteText: null, createdAt: new Date() });
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

export async function quoteRepost(
  postId: number,
  userId: number,
  quoteText: string,
): Promise<{ postOwnerId: number | null }> {
  if (isMock) {
    const post = mockPosts.find((p) => p.id === postId);
    if (!post) return { postOwnerId: null };
    const idx = mockReposts.findIndex((r) => r.userId === userId && r.postId === postId);
    if (idx >= 0) {
      mockReposts[idx] = { ...mockReposts[idx], quoteText };
    } else {
      mockReposts.push({ id: mockRepostId++, userId, postId, quoteText, createdAt: new Date() });
      post.repostsCount += 1;
    }
    return { postOwnerId: post.userId };
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
    await db.update(reposts).set({ quoteText }).where(eq(reposts.id, existing[0].id));
  } else {
    await db.insert(reposts).values({ postId, userId, quoteText });
    await db
      .update(posts)
      .set({ repostsCount: sql`${posts.repostsCount} + 1` })
      .where(eq(posts.id, postId));
  }

  return { postOwnerId };
}

export async function isReposted(postId: number, userId: number): Promise<boolean> {
  if (isMock) return mockReposts.some((r) => r.userId === userId && r.postId === postId);
  const db = getDb();
  const existing = await db
    .select()
    .from(reposts)
    .where(and(eq(reposts.postId, postId), eq(reposts.userId, userId)))
    .limit(1);
  return existing.length > 0;
}

export async function listRepostsByUser(userId: number): Promise<RepostEntry[]> {
  if (isMock) {
    return mockReposts
      .filter((r) => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((r) => {
        const post = mockPosts.find((p) => p.id === r.postId);
        if (!post) return null;
        return {
          repostId: r.id,
          repostCreatedAt: r.createdAt,
          quoteText: r.quoteText,
          post: {
            id: post.id,
            content: post.content,
            code: post.code,
            codeLanguage: post.codeLanguage,
            tags: post.tags,
            mediaUrl: post.mediaUrl,
            mediaType: post.mediaType,
            likesCount: post.likesCount,
            commentsCount: post.commentsCount,
            repostsCount: post.repostsCount,
            createdAt: post.createdAt,
            authorId: post.authorId,
            authorName: post.authorName,
            authorAvatar: post.authorAvatar,
          },
        };
      })
      .filter((r): r is RepostEntry => r !== null);
  }

  const db = getDb();
  const rows = await db
    .select({
      repostId: reposts.id,
      repostCreatedAt: reposts.createdAt,
      quoteText: reposts.quoteText,
      postId: posts.id,
      content: posts.content,
      code: posts.code,
      codeLanguage: posts.codeLanguage,
      tags: posts.tags,
      mediaUrl: posts.mediaUrl,
      mediaType: posts.mediaType,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      repostsCount: posts.repostsCount,
      postCreatedAt: posts.createdAt,
      authorId: users.id,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(reposts)
    .innerJoin(posts, eq(reposts.postId, posts.id))
    .innerJoin(users, eq(posts.userId, users.id))
    .where(eq(reposts.userId, userId))
    .orderBy(desc(reposts.createdAt));

  return rows.map((r) => ({
    repostId: r.repostId,
    repostCreatedAt: r.repostCreatedAt,
    quoteText: r.quoteText,
    post: {
      id: r.postId,
      content: r.content,
      code: r.code,
      codeLanguage: r.codeLanguage,
      tags: r.tags,
      mediaUrl: r.mediaUrl,
      mediaType: r.mediaType,
      likesCount: r.likesCount,
      commentsCount: r.commentsCount,
      repostsCount: r.repostsCount,
      createdAt: r.postCreatedAt,
      authorId: r.authorId,
      authorName: r.authorName,
      authorAvatar: r.authorAvatar,
    },
  }));
}
