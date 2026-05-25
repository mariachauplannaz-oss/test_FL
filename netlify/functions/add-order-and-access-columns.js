// One-shot migration: adds order_number and last_accessed_at to the downloads table.
// Delete this file after running POST /api/add-order-and-access-columns once in production.

import { neon } from "@netlify/neon";

export default async function handler(req, context) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL);

  try {
    await sql`ALTER TABLE downloads ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE`;
    await sql`ALTER TABLE downloads ADD COLUMN IF NOT EXISTS last_accessed_at TIMESTAMPTZ`;
    await sql`CREATE INDEX IF NOT EXISTS idx_downloads_order_number ON downloads(order_number)`;

    return new Response(JSON.stringify({
      ok: true,
      message: "Migration complete: order_number and last_accessed_at columns added to downloads"
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("add-order-and-access-columns error:", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export const config = {
  path: "/api/add-order-and-access-columns"
};
