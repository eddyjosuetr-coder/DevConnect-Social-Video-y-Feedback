import { authRouter } from "./auth-router";
import { postsRouter } from "./posts-router";
import { commentsRouter } from "./comments-router";
import { repostsRouter } from "./reposts-router";
import { followsRouter } from "./follows-router";
import { usersRouter } from "./users-router";
import { messagesRouter } from "./messages-router";
import { notificationsRouter } from "./notifications-router";
import { bookmarksRouter } from "./bookmarks-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  posts: postsRouter,
  comments: commentsRouter,
  reposts: repostsRouter,
  follows: followsRouter,
  users: usersRouter,
  messages: messagesRouter,
  notifications: notificationsRouter,
  bookmarks: bookmarksRouter,
});

export type AppRouter = typeof appRouter;
