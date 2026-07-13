// ═══ ui.js — Navigation, steps, dynamic toggles, component builder ═══

import { DICT, GARMENT_ICONS, CATEGORIES, FABRIC_SPECS, STITCH_SPECS } from './config.js';
import { NEEDLES, THREADS, CARE_LABELS, BRAND_LABELS, checkCompatibility, isOptionCompatible, TSHIRT_CONFIG } from './config/index.js';
import { showTooltip, hideTooltip, openInfoPanel, closeInfoPanel } from './infoPanel.js';
import { track } from './tracker.js';
import { PRINT_ZONES, PRINT_METHODS } from './config/print-zones.js';
import { updatePrintZones, updateSingleImage } from './print-renderer.js';

// ─── Print image upload (Level 2, part 2D) ───────────────────────────────────
// Uploads happen fire-and-forget as soon as an image is picked, so blob_key is
// usually already populated well before checkout. app.js's doExportTechPack
// awaits awaitPendingUploads() as a safety net in case a slow upload is still
// in flight right when the user clicks "Export Tech Pack".
const pendingUploads = new Map(); // placement -> Promise

function uploadPrintImage(placement) {
    const uploadPromise = fetch('/api/upload-print-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: placement.image.dataURI, filename: placement.image.filename })
    })
        .then(r => r.json())
        .then(data => {
            if (data.ok && placement.image) placement.image.blob_key = data.blob_key;
            else console.warn('[FlatLabs] Print image upload rejected:', data.error);
        })
        .catch(e => console.warn('[FlatLabs] Print image upload failed:', e))
        .finally(() => pendingUploads.delete(placement));
    pendingUploads.set(placement, uploadPromise);
}

export async function awaitPendingUploads() {
    await Promise.all(Array.from(pendingUploads.values()));
}

// Placements that have artwork uploaded but no print method chosen yet —
// used both to gate the Print step's Generate button and to render the
// warning/highlight in buildStep4. Naturally empty if print is disabled or
// no placement has an image, so callers don't need to check those first.
export function getMissingMethodZones(state) {
    if (!state.print || !state.print.enabled) return [];
    return state.print.placements.filter(p => p.image && !p.method);
}

export function initCategories(state, updateButton) {
    const grid = document.getElementById('catGrid');
    CATEGORIES.forEach(cat => {
        const card = document.createElement('div');
        card.className = 'cat-card' + (cat.disabled ? ' disabled' : '');
        card.setAttribute('role', 'radio');
        card.setAttribute('aria-label', cat.label + (cat.disabled ? ' - Coming soon' : ''));
        card.innerHTML = '<div class="cat-icon">' + GARMENT_ICONS[cat.icon] + '</div><div class="cat-label">' + cat.label + '</div>';
        if (!cat.disabled) {
            card.onclick = () => {
                grid.querySelectorAll('.cat-card').forEach(c => { c.classList.remove('selected'); c.setAttribute('aria-checked','false'); });
                card.classList.add('selected');
                card.setAttribute('aria-checked','true');
                state.selectedCategory = cat.id;
                state.selections = { torso:null, neck:null, sleeve:null };
                updateButton();
            };
        }
        grid.appendChild(card);
    });
}

export function goStep(n, state, updateButton) {
    // Track step transition: completed the previous step, now viewing the new one
    const prevStep = state.currentStep;
    if (typeof prevStep === 'number' && prevStep !== n) {
        // Only fire "completed" when moving FORWARD (not when going back)
        if (n > prevStep) {
            track('step_completed', { step: prevStep, garment: state.selectedCategory || null });
        }
    }
    track('step_viewed', { step: n, garment: state.selectedCategory || null });

    state.currentStep = n;
    const pct = n * (100 / 4);
    document.getElementById('stepsTrack').style.transform = 'translateX(-' + pct + '%)';
    const dots = document.querySelectorAll('.step-dot');
    dots.forEach((d,i) => {
        d.className = 'step-dot' + (i<n?' done':i===n?' active':'');
        if (i < n) {
            d.style.cursor = 'pointer';
            d.onclick = () => goStep(i, state, updateButton);
        } else {
            d.style.cursor = 'default';
            d.onclick = null;
        }
    });
    document.getElementById('btnBack').style.display = n > 0 ? '' : 'none';
    updateButton(state);
}


export function updateButton(state) {
    const btn = document.getElementById('btnNext');
    if (state.currentStep === 0) {
        btn.textContent = 'Next';
        btn.disabled = !state.selectedCategory;
    } else if (state.currentStep === 1) {
        btn.textContent = 'Next';
        btn.disabled = false;
    } else if (state.currentStep === 2) {
        btn.textContent = 'Next';
        btn.disabled = false;
    } else {
        btn.textContent = 'Generate';
        btn.disabled = false;
    }
}

export function buildStep1(state) {
    const { svgData, selections } = state;
    const container = document.getElementById('componentsContainer');
    container.innerHTML = '';

    function buildOptions(label, dataObj, selKey, allowNone) {
        if (Object.keys(dataObj).length === 0) return;
        const sec = document.createElement('div');
        sec.innerHTML = '<div class="sec-label">' + label + '</div>';
        const scroll = document.createElement('div');
        scroll.className = 'opt-scroll';
        scroll.setAttribute('role', 'radiogroup');
        scroll.setAttribute('aria-label', label);

        if (allowNone) {
            const none = document.createElement('div');
            none.className = 'opt-card none-card' + (selections[selKey]==='none'?' selected':'');
            none.setAttribute('role','radio');
            none.innerHTML = '<div class="opt-preview">\u2014</div><div class="opt-name">None</div>';
            none.onclick = () => {
                selections[selKey] = 'none';
                scroll.querySelectorAll('.opt-card').forEach(o=>o.classList.remove('selected'));
                none.classList.add('selected');
            };
            scroll.appendChild(none);
        }

        Object.keys(dataObj).forEach((key, idx) => {
            const opt = document.createElement('div');
            const isSelected = selections[selKey]===key || (!selections[selKey] && idx===0 && !allowNone);
            if (isSelected) selections[selKey] = key;
            opt.className = 'opt-card' + (isSelected?' selected':'');
            opt.setAttribute('role','radio');
            opt.setAttribute('aria-label', DICT[key]||key);
            opt.innerHTML = '<div class="opt-preview" style="font-size:12px;font-weight:700">' + (key.slice(0,3).toUpperCase()) + '</div><div class="opt-name">' + (DICT[key]||key) + '</div>';
            opt.onclick = () => {
                selections[selKey] = key;
                scroll.querySelectorAll('.opt-card').forEach(o=>o.classList.remove('selected'));
                opt.classList.add('selected');
            };
            scroll.appendChild(opt);
        });

        sec.appendChild(scroll);
        container.appendChild(sec);
    }

    buildOptions('Torso', svgData.front.torsos, 'torso', false);
    buildOptions('Neckline', svgData.front.necks, 'neck', false);
    buildOptions('Sleeves', svgData.front.sleeves, 'sleeve', true);

    // Dynamic toggles container
    const togContainer = document.getElementById('dynamicToggles');
    if (togContainer) togContainer.innerHTML = '';

    // Only show pocket toggle if pockets exist in SVG
    const togPocket = document.getElementById('togPocket');
    const togPocketRow = togPocket ? togPocket.closest('.tog-row') : null;
    if (togPocketRow) {
        togPocketRow.style.display = Object.keys(svgData.front.pockets).length > 0 ? '' : 'none';
    }
}

const FABRIC_TERM_MAP = {
    jersey_150: 'ft_tex_001',
    jersey_180: 'ft_tex_002',
    jersey_200: 'ft_tex_003',
    rib_1x1:    'ft_tex_004',
};

const STITCH_TERM_MAP = {
    overlock_4t:  'iso_514',
    coverseam_3n: 'iso_406',
    flatlock:     null,
};

// screen -> ft_prt_002 (Plastisol), not ft_prt_001 (Water-based): Plastisol's
// own tooltip calls itself "Standard durable ink" — the conventional default
// screen-print process — which is the closer match for the wizard's plain,
// unqualified "Screen Print" option than the water-based eco-variant.
const PRINT_METHOD_TERM_MAP = {
    screen:      'ft_prt_002',
    dtg:         'ft_prt_003',
    embroidery:  'ft_emb_001',
    sublimation: 'ft_prt_004'
};

// ── Shared: build a collapsible section (used by buildStep2's Basic/Advanced
// and buildStep4's Artwork/Print) ──
function buildSection(state, title, stateKey, buildFn) {
    const collapsed = state.ui[stateKey];
    const section = document.createElement('div');
    section.className = 'step3-section' + (collapsed ? ' collapsed' : '');

    const header = document.createElement('div');
    header.className = 'step3-section-header';
    header.innerHTML = `<span class="chevron">${collapsed ? '▸' : '▾'}</span> ${title}`;
    header.onclick = () => {
        state.ui[stateKey] = !state.ui[stateKey];
        section.classList.toggle('collapsed');
        header.querySelector('.chevron').textContent =
            section.classList.contains('collapsed') ? '▸' : '▾';
    };

    const content = document.createElement('div');
    content.className = 'step3-section-content';
    buildFn(content);

    section.appendChild(header);
    section.appendChild(content);
    return section;
}

export function buildStep2(state) {
    const container = document.getElementById('manufContainer');
    container.innerHTML = '';

    // Compute compatibility warnings once
    const ctx = {
        fabric:     FABRIC_SPECS[state.fabric],
        needle:     NEEDLES[state.needle],
        thread:     THREADS[state.thread],
        stitch:     STITCH_SPECS[state.stitchType],
        careLabel:  CARE_LABELS[state.careLabel],
        brandLabel: BRAND_LABELS[state.brandLabel]
    };
    const warnings = checkCompatibility(ctx);

    // Map warning IDs to which selectors they affect
    const warnMap = {};
    warnings.forEach(w => {
        if (w.id === 'needle_too_fine_for_fabric' || w.id === 'sharp_needle_on_knit') {
            warnMap.needle  = warnMap.needle  || w.message;
            warnMap.fabric  = warnMap.fabric  || w.message;
        }
        if (w.id === 'thread_too_thick_for_needle') {
            warnMap.thread  = warnMap.thread  || w.message;
            warnMap.needle  = warnMap.needle  || w.message;
        }
    });

    // ── Helper: build a horizontal opt-card selector ──
   function buildSelector(label, entries, activeKey, stateField, previewFn, termMap) {
        const sec = document.createElement('div');
        sec.innerHTML = '<div class="sec-label">' + label + '</div>';
        const scroll = document.createElement('div');
        scroll.className = 'opt-scroll';
        scroll.setAttribute('role', 'radiogroup');
        scroll.setAttribute('aria-label', label);

        entries.forEach(([key, item]) => {
            const opt = document.createElement('div');
            const isSelected = activeKey === key;

            // Check if this option is compatible with current context
            const compat = isOptionCompatible(stateField, item, ctx);
            const isDisabled = !isSelected && !compat.compatible;

            opt.className = 'opt-card'
                + (isSelected ? ' selected' : '')
                + (isDisabled ? ' disabled' : '');
            opt.setAttribute('role', 'radio');
            opt.setAttribute('aria-label', item.label || key);

            opt.innerHTML = `
                <div class="opt-preview" style="font-size:10px;font-weight:700;line-height:1.2">
                    ${previewFn(key, item)}
                </div>
                <div class="opt-name">${item.label || key}</div>
                ${isDisabled ? `<div class="lock-icon" title="Incompatible — change the fabric first">🔒</div>` : ''}
            `;

// Add "?" info icon if this selector has a term map
            if (termMap && termMap[key]) {
                const icon = document.createElement('span');
                icon.className = 'info-icon';
                icon.dataset.term = termMap[key];
                icon.textContent = '?';
                icon.addEventListener('mouseenter', () => showTooltip(termMap[key], icon));
                icon.addEventListener('mouseleave', hideTooltip);
                icon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openInfoPanel(termMap[key]);
                });
                opt.querySelector('.opt-name').appendChild(icon);
            }
            
            opt.onclick = () => {
                if (isDisabled) return;  // ignore clicks on disabled options
                state[stateField] = key;
                // After change, validate other selections and auto-fix if needed
                autoFixIncompatibleSelections(state);
                buildStep2(state);
            };
            scroll.appendChild(opt);
        });

        sec.appendChild(scroll);
        return sec;
    }

    // ── Filter entries by allowed list ──
    function allowed(dict, allowedKeys) {
        return Object.entries(dict).filter(([k]) => allowedKeys.includes(k));
    }

    // ══ BASIC SECTION ══
    const basicSection = buildSection(state, 'Basic', 'step3BasicCollapsed', (content) => {

        // Fabric
        content.appendChild(buildSelector(
            'Fabric Weight',
            allowed(FABRIC_SPECS, TSHIRT_CONFIG.allowedFabrics),
            state.fabric, 'fabric',
            (key, item) => `${item.weight}<br><span style="font-size:8px;font-weight:400">g/m²</span>`,
            FABRIC_TERM_MAP
        ));

        // Stitch
        content.appendChild(buildSelector(
            'Main Seam Type',
            allowed(STITCH_SPECS, TSHIRT_CONFIG.allowedStitches),
            state.stitchType, 'stitchType',
            (key, item) => item.iso || key.slice(0,4).toUpperCase(),
            STITCH_TERM_MAP
        ));

        // Care Label
        content.appendChild(buildSelector(
            'Care Label',
            allowed(CARE_LABELS, TSHIRT_CONFIG.allowedCareLabels),
            state.careLabel, 'careLabel',
            (key, item) => key.slice(0,3).toUpperCase()
        ));

        // Brand Label
        const brandSec = buildSelector(
            'Brand Label',
            allowed(BRAND_LABELS, TSHIRT_CONFIG.allowedBrandLabels),
            state.brandLabel, 'brandLabel',
            (key, item) => key.slice(0,3).toUpperCase()
        );
        content.appendChild(brandSec);
    });

    // ══ ADVANCED SECTION ══
    const advancedSection = buildSection(state, 'Advanced', 'step3AdvancedCollapsed', (content) => {

        // Needle
        content.appendChild(buildSelector(
            'Needle',
            allowed(NEEDLES, TSHIRT_CONFIG.allowedNeedles),
            state.needle, 'needle',
            (key, item) => key.slice(0,4).toUpperCase()
        ));

        // Thread
        content.appendChild(buildSelector(
            'Thread',
            allowed(THREADS, TSHIRT_CONFIG.allowedThreads),
            state.thread, 'thread',
            (key, item) => key.slice(0,4).toUpperCase()
        ));
    });

    container.appendChild(basicSection);
    container.appendChild(advancedSection);

    // Auto-fix: after a state change, check if other selections became incompatible.
    // If so, switch them to the first compatible option from their allowed list.
    function autoFixIncompatibleSelections(state) {
        const fields = [
            { field: 'fabric',     dict: FABRIC_SPECS,  allowed: TSHIRT_CONFIG.allowedFabrics    },
            { field: 'stitchType', dict: STITCH_SPECS,  allowed: TSHIRT_CONFIG.allowedStitches   },
            { field: 'needle',     dict: NEEDLES,       allowed: TSHIRT_CONFIG.allowedNeedles    },
            { field: 'thread',     dict: THREADS,       allowed: TSHIRT_CONFIG.allowedThreads    },
            { field: 'careLabel',  dict: CARE_LABELS,   allowed: TSHIRT_CONFIG.allowedCareLabels },
            { field: 'brandLabel', dict: BRAND_LABELS,  allowed: TSHIRT_CONFIG.allowedBrandLabels}
        ];
    
        for (const { field, dict, allowed } of fields) {
            const ctx = {
                fabric:     FABRIC_SPECS[state.fabric],
                needle:     NEEDLES[state.needle],
                thread:     THREADS[state.thread],
                stitch:     STITCH_SPECS[state.stitchType],
                careLabel:  CARE_LABELS[state.careLabel],
                brandLabel: BRAND_LABELS[state.brandLabel]
            };
            const currentItem = dict[state[field]];
            if (!currentItem) continue;
            const compat = isOptionCompatible(field, currentItem, ctx);
            if (!compat.compatible) {
                // Find first compatible option from allowed list
                for (const candidateKey of allowed) {
                    const candidate = dict[candidateKey];
                    if (!candidate) continue;
                    const candidateCompat = isOptionCompatible(field, candidate, ctx);
                    if (candidateCompat.compatible) {
                        state[field] = candidateKey;
                        break;
                    }
                }
            }
        }
    }
}

export function buildStep4(state) {
    const container = document.getElementById('printContainer');
    container.innerHTML = '';

    // ── Helper: describe a zone's fixed geometry in plain terms ──
    function describeZone(zone) {
        const posDesc = zone.x_cm === 0
            ? 'centered'
            : `${Math.abs(zone.x_cm)} cm ${zone.x_cm < 0 ? 'left' : 'right'} of CF`;
        return `${zone.width_cm} × ${zone.height_cm} cm · ${zone.y_cm} cm below HPS · ${posDesc}`;
    }

    // ── Helper: build a multi-select zone row — unlike buildSelector, multiple
    // zones can be active at once, so this toggles entries in
    // state.print.placements rather than setting a single exclusive state field ──
    function buildZoneRow(label, sideKey, zoneEntries) {
        const sec = document.createElement('div');
        sec.innerHTML = '<div class="sec-label">' + label + '</div>';
        const scroll = document.createElement('div');
        scroll.className = 'opt-scroll';
        scroll.setAttribute('role', 'group');
        scroll.setAttribute('aria-label', label);

        zoneEntries.forEach(([zoneKey, zone]) => {
            const isSelected = state.print.placements.some(p => p.side === sideKey && p.zone === zoneKey);
            const opt = document.createElement('div');
            opt.className = 'opt-card' + (isSelected ? ' selected' : '');
            opt.setAttribute('role', 'checkbox');
            opt.setAttribute('aria-checked', String(isSelected));
            opt.setAttribute('aria-label', zone.label);

            opt.innerHTML = `
                <div class="opt-preview" style="font-size:10px;font-weight:700;line-height:1.2">${zone.width_cm}×${zone.height_cm}</div>
                <div class="opt-name">${zone.label}${isSelected ? `<br><span style="font-size:9px;font-weight:400">${describeZone(zone)}</span>` : ''}</div>
            `;

            opt.onclick = () => {
                const idx = state.print.placements.findIndex(p => p.side === sideKey && p.zone === zoneKey);
                if (idx >= 0) {
                    state.print.placements.splice(idx, 1);
                } else {
                    state.print.placements.push({
                        side: sideKey, mode: 'zone', zone: zoneKey,
                        x_cm: zone.x_cm, y_cm: zone.y_cm,
                        width_cm: zone.width_cm, height_cm: zone.height_cm,
                        image: null, method: null, colors: []
                    });
                }
                buildStep4(state);
            };
            scroll.appendChild(opt);
        });

        sec.appendChild(scroll);
        return sec;
    }

    // ── Helper: per-zone artwork panel — upload, method, scale. Only called
    // by the caller below for zones already in state.print.placements, so
    // isActive is always true here; the .zone-panel--disabled branch is
    // dead code kept for a possible future "preview unselected zones" mode.
    // Rendered full-width BELOW the zone-picker row (not inside the 96px
    // opt-card, which has no room for a file input + method selector +
    // slider). Drag-to-reposition happens directly on the flat preview
    // (wired in print-renderer.js), not in this panel. ──
    function buildZoneDetailPanel(zoneKey, zone, sideKey) {
        const placement = state.print.placements.find(p => p.side === sideKey && p.zone === zoneKey);
        const isActive = !!placement;
        const missingMethod = state.ui.printShowValidation && isActive && placement.image && !placement.method;

        const panel = document.createElement('div');
        panel.className = 'zone-panel'
            + (isActive ? '' : ' zone-panel--disabled')
            + (missingMethod ? ' zone-panel--missing-method' : '');
        panel.dataset.zone = zoneKey;
        panel.dataset.side = sideKey;

        const header = document.createElement('div');
        header.className = 'sec-label';
        header.style.cssText = 'margin:0 0 8px';
        header.textContent = `${zone.label} artwork`;
        panel.appendChild(header);

        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/png,image/jpeg,image/svg+xml';
        fileInput.disabled = !isActive;
        fileInput.onchange = (e) => {
            if (!placement) return; // guard: panel should be inert while disabled
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = () => {
                const img = new Image();
                img.onload = () => {
                    placement.image = {
                        dataURI: reader.result,
                        filename: file.name,
                        ratio: img.naturalWidth / img.naturalHeight,
                        blob_key: null,
                        offsetX_pct: 0, offsetY_pct: 0, scale: 1.0
                    };
                    uploadPrintImage(placement); // fire-and-forget — see print-renderer/app.js wiring
                    buildStep4(state);
                    updatePrintZones(state);
                };
                img.src = reader.result;
            };
            reader.readAsDataURL(file);
        };
        panel.appendChild(fileInput);

        if (placement && placement.image) {
            const filenameRow = document.createElement('div');
            filenameRow.style.cssText = 'font-size:11px;color:var(--ink-soft);margin-top:6px;';
            filenameRow.textContent = placement.image.filename || 'Image uploaded';
            panel.appendChild(filenameRow);
        }

        // Method selector — shown regardless of image upload state, since a
        // print method can be chosen independently of having artwork yet.
        const methodSec = document.createElement('div');
        methodSec.style.cssText = 'margin-top:10px;';
        methodSec.innerHTML = '<div class="sec-label" style="margin:0 0 6px">Print Method</div>';
        const methodScroll = document.createElement('div');
        methodScroll.className = 'opt-scroll';
        methodScroll.setAttribute('role', 'radiogroup');
        methodScroll.setAttribute('aria-label', 'Print Method');
        Object.entries(PRINT_METHODS).forEach(([key, m]) => {
            const opt = document.createElement('div');
            opt.className = 'opt-card' + (placement && placement.method === key ? ' selected' : '');
            opt.setAttribute('role', 'radio');
            opt.setAttribute('aria-label', m.label);
            opt.innerHTML = `<div class="opt-preview" style="font-size:10px;font-weight:700">${key.slice(0,3).toUpperCase()}</div><div class="opt-name">${m.label}</div>`;

            // Add "?" info icon if this method has a term map entry
            if (PRINT_METHOD_TERM_MAP[key]) {
                const icon = document.createElement('span');
                icon.className = 'info-icon';
                icon.dataset.term = PRINT_METHOD_TERM_MAP[key];
                icon.textContent = '?';
                icon.addEventListener('mouseenter', () => showTooltip(PRINT_METHOD_TERM_MAP[key], icon));
                icon.addEventListener('mouseleave', hideTooltip);
                icon.addEventListener('click', (e) => {
                    e.stopPropagation();
                    openInfoPanel(PRINT_METHOD_TERM_MAP[key]);
                });
                opt.querySelector('.opt-name').appendChild(icon);
            }

            opt.onclick = () => {
                if (!placement) return; // guard: panel should be inert while disabled
                placement.method = key;
                buildStep4(state);
            };
            methodScroll.appendChild(opt);
        });
        methodSec.appendChild(methodScroll);
        panel.appendChild(methodSec);

        // Scale slider — only meaningful once there's an image to scale.
        if (placement && placement.image) {
            const scaleRow = document.createElement('div');
            scaleRow.style.cssText = 'margin-top:10px;';
            scaleRow.innerHTML = `
                <div class="sec-label" style="margin:0 0 6px">Scale</div>
                <input type="range" min="0.3" max="3" step="0.1" value="${placement.image.scale}" style="width:100%">
            `;
            const scaleInput = scaleRow.querySelector('input');
            scaleInput.oninput = () => {
                placement.image.scale = parseFloat(scaleInput.value);
                updateSingleImage(state, placement); // narrow update — repositions just this image
            };
            scaleInput.onchange = () => {
                buildStep4(state); // final sidebar sync, matches Level-1 opt-card pattern
            };
            panel.appendChild(scaleRow);
        }

        return panel;
    }

    // ══ ARTWORK / PRINT SECTION ══
    const artworkSection = buildSection(state, 'Artwork / Print', 'step4ArtworkCollapsed', (content) => {
        const toggleRow = document.createElement('label');
        toggleRow.style.cssText = 'display:flex;align-items:center;gap:8px;cursor:pointer;margin-bottom:12px;';
        toggleRow.innerHTML = `
            <input type="checkbox" id="printEnabledToggle" ${state.print.enabled ? 'checked' : ''}>
            <span class="sec-label" style="margin:0">Add Print / Artwork</span>
        `;
        toggleRow.querySelector('input').onchange = (e) => {
            state.print.enabled = e.target.checked;
            buildStep4(state);
        };
        content.appendChild(toggleRow);

        // Switches to the zone's side (if not already active), rebuilds, then
        // scrolls its panel into view — shared by the banner's zone links so
        // a flagged zone on the inactive side is one click away, not just named.
        function jumpToZone(side, zoneKey) {
            state.ui.printActiveSide = side;
            buildStep4(state); // rebuilds synchronously — DOM below is current
            const panel = document.querySelector(`.zone-panel[data-zone="${zoneKey}"]`);
            if (panel) {
                const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
                panel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
            }
        }

        // Generate-blocking validation warning — set by nextAction() in app.js
        // when the user tries to Generate with artwork uploaded but no method
        // chosen. Recomputed live on every render (not a frozen snapshot), so
        // picking a method for a flagged zone clears its warning/highlight and
        // the toggle's alert coloring on the very next re-render — which
        // already happens on every zone-row, method, or toggle click — no
        // separate tracking needed. Computed once here and shared with the
        // Front/Back toggle below, so a flagged side is visible at a glance
        // even before reading the banner text.
        const missingBySide = { front: [], back: [] };
        if (state.ui.printShowValidation) {
            getMissingMethodZones(state).forEach(p => missingBySide[p.side]?.push(p));
        }
        const hasMissing = missingBySide.front.length > 0 || missingBySide.back.length > 0;

        if (hasMissing) {
            const warnBanner = document.createElement('div');
            warnBanner.className = 'print-validation-warning';

            const intro = document.createElement('div');
            intro.textContent = 'Please select a print method for:';
            warnBanner.appendChild(intro);

            [['front', 'Front'], ['back', 'Back']].forEach(([side, label]) => {
                const zones = missingBySide[side];
                if (zones.length === 0) return;

                const line = document.createElement('div');
                line.style.cssText = 'margin-top:4px;';
                line.appendChild(document.createTextNode(`${label}: `));

                zones.forEach((p, i) => {
                    const link = document.createElement('span');
                    link.className = 'print-validation-warning__zone-link';
                    link.textContent = PRINT_ZONES[p.zone]?.label || p.zone;
                    link.onclick = () => jumpToZone(side, p.zone);
                    line.appendChild(link);
                    if (i < zones.length - 1) line.appendChild(document.createTextNode(', '));
                });

                warnBanner.appendChild(line);
            });

            content.appendChild(warnBanner);
        }

        if (state.print.enabled) {
            // Front/Back toggle — same visual pattern as the Female/Male
            // sizing toggle in Step 0 (.man-toggle/.man-btn). A side with an
            // unresolved missing-method zone gets .man-btn--alert, visible
            // at a glance regardless of which side is currently active.
            const sideToggle = document.createElement('div');
            sideToggle.className = 'man-toggle';
            sideToggle.style.cssText = 'border:none;background:transparent;padding:0;gap:8px;margin-bottom:12px;';
            [['front', 'Front'], ['back', 'Back']].forEach(([side, label]) => {
                const btn = document.createElement('button');
                btn.className = 'man-btn'
                    + (state.ui.printActiveSide === side ? ' active' : '')
                    + (missingBySide[side].length > 0 ? ' man-btn--alert' : '');
                btn.textContent = label;
                btn.onclick = () => {
                    state.ui.printActiveSide = side;
                    buildStep4(state);
                };
                sideToggle.appendChild(btn);
            });
            content.appendChild(sideToggle);

            const activeSide = state.ui.printActiveSide;
            const sideLabel  = activeSide === 'front' ? 'Front' : 'Back';
            const zoneEntries = Object.entries(PRINT_ZONES).filter(([, z]) => z.side === activeSide);

            content.appendChild(buildZoneRow(sideLabel, activeSide, zoneEntries));
            // Only render detail panels for zones the user has actually selected
            zoneEntries.forEach(([zoneKey, zone]) => {
                const isSelected = state.print.placements.some(
                    p => p.side === activeSide && p.zone === zoneKey
                );
                if (isSelected) {
                    content.appendChild(buildZoneDetailPanel(zoneKey, zone, activeSide));
                }
            });
        }
    });

    container.appendChild(artworkSection);

    updatePrintZones(state);
}

export function initToggles() {
    const togSeams = document.getElementById('togSeams');
    if (togSeams) togSeams.onclick = function() {
        this.classList.toggle('on');
        this.setAttribute('aria-checked', this.classList.contains('on'));
    };
    const togPocket = document.getElementById('togPocket');
    if (togPocket) togPocket.onclick = function() {
        this.classList.toggle('on');
        this.setAttribute('aria-checked', this.classList.contains('on'));
    };
    const cFill = document.getElementById('cFill');
    if (cFill) cFill.oninput = function() {
        const hex = this.value.toUpperCase();
        // Pseudo-Pantone code derived from hex (e.g. "#4A90D9" → "4A-90D9 HEX")
        const stripped = hex.replace('#', '');
        const pseudoCode = stripped.slice(0, 2) + '-' + stripped.slice(2) + ' HEX';
        // Update the Pantone chip
        const hFill = document.getElementById('hFill');
        const pantoneHex = document.getElementById('pantoneHex');
        const pantoneChip = document.getElementById('pantoneChip');
        if (hFill) hFill.textContent = pseudoCode;
        if (pantoneHex) pantoneHex.textContent = hex;
        if (pantoneChip) pantoneChip.style.setProperty('--pantone', hex);
    };
}

export function toggleSidebar() {
    closeInfoPanel();
    const isOpening = !document.getElementById('sidebar').classList.contains('open');
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarBackdrop').classList.toggle('show');
    const mDl = document.getElementById('mobileDownload');
    if (mDl) {
        if (isOpening) {
            mDl.dataset.wasShown = mDl.classList.contains('show');
            mDl.classList.remove('show');
        } else {
            if (mDl.dataset.wasShown === 'true') mDl.classList.add('show');
        }
    }
}

export function closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarBackdrop').classList.remove('show');
}

export function setIsoMode(isIso) {
    if (isIso) {
        document.body.classList.add('iso-mode');
    } else {
        document.body.classList.remove('iso-mode');
    }
}
