import { neon } from "@netlify/neon";
import crypto from "node:crypto";

const sql = neon(process.env.NETLIFY_DATABASE_URL);

// Same HMAC pattern as register-free-download.js (GDPR-compliant IP hashing)
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

// Hard cap on event_data size to protect the DB from accidental large blobs
const MAX_EVENT_DATA_BYTES = 2048; // 2 KB

export default async function handler(req, context) {
  // Only accept POST
  if (req.method !== "POST") {
    return new Response(null, { status: 405 });
  }

  try {
    const body = await req.json();
    const {
      session_id,
      event_name,
      event_data,
      user_email,
      app_version
    } = body;

    // 1. Validate required fields (silently drop if invalid — fire-and-forget)
    if (typeof session_id !== "string" || session_id.length === 0 || session_id.length > 64) {
      return new Response(null, { status: 204 });
    }
    if (typeof event_name !== "string" || event_name.length === 0 || event_name.length > 64) {
      return new Response(null, { status: 204 });
    }

    // 2. Validate event_data size
    let safeData = {};
    if (event_data && typeof event_data === "object") {
      const serialized = JSON.stringify(event_data);
      if (serialized.length <= MAX_EVENT_DATA_BYTES) {
        safeData = event_data;
      }
    }

    // 3. Hash IP
    const rawIp = getClientIp(req);
    const ipHash = hashIp(rawIp);

    // 4. Sanitize optional fields
    const safeEmail = typeof user_email === "string" && user_email.length <= 254
      ? user_email
      : null;
    const safeVersion = typeof app_version === "string" && app_version.length <= 32
      ? app_version
      : null;

    // 5. Insert (fire-and-forget — no need to return data)
    await sql`
      INSERT INTO events (
        session_id,
        event_name,
        event_data,
        user_email,
        ip_hash,
        app_version
      ) VALUES (
        ${session_id},
        ${event_name},
        ${JSON.stringify(safeData)},
        ${safeEmail},
        ${ipHash},
        ${safeVersion}
      )
    `;

    // 204 = success, no body needed (faster, less bandwidth)
    return new Response(null, { status: 204 });

  } catch (error) {
    console.error("track-event error:", error);
    // Never throw — analytics must never break UX
    return new Response(null, { status: 204 });
  }
}

export const config = {
  path: "/api/track-event"
};
