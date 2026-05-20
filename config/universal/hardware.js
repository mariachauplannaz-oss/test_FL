// ═══ hardware.js — Hardware specifications (eyelets, drawcords, aglets) ═══
//
// New universal category introduced in nomenclature v6 for hoodie/outerwear.
// Same structural pattern as fabrics.js / needles.js / threads.js.
//
// Categories:
//   • EYELETS  — metal or embroidered openings on hood
//   • DRAWCORDS — cord that passes through the eyelets
//   • AGLETS   — cord-end tips (metal, heat-shrink, sewn closure)
//
// Style presets (luxury / streetwear / minimalist / vintage / athleisure)
// live in garment configs (e.g. HOODIE_CONFIG.stylePresets) — this file only
// declares the individual items.

export const HARDWARE_SPECS = {

    // ─── EYELETS ──────────────────────────────────────────────
    eyelet_brass_10mm: {
        category:       'eyelet',
        label:          'Brass Eyelet 10 mm',
        diameter:       10,
        material:       'Brass',
        finish:         'Polished or brushed metal',
        weight:         2,             // grams per pair
        tags:           ['metal', 'premium', 'classic', 'corrosion-resistant'],
        recommended_for: ['Luxury / Premium hoodies', 'Classic minimalist'],
        notes:          'Brass resists rust on washing. Requires interfacing reinforcement behind fabric.'
    },
    eyelet_xl_matte_black: {
        category:       'eyelet',
        label:          'XL Matte Eyelet (Black)',
        diameter:       12,
        material:       'Coated metal',
        finish:         'Matte black or matte white',
        weight:         3,
        tags:           ['metal', 'streetwear', 'oversized', 'bold'],
        recommended_for: ['Streetwear Pro', 'Oversize hoodies'],
        notes:          'High-visibility hardware. Pairs with thick tubular drawcords.'
    },
    eyelet_invisible_embroidered: {
        category:       'eyelet',
        label:          'Embroidered Eyelet (Bird-Eye)',
        diameter:       8,
        material:       'Thread (tone-on-tone)',
        finish:         'Hand-finished embroidery',
        weight:         0.5,
        tags:           ['no-metal', 'minimalist', 'invisible', 'soft'],
        recommended_for: ['Minimalist / Clean style', 'Tone-on-tone designs'],
        notes:          'No metal — pure embroidered opening. Slower production. No rust risk.'
    },

    // ─── DRAWCORDS ────────────────────────────────────────────
    drawcord_flat_cotton: {
        category:       'drawcord',
        label:          'Flat Cotton Drawcord',
        width:          12,            // mm
        thickness:      2,
        length:         120,           // cm (default; user-editable)
        material:       '100% Cotton',
        finish:         'Self-fabric jersey',
        tags:           ['flat', 'soft', 'minimalist', 'standard'],
        recommended_for: ['Minimalist / Clean', 'Standard hoodies'],
        notes:          'Flat shape lies clean against fabric. Pairs with small/embroidered eyelets.'
    },
    drawcord_tubular_thick: {
        category:       'drawcord',
        label:          'Tubular Thick Drawcord 10 mm',
        diameter:       10,
        length:         150,           // cm — longer for streetwear (hangs below pocket)
        material:       'Cotton / Polyester blend',
        finish:         'Tubular knit',
        tags:           ['tubular', 'thick', 'streetwear', 'voluminous'],
        recommended_for: ['Streetwear Pro', 'Oversize / chunky hoodies'],
        notes:          'High volume. Pairs with XL matte eyelets.'
    },
    drawcord_reflective: {
        category:       'drawcord',
        label:          'Reflective 3M Drawcord',
        diameter:       6,
        length:         120,
        material:       'Polyester + 3M reflective threads',
        finish:         'Reflective stripes / full reflective',
        tags:           ['technical', 'athleisure', 'visibility', 'sport'],
        recommended_for: ['Athleisure', 'Technical sportswear'],
        notes:          'Reflective under light. Pairs with laser-cut eyelets and silicone aglets.'
    },

    // ─── AGLETS (cord-end tips) ───────────────────────────────
    aglet_metal: {
        category:       'aglet',
        label:          'Metal Aglet (Press-Fit)',
        material:       'Brass / Steel',
        finish:         'Polished, rose gold, silver, or gunmetal',
        weight:         1.5,           // grams per pair
        tags:           ['metal', 'premium', 'heavy', 'permanent'],
        recommended_for: ['Luxury / Premium', 'Classic structured hoodies'],
        notes:          'Heavy press-fit metal cap. Permanent — cannot be removed.'
    },
    aglet_heat_shrink: {
        category:       'aglet',
        label:          'Heat-Shrink Aglet (Branded)',
        material:       'PVC / Rubber',
        finish:         'Printable surface for logo',
        weight:         0.3,
        tags:           ['plastic', 'streetwear', 'branded', 'lightweight'],
        recommended_for: ['Streetwear Pro', 'Branded merch hoodies'],
        notes:          'Heat-shrunk tube. Logo printing possible. Lightweight and impact-free.'
    },
    aglet_self_sewn: {
        category:       'aglet',
        label:          'Self-Sewn Closure (No Aglet)',
        material:       'N/A — folded cord + stitch',
        finish:         'Folded over and stitched closed',
        weight:         0,
        tags:           ['no-hardware', 'minimalist', 'eco', 'invisible'],
        recommended_for: ['Minimalist / Clean', 'Vintage / Artisanal'],
        notes:          'Cord end is folded back and sewn — no separate component required.'
    }
};

// ─── helpers ──────────────────────────────────────────────────
// Returns all hardware items of a given category (eyelet / drawcord / aglet)
export function getHardwareByCategory(category) {
    return Object.entries(HARDWARE_SPECS)
        .filter(([_, spec]) => spec.category === category)
        .map(([key, spec]) => ({ key, ...spec }));
}

// Returns a single hardware spec by key
export function getHardware(key) {
    return HARDWARE_SPECS[key] || null;
}
