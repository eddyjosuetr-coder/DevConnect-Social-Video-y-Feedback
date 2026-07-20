import { eq, and, desc } from "drizzle-orm";
import { getDb } from "./connection";
import { bookmarks, posts, users } from "@db/schema";
import type { PostRow } from "./posts";

const isMock = !process.env.DATABASE_URL;
const mockBookmarks = new Map<string, number[]>(); // userId => postId[]

export async function toggleBookmark(
  userId: number,
  postId: number,
): Promise<{ bookmarked: boolean }> {
  if (isMock) {
    const key = String(userId);
    const ids = mockBookmarks.get(key) ?? [];
    const idx = ids.indexOf(postId);
    if (idx >= 0) {
      ids.splice(idx, 1);
      mockBookmarks.set(key, ids);
      return { bookmarked: false };
    }
    mockBookmarks.set(key, [...ids, postId]);
    return { bookmarked: true };
  }
  const db = getDb();
  const existing = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)))
    .limit(1);

  if (existing.length > 0) {
    await db.delete(bookmarks).where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)));
    return { bookmarked: false };
  }
  await db.insert(bookmarks).values({ userId, postId });
  return { bookmarked: true };
}

export async function isBookmarked(userId: number, postId: number): Promise<boolean> {
  if (isMock) {
    return (mockBookmarks.get(String(userId)) ?? []).includes(postId);
  }
  const db = getDb();
  const row = await db
    .select({ id: bookmarks.id })
    .from(bookmarks)
    .where(and(eq(bookmarks.userId, userId), eq(bookmarks.postId, postId)))
    .limit(1);
  return row.length > 0;
}

export async function listBookmarks(userId: number): Promise<PostRow[]> {
  if (isMock) return [];
  const db = getDb();
  const rows = await db
    .select({
      id: posts.id,
      content: posts.content,
      code: posts.code,
      codeLanguage: posts.codeLanguage,
      tags: posts.tags,
      mediaUrl: posts.mediaUrl,
      mediaType: posts.mediaType,
      likesCount: posts.likesCount,
      commentsCount: posts.commentsCount,
      repostsCount: posts.repostsCount,
      createdAt: posts.createdAt,
      authorId: posts.userId,
      authorName: users.name,
      authorAvatar: users.avatar,
    })
    .from(bookmarks)
    .innerJoin(posts, eq(bookmarks.postId, posts.id))
    .innerJoin(users, eq(posts.userId, users.id))
    .where(eq(bookmarks.userId, userId))
    .orderBy(desc(bookmarks.createdAt));

  return rows.map((r) => ({
    ...r,
    isLikedByMe: false,
    isRepostedByMe: false,
    isRepostEntry: false as const,
  }));
}

export async function getBookmarkedPostIds(userId: number): Promise<number[]> {
  if (isMock) return mockBookmarks.get(String(userId)) ?? [];
  const db = getDb();
  const rows = await db
    .select({ postId: bookmarks.postId })
    .from(bookmarks)
    .where(eq(bookmarks.userId, userId));
  return rows.map((r) => r.postId);
}
