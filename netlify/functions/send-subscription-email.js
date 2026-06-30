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

  const { email } = body;

  if (!email) {
    return new Response(JSON.stringify({ error: "Missing required field: email" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Welcome to FlatLabs Pro",
      html: subscriptionWelcomeHtml(),
      text: subscriptionWelcomeText(),
    });
  } catch (err) {
    console.error("send-subscription-email: Resend error:", err.message);
    return new Response(
      JSON.stringify({ ok: false, error: err.message }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  return new Response(
    JSON.stringify({ ok: true }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

export const config = {
  path: "/api/send-subscription-email",
};

// ── Templates ──────────────────────────────────────────────────────────────

function subscriptionWelcomeHtml() {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Welcome to FlatLabs Pro</title>
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
                    Membership&nbsp;·&nbsp;Active
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="padding:40px 36px 8px;">
              <div style="font-family:'JetBrains Mono',Courier,monospace;font-size:10px;font-weight:600;letter-spacing:2px;color:#FF6B57;text-transform:uppercase;margin-bottom:18px;">
                — Membership · Active
              </div>
              <h1 style="margin:0 0 12px;font-family:'Playfair Display',Georgia,serif;font-size:34px;font-weight:700;letter-spacing:-0.8px;line-height:1.1;color:#111111;">
                Welcome to FlatLabs Pro.
              </h1>
              <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:15px;line-height:1.6;color:#6B6B66;">
                Your Pro subscription is now active. Create factory-ready tech packs whenever you need them.
              </p>
            </td>
          </tr>

          <!-- WHAT'S INCLUDED -->
          <tr>
            <td style="padding:32px 36px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FCFCFA;border:1px solid #E8E8E3;border-radius:6px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <div style="font-family:'JetBrains Mono',Courier,monospace;font-size:10px;font-weight:600;letter-spacing:1.8px;color:#FF6B57;text-transform:uppercase;margin-bottom:12px;">
                      What's included
                    </div>
                    <table width="100%" cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#111111;line-height:1.55;">
                            <span style="color:#FF6B57;font-weight:700;margin-right:8px;">·</span>10 downloads per month
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#111111;line-height:1.55;">
                            <span style="color:#FF6B57;font-weight:700;margin-right:8px;">·</span>Unused downloads roll over (max 15)
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#111111;line-height:1.55;">
                            <span style="color:#FF6B57;font-weight:700;margin-right:8px;">·</span>Full download history in your account
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td style="padding:4px 0;">
                          <span style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#111111;line-height:1.55;">
                            <span style="color:#FF6B57;font-weight:700;margin-right:8px;">·</span>Priority access to new garment categories
                          </span>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- PRIMARY CTA -->
          <tr>
            <td style="padding:36px 36px 8px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="background:#111111;border-radius:6px;">
                    <a href="${BASE_URL}/app.html"
                       style="display:block;padding:16px 32px;font-family:'DM Sans',Arial,sans-serif;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:-0.1px;">
                      Start creating →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- SECONDARY CTA -->
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

          <!-- MANAGE NOTE -->
          <tr>
            <td style="padding:20px 36px 0;">
              <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:#6B6B66;line-height:1.6;">
                Manage or cancel your subscription anytime from your account.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="padding:36px 36px 32px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="border-top:1px solid #E8E8E3;">
                <tr>
                  <td style="padding-top:24px;">
                    <p style="margin:0 0 8px;font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:#6B6B66;line-height:1.6;">
                      Questions about your subscription?
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

function subscriptionWelcomeText() {
  return `Welcome to FlatLabs Pro.

Your Pro subscription is now active. Create factory-ready tech packs whenever you need them.

WHAT'S INCLUDED
· 10 downloads per month
· Unused downloads roll over (max 15)
· Full download history in your account
· Priority access to new garment categories

Start creating:
${BASE_URL}/app.html

View your account:
${BASE_URL}/login.html

Manage or cancel your subscription anytime from your account.

Questions about your subscription?
Reply to this email or write to flatsgenerator@gmail.com

— FlatLabs · flatsgenerator.com`;
}
