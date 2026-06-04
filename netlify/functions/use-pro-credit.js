import { neon } from "@netlify/neon";
import crypto from "node:crypto";

const VALID_PRODUCT_KEYS = new Set([
  "tshirt_techpack", "pants_techpack", "hoodie_techpack",
  "tshirt_svg",      "pants_svg",      "hoodie_svg",
]);

// Copied verbatim from stripe-webhook.js — rejection sampling to avoid modulo bias.
function generateOrderNumber() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  while (result.length < 6) {
    const byte = crypto.randomBytes(1)[0];
    if (byte < 252) { // 252 = 7 * 36; discard to avoid bias
      result += chars[byte % 36];
    }
  }
  return `FL-${result}`;
}

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

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // ── Auth ─────────────────────────────────────────────────────────────────
  const cookies = parseCookies(req.headers.get("cookie"));
  const sessionId = cookies["flatlabs_session"];
  if (!sessionId) {
    return json({ error: "not_authenticated" }, 401);
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const { product_key, garment_config } = body;

  // Validate product_key before any DB round-trip
  if (!product_key || !VALID_PRODUCT_KEYS.has(product_key)) {
    return json({ error: "invalid_product_key" }, 400);
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL);

  try {
    // ── Validate session ──────────────────────────────────────────────────
    const sessions = await sql`
      SELECT user_email, expires_at
      FROM sessions
      WHERE session_id = ${sessionId}
      LIMIT 1
    `;
    if (sessions.length === 0 || new Date(sessions[0].expires_at) < new Date()) {
      return json({ error: "not_authenticated" }, 401);
    }
    const userEmail = sessions[0].user_email;

    // ── Lazy monthly reset (safety net for missed/delayed webhooks) ───────
    // The stripe-webhook invoice.paid handler is the primary reset path.
    // This runs as a defensive fallback in case that webhook was lost.
    // Idempotency is guaranteed by the WHERE condition mirroring the JS check:
    // if the webhook already ran (credits_reset_at is current), the UPDATE
    // matches no rows and is a no-op. LEAST(..., 15) caps any double-grant.
    const resetCheckRows = await sql`
      SELECT u.credits_remaining, u.credits_reset_at,
             s.current_period_end, s.status
      FROM users u
      LEFT JOIN subscriptions s ON s.user_email = u.email
      WHERE u.email = ${userEmail}
    `;
    const rc = resetCheckRows[0];
    if (rc) {
      const creditsResetAt   = rc.credits_reset_at   ? new Date(rc.credits_reset_at)   : null;
      const currentPeriodEnd = rc.current_period_end ? new Date(rc.current_period_end) : null;
      const needsReset = (
        ["active", "past_due"].includes(rc.status) &&
        currentPeriodEnd !== null &&
        creditsResetAt   !== null &&
        creditsResetAt < new Date(currentPeriodEnd.getTime() - 31 * 24 * 60 * 60 * 1000)
      );
      if (needsReset) {
        const resetRows = await sql`
          UPDATE users
          SET credits_remaining  = LEAST(credits_remaining + 10, 15),
              credits_rolled_over = credits_remaining,
              credits_reset_at    = NOW()
          WHERE email = ${userEmail}
            AND credits_reset_at < (
              SELECT current_period_end - INTERVAL '30 days' - INTERVAL '1 day'
              FROM subscriptions
              WHERE user_email = ${userEmail}
            )
          RETURNING credits_remaining, credits_rolled_over
        `;
        if (resetRows.length > 0) {
          console.log(
            `use-pro-credit: lazy reset applied for ${userEmail} — ` +
            `prev=${resetRows[0].credits_rolled_over} new=${resetRows[0].credits_remaining}`
          );
        }
      }
    }

    // ── Pre-flight eligibility check (for clear error messages) ──────────
    // Runs before the atomic write so the client gets a meaningful error
    // without hitting the CTE's silent no-op path.
    const [userRows, subRows] = await Promise.all([
      sql`
        SELECT is_pro, credits_remaining
        FROM users
        WHERE email = ${userEmail}
        LIMIT 1
      `,
      sql`
        SELECT status, tc_version_accepted
        FROM subscriptions
        WHERE user_email = ${userEmail}
        LIMIT 1
      `,
    ]);

    const user = userRows[0];
    const sub  = subRows[0];

    if (!user?.is_pro || !sub || !["active", "past_due"].includes(sub.status)) {
      return json({ error: "no_active_subscription" }, 403);
    }
    if ((user.credits_remaining ?? 0) <= 0) {
      return json({ error: "no_credits_remaining" }, 403);
    }

    // ── Generate tokens ───────────────────────────────────────────────────
    const downloadToken    = crypto.randomBytes(32).toString("hex");
    const orderNumber      = generateOrderNumber();
    const garmentConfigVal = garment_config ?? {};

    // ── Atomic deduct + insert (single SQL statement) ─────────────────────
    // The neon HTTP driver runs each tagged-template call on its own connection,
    // so explicit BEGIN/COMMIT across calls would not be in the same transaction.
    // This CTE achieves equivalent atomicity in one round-trip:
    //   - UPDATE only runs when credits_remaining > 0 (race-condition guard)
    //   - INSERT only runs if UPDATE matched a row (WHERE EXISTS on deduct)
    // If two concurrent requests pass the pre-flight above, only one will match
    // the WHERE credits_remaining > 0 condition; the other gets 0 rows back.
    const result = await sql`
      WITH deduct AS (
        UPDATE users
        SET credits_remaining = credits_remaining - 1
        WHERE email             = ${userEmail}
          AND is_pro            = true
          AND credits_remaining > 0
          AND EXISTS (
            SELECT 1 FROM subscriptions
            WHERE user_email = ${userEmail}
              AND status IN ('active', 'past_due')
          )
        RETURNING credits_remaining
      )
      INSERT INTO downloads (
        user_email,
        tier,
        garment_config,
        download_token,
        order_number,
        tc_version_accepted,
        created_at,
        last_accessed_at
      )
      SELECT
        ${userEmail},
        'PRO',
        ${garmentConfigVal},
        ${downloadToken},
        ${orderNumber},
        ${sub.tc_version_accepted},
        NOW(),
        NOW()
      WHERE EXISTS (SELECT 1 FROM deduct)
      RETURNING
        download_token,
        order_number,
        (SELECT credits_remaining FROM deduct) AS credits_remaining
    `;

    if (result.length === 0) {
      // Race condition: another concurrent request won the deduction between
      // our pre-flight check and this write. Treat it as no credits remaining.
      return json({ error: "no_credits_remaining" }, 403);
    }

    return json({
      success:           true,
      download_token:    result[0].download_token,
      order_number:      result[0].order_number,
      credits_remaining: result[0].credits_remaining,
    });

  } catch (err) {
    console.error("use-pro-credit: DB error:", err.message);
    return json({ error: "internal_error" }, 500);
  }
}

export const config = {
  path: "/api/use-pro-credit",
};
