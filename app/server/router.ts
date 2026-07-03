import { authRouter } from "./auth-router";
import { postsRouter } from "./posts-router";
import { commentsRouter } from "./comments-router";
import { repostsRouter } from "./reposts-router";
import { followsRouter } from "./follows-router";
import { createRouter, publicQuery } from "./middleware";

export const appRouter = createRouter({
  ping: publicQuery.query(() => ({ ok: true, ts: Date.now() })),
  auth: authRouter,
  posts: postsRouter,
  comments: commentsRouter,
  reposts: repostsRouter,
  follows: followsRouter,
});

export type AppRouter = typeof appRouter;
