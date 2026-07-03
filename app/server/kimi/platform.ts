import type { UserProfile } from "./types";

// Fetch the authenticated user's profile from Google
export async function getGoogleProfile(accessToken: string): Promise<UserProfile | null> {
  const resp = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!resp.ok) {
    const text = await resp.text();
    console.warn(`[google] userinfo failed (${resp.status}): ${text}`);
    return null;
  }

  return resp.json() as Promise<UserProfile>;
}

// Kept for backward-compat import shape used in auth.ts
export const users = {
  getProfile: getGoogleProfile,
};
