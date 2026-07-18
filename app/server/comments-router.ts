import { createRouter, publicQuery, authedQuery } from "./middleware";
import { listComments, createComment, deleteComment } from "./queries/comments";
import { listCommentsSchema, createCommentSchema, deleteCommentSchema } from "@contracts/schemas";
import { createNotification } from "./queries/notifications";

export const commentsRouter = createRouter({
  list: publicQuery.input(listCommentsSchema).query(({ input }) =>
    listComments(input.postId)
  ),

  create: authedQuery.input(createCommentSchema).mutation(async ({ ctx, input }) => {
    const result = await createComment({
      postId: input.postId,
      userId: ctx.user.id,
      content: input.content,
      authorName: ctx.user.name ?? null,
      authorAvatar: ctx.user.avatar ?? null,
    });
    if (result.postOwnerId) {
      void createNotification(ctx.user.id, result.postOwnerId, "comment", input.postId);
    }
    return result;
  }),

  delete: authedQuery.input(deleteCommentSchema).mutation(({ ctx, input }) =>
    deleteComment(input.commentId, ctx.user.id)
  ),
});
