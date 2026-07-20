import { createRouter, authedQuery } from "./middleware";
import { toggleBookmark, isBookmarked, listBookmarks, getBookmarkedPostIds } from "./queries/bookmarks";
import { toggleBookmarkSchema } from "@contracts/schemas";

export const bookmarksRouter = createRouter({
  toggle: authedQuery.input(toggleBookmarkSchema).mutation(({ ctx, input }) =>
    toggleBookmark(ctx.user.id, input.postId)
  ),

  isBookmarked: authedQuery.input(toggleBookmarkSchema).query(({ ctx, input }) =>
    isBookmarked(ctx.user.id, input.postId).then((b) => ({ bookmarked: b }))
  ),

  list: authedQuery.query(({ ctx }) => listBookmarks(ctx.user.id)),

  bookmarkedIds: authedQuery.query(({ ctx }) => getBookmarkedPostIds(ctx.user.id)),
});
