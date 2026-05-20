// ═══ fabrics.js — Fabric specifications ═══

export const FABRIC_SPECS = {
    jersey_150: {
        label:          'Jersey 150 g/m²',
        weight:         150,
        composition:    '100% Cotton',
        width:          150,
        shrinkage:      { length: 5, width: 3 },
        knit_type:      'knit',
        stretch:        'low',
        tags:           ['lightweight', 'breathable'],
        recommended_for: ['Lightweight tees', 'Summer basics']
    },
    jersey_180: {
        label:          'Jersey 180 g/m²',
        weight:         180,
        composition:    '95% Cotton, 5% Elastane',
        width:          160,
        shrinkage:      { length: 5, width: 3 },
        knit_type:      'knit',
        stretch:        'low',
        tags:           ['standard'],
        recommended_for: ['Standard tees', 'Year-round basics']
    },
    jersey_200: {
        label:          'Jersey 200 g/m²',
        weight:         200,
        composition:    '100% Cotton',
        width:          150,
        shrinkage:      { length: 3, width: 2 },
        knit_type:      'knit',
        stretch:        'low',
        tags:           ['heavyweight', 'premium'],
        recommended_for: ['Premium tees', 'Heavyweight basics']
    },
rib_1x1: {
        label:          'Rib 1×1',
        weight:         220,
        composition:    '95% Cotton, 5% Elastane',
        width:          80,
        shrinkage:      { length: 5, width: 5 },
        knit_type:      'knit',
        stretch:        'high',
        tags:           ['ribbed', 'trim'],
        recommended_for: ['Neckbands', 'Cuffs', 'Hem bands']
    },

    // ─── Hoodie / Sweatshirt fabrics ──────────────────────────
    french_terry_300: {
        label:          'French Terry 300 g/m²',
        weight:         300,
        composition:    '100% Cotton',
        width:          180,
        shrinkage:      { length: 5, width: 3 },
        knit_type:      'knit',
        stretch:        'low',
        tags:           ['medium-weight', 'breathable', 'loop-back'],
        recommended_for: ['Mid-season hoodies', 'Premium minimalist hoodies', 'Yoga / lounge']
    },
    brushed_fleece_320: {
        label:          'Brushed Fleece 320 g/m²',
        weight:         320,
        composition:    '80% Cotton, 20% Polyester',
        width:          180,
        shrinkage:      { length: 5, width: 3 },
        knit_type:      'knit',
        stretch:        'low',
        tags:           ['heavyweight', 'warm', 'brushed'],
        recommended_for: ['Classic hoodies', 'University / sport style']
    },
    brushed_fleece_400: {
        label:          'Brushed Fleece 400 g/m²',
        weight:         400,
        composition:    '80% Cotton, 20% Polyester',
        width:          180,
        shrinkage:      { length: 4, width: 3 },
        knit_type:      'knit',
        stretch:        'low',
        tags:           ['heavyweight', 'warm', 'brushed', 'winter'],
        recommended_for: ['Winter hoodies', 'Heavy classic style']
    },
    heavyweight_fleece_500: {
        label:          'Heavyweight Fleece 500 g/m²',
        weight:         500,
        composition:    '100% Cotton',
        width:          180,
        shrinkage:      { length: 3, width: 2 },
        knit_type:      'knit',
        stretch:        'low',
        tags:           ['heavyweight', 'premium', 'streetwear', 'structured'],
        recommended_for: ['Premium streetwear', 'High-end oversize hoodies', 'Structured silhouettes']
    },
    rib_2x2: {
        label:          'Rib 2×2',
        weight:         250,
        composition:    '95% Cotton, 5% Elastane',
        width:          80,
        shrinkage:      { length: 5, width: 5 },
        knit_type:      'knit',
        stretch:        'high',
        tags:           ['ribbed', 'trim', 'heavy', 'wide'],
        recommended_for: ['Wide cuffs', 'Wide waistbands', 'Oversize / retro hoodies']
    }
};
