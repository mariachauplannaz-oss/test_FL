// ═══ print-zones.js — Predefined print placement zones (Level 1: fixed zones only) ═══
//
// x_cm is offset from Center Front/Back (0=centered, negative=viewer left).
// y_cm is distance from HPS downward to the TOP edge of the zone.
// All values are in cm. The SVG rendering layer (prompt 3B) will convert
// using scale 28.3465 units/cm anchored to the f_cf_neck/b_cf_neck and
// f_hps_l/b_hps_l points already in the mannequin SVG.

export const PRINT_ZONES = {
    full_front:  { id:'f_top_ts_prt_full',  side:'front', label:'Full Front',
                   x_cm:0, y_cm:8, width_cm:27, height_cm:40 },
    bst_c:       { id:'f_top_ts_prt_bst_c', side:'front', label:'Center Chest',
                   x_cm:0, y_cm:9, width_cm:9,  height_cm:9 },
    bst_l:       { id:'f_top_ts_prt_bst_l', side:'front', label:'Left Chest',
                   x_cm:-7.5, y_cm:9, width_cm:9, height_cm:9 },
    bst_r:       { id:'f_top_ts_prt_bst_r', side:'front', label:'Right Chest',
                   x_cm:7.5, y_cm:9, width_cm:9, height_cm:9 },
    full_back:   { id:'b_top_ts_prt_full',  side:'back',  label:'Full Back',
                   x_cm:0, y_cm:8, width_cm:27, height_cm:40 },
    upper_back:  { id:'b_top_ts_prt_upr',   side:'back',  label:'Upper Back',
                   x_cm:0, y_cm:4, width_cm:25, height_cm:8 }
};

// ─── Level 2: print methods ──────────────────────────────────────────────────
// `code` is a 2-letter tag used only to keep the Stripe metadata payload
// (500-char limit) under budget when checkout compresses print placements —
// see js/checkout.js and app.js.
export const PRINT_METHODS = {
    screen:      { id: 'screen',      label: 'Screen Print',                code: 'sc' },
    dtg:         { id: 'dtg',         label: 'DTG (Direct to Garment)',      code: 'dt' },
    embroidery:  { id: 'embroidery',  label: 'Embroidery',                  code: 'em' },
    sublimation: { id: 'sublimation', label: 'Sublimation',                 code: 'su' }
};
