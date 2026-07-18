import { createRouter, authedQuery, publicQuery } from "./middleware";
import { toggleRepost, isReposted, quoteRepost, listRepostsByUser } from "./queries/reposts";
import { toggleRepostSchema, quoteRepostSchema, listRepostsByUserSchema } from "@contracts/schemas";
import { createNotification } from "./queries/notifications";

export const repostsRouter = createRouter({
  toggle: authedQuery.input(toggleRepostSchema).mutation(async ({ ctx, input }) => {
    const result = await toggleRepost(input.postId, ctx.user.id);
    if (result.reposted && result.postOwnerId) {
      void createNotification(ctx.user.id, result.postOwnerId, "repost", input.postId);
    }
    return result;
  }),

  isReposted: authedQuery.input(toggleRepostSchema).query(({ ctx, input }) =>
    isReposted(input.postId, ctx.user.id)
  ),

  quote: authedQuery.input(quoteRepostSchema).mutation(async ({ ctx, input }) => {
    const result = await quoteRepost(input.postId, ctx.user.id, input.quoteText);
    if (result.postOwnerId) {
      void createNotification(ctx.user.id, result.postOwnerId, "repost", input.postId);
    }
    return result;
  }),

  listByUser: publicQuery.input(listRepostsByUserSchema).query(({ input }) =>
    listRepostsByUser(input.userId)
  ),
});
