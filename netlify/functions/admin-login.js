import jwt from "jsonwebtoken";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ ok: false, error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { password } = body;

  // Random delay 200-500ms to mitigate timing attacks on password comparison
  await new Promise((r) => setTimeout(r, 200 + Math.random() * 300));

  if (!password || password !== process.env.ADMIN_PASSWORD) {
    return new Response(JSON.stringify({ ok: false, error: "Invalid password" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const now = Math.floor(Date.now() / 1000);
  const token = jwt.sign(
    { role: "admin", iat: now, exp: now + 60 * 60 * 24 },
    process.env.ADMIN_JWT_SECRET
  );

  return new Response(JSON.stringify({ ok: true, token }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

export const config = {
  path: "/api/admin-login",
};
