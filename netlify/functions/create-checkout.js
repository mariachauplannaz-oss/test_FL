import Stripe from "stripe";

const PRODUCT_MAP = {
  techpack_tshirt: process.env.STRIPE_PRICE_TECHPACK_TSHIRT
};

export default async function handler(req, context) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }
  try {
    const body = await req.json();
    const { email: rawEmail, product_key, config_key } = body;
    const email = typeof rawEmail === "string" ? rawEmail.trim().toLowerCase() : "";
    if (!email) {
      return new Response(JSON.stringify({ error: "Email is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!product_key || !(product_key in PRODUCT_MAP)) {
      return new Response(JSON.stringify({ error: `Unknown product_key: "${product_key}"` }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!config_key) {
      return new Response(JSON.stringify({ error: "config_key is required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const priceId = PRODUCT_MAP[product_key];
    if (!priceId) {
      return new Response(JSON.stringify({ error: `Price not configured for: "${product_key}"` }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: email,
      line_items: [
        {
          price: priceId,
          quantity: 1
        }
      ],
      metadata: {
        product_key,
        tc_version: "1.0",
        config_key
      },
      success_url: `${req.headers.get("origin")}/app.html?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/app.html?payment=cancelled`
    });
    return new Response(JSON.stringify({ ok: true, url: session.url }), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

export const config = {
  path: "/api/create-checkout"
};
