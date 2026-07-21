import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { updateProfileSchema, getUserProfileSchema, searchUsersSchema, getSuggestedUsersSchema, getTrendingTagsSchema } from "@contracts/schemas";
import { updateUserProfile, findUserById, searchUsers, getTrendingTags, getSuggestedUsers } from "./queries/users";
import { getFollowerCount, getFollowingCount } from "./queries/follows";

export const usersRouter = createRouter({
  getProfile: publicQuery.input(getUserProfileSchema).query(async ({ input }) => {
    const user = await findUserById(input.userId);
    if (!user) throw new TRPCError({ code: "NOT_FOUND", message: "Usuario no encontrado" });
    const [followerCount, followingCount] = await Promise.all([
      getFollowerCount(input.userId),
      getFollowingCount(input.userId),
    ]);
    return {
      id: user.id,
      name: user.name,
      bio: user.bio,
      avatar: user.avatar,
      banner: user.banner,
      website: user.website ?? null,
      githubUrl: user.githubUrl ?? null,
      location: user.location ?? null,
      role: user.role,
      createdAt: user.createdAt,
      followerCount,
      followingCount,
    };
  }),

  search: publicQuery.input(searchUsersSchema).query(({ input }) =>
    searchUsers(input.query)
  ),

  updateProfile: authedQuery
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, {
        ...(input.name      !== undefined ? { name: input.name }           : {}),
        ...(input.bio       !== undefined ? { bio: input.bio }             : {}),
        ...(input.avatar    !== undefined ? { avatar: input.avatar }       : {}),
        ...(input.banner    !== undefined ? { banner: input.banner }       : {}),
        ...(input.website   !== undefined ? { website: input.website }     : {}),
        ...(input.githubUrl !== undefined ? { githubUrl: input.githubUrl } : {}),
        ...(input.location  !== undefined ? { location: input.location }   : {}),
      });
      return { success: true };
    }),

  trendingTags: publicQuery.input(getTrendingTagsSchema).query(({ input }) =>
    getTrendingTags(input?.limit ?? 10)
  ),

  suggestedUsers: authedQuery.input(getSuggestedUsersSchema).query(({ ctx, input }) =>
    getSuggestedUsers(input?.limit ?? 5, ctx.user.id)
  ),
});
