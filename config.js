// ═══ config.js — Core app config + re-exports from /config/ ═══
// Only DICT, GARMENT_ICONS, CATEGORIES, MANNEQUIN_CFG live here directly.
// Everything else is re-exported from the modular files below.

export const DICT = {
    reg:'Regular', mok:'Mock Neck', v:'V-Neck', rnd:'Round', scp:'Scoop', bot:'Boat',
    trt:'Turtle', vdp:'Deep V', set:'Set-in', rag:'Raglan', cap:'Cap', lon:'Long',
    low:'Drop Shoulder', crp:'Cropped', bag:'Baggy', str:'Straight', slm:'Slim', wde:'Wide'
};

export const MANNEQUIN_CFG = {
    iso: {
        file: 'mannequin_iso.svg',
        previewViewBox:    '134 286 3275 4174',
        backViewBox:       '3677 266 3275 4171',
        exportViewBox:     '204 316 3135 4114',
        exportBackViewBox: '3747 296 3135 4111',
        strokeWidth:    '8',
        seamStrokeWidth:'4',
        seamDash:       '12 12',
        label:          'ISO EU38',
        hasBack:        true
    }
};

export const GARMENT_ICONS = {
    tshirt: '<svg width="40" height="40" viewBox="0 0 48 48" fill="none"><path d="M32.59 41.98H12.23c-.93 0-1.81-.09-2.26-1.1l-.02-.04c-.37-.83.01-1.37.27-2.12.68-2 .93-4.2 1.12-6.29l.15-2.48c.01-.27.06-.54.06-.8l0-6.02c-.05-1.06-.26-2.11-.3-3.17-2.02-.09-1.77 2.33-3.43 2.04-2.64-.46-4.5-3.08-6.03-5.06-.35-.45-.85-.95-.99-1.51-.46-1.78 2.01-2.71 3.22-3.38l4.13-2.33c.47-.28.94-.55 1.39-.86 1.05-.73 2.07-1.59 3.4-1.71l.83-.03c1.5-.12 2.89-.68 4.33-1.06.58-.06.84.49 1.19.85 1.32 1.39 3.02 1.75 4.85 1.74 1.78-.01 3.68-.45 4.85-1.89.72-.87.49-.81 1.66-.48l2.43.65c.4.09.8.15 1.21.18 1.59.11 2.2.31 3.58 1.29l1.28.87 6.31 3.58c.61.35 1.69.92 1.8 1.71l.02.1c.18.72-.33 1.3-.75 1.81l-1.61 2.1c-1.1 1.36-2.88 3.24-4.66 3.43h-.04c-.79.08-1.04-.17-1.41-.78-.45-.74-1.15-1.6-2.08-1.09-.06.26-.06.53-.08.79l-.14 1.39c-.05.34-.04.69-.04 1.04l.01 6.11c.01.26.07.51.08.77l.03 1.3.01.26.05.78.52 3.64c.1.59.19 1.19.37 1.75.14.45.54 1.37.6 1.73 0 .03.01.06.02.09.34.94-.59 1.97-1.48 2.15l-.04 0c-.44.09-.96.04-1.41.04h-2.65z" fill="currentColor"/></svg>',
    pants:  '<svg width="40" height="40" viewBox="0 0 48 48" fill="none"><path d="M25.8 30.58l-1.77-8.57c-.14.31-.18.66-.25.99l-1.55 7.41-.76 4.14-1.06 6.74c-.2 1.13-1.34 1.07-2.17 1.07l-5.8 0c-.19 0-.39.01-.57-.03l-.03-.01c-1.22-.28-1.16-1.22-1.16-2.2l.01-8.63.11-3.91c.01-.37.07-.74.09-1.1l.01-1.84c.01-.38.08-.76.09-1.14l.02-1.94c.01-.27.06-.54.07-.81l.12-3.09.19-2.79c.09-1.07.27-2.14.48-3.2l.39-1.97c.06-.29.04-.61.04-.91l0-1.33c0-.29-.04-.68.09-.94.32-.63.73-.9 1.46-.95l19.72-.01c1.6 0 2.14.33 2.14 1.92l0 1.18c0 .39.05.77.11 1.17l.18.99.05.18.2.93c.14.74.23 1.49.3 2.23l.14 2.04c.02.25 0 .56.06.8l.03.13c.11.5.06 1.07.08 1.58.01.2.06.4.06.6l.02 1.5c.01.22.06.45.07.67l.02 1.58c.01.29.08.57.09.86l.03 1.94c.01.16.04.32.04.49l.05 2.29c.01.18.05.36.06.54l.01 1.6c.01.19.05.38.05.57l.01 8.3c0 1.12.25 2.24-1.13 2.66l-.07.02c-.14.03-.3.03-.44.03l-5.47 0c-2.02 0-2.45.21-2.77-2.11l-1.67-9.67z" fill="currentColor"/></svg>',
    jacket: '<svg width="40" height="40" viewBox="0 0 48 48" fill="none"><path d="M24.46 42.03l-.37-.4c-1.41 1.45-2.27 1.47-4.24 1.48l-3.59 0c-2.13 0-4.12-1.14-4.69-3.3-.08-.3-.1-.61-.17-.92l-.44.23c-1.8.84-4.1.2-4.92-1.67-.18-.42-.58-2-.59-2.42l-.1-1.68 0-4.9c.01-.21.06-.42.07-.64.22-3.58.84-7.31 2.16-10.66 1.23-3.12 2.97-5.42 6.22-6.68l1.86-.64c.42-.12.84-.22 1.24-.4l-.05-.21c-.55-1.71 1.23-3.68 2.89-4.02.36-.07.72-.09 1.08-.14l.92-.09c.16-.01.32-.05.48-.05l1.02-.01 3.07.08c1.79.12 4.08.59 4.73 2.56l.08.25c.15.47.12 1.2-.07 1.67l2.37.76c2.47.8 4.69 2.41 5.95 4.72l1.23 2.76c.22.45.3.98.47 1.45l.93 4.03c.05.15.06.3.08.46l.42 3.13.07 1.13c.08.8.08 1.38.08 2.18l-.03 3.52c-.01.19-.06.37-.07.56-.02.37.01.78-.05 1.14-.07.45-.36 1.64-.51 2.04-.42 1.13-1.48 1.99-2.68 2.14-.85.11-2 0-2.7-.54l-.02-.02c-.03.2-.05.41-.09.61-.49 2.17-2.23 3.56-4.46 3.65l-4.26 0c-1.27 0-2.21-.03-3.23-.98l-.1-.1z" fill="currentColor"/></svg>'
};

export const CATEGORIES = [
    { id:'tshirt', label:'T-Shirt', icon:'tshirt' },
    { id:'pants',  label:'Pants',   icon:'pants',  disabled:true },
    { id:'jacket', label:'Jacket',  icon:'jacket', disabled:true }
];

// ─── Re-exports — keeps existing imports working everywhere ───
export { FABRIC_SPECS }                                              from './config/universal/fabrics.js';
export { CARE_SYMBOLS, FABRIC_CARE_MAP }                     from './config/universal/care-symbols.js';
export { STITCH_SPECS }                                              from './config/universal/stitches.js';
export { COMPONENT_META, collectMeasurements, collectConstruction }  from './config/garments/tshirt.js';
export { ISO_BODY, SIZE_EQUIV, TOLERANCES, GRADING, PANTONE_APPROX, findClosestPantone } from './config/measurements.js';

// ═══════════════════════════════════════════════════════════════
// PACKING_SPECS
// ═══════════════════════════════════════════════════════════════
export const PACKING_SPECS = {
    standard: {
        label: 'Standard Fold Pack',
        method: 'Garment folded with tissue paper insert. Placed in individual polybag (recycled PE, 35×45 cm). Size sticker on bag.',
        carton: '60×40×30 cm export carton. Max 24 pcs per carton.',
        labels: 'Individual polybag + carton label with PO#, style, size, color, qty'
    }
};
