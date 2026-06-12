import { getRequestListener } from "@hono/node-server";
import type { IncomingMessage, ServerResponse } from "http";

type NodeHandler = (req: IncomingMessage, res: ServerResponse) => Promise<void>;

let appHandler: NodeHandler | null = null;
let appInitError: { message: string; stack?: string } | null = null;

// Top-level await: initialize at module load so any startup error is captured
// instead of crashing the entire serverless function invocation.
try {
  const { default: app } = await import("../server/app");
  appHandler = getRequestListener(app.fetch);
} catch (err: unknown) {
  const e = err instanceof Error ? err : new Error(String(err));
  appInitError = { message: e.message, stack: e.stack };
  console.error("[DevConnect] Startup error:", e.message, e.stack);
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (appInitError) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Startup failed", details: appInitError.message }));
    return;
  }
  return appHandler!(req, res);
}
