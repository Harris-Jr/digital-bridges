// PostgreSQL access via a single pooled client (node-postgres).
// A pool is essential at scale: it caps real DB connections while serving many
// concurrent API requests. In production, front this with PgBouncer as well.
import pg from "pg";
import { env } from "./env.js";

const { Pool } = pg;

export const pool = new Pool({
  connectionString: env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

pool.on("error", (err) => {
  // A pooled idle client errored (e.g. DB restarted). Log; the pool recovers.
  console.error("[db] idle client error", err);
});

export async function query<T extends pg.QueryResultRow = pg.QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<pg.QueryResult<T>> {
  return pool.query<T>(text, params as never[]);
}

/**
 * Run `fn` inside a single transaction (ACID). Commits on success, rolls back
 * on any thrown error. Use for every write that must be all-or-nothing , 
 * e.g. recording progress and awarding badges together.
 */
export async function withTransaction<T>(
  fn: (client: pg.PoolClient) => Promise<T>,
): Promise<T> {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}
