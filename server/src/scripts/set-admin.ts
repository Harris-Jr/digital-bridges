// Grant (or revoke) the admin role for an existing user, by email.
// Usage:
//   npm run set-admin -- someone@email.zm            # grant admin
//   npm run set-admin -- someone@email.zm --revoke   # remove admin
//
// Admin is provisioned here rather than self-claimed in the app, so only
// someone with server access can create staff accounts.
import { pool } from "../db.js";

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const email = args.find((a) => !a.startsWith("--"))?.trim().toLowerCase();
  const revoke = args.includes("--revoke");

  if (!email) {
    console.error("Usage: npm run set-admin -- <email> [--revoke]");
    process.exit(1);
  }

  const { rows } = await pool.query<{ id: string }>("select id from users where email = $1", [email]);
  const user = rows[0];
  if (!user) {
    console.error(`No user found with email ${email}. Ask them to sign up first.`);
    process.exit(1);
  }

  if (revoke) {
    await pool.query("delete from user_roles where user_id = $1 and role = 'admin'", [user.id]);
    console.log(`Removed admin role from ${email}.`);
  } else {
    await pool.query(
      "insert into user_roles (user_id, role) values ($1, 'admin') on conflict do nothing",
      [user.id],
    );
    console.log(`Granted admin role to ${email}.`);
  }
  await pool.end();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
