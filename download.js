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
  const frontSvgEl = document.getElementById('svg-preview')?.querySelector('svg');
  if (!frontSvgEl) {
    log('No SVG to download', 'warn');
    return;
  }
  const backSvgEl = document.getElementById('svg-preview-back')?.querySelector('svg');

  // Build a single combined SVG: front + (optional) back side by side
  const combinedSvg = _buildCombinedSvg(frontSvgEl, backSvgEl);

  const serializer = new XMLSerializer();
  let svgStr = serializer.serializeToString(combinedSvg);
  // Add XML declaration for clean download
  svgStr = '<?xml version="1.0" encoding="UTF-8"?>\n' + svgStr;

  const blob = new Blob([svgStr], { type: 'image/svg+xml' });
  const url  = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href     = url;
  a.download = `flatlabs-flat-${Date.now()}.svg`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  log('SVG downloaded', 'ok');
}

// ─── Combined SVG builder ─────────────────────────────────────────────────────
// Builds a single <svg> containing the front view + back view (if present)
// side by side, with a viewBox calculated from the actual content bounding box.
// Avoids id collisions in <defs> (e.g. clipPath ids) by prefixing back ids.
const _NS         = 'http://www.w3.org/2000/svg';
const VIEW_GAP    = 200;   // horizontal gap between front and back in SVG units
const PADDING_PCT = 0.05;  // 5% padding around the combined content

function _buildCombinedSvg(frontSvgEl, backSvgEl) {
  // Step 1: figure out the bounding boxes of each view's actual content
  // getBBox() only works on elements in the live DOM, so we read the originals
  // and clone afterwards.
  const frontBBox = frontSvgEl.getBBox();

  // Step 2: create combined SVG and a shared <defs>
  const combined = document.createElementNS(_NS, 'svg');
  combined.setAttribute('xmlns', _NS);

  const combinedDefs = document.createElementNS(_NS, 'defs');
  combined.appendChild(combinedDefs);

  // Copy front <defs> children into combined defs (no renaming needed)
  const frontDefs = frontSvgEl.querySelector('defs');
  if (frontDefs) {
    Array.from(frontDefs.childNodes).forEach(node => {
      combinedDefs.appendChild(node.cloneNode(true));
    });
  }

  // Copy front non-defs children directly into combined SVG
  Array.from(frontSvgEl.childNodes).forEach(node => {
    if (node.nodeType !== 1) return; // skip text nodes etc.
    if (node.tagName && node.tagName.toLowerCase() === 'defs') return;
    combined.appendChild(node.cloneNode(true));
  });

  // Step 3: if back exists, clone its content, rename ids to avoid collisions,
  // wrap in a translate(), and append
  let combinedBBox = { x: frontBBox.x, y: frontBBox.y, width: frontBBox.width, height: frontBBox.height };

  if (backSvgEl) {
    const backBBox = backSvgEl.getBBox();

    // Translate back so its left edge starts at frontBBox.right + GAP
    const translateX = (frontBBox.x + frontBBox.width + VIEW_GAP) - backBBox.x;

    // Process back defs — rename clipPath ids to avoid collisions
    const backDefs = backSvgEl.querySelector('defs');
    const idMap = new Map(); // oldId -> newId

    if (backDefs) {
      Array.from(backDefs.childNodes).forEach(node => {
        if (node.nodeType !== 1) return;
        const clone = node.cloneNode(true);
        const oldId = clone.getAttribute('id');
        if (oldId) {
          const newId = 'back_' + oldId;
          clone.setAttribute('id', newId);
          idMap.set(oldId, newId);
        }
        combinedDefs.appendChild(clone);
      });
    }

    // Append back content directly, applying translate to each top-level group
    // (avoids an extra unnamed wrapper that shows up as "<Group>" in Illustrator)
    Array.from(backSvgEl.childNodes).forEach(node => {
      if (node.nodeType !== 1) return;
      if (node.tagName && node.tagName.toLowerCase() === 'defs') return;
      const clone = node.cloneNode(true);
      // Update any clip-path references that point to renamed ids
      _remapClipPathRefs(clone, idMap);
      // Apply translate directly to the cloned group (e.g. <g id="back">)
      const existingTransform = clone.getAttribute('transform') || '';
      const newTransform = `translate(${translateX}, 0) ${existingTransform}`.trim();
      clone.setAttribute('transform', newTransform);
      combined.appendChild(clone);
    });

    // Update combined bounding box to include translated back
    const translatedBackX = backBBox.x + translateX;
    const combinedRight   = Math.max(frontBBox.x + frontBBox.width, translatedBackX + backBBox.width);
    const combinedBottom  = Math.max(frontBBox.y + frontBBox.height, backBBox.y + backBBox.height);
    const combinedTop     = Math.min(frontBBox.y, backBBox.y);
    const combinedLeft    = Math.min(frontBBox.x, translatedBackX);

    combinedBBox = {
      x:      combinedLeft,
      y:      combinedTop,
      width:  combinedRight - combinedLeft,
      height: combinedBottom - combinedTop,
    };
  }

  // Step 4: calculate viewBox with padding
  const padX = combinedBBox.width  * PADDING_PCT;
  const padY = combinedBBox.height * PADDING_PCT;
  combined.setAttribute('viewBox',
    `${combinedBBox.x - padX} ${combinedBBox.y - padY} ${combinedBBox.width + padX * 2} ${combinedBBox.height + padY * 2}`
  );

  return combined;
}

// Walks a subtree and rewrites any clip-path="url(#oldId)" attribute
// to the new id from the map. Needed when copying back content into the
// combined SVG (back clipPath ids get prefixed with "back_" to avoid collision).
function _remapClipPathRefs(rootEl, idMap) {
  if (!idMap || idMap.size === 0) return;
  const all = rootEl.querySelectorAll ? Array.from(rootEl.querySelectorAll('*')) : [];
  [rootEl, ...all].forEach(el => {
    if (!el.getAttribute) return;
    const ref = el.getAttribute('clip-path');
    if (!ref) return;
    const match = ref.match(/url\(#([^)]+)\)/);
    if (match && idMap.has(match[1])) {
      el.setAttribute('clip-path', `url(#${idMap.get(match[1])})`);
    }
  });
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
      // Show Tech Pack upsell after successful free download (slight delay so file download initiates first)
      setTimeout(() => {
        document.getElementById('postDownloadUpsell')?.classList.add('show');
      }, 1500);
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
