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

  const { email, session_id, garment_config, download_token, order_number, created_at } = body;

  if (!email || !session_id || !order_number || !created_at) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const recoveryUrl = `${BASE_URL}/app.html?payment=success&session_id=${session_id}`;
  const garmentSummary = garment_config
    ? `${garment_config.garment || "Garment"} · ${garment_config.gender || ""}`.trim().replace(/·\s*$/, "")
    : "Tech Pack";
  const expiresAt = formatExpirationDate(created_at);

  let sent_to_customer = false;
  let sent_to_admin = false;

  // ── Email to customer ──────────────────────────────────────────────────────
  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: `Your FlatLabs Tech Pack is ready — ${order_number}`,
      html: customerEmailHtml({ recoveryUrl, orderNumber: order_number, expiresAt }),
      text: customerEmailText({ recoveryUrl, orderNumber: order_number, expiresAt }),
    });
    sent_to_customer = true;
  } catch (err) {
    console.error("send-techpack-email: Resend error (customer email):", err.message);
  }

  // ── Email to admin (Maria) ─────────────────────────────────────────────────
  try {
    await resend.emails.send({
      from: FROM,
      to: ADMIN_EMAIL,
      subject: `New FlatLabs free download — ${email}`,
      text: adminEmailText({ email, session_id, order_number, garmentSummary, garment_config }),
    });
    sent_to_admin = true;
  } catch (err) {
    console.error("send-techpack-email: Resend error (admin email):", err.message);
  }

  // The free download itself already succeeded by the time this runs — a
  // Resend failure here must never surface as a caller-facing error, so this
  // always returns 200, even if both sends above failed.
  return new Response(
    JSON.stringify({ ok: true, sent_to_customer, sent_to_admin }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export const config = {
  path: "/api/send-techpack-email",
};

// ── Templates ──────────────────────────────────────────────────────────────

function formatExpirationDate(createdAtIso) {
  const date = new Date(createdAtIso);
  date.setDate(date.getDate() + 15);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'UTC'
  });
}

function customerEmailHtml({ recoveryUrl, orderNumber, expiresAt }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Your FlatLabs Tech Pack</title>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=DM+Sans:ital,wght@0,400;0,500;0,600;0,700&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
</head>
<body style="margin:0;padding:0;background:#FCFCFA;font-family:'DM Sans',-apple-system,BlinkMacSystemFont,'Helvetica Neue',Arial,sans-serif;color:#111111;-webkit-font-smoothing:antialiased;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FCFCFA;padding:40px 16px;">
    <tr>
      <td align="center">

        <table width="560" cellpadding="0" cellspacing="0" border="0" style="background:#FFFFFF;border:1px solid #E8E8E3;border-radius:8px;overflow:hidden;max-width:560px;">

          <!-- HEADER -->
          <tr>
            <td style="padding:28px 36px 24px;border-bottom:1px solid #E8E8E3;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <span style="font-family:'DM Sans',Arial,sans-serif;font-size:18px;font-weight:700;letter-spacing:-0.4px;color:#111111;">Flat</span><span style="font-family:'DM Sans',Arial,sans-serif;font-size:18px;font-weight:700;letter-spacing:-0.4px;color:#FF6B57;">Labs</span>
                  </td>
                  <td align="right" style="font-family:'JetBrains Mono',Courier,monospace;font-size:10px;font-weight:500;letter-spacing:1.5px;color:#6B6B66;text-transform:uppercase;">
                    Order&nbsp;${orderNumber}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="padding:40px 36px 8px;">
              <div style="font-family:'JetBrains Mono',Courier,monospace;font-size:10px;font-weight:600;letter-spacing:2px;color:#FF6B57;text-transform:uppercase;margin-bottom:18px;">
                — Tech Pack · Ready
              </div>
              <h1 style="margin:0 0 12px;font-family:'Playfair Display',Georgia,serif;font-size:34px;font-weight:700;letter-spacing:-0.8px;line-height:1.1;color:#111111;">
                Your tech pack is ready.
              </h1>
              <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:15px;line-height:1.6;color:#6B6B66;">
                Your Tech Pack is ready. Click below to return to the app and download your spec sheet.
              </p>
            </td>
          </tr>

          <!-- LAUNCH ACCESS -->
          <tr>
            <td style="padding:32px 36px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FCFCFA;border:1px solid #E8E8E3;border-radius:6px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <div style="font-family:'JetBrains Mono',Courier,monospace;font-size:10px;font-weight:600;letter-spacing:1.8px;color:#FF6B57;text-transform:uppercase;margin-bottom:6px;">
                      Launch Access
                    </div>
                    <div style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#111111;line-height:1.55;">
                      Your Tech Pack is free during the FlatLabs launch period. Nothing has been charged.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:36px 36px 8px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="background:#111111;border-radius:6px;">
                    <a href="${recoveryUrl}"
                       style="display:block;padding:16px 32px;font-family:'DM Sans',Arial,sans-serif;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:-0.1px;">
                      Download Tech Pack →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SECONDARY CTA: View account -->
          <tr>
            <td style="padding:12px 36px 0;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="border:1.5px solid #111111;border-radius:6px;">
                    <a href="${BASE_URL}/login.html"
                       style="display:block;padding:14px 32px;font-family:'DM Sans',Arial,sans-serif;font-size:14px;font-weight:600;color:#111111;text-decoration:none;letter-spacing:-0.1px;">
                      View my account →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- EXPIRATION NOTICE -->
          <tr>
            <td style="padding:20px 36px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FCFCFA;border:1px solid #E8E8E3;border-radius:6px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <div style="font-family:'JetBrains Mono',Courier,monospace;font-size:10px;font-weight:600;letter-spacing:1.8px;color:#FF6B57;text-transform:uppercase;margin-bottom:6px;">
                      Download Window
                    </div>
                    <div style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#111111;line-height:1.55;">
                      This link stays active until <strong style="font-weight:600;">${expiresAt}</strong>. You can download your Tech Pack as many times as you need before then.
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- FALLBACK URL -->
          <tr>
            <td style="padding:28px 36px 0;">
              <div style="font-family:'JetBrains Mono',Courier,monospace;font-size:10px;font-weight:600;letter-spacing:1.8px;color:#6B6B66;text-transform:uppercase;margin-bottom:8px;">
                Button not working?
              </div>
              <div style="font-family:'JetBrains Mono',Courier,monospace;font-size:11px;color:#6B6B66;line-height:1.5;word-break:break-all;">
                <a href="${recoveryUrl}" style="color:#111111;text-decoration:underline;text-decoration-color:#FF6B57;">
                  ${recoveryUrl}
                </a>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:36px 36px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #E8E8E3;">
                <tr>
                  <td style="padding-top:24px;">
                    <p style="margin:0 0 8px;font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:#6B6B66;line-height:1.6;">
                      Need help with this download or a late re-issue?
                    </p>
                    <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:#111111;line-height:1.6;">
                      Reply to this email or write to <a href="mailto:flatsgenerator@gmail.com" style="color:#111111;text-decoration:underline;text-decoration-color:#FF6B57;font-weight:500;">flatsgenerator@gmail.com</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

        </table>

        <table width="560" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;max-width:560px;">
          <tr>
            <td align="center" style="font-family:'JetBrains Mono',Courier,monospace;font-size:10px;font-weight:500;letter-spacing:1.8px;color:#9C9C95;text-transform:uppercase;">
              FlatLabs · flatsgenerator.com
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
}

function customerEmailText({ recoveryUrl, orderNumber, expiresAt }) {
  return `Your FlatLabs Tech Pack is ready.

Order: ${orderNumber}

Your Tech Pack is free during the FlatLabs launch period. Nothing has been charged.

Download your spec sheet:
${recoveryUrl}

View all your downloads and manage your account:
${BASE_URL}/login.html

DOWNLOAD WINDOW
This link stays active until ${expiresAt}. You can download your Tech Pack as many times as you need before then.

Need help with this download or a late re-issue?
Reply to this email or write to flatsgenerator@gmail.com

— FlatLabs · flatsgenerator.com`;
}

function adminEmailText({ email, session_id, order_number, garmentSummary, garment_config }) {
  const date = new Date().toISOString();
  const configFormatted = JSON.stringify(garment_config, null, 2);

  return `New free Tech Pack download on FlatLabs.

Date: ${date}
Customer: ${email}
Order: ${order_number}
Garment: ${garmentSummary}
Session: ${session_id}

Garment config:
${configFormatted}

Admin panel: ${BASE_URL}/admin.html`;
}
