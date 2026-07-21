import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().min(1).max(2000),
  code: z.string().max(5000).optional(),
  codeLanguage: z.string().max(50).optional(),
  tags: z.string().max(500).optional(),
  mediaUrl: z.string().max(50000).optional(),
  mediaType: z.enum(['image', 'video']).optional(),
});

export const toggleLikeSchema = z.object({ postId: z.number().int() });

export const isLikedSchema = z.object({ postId: z.number().int() });

export const deletePostSchema = z.object({ postId: z.number().int() });

export const updatePostSchema = z.object({
  postId: z.number().int(),
  content: z.string().min(1).max(2000).optional(),
  code: z.string().max(5000).nullable().optional(),
  codeLanguage: z.string().max(50).nullable().optional(),
  tags: z.string().max(500).nullable().optional(),
});

export const listCommentsSchema = z.object({ postId: z.number().int() });

export const createCommentSchema = z.object({
  postId: z.number().int(),
  content: z.string().min(1).max(1000),
  parentId: z.number().int().optional(),
});

export const deleteCommentSchema = z.object({ commentId: z.number().int() });

export const toggleRepostSchema = z.object({ postId: z.number().int() });

export const quoteRepostSchema = z.object({
  postId: z.number().int(),
  quoteText: z.string().min(1).max(1000),
});

export const listRepostsByUserSchema = z.object({ userId: z.number().int() });

export const sendMessageSchema    = z.object({ receiverId: z.number().int(), content: z.string().min(1).max(2000) });
export const getThreadSchema      = z.object({ otherId: z.number().int() });
export const markReadSchema       = z.object({ otherId: z.number().int() });
export const searchUsersSchema    = z.object({ query: z.string().max(100) });

export const toggleFollowSchema   = z.object({ followingId: z.number().int() });
export const isFollowingSchema    = z.object({ followingId: z.number().int() });
export const getUserProfileSchema = z.object({ userId: z.number().int() });
export const listPostsSchema = z.object({ viewerUserId: z.number().int().optional() }).optional();
export const listPostsByUserSchema = z.object({ userId: z.number().int(), viewerUserId: z.number().int().optional() });

export const updateProfileSchema = z.object({
  name:      z.string().min(1).max(255).optional(),
  bio:       z.string().max(500).optional(),
  avatar:    z.string().max(600000).optional(),
  banner:    z.string().max(2000000).optional(),
  website:   z.string().max(255).optional(),
  githubUrl: z.string().max(255).optional(),
  location:  z.string().max(100).optional(),
});

export const getPostSchema = z.object({ postId: z.number().int() });
export const listByTagSchema = z.object({ tag: z.string().max(100) });

export const toggleBookmarkSchema = z.object({ postId: z.number().int() });
export const listBookmarksSchema = z.object({ viewerUserId: z.number().int().optional() }).optional();

export const getSuggestedUsersSchema = z.object({ limit: z.number().int().max(50).optional() });
export const getTrendingTagsSchema = z.object({ limit: z.number().int().max(50).optional() });

export const listFollowersSchema = z.object({ userId: z.number().int() });
export const toggleCommentLikeSchema = z.object({ commentId: z.number().int() });
export const listRepliesSchema = z.object({ commentId: z.number().int() });
export const searchPostsSchema = z.object({ query: z.string().max(100) });
export const createReportSchema = z.object({
  postId:       z.number().int().optional(),
  targetUserId: z.number().int().optional(),
  reason:       z.string().min(1).max(500),
});
export const resolveReportSchema = z.object({ reportId: z.number().int() });
