import type { Context } from "hono";
import { setCookie } from "hono/cookie";
import * as cookie from "cookie";
import { env } from "../lib/env";
import { getSessionCookieOptions } from "../lib/cookies";
import { Session } from "@contracts/constants";
import { Errors } from "@contracts/errors";
import { signSessionToken, verifySessionToken } from "./session";
import { users as googleUsers } from "./platform";
import { findUserByUnionId, upsertUser } from "../queries/users";
import type { TokenResponse } from "./types";

// Exchange Google authorization code for tokens
async function exchangeAuthCode(
  code: string,
  redirectUri: string,
): Promise<TokenResponse> {
  const body = new URLSearchParams({
    grant_type:    "authorization_code",
    code,
    client_id:     env.googleClientId,
    client_secret: env.googleClientSecret,
    redirect_uri:  redirectUri,
  });

  const resp = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  if (!resp.ok) {
    const text = await resp.text();
    throw new Error(`Google token exchange failed (${resp.status}): ${text}`);
  }

  return resp.json() as Promise<TokenResponse>;
}

export async function authenticateRequest(headers: Headers) {
  const cookies = cookie.parse(headers.get("cookie") || "");
  const token = cookies[Session.cookieName];
  if (!token) {
    console.warn("[auth] No session cookie found in request.");
    throw Errors.forbidden("Invalid authentication token.");
  }
  const claim = await verifySessionToken(token);
  if (!claim) {
    throw Errors.forbidden("Invalid authentication token.");
  }
  const user = await findUserByUnionId(claim.unionId);
  if (!user) {
    throw Errors.forbidden("User not found. Please re-login.");
  }
  return user;
}

export function createOAuthCallbackHandler() {
  return async (c: Context) => {
    const code  = c.req.query("code");
    const state = c.req.query("state");
    const error = c.req.query("error");

    if (error) {
      if (error === "access_denied") return c.redirect("/", 302);
      return c.json({ error, error_description: c.req.query("error_description") }, 400);
    }

    if (!code || !state) {
      return c.json({ error: "code and state are required" }, 400);
    }

    if (!env.googleClientId || !env.googleClientSecret) {
      return c.json({ error: "Google OAuth is not configured on this server" }, 500);
    }

    try {
      const redirectUri  = atob(state);
      const tokenResp    = await exchangeAuthCode(code, redirectUri);
      const userProfile  = await googleUsers.getProfile(tokenResp.access_token);

      if (!userProfile) {
        throw new Error("Failed to fetch user profile from Google");
      }

      // Google's stable user ID is the `id` field from the userinfo endpoint
      const googleId = userProfile.id;

      await upsertUser({
        unionId:     googleId,
        name:        userProfile.name,
        avatar:      userProfile.picture ?? null,
        lastSignInAt: new Date(),
      });

      const token = await signSessionToken({
        unionId:  googleId,
        clientId: env.googleClientId,
      });

      const cookieOpts = getSessionCookieOptions(c.req.raw.headers);
      setCookie(c, Session.cookieName, token, {
        ...cookieOpts,
        maxAge: Session.maxAgeMs / 1000,
      });

      return c.redirect("/#/app", 302);
    } catch (err) {
      console.error("[OAuth] Google callback failed", err);
      return c.json({ error: "OAuth callback failed" }, 500);
    }
  };
}

export { exchangeAuthCode };
