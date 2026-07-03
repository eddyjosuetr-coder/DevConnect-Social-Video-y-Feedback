import "dotenv/config";

function optional(name: string): string {
  return process.env[name] ?? "";
}

export const env = {
  // Falls back to a demo key if APP_SECRET is not configured; tokens won't survive restarts.
  appSecret: process.env.APP_SECRET || "devconnect-demo-insecure-fallback-key",
  isProduction: process.env.NODE_ENV === "production",
  databaseUrl: optional("DATABASE_URL"),

  // Google OAuth — set these in Vercel environment variables
  googleClientId:     optional("GOOGLE_CLIENT_ID"),
  googleClientSecret: optional("GOOGLE_CLIENT_SECRET"),

  ownerUnionId: optional("OWNER_UNION_ID"),
};
