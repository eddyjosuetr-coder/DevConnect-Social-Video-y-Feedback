import app from "./app";
import { env } from "./lib/env";

export default app;

// Start the Node.js HTTP server only when running directly (Docker / local prod).
// Vercel and other serverless runtimes import this module and use app.fetch directly.
if (env.isProduction && !process.env.VERCEL) {
  const { serve } = await import("@hono/node-server");
  const { serveStaticFiles } = await import("./lib/vite");
  serveStaticFiles(app);

  const port = parseInt(process.env.PORT || "3000");
  serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
