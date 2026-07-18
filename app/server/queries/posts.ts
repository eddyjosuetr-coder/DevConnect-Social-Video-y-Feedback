import { eq, desc, and, sql } from "drizzle-orm";
import { getDb } from "./connection";
import { posts, postLikes, users } from "@db/schema";

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

export async function listPosts(): Promise<PostRow[]> {
  if (isMock) {
    return [...mockPosts]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map(({ userId: _uid, ...row }) => row);
  }
  const db = getDb();
  return db
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
    .from(posts)
    .leftJoin(users, eq(posts.userId, users.id))
    .orderBy(desc(posts.createdAt));
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

export async function toggleLike(postId: number, userId: number): Promise<{ liked: boolean }> {
  if (isMock) {
    const key = `${userId}:${postId}`;
    const post = mockPosts.find((p) => p.id === postId);
    if (!post) return { liked: false };
    if (mockLikes.has(key)) {
      mockLikes.delete(key);
      post.likesCount = Math.max(0, post.likesCount - 1);
      return { liked: false };
    }
    mockLikes.add(key);
    post.likesCount += 1;
    return { liked: true };
  }
  const db = getDb();
  const existing = await db
    .select()
    .from(postLikes)
    .where(and(eq(postLikes.postId, postId), eq(postLikes.userId, userId)))
    .limit(1);
  if (existing.length > 0) {
    await db.delete(postLikes).where(eq(postLikes.id, existing[0].id));
    await db.update(posts).set({ likesCount: sql`${posts.likesCount} - 1` }).where(eq(posts.id, postId));
    return { liked: false };
  }
  await db.insert(postLikes).values({ postId, userId });
  await db.update(posts).set({ likesCount: sql`${posts.likesCount} + 1` }).where(eq(posts.id, postId));
  return { liked: true };
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
