// One-time migration to add magic link + sessions infrastructure.
//
// What it does:
// 1. Adds 3 columns to `users`: account_created_at, first_download_at, last_login_at
// 2. Backfills first_download_at from earliest downloads.created_at per email
// 3. Creates `magic_links` table (token storage, 15-min expiry)
// 4. Creates `sessions` table (cookie-based session storage, 30-day expiry)
// 5. Creates indexes for performance
//
// Safe to run multiple times — all statements use IF NOT EXISTS.
// DELETE THIS FILE after running successfully (housekeeping).
//
// To run: visit /api/add-magic-link-columns once after deploy.
// Returns JSON with status of each operation.

import { neon } from "@netlify/neon";

export default async function handler(req, context) {
  // Protect against accidental re-runs in production: require POST + secret header
  if (req.method !== "POST") {
    return new Response(JSON.stringify({
      ok: false,
      error: "Use POST with x-migration-key header"
    }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const providedKey = req.headers.get("x-migration-key");
  if (!providedKey || providedKey !== process.env.MIGRATION_KEY) {
    return new Response(JSON.stringify({
      ok: false,
      error: "Invalid migration key"
    }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  const steps = [];

  try {
    // ── Step 1: Add columns to `users` ─────────────────────────────────────
    await sql`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS account_created_at TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS first_download_at  TIMESTAMPTZ,
        ADD COLUMN IF NOT EXISTS last_login_at      TIMESTAMPTZ
    `;
    steps.push("✅ Added columns to users (account_created_at, first_download_at, last_login_at)");

    // ── Step 2: Backfill first_download_at ─────────────────────────────────
    // For each user, set first_download_at to the earliest download they have.
    // Only updates rows where first_download_at IS NULL (idempotent).
    const backfillResult = await sql`
      UPDATE users u
      SET first_download_at = sub.first_download
      FROM (
        SELECT user_email, MIN(created_at) AS first_download
        FROM downloads
        GROUP BY user_email
      ) sub
      WHERE u.email = sub.user_email
        AND u.first_download_at IS NULL
    `;
    steps.push(`✅ Backfilled first_download_at for existing users`);

    // ── Step 3: Create `magic_links` table ─────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS magic_links (
        token        TEXT PRIMARY KEY,
        user_email   TEXT NOT NULL,
        expires_at   TIMESTAMPTZ NOT NULL,
        used_at      TIMESTAMPTZ,
        created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ip_hash      TEXT
      )
    `;
    steps.push("✅ Created magic_links table");

    // ── Step 4: Create `sessions` table ────────────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS sessions (
        session_id        TEXT PRIMARY KEY,
        user_email        TEXT NOT NULL,
        expires_at        TIMESTAMPTZ NOT NULL,
        created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_activity_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        ip_hash           TEXT,
        user_agent        TEXT
      )
    `;
    steps.push("✅ Created sessions table");

    // ── Step 5: Indexes for performance ────────────────────────────────────
    await sql`CREATE INDEX IF NOT EXISTS idx_magic_links_email_expires
      ON magic_links(user_email, expires_at)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_email
      ON sessions(user_email)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_sessions_expires
      ON sessions(expires_at)`;
    steps.push("✅ Created indexes (magic_links + sessions)");

    // ── Step 6: Sanity check — return counts ───────────────────────────────
    const [userCount, magicCount, sessionCount] = await Promise.all([
      sql`SELECT COUNT(*) FROM users`,
      sql`SELECT COUNT(*) FROM magic_links`,
      sql`SELECT COUNT(*) FROM sessions`,
    ]);

    return new Response(JSON.stringify({
      ok: true,
      steps,
      counts: {
        users:       parseInt(userCount[0].count, 10),
        magic_links: parseInt(magicCount[0].count, 10),
        sessions:    parseInt(sessionCount[0].count, 10),
      }
    }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Migration error:", error);
    return new Response(JSON.stringify({
      ok: false,
      error: error.message,
      steps_completed: steps
    }, null, 2), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export const config = {
  path: "/api/add-magic-link-columns"
};
