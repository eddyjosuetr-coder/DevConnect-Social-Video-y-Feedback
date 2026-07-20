import { eq, desc, and, sql, inArray } from "drizzle-orm";
import { getDb } from "./connection";
import { posts, postLikes, reposts, users, follows } from "@db/schema";

export type PostRow = {
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
  isLikedByMe?: boolean;
  isRepostedByMe?: boolean;
  isRepostEntry?: boolean;
  repostId?: number;
  repostCreatedAt?: Date;
  quoteText?: string | null;
  reposterId?: number;
  reposterName?: string | null;
  reposterAvatar?: string | null;
};

// ── Mock store ────────────────────────────────────────────────────────────────
let nextPostId = 10;

type StoredPost = PostRow & { userId: number };

export const mockPosts: StoredPost[] = [
  {
    id: 1, userId: 2,
    content: "Acabo de deployar mi primer proyecto con tRPC + React 19. La type-safety end-to-end es un game changer 🚀",
    code: null, codeLanguage: null, tags: "trpc,react,typescript",
    mediaUrl: null, mediaType: null,
    likesCount: 5, commentsCount: 1, repostsCount: 3,
    createdAt: new Date(Date.now() - 2 * 3600000),
    authorId: 2, authorName: "Alejandro Marin", authorAvatar: null,
  },
  {
    id: 2, userId: 3,
    content: "Patron que uso para manejar errores en TypeScript sin excepciones:",
    code: `type Result<T, E = Error> = { ok: true; value: T } | { ok: false; error: E };\n\nasync function fetchUser(id: string): Promise<Result<User>> {\n  const res = await fetch(\`/api/users/\${id}\`);\n  if (!res.ok) return { ok: false, error: new Error('Not found') };\n  return { ok: true, value: await res.json() };\n}`,
    codeLanguage: "typescript", tags: "typescript,patterns",
    mediaUrl: null, mediaType: null,
    likesCount: 18, commentsCount: 2, repostsCount: 7,
    createdAt: new Date(Date.now() - 5 * 3600000),
    authorId: 3, authorName: "Sofia Jimenez", authorAvatar: null,
  },
  {
    id: 3, userId: 4,
    content: "Tip: usa CSS container queries en lugar de media queries para componentes realmente reutilizables.",
    code: `@container (min-width: 400px) {\n  .card {\n    display: grid;\n    grid-template-columns: auto 1fr;\n  }\n}`,
    codeLanguage: "css", tags: "css,webdev",
    mediaUrl: null, mediaType: null,
    likesCount: 9, commentsCount: 0, repostsCount: 2,
    createdAt: new Date(Date.now() - 24 * 3600000),
    authorId: 4, authorName: "Carlos Rivera", authorAvatar: null,
  },
];

const mockLikes = new Set<string>(); // "userId:postId"

const isMock = !process.env.DATABASE_URL;

// ── Query functions ──────────────────────────────────────────────────────────

export async function listPosts(viewerUserId?: number): Promise<PostRow[]> {
  if (isMock) {
    return [...mockPosts]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(({ userId: _uid, ...row }) => ({
        ...row,
        isLikedByMe: viewerUserId ? mockLikes.has(`${viewerUserId}:${row.id}`) : false,
        isRepostedByMe: false,
        isRepostEntry: false,
      }));
  }
  const db = getDb();
  const safeViewerId = viewerUserId ?? 0;

  const [originalPosts, repostEntries] = await Promise.all([
    // Original posts with viewer's liked/reposted status
    db.select({
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
      isLikedByMe: sql<number>`CASE WHEN ${postLikes.id} IS NOT NULL THEN 1 ELSE 0 END`,
      isRepostedByMe: sql<number>`CASE WHEN ${reposts.id} IS NOT NULL THEN 1 ELSE 0 END`,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(postLikes, and(eq(postLikes.postId, posts.id), eq(postLikes.userId, safeViewerId)))
    .leftJoin(reposts, and(eq(reposts.postId, posts.id), eq(reposts.userId, safeViewerId))),

    // Repost feed entries (who shared what)
    db.select({
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
      repostId: reposts.id,
      repostCreatedAt: reposts.createdAt,
      quoteText: reposts.quoteText,
      reposterId: reposts.userId,
      reposterName: sql<string | null>`(SELECT name FROM \`users\` WHERE id = ${reposts.userId})`,
      reposterAvatar: sql<string | null>`(SELECT avatar FROM \`users\` WHERE id = ${reposts.userId})`,
    })
    .from(reposts)
    .innerJoin(posts, eq(reposts.postId, posts.id))
    .innerJoin(users, eq(posts.userId, users.id)),
  ]);

  return [
    ...originalPosts.map((r) => ({
      ...r,
      isLikedByMe: Boolean(r.isLikedByMe),
      isRepostedByMe: Boolean(r.isRepostedByMe),
      isRepostEntry: false as const,
    })),
    ...repostEntries.map((r) => ({
      ...r,
      isLikedByMe: false,
      isRepostedByMe: false,
      isRepostEntry: true as const,
    })),
  ].sort((a, b) => {
    const dateA = a.isRepostEntry ? (a.repostCreatedAt ?? a.createdAt).getTime() : a.createdAt.getTime();
    const dateB = b.isRepostEntry ? (b.repostCreatedAt ?? b.createdAt).getTime() : b.createdAt.getTime();
    return dateB - dateA;
  });
}

export async function listPostsByUser(userId: number, viewerUserId?: number): Promise<PostRow[]> {
  if (isMock) {
    return [...mockPosts]
      .filter((p) => p.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(({ userId: _uid, ...row }) => ({
        ...row,
        isLikedByMe: viewerUserId ? mockLikes.has(`${viewerUserId}:${row.id}`) : false,
        isRepostedByMe: false,
      }));
  }
  const db = getDb();
  const safeViewerId = viewerUserId ?? 0;
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
      isLikedByMe: sql<number>`CASE WHEN ${postLikes.id} IS NOT NULL THEN 1 ELSE 0 END`,
      isRepostedByMe: sql<number>`CASE WHEN ${reposts.id} IS NOT NULL THEN 1 ELSE 0 END`,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(postLikes, and(eq(postLikes.postId, posts.id), eq(postLikes.userId, safeViewerId)))
    .leftJoin(reposts, and(eq(reposts.postId, posts.id), eq(reposts.userId, safeViewerId)))
    .where(eq(posts.userId, userId))
    .orderBy(desc(posts.createdAt));
  return rows.map((row) => ({
    ...row,
    isLikedByMe: Boolean(row.isLikedByMe),
    isRepostedByMe: Boolean(row.isRepostedByMe),
  }));
}

export async function createPost(data: {
  userId: number;
  content: string;
  code: string | null;
  codeLanguage: string | null;
  tags: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  authorName: string | null;
  authorAvatar: string | null;
}): Promise<{ id: number }> {
  if (isMock) {
    const id = nextPostId++;
    mockPosts.unshift({
      id, userId: data.userId,
      content: data.content, code: data.code, codeLanguage: data.codeLanguage, tags: data.tags,
      mediaUrl: data.mediaUrl, mediaType: data.mediaType,
      likesCount: 0, commentsCount: 0, repostsCount: 0,
      createdAt: new Date(),
      authorId: data.userId, authorName: data.authorName, authorAvatar: data.authorAvatar,
    });
    return { id };
  }
  const db = getDb();
  const [result] = await db.insert(posts).values({
    userId: data.userId,
    content: data.content,
    code: data.code,
    codeLanguage: data.codeLanguage,
    tags: data.tags,
    mediaUrl: data.mediaUrl,
    mediaType: data.mediaType,
  });
  return { id: result.insertId };
}

export async function toggleLike(postId: number, userId: number): Promise<{ liked: boolean; postOwnerId: number | null }> {
  if (isMock) {
    const key = `${userId}:${postId}`;
    const post = mockPosts.find((p) => p.id === postId);
    if (!post) return { liked: false, postOwnerId: null };
    if (mockLikes.has(key)) {
      mockLikes.delete(key);
      post.likesCount = Math.max(0, post.likesCount - 1);
      return { liked: false, postOwnerId: post.userId };
    }
    mockLikes.add(key);
    post.likesCount += 1;
    return { liked: true, postOwnerId: post.userId };
  }
  const db = getDb();
  const [postRow] = await db.select({ userId: posts.userId }).from(posts).where(eq(posts.id, postId)).limit(1);
  const postOwnerId = postRow?.userId ?? null;
  const existing = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    .limit(1);
  if (existing.length > 0) {
    await db.delete(postLikes).where(eq(postLikes.id, existing[0].id));
    await db.update(posts).set({ likesCount: sql`${posts.likesCount} - 1` }).where(eq(posts.id, postId));
    return { liked: false, postOwnerId };
  }
  await db.insert(postLikes).values({ postId, userId });
  await db.update(posts).set({ likesCount: sql`${posts.likesCount} + 1` }).where(eq(posts.id, postId));
  return { liked: true, postOwnerId };
}

export async function isLiked(postId: number, userId: number): Promise<boolean> {
  if (isMock) return mockLikes.has(`${userId}:${postId}`);
  const db = getDb();
  const existing = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    .limit(1);
  return existing.length > 0;
}

export async function deletePost(postId: number, userId: number): Promise<{ success: boolean }> {
  if (isMock) {
    const idx = mockPosts.findIndex((p) => p.id === postId && p.userId === userId);
    if (idx === -1) return { success: false };
    mockPosts.splice(idx, 1);
    return { success: true };
  }
  const db = getDb();
  await db.delete(posts).where(and(eq(posts.id, postId), eq(posts.userId, userId)));
  return { success: true };
}

// ── listFeed — posts from followed users + own, fallback to all ───────────────
export async function listFeed(viewerUserId: number): Promise<PostRow[]> {
  if (isMock) return listPosts(viewerUserId);
  const db = getDb();

  const followedRows = await db
    .select({ followingId: follows.followingId })
    .from(follows)
    .where(eq(follows.followerId, viewerUserId));

  const followedIds = followedRows.map((r) => r.followingId);
  if (followedIds.length === 0) return listPosts(viewerUserId);

  const feedUserIds = [...followedIds, viewerUserId];
  const sv = viewerUserId;

  const [originalPosts, repostEntries] = await Promise.all([
    db.select({
      id: posts.id, content: posts.content, code: posts.code,
      codeLanguage: posts.codeLanguage, tags: posts.tags,
      mediaUrl: posts.mediaUrl, mediaType: posts.mediaType,
      likesCount: posts.likesCount, commentsCount: posts.commentsCount,
      repostsCount: posts.repostsCount, createdAt: posts.createdAt,
      authorId: posts.userId, authorName: users.name, authorAvatar: users.avatar,
      isLikedByMe: sql<number>`CASE WHEN ${postLikes.id} IS NOT NULL THEN 1 ELSE 0 END`,
      isRepostedByMe: sql<number>`CASE WHEN ${reposts.id} IS NOT NULL THEN 1 ELSE 0 END`,
    })
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .leftJoin(postLikes, and(eq(postLikes.postId, posts.id), eq(postLikes.userId, sv)))
    .leftJoin(reposts, and(eq(reposts.postId, posts.id), eq(reposts.userId, sv)))
    .where(inArray(posts.userId, feedUserIds)),

    db.select({
      id: posts.id, content: posts.content, code: posts.code,
      codeLanguage: posts.codeLanguage, tags: posts.tags,
      mediaUrl: posts.mediaUrl, mediaType: posts.mediaType,
      likesCount: posts.likesCount, commentsCount: posts.commentsCount,
      repostsCount: posts.repostsCount, createdAt: posts.createdAt,
      authorId: posts.userId, authorName: users.name, authorAvatar: users.avatar,
      repostId: reposts.id, repostCreatedAt: reposts.createdAt,
      quoteText: reposts.quoteText, reposterId: reposts.userId,
      reposterName: sql<string | null>`(SELECT name FROM \`users\` WHERE id = ${reposts.userId})`,
      reposterAvatar: sql<string | null>`(SELECT avatar FROM \`users\` WHERE id = ${reposts.userId})`,
    })
    .from(reposts)
    .innerJoin(posts, eq(reposts.postId, posts.id))
    .innerJoin(users, eq(posts.userId, users.id))
    .where(inArray(reposts.userId, feedUserIds)),
  ]);

  return [
    ...originalPosts.map((r) => ({
      ...r, isLikedByMe: Boolean(r.isLikedByMe),
      isRepostedByMe: Boolean(r.isRepostedByMe), isRepostEntry: false as const,
    })),
    ...repostEntries.map((r) => ({
      ...r, isLikedByMe: false, isRepostedByMe: false, isRepostEntry: true as const,
    })),
  ].sort((a, b) => {
    const dateA = a.isRepostEntry ? (a.repostCreatedAt ?? a.createdAt).getTime() : a.createdAt.getTime();
    const dateB = b.isRepostEntry ? (b.repostCreatedAt ?? b.createdAt).getTime() : b.createdAt.getTime();
    return dateB - dateA;
  });
}

// ── getPostById ───────────────────────────────────────────────────────────────
export async function getPostById(postId: number, viewerUserId?: number): Promise<PostRow | null> {
  if (isMock) {
    const p = mockPosts.find((m) => m.id === postId);
    if (!p) return null;
    const { userId: _uid, ...row } = p;
    return { ...row, isLikedByMe: false, isRepostedByMe: false, isRepostEntry: false };
  }
  const db = getDb();
  const sv = viewerUserId ?? 0;
  const rows = await db.select({
    id: posts.id, content: posts.content, code: posts.code,
    codeLanguage: posts.codeLanguage, tags: posts.tags,
    mediaUrl: posts.mediaUrl, mediaType: posts.mediaType,
    likesCount: posts.likesCount, commentsCount: posts.commentsCount,
    repostsCount: posts.repostsCount, createdAt: posts.createdAt,
    authorId: posts.userId, authorName: users.name, authorAvatar: users.avatar,
    isLikedByMe: sql<number>`CASE WHEN ${postLikes.id} IS NOT NULL THEN 1 ELSE 0 END`,
    isRepostedByMe: sql<number>`CASE WHEN ${reposts.id} IS NOT NULL THEN 1 ELSE 0 END`,
  })
  .from(posts)
  .leftJoin(users, eq(posts.userId, users.id))
  .leftJoin(postLikes, and(eq(postLikes.postId, posts.id), eq(postLikes.userId, sv)))
  .leftJoin(reposts, and(eq(reposts.postId, posts.id), eq(reposts.userId, sv)))
  .where(eq(posts.id, postId))
  .limit(1);
  if (!rows[0]) return null;
  return {
    ...rows[0],
    isLikedByMe: Boolean(rows[0].isLikedByMe),
    isRepostedByMe: Boolean(rows[0].isRepostedByMe),
    isRepostEntry: false as const,
  };
}

// ── listPostsByTag ────────────────────────────────────────────────────────────
export async function listPostsByTag(tag: string, viewerUserId?: number): Promise<PostRow[]> {
  if (isMock) {
    return [...mockPosts]
      .filter((p) => p.tags?.split(',').map((t) => t.trim()).includes(tag))
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(({ userId: _uid, ...row }) => ({
        ...row, isLikedByMe: false, isRepostedByMe: false, isRepostEntry: false,
      }));
  }
  const db = getDb();
  const sv = viewerUserId ?? 0;
  const rows = await db.select({
    id: posts.id, content: posts.content, code: posts.code,
    codeLanguage: posts.codeLanguage, tags: posts.tags,
    mediaUrl: posts.mediaUrl, mediaType: posts.mediaType,
    likesCount: posts.likesCount, commentsCount: posts.commentsCount,
    repostsCount: posts.repostsCount, createdAt: posts.createdAt,
    authorId: posts.userId, authorName: users.name, authorAvatar: users.avatar,
    isLikedByMe: sql<number>`CASE WHEN ${postLikes.id} IS NOT NULL THEN 1 ELSE 0 END`,
    isRepostedByMe: sql<number>`CASE WHEN ${reposts.id} IS NOT NULL THEN 1 ELSE 0 END`,
  })
  .from(posts)
  .leftJoin(users, eq(posts.userId, users.id))
  .leftJoin(postLikes, and(eq(postLikes.postId, posts.id), eq(postLikes.userId, sv)))
  .leftJoin(reposts, and(eq(reposts.postId, posts.id), eq(reposts.userId, sv)))
  .where(sql`FIND_IN_SET(${tag}, ${posts.tags}) > 0`)
  .orderBy(desc(posts.createdAt));
  return rows.map((r) => ({
    ...r, isLikedByMe: Boolean(r.isLikedByMe),
    isRepostedByMe: Boolean(r.isRepostedByMe), isRepostEntry: false as const,
  }));
}

export async function updatePost(
  postId: number,
  userId: number,
  data: {
    content?: string;
    code?: string | null;
    codeLanguage?: string | null;
    tags?: string | null;
  },
): Promise<{ success: boolean }> {
  if (isMock) {
    const post = mockPosts.find((p) => p.id === postId && p.userId === userId);
    if (!post) return { success: false };
    if (data.content !== undefined) post.content = data.content;
    if (data.code !== undefined) post.code = data.code;
    if (data.codeLanguage !== undefined) post.codeLanguage = data.codeLanguage;
    if (data.tags !== undefined) post.tags = data.tags;
    return { success: true };
  }
  const db = getDb();
  const fields: Partial<typeof posts.$inferInsert> = {};
  if (data.content !== undefined) fields.content = data.content;
  if (data.code !== undefined) fields.code = data.code ?? undefined;
  if (data.codeLanguage !== undefined) fields.codeLanguage = data.codeLanguage ?? undefined;
  if (data.tags !== undefined) fields.tags = data.tags ?? undefined;
  if (Object.keys(fields).length === 0) return { success: false };
  await db.update(posts).set(fields).where(and(eq(posts.id, postId), eq(posts.userId, userId)));
  return { success: true };
}
