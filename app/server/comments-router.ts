import { createRouter, publicQuery, authedQuery } from "./middleware";
import { listComments, listReplies, createComment, deleteComment, toggleCommentLike } from "./queries/comments";
import { listCommentsSchema, listRepliesSchema, createCommentSchema, deleteCommentSchema, toggleCommentLikeSchema } from "@contracts/schemas";
import { createNotification } from "./queries/notifications";

export const commentsRouter = createRouter({
  list: publicQuery.input(listCommentsSchema).query(({ ctx, input }) =>
    listComments(input.postId, ctx.user?.id)
  ),

  listReplies: publicQuery.input(listRepliesSchema).query(({ ctx, input }) =>
    listReplies(input.commentId, ctx.user?.id)
  ),

  create: authedQuery.input(createCommentSchema).mutation(async ({ ctx, input }) => {
    const result = await createComment({
      postId: input.postId,
      userId: ctx.user.id,
      content: input.content,
      authorName: ctx.user.name ?? null,
      authorAvatar: ctx.user.avatar ?? null,
      parentId: input.parentId ?? null,
    });
    if (result.postOwnerId && !input.parentId) {
      void createNotification(ctx.user.id, result.postOwnerId, "comment", input.postId);
    }
    return result;
  }),

  delete: authedQuery.input(deleteCommentSchema).mutation(({ ctx, input }) =>
    deleteComment(input.commentId, ctx.user.id)
  ),

  toggleLike: authedQuery.input(toggleCommentLikeSchema).mutation(({ ctx, input }) =>
    toggleCommentLike(ctx.user.id, input.commentId)
  ),
});
