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
export const PRINT_METHODS = {
    screen: {
        id: 'screen',
        label: 'Screen Print',
        specs: [
            ['Artwork format', 'Vector (.AI, .EPS, .PDF) — color-separated'],
            ['Color system',   'Pantone Solid Coated (PMS)'],
            ['Ink type',       'Specify: Plastisol or Water-based'],
            ['Mesh count',     '110–160 threads/inch (adjust to detail level)'],
            ['Note',           'Provide color-separated vector file to factory. Each spot color = 1 screen.']
        ]
    },
    dtg: {
        id: 'dtg',
        label: 'DTG (Direct to Garment)',
        specs: [
            ['Artwork format', 'Raster (.PNG, .TIFF) — min 300 DPI at actual print size'],
            ['Color profile',  'sRGB (printer converts internally)'],
            ['Pre-treatment',  'Required on dark garments; not required on white/light'],
            ['Print resolution', 'Up to 1200 DPI output'],
            ['Note',           'Provide high-resolution raster file at actual print dimensions. White underbase auto-generated for dark fabrics.']
        ]
    },
    embroidery: {
        id: 'embroidery',
        label: 'Embroidery',
        specs: [
            ['Artwork format', 'Digitized stitch file (.DST, .EMB, .PES) — or vector (.AI) for factory digitization'],
            ['Thread type',    'Polyester embroidery thread (Madeira, Isacord, or equivalent)'],
            ['Stitch density', '5–7 SPI for fill stitches, 10–12 SPI for satin borders'],
            ['Backing',        'Cutaway stabilizer for knit fabrics; tearaway for woven'],
            ['Note',           'If only vector artwork is available, factory digitization is required — confirm lead time with manufacturer.']
        ]
    },
    sublimation: {
        id: 'sublimation',
        label: 'Sublimation',
        specs: [
            ['Artwork format', 'Raster (.PNG, .TIFF) — min 300 DPI at actual print size'],
            ['Color profile',  'CMYK'],
            ['Substrate',      'Minimum 65% polyester content required'],
            ['Transfer',       'Heat press 190–210 °C, 45–60 seconds'],
            ['Note',           'Not suitable for 100% cotton fabrics. Colors shift on dark substrates — white or light base recommended.']
        ]
    }
};
