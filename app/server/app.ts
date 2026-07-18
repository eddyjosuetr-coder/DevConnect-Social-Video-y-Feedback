import { Hono } from "hono";
import { setCookie } from "hono/cookie";
import type { HttpBindings } from "@hono/node-server";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";
import { appRouter } from "./router";
import { createContext } from "./context";
import { env } from "./lib/env";
import { createOAuthCallbackHandler } from "./kimi/auth";
import { signSessionToken } from "./kimi/session";
import { upsertUser } from "./queries/users";
import { getSessionCookieOptions } from "./lib/cookies";
import { Paths, Session } from "@contracts/constants";
import { migrationReady } from "./queries/connection";

const app = new Hono<{ Bindings: HttpBindings }>();

// Await schema migrations before any DB-bound request
app.use("/api/*", async (_c, next) => {
  await migrationReady;
  return next();
});

app.get(Paths.oauthCallback, createOAuthCallbackHandler());

if (!env.isProduction || !env.googleClientId) {
  app.get("/api/dev-login", async (c) => {
    const DEV_UNION_ID = "dev-user-local";
    await upsertUser({
      unionId: DEV_UNION_ID,
      name: "Dev User",
      avatar: null,
      lastSignInAt: new Date(),
    });
    const token = await signSessionToken({
      unionId: DEV_UNION_ID,
      clientId: "dev-client",
    });
    const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
    setCookie(c, Session.cookieName, token, {
      ...cookieOpts,
      maxAge: Session.maxAgeMs / 1000,
    });
    return c.redirect("/#/app", 302);
  });
}

app.use("/api/trpc/*", async (c) => {
  return fetchRequestHandler({
    endpoint: "/api/trpc",
    req: c.req.raw,
    router: appRouter,
    createContext,
  });
});

app.all("/api/*", (c) => c.json({ error: "Not Found" }, 404));

export default app;
