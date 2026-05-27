import { neon } from "@netlify/neon";
import crypto from "node:crypto";

const BASE_URL = process.env.APP_BASE_URL || "https://flatsgenerator.com";

function redirect(path) {
  return new Response(null, {
    status: 302,
    headers: { Location: `${BASE_URL}${path}` },
  });
}

function hashIp(ip) {
  return crypto
    .createHmac("sha256", process.env.IP_HASH_SECRET)
    .update(ip)
    .digest("hex");
}

function getClientIp(req) {
  return (
    req.headers.get("x-nf-client-connection-ip") ||
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}

export default async function handler(req) {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return redirect("/login.html?error=invalid");
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL);

  try {
    const rows = await sql`
      SELECT token, user_email, expires_at, used_at
      FROM magic_links
      WHERE token = ${token}
      LIMIT 1
    `;

    if (rows.length === 0) {
      return redirect("/login.html?error=invalid");
    }

    const link = rows[0];

    if (link.used_at !== null) {
      return redirect("/login.html?error=used");
    }

    if (new Date(link.expires_at) < new Date()) {
      return redirect("/login.html?error=expired");
    }

    // Mark token as used
    await sql`
      UPDATE magic_links SET used_at = NOW() WHERE token = ${token}
    `;

    // Update user — set last_login_at always, account_created_at only on first login
    await sql`
      UPDATE users
      SET
        last_login_at = NOW(),
        account_created_at = COALESCE(account_created_at, NOW())
      WHERE email = ${link.user_email}
    `;

    const sessionId = crypto.randomBytes(32).toString("hex");
    const ipHash = hashIp(getClientIp(req));
    const userAgent = (req.headers.get("user-agent") || "").slice(0, 500);

    await sql`
      INSERT INTO sessions (session_id, user_email, expires_at, ip_hash, user_agent)
      VALUES (
        ${sessionId},
        ${link.user_email},
        NOW() + INTERVAL '30 days',
        ${ipHash},
        ${userAgent}
      )
    `;

    const cookie =
      `flatlabs_session=${sessionId}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=2592000`;

    return new Response(null, {
      status: 302,
      headers: {
        Location: `${BASE_URL}/account.html`,
        "Set-Cookie": cookie,
      },
    });
  } catch (err) {
    console.error("verify-magic-link: internal error:", err.message);
    return redirect("/login.html?error=server");
  }
}

export const config = {
  path: "/api/verify-magic-link",
};
