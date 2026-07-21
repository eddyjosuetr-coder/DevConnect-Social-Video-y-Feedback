import { createRouter, publicQuery, authedQuery } from "./middleware";
import { listPosts, listPostsByUser, createPost, toggleLike, isLiked, deletePost, updatePost, listFeed, getPostById, listPostsByTag, searchPosts } from "./queries/posts";
import { listPostsSchema, createPostSchema, toggleLikeSchema, isLikedSchema, deletePostSchema, listPostsByUserSchema, updatePostSchema, getPostSchema, listByTagSchema, searchPostsSchema } from "@contracts/schemas";
import { createNotification } from "./queries/notifications";

export const postsRouter = createRouter({
  list: publicQuery.input(listPostsSchema).query(({ input }) => listPosts(input?.viewerUserId)),

  listByUser: publicQuery.input(listPostsByUserSchema).query(({ input }) =>
    listPostsByUser(input.userId, input.viewerUserId)
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

  update: authedQuery.input(updatePostSchema).mutation(({ ctx, input }) =>
    updatePost(input.postId, ctx.user.id, {
      content: input.content,
      code: input.code,
      codeLanguage: input.codeLanguage,
      tags: input.tags,
    })
  ),

  feed: authedQuery.query(({ ctx }) => listFeed(ctx.user.id)),

  get: publicQuery.input(getPostSchema).query(({ ctx, input }) =>
    getPostById(input.postId, ctx?.user?.id)
  ),

  listByTag: publicQuery.input(listByTagSchema).query(({ ctx, input }) =>
    listPostsByTag(input.tag, ctx?.user?.id)
  ),

  search: publicQuery.input(searchPostsSchema).query(({ ctx, input }) =>
    searchPosts(input.query, ctx?.user?.id)
  ),
});
