import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { env } from "../lib/env";
import * as schema from "@db/schema";
import * as relations from "@db/relations";

const fullSchema = { ...schema, ...relations };

let instance: ReturnType<typeof drizzle<typeof fullSchema>>;
let pool: mysql.Pool;

export let migrationReady: Promise<void> = Promise.resolve();

export function getDb() {
  if (!instance) {
    if (!env.databaseUrl) {
      throw new Error("DATABASE_URL is not set");
    }

    const url = new URL(env.databaseUrl);
    const dbName = url.pathname.slice(1) || "defaultdb";
    const isAiven = url.hostname.includes("aivencloud");
    const needsSsl = url.searchParams.get("ssl-mode") === "REQUIRED" || isAiven || env.isProduction;

    pool = mysql.createPool({
      host: url.hostname,
      user: url.username,
      password: url.password,
      database: dbName,
      port: parseInt(url.port, 10) || 3306,
      ssl: needsSsl ? { rejectUnauthorized: false } : undefined,
    });

    instance = drizzle(pool, {
      mode: "default",
      schema: fullSchema,
    });

    migrationReady = (async () => {
      try {
        await pool.execute("ALTER TABLE users ADD COLUMN banner MEDIUMTEXT");
      } catch (e: unknown) {
        // 1060 = column already exists — upgrade type in case it was added as TEXT
        if ((e as { errno?: number }).errno === 1060) {
          await pool.execute("ALTER TABLE users MODIFY COLUMN banner MEDIUMTEXT").catch(() => {});
        }
      }
      try {
        await pool.execute("ALTER TABLE users MODIFY COLUMN avatar MEDIUMTEXT");
      } catch {}
    })();
  }
  return instance;
}
