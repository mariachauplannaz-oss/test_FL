// ═══ generator.js — SVG garment renderer (front + back) ═══

import { DICT, MANNEQUIN_CFG } from './config.js';
import { merge2 } from './pathUtils.js';

const NS = 'http://www.w3.org/2000/svg';

function mkEl(tag, attrs) {
    const el = document.createElementNS(NS, tag);
    Object.entries(attrs).forEach(([k,v]) => el.setAttribute(k, v));
    return el;
}

// Render a rib block — works for neck, sleeve cuff, torso hem, hoodie hood,
// pants waistband, or any future component that has a _rib_ group.
// idPrefix: prefix used for path ids (e.g. "nck_rnd", "slv_set", "torso_reg")
// component: object with { rib: [pathD, ...], ribClip: pathD|null }
// strokeWidth: stroke width for the rib lines
let ribClipCounter = 0;
function renderRibBlock(parentGroup, svgRoot, idPrefix, component, strokeWidth) {
    if (!component || !component.rib || !component.rib.length) return;

    const ribStyle = { fill:'none', stroke:'#1a1a1a', 'stroke-width': strokeWidth, 'stroke-linecap':'round', 'stroke-linejoin':'round' };

    if (component.ribClip) {
        const clipId = `ribClip-${idPrefix}-${++ribClipCounter}`;

        // 1) Render the rib_shape as a visible gray fill (like Illustrator's cls-15)
        parentGroup.appendChild(mkEl('path', {
            id: `${idPrefix}_rib_shape`,
            d: component.ribClip,
            fill: '#414042',
            'fill-opacity': '0.25',
            stroke: 'none'
        }));

        // 2) Ensure <defs> exists for the clipPath (always at svg root)
        let defs = svgRoot.querySelector('defs');
        if (!defs) {
            defs = mkEl('defs', {});
            svgRoot.insertBefore(defs, svgRoot.firstChild);
        }

        // 3) Create clipPath using the same shape
        const clipPath = mkEl('clipPath', { id: clipId });
        clipPath.appendChild(mkEl('path', { d: component.ribClip }));
        defs.appendChild(clipPath);

        // 4) Wrap rib lines in a clipped group so they don't escape the shape
        const clippedGroup = mkEl('g', { 'clip-path': `url(#${clipId})` });
        component.rib.forEach((d, i) => {
            clippedGroup.appendChild(mkEl('path', { id: `${idPrefix}_rib_${i+1}`, d, ...ribStyle }));
        });
        parentGroup.appendChild(clippedGroup);
    } else {
        // No clip shape — render lines directly (legacy/simple case)
        component.rib.forEach((d, i) => {
            parentGroup.appendChild(mkEl('path', { id: `${idPrefix}_rib_${i+1}`, d, ...ribStyle }));
        });
    }
}

// Calculate viewBox from the actual rendered content's bounding box
function fitViewBoxToContent(svgEl, paddingRatio = 0.1) {
    // svgEl needs to be in the DOM for getBBox to work
    const bbox = svgEl.getBBox();
    const padX = bbox.width  * paddingRatio;
    const padY = bbox.height * paddingRatio;
    const x = bbox.x - padX;
    const y = bbox.y - padY;
    const w = bbox.width  + padX * 2;
    const h = bbox.height + padY * 2;
    svgEl.setAttribute('viewBox', `${x} ${y} ${w} ${h}`);
}

function renderGarment(svgEl, components, selections, cfg, log, ghostMarkup, viewName) {
    const fill = document.getElementById('cFill').value;
    const showSeams = document.getElementById('togSeams').classList.contains('on');

    const sw = cfg.strokeWidth;
    const seamSw = cfg.seamStrokeWidth;
    const gA = { fill, stroke:'#1a1a1a', 'stroke-width':sw, 'stroke-linejoin':'round', 'stroke-linecap':'round' };
    const seamA = { fill:'none', stroke:'#1a1a1a', 'stroke-width':seamSw, 'stroke-linecap':'round' };

    // Prefix for ids based on view (front/back)
    const v = viewName || 'front';

    // Ghost mannequin — hidden in ISO mode (production view = garment only)
    const isIsoMode = document.body.classList.contains('iso-mode');
    if (ghostMarkup && !isIsoMode) {
        const tmp = new DOMParser().parseFromString(
            '<svg xmlns="http://www.w3.org/2000/svg">' + ghostMarkup + '</svg>', 'image/svg+xml'
        );
        const ghost = mkEl('g', { opacity:'0.12', id:'layer-body' });
        Array.from(tmp.documentElement.childNodes).forEach(n => {
            ghost.appendChild(document.importNode(n, true));
        });
        svgEl.appendChild(ghost);
    }

    // Get component names for IDs
    const torsoName = selections.torso || Object.keys(components.torsos)[0] || 'torso';
    const neckName = selections.neck || 'neck';
    const sleeveName = selections.sleeve || 'sleeve';

    // Get components
    const torso = components.torsos[torsoName];
    const neck = selections.neck && selections.neck !== 'none' ? components.necks[selections.neck] : null;
    const sleeve = selections.sleeve && selections.sleeve !== 'none' ? components.sleeves[selections.sleeve] : null;

    // Create top-level view group
    const viewGroup = mkEl('g', { id: v });
    svgEl.appendChild(viewGroup);

    // MERGE torso + neck (visual: one outline)
    let merged = null;
    if (torso && torso.main && neck && neck.main) {
        log('Merging torso + neck...', 'info');
        merged = merge2(torso.main, neck.main, log);
    }

    // ═══ TORSO GROUP ═══
    const torsoGroup = mkEl('g', { id: `${v}_torso_${torsoName}` });
    if (merged) {
        torsoGroup.appendChild(mkEl('path', { id: `torso_${torsoName}_shape`, d: merged, ...gA }));
        log('Merge OK', 'ok');
    } else if (torso && torso.main) {
        torsoGroup.appendChild(mkEl('path', { id: `torso_${torsoName}_shape`, d: torso.main, ...gA }));
        log('Rendered separate', 'warn');
    }
    // Torso hem rib (uses ribClip if present)
    renderRibBlock(torsoGroup, svgEl, `torso_${torsoName}`, torso, seamSw);
    // Torso seams
    if (showSeams && torso?.seams?.length) {
        torso.seams.forEach((d, i) => {
            torsoGroup.appendChild(mkEl('path', { id: `torso_${torsoName}_sem_${i+1}`, d, ...seamA, 'stroke-dasharray': cfg.seamDash }));
        });
    }
    viewGroup.appendChild(torsoGroup);

    // ═══ NECK GROUP ═══
    if (neck) {
        const neckGroup = mkEl('g', { id: `${v}_neck_${neckName}` });
        // Neck fills (inside neck color)
        if (neck.fills) {
            neck.fills.forEach((d, i) => {
                neckGroup.appendChild(mkEl('path', { id: `neck_${neckName}_fill_${i+1}`, d, fill:'#939598', stroke:'#1a1a1a', 'stroke-width': String(parseFloat(sw)*0.3), 'stroke-linejoin':'bevel' }));
            });
        }
        // If torso+neck weren't merged, render neck outline separately
        if (!merged && neck.main) {
            neckGroup.appendChild(mkEl('path', { id: `neck_${neckName}_outline`, d: neck.main, ...gA }));
        }
        // Neck rib (uses ribClip if present)
        renderRibBlock(neckGroup, svgEl, `neck_${neckName}`, neck, seamSw);
        // Neck seams
        if (showSeams && neck.seams?.length) {
            neck.seams.forEach((d, i) => {
                neckGroup.appendChild(mkEl('path', { id: `neck_${neckName}_sem_${i+1}`, d, ...seamA, 'stroke-dasharray': cfg.seamDash }));
            });
        }
        viewGroup.appendChild(neckGroup);
    }

    // ═══ SLEEVES GROUP ═══
    if (sleeve) {
        log('Adding sleeves...', 'info');
        const sleevesGroup = mkEl('g', { id: `${v}_sleeves_${sleeveName}` });

        // Left sleeve sub-group
        const sleeveL = mkEl('g', { id: `${v}_sleeve_${sleeveName}_l` });
        if (sleeve.main_l) sleeveL.appendChild(mkEl('path', { id: `sleeve_${sleeveName}_shape_l`, d: sleeve.main_l, ...gA }));
        if (sleeve.borders && sleeve.borders[0]) {
            sleeveL.appendChild(mkEl('path', { id: `sleeve_${sleeveName}_border_l`, d: sleeve.borders[0], fill:'none', stroke:'#1a1a1a', 'stroke-width':sw, 'stroke-linecap':'round', 'stroke-linejoin':'round' }));
        }

        // Right sleeve sub-group
        const sleeveR = mkEl('g', { id: `${v}_sleeve_${sleeveName}_r` });
        if (sleeve.main_r) sleeveR.appendChild(mkEl('path', { id: `sleeve_${sleeveName}_shape_r`, d: sleeve.main_r, ...gA }));
        if (sleeve.borders && sleeve.borders[1]) {
            sleeveR.appendChild(mkEl('path', { id: `sleeve_${sleeveName}_border_r`, d: sleeve.borders[1], fill:'none', stroke:'#1a1a1a', 'stroke-width':sw, 'stroke-linecap':'round', 'stroke-linejoin':'round' }));
        }

        // Sleeve seams (distributed by side: even indexes to left, odd to right)
        if (showSeams && sleeve.seams?.length) {
            sleeve.seams.forEach((d, i) => {
                const target = (i % 2 === 0) ? sleeveL : sleeveR;
                const side = (i % 2 === 0) ? 'l' : 'r';
                target.appendChild(mkEl('path', { id: `sleeve_${sleeveName}_sem_${side}_${Math.floor(i/2)+1}`, d, ...seamA, 'stroke-dasharray': cfg.seamDash }));
            });
        }

        // Sleeve rib (cuff) — rendered at sleeves group level
        if (sleeve.rib?.length || sleeve.ribClip) {
            renderRibBlock(sleevesGroup, svgEl, `sleeve_${sleeveName}`, sleeve, seamSw);
        }

        sleevesGroup.appendChild(sleeveL);
        sleevesGroup.appendChild(sleeveR);
        viewGroup.appendChild(sleevesGroup);
    }

    // ═══ POCKET (optional toggle) ═══
    const togPocket = document.getElementById('togPocket');
    if (togPocket && togPocket.classList.contains('on') && Object.keys(components.pockets).length) {
        const pkt = components.pockets[Object.keys(components.pockets)[0]];
        if (pkt && pkt.main) {
            const pocketGroup = mkEl('g', { id: `${v}_pocket` });
            pocketGroup.appendChild(mkEl('path', { id: 'pocket_shape', d: pkt.main, fill:'none', stroke:'#1a1a1a', 'stroke-width':sw, 'stroke-linejoin':'round', 'stroke-linecap':'round' }));
            viewGroup.appendChild(pocketGroup);
            log('Pocket added', 'ok');
        }
    }
}

export function generate(state, log) {
    const { svgData, selections, currentMannequin } = state;
    const cfg = MANNEQUIN_CFG[currentMannequin];

    log('Generating...', 'info');

    state.colorHex = document.getElementById('cFill').value;
    const previewFront = document.getElementById('svg-preview');
    const previewBack = document.getElementById('svg-preview-back');
    previewFront.innerHTML = '';
    if (previewBack) previewBack.innerHTML = '';

    // Show/hide back canvas
    const backCard = document.getElementById('canvas-card-back');
    if (backCard) backCard.style.display = cfg.hasBack ? '' : 'none';

    // === FRONT ===
    const svgFront = document.createElementNS(NS, 'svg');
    svgFront.setAttribute('xmlns', NS);
    svgFront.setAttribute('viewBox', cfg.previewViewBox);
    svgFront.setAttribute('width', '100%');
    svgFront.setAttribute('height', '100%');

    renderGarment(svgFront, svgData.front, selections, cfg, log, svgData.mannequin, 'front');
    previewFront.appendChild(svgFront);
    fitViewBoxToContent(svgFront);

    // === BACK (ISO only) ===
    if (cfg.hasBack && previewBack && svgData.back) {
        const hasBackComponents = Object.keys(svgData.back.torsos).length > 0;
        if (hasBackComponents) {
            const svgBack = document.createElementNS(NS, 'svg');
            svgBack.setAttribute('xmlns', NS);
            svgBack.setAttribute('viewBox', cfg.backViewBox);
            svgBack.setAttribute('width', '100%');
            svgBack.setAttribute('height', '100%');

            renderGarment(svgBack, svgData.back, selections, cfg, log, svgData.mannequinBack, 'back');
            previewBack.appendChild(svgBack);
            fitViewBoxToContent(svgBack);
            log('Back view rendered', 'ok');
        }
    }

    // Download buttons
    const canDownload = true;
    document.getElementById('btnDownload').style.display = canDownload ? '' : 'none';
    if (window.innerWidth <= 800) {
    const mDl = document.getElementById('mobileDownload');
    const mTp = document.getElementById('mobileTechPack');
    if (canDownload) mDl.classList.add('show');
    else mDl.classList.remove('show');
    if (mTp) {
        if (!cfg.free) mTp.classList.add('show');
        else mTp.classList.remove('show');
    }
}

    document.getElementById('topbarTitle').textContent = (DICT[selections.torso]||'T-Shirt') + ' \u2014 Generated';
    log('Done!', 'ok');
    document.getElementById('btnTechPack').style.display = cfg.free ? 'none' : '';
}
