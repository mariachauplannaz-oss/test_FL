import jwt from "jsonwebtoken";
import { neon } from "@netlify/neon";

// ── Auth helper ────────────────────────────────────────────────────────────

function verifyAdminToken(req) {
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return null;
  try {
    return jwt.verify(token, process.env.ADMIN_JWT_SECRET);
  } catch {
    return null;
  }
}

// ── CSV helper (RFC 4180) ──────────────────────────────────────────────────

function csvEscape(value) {
  if (value === null || value === undefined) return "";
  const str = typeof value === "object" ? JSON.stringify(value) : String(value);
  // Wrap in double quotes if field contains comma, double quote, or newline
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function rowToCsv(row) {
  return [
    csvEscape(row.id),
    csvEscape(row.created_at),
    csvEscape(row.user_email),
    csvEscape(row.tier),
    csvEscape(row.garment_config),   // JSONB → stringified by csvEscape
    csvEscape(row.stripe_session_id),
    csvEscape(row.used_at),
    csvEscape(row.ip_hash),
  ].join(",");
}

const CSV_HEADERS = "id,created_at,email,tier,garment_config,stripe_session_id,used_at,ip_hash";

// ── Handler ────────────────────────────────────────────────────────────────

export default async function handler(req) {
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const payload = verifyAdminToken(req);
  if (!payload) {
    return new Response(JSON.stringify({ ok: false, error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "json";
  const tier = url.searchParams.get("tier") || null;           // 'FREE' | 'PRO' | null
  const rawLimit = parseInt(url.searchParams.get("limit"), 10);
  const rawOffset = parseInt(url.searchParams.get("offset"), 10);
  const limit = Math.min(!isNaN(rawLimit) && rawLimit > 0 ? rawLimit : 50, 500);
  const offset = !isNaN(rawOffset) && rawOffset >= 0 ? rawOffset : 0;

  const sql = neon(process.env.NETLIFY_DATABASE_URL);

  try {
    if (format === "csv") {
      // CSV export: no pagination, all rows
      const rows = tier
        ? await sql`
            SELECT id, created_at, user_email, tier, garment_config,
                   stripe_session_id, used_at, ip_hash
            FROM downloads
            WHERE tier = ${tier}
            ORDER BY created_at DESC
          `
        : await sql`
            SELECT id, created_at, user_email, tier, garment_config,
                   stripe_session_id, used_at, ip_hash
            FROM downloads
            ORDER BY created_at DESC
          `;

      const date = new Date().toISOString().slice(0, 10);
      const csv = [CSV_HEADERS, ...rows.map(rowToCsv)].join("\r\n");

      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="flatlabs-downloads-${date}.csv"`,
        },
      });
    }

    // JSON: paginated + total count
    const [rows, countResult] = await Promise.all([
      tier
        ? await sql`
            SELECT id, created_at, user_email, tier, garment_config,
                   stripe_session_id, used_at, ip_hash
            FROM downloads
            WHERE tier = ${tier}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `
        : await sql`
            SELECT id, created_at, user_email, tier, garment_config,
                   stripe_session_id, used_at, ip_hash
            FROM downloads
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${offset}
          `,
      tier
        ? await sql`SELECT COUNT(*) FROM downloads WHERE tier = ${tier}`
        : await sql`SELECT COUNT(*) FROM downloads`,
    ]);

    const total = parseInt(countResult[0].count, 10);

    return new Response(
      JSON.stringify({ ok: true, total, downloads: rows, limit, offset }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("admin-downloads error:", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  path: "/api/admin-downloads",
};
