// One-time migration to add last_invoice_id column to subscriptions.
//
// What it does:
// 1. Checks whether last_invoice_id already exists on subscriptions
// 2. If not, adds it — required by the invoice.paid idempotency guard in stripe-webhook.js
//
// Safe to run multiple times — skips gracefully if the column already exists.
// DELETE THIS FILE after running successfully (housekeeping).
//
// To run: POST /api/add-invoice-guard-column with x-migration-key header.

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
      WHERE table_name = 'subscriptions' AND column_name = 'last_invoice_id'
    `;

    if (existing.length > 0) {
      return new Response(JSON.stringify({
        ok: true,
        skipped: true,
        message: "Column last_invoice_id already exists on subscriptions"
      }, null, 2), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }

    // ── Step 2: Add the column ─────────────────────────────────────────────
    await sql`
      ALTER TABLE subscriptions ADD COLUMN last_invoice_id TEXT
    `;
    steps.push("✅ Added last_invoice_id TEXT column to subscriptions");

    // ── Step 3: Sanity check — return counts ───────────────────────────────
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
    console.error("add-invoice-guard-column migration error:", error);
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
  path: "/api/add-invoice-guard-column"
};
