import { neon } from "@netlify/neon";

/**
 * TEMPORARY MIGRATION FUNCTION
 * ----------------------------
 * Creates the `events` table for the analytics-ready data layer
 * (Session 6.5a).
 *
 * Usage: open https://<your-site>/api/add-events-table once.
 * Then DELETE THIS FILE from the repo.
 *
 * Idempotent: safe to run multiple times (uses IF NOT EXISTS).
 */
export default async function handler(req, context) {
  const sql = neon(process.env.NETLIFY_DATABASE_URL);

  try {
    // 1) Create the table
    await sql`
      CREATE TABLE IF NOT EXISTS events (
        id           BIGSERIAL    PRIMARY KEY,
        session_id   TEXT         NOT NULL,
        event_name   TEXT         NOT NULL,
        event_data   JSONB        DEFAULT '{}'::jsonb,
        user_email   TEXT,
        ip_hash      TEXT,
        app_version  TEXT,
        created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
      )
    `;

    // 2) Indexes for the most common queries
    await sql`CREATE INDEX IF NOT EXISTS idx_events_session_id ON events (session_id)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_created_at ON events (created_at DESC)`;
    await sql`CREATE INDEX IF NOT EXISTS idx_events_event_name ON events (event_name)`;

    // 3) Verify by counting rows (should be 0 on first run)
    const result = await sql`SELECT COUNT(*)::int AS count FROM events`;

    return new Response(
      JSON.stringify({
        ok: true,
        message: "events table ready",
        row_count: result[0].count
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ ok: false, error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
}

export const config = {
  path: "/api/add-events-table"
};
