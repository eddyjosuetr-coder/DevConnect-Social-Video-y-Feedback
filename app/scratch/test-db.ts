import mysql from "mysql2/promise";
import "dotenv/config";

async function run() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) throw new Error("No DB URL");
  
  console.log("URL:", dbUrl);
  const url = new URL(dbUrl);
  
  const pool = mysql.createPool({
    host: url.hostname,
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
    port: parseInt(url.port) || 3306,
    ssl: { rejectUnauthorized: true },
  });

  try {
    console.log("DB pool created. Testing connection...");
    const result = await pool.query("SELECT 1");
    console.log("Query result:", result);
    pool.end();
  } catch (err) {
    console.error("DB error:", err);
  }
}

run();
