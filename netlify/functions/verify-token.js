// 15-day reusable token model: customers may re-download their PDF as many times
// as they want within 15 days of purchase. last_accessed_at is updated on every
// successful verification. Expired tokens return 410 Gone.
import { neon } from "@netlify/neon";

export default async function handler(req, context) {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" }
    });
  }

  const sql = neon(process.env.NETLIFY_DATABASE_URL);

  try {
    const body = await req.json();
    const { session_id } = body;

    if (!session_id) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: "session_id is required" 
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 1. Find the download record by Stripe session ID
    const result = await sql`
      SELECT
        id,
        user_email,
        tier,
        garment_config,
        download_token,
        used_at,
        created_at,
        order_number
      FROM downloads
      WHERE stripe_session_id = ${session_id}
      LIMIT 1
    `;

    if (result.length === 0) {
      return new Response(JSON.stringify({ 
        ok: false, 
        error: "No download found for this session" 
      }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }

    const download = result[0];

    // 2. Check if token has expired (15-day window from purchase)
    const expiresAt = new Date(download.created_at);
    expiresAt.setDate(expiresAt.getDate() + 15);
    if (Date.now() > expiresAt.getTime()) {
      return new Response(JSON.stringify({
        ok: false,
        error: "This download link has expired. Links are valid for 15 days after purchase.",
        expired_at: expiresAt.toISOString()
      }), {
        status: 410,
        headers: { "Content-Type": "application/json" }
      });
    }

    // 3. Record access time
    await sql`
      UPDATE downloads
      SET last_accessed_at = NOW()
      WHERE id = ${download.id}
    `;

    // 4. Return data needed to generate the PDF
    return new Response(JSON.stringify({
      ok: true,
      tier: download.tier,
      garment_config: download.garment_config,
      email: download.user_email,
      order_number: download.order_number
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error("verify-token error:", error);
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
  path: "/api/verify-token"
};
