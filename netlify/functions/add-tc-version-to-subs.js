// One-time migration to add tc_version_accepted column to subscriptions.
//
// What it does:
// 1. Checks whether tc_version_accepted already exists on subscriptions
// 2. If not: adds the column, backfills existing rows to '1.0', sets NOT NULL
//
// Safe to run multiple times — skips gracefully if the column already exists.
// DELETE THIS FILE after running successfully (housekeeping).
//
// To run: POST /api/admin/add-tc-version-to-subs with x-migration-key header.

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
    // ── Step 1: Check whether the column already exists ────────────────────
    const existing = await sql`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'subscriptions' AND column_name = 'tc_version_accepted'
    `;

    if (existing.length > 0) {
      return new Response(JSON.stringify({
        ok: true,
        skipped: true,
        message: "Column tc_version_accepted already exists on subscriptions"
      }, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // ── Step 2: Add the column (nullable first, for safe backfill) ─────────
    await sql`
      ALTER TABLE subscriptions ADD COLUMN tc_version_accepted TEXT
    `;
    steps.push("✅ Added tc_version_accepted TEXT column to subscriptions");

    // ── Step 3: Backfill existing rows ─────────────────────────────────────
    const backfilled = await sql`
      UPDATE subscriptions
      SET tc_version_accepted = '1.0'
      WHERE tc_version_accepted IS NULL
    `;
    steps.push(`✅ Backfilled ${backfilled.count ?? "?"} existing rows to '1.0'`);

    // ── Step 4: Enforce NOT NULL ───────────────────────────────────────────
    await sql`
      ALTER TABLE subscriptions ALTER COLUMN tc_version_accepted SET NOT NULL
    `;
    steps.push("✅ Set tc_version_accepted NOT NULL");

    // ── Step 5: Sanity check ───────────────────────────────────────────────
    const [subCount] = await Promise.all([
      sql`SELECT COUNT(*) FROM subscriptions`,
    ]);

    return new Response(JSON.stringify({
      ok: true,
      steps,
      counts: {
        subscriptions: parseInt(subCount[0].count, 10),
      }
    }, null, 2), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("add-tc-version-to-subs migration error:", error);
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
  path: "/api/admin/add-tc-version-to-subs"
};
