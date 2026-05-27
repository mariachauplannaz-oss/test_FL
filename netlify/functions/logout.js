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
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const cookies = parseCookies(req.headers.get("cookie"));
  const sessionId = cookies["flatlabs_session"];

  const clearedCookie =
    "flatlabs_session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0";

  if (!sessionId) {
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL);

  try {
    await sql`
      DELETE FROM sessions WHERE session_id = ${sessionId}
    `;
  } catch (err) {
    console.error("logout: DB error:", err.message);
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": clearedCookie,
    },
  });
}

export const config = {
  path: "/api/logout",
};
