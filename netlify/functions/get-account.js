import { neon } from "@netlify/neon";

function parseCookies(cookieHeader) {
  if (!cookieHeader) return {};
  return Object.fromEntries(
    cookieHeader.split(";").map((pair) => {
      const idx = pair.indexOf("=");
      return idx === -1
        ? [pair.trim(), ""]
        : [pair.slice(0, idx).trim(), pair.slice(idx + 1).trim()];
    })
  );
}

export default async function handler(req) {
  if (req.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const cookies = parseCookies(req.headers.get("cookie"));
  const sessionId = cookies["flatlabs_session"];

  if (!sessionId) {
    return new Response(JSON.stringify({ ok: false, error: "Not authenticated" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL);

  try {
    const sessions = await sql`
      SELECT user_email, expires_at
      FROM sessions
      WHERE session_id = ${sessionId}
      LIMIT 1
    `;

    if (sessions.length === 0) {
      return new Response(JSON.stringify({ ok: false, error: "Invalid session" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const session = sessions[0];

    if (new Date(session.expires_at) < new Date()) {
      return new Response(JSON.stringify({ ok: false, error: "Session expired" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    await sql`
      UPDATE sessions SET last_activity_at = NOW() WHERE session_id = ${sessionId}
    `;

    const downloads = await sql`
      SELECT
        order_number,
        garment_config,
        created_at,
        stripe_session_id,
        tier,
        (created_at + INTERVAL '15 days' > NOW()) AS is_active
      FROM downloads
      WHERE user_email = ${session.user_email}
      ORDER BY created_at DESC
    `;

    return new Response(
      JSON.stringify({ ok: true, email: session.user_email, downloads }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("get-account: DB error:", err.message);
    return new Response(JSON.stringify({ ok: false, error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  path: "/api/get-account",
};
