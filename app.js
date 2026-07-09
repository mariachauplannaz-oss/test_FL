// ═══ app.js — Main entry point, connects all modules ═══

import { MANNEQUIN_CFG } from './config.js';
import { parseSVG } from './parser.js';
import { generate } from './generator.js';
import { track } from './tracker.js';
import { initCategories, goStep, updateButton, buildStep1, buildStep2, buildStep4, initToggles, toggleSidebar, closeSidebar, setIsoMode, awaitPendingUploads, getMissingMethodZones } from './ui.js';
import { downloadSVG, triggerDownload, handleEmailSubmit } from './download.js';
import { exportSpecSheet } from './specsheet.js';
import { showTooltip, hideTooltip, openInfoPanel, closeInfoPanel } from './infoPanel.js';
import { updatePrintZones } from './print-renderer.js';
import { PRINT_ZONES, PRINT_METHODS } from './config/print-zones.js';

window.showTooltip    = showTooltip;
window.hideTooltip    = hideTooltip;
window.openInfoPanel  = openInfoPanel;
window.closeInfoPanel = closeInfoPanel;

// ═══ STATE ═══
const state = {
    currentStep: 0,
    selectedCategory: null,
    currentMannequin: 'iso',
    svgData: null,
    selections: { torso: null, neck: null, sleeve: null },
    emailCaptured: false,
    ui: {
        step3BasicCollapsed:    false,
        step3AdvancedCollapsed: true,
        step4ArtworkCollapsed:  false,
        printActiveSide:        'front',
        printShowValidation:    false
    },
    fabric:        'jersey_180',
    stitchType:    'overlock_4t',
    needle:        'ballpoint_80_12',
    thread:        'poly_tex_27',
    careLabel:     'woven',
    brandLabel:    'woven',
    brandLabelQty: 1,
    gender: 'female',
    print: {
        enabled: false,
        placements: []
        // Each placement: { side, mode:'zone', zone (key from PRINT_ZONES),
        //   x_cm, y_cm, width_cm, height_cm,
        //   image: null,   // Level 2
        //   method: null,  // Level 3
        //   colors: []     // Level 3
        // }
    }
};
const svgCache = {};

// ═══ LOGGER (console only, no UI) ═══
function log(m, t='info') {
    const prefix = t === 'ok' ? '✓' : t === 'err' ? '✗' : t === 'warn' ? '⚠' : 'ℹ';
    console.log(`[FlatLabs ${prefix}] ${m}`);
}

// ═══ LOAD SVG ═══
async function loadSVG() {
    const cfg  = MANNEQUIN_CFG[state.currentMannequin];
    const file = cfg.file;

    if (svgCache[file]) {
        state.svgData = parseSVG(svgCache[file]);
        log(`Loaded ${state.currentMannequin} (cached): F=${Object.keys(state.svgData.front.torsos).length}T ${Object.keys(state.svgData.front.necks).length}N ${Object.keys(state.svgData.front.sleeves).length}S | B=${Object.keys(state.svgData.back.torsos).length}T`, 'ok');
        return;
    }

    try {
        const resp = await fetch(file);
        if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
        const svgText = await resp.text();
        svgCache[file] = svgText;
        state.svgData  = parseSVG(svgText);
        log(`Loaded ${state.currentMannequin}: F=${Object.keys(state.svgData.front.torsos).length}T ${Object.keys(state.svgData.front.necks).length}N ${Object.keys(state.svgData.front.sleeves).length}S | B=${Object.keys(state.svgData.back.torsos).length}T`, 'ok');
    } catch(err) {
        log(`Failed to load ${file}: ${err.message}`, 'err');
    }
}

// ═══ NAVIGATION ═══
function doUpdateButton() { updateButton(state); }

function nextAction() {
    if (state.currentStep === 0) {
        goStep(1, state, doUpdateButton);
        buildStep1(state);
    } else if (state.currentStep === 1 && state.currentMannequin === 'iso') {
        goStep(2, state, doUpdateButton);
        buildStep2(state);
    } else if (state.currentStep === 2) {
        goStep(3, state, doUpdateButton);
        buildStep4(state);
    } else {
        const missing = [];
        if (!state.selections.torso) missing.push('Torso');
        if (!state.selections.neck)  missing.push('Neckline');
        if (missing.length > 0) {
            alert(`⚠ Please select: ${missing.join(' and ')}`);
            return;
        }

        // Zones with uploaded artwork but no print method chosen would
        // otherwise reach the PDF silently marked "TBD" — block Generate
        // and point at exactly which zone(s) need a method.
        if (getMissingMethodZones(state).length > 0) {
            state.ui.printShowValidation = true;
            buildStep4(state);
            return;
        }
        state.ui.printShowValidation = false;

        generate(state, log);
        updatePrintZones(state);
        if (window.innerWidth <= 800) closeSidebar();
    }
}

// ═══ DOWNLOAD WRAPPERS ═══
function doDownload()      { downloadSVG(state, log); }
function doTriggerDownload() { triggerDownload(state, log); }
function doEmailSubmit(e)  { handleEmailSubmit(e, state, log); }

// Captures the current front-view SVG canvas as a PNG dataURL.
// Returns null if capture fails — caller must handle gracefully.
async function captureCanvasAsPNG() {
    const svgEl = document.querySelector('#svg-preview svg');
    if (!svgEl) return null;

    const svgString = new XMLSerializer().serializeToString(svgEl);
    const viewBox = svgEl.viewBox.baseVal;
    const width = viewBox.width || 600;
    const height = viewBox.height || 800;

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    try {
        const img = new Image();
        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error('SVG image load failed'));
            img.src = svgUrl;
        });

        // Render at 2x for retina; cap at 800px on longest side to keep sessionStorage <500KB
        const longest = Math.max(width, height);
        const scale = Math.min(800 / longest, 2);
        const canvas = document.createElement('canvas');
        canvas.width = Math.round(width * scale);
        canvas.height = Math.round(height * scale);
        const ctx = canvas.getContext('2d');

        // White background (better contrast for the garment + clean look)
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        return canvas.toDataURL('image/png');
    } finally {
        URL.revokeObjectURL(svgUrl);
    }
}

// CHANGE 1 — doExportTechPack now saves state and redirects to /checkout.html
async function doExportTechPack() {
    // Guard: require completed design before purchasing
    if (!state.selections.torso || !state.selections.neck) {
        alert('⚠ Please complete your design before purchasing the Tech Pack.');
        return;
    }

    // Capture preview PNG (best-effort, non-blocking on failure)
    try {
        const previewPng = await captureCanvasAsPNG();
        if (previewPng) {
            sessionStorage.setItem('flatlabs_preview_png', previewPng);
        } else {
            sessionStorage.removeItem('flatlabs_preview_png');
        }
    } catch (err) {
        console.warn('Preview capture failed (non-blocking):', err);
        sessionStorage.removeItem('flatlabs_preview_png');
    }

    // Safety net: uploads fire-and-forget the moment an image is picked (see
    // ui.js), so this is usually already resolved — but a slow upload could
    // still be in flight right when the user clicks through to checkout, and
    // js/checkout.js needs placement.image.blob_key to be populated.
    await awaitPendingUploads();

    // Save full state to sessionStorage so /checkout.html can read it
    sessionStorage.setItem('flatlabs_checkout_state', JSON.stringify({
        garment:      state.selectedCategory || 'tshirt',
        selections:   state.selections,
        gender:       state.gender,
        fabric:       state.fabric,
        stitchType:   state.stitchType,
        needle:       state.needle,
        thread:       state.thread,
        careLabel:    state.careLabel,
        brandLabel:   state.brandLabel,
        brandLabelQty: state.brandLabelQty,
        colorHex:     state.colorHex,
        print:        state.print
    }));

    // Redirect to checkout page
    window.location.href = '/checkout.html?product=techpack_tshirt';
}

// CHANGE 2 — doConfirmTechPack removed (no longer used — PDF generated post-payment via handlePaymentReturn)

// CHANGE 4 — Handle return from Stripe payment
async function handlePaymentReturn() {
    const params        = new URLSearchParams(window.location.search);
    const paymentStatus = params.get('payment');
    const sessionId     = params.get('session_id');

    if (paymentStatus === 'cancelled') {
        log('Payment cancelled by user', 'warn');
        window.history.replaceState({}, '', '/app.html');
        return;
    }

    if (paymentStatus !== 'success' || !sessionId) {
        return; // No payment to handle — normal app load
    }

 log('Payment success, verifying token...', 'info');

    // Retry with backoff: Stripe can redirect to success_url BEFORE its webhook
    // has written the download_token row to the DB. A single fetch would fail and
    // wrongly show "contact support" to a customer who just paid. We retry a few
    // times to let the webhook land before surfacing any error. We only retry on
    // failure (never after ok:true), so a single-use token is never double-consumed.
    const VERIFY_MAX_ATTEMPTS   = 3;
    const VERIFY_RETRY_DELAY_MS = 2000;

    let data      = null;
    let lastError = null;

    for (let attempt = 1; attempt <= VERIFY_MAX_ATTEMPTS; attempt++) {
        try {
            const response = await fetch('/api/verify-token', {
                method:  'POST',
                headers: { 'Content-Type': 'application/json' },
                body:    JSON.stringify({ session_id: sessionId })
            });
            const json = await response.json();
            if (json.ok) {
                data = json;
                break; // verified — exit retry loop
            }
            lastError = new Error(json.error || 'Token verification failed');
        } catch (err) {
            lastError = err; // network/parse error — also retryable (webhook may still land)
        }

        // Not verified yet. If attempts remain, wait then retry (overlay stays up).
        if (attempt < VERIFY_MAX_ATTEMPTS) {
            log(`verify-token attempt ${attempt}/${VERIFY_MAX_ATTEMPTS} not ready, retrying in ${VERIFY_RETRY_DELAY_MS}ms...`, 'warn');
            await new Promise(resolve => setTimeout(resolve, VERIFY_RETRY_DELAY_MS));
        }
    }

    // All attempts exhausted without a verified token → genuine failure
    if (!data) {
        log(`Payment verification failed after ${VERIFY_MAX_ATTEMPTS} attempts: ${lastError?.message}`, 'err');
        alert(`Payment verification error: ${lastError?.message || 'Unknown error'}\n\nIf you were charged, please contact support.`);
        const ol = document.getElementById('paymentOverlay');
        if (ol) ol.style.display = 'none';
        return;
    }

    try {
        log('Token verified, payment confirmed', 'ok');

        // Restore state from server-validated garment_config
        const cfg = data.garment_config;
        if (cfg && cfg.selections) {
            state.selections = cfg.selections;
            state.gender     = cfg.gender     || state.gender;
            if (cfg.fabric)       state.fabric       = cfg.fabric;
            if (cfg.stitchType)   state.stitchType   = cfg.stitchType;
            if (cfg.needle)       state.needle       = cfg.needle;
            if (cfg.thread)       state.thread       = cfg.thread;
            if (cfg.careLabel)    state.careLabel    = cfg.careLabel;
            if (cfg.brandLabel)   state.brandLabel   = cfg.brandLabel;
            if (cfg.qty)          state.brandLabelQty = cfg.qty;
            if (cfg.hex)          state.colorHex     = '#' + cfg.hex;
            if (cfg.print)         state.print         = cfg.print;

            // Expand compressed print format. Stripe metadata packs each zone
            // as a positional [zone, methodCode, image_key] tuple (no key
            // names, 2-letter method code) to stay under the 500-char limit
            // — see js/checkout.js. Position/scale do NOT survive this
            // round-trip (no budget left for them), so restored images
            // always come back centered at scale 1.0.
            if (state.print && state.print.enabled && state.print.zones && !state.print.placements) {
                state.print.placements = await Promise.all(
                    state.print.zones
                        .filter(([zoneKey]) => PRINT_ZONES[zoneKey])
                        .map(async ([zoneKey, methodCode, imageKey]) => {
                            const z = PRINT_ZONES[zoneKey];
                            const method = Object.keys(PRINT_METHODS)
                                .find(k => PRINT_METHODS[k].code === methodCode) || null;

                            const placement = {
                                side: z.side, mode: 'zone', zone: zoneKey,
                                x_cm: z.x_cm, y_cm: z.y_cm,
                                width_cm: z.width_cm, height_cm: z.height_cm,
                                image: null, method, colors: []
                            };

                            if (imageKey) {
                                try {
                                    const res  = await fetch(`/api/get-print-image?key=${encodeURIComponent(imageKey)}`);
                                    const json = await res.json();
                                    if (json.ok) {
                                        const ratio = await new Promise(resolve => {
                                            const img = new Image();
                                            img.onload  = () => resolve(img.naturalWidth / img.naturalHeight);
                                            img.onerror = () => resolve(1);
                                            img.src = json.dataURI;
                                        });
                                        placement.image = {
                                            dataURI: json.dataURI, filename: '', ratio,
                                            offsetX_pct: 0, offsetY_pct: 0, scale: 1.0,
                                            blob_key: imageKey
                                        };
                                    } else {
                                        console.warn('[FlatLabs] Print image restore failed:', json.error);
                                    }
                                } catch (e) {
                                    console.warn('[FlatLabs] Print image fetch failed:', e);
                                }
                            }

                            return placement;
                        })
                );
                delete state.print.zones; // clean up compressed format
            }

            if (!state.print || !state.print.enabled) {
                try {
                    const ss = sessionStorage.getItem('flatlabs_checkout_state');
                    if (ss) {
                        const saved = JSON.parse(ss);
                        if (saved.print && saved.print.enabled) {
                            state.print = saved.print;
                        }
                    }
                } catch (e) { /* ignore parse errors */ }
            }
        }

        // Show modal to collect Brand / Project / SKU / Season
        showPostPaymentModal(cfg);

        // Clean URL — remove payment params
        window.history.replaceState({}, '', '/app.html');
        const ol = document.getElementById('paymentOverlay');
        if (ol) ol.style.display = 'none';

    } catch (err) {
        log(`Post-verification error: ${err.message}`, 'err');
        alert(`Something went wrong after payment: ${err.message}\n\nIf you were charged, please contact support.`);
        const ol = document.getElementById('paymentOverlay');
        if (ol) ol.style.display = 'none';
    }
}

function showPostPaymentModal(garmentConfig) {
    // Reuse the existing techPackModal for Brand/Project/SKU/Season collection
    document.getElementById('techPackModal').classList.add('show');

    const btnConfirm = document.getElementById('btnConfirmTechPack');
    const btnClose   = document.getElementById('btnCloseTechPackModal');

    // Clone + replace to remove any stale listeners
    const newBtnConfirm = btnConfirm.cloneNode(true);
    btnConfirm.parentNode.replaceChild(newBtnConfirm, btnConfirm);

    const newBtnClose = btnClose.cloneNode(true);
    btnClose.parentNode.replaceChild(newBtnClose, btnClose);

    newBtnClose.addEventListener('click', () => {
        document.getElementById('techPackModal').classList.remove('show');
    });

    newBtnConfirm.addEventListener('click', async () => {
        const brand  = document.getElementById('tpBrand').value.trim()   || 'FlatLabs';
        const name   = document.getElementById('tpProject').value.trim() || 'My Collection';
        const sku    = document.getElementById('tpSku').value.trim()     || 'FL-TS-001';
        const season = document.getElementById('tpSeason').value.trim()  || 'SS26';

        document.getElementById('techPackModal').classList.remove('show');

        // generate() reads the fill color directly from the #cFill DOM input
        // (both to set state.colorHex and to color the SVG shapes themselves)
        // rather than from state.colorHex — sync the input to the restored
        // value first so generate() picks up the right color instead of
        // stomping it back to the input's default. Dispatch 'input' so the
        // sidebar's pantone chip (swatch + hex label) stays in sync too.
        const cFillInput = document.getElementById('cFill');
        if (cFillInput && state.colorHex) {
            cFillInput.value = state.colorHex;
            cFillInput.dispatchEvent(new Event('input'));
        }

        // Regenerate flat from restored state before exporting
        generate(state, log);
        updatePrintZones(state);

        // Download the SVG flat (PRO includes SVG + PDF — model defined post-launch)
        triggerDownload(state, log);

        // Generate and auto-download the PDF
        await exportSpecSheet(state, { brand, name, sku, season });

        // Track PRO conversion completed (user has paid AND downloaded both files)
        track('pdf_downloaded', {
            garment: state.selectedCategory || 'tshirt',
            sku: sku || null,
            includes_svg: true
        });

        log('Tech Pack PDF + SVG generated and downloaded', 'ok');
    });
}

// ═══ INIT ═══
async function init() {
    const paymentOverlay = document.getElementById('paymentOverlay');
    const params = new URLSearchParams(window.location.search);
    if (params.get('payment') === 'success') {
    paymentOverlay.style.display = 'flex';
    }
    initCategories(state, doUpdateButton);
    initToggles();
    setIsoMode(true);
    await loadSVG();
    goStep(0, state, doUpdateButton);

    // Event listeners
    document.getElementById('burgerBtn')?.addEventListener('click', toggleSidebar);
    document.getElementById('sidebarBackdrop')?.addEventListener('click', closeSidebar);
    document.getElementById('mobileTechPack')?.addEventListener('click', doExportTechPack);
    document.getElementById('btnDownload')?.addEventListener('click', doDownload);
    document.getElementById('btnTechPack')?.addEventListener('click', doExportTechPack);
    document.getElementById('btnBack')?.addEventListener('click', () => {
        const prev = state.currentStep - 1;
        goStep(prev, state, doUpdateButton);
        if (prev === 1) buildStep1(state);
    });
    document.getElementById('fabCreate')?.addEventListener('click', () => { toggleSidebar(); });
    document.getElementById('btnNext')?.addEventListener('click', nextAction);

    // CHANGE 3 — listeners for btnConfirmTechPack and btnCloseTechPackModal removed
    // They are now wired dynamically inside showPostPaymentModal()

    // Modal listeners
    document.getElementById('leadForm')?.addEventListener('submit', doEmailSubmit);
    document.getElementById('btnCloseEmailModal')?.addEventListener('click', () => {
        document.getElementById('emailModal').classList.remove('show');
    });
    document.getElementById('btnCloseAlreadyUsedModal')?.addEventListener('click', () => {
        document.getElementById('alreadyUsedModal').classList.remove('show');
    });
    document.getElementById('btnCloseIpBlockedModal')?.addEventListener('click', () => {
        document.getElementById('ipBlockedModal').classList.remove('show');
    });
    document.getElementById('btnGetTechPack')?.addEventListener('click', () => {
        document.getElementById('alreadyUsedModal').classList.remove('show');
        doExportTechPack();
    });
    document.getElementById('btnCloseProModal')?.addEventListener('click', () => {
        document.getElementById('proModal').classList.remove('show');
    });

    // Post-download upsell modal
    document.getElementById('btnPostUpsellTechPack')?.addEventListener('click', () => {
        document.getElementById('postDownloadUpsell')?.classList.remove('show');
        doExportTechPack();
    });
    document.getElementById('btnClosePostUpsell')?.addEventListener('click', () => {
        document.getElementById('postDownloadUpsell')?.classList.remove('show');
    });

    // Email input focus/blur styles
    const emailInput = document.getElementById('emailInput');
    emailInput?.addEventListener('focus', function() { this.style.borderColor = 'var(--accent)'; });
    emailInput?.addEventListener('blur',  function() { this.style.borderColor = 'var(--gray3)'; });

    // Gender toggle wiring
    document.querySelectorAll('[data-gender]').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('[data-gender]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.gender = btn.dataset.gender;
            log(`Sizing standard: ${state.gender}`, 'info');
        });
    });

    // Auto-open sidebar on first mobile visit
    if (window.innerWidth <= 800 && !localStorage.getItem('flatlabs_visited')) {
        localStorage.setItem('flatlabs_visited', '1');
        // Small delay to let layout settle
        setTimeout(() => { toggleSidebar(); }, 300);
    }

    // CHANGE 5 — Handle return from Stripe payment (if applicable)
    await handlePaymentReturn();
}

init();
window.state = state;
