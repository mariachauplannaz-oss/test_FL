import { getStore } from '@netlify/blobs';

export default async function handler(req, context) {
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ ok: false, error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    const key = new URL(req.url).searchParams.get('key');
    if (!key) {
      return new Response(JSON.stringify({ ok: false, error: 'key is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const dataURI = await getStore('print-images').get(key);
    if (!dataURI) {
      return new Response(JSON.stringify({ ok: false, error: 'Not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return new Response(JSON.stringify({ ok: true, dataURI }), {
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
  path: '/api/get-print-image'
};
