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
    return new Response(JSON.stringify({ error: "not_authenticated" }), {
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

    if (sessions.length === 0 || new Date(sessions[0].expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "not_authenticated" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const userEmail = sessions[0].user_email;

    const [userRows, subRows] = await Promise.all([
      sql`
        SELECT is_pro, credits_remaining, credits_rolled_over, credits_reset_at
        FROM users
        WHERE email = ${userEmail}
        LIMIT 1
      `,
      sql`
        SELECT status, current_period_end
        FROM subscriptions
        WHERE user_email = ${userEmail}
        LIMIT 1
      `,
    ]);

    const user = userRows[0] ?? {};
    const sub = subRows[0] ?? null;

    const subscriptionStatus = sub?.status ?? null;
    const currentPeriodEnd = sub?.current_period_end ?? null;
    const creditsRemaining = user.credits_remaining ?? 0;
    const isPro = user.is_pro ?? false;

    const canUseCredit =
      (subscriptionStatus === "active" || subscriptionStatus === "past_due") &&
      creditsRemaining > 0;

    return new Response(
      JSON.stringify({
        is_authenticated: true,
        email: userEmail,
        is_pro: isPro,
        credits_remaining: creditsRemaining,
        subscription_status: subscriptionStatus,
        current_period_end: currentPeriodEnd,
        can_use_credit: canUseCredit,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("check-user-credits: DB error:", err.message);
    return new Response(JSON.stringify({ ok: false, error: "Server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  path: "/api/check-user-credits",
};
