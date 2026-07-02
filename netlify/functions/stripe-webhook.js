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

  switch (event.type) {
    case "checkout.session.completed":
      return handleCheckoutCompleted(event.data.object, sql);
    case "invoice.paid":
      return handleInvoicePaid(event.data.object, sql);
    case "customer.subscription.updated":
      return handleSubscriptionUpdated(event.data.object, sql);
    case "customer.subscription.deleted":
      return handleSubscriptionDeleted(event.data.object, sql);
    default:
      return new Response(JSON.stringify({
        received: true,
        ignored: event.type
      }), {
        headers: { "Content-Type": "application/json" }
      });
  }
}

// ── checkout.session.completed ─────────────────────────────────────────────

async function handleCheckoutCompleted(session, sql) {
  if (session.mode === "subscription") {
    return handleSubscriptionCheckout(session, sql);
  }
  // mode === "payment" — existing one-time download flow (unchanged)
  return handlePaymentCheckout(session, sql);
}

async function handleSubscriptionCheckout(session, sql) {
  const email = typeof session.customer_email === "string" ? session.customer_email.trim().toLowerCase() : session.customer_email;
  const stripeCustomerId = session.customer;
  const stripeSubscriptionId = session.subscription;
  const tcVersion = session.metadata?.tc_version || "1.0";
  if (!session.metadata?.tc_version) {
    console.warn("handleSubscriptionCheckout: tc_version missing from session.metadata, falling back to '1.0'");
  }

  try {
    await sql`
      INSERT INTO users (email)
      VALUES (${email})
      ON CONFLICT (email) DO NOTHING
    `;

    await sql`
      INSERT INTO subscriptions (
        user_email, stripe_customer_id, stripe_subscription_id,
        status, tc_version_accepted, updated_at
      ) VALUES (
        ${email}, ${stripeCustomerId}, ${stripeSubscriptionId},
        'active', ${tcVersion}, NOW()
      )
      ON CONFLICT (user_email) DO UPDATE SET
        stripe_customer_id     = EXCLUDED.stripe_customer_id,
        stripe_subscription_id = EXCLUDED.stripe_subscription_id,
        status                 = 'active',
        tc_version_accepted    = EXCLUDED.tc_version_accepted,
        updated_at             = NOW()
    `;

    // Non-blocking welcome email — calls dedicated send-subscription-email endpoint
    // the email function can branch on it later without changing this handler.
    const baseUrl = process.env.APP_BASE_URL || "https://flatsgenerator.com";
    const controller = new AbortController();
    const emailTimeout = setTimeout(() => controller.abort(), 3000);
    try {
      await fetch(`${baseUrl}/api/send-subscription-email`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });
    } catch (err) {
      console.error("send-subscription-email call failed (non-blocking):", err.message);
    } finally {
      clearTimeout(emailTimeout);
    }

    return new Response(JSON.stringify({
      received: true,
      processed: true,
      mode: "subscription"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Webhook processing error (subscription checkout):", error);
    return new Response(JSON.stringify({
      ok: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

async function handlePaymentCheckout(session, sql) {
  const email = typeof session.customer_email === "string" ? session.customer_email.trim().toLowerCase() : session.customer_email;
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

    // Fetch order_number and created_at from the row we just inserted
    // (created_at is generated by Postgres, so we need to read it back for the email)
    const insertedRow = await sql`
      SELECT order_number, created_at FROM downloads
      WHERE stripe_session_id = ${stripeSessionId}
      LIMIT 1
    `;
    const orderNumber = insertedRow[0]?.order_number;
    const createdAt = insertedRow[0]?.created_at;

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
          order_number: orderNumber,
          created_at: createdAt instanceof Date ? createdAt.toISOString() : createdAt,
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

// ── invoice.paid ───────────────────────────────────────────────────────────

async function handleInvoicePaid(invoice, sql) {
  // Resolve user email: prefer invoice.customer_email, fall back to subscriptions lookup
  let email = typeof invoice.customer_email === "string" ? invoice.customer_email.trim().toLowerCase() : null;
  if (!email && invoice.customer) {
    const rows = await sql`
      SELECT user_email FROM subscriptions
      WHERE stripe_customer_id = ${invoice.customer}
      LIMIT 1
    `;
    email = rows[0]?.user_email ?? null;
  }
  if (!email) {
    console.error("invoice.paid: could not resolve user email for customer", invoice.customer);
    return new Response(JSON.stringify({ received: true, skipped: "no_email" }), {
      headers: { "Content-Type": "application/json" }
    });
  }

  const invoiceId = invoice.id;

  // Period end: try subscription line item first (Stripe 17.x), fall back to root field
  const periodEndTs = invoice.lines?.data?.[0]?.period?.end ?? invoice.period_end ?? null;
  const periodEnd = periodEndTs ? new Date(periodEndTs * 1000).toISOString() : null;

  try {
    // Idempotency guard: if last_invoice_id already equals this invoice, skip credit grant.
    // Requires last_invoice_id TEXT column on subscriptions (add to migration).
    const existing = await sql`
      SELECT last_invoice_id FROM subscriptions
      WHERE user_email = ${email}
      LIMIT 1
    `;
    if (existing[0]?.last_invoice_id === invoiceId) {
      return new Response(JSON.stringify({
        received: true,
        already_processed: true
      }), {
        headers: { "Content-Type": "application/json" }
      });
    }

    await sql`
      UPDATE subscriptions
      SET
        status             = 'active',
        current_period_end = ${periodEnd},
        last_invoice_id    = ${invoiceId},
        updated_at         = NOW()
      WHERE user_email = ${email}
    `;

    // is_pro is always safe to set on a paid invoice (idempotent).
    await sql`
      UPDATE users
      SET is_pro = true
      WHERE email = ${email}
    `;

    // Grant credits only if this billing period hasn't been granted yet.
    // Shared idempotency signal with use-pro-credit.js lazy reset:
    // credits_reset_at aligned to current_period_end means "already granted".
    // NULL-safe for the first invoice of a new subscription.
    await sql`
      UPDATE users
      SET
        credits_remaining = LEAST(credits_remaining + 10, 15),
        credits_reset_at  = ${periodEnd}
      WHERE email = ${email}
        AND (credits_reset_at IS NULL OR credits_reset_at < ${periodEnd})
    `;

    return new Response(JSON.stringify({
      received: true,
      processed: true,
      event: "invoice.paid",
      email
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Webhook processing error (invoice.paid):", error);
    return new Response(JSON.stringify({
      ok: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// ── customer.subscription.updated ─────────────────────────────────────────

async function handleSubscriptionUpdated(subscription, sql) {
  const stripeSubscriptionId = subscription.id;
  const status = subscription.status;
  // Stripe 17.x may serve current_period_end on the items array rather than the root
  const periodEndTs = subscription.current_period_end
    ?? subscription.items?.data?.[0]?.current_period_end
    ?? null;
  const periodEnd = periodEndTs ? new Date(periodEndTs * 1000).toISOString() : null;
  const isPro = status === "active";

  try {
    await sql`
      UPDATE subscriptions
      SET status = ${status}, current_period_end = ${periodEnd}, updated_at = NOW()
      WHERE stripe_subscription_id = ${stripeSubscriptionId}
    `;

    await sql`
      UPDATE users
      SET is_pro = ${isPro}
      WHERE email = (
        SELECT user_email FROM subscriptions
        WHERE stripe_subscription_id = ${stripeSubscriptionId}
        LIMIT 1
      )
    `;

    return new Response(JSON.stringify({
      received: true,
      processed: true,
      event: "customer.subscription.updated",
      status
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Webhook processing error (subscription.updated):", error);
    return new Response(JSON.stringify({
      ok: false,
      error: error.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

// ── customer.subscription.deleted ─────────────────────────────────────────

async function handleSubscriptionDeleted(subscription, sql) {
  const stripeSubscriptionId = subscription.id;

  try {
    await sql`
      UPDATE subscriptions
      SET status = 'canceled', updated_at = NOW()
      WHERE stripe_subscription_id = ${stripeSubscriptionId}
    `;

    // Revoke Pro access; credits are kept — user paid for the current period
    await sql`
      UPDATE users
      SET is_pro = false
      WHERE email = (
        SELECT user_email FROM subscriptions
        WHERE stripe_subscription_id = ${stripeSubscriptionId}
        LIMIT 1
      )
    `;

    return new Response(JSON.stringify({
      received: true,
      processed: true,
      event: "customer.subscription.deleted"
    }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Webhook processing error (subscription.deleted):", error);
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
