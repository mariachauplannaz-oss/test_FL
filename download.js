// ═══ download.js — FREE SVG download flow with backend gating ═══

import { track } from './tracker.js';
import { MANNEQUIN_CFG } from './config.js';
const LS_EMAIL_KEY = 'fl_user_email';

// ─── Public exports (app.js imports these — signatures must not change) ───────

export function downloadSVG(state, log) {
  const savedEmail = localStorage.getItem(LS_EMAIL_KEY);

  if (savedEmail) {
    // Email already known — go straight to backend validation
    log(`Email found in localStorage: ${savedEmail}`, 'info');
    _registerFreeDownload(savedEmail, state, log);
  } else {
    // Show email modal — user must provide email + accept T&C
    _showEmailModal();
  }
}

export function handleEmailSubmit(event, state, log) {
  event.preventDefault();

  const email    = document.getElementById('emailInput')?.value.trim() || '';
  const accepted = document.getElementById('emailAcceptTC')?.checked;
  const errEl    = document.getElementById('emailModalError');

  // Clear previous error
  if (errEl) { errEl.textContent = ''; errEl.hidden = true; }

  // Validate
  if (!email.includes('@')) {
    _showModalError('Please enter a valid email address.');
    return;
  }
  if (!accepted) {
    _showModalError('Please accept the Terms and Privacy Policy to continue.');
    return;
  }

  _registerFreeDownload(email, state, log);
}

export function triggerDownload(state, log) {
  // Actual SVG export — called only after backend confirms 'allowed'
  const svgEl = document.getElementById('svg-preview')?.querySelector('svg');
  if (!svgEl) {
    log('No SVG to download', 'warn');
    return;
  }

  const cfg        = MANNEQUIN_CFG[state.currentMannequin] || {};
  const exportVB   = cfg.exportViewBox || svgEl.getAttribute('viewBox') || '0 0 800 800';
  const clone      = svgEl.cloneNode(true);
  clone.setAttribute('viewBox', exportVB);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

  const serializer = new XMLSerializer();
  const svgStr     = serializer.serializeToString(clone);
  const blob       = new Blob([svgStr], { type: 'image/svg+xml' });
  const url        = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href     = url;
  a.download = `flatlabs-flat-${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  log('SVG downloaded', 'ok');
}

// No-op — skip is no longer allowed. Kept to avoid breaking imports.
export function skipEmail(state, log) {
  console.warn('[FlatLabs ⚠] skipEmail called but skip is disabled. No action taken.');
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

function _showEmailModal() {
  const modal = document.getElementById('emailModal');
  if (modal) modal.classList.add('show');
}

function _hideEmailModal() {
  const modal = document.getElementById('emailModal');
  if (modal) modal.classList.remove('show');
}

function _showModalError(message) {
  const errEl = document.getElementById('emailModalError');
  if (errEl) {
    errEl.textContent = message;
    errEl.hidden = false;
  }
}

async function _registerFreeDownload(email, state, log) {
  const garment_config = {
    garment:    state.selectedCategory || 'tshirt',
    selections: state.selections,
    gender:     state.gender,
    fabric:     state.fabric,
    stitchType: state.stitchType,
  };

  try {
    const response = await fetch('/api/register-free-download', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ email, garment_config, accepted_tc: true }),
    });

    const data = await response.json();

    if (!response.ok) {
      // 400 / 500 — show error in modal
      _showEmailModal();
      _showModalError(data.error || 'Something went wrong. Please try again.');
      return;
    }

    if (data.status === 'allowed') {
      localStorage.setItem(LS_EMAIL_KEY, email);
      track('email_submitted', { outcome: 'allowed' });
      _hideEmailModal();
      log('Free download approved', 'ok');
      triggerDownload(state, log);
      return;
    }

    if (data.status === 'already_used_free') {
      localStorage.setItem(LS_EMAIL_KEY, email); // remember them anyway
      track('email_submitted', { outcome: 'already_used' });
      _hideEmailModal();
      log('Email already used free download — showing upsell', 'warn');
      document.getElementById('alreadyUsedModal')?.classList.add('show');
      return;
    }

    if (data.status === 'ip_blocked') {
      track('email_submitted', { outcome: 'ip_blocked' });
      _hideEmailModal();
      log('IP blocked — showing block modal', 'warn');
      document.getElementById('ipBlockedModal')?.classList.add('show');
      return;
    }

    // Unknown status — surface as error
    _showEmailModal();
    _showModalError('Unexpected response. Please try again.');

  } catch (err) {
    log(`register-free-download network error: ${err.message}`, 'err');
    _showEmailModal();
    _showModalError('Network error. Please check your connection and try again.');
  }
}
