import { track } from '../tracker.js';
import { getProductConfig } from './config/pricing.js';

// ─── Read context from URL + sessionStorage ───────────────────────────────────

const params     = new URLSearchParams(window.location.search);
const productKey = params.get('product'); // e.g. "techpack_tshirt"
const stateRaw   = sessionStorage.getItem('flatlabs_checkout_state');

// Guard: invalid access → back to app
if (!productKey || !stateRaw) {
  window.location.href = '/app.html';
  throw new Error('Invalid checkout state — redirecting to app');
}

const checkoutState = JSON.parse(stateRaw);
// checkoutState: { garment, selections, gender, fabric, stitchType, needle, thread, careLabel, brandLabel, brandLabelQty }

// Derive type + garment from product_key
// "techpack_tshirt" → type: "techpack", garment: "tshirt"
// "svg_pants"       → type: "svg",      garment: "pants"
const underscoreIdx = productKey.indexOf('_');
const type    = productKey.slice(0, underscoreIdx);           // "techpack" | "svg"
const garment = productKey.slice(underscoreIdx + 1);          // "tshirt" | "pants" etc.

// Validate product exists and is enabled
const productCfg = getProductConfig(garment, type);
if (!productCfg) {
  const errEl = document.getElementById('checkoutError');
  errEl.textContent = 'This product is not currently available.';
  errEl.hidden = false;
  document.getElementById('btnPay').disabled = true;
}

// ─── Render page content ──────────────────────────────────────────────────────

function renderPage() {
  const titles = {
    'techpack_tshirt': 'Tech Pack PDF — T-Shirt',
    'techpack_pants':  'Tech Pack PDF — Pants',
    'techpack_hoodie': 'Tech Pack PDF — Hoodie',
    'svg_pants':       'SVG Flat — Pants',
    'svg_hoodie':      'SVG Flat — Hoodie'
  };

  const prices = {
    'techpack_tshirt': '10,00 €'
  };

  document.getElementById('productTitle').textContent = titles[productKey] || productKey;
  document.getElementById('productPrice').textContent = prices[productKey] || '—';

  // Inject design preview captured before redirect (from app.js doExportTechPack)
  const previewEl = document.getElementById('flatPreview');
  const previewPng = sessionStorage.getItem('flatlabs_preview_png');
  if (previewPng) {
    const img = document.createElement('img');
    img.src = previewPng;
    img.alt = 'Your design preview';
    previewEl.innerHTML = '';
    previewEl.appendChild(img);
    previewEl.classList.add('has-preview');
  }
  // If no PNG in sessionStorage, leave element empty — checkout.html CSS shows the
  // dashed-border "Flat preview" placeholder via :empty pseudo-class.
}

renderPage();

// ─── Form validation ──────────────────────────────────────────────────────────

const acceptTerms   = document.getElementById('acceptTerms');
const acceptPrivacy = document.getElementById('acceptPrivacy');
const checkoutEmail = document.getElementById('checkoutEmail');
const btnPay        = document.getElementById('btnPay');

function validateForm() {
  const valid = acceptTerms.checked &&
                acceptPrivacy.checked &&
                checkoutEmail.value.includes('@');
  btnPay.disabled = !valid;
}

acceptTerms.addEventListener('change', validateForm);
acceptPrivacy.addEventListener('change', validateForm);
checkoutEmail.addEventListener('input', validateForm);

// ─── Pay handler ──────────────────────────────────────────────────────────────

btnPay.addEventListener('click', async () => {
  btnPay.disabled    = true;
  btnPay.textContent = 'Loading...';

  const errEl = document.getElementById('checkoutError');
  errEl.hidden = true;

  // Track checkout initiated (user clicked Pay, before Stripe redirect)
  track('checkout_started', { product_key: productKey, garment, type });
  
  try {
    const garmentConfig = {
      garment:       checkoutState.garment,
      selections:    checkoutState.selections,
      gender:        checkoutState.gender,
      fabric:        checkoutState.fabric,
      stitchType:    checkoutState.stitchType,
      needle:        checkoutState.needle,
      thread:        checkoutState.thread,
      careLabel:     checkoutState.careLabel,
      brandLabel:    checkoutState.brandLabel,
      brandLabelQty: checkoutState.brandLabelQty,
      colorHex:      checkoutState.colorHex,
      // Print placements keep their full shape — offset/scale included —
      // since this is stored in a Netlify Blob, not Stripe metadata. Only
      // the image dataURI is dropped (blob_key is enough to re-fetch it via
      // /api/get-print-image post-payment — see app.js).
      print: checkoutState.print && checkoutState.print.enabled
        ? { enabled: true, placements: checkoutState.print.placements.map(p => ({
              side: p.side, mode: p.mode, zone: p.zone,
              x_cm: p.x_cm, y_cm: p.y_cm, width_cm: p.width_cm, height_cm: p.height_cm,
              method: p.method, colors: p.colors,
              image: p.image ? {
                filename:    p.image.filename,
                ratio:       p.image.ratio,
                blob_key:    p.image.blob_key || null,
                offsetX_pct: p.image.offsetX_pct,
                offsetY_pct: p.image.offsetY_pct,
                scale:       p.image.scale
              } : null
          })) }
        : { enabled: false }
    };

    // Save the full config to a blob and get back a short key — Stripe
    // metadata is capped at 500 chars, so metadata only ever carries this
    // key, never the config itself.
    const saveResponse = await fetch('/api/save-checkout-config', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(garmentConfig)
    });
    const saveData = await saveResponse.json();
    if (!saveData.ok) throw new Error(saveData.error || 'Failed to save checkout config');

    const response = await fetch('/api/create-checkout', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: checkoutEmail.value.trim(),
        product_key: productKey,
        config_key: saveData.config_key
      })
    });

    const data = await response.json();

    if (!data.ok) throw new Error(data.error || 'Checkout failed');

    // Redirect to Stripe Checkout
    window.location.href = data.url;

  } catch (err) {
    console.error('Checkout error:', err);
    errEl.textContent = err.message;
    errEl.hidden      = false;
    btnPay.disabled    = false;
    btnPay.textContent = 'Pay 10€ →';
  }
});
