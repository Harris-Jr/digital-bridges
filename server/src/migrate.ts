// Minimal, dependency-free SQL migration runner.
// Applies every migrations/*.sql file in filename order, exactly once, each in
// its own transaction, tracked in the schema_migrations table.
import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { pool } from "./db.js";

const migrationsDir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");

async function run(): Promise<void> {
  await pool.query(`
    create table if not exists schema_migrations (
      filename   text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await readdir(migrationsDir))
    .filter((f) => f.endsWith(".sql"))
    .sort();

  const { rows } = await pool.query<{ filename: string }>("select filename from schema_migrations");
  const applied = new Set(rows.map((r) => r.filename));

  let count = 0;
  for (const file of files) {
    if (applied.has(file)) continue;
    const sql = await readFile(join(migrationsDir, file), "utf8");
    const client = await pool.connect();
    try {
      // Each migration file manages its own begin/commit; wrap the bookkeeping
      // insert so a file + its record land together.
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`[migrate] applied ${file}`);
      count++;
    } catch (err) {
      await client.query("ROLLBACK");
      console.error(`[migrate] failed on ${file}`);
      throw err;
    } finally {
      client.release();
    }
  }

  console.log(count ? `[migrate] ${count} migration(s) applied` : "[migrate] already up to date");
  await pool.end();
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
