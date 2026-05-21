/**
 * tracker.js — Neutral analytics layer
 * -------------------------------------
 * Single public API: track(eventName, eventData)
 *
 * Currently sends to our own DB via /api/track-event.
 * Designed so that switching to Plausible/PostHog/GA4 later
 * is a change inside this file only — not a refactor.
 *
 * Usage:
 *   import { track } from './js/tracker.js';
 *   track('landing_cta_clicked', { cta: 'start_now' });
 */

const APP_VERSION = "1.0";
const SESSION_KEY = "fl_session_id";
const ENDPOINT    = "/api/track-event";

// Detect localhost / dev environments to enable verbose logging
const IS_DEV = typeof window !== "undefined"
  && (window.location.hostname === "localhost"
   || window.location.hostname === "127.0.0.1"
   || window.location.hostname.endsWith(".local"));

/**
 * Get or create a session_id stored in sessionStorage.
 * sessionStorage clears when the tab closes — perfect for anonymous funnel
 * tracking without persistent user identifiers (GDPR friendly).
 */
function getSessionId() {
  let id = sessionStorage.getItem(SESSION_KEY);
  if (!id) {
    // 16 random bytes → 32 hex chars. Cryptographically random.
    const arr = new Uint8Array(16);
    crypto.getRandomValues(arr);
    id = Array.from(arr, b => b.toString(16).padStart(2, "0")).join("");
    sessionStorage.setItem(SESSION_KEY, id);
  }
  return id;
}

/**
 * Track an event. Fire-and-forget: never blocks the UI, never throws.
 *
 * @param {string} eventName  e.g. "step_completed", "checkout_started"
 * @param {object} [eventData={}] arbitrary metadata (kept small, <2KB)
 */
export function track(eventName, eventData = {}) {
  try {
    if (typeof eventName !== "string" || !eventName) return;

    const session_id  = getSessionId();
    const user_email  = localStorage.getItem("fl_user_email") || null;
    const payload = {
      session_id,
      event_name: eventName,
      event_data: eventData,
      user_email,
      app_version: APP_VERSION
    };

    if (IS_DEV) {
      console.log("[tracker]", eventName, eventData, "session:", session_id);
    }

    // fetch with keepalive=true survives the page being closed mid-request
    // (essential for events like "checkout_clicked" right before redirect)
    fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      keepalive: true
    }).catch(() => {
      // Silent: analytics must never break UX
    });

  } catch (e) {
    // Silent: never throw from tracker
    if (IS_DEV) console.warn("[tracker] error:", e);
  }
}

/**
 * Returns the current session id (useful for cross-page correlation).
 */
export function getSession() {
  return getSessionId();
}
