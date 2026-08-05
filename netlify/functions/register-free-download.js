import { neon } from "@netlify/neon";
import crypto from "node:crypto";
import { validateEmail } from "./lib/email.js";

const sql = neon(process.env.NETLIFY_DATABASE_URL);

// Hash IP with secret for GDPR compliance — never store raw IPs
function hashIp(ip) {
  return crypto
    .createHmac("sha256", process.env.IP_HASH_SECRET)
    .update(ip)
    .digest("hex");
}

function getClientIp(req) {
  // Netlify's trusted header for client IP
  return (
    req.headers.get("x-nf-client-connection-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}

export default async function handler(req, context) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { email: rawEmail, garment_config, accepted_tc } = body;

    // 1. Validate + normalize email
    const validation = await validateEmail(rawEmail);
    if (!validation.ok) {
      return new Response(JSON.stringify({ ok: false, status: "invalid_email", reason: validation.reason }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const email = validation.email;

    if (accepted_tc !== true) {
      return new Response(JSON.stringify({ ok: false, error: "You must accept the Terms and Privacy Policy" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Get and hash IP
    const rawIp = getClientIp(req);
    const ipHash = hashIp(rawIp);

    // 3. Check IP abuse — max 20 free/promo downloads in last 30 days.
    // FREE and PROMO (create-free-techpack.js) share one IP budget.
    const ipCount = await sql`
      SELECT COUNT(*) AS cnt FROM downloads
      WHERE ip_hash = ${ipHash}
        AND tier IN ('FREE', 'PROMO')
        AND created_at > NOW() - INTERVAL '30 days'
    `;

    if (parseInt(ipCount[0].cnt, 10) >= 20) {
      return new Response(JSON.stringify({ ok: false, status: "ip_blocked" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Rolling 30-day download count for this email — FREE and PROMO
    // (create-free-techpack.js) share one budget, blocked at 5 or more.
    // Status string stays "already_used_free" for frontend compatibility;
    // renaming it is a separate frontend task. Query and resets_at
    // arithmetic mirror create-free-techpack.js's "limit_reached" branch
    // exactly — the two flows share one limit and must never disagree
    // about when it lifts.
    const emailAgg = await sql`
      SELECT COUNT(*) AS cnt, MIN(created_at) AS oldest FROM downloads
      WHERE user_email = ${email}
        AND tier IN ('FREE', 'PROMO')
        AND created_at > NOW() - INTERVAL '30 days'
    `;

    if (parseInt(emailAgg[0].cnt, 10) >= 5) {
      const resetsAt = new Date(emailAgg[0].oldest);
      resetsAt.setDate(resetsAt.getDate() + 30);
      return new Response(JSON.stringify({
        ok: false,
        status: "already_used_free",
        resets_at: resetsAt.toISOString(),
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. All checks passed — upsert user (free_download_used kept for
    // backward compatibility; it's no longer the gate) and record download
    await sql`
      INSERT INTO users (email, free_download_used, free_download_at, created_at)
      VALUES (${email}, TRUE, NOW(), NOW())
      ON CONFLICT (email) DO UPDATE
        SET free_download_used = TRUE,
            free_download_at   = NOW()
    `;

    await sql`
      INSERT INTO downloads (
        user_email,
        tier,
        garment_config,
        tc_version_accepted,
        ip_hash,
        used_at
      ) VALUES (
        ${email},
        'FREE',
        ${JSON.stringify(garment_config || {})},
        '1.0',
        ${ipHash},
        NOW()
      )
    `;

    return new Response(JSON.stringify({ ok: true, status: "allowed" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("register-free-download error:", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  path: "/api/register-free-download",
};
