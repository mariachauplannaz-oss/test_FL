import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.EMAIL_FROM || "noreply@flatsgenerator.com";
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

  const { email, token } = body;

  if (!email || !token) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const magicUrl = `${BASE_URL}/api/verify-magic-link?token=${token}`;

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Sign in to FlatLabs",
      html: magicLinkEmailHtml({ magicUrl }),
      text: magicLinkEmailText({ magicUrl }),
    });
  } catch (err) {
    console.error("send-magic-link-email: Resend error:", err.message);
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
  path: "/api/send-magic-link-email",
};

// ── Templates ──────────────────────────────────────────────────────────────

function magicLinkEmailHtml({ magicUrl }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Sign in to FlatLabs</title>
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
              <span style="font-family:'DM Sans',Arial,sans-serif;font-size:18px;font-weight:700;letter-spacing:-0.4px;color:#111111;">Flat</span><span style="font-family:'DM Sans',Arial,sans-serif;font-size:18px;font-weight:700;letter-spacing:-0.4px;color:#FF6B57;">Labs</span>
            </td>
          </tr>

          <!-- HERO -->
          <tr>
            <td style="padding:40px 36px 8px;">
              <div style="font-family:'JetBrains Mono',Courier,monospace;font-size:10px;font-weight:600;letter-spacing:2px;color:#FF6B57;text-transform:uppercase;margin-bottom:18px;">
                — Sign In · Magic Link
              </div>
              <h1 style="margin:0 0 12px;font-family:'Playfair Display',Georgia,serif;font-size:34px;font-weight:700;letter-spacing:-0.8px;line-height:1.1;color:#111111;">
                Sign in to FlatLabs.
              </h1>
              <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:15px;line-height:1.6;color:#6B6B66;">
                Click the link below to sign in to your account.
              </p>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:36px 36px 8px;">
              <table cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td align="center" style="background:#111111;border-radius:6px;">
                    <a href="${magicUrl}"
                       style="display:block;padding:16px 32px;font-family:'DM Sans',Arial,sans-serif;font-size:15px;font-weight:600;color:#FFFFFF;text-decoration:none;letter-spacing:-0.1px;">
                      Sign in →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- EXPIRY NOTICE -->
          <tr>
            <td style="padding:20px 36px 0;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#FCFCFA;border:1px solid #E8E8E3;border-radius:6px;">
                <tr>
                  <td style="padding:16px 18px;">
                    <div style="font-family:'JetBrains Mono',Courier,monospace;font-size:10px;font-weight:600;letter-spacing:1.8px;color:#FF6B57;text-transform:uppercase;margin-bottom:6px;">
                      Security
                    </div>
                    <div style="font-family:'DM Sans',Arial,sans-serif;font-size:14px;color:#111111;line-height:1.55;">
                      This link expires in <strong style="font-weight:600;">15 minutes</strong> for security. It can only be used once.
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
                <a href="${magicUrl}" style="color:#111111;text-decoration:underline;text-decoration-color:#FF6B57;">
                  ${magicUrl}
                </a>
              </div>
            </td>
          </tr>

          <!-- SECURITY NOTICE -->
          <tr>
            <td style="padding:28px 36px 0;">
              <p style="margin:0;font-family:'DM Sans',Arial,sans-serif;font-size:13px;color:#6B6B66;line-height:1.6;">
                If you didn't request this, you can safely ignore this email. Your account is secure.
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
                      Need help signing in?
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

function magicLinkEmailText({ magicUrl }) {
  return `Sign in to FlatLabs.

Click the link below to sign in to your account:
${magicUrl}

SECURITY
This link expires in 15 minutes for security. It can only be used once.

If you didn't request this, you can safely ignore this email. Your account is secure.

Need help signing in?
Reply to this email or write to flatsgenerator@gmail.com

— FlatLabs · flatsgenerator.com`;
}
