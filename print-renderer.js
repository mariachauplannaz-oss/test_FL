// ═══ print-renderer.js — Draws/clears print-zone rectangles + uploaded artwork
// on the live flat SVGs ═══
//
// Injects <rect> (and, once an image is uploaded, a clipped <image> on top)
// directly into the DOM SVGs at #svg-preview / #svg-preview-back.
// specsheet.js's drawFlat() clones these same DOM nodes to build the PDF flat
// image, so anything drawn here appears in the Tech Pack PDF automatically —
// no separate PDF-drawing code needed for the rectangle or the image.
//
// Anchor coordinates are fixed reference values from mannequin_iso.svg
// (source viewBox 0 0 7086.61 4762.2), confirmed to match the named point
// groups f_cf_neck/f_hps_l/f_hps_r (front) and b_cf_neck/b_hps_l/b_hps_r
// (back) in that file. generate() in generator.js crops the preview's
// viewBox to the rendered content (fitViewBoxToContent) but never rescales
// it, so these absolute coordinates stay valid regardless of which
// garment/silhouette is showing.

import { PRINT_ZONES } from './config/print-zones.js';

const NS = 'http://www.w3.org/2000/svg';
const LAYER_ID = 'print_zones_layer';
const SCALE = 28.3465; // SVG units per cm

const ANCHORS = {
    front: { cf_x: 1751.43, hps_y: 563.46 },
    back:  { cf_x: 5294.74, hps_y: 569.67 }
};

const RECT_ATTRS = {
    fill: '#E4007C',
    'fill-opacity': '0.08',
    stroke: '#E4007C',
    'stroke-width': '4',
    'stroke-dasharray': '22 12'
};

function clearZones(svgEl) {
    if (!svgEl) return;
    const existing = svgEl.querySelector(`#${LAYER_ID}`);
    if (existing) existing.remove();
}

// ─── Shared geometry (used by renderZones, updateSingleImage, and drag) ──────

// Torso-shape bbox center, per side. f_cf_neck/b_cf_neck are body/mannequin
// landmarks, not the garment's own geometric center, and the two don't quite
// line up (~0.7cm gap, visible on small zones) — see ANCHORS fallback below.
function getCenterX(svgEl, side) {
    const torsoShape = svgEl.querySelector('[id$="_shape"]');
    const bbox = torsoShape ? torsoShape.getBBox() : null;
    return bbox ? bbox.x + bbox.width / 2 : ANCHORS[side].cf_x; // fallback
}

function getRectBounds(svgEl, side, p) {
    const anchor = ANCHORS[side];
    const centerX = getCenterX(svgEl, side);
    return {
        rectX: centerX + (p.x_cm * SCALE) - (p.width_cm * SCALE / 2),
        rectY: anchor.hps_y + (p.y_cm * SCALE),
        rectW: p.width_cm  * SCALE,
        rectH: p.height_cm * SCALE
    };
}

function zoneRectId(side, p) {
    const zoneDef = PRINT_ZONES[p.zone];
    return zoneDef ? zoneDef.id : `${side}_print_${p.zone}`;
}

// Cover-fit geometry: at scale=1.0 the image covers the zone exactly (one
// dimension flush, the other overflowing per aspect ratio, no gaps). Larger
// scale zooms in further (both dimensions grow); offsetX_pct/offsetY_pct
// (-50..+50, 0=centered) pan within whatever slack that scale provides.
// The ±50 range is deliberately fixed and scale-independent — slack is
// recomputed fresh from the CURRENT scale every time, so ±50 always means
// "image edge exactly at zone edge", never empty space, at any scale.
function computeImageGeometry(placement, rectX, rectY, rectW, rectH) {
    const { ratio, scale, offsetX_pct, offsetY_pct } = placement.image;
    const zoneRatio = rectW / rectH;
    let baseW, baseH;
    if (ratio > zoneRatio) { baseH = rectH; baseW = rectH * ratio; }
    else                   { baseW = rectW; baseH = rectW / ratio; }
    const imageW = baseW * scale;
    const imageH = baseH * scale;
    const slackX = imageW - rectW;
    const slackY = imageH - rectH;
    const imageX = (rectX - slackX / 2) + (offsetX_pct / 50) * (slackX / 2);
    const imageY = (rectY - slackY / 2) + (offsetY_pct / 50) * (slackY / 2);
    return { imageX, imageY, imageW, imageH, slackX, slackY };
}

function positionImage(imageEl, placement, rectX, rectY, rectW, rectH) {
    const { imageX, imageY, imageW, imageH } = computeImageGeometry(placement, rectX, rectY, rectW, rectH);
    imageEl.setAttribute('x', imageX);
    imageEl.setAttribute('y', imageY);
    imageEl.setAttribute('width', imageW);
    imageEl.setAttribute('height', imageH);
}

// ─── Drag controller — ONE shared set of window listeners, not one per image.
// Per-image mousedown/touchstart only records which placement is being
// dragged; window-level move/end listeners (attached once, at module load)
// look up the active drag rather than being re-attached on every re-render.
// This avoids leaking a new window listener set every time renderZones()
// tears down and recreates the <image> elements. ─────────────────────────────

let activeDrag = null; // { image, placement, startPt, startOffX, startOffY, bounds, onCommit }

function clientToSVGPoint(svg, clientX, clientY) {
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    return pt.matrixTransform(svg.getScreenCTM().inverse());
}

function beginDrag(image, placement, bounds, onCommit, clientX, clientY) {
    const svg = image.ownerSVGElement;
    activeDrag = {
        image, placement, bounds, onCommit,
        startPt: clientToSVGPoint(svg, clientX, clientY),
        startOffX: placement.image.offsetX_pct,
        startOffY: placement.image.offsetY_pct
    };
}

function updateDrag(clientX, clientY) {
    if (!activeDrag) return;
    const { image, placement, bounds, startPt, startOffX, startOffY } = activeDrag;
    const svg = image.ownerSVGElement;
    const pt = clientToSVGPoint(svg, clientX, clientY);
    const dx = pt.x - startPt.x;
    const dy = pt.y - startPt.y;

    const { ratio, scale } = placement.image;
    const { rectX, rectY, rectW, rectH } = bounds;
    const zoneRatio = rectW / rectH;
    let baseW, baseH;
    if (ratio > zoneRatio) { baseH = rectH; baseW = rectH * ratio; }
    else                   { baseW = rectW; baseH = rectW / ratio; }
    const slackX = baseW * scale - rectW;
    const slackY = baseH * scale - rectH;

    const candX = slackX !== 0 ? startOffX + (dx / (slackX / 2)) * 50 : 0;
    const candY = slackY !== 0 ? startOffY + (dy / (slackY / 2)) * 50 : 0;
    placement.image.offsetX_pct = Math.max(-50, Math.min(50, candX));
    placement.image.offsetY_pct = Math.max(-50, Math.min(50, candY));

    positionImage(image, placement, rectX, rectY, rectW, rectH);
}

function endDrag() {
    if (!activeDrag) return;
    const { onCommit } = activeDrag;
    activeDrag = null;
    onCommit();
}

window.addEventListener('mousemove', (e) => updateDrag(e.clientX, e.clientY));
window.addEventListener('mouseup', endDrag);
window.addEventListener('touchmove', (e) => {
    if (!activeDrag) return;
    e.preventDefault();
    updateDrag(e.touches[0].clientX, e.touches[0].clientY);
}, { passive: false });
window.addEventListener('touchend', endDrag);

function attachDragHandlers(image, placement, bounds, onCommit) {
    image.style.cursor = 'grab';
    image.addEventListener('mousedown', (e) => {
        e.preventDefault();
        beginDrag(image, placement, bounds, onCommit, e.clientX, e.clientY);
    });
    image.addEventListener('touchstart', (e) => {
        e.preventDefault();
        beginDrag(image, placement, bounds, onCommit, e.touches[0].clientX, e.touches[0].clientY);
    }, { passive: false });
}

// ─── Rendering ────────────────────────────────────────────────────────────

function renderZones(svgEl, side, placements, onImageCommit) {
    clearZones(svgEl);
    if (!svgEl) return;

    const sidePlacements = placements.filter(p => p.side === side && p.mode === 'zone');
    if (sidePlacements.length === 0) return;

    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('id', LAYER_ID);

    sidePlacements.forEach(p => {
        const rectId = zoneRectId(side, p);
        const { rectX, rectY, rectW, rectH } = getRectBounds(svgEl, side, p);

        const rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('id', rectId);
        rect.setAttribute('x', rectX);
        rect.setAttribute('y', rectY);
        rect.setAttribute('width', rectW);
        rect.setAttribute('height', rectH);
        Object.entries(RECT_ATTRS).forEach(([k, v]) => rect.setAttribute(k, v));
        layer.appendChild(rect);

        if (p.image && p.image.dataURI && p.image.ratio) {
            let defs = svgEl.querySelector('defs');
            if (!defs) {
                defs = document.createElementNS(NS, 'defs');
                svgEl.insertBefore(defs, svgEl.firstChild);
            }

            const clipId = `clip_${rectId}`;
            const clipPath = document.createElementNS(NS, 'clipPath');
            clipPath.setAttribute('id', clipId);
            const clipRect = document.createElementNS(NS, 'rect');
            clipRect.setAttribute('x', rectX);
            clipRect.setAttribute('y', rectY);
            clipRect.setAttribute('width', rectW);
            clipRect.setAttribute('height', rectH);
            clipPath.appendChild(clipRect);
            defs.appendChild(clipPath);

            const image = document.createElementNS(NS, 'image');
            image.setAttribute('id', `img_${rectId}`);
            image.setAttribute('href', p.image.dataURI);
            image.setAttribute('clip-path', `url(#${clipId})`);
            // preserveAspectRatio intentionally "none" — we compute the exact
            // cover/pan/zoom geometry ourselves in computeImageGeometry(), so
            // the browser's own aspect-fit logic would only fight with it.
            image.setAttribute('preserveAspectRatio', 'none');
            positionImage(image, p, rectX, rectY, rectW, rectH);
            layer.appendChild(image);

            attachDragHandlers(image, p, { rectX, rectY, rectW, rectH }, () => onImageCommit && onImageCommit());
        }
    });

    svgEl.appendChild(layer);
}

export function updatePrintZones(state) {
    const svgFront = document.querySelector('#svg-preview svg');
    const svgBack  = document.querySelector('#svg-preview-back svg');
    const placements = (state.print && state.print.enabled) ? state.print.placements : [];

    const onImageCommit = () => updatePrintZones(state);
    renderZones(svgFront, 'front', placements, onImageCommit);
    renderZones(svgBack,  'back',  placements, onImageCommit);
}

// Narrower update for the scale slider's live 'input' feedback — repositions
// just the one placement's <image> (and its clipPath, which doesn't move but
// must exist) without tearing down/rebuilding the whole layer or the other
// zones' drag handlers.
export function updateSingleImage(state, placement) {
    if (!placement.image || !placement.image.ratio) return;
    const svgEl = document.querySelector(placement.side === 'front' ? '#svg-preview svg' : '#svg-preview-back svg');
    if (!svgEl) return;
    const rectId = zoneRectId(placement.side, placement);
    const image = svgEl.querySelector(`#img_${rectId}`);
    if (!image) return;
    const bounds = getRectBounds(svgEl, placement.side, placement);
    positionImage(image, placement, bounds.rectX, bounds.rectY, bounds.rectW, bounds.rectH);
}
