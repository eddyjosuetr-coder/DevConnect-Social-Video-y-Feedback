import { createRouter, authedQuery } from "./middleware";
import { toggleFollow, isFollowing, listFollowing } from "./queries/follows";
import { toggleFollowSchema, isFollowingSchema } from "@contracts/schemas";

export const followsRouter = createRouter({
  toggle: authedQuery.input(toggleFollowSchema).mutation(({ ctx, input }) =>
    toggleFollow(ctx.user.id, input.followingId)
  ),

  isFollowing: authedQuery.input(isFollowingSchema).query(({ ctx, input }) =>
    isFollowing(ctx.user.id, input.followingId)
  ),

  listFollowing: authedQuery.query(({ ctx }) =>
    listFollowing(ctx.user.id)
  ),
});
