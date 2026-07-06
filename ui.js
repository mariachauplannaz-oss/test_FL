// ═══ ui.js — Navigation, steps, dynamic toggles, component builder ═══

import { DICT, GARMENT_ICONS, CATEGORIES, FABRIC_SPECS, STITCH_SPECS } from './config.js';
import { NEEDLES, THREADS, CARE_LABELS, BRAND_LABELS, checkCompatibility, isOptionCompatible, TSHIRT_CONFIG } from './config/index.js';
import { showTooltip, hideTooltip, openInfoPanel, closeInfoPanel } from './infoPanel.js';
import { track } from './tracker.js';

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
    const pct = n * (100 / 3);
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

    // ── Helper: build a collapsible section ──
        function buildSection(title, stateKey, buildFn) {
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

    // ── Filter entries by allowed list ──
    function allowed(dict, allowedKeys) {
        return Object.entries(dict).filter(([k]) => allowedKeys.includes(k));
    }

    // ══ BASIC SECTION ══
    const basicSection = buildSection('Basic', 'step3BasicCollapsed', (content) => {

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
    const advancedSection = buildSection('Advanced', 'step3AdvancedCollapsed', (content) => {

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
