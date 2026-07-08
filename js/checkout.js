import { track } from '../tracker.js';
import { getProductConfig } from './config/pricing.js';
import { PRINT_METHODS } from '../config/print-zones.js';

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
      garment:    checkoutState.garment,
      selections: checkoutState.selections,
      gender:     checkoutState.gender,
      fabric:     checkoutState.fabric,
      stitchType: checkoutState.stitchType,
      needle:     checkoutState.needle,
      thread:     checkoutState.thread,
      careLabel:  checkoutState.careLabel,
      brandLabel: checkoutState.brandLabel,
      // brandLabelQty and colorHex are shortened to `qty`/`hex` (colorHex's
      // leading '#' stripped too) here in the compressed metadata only —
      // state.brandLabelQty/state.colorHex keep their full names everywhere
      // else. Needed to stay under Stripe's 500-char limit: measured real
      // worst case (6 zones w/ method+image, all other fields maxed) is
      // 508 chars with the full key names, 492 with these two shortened.
      qty: checkoutState.brandLabelQty,
      hex: (checkoutState.colorHex || '').replace('#', ''),
      // Stripe metadata values are capped at 500 chars — full print.placements
      // objects (and especially image dataURIs) blow way past that. Each zone
      // is packed as a positional [zone, methodCode, image_key] tuple (no key
      // names, 2-letter method code) to stay under budget: worst case (6
      // zones, all with method+image) measures ~489 chars. app.js decodes
      // this back into full placements on restore, fetching each image from
      // Netlify Blobs via image_key. NOTE: offsetX_pct/offsetY_pct/scale do
      // NOT survive this round-trip — even this maximally compact encoding
      // has no room left for position data — so restored images reset to
      // centered/scale=1.0. See app.js.
      print: checkoutState.print && checkoutState.print.enabled
        ? { enabled: true, zones: checkoutState.print.placements.map(p => ([
              p.zone,
              PRINT_METHODS[p.method]?.code || null,
              p.image?.blob_key || null
          ])) }
        : { enabled: false }
    };

    const response = await fetch('/api/create-checkout', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: checkoutEmail.value.trim(),
        garment_config: garmentConfig,
        product_key: productKey
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
