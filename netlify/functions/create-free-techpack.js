import { neon } from "@netlify/neon";
import crypto from "node:crypto";
import { validateEmail } from "./lib/email.js";

const sql = neon(process.env.NETLIFY_DATABASE_URL);

const PRODUCT_WHITELIST = new Set(["techpack_tshirt"]);
const MAX_GARMENT_CONFIG_BYTES = 100 * 1024;
const IP_LIMIT = 20;
const EMAIL_LIMIT = 5;
const WINDOW_DAYS = 30;

// Identical to the HMAC helper in register-free-download.js.
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

// Identical to generateOrderNumber in stripe-webhook.js — returns
// "FL-XXXXXX" where X is an uppercase letter or digit (A-Z0-9), using
// crypto.randomBytes with rejection sampling to avoid modulo bias.
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

export default async function handler(req, context) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const body = await req.json();
    const { email: rawEmail, product_key, garment_config, accepted_tc } = body;

    if (!PRODUCT_WHITELIST.has(product_key)) {
      return new Response(JSON.stringify({ ok: false, error: `Unknown product_key: "${product_key}"` }), {
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

    // garment_config is client-supplied and must not be trusted blindly.
    const garmentConfigJson = JSON.stringify(garment_config || {});
    if (Buffer.byteLength(garmentConfigJson, "utf8") > MAX_GARMENT_CONFIG_BYTES) {
      return new Response(JSON.stringify({ ok: false, error: "garment_config too large" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 1. Validate + normalize email
    const validation = await validateEmail(rawEmail);
    if (!validation.ok) {
      return new Response(JSON.stringify({ ok: false, status: "invalid_email", reason: validation.reason }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    const email = validation.email;

    // 2. Hash the client IP
    const rawIp = getClientIp(req);
    const ipHash = hashIp(rawIp);

    // 3. IP check — FREE + PROMO share one 30-day budget
    const ipCount = await sql`
      SELECT COUNT(*) AS cnt FROM downloads
      WHERE ip_hash = ${ipHash}
        AND tier IN ('FREE', 'PROMO')
        AND created_at > NOW() - INTERVAL '30 days'
    `;
    if (parseInt(ipCount[0].cnt, 10) >= IP_LIMIT) {
      return new Response(JSON.stringify({ ok: false, status: "ip_blocked" }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 4. Email check — rolling 30-day window, FREE + PROMO share one budget
    const emailAgg = await sql`
      SELECT COUNT(*) AS cnt, MIN(created_at) AS oldest FROM downloads
      WHERE user_email = ${email}
        AND tier IN ('FREE', 'PROMO')
        AND created_at > NOW() - INTERVAL '30 days'
    `;
    const emailCount = parseInt(emailAgg[0].cnt, 10);
    if (emailCount >= EMAIL_LIMIT) {
      const resetsAt = new Date(emailAgg[0].oldest);
      resetsAt.setDate(resetsAt.getDate() + WINDOW_DAYS);
      return new Response(JSON.stringify({
        ok: false,
        status: "limit_reached",
        resets_at: resetsAt.toISOString(),
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }

    // 5. Synthetic session id — verify-token.js doesn't care where a
    // session id came from, so this makes the whole downstream chain
    // (state restore, PDF generation, delivery email, re-download window)
    // work with zero changes.
    const sessionId = `promo_${crypto.randomBytes(16).toString("hex")}`;

    // 6. Download token — same shape as the paid flow
    const downloadToken = crypto.randomBytes(32).toString("hex");

    // 8. Upsert user
    await sql`
      INSERT INTO users (email)
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
    `;

    // 7 + 9. Insert the downloads row with a unique order_number, retrying
    // on collision exactly like handlePaymentCheckout in stripe-webhook.js.
    let inserted = false;
    for (let attempt = 0; attempt < 5; attempt++) {
      const orderNumber = generateOrderNumber();
      try {
        await sql`
          INSERT INTO downloads (
            user_email,
            tier,
            garment_config,
            tc_version_accepted,
            stripe_session_id,
            download_token,
            order_number,
            ip_hash
          ) VALUES (
            ${email},
            'PROMO',
            ${garment_config || {}},
            '1.0',
            ${sessionId},
            ${downloadToken},
            ${orderNumber},
            ${ipHash}
          )
        `;
        inserted = true;
        break;
      } catch (err) {
        if (err.code === "23505") continue; // unique constraint on order_number; retry
        throw err;
      }
    }
    if (!inserted) {
      throw new Error("Failed to generate a unique order_number after 5 attempts");
    }

    // 10. Read back order_number and created_at from the inserted row
    const insertedRow = await sql`
      SELECT order_number, created_at FROM downloads
      WHERE stripe_session_id = ${sessionId}
      LIMIT 1
    `;
    const orderNumber = insertedRow[0]?.order_number;
    const createdAt = insertedRow[0]?.created_at;

    // 11. Deliver the Tech Pack email — non-blocking, bounded by a 3s
    // timeout. The downloads row already exists; an email failure must
    // never fail this request.
    const baseUrl = process.env.APP_BASE_URL || "https://flatsgenerator.com";
    const controller = new AbortController();
    const emailTimeout = setTimeout(() => controller.abort(), 3000);
    try {
      await fetch(`${baseUrl}/api/send-techpack-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          session_id: sessionId,
          garment_config: garment_config || {},
          download_token: downloadToken,
          order_number: orderNumber,
          created_at: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      console.error("send-techpack-email call failed (non-blocking):", err.message);
    } finally {
      clearTimeout(emailTimeout);
    }

    // 12.
    return new Response(JSON.stringify({
      ok: true,
      session_id: sessionId,
      order_number: orderNumber,
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("create-free-techpack error:", error);
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export const config = {
  path: "/api/create-free-techpack",
};
