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
      const run = async (sql: string) => {
        try { await pool.execute(sql); }
        catch (e: unknown) {
          const errno = (e as { errno?: number }).errno;
          if (errno !== 1060 && errno !== 1061) console.warn("[migrate]", (e as Error).message);
        }
      };
      await run("ALTER TABLE users ADD COLUMN banner MEDIUMTEXT");
      await run("ALTER TABLE users MODIFY COLUMN banner MEDIUMTEXT");
      await run("ALTER TABLE users MODIFY COLUMN avatar MEDIUMTEXT");
      await run("ALTER TABLE posts ADD COLUMN mediaUrl TEXT");
      await run("ALTER TABLE posts ADD COLUMN mediaType VARCHAR(10)");
      await run(`CREATE TABLE IF NOT EXISTS messages (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        senderId BIGINT UNSIGNED NOT NULL,
        receiverId BIGINT UNSIGNED NOT NULL,
        content TEXT NOT NULL,
        readAt TIMESTAMP NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX messages_sender_idx (senderId),
        INDEX messages_receiver_idx (receiverId)
      )`);
      await run(`CREATE TABLE IF NOT EXISTS follows (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        followerId BIGINT UNSIGNED NOT NULL,
        followingId BIGINT UNSIGNED NOT NULL,
        createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY follows_follower_following_idx (followerId, followingId)
      )`);
    })();
  }
  return instance;
}
