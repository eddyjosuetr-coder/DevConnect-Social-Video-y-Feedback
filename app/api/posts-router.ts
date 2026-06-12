import { createRouter, publicQuery, authedQuery } from "./middleware";
import { listPosts, createPost, toggleLike, isLiked, deletePost } from "./queries/posts";
import { createPostSchema, toggleLikeSchema, isLikedSchema, deletePostSchema } from "@contracts/schemas";

export const postsRouter = createRouter({
  list: publicQuery.query(() => listPosts()),

  create: authedQuery.input(createPostSchema).mutation(({ ctx, input }) =>
    createPost({
      userId: ctx.user.id,
      content: input.content,
      code: input.code ?? null,
      codeLanguage: input.codeLanguage ?? null,
      tags: input.tags ?? null,
      authorName: ctx.user.name ?? null,
      authorAvatar: ctx.user.avatar ?? null,
    })
  ),

  toggleLike: authedQuery.input(toggleLikeSchema).mutation(({ ctx, input }) =>
    toggleLike(input.postId, ctx.user.id)
  ),

  isLiked: authedQuery.input(isLikedSchema).query(({ ctx, input }) =>
    isLiked(input.postId, ctx.user.id)
  ),

  delete: authedQuery.input(deletePostSchema).mutation(({ ctx, input }) =>
    deletePost(input.postId, ctx.user.id)
  ),
});
