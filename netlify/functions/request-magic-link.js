import { neon } from "@netlify/neon";
import crypto from "node:crypto";

const PUBLIC_RESPONSE = {
  ok: true,
  message: "If an account exists with that email, you'll receive a link shortly.",
};

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
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { email } = body;

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL);

  try {
    // Rate limit: max 5 requests per hour per email
    const recent = await sql`
      SELECT COUNT(*) AS cnt
      FROM magic_links
      WHERE user_email = ${email}
        AND created_at > NOW() - INTERVAL '1 hour'
    `;
    if (Number(recent[0].cnt) >= 5) {
      return new Response(JSON.stringify(PUBLIC_RESPONSE), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Anti-enumeration: check user existence silently
    const users = await sql`
      SELECT email FROM users WHERE email = ${email} LIMIT 1
    `;
    if (users.length === 0) {
      return new Response(JSON.stringify(PUBLIC_RESPONSE), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    const token = crypto.randomBytes(32).toString("hex");
    const ipHash = hashIp(getClientIp(req));

    await sql`
      INSERT INTO magic_links (token, user_email, expires_at, ip_hash)
      VALUES (
        ${token},
        ${email},
        NOW() + INTERVAL '15 minutes',
        ${ipHash}
      )
    `;

    const baseUrl = process.env.APP_BASE_URL || "https://flatsgenerator.com";
    const controller = new AbortController();
    const emailTimeout = setTimeout(() => controller.abort(), 5000);
    try {
      await fetch(`${baseUrl}/api/send-magic-link-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token }),
        signal: controller.signal,
      });
    } catch (err) {
      console.error("request-magic-link: send-magic-link-email call failed:", err.message);
    } finally {
      clearTimeout(emailTimeout);
    }
  } catch (err) {
    console.error("request-magic-link: internal error:", err.message);
    // Anti-enumeration: fall through to same public response
  }

  return new Response(JSON.stringify(PUBLIC_RESPONSE), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export const config = {
  path: "/api/request-magic-link",
};
