import { createRouter, authedQuery } from "./middleware";
import { updateProfileSchema } from "@contracts/schemas";
import { updateUserProfile } from "./queries/users";

export const usersRouter = createRouter({
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
