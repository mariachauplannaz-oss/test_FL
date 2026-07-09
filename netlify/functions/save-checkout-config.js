import crypto from 'node:crypto';
import { getStore } from '@netlify/blobs';

// Stripe metadata values are capped at 500 chars, which broke down once
// print placements grew position/scale data — see js/checkout.js. The full
// garment_config (no dataURIs, just image blob_keys) is stored here instead,
// keyed by a UUID that fits comfortably in Stripe metadata.
const MAX_BYTES = 100 * 1024;

export default async function handler(req, context) {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const config = await req.json();
    const json = JSON.stringify(config || {});

    if (Buffer.byteLength(json, 'utf8') > MAX_BYTES) {
      return new Response(JSON.stringify({ ok: false, error: 'Config too large' }), {
        status: 413,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const configKey = crypto.randomUUID();
    await getStore('checkout-configs').set(configKey, json);

    return new Response(JSON.stringify({ ok: true, config_key: configKey }), {
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
  path: '/api/save-checkout-config'
};
