-- ============================================================================
-- FlatLabs — Consolidated database schema
-- ============================================================================
-- Generated 5 August 2026 from the live staging database structure
-- (information_schema.columns, pg_constraint, pg_indexes).
--
-- PURPOSE
-- This file is the single source of truth for the FlatLabs database. It
-- replaces the four one-off migration functions (add-invoice-guard-column,
-- add-magic-link-columns, add-pro-columns, add-tc-version-to-subs), which
-- can be deleted once this file is verified against a fresh database.
--
-- USAGE
-- Run once against an empty Postgres/Neon database. Safe to re-run: every
-- statement is idempotent (IF NOT EXISTS / ON CONFLICT DO NOTHING).
--
-- ORDER MATTERS
-- users and tc_versions are created first because downloads holds foreign
-- keys pointing at both. Creating downloads first fails.
-- ============================================================================


-- ============================================================================
-- 1. users — one row per email address, created on first download
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
  email                   text PRIMARY KEY,
  created_at              timestamptz DEFAULT now(),

  -- Legacy flag from the "one free download forever" era. Superseded by the
  -- rolling 30-day count in register-free-download.js, but still written for
  -- backward compatibility. Do not drop without auditing that function.
  free_download_used      boolean DEFAULT false,
  free_download_at        timestamptz,

  account_created_at      timestamptz,
  first_download_at       timestamptz,
  last_login_at           timestamptz,

  -- Pro subscription state. Dormant until Pro is activated (October 2026).
  is_pro                  boolean DEFAULT false,
  credits_remaining       integer DEFAULT 0,
  credits_rolled_over     integer DEFAULT 0,
  credits_reset_at        timestamptz
);


-- ============================================================================
-- 2. tc_versions — versioned Terms & Conditions
-- ============================================================================
-- MUST be populated before any download can be recorded: downloads holds a
-- foreign key to this table and inserts a hardcoded version string.
CREATE TABLE IF NOT EXISTS tc_versions (
  version                 text PRIMARY KEY,
  privacy_url             text,
  terms_url               text,
  effective_from          timestamptz DEFAULT now()
);


-- ============================================================================
-- 3. downloads — every SVG and Tech Pack delivered
-- ============================================================================
-- tier semantics:
--   'FREE'  free SVG downloads AND free-launch Tech Packs
--   'PRO'   paid downloads
--
-- Free SVGs and promo Tech Packs are NOT distinguished by tier — the CHECK
-- below only permits two values. They are told apart by stripe_session_id:
--   NULL              → free SVG download
--   'promo_...'       → Tech Pack granted during the free launch
--   'cs_...'          → real Stripe purchase
CREATE TABLE IF NOT EXISTS downloads (
  id                      serial PRIMARY KEY,
  user_email              text REFERENCES users(email) ON DELETE CASCADE,
  tier                    text NOT NULL,
  created_at              timestamptz DEFAULT now(),
  garment_config          jsonb,
  tc_version_accepted     text NOT NULL REFERENCES tc_versions(version),
  stripe_session_id       text,
  ip_hash                 text,
  download_token          text UNIQUE,
  used_at                 timestamptz,
  order_number            text UNIQUE,
  last_accessed_at        timestamptz,

  CONSTRAINT downloads_tier_check CHECK (tier = ANY (ARRAY['FREE'::text, 'PRO'::text]))
);

CREATE INDEX IF NOT EXISTS idx_downloads_email
  ON downloads USING btree (user_email);

CREATE INDEX IF NOT EXISTS idx_downloads_created
  ON downloads USING btree (created_at);

CREATE INDEX IF NOT EXISTS idx_downloads_order_number
  ON downloads USING btree (order_number);

-- Partial index: only rows that actually have a token are worth indexing.
CREATE INDEX IF NOT EXISTS idx_downloads_token
  ON downloads USING btree (download_token)
  WHERE (download_token IS NOT NULL);

-- Composite index backing the anti-abuse IP counter (20 per IP per 30 days).
CREATE INDEX IF NOT EXISTS idx_downloads_ip_tier_date
  ON downloads USING btree (ip_hash, tier, created_at)
  WHERE (ip_hash IS NOT NULL);


-- ============================================================================
-- 4. subscriptions — Pro tier (dormant until October 2026)
-- ============================================================================
-- Note: tc_version_accepted here is NOT NULL but carries NO foreign key,
-- unlike downloads. This asymmetry exists in the live database and is
-- reproduced deliberately rather than "corrected".
CREATE TABLE IF NOT EXISTS subscriptions (
  user_email              text PRIMARY KEY,
  stripe_subscription_id  text,
  stripe_customer_id      text,
  status                  text NOT NULL DEFAULT 'inactive',
  current_period_end      timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  updated_at              timestamptz NOT NULL DEFAULT now(),
  last_invoice_id         text,
  tc_version_accepted     text NOT NULL
);


-- ============================================================================
-- 5. sessions — logged-in sessions for /account.html
-- ============================================================================
CREATE TABLE IF NOT EXISTS sessions (
  session_id              text PRIMARY KEY,
  user_email              text NOT NULL,
  expires_at              timestamptz NOT NULL,
  created_at              timestamptz NOT NULL DEFAULT now(),
  last_activity_at        timestamptz NOT NULL DEFAULT now(),
  ip_hash                 text,
  user_agent              text
);

CREATE INDEX IF NOT EXISTS idx_sessions_email
  ON sessions USING btree (user_email);

CREATE INDEX IF NOT EXISTS idx_sessions_expires
  ON sessions USING btree (expires_at);


-- ============================================================================
-- 6. magic_links — passwordless login tokens
-- ============================================================================
CREATE TABLE IF NOT EXISTS magic_links (
  token                   text PRIMARY KEY,
  user_email              text NOT NULL,
  expires_at              timestamptz NOT NULL,
  used_at                 timestamptz,
  created_at              timestamptz NOT NULL DEFAULT now(),
  ip_hash                 text
);

CREATE INDEX IF NOT EXISTS idx_magic_links_email_expires
  ON magic_links USING btree (user_email, expires_at);


-- ============================================================================
-- 7. events — product analytics
-- ============================================================================
-- Written by track-event.js. Holds CTA attribution (src / cta) captured by
-- captureAttribution() in app.js.
CREATE TABLE IF NOT EXISTS events (
  id                      bigserial PRIMARY KEY,
  session_id              text NOT NULL,
  event_name              text NOT NULL,
  event_data              jsonb DEFAULT '{}'::jsonb,
  user_email              text,
  ip_hash                 text,
  app_version             text,
  created_at              timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_events_event_name
  ON events USING btree (event_name);

CREATE INDEX IF NOT EXISTS idx_events_session_id
  ON events USING btree (session_id);

CREATE INDEX IF NOT EXISTS idx_events_created_at
  ON events USING btree (created_at DESC);


-- ============================================================================
-- 8. SEED DATA — REQUIRED, NOT OPTIONAL
-- ============================================================================
-- Without this row, the very first download fails: create-free-techpack.js
-- and register-free-download.js both insert tc_version_accepted = '1.0',
-- and the foreign key on downloads rejects a version that does not exist.
--
-- Values below verified against the live staging database on 5 Aug 2026.
-- Version 1.0 has been effective since 5 May 2026. Note the /legal/ path —
-- these pages are NOT at the site root.
INSERT INTO tc_versions (version, privacy_url, terms_url)
VALUES ('1.0', '/legal/privacy.html', '/legal/terms.html')
ON CONFLICT (version) DO NOTHING;


-- ============================================================================
-- VERIFICATION — run after applying, expect 7 rows and 1 row
-- ============================================================================
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' ORDER BY table_name;
--
-- SELECT * FROM tc_versions;
-- ============================================================================
