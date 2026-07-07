// ═══ print-renderer.js — Draws/clears print-zone rectangles on the live flat SVGs ═══
//
// Injects <rect> overlays directly into the DOM SVGs at #svg-preview / #svg-preview-back.
// specsheet.js's drawFlat() clones these same DOM nodes to build the PDF flat image,
// so anything drawn here appears in the Tech Pack PDF automatically — no separate
// PDF-drawing code needed for the rectangles themselves.
//
// Anchor coordinates are fixed reference values from mannequin_iso.svg
// (source viewBox 0 0 7086.61 4762.2), confirmed to match the named point groups
// f_cf_neck/f_hps_l/f_hps_r (front) and b_cf_neck/b_hps_l/b_hps_r (back) in that
// file. generate() in generator.js crops the preview's viewBox to the rendered
// content (fitViewBoxToContent) but never rescales it, so these absolute
// coordinates stay valid regardless of which garment/silhouette is showing.

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

function renderZones(svgEl, side, placements) {
    clearZones(svgEl);
    if (!svgEl) return;

    const sidePlacements = placements.filter(p => p.side === side && p.mode === 'zone');
    if (sidePlacements.length === 0) return;

    const anchor = ANCHORS[side];
    const layer = document.createElementNS(NS, 'g');
    layer.setAttribute('id', LAYER_ID);

    sidePlacements.forEach(p => {
        const zoneDef = PRINT_ZONES[p.zone];
        const rectId  = zoneDef ? zoneDef.id : `${side}_print_${p.zone}`;

        const rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('id', rectId);
        rect.setAttribute('x', anchor.cf_x + (p.x_cm * SCALE) - (p.width_cm * SCALE / 2));
        rect.setAttribute('y', anchor.hps_y + (p.y_cm * SCALE));
        rect.setAttribute('width',  p.width_cm  * SCALE);
        rect.setAttribute('height', p.height_cm * SCALE);
        Object.entries(RECT_ATTRS).forEach(([k, v]) => rect.setAttribute(k, v));
        layer.appendChild(rect);
    });

    svgEl.appendChild(layer);
}

export function updatePrintZones(state) {
    const svgFront = document.querySelector('#svg-preview svg');
    const svgBack  = document.querySelector('#svg-preview-back svg');
    const placements = (state.print && state.print.enabled) ? state.print.placements : [];

    renderZones(svgFront, 'front', placements);
    renderZones(svgBack,  'back',  placements);
}
