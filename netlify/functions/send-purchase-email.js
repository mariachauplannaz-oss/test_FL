import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "noreply@flatsgenerator.com";
const ADMIN_EMAIL = "flatsgenerator@gmail.com";
const BASE_URL = process.env.APP_BASE_URL || "https://flatsgenerator.com";

export default async function handler(req) {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const { email, session_id, garment_config, download_token } = body;

  if (!email || !session_id) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const recoveryUrl = `${BASE_URL}/app.html?payment=success&session_id=${session_id}`;
  const garmentSummary = garment_config
    ? `${garment_config.garment || "Garment"} · ${garment_config.gender || ""}`.trim().replace(/·\s*$/, "")
    : "Tech Pack";

  let sent_to_customer = false;
  let sent_to_admin = false;

  // ── Email to customer ──────────────────────────────────────────────────────
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Your FlatLabs Tech Pack is ready",
      html: customerEmailHtml(recoveryUrl, garmentSummary),
      text: customerEmailText(recoveryUrl, garmentSummary),
    });
    sent_to_customer = true;
  } catch (err) {
    console.error("Resend error (customer email):", err.message);
  }

  // ── Email to admin (Maria) ─────────────────────────────────────────────────
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New FlatLabs sale — ${email}`,
      text: adminEmailText(email, session_id, garment_config),
    });
    sent_to_admin = true;
  } catch (err) {
    console.error("Resend error (admin email):", err.message);
  }

  // Both failed → 500, but caller (webhook) ignores this
  if (!sent_to_customer && !sent_to_admin) {
    return new Response(
      JSON.stringify({ ok: false, error: "Both emails failed to send" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true, sent_to_customer, sent_to_admin }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export const config = {
  path: "/api/send-purchase-email",
};

// ── Templates ──────────────────────────────────────────────────────────────

function customerEmailHtml(recoveryUrl, garmentSummary) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your FlatLabs Tech Pack</title>
</head>
<body style="margin:0;padding:0;background:#f5f5f7;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f7;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;max-width:560px;">

          <!-- Header -->
          <tr>
            <td style="background:#0a0a0c;padding:28px 40px;">
              <p style="margin:0;font-size:18px;font-weight:700;letter-spacing:-0.02em;color:#ffffff;">FlatLabs</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <p style="margin:0 0 24px;font-size:22px;font-weight:600;color:#1d1d1f;letter-spacing:-0.02em;">
                Your tech pack is ready.
              </p>
              <p style="margin:0 0 8px;font-size:14px;color:#6e6e73;">Garment</p>
              <p style="margin:0 0 32px;font-size:16px;font-weight:500;color:#1d1d1f;">${garmentSummary}</p>

              <p style="margin:0 0 20px;font-size:15px;color:#3d3d3f;line-height:1.6;">
                Click the button below to return to the app and download your PDF spec sheet.
                If you closed the tab before downloading, this link will recover your session.
                <strong>Single use.</strong>
              </p>

              <!-- CTA -->
              <table cellpadding="0" cellspacing="0" style="margin:0 0 32px;">
                <tr>
                  <td style="background:#0a0a0c;border-radius:8px;">
                    <a href="${recoveryUrl}"
                       style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;letter-spacing:-0.01em;">
                      Download Tech Pack →
                    </a>
                  </td>
                </tr>
              </table>

              <p style="margin:0;font-size:13px;color:#6e6e73;line-height:1.6;">
                If the button doesn't work, copy and paste this URL into your browser:<br>
                <span style="color:#0a0a0c;word-break:break-all;">${recoveryUrl}</span>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #e5e5ea;">
              <p style="margin:0;font-size:12px;color:#6e6e73;line-height:1.6;">
                Questions? Reply to this email or contact us at
                <a href="mailto:flatsgenerator@gmail.com" style="color:#0a0a0c;">flatsgenerator@gmail.com</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function customerEmailText(recoveryUrl, garmentSummary) {
  return `Your FlatLabs Tech Pack is ready.

Garment: ${garmentSummary}

Click the link below to return to the app and download your PDF spec sheet.
If you closed the tab before downloading, use this link to recover your session. Single use.

${recoveryUrl}

Questions? Contact us at flatsgenerator@gmail.com

— FlatLabs`;
}

function adminEmailText(email, session_id, garment_config) {
  const date = new Date().toISOString();
  const configFormatted = JSON.stringify(garment_config, null, 2);
  const BASE_URL = process.env.APP_BASE_URL || "https://flatsgenerator.com";

  return `New sale on FlatLabs.

Date: ${date}
Customer: ${email}
Stripe session: ${session_id}

Garment config:
${configFormatted}

Admin panel: ${BASE_URL}/admin.html`;
}
