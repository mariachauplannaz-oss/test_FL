// ═══ lib/email.js — Shared email validation helpers ═══
// A plain module, not a Netlify Function: no default export handler and no
// `config` export, so it never gets deployed as its own endpoint. Imported
// by register-free-download.js and create-free-techpack.js.

import { resolveMx } from "node:dns/promises";

// Same regex already used in register-free-download.js.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const MX_LOOKUP_TIMEOUT_MS = 2000;

// Known throwaway/disposable email providers. Plain array so it can be
// extended later without touching validation logic.
export const DISPOSABLE_DOMAINS = [
  "mailinator.com",
  "yopmail.com",
  "yopmail.fr",
  "yopmail.net",
  "guerrillamail.com",
  "guerrillamail.info",
  "guerrillamail.biz",
  "guerrillamail.de",
  "guerrillamail.net",
  "guerrillamail.org",
  "grr.la",
  "10minutemail.com",
  "10minutemail.net",
  "10minutemail.co.za",
  "tempmail.com",
  "temp-mail.org",
  "temp-mail.io",
  "tempmail.net",
  "throwawaymail.com",
  "getnada.com",
  "trashmail.com",
  "fakeinbox.com",
  "sharklasers.com",
  "maildrop.cc",
  "dispostable.com",
  "mailnesia.com",
  "mytemp.email",
  "moakt.com",
  "emailondeck.com",
  "spamgourmet.com",
  "mohmal.com",
  "inboxkitten.com",
  "mailcatch.com",
  "mintemail.com",
  "discard.email",
  "discardmail.com",
  "spam4.me",
  "trbvm.com",
  "tempinbox.com",
  "anonbox.net",
  "burnermail.io",
  "crazymailing.com",
  "emailfake.com",
  "fakemailgenerator.com",
  "harakirimail.com",
  "jetable.org",
  "mailexpire.com",
  "mailsac.com",
  "mytrashmail.com",
  "no-spam.ws",
  "spambog.com",
  "tempr.email",
  "tmpmail.org",
  "tmpeml.com",
];

// Trims/lowercases every address. Gmail and Googlemail additionally strip
// dots and "+tag" from the local part — those are the same inbox, and
// leaving them intact would let one person bypass the download limit
// indefinitely. Other providers keep their dots/plus-addressing untouched,
// since for many of them those genuinely are different addresses.
export function normalizeEmail(raw) {
  if (typeof raw !== "string") return "";

  const trimmed = raw.trim().toLowerCase();
  const atIdx = trimmed.lastIndexOf("@");
  if (atIdx === -1) return trimmed;

  const local = trimmed.slice(0, atIdx);
  const domain = trimmed.slice(atIdx + 1);

  if (domain === "gmail.com" || domain === "googlemail.com") {
    const plusIdx = local.indexOf("+");
    const localNoTag = plusIdx === -1 ? local : local.slice(0, plusIdx);
    const localNoDots = localNoTag.replace(/\./g, "");
    return `${localNoDots}@${domain}`;
  }

  return `${local}@${domain}`;
}

export function isDisposableDomain(email) {
  if (typeof email !== "string") return false;
  const atIdx = email.lastIndexOf("@");
  if (atIdx === -1) return false;
  const domain = email.slice(atIdx + 1).toLowerCase();
  return DISPOSABLE_DOMAINS.includes(domain);
}

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("MX lookup timed out")), ms);
    promise.then(
      (val) => { clearTimeout(timer); resolve(val); },
      (err) => { clearTimeout(timer); reject(err); }
    );
  });
}

// Runs syntax -> disposable -> MX checks in order, stopping at the first
// failure. MX failures other than a definitive "no mail server" (timeouts,
// resolver errors) fail OPEN on purpose — a transient DNS problem on our
// side must never block a legitimate user.
export async function validateEmail(email) {
  const normalized = normalizeEmail(email);

  if (!EMAIL_REGEX.test(normalized)) {
    return { ok: false, reason: "invalid_format" };
  }

  if (isDisposableDomain(normalized)) {
    return { ok: false, reason: "disposable" };
  }

  const domain = normalized.slice(normalized.lastIndexOf("@") + 1);

  try {
    const records = await withTimeout(resolveMx(domain), MX_LOOKUP_TIMEOUT_MS);
    if (!records || records.length === 0) {
      return { ok: false, reason: "no_mx" };
    }
  } catch (err) {
    if (err && (err.code === "ENOTFOUND" || err.code === "ENODATA")) {
      return { ok: false, reason: "no_mx" };
    }
    console.warn(`validateEmail: MX lookup failed for domain "${domain}", failing open:`, err.message);
  }

  return { ok: true, email: normalized };
}
