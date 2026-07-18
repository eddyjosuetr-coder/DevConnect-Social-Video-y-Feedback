import { z } from "zod";

export const createPostSchema = z.object({
  content: z.string().min(1).max(2000),
  code: z.string().max(5000).optional(),
  codeLanguage: z.string().max(50).optional(),
  tags: z.string().max(500).optional(),
});

export const toggleLikeSchema = z.object({ postId: z.number().int() });

export const isLikedSchema = z.object({ postId: z.number().int() });

export const deletePostSchema = z.object({ postId: z.number().int() });

export const listCommentsSchema = z.object({ postId: z.number().int() });

export const createCommentSchema = z.object({
  postId: z.number().int(),
  content: z.string().min(1).max(1000),
});

export const deleteCommentSchema = z.object({ commentId: z.number().int() });

export const toggleRepostSchema = z.object({ postId: z.number().int() });

export const toggleFollowSchema = z.object({ followingId: z.number().int() });
export const isFollowingSchema  = z.object({ followingId: z.number().int() });

export const updateProfileSchema = z.object({
  name:   z.string().min(1).max(255).optional(),
  bio:    z.string().max(500).optional(),
  avatar: z.string().max(600000).optional(),
  banner: z.string().max(2000000).optional(),
});
