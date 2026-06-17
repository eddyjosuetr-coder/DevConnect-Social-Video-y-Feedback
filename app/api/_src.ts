import type { IncomingMessage, ServerResponse } from "http";

let honoApp: { fetch: (req: Request) => Promise<Response> } | null = null;
let appInitError: { message: string; stack?: string } | null = null;

try {
  const { default: app } = await import("../server/app");
  honoApp = app;
} catch (err: unknown) {
  const e = err instanceof Error ? err : new Error(String(err));
  appInitError = { message: e.message, stack: e.stack };
  console.error("[DevConnect] Startup error:", e.message, e.stack);
}

// Vercel's Node.js runtime pre-buffers POST bodies into req.body and leaves
// IncomingMessage stream in a state where 'data'/'end' never fire.
// @hono/node-server's getRequestListener uses `for await (chunk of req)` which
// hangs indefinitely — so ALL mutations appeared stuck on the client.
// We bypass that adapter and read req.body first, falling back to the stream
// for local dev / non-Vercel environments.
async function readBody(req: IncomingMessage): Promise<Buffer | null> {
  const method = (req.method ?? "GET").toUpperCase();
  if (method === "GET" || method === "HEAD") return null;

  const pre = (req as Record<string, unknown>).body;
  if (pre !== undefined && pre !== null) {
    if (Buffer.isBuffer(pre)) return pre;
    const text = typeof pre === "string" ? pre : JSON.stringify(pre);
    return Buffer.from(text, "utf-8");
  }

  return new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse
): Promise<void> {
  if (appInitError || !honoApp) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "Startup failed",
        details: appInitError?.message ?? "App not initialized",
      })
    );
    return;
  }

  try {
    const method = (req.method ?? "GET").toUpperCase();
    const host = req.headers.host ?? "localhost";
    const proto =
      ((req.headers["x-forwarded-proto"] as string | undefined) ?? "")
        .split(",")[0]
        .trim() || "https";
    const url = `${proto}://${host}${req.url ?? "/"}`;

    const headers = new Headers();
    const rawHeaders = req.rawHeaders;
    for (let i = 0; i < rawHeaders.length - 1; i += 2) {
      headers.append(rawHeaders[i], rawHeaders[i + 1]);
    }

    const bodyBuf = await readBody(req);
    const hasBody = bodyBuf !== null && bodyBuf.length > 0;

    const fetchReq = new Request(url, {
      method,
      headers,
      body: hasBody ? bodyBuf : undefined,
      ...(hasBody ? ({ duplex: "half" } as RequestInit) : {}),
    });

    const fetchRes = await honoApp.fetch(fetchReq);

    res.statusCode = fetchRes.status;

    const setCookies: string[] = [];
    fetchRes.headers.forEach((value, key) => {
      if (key.toLowerCase() === "set-cookie") {
        setCookies.push(value);
      } else {
        res.setHeader(key, value);
      }
    });
    if (setCookies.length > 0) {
      res.setHeader("set-cookie", setCookies);
    }

    const responseBody = await fetchRes.arrayBuffer();
    res.end(Buffer.from(responseBody));
  } catch (err: unknown) {
    const e = err instanceof Error ? err : new Error(String(err));
    console.error("[DevConnect] Handler error:", e.message, e.stack);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "Internal server error", details: e.message }));
    }
  }
}
