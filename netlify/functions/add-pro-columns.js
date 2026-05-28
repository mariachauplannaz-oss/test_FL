// One-time migration to add Pro subscription infrastructure.
//
// What it does:
// 1. Creates `subscriptions` table (Stripe subscription state per user)
// 2. Adds 4 columns to `users`: is_pro, credits_remaining, credits_rolled_over, credits_reset_at
//
// Safe to run multiple times — all statements use IF NOT EXISTS.
// DELETE THIS FILE after running successfully (housekeeping).
//
// To run: POST /api/add-pro-columns with x-migration-key header.

import { neon } from "@netlify/neon";

export default async function handler(req, context) {
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
    // ── Step 1: Create `subscriptions` table ───────────────────────────────
    await sql`
      CREATE TABLE IF NOT EXISTS subscriptions (
        user_email             TEXT PRIMARY KEY,
        stripe_subscription_id TEXT,
        stripe_customer_id     TEXT,
        status                 TEXT NOT NULL DEFAULT 'inactive',
        current_period_end     TIMESTAMPTZ,
        created_at             TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at             TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `;
    steps.push("✅ Created subscriptions table");

    // ── Step 2: Add Pro columns to `users` ─────────────────────────────────
    await sql`
      ALTER TABLE users
        ADD COLUMN IF NOT EXISTS is_pro              BOOLEAN  DEFAULT false,
        ADD COLUMN IF NOT EXISTS credits_remaining   INTEGER  DEFAULT 0,
        ADD COLUMN IF NOT EXISTS credits_rolled_over INTEGER  DEFAULT 0,
        ADD COLUMN IF NOT EXISTS credits_reset_at    TIMESTAMPTZ
    `;
    steps.push("✅ Added columns to users (is_pro, credits_remaining, credits_rolled_over, credits_reset_at)");

    // ── Step 3: Sanity check — return counts ───────────────────────────────
    const [subCount, userCount] = await Promise.all([
      sql`SELECT COUNT(*) FROM subscriptions`,
      sql`SELECT COUNT(*) FROM users`,
    ]);

    return new Response(JSON.stringify({
      ok: true,
      steps,
      counts: {
        subscriptions: parseInt(subCount[0].count, 10),
        users:         parseInt(userCount[0].count, 10),
      }
    }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("add-pro-columns migration error:", error);
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
  path: "/api/add-pro-columns"
};
