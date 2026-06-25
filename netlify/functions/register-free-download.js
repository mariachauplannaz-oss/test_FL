import { neon } from "@netlify/neon";
import crypto from "node:crypto";

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

function isValidEmail(email) {
  return typeof email === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
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
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    // 1. Validate inputs
    if (!isValidEmail(email)) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid email address" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (accepted_tc !== true) {
      return new Response(JSON.stringify({ ok: false, error: "You must accept the Terms and Privacy Policy" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 2. Get and hash IP
    const rawIp = getClientIp(req);
    const ipHash = hashIp(rawIp);

    // 3. Check IP abuse — max 20 free downloads in last 30 days
    const ipCount = await sql`
      SELECT COUNT(*) AS cnt FROM downloads
      WHERE ip_hash = ${ipHash}
        AND tier = 'FREE'
        AND created_at > NOW() - INTERVAL '30 days'
    `;

    if (parseInt(ipCount[0].cnt, 10) >= 20) {
      return new Response(JSON.stringify({ ok: false, status: "ip_blocked" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Check if email already used free download
    const existingUser = await sql`
      SELECT free_download_used FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0 && existingUser[0].free_download_used === true) {
      return new Response(JSON.stringify({ ok: false, status: "already_used_free" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. All checks passed — upsert user and record download
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
