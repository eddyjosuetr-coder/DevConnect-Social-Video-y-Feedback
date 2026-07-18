import { createRouter, publicQuery, authedQuery } from "./middleware";
import { listPosts, listPostsByUser, createPost, toggleLike, isLiked, deletePost } from "./queries/posts";
import { createPostSchema, toggleLikeSchema, isLikedSchema, deletePostSchema, listPostsByUserSchema } from "@contracts/schemas";
import { createNotification } from "./queries/notifications";

export const postsRouter = createRouter({
  list: publicQuery.query(() => listPosts()),

  listByUser: publicQuery.input(listPostsByUserSchema).query(({ input }) =>
    listPostsByUser(input.userId)
  ),

  create: authedQuery.input(createPostSchema).mutation(({ ctx, input }) =>
    createPost({
      userId: ctx.user.id,
      content: input.content,
      code: input.code ?? null,
      codeLanguage: input.codeLanguage ?? null,
      tags: input.tags ?? null,
      mediaUrl: input.mediaUrl ?? null,
      mediaType: input.mediaType ?? null,
      authorName: ctx.user.name ?? null,
      authorAvatar: ctx.user.avatar ?? null,
    })
  ),

  toggleLike: authedQuery.input(toggleLikeSchema).mutation(async ({ ctx, input }) => {
    const result = await toggleLike(input.postId, ctx.user.id);
    if (result.liked && result.postOwnerId) {
      void createNotification(ctx.user.id, result.postOwnerId, "like", input.postId);
    }
    return result;
  }),

  isLiked: authedQuery.input(isLikedSchema).query(({ ctx, input }) =>
    isLiked(input.postId, ctx.user.id)
  ),

  delete: authedQuery.input(deletePostSchema).mutation(({ ctx, input }) =>
    deletePost(input.postId, ctx.user.id)
  ),
});
