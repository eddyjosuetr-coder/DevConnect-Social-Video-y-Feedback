import { createRouter, authedQuery } from "./middleware";
import { toggleRepost, isReposted } from "./queries/reposts";
import { toggleRepostSchema } from "@contracts/schemas";

export const repostsRouter = createRouter({
  toggle: authedQuery.input(toggleRepostSchema).mutation(({ ctx, input }) =>
    toggleRepost(input.postId, ctx.user.id)
  ),

  isReposted: authedQuery.input(toggleRepostSchema).query(({ ctx, input }) =>
    isReposted(input.postId, ctx.user.id)
  ),
});
