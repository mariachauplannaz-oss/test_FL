import Stripe from "stripe";
import { neon } from "@netlify/neon";
import crypto from "node:crypto";

// Returns "FL-XXXXXX" where X is an uppercase letter or digit (A-Z0-9).
// Uses crypto.randomBytes with rejection sampling to avoid modulo bias.
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
    return new Response("Method not allowed", { status: 405 });
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  const sql = neon(process.env.NETLIFY_DATABASE_URL);
  const signature = req.headers.get("stripe-signature");
  const rawBody = await req.text();

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err.message);
    return new Response(JSON.stringify({
      error: `Invalid signature: ${err.message}`
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (event.type !== "checkout.session.completed") {
    return new Response(JSON.stringify({
      received: true,
      ignored: event.type
    }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  const session = event.data.object;
  const email = session.customer_email;
  const stripeSessionId = session.id;
  const garmentConfig = session.metadata?.garment_config
    ? JSON.parse(session.metadata.garment_config)
    : {};
  const tcVersion = session.metadata?.tc_version || "1.0";
  const productKey = session.metadata?.product_key ?? null;

  try {
    const existing = await sql`
      SELECT id, download_token FROM downloads 
      WHERE stripe_session_id = ${stripeSessionId}
    `;

    if (existing.length > 0) {
      return new Response(JSON.stringify({
        received: true,
        already_processed: true,
        token: existing[0].download_token
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    await sql`
      INSERT INTO users (email) 
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
    `;

    const downloadToken = crypto.randomBytes(32).toString("hex");

    // TODO: when subscriptions are added, derive tier from product_key
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
            order_number
          ) VALUES (
            ${email},
            'PRO',
            ${garmentConfig},
            ${tcVersion},
            ${stripeSessionId},
            ${downloadToken},
            ${orderNumber}
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

    // Send purchase emails — awaited so the runtime doesn't kill the request,
    // but bounded by a 3s timeout via AbortController. If it times out or fails,
    // we log and continue — INSERT already succeeded, Stripe must get 200.
    const baseUrl = process.env.APP_BASE_URL || "https://flatsgenerator.com";
    const controller = new AbortController();
    const emailTimeout = setTimeout(() => controller.abort(), 3000);
    try {
      await fetch(`${baseUrl}/api/send-purchase-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          session_id: stripeSessionId,
          garment_config: garmentConfig,
          download_token: downloadToken,
        }),
        signal: controller.signal,
      });
    } catch (err) {
      console.error("send-purchase-email call failed (non-blocking):", err.message);
    } finally {
      clearTimeout(emailTimeout);
    }

    return new Response(JSON.stringify({
      received: true,
      processed: true
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("Webhook processing error:", error);
    return new Response(JSON.stringify({
      ok: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export const config = {
  path: "/api/stripe-webhook"
};
