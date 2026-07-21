import { eq, desc, sql, and, inArray, count, isNull } from "drizzle-orm";
import { getDb } from "./connection";
import { comments, posts, users, commentLikes } from "@db/schema";
import { mockPosts } from "./posts";

export type CommentRow = {
  id: number;
  content: string;
  createdAt: Date;
  authorId: number;
  authorName: string | null;
  authorAvatar: string | null;
  likesCount: number;
  isLikedByMe: boolean;
  parentId: number | null;
  repliesCount: number;
};

// ── Mock store ────────────────────────────────────────────────────────────────
let nextCommentId = 20;

type StoredComment = Omit<CommentRow, 'likesCount' | 'isLikedByMe' | 'repliesCount'> & { postId: number; userId: number };

export const mockComments: StoredComment[] = [
  {
    id: 1, postId: 1, userId: 3, parentId: null,
    content: "tRPC es increible, especialmente con Next.js o Vite. Buen trabajo!",
    createdAt: new Date(Date.now() - 1 * 3600000),
    authorId: 3, authorName: "Sofia Jimenez", authorAvatar: null,
  },
  {
    id: 2, postId: 2, userId: 2, parentId: null,
    content: "Uso este patron en todos mis proyectos. Muy limpio.",
    createdAt: new Date(Date.now() - 4 * 3600000),
    authorId: 2, authorName: "Alejandro Marin", authorAvatar: null,
  },
  {
    id: 3, postId: 2, userId: 4, parentId: null,
    content: "El tipo Result viene de Rust/Haskell, es un gran patron funcional.",
    createdAt: new Date(Date.now() - 3 * 3600000),
    authorId: 4, authorName: "Carlos Rivera", authorAvatar: null,
  },
];

const isMock = !process.env.DATABASE_URL;

// ── Shared enrichment helper ─────────────────────────────────────────────────

async function enrichWithLikes(
  rows: Array<{ id: number; content: string; createdAt: Date; authorId: number; authorName: string | null; authorAvatar: string | null; parentId: number | null }>,
  viewerUserId?: number,
  repliesCountMap?: Map<number, number>,
): Promise<CommentRow[]> {
  if (rows.length === 0) return [];
  const db = getDb();
  const ids = rows.map((r) => r.id);

  const likeCounts = await db
    .select({ commentId: commentLikes.commentId, total: count() })
    .from(commentLikes)
    .where(inArray(commentLikes.commentId, ids))
    .groupBy(commentLikes.commentId);

  const likeCountMap = new Map(likeCounts.map((l) => [l.commentId, l.total]));

  let likedByMeSet = new Set<number>();
  if (viewerUserId) {
    const myLikes = await db
      .select({ commentId: commentLikes.commentId })
      .from(commentLikes)
      .where(and(eq(commentLikes.userId, viewerUserId), inArray(commentLikes.commentId, ids)));
    likedByMeSet = new Set(myLikes.map((l) => l.commentId));
  }

  return rows.map((r) => ({
    ...r,
    likesCount: likeCountMap.get(r.id) ?? 0,
    isLikedByMe: likedByMeSet.has(r.id),
    repliesCount: repliesCountMap?.get(r.id) ?? 0,
  }));
}

// ── Query functions ──────────────────────────────────────────────────────────

export async function listComments(postId: number, viewerUserId?: number): Promise<CommentRow[]> {
  if (isMock) {
    return mockComments
      .filter((c) => c.postId === postId && c.parentId === null)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(({ postId: _pid, userId: _uid, ...row }) => ({
        ...row,
        likesCount: 0,
        isLikedByMe: false,
        repliesCount: mockComments.filter((r) => r.parentId === row.id).length,
      }));
  }
  const db = getDb();

  const rows = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      authorId: comments.userId,
      authorName: users.name,
      authorAvatar: users.avatar,
      parentId: comments.parentId,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(and(eq(comments.postId, postId), isNull(comments.parentId)))
    .orderBy(desc(comments.createdAt));

  if (rows.length === 0) return [];

  const ids = rows.map((r) => r.id);
  const replyCounts = await db
    .select({ parentId: comments.parentId, total: count() })
    .from(comments)
    .where(inArray(comments.parentId, ids))
    .groupBy(comments.parentId);

  const repliesCountMap = new Map(
    replyCounts
      .filter((r) => r.parentId !== null)
      .map((r) => [r.parentId as number, r.total]),
  );

  return enrichWithLikes(rows as Parameters<typeof enrichWithLikes>[0], viewerUserId, repliesCountMap);
}

export async function listReplies(commentId: number, viewerUserId?: number): Promise<CommentRow[]> {
  if (isMock) {
    return mockComments
      .filter((c) => c.parentId === commentId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map(({ postId: _pid, userId: _uid, ...row }) => ({
        ...row,
        likesCount: 0,
        isLikedByMe: false,
        repliesCount: 0,
      }));
  }
  const db = getDb();

  const rows = await db
    .select({
      id: comments.id,
      content: comments.content,
      createdAt: comments.createdAt,
      authorId: comments.userId,
      authorName: users.name,
      authorAvatar: users.avatar,
      parentId: comments.parentId,
    })
    .from(comments)
    .leftJoin(users, eq(comments.userId, users.id))
    .where(eq(comments.parentId, commentId))
    .orderBy(comments.createdAt);

  return enrichWithLikes(rows as Parameters<typeof enrichWithLikes>[0], viewerUserId);
}

export async function toggleCommentLike(userId: number, commentId: number): Promise<{ liked: boolean }> {
  if (isMock) return { liked: false };
  const db = getDb();
  const existing = await db
    .select()
    .from(commentLikes)
    .where(and(eq(commentLikes.userId, userId), eq(commentLikes.commentId, commentId)))
    .limit(1);
  if (existing.length > 0) {
    await db.delete(commentLikes).where(eq(commentLikes.id, existing[0].id));
    return { liked: false };
  }
  await db.insert(commentLikes).values({ userId, commentId });
  return { liked: true };
}

export async function createComment(data: {
  postId: number;
  userId: number;
  content: string;
  authorName: string | null;
  authorAvatar: string | null;
  parentId?: number | null;
}): Promise<{ success: boolean; postOwnerId: number | null }> {
  if (isMock) {
    const id = nextCommentId++;
    mockComments.push({
      id, postId: data.postId, userId: data.userId,
      content: data.content,
      createdAt: new Date(),
      authorId: data.userId, authorName: data.authorName, authorAvatar: data.authorAvatar,
      parentId: data.parentId ?? null,
    });
    const post = mockPosts.find((p) => p.id === data.postId);
    if (post) post.commentsCount += 1;
    return { success: true, postOwnerId: post?.userId ?? null };
  }
  const db = getDb();
  const [postRow] = await db.select({ userId: posts.userId }).from(posts).where(eq(posts.id, data.postId)).limit(1);
  await db.insert(comments).values({
    postId: data.postId,
    userId: data.userId,
    content: data.content,
    parentId: data.parentId ?? null,
  });
  if (!data.parentId) {
    await db.update(posts).set({ commentsCount: sql`${posts.commentsCount} + 1` }).where(eq(posts.id, data.postId));
  }
  return { success: true, postOwnerId: postRow?.userId ?? null };
}

export async function deleteComment(commentId: number, userId: number): Promise<{ success: boolean }> {
  if (isMock) {
    const idx = mockComments.findIndex((c) => c.id === commentId && c.userId === userId);
    if (idx === -1) return { success: false };
    const [removed] = mockComments.splice(idx, 1);
    const post = mockPosts.find((p) => p.id === removed.postId);
    if (post) post.commentsCount = Math.max(0, post.commentsCount - 1);
    return { success: true };
  }
  const db = getDb();
  const [comment] = await db.select().from(comments).where(eq(comments.id, commentId)).limit(1);
  if (!comment || comment.userId !== userId) return { success: false };
  await db.delete(comments).where(eq(comments.id, commentId));
  if (!comment.parentId) {
    await db.update(posts).set({ commentsCount: sql`${posts.commentsCount} - 1` }).where(eq(posts.id, comment.postId));
  }
  return { success: true };
}
