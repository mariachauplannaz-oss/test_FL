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
function renderRibBlock(svgEl, idPrefix, component, strokeWidth) {
    if (!component || !component.rib || !component.rib.length) return;

    const ribStyle = { fill:'none', stroke:'#1a1a1a', 'stroke-width': strokeWidth, 'stroke-linecap':'round', 'stroke-linejoin':'round' };

    if (component.ribClip) {
        const clipId = `ribClip-${idPrefix}-${++ribClipCounter}`;

        // 1) Render the rib_shape as a visible gray fill (like Illustrator's cls-15)
        svgEl.appendChild(mkEl('path', {
            id: `${idPrefix}_rib_shape`,
            d: component.ribClip,
            fill: '#414042',
            'fill-opacity': '0.25',
            stroke: 'none'
        }));

        // 2) Ensure <defs> exists for the clipPath
        let defs = svgEl.querySelector('defs');
        if (!defs) {
            defs = mkEl('defs', {});
            svgEl.insertBefore(defs, svgEl.firstChild);
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
        svgEl.appendChild(clippedGroup);
    } else {
        // No clip shape — render lines directly (legacy/simple case)
        component.rib.forEach((d, i) => {
            svgEl.appendChild(mkEl('path', { id: `${idPrefix}_rib_${i+1}`, d, ...ribStyle }));
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

function renderGarment(svgEl, components, selections, cfg, log, ghostMarkup) {
    const fill = document.getElementById('cFill').value;
    const showSeams = document.getElementById('togSeams').classList.contains('on');

    const sw = cfg.strokeWidth;
    const seamSw = cfg.seamStrokeWidth;
    const gA = { fill, stroke:'#1a1a1a', 'stroke-width':sw, 'stroke-linejoin':'round', 'stroke-linecap':'round' };
    const seamA = { fill:'none', stroke:'#1a1a1a', 'stroke-width':seamSw, 'stroke-linecap':'round' };

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

    // MERGE torso + neck
    let merged = null;
    if (torso && torso.main && neck && neck.main) {
        log('Merging torso + neck...', 'info');
        merged = merge2(torso.main, neck.main, log);
    }

    if (merged) {
        svgEl.appendChild(mkEl('path', { id:'torso_' + torsoName + '_nck_' + neckName, d:merged, ...gA }));
        log('Merge OK', 'ok');
    } else if (torso && torso.main) {
        svgEl.appendChild(mkEl('path', { id:'torso_' + torsoName, d:torso.main, ...gA }));
        if (neck && neck.main) svgEl.appendChild(mkEl('path', { id:'nck_' + neckName, d:neck.main, ...gA }));
        log('Rendered separate', 'warn');
    }

    // Rib binding on torso hem — handles gray fill + clipPath if rib_shape present
    renderRibBlock(svgEl, 'torso_' + torsoName, torso, seamSw);

    // Neck fills
    if (neck && neck.fills) {
        neck.fills.forEach((d,i) => {
            svgEl.appendChild(mkEl('path', { id:'nck_' + neckName + '_fill_' + (i+1), d, fill:'#939598', stroke:'#1a1a1a', 'stroke-width': String(parseFloat(sw)*0.3), 'stroke-linejoin':'bevel' }));
        });
    }

    // Rib binding on neck — handles gray fill + clipPath if rib_shape present
    renderRibBlock(svgEl, 'nck_' + neckName, neck, seamSw);

    // Sleeves (OVERLAY)
    if (sleeve) {
        log('Adding sleeves...', 'info');
        if (sleeve.main_l) svgEl.appendChild(mkEl('path', { id:'slv_' + sleeveName + '_shape_l', d:sleeve.main_l, ...gA }));
        if (sleeve.main_r) svgEl.appendChild(mkEl('path', { id:'slv_' + sleeveName + '_shape_r', d:sleeve.main_r, ...gA }));
        if (sleeve.borders) {
            sleeve.borders.forEach((d,i) => {
                svgEl.appendChild(mkEl('path', { id:'slv_' + sleeveName + '_border_' + (i+1), d, fill:'none', stroke:'#1a1a1a', 'stroke-width':sw, 'stroke-linecap':'round', 'stroke-linejoin':'round' }));
            });
        }
        // Rib binding on sleeve cuff — handles gray fill + clipPath if rib_shape present
        renderRibBlock(svgEl, 'slv_' + sleeveName, sleeve, seamSw);
    }

    // Seams
    if (showSeams) {
        const torsoSeams = (torso?.seams||[]).map(d => ({d, src:'torso'}));
        const neckSeams = (neck?.seams||[]).map(d => ({d, src:'nck'}));
        const sleeveSeams = (sleeve?.seams||[]).map(d => ({d, src:'slv'}));
        const allSeams = [...torsoSeams, ...neckSeams, ...sleeveSeams];
        const seamCount = { torso:0, nck:0, slv:0 };
        allSeams.forEach(({d, src}) => {
            seamCount[src]++;
            svgEl.appendChild(mkEl('path', { id:'sem_' + src + '_' + seamCount[src], d, ...seamA, 'stroke-dasharray': cfg.seamDash }));
        });
        if (allSeams.length) log('Seams: ' + allSeams.length, 'ok');
    }

    // Pockets (only if toggle exists and is on)
    const togPocket = document.getElementById('togPocket');
    if (togPocket && togPocket.classList.contains('on') && Object.keys(components.pockets).length) {
        const pkt = components.pockets[Object.keys(components.pockets)[0]];
        if (pkt && pkt.main) {
            svgEl.appendChild(mkEl('path', { id:'pocket', d:pkt.main, fill:'none', stroke:'#1a1a1a', 'stroke-width':sw, 'stroke-linejoin':'round', 'stroke-linecap':'round' }));
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

    renderGarment(svgFront, svgData.front, selections, cfg, log, svgData.mannequin);
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

            renderGarment(svgBack, svgData.back, selections, cfg, log, svgData.mannequinBack);
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
