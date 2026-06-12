import { createRouter, publicQuery, authedQuery } from "./middleware";
import { listComments, createComment, deleteComment } from "./queries/comments";
import { listCommentsSchema, createCommentSchema, deleteCommentSchema } from "@contracts/schemas";

export const commentsRouter = createRouter({
  list: publicQuery.input(listCommentsSchema).query(({ input }) =>
    listComments(input.postId)
  ),

  create: authedQuery.input(createCommentSchema).mutation(({ ctx, input }) =>
    createComment({
      postId: input.postId,
      userId: ctx.user.id,
      content: input.content,
      authorName: ctx.user.name ?? null,
      authorAvatar: ctx.user.avatar ?? null,
    })
  ),

  delete: authedQuery.input(deleteCommentSchema).mutation(({ ctx, input }) =>
    deleteComment(input.commentId, ctx.user.id)
  ),
});
