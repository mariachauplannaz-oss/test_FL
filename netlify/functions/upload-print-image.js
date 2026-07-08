import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

const ALLOWED = /^data:image\/(png|jpeg|svg\+xml);base64,/;
const MAX_BYTES = 5 * 1024 * 1024;

export default async function handler(req, context) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const { image } = await req.json();

    if (typeof image !== 'string' || !ALLOWED.test(image)) {
      return new Response(JSON.stringify({ ok: false, error: 'Invalid image type' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const base64 = image.slice(image.indexOf(',') + 1);
    const byteLength = Buffer.from(base64, 'base64').length;
    if (byteLength > MAX_BYTES) {
      return new Response(JSON.stringify({ ok: false, error: 'Image too large (max 5MB)' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Store the raw dataURI as-is — it already self-describes its MIME type
    // via its "data:image/...;base64," prefix, so get-print-image.js never
    // needs separate Content-Type metadata to serve it back correctly.
    // Key is kept to 8 hex chars (no prefix/timestamp) because it round-trips
    // through Stripe metadata (500-char cap) at checkout — see js/checkout.js.
    const key = crypto.randomBytes(4).toString('hex');
    await getStore('print-images').set(key, image);

    return new Response(JSON.stringify({ ok: true, blob_key: key }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    return new Response(JSON.stringify({ ok: false, error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export const config = {
  path: '/api/upload-print-image'
};
