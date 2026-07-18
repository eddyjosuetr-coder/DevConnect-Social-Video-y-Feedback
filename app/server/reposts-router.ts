import { createRouter, authedQuery } from "./middleware";
import { toggleRepost, isReposted } from "./queries/reposts";
import { toggleRepostSchema } from "@contracts/schemas";
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
});
