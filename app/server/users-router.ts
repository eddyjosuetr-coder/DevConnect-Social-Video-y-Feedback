import { TRPCError } from "@trpc/server";
import { createRouter, publicQuery, authedQuery } from "./middleware";
import { updateProfileSchema, getUserProfileSchema } from "@contracts/schemas";
import { updateUserProfile, findUserById } from "./queries/users";
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
      createdAt: user.createdAt,
      followerCount,
      followingCount,
    };
  }),

  updateProfile: authedQuery
    .input(updateProfileSchema)
    .mutation(async ({ ctx, input }) => {
      await updateUserProfile(ctx.user.id, {
        ...(input.name   !== undefined ? { name: input.name }     : {}),
        ...(input.bio    !== undefined ? { bio: input.bio }       : {}),
        ...(input.avatar !== undefined ? { avatar: input.avatar } : {}),
        ...(input.banner !== undefined ? { banner: input.banner } : {}),
      });
      return { success: true };
    }),
});
