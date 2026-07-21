import { createRouter, publicQuery, authedQuery } from "./middleware";
import { toggleFollow, isFollowing, listFollowing, listFollowers, listFollowingUsers } from "./queries/follows";
import { toggleFollowSchema, isFollowingSchema, listFollowersSchema } from "@contracts/schemas";
import { createNotification } from "./queries/notifications";

export const followsRouter = createRouter({
  toggle: authedQuery.input(toggleFollowSchema).mutation(async ({ ctx, input }) => {
    const result = await toggleFollow(ctx.user.id, input.followingId);
    if (result.following) {
      void createNotification(ctx.user.id, input.followingId, "follow");
    }
    return result;
  }),

  isFollowing: authedQuery.input(isFollowingSchema).query(({ ctx, input }) =>
    isFollowing(ctx.user.id, input.followingId)
  ),

  listFollowing: authedQuery.query(({ ctx }) =>
    listFollowing(ctx.user.id)
  ),

  listFollowers: publicQuery.input(listFollowersSchema).query(({ input }) =>
    listFollowers(input.userId)
  ),

  listFollowingUsers: publicQuery.input(listFollowersSchema).query(({ input }) =>
    listFollowingUsers(input.userId)
  ),
});
