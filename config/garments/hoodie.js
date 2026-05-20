// ═══ hoodie.js — Hoodie component metadata, measurements, construction ═══
//
// Follows the same structure as tshirt.js for consistency.
// Letter prefix: HN- (Hoodie) — distinct from TS- (T-shirt).
// Base size: EU38, ISO 8559-1.
// Silhouettes: slm (slim), reg (regular), ovr (oversize).

import { GRADING, TOLERANCES, GENDER_OFFSETS } from '../measurements.js';

export const COMPONENT_META = {

    // ─── TORSOS ───────────────────────────────────────────────
    // Silhouettes: slm / reg / ovr
    torsos: {
        slm: {
            label: 'Slim Fit',
            ease: 'slim',
            measures: {
                chest:      { letter: 'HN-A', label: 'Chest (1/2)',           value: 25.5, unit: 'cm', pom: 'Measured flat, 2 cm below armhole seam, edge to edge' },
                waist:      { letter: 'HN-B', label: 'Waist (1/2)',           value: 22,   unit: 'cm', pom: 'Measured flat at natural waist, edge to edge' },
                length:     { letter: 'HN-C', label: 'Body Length (HPS)',     value: 64,   unit: 'cm', pom: 'From HPS seam straight down to hem edge (incl. rib)' },
                shoulder:   { letter: 'HN-D', label: 'Shoulder Width',        value: 39,   unit: 'cm', pom: 'Shoulder seam to shoulder seam, across back yoke' },
                hem:        { letter: 'HN-E', label: 'Hem Width (1/2)',       value: 22,   unit: 'cm', pom: 'Measured flat at rib hem, edge to edge (relaxed)' },
                armhole:    { letter: 'HN-F', label: 'Armhole Straight',      value: 22,   unit: 'cm', pom: 'Shoulder seam to underarm seam, straight' }
            },
            back_measures: {
                across_back: { letter: 'HN-N', label: 'Across Back (1/2)', value: 18, unit: 'cm', pom: 'Armhole seam to armhole seam, 10 cm below CB neck, measured flat' },
                back_length: { letter: 'HN-O', label: 'CB Length',         value: 65, unit: 'cm', pom: 'From CB neck seam straight down to hem edge' }
            },
            construction: 'Side seams: ISO 514 (overlock 4-thread). Rib hem attached with ISO 406 coverseam.',
            iso_norm: 'ISO 514'
        },
        reg: {
            label: 'Regular Fit',
            ease: 'regular',
            measures: {
                chest:      { letter: 'HN-A', label: 'Chest (1/2)',           value: 26.5, unit: 'cm', pom: 'Measured flat, 2 cm below armhole seam, edge to edge' },
                waist:      { letter: 'HN-B', label: 'Waist (1/2)',           value: 23,   unit: 'cm', pom: 'Measured flat at natural waist, edge to edge' },
                length:     { letter: 'HN-C', label: 'Body Length (HPS)',     value: 65,   unit: 'cm', pom: 'From HPS seam straight down to hem edge (incl. rib)' },
                shoulder:   { letter: 'HN-D', label: 'Shoulder Width',        value: 42,   unit: 'cm', pom: 'Shoulder seam to shoulder seam, across back yoke' },
                hem:        { letter: 'HN-E', label: 'Hem Width (1/2)',       value: 23,   unit: 'cm', pom: 'Measured flat at rib hem, edge to edge (relaxed)' },
                armhole:    { letter: 'HN-F', label: 'Armhole Straight',      value: 24,   unit: 'cm', pom: 'Shoulder seam to underarm seam, straight' }
            },
            back_measures: {
                across_back: { letter: 'HN-N', label: 'Across Back (1/2)', value: 19, unit: 'cm', pom: 'Armhole seam to armhole seam, 10 cm below CB neck, measured flat' },
                back_length: { letter: 'HN-O', label: 'CB Length',         value: 66, unit: 'cm', pom: 'From CB neck seam straight down to hem edge' }
            },
            construction: 'Side seams: ISO 514 (overlock 4-thread). Rib hem attached with ISO 406 coverseam.',
            iso_norm: 'ISO 514'
        },
        ovr: {
            label: 'Oversize Fit',
            ease: 'oversize',
            measures: {
                chest:      { letter: 'HN-A', label: 'Chest (1/2)',           value: 31,   unit: 'cm', pom: 'Measured flat, 2 cm below armhole seam, edge to edge' },
                waist:      { letter: 'HN-B', label: 'Waist (1/2)',           value: 29,   unit: 'cm', pom: 'Measured flat at natural waist, edge to edge' },
                length:     { letter: 'HN-C', label: 'Body Length (HPS)',     value: 60,   unit: 'cm', pom: 'From HPS seam straight down to hem edge (incl. rib). Shorter for boxy proportion.' },
                shoulder:   { letter: 'HN-D', label: 'Shoulder Width',        value: 50,   unit: 'cm', pom: 'Shoulder seam to shoulder seam — drop shoulder construction' },
                hem:        { letter: 'HN-E', label: 'Hem Width (1/2)',       value: 29,   unit: 'cm', pom: 'Measured flat at rib hem, edge to edge (relaxed)' },
                armhole:    { letter: 'HN-F', label: 'Armhole Straight',      value: 28,   unit: 'cm', pom: 'Shoulder seam to underarm seam, straight — extended for drop shoulder' }
            },
            back_measures: {
                across_back: { letter: 'HN-N', label: 'Across Back (1/2)', value: 23, unit: 'cm', pom: 'Armhole seam to armhole seam, 10 cm below CB neck, measured flat' },
                back_length: { letter: 'HN-O', label: 'CB Length',         value: 61, unit: 'cm', pom: 'From CB neck seam straight down to hem edge' }
            },
            construction: 'Side seams: ISO 514 (overlock 4-thread). Rib hem attached with ISO 406 coverseam.',
            iso_norm: 'ISO 514'
        }
    },

    // ─── NECKS (base neck under hood) ─────────────────────────
    // Silhouettes: slm / reg / ovr
    necks: {
        slm: {
            label: 'Slim V-Opening',
            measures: {
                neck_width:     { letter: 'HN-G', label: 'Neck Width (1/2)',    value: 10,   unit: 'cm', pom: 'Measured flat at HPS, half of neck opening' },
                front_drop:     { letter: 'HN-H', label: 'Front Neck Drop',     value: 6,    unit: 'cm', pom: 'From HPS to lowest point of front neckline, straight' },
                back_drop:      { letter: 'HN-I', label: 'Back Neck Drop',      value: 2.5,  unit: 'cm', pom: 'From HPS to lowest point of back neckline, straight' },
                binding_width:  { letter: 'HN-J', label: 'Neck Binding Width',  value: 1.5,  unit: 'cm', pom: 'Finished width of neck binding under hood' }
            },
            construction: 'Open V-shape under hood. Self-fabric binding 1.5 cm. ISO 301 flatlock stitch 0.1 cm from edge.',
            iso_norm: 'ISO 301'
        },
        reg: {
            label: 'Regular Crossed',
            measures: {
                neck_width:     { letter: 'HN-G', label: 'Neck Width (1/2)',    value: 12,   unit: 'cm', pom: 'Measured flat at HPS, half of neck opening' },
                front_drop:     { letter: 'HN-H', label: 'Front Neck Drop',     value: 8,    unit: 'cm', pom: 'From HPS to lowest point of front neckline, straight' },
                back_drop:      { letter: 'HN-I', label: 'Back Neck Drop',      value: 2.5,  unit: 'cm', pom: 'From HPS to lowest point of back neckline, straight' },
                binding_width:  { letter: 'HN-J', label: 'Neck Binding Width',  value: 2,    unit: 'cm', pom: 'Finished width of neck binding under hood' }
            },
            construction: 'Crossed neckline (hood ends overlap at CF). Self-fabric binding 2 cm. ISO 301 flatlock stitch.',
            iso_norm: 'ISO 301'
        },
        ovr: {
            label: 'Snorkel (Oversize)',
            measures: {
                neck_width:     { letter: 'HN-G', label: 'Neck Width (1/2)',    value: 14,   unit: 'cm', pom: 'Measured flat at HPS, half of neck opening' },
                front_drop:     { letter: 'HN-H', label: 'Front Neck Drop',     value: 2,    unit: 'cm', pom: 'High snorkel — rises near chin level when worn' },
                back_drop:      { letter: 'HN-I', label: 'Back Neck Drop',      value: 1.5,  unit: 'cm', pom: 'From HPS to lowest point of back neckline, straight' },
                binding_width:  { letter: 'HN-J', label: 'Neck Binding Width',  value: 2.5,  unit: 'cm', pom: 'Finished width of neck binding under hood' }
            },
            construction: 'Snorkel-style neckline (rises high). Reinforced binding 2.5 cm. ISO 301 flatlock stitch.',
            iso_norm: 'ISO 301'
        }
    },

    // ─── HOODS ────────────────────────────────────────────────
    // Silhouettes: slm (2-piece pointed) / reg (3-piece paneled) / ovr (XL double-layer)
    hoods: {
        slm: {
            label: 'Slim 2-Piece Hood',
            measures: {
                hood_height: { letter: 'HN-P', label: 'Hood Height',       value: 33, unit: 'cm', pom: 'From neckline seam at CB to highest point of hood' },
                hood_width:  { letter: 'HN-Q', label: 'Hood Width',        value: 24, unit: 'cm', pom: 'At mid-depth of hood, side to side, measured flat' },
                hood_depth:  { letter: 'HN-R', label: 'Hood Depth',        value: 26, unit: 'cm', pom: 'From CF opening to back of hood' },
                opening:     { letter: 'HN-S', label: 'Hood Opening',      value: 30, unit: 'cm', pom: 'Front opening edge length, measured flat' }
            },
            construction: '2-piece construction: 2 mirrored panels joined at center seam. ISO 514 overlock. Tends to point at top.',
            iso_norm: 'ISO 514'
        },
        reg: {
            label: 'Regular 3-Piece Hood',
            measures: {
                hood_height: { letter: 'HN-P', label: 'Hood Height',       value: 35, unit: 'cm', pom: 'From neckline seam at CB to highest point of hood' },
                hood_width:  { letter: 'HN-Q', label: 'Hood Width',        value: 26, unit: 'cm', pom: 'At mid-depth of hood, side to side, measured flat' },
                hood_depth:  { letter: 'HN-R', label: 'Hood Depth',        value: 28, unit: 'cm', pom: 'From CF opening to back of hood' },
                opening:     { letter: 'HN-S', label: 'Hood Opening',      value: 32, unit: 'cm', pom: 'Front opening edge length, measured flat' }
            },
            construction: '3-piece construction: 2 side panels + central crown panel. ISO 514 overlock on panel seams. Ergonomic shape.',
            iso_norm: 'ISO 514'
        },
        ovr: {
            label: 'Oversize XL Hood',
            measures: {
                hood_height: { letter: 'HN-P', label: 'Hood Height',       value: 40, unit: 'cm', pom: 'From neckline seam at CB to highest point of hood' },
                hood_width:  { letter: 'HN-Q', label: 'Hood Width',        value: 30, unit: 'cm', pom: 'At mid-depth of hood, side to side, measured flat' },
                hood_depth:  { letter: 'HN-R', label: 'Hood Depth',        value: 32, unit: 'cm', pom: 'From CF opening to back of hood' },
                opening:     { letter: 'HN-S', label: 'Hood Opening',      value: 36, unit: 'cm', pom: 'Front opening edge length, measured flat' }
            },
            construction: 'Double-layer XL hood (outer + inner lining). Volume construction for streetwear look. ISO 514 overlock.',
            iso_norm: 'ISO 514'
        }
    },

    // ─── SLEEVES ──────────────────────────────────────────────
    // Silhouettes: slm / reg / ovr — includes shoulder treatment
    sleeves: {
        slm: {
            label: 'Slim Tubular Sleeve',
            measures: {
                sleeve_length:  { letter: 'HN-K', label: 'Sleeve Length',      value: 60,   unit: 'cm', pom: 'From shoulder seam (HPS) to cuff edge, arm straight' },
                bicep:          { letter: 'HN-L', label: 'Bicep Width (1/2)',  value: 17,   unit: 'cm', pom: 'Measured flat, 2.5 cm below armhole seam' },
                cuff_opening:   { letter: 'HN-M', label: 'Cuff Opening (1/2)', value: 9,    unit: 'cm', pom: 'Measured flat at rib cuff, edge to edge (relaxed)' }
            },
            construction: 'Set-in sleeve, fitted shoulder. Sleeve seam: ISO 514 overlock. Rib cuff attached with ISO 406 coverseam.',
            iso_norm: 'ISO 514'
        },
        reg: {
            label: 'Regular Tapered Sleeve',
            measures: {
                sleeve_length:  { letter: 'HN-K', label: 'Sleeve Length',      value: 61,   unit: 'cm', pom: 'From shoulder seam (HPS) to cuff edge, arm straight' },
                bicep:          { letter: 'HN-L', label: 'Bicep Width (1/2)',  value: 19,   unit: 'cm', pom: 'Measured flat, 2.5 cm below armhole seam' },
                cuff_opening:   { letter: 'HN-M', label: 'Cuff Opening (1/2)', value: 10,   unit: 'cm', pom: 'Measured flat at rib cuff, edge to edge (relaxed)' }
            },
            construction: 'Set-in sleeve, slight drop shoulder (1–2 cm beyond shoulder bone). ISO 514 overlock. Rib cuff: ISO 406 coverseam.',
            iso_norm: 'ISO 514'
        },
        ovr: {
            label: 'Oversize Drop Shoulder Sleeve',
            measures: {
                sleeve_length:  { letter: 'HN-K', label: 'Sleeve Length',      value: 53,   unit: 'cm', pom: 'From shoulder seam (HPS) to cuff edge, arm straight. Shortened to compensate drop shoulder.' },
                bicep:          { letter: 'HN-L', label: 'Bicep Width (1/2)',  value: 22,   unit: 'cm', pom: 'Measured flat, 2.5 cm below armhole seam' },
                cuff_opening:   { letter: 'HN-M', label: 'Cuff Opening (1/2)', value: 12,   unit: 'cm', pom: 'Measured flat at rib cuff, edge to edge (relaxed)' }
            },
            construction: 'Drop shoulder construction (seam falls mid-bicep). Globular volume. ISO 514 overlock. Wide rib cuff: ISO 406 coverseam.',
            iso_norm: 'ISO 514'
        }
    },

    // ─── CUFFS (rib element on sleeve end) ────────────────────
    // Silhouettes: slm / reg / ovr — matches sleeve silhouette by default
    cuffs: {
        slm: {
            label: 'Slim Rib Cuff',
            measures: {
                cuff_height:    { letter: 'HN-T', label: 'Cuff Height',         value: 4,    unit: 'cm', pom: 'Finished height of ribbed cuff band' },
                cuff_stretch:   { letter: 'HN-U', label: 'Cuff Stretch Ratio',  value: 85,   unit: '%',  pom: 'Rib stretched to % of sleeve opening before attachment' }
            },
            construction: 'Rib 1×1 knit. Tubular construction. Attached to sleeve with ISO 406 coverseam, stretched 85%.',
            iso_norm: 'ISO 406'
        },
        reg: {
            label: 'Regular Rib Cuff',
            measures: {
                cuff_height:    { letter: 'HN-T', label: 'Cuff Height',         value: 6,    unit: 'cm', pom: 'Finished height of ribbed cuff band' },
                cuff_stretch:   { letter: 'HN-U', label: 'Cuff Stretch Ratio',  value: 80,   unit: '%',  pom: 'Rib stretched to % of sleeve opening before attachment' }
            },
            construction: 'Rib 1×1 knit. Tubular construction. Attached to sleeve with ISO 406 coverseam, stretched 80%.',
            iso_norm: 'ISO 406'
        },
        ovr: {
            label: 'Oversize Wide Rib Cuff',
            measures: {
                cuff_height:    { letter: 'HN-T', label: 'Cuff Height',         value: 10,   unit: 'cm', pom: 'Finished height of ribbed cuff band — wide retro/sport style' },
                cuff_stretch:   { letter: 'HN-U', label: 'Cuff Stretch Ratio',  value: 75,   unit: '%',  pom: 'Rib stretched to % of sleeve opening before attachment' }
            },
            construction: 'Rib 2×2 or heavy 1×1 knit. Tubular construction. Attached with ISO 406 coverseam, stretched 75%.',
            iso_norm: 'ISO 406'
        }
    },

    // ─── HEMS (rib element on torso bottom) ───────────────────
    // Silhouettes: slm / reg / ovr — matches cuff silhouette by default
    hems: {
        slm: {
            label: 'Slim Rib Hem',
            measures: {
                hem_height:     { letter: 'HN-V', label: 'Hem Height',          value: 4,    unit: 'cm', pom: 'Finished height of ribbed waistband' },
                hem_stretch:    { letter: 'HN-W', label: 'Hem Stretch Ratio',   value: 85,   unit: '%',  pom: 'Rib stretched to % of torso hem before attachment' }
            },
            construction: 'Rib 1×1 knit. Tubular construction. Attached to torso with ISO 406 coverseam, stretched 85%.',
            iso_norm: 'ISO 406'
        },
        reg: {
            label: 'Regular Rib Hem',
            measures: {
                hem_height:     { letter: 'HN-V', label: 'Hem Height',          value: 6,    unit: 'cm', pom: 'Finished height of ribbed waistband' },
                hem_stretch:    { letter: 'HN-W', label: 'Hem Stretch Ratio',   value: 80,   unit: '%',  pom: 'Rib stretched to % of torso hem before attachment' }
            },
            construction: 'Rib 1×1 knit. Tubular construction. Attached to torso with ISO 406 coverseam, stretched 80%.',
            iso_norm: 'ISO 406'
        },
        ovr: {
            label: 'Oversize Wide Rib Hem',
            measures: {
                hem_height:     { letter: 'HN-V', label: 'Hem Height',          value: 10,   unit: 'cm', pom: 'Finished height of ribbed waistband — wide retro/sport style' },
                hem_stretch:    { letter: 'HN-W', label: 'Hem Stretch Ratio',   value: 75,   unit: '%',  pom: 'Rib stretched to % of torso hem before attachment' }
            },
            construction: 'Rib 2×2 or heavy 1×1 knit. Tubular construction. Attached with ISO 406 coverseam, stretched 75%.',
            iso_norm: 'ISO 406'
        }
    },

    // ─── POCKETS (front only — no back view) ──────────────────
    // Variants: reg (classic kangaroo) / sid (side pockets) / xl (extra large)
    pockets: {
        reg: {
            label: 'Classic Kangaroo Pocket',
            measures: {
                pocket_width:   { letter: 'HN-X', label: 'Pocket Width',        value: 28,   unit: 'cm', pom: 'Total width of pocket patch, edge to edge' },
                pocket_height:  { letter: 'HN-Y', label: 'Pocket Height',       value: 20,   unit: 'cm', pom: 'Total height of pocket patch, top to bottom' },
                opening_width:  { letter: 'HN-Z', label: 'Opening Width',       value: 14,   unit: 'cm', pom: 'Width of each side opening, measured along the edge' },
                cf_to_pocket:   { letter: 'HN-AA', label: 'CF to Pocket',       value: 18,   unit: 'cm', pom: 'From HPS down to top edge of pocket, on CF line' }
            },
            construction: 'Single patch with two side openings. Topstitched with ISO 301 lockstitch 0.5 cm from edge. Bartack reinforcement at opening corners.',
            iso_norm: 'ISO 301'
        },
        sid: {
            label: 'Side Pockets (no center connection)',
            measures: {
                pocket_width:   { letter: 'HN-X', label: 'Pocket Width (each)', value: 22,   unit: 'cm', pom: 'Width of each individual side pocket' },
                pocket_height:  { letter: 'HN-Y', label: 'Pocket Height',       value: 18,   unit: 'cm', pom: 'Total height of pocket patch, top to bottom' },
                opening_width:  { letter: 'HN-Z', label: 'Opening Width',       value: 14,   unit: 'cm', pom: 'Width of each side opening, measured along the edge' },
                cf_to_pocket:   { letter: 'HN-AA', label: 'CF to Pocket Edge',  value: 20,   unit: 'cm', pom: 'From CF line to inner edge of side pocket' }
            },
            construction: 'Two independent side pocket patches, no center connection. Topstitched with ISO 301 lockstitch. Bartack reinforcement at openings.',
            iso_norm: 'ISO 301'
        },
        xl: {
            label: 'XL Kangaroo Pocket',
            measures: {
                pocket_width:   { letter: 'HN-X', label: 'Pocket Width',        value: 44,   unit: 'cm', pom: 'Total width of pocket — nearly side-seam to side-seam' },
                pocket_height:  { letter: 'HN-Y', label: 'Pocket Height',       value: 24,   unit: 'cm', pom: 'Total height of pocket patch, top to bottom' },
                opening_width:  { letter: 'HN-Z', label: 'Opening Width',       value: 16,   unit: 'cm', pom: 'Width of each side opening, measured along the edge' },
                cf_to_pocket:   { letter: 'HN-AA', label: 'CF to Pocket',       value: 16,   unit: 'cm', pom: 'From HPS down to top edge of pocket, on CF line' }
            },
            construction: 'Oversized single patch spanning most of torso width. Topstitched with ISO 301 lockstitch. Heavy bartack reinforcement at openings.',
            iso_norm: 'ISO 301'
        }
    },

    // ─── BOM ──────────────────────────────────────────────────
    bom: {
        hoodie: [
            { ref: 'FAB-001', description: 'Main fabric — Brushed Fleece 320g/m² (80% Cotton, 20% Polyester)', unit: 'm',    qty: '1.8'  },
            { ref: 'FAB-002', description: 'Rib fabric — 2×2 rib (95% Cotton, 5% Elastane)',                    unit: 'm',    qty: '0.30' },
            { ref: 'THR-001', description: 'Polyester sewing thread — Tex 27 (ISO 180/2)',                      unit: 'cone', qty: '1'    },
            { ref: 'THR-002', description: 'Coverseam thread — Tex 18',                                         unit: 'cone', qty: '1'    },
            { ref: 'HWD-001', description: 'Metal eyelet — brass, 10 mm (× 2)',                                 unit: 'pc',   qty: '2'    },
            { ref: 'HWD-002', description: 'Drawcord — 120 cm cotton flat 8 mm',                                unit: 'pc',   qty: '1'    },
            { ref: 'HWD-003', description: 'Cord end (aglet) — metal or heat-shrink (× 2)',                     unit: 'pc',   qty: '2'    },
            { ref: 'LAB-001', description: 'Care label — woven (symbols per EN ISO 3758)',                      unit: 'pc',   qty: '1'    },
            { ref: 'LAB-002', description: 'Brand label — woven or heat transfer',                              unit: 'pc',   qty: '1'    },
            { ref: 'LAB-003', description: 'Size label — woven',                                                unit: 'pc',   qty: '1'    },
            { ref: 'PKG-001', description: 'Polybag 45×55 cm, recycled PE',                                     unit: 'pc',   qty: '1'    }
        ]
    }
};

// ─── collectMeasurements ──────────────────────────────────────
// Identical signature to tshirt.js — collects POM data per view (front/back).
// Pockets are FRONT ONLY (no back_measures).
export function collectMeasurements(selections, size = 'EU38', view = 'front', includeAllSizes = false, gender = 'female') {
    const results = [];
    const FEMALE_SIZES = ['EU34', 'EU36', 'EU38', 'EU40', 'EU42', 'EU44'];
    const MALE_SIZES   = ['EU46', 'EU48', 'EU50', 'EU52', 'EU54', 'EU56'];
    const ALL_SIZES    = gender === 'male' ? MALE_SIZES : FEMALE_SIZES;

    // Helper to push a measurement entry with grading + tolerance
    const pushEntry = (key, m) => {
        const genderOffset = (GENDER_OFFSETS[gender] && GENDER_OFFSETS[gender][key]) || 0;
        const adjustedBase = m.value + genderOffset;
        const grading = GRADING.getForSize(size, key, adjustedBase);
        const gradedValue = grading.value;
        const entry = {
            letter:         m.letter,
            description:    m.label,
            key,
            pom:            m.pom || '',
            unit:           m.unit,
            value:          gradedValue,
            tolerance:      TOLERANCES.formatTolerance(gradedValue),
            hasGradingRule: grading.hasGradingRule,
        };
        if (includeAllSizes) {
            entry.sizes = {};
            ALL_SIZES.forEach(s => {
                const g = GRADING.getForSize(s, key, adjustedBase);
                entry.sizes[s] = grading.hasGradingRule ? g.value : adjustedBase;
            });
        }
        results.push(entry);
    };

    // Torso (front uses .measures, back uses .back_measures)
    if (selections.torso && COMPONENT_META.torsos[selections.torso]) {
        const torso = COMPONENT_META.torsos[selections.torso];
        const measureSource = view === 'back' ? torso.back_measures : torso.measures;
        if (measureSource) {
            for (const [key, m] of Object.entries(measureSource)) pushEntry(key, m);
        }
    }

    // Neck base — front view only
    if (view === 'front' && selections.neck && COMPONENT_META.necks[selections.neck]) {
        const neck = COMPONENT_META.necks[selections.neck];
        for (const [key, m] of Object.entries(neck.measures)) pushEntry(key, m);
    }

    // Hood — visible on both front and back (back shows hood resting on shoulders)
    if (selections.hood && COMPONENT_META.hoods[selections.hood]) {
        const hood = COMPONENT_META.hoods[selections.hood];
        for (const [key, m] of Object.entries(hood.measures)) pushEntry(key, m);
    }

    // Sleeve — front view only (sleeves shown from front; back inherits same length)
    if (view === 'front' && selections.sleeve && COMPONENT_META.sleeves[selections.sleeve]) {
        const sleeve = COMPONENT_META.sleeves[selections.sleeve];
        for (const [key, m] of Object.entries(sleeve.measures)) pushEntry(key, m);
    }

    // Cuff — front view only
    if (view === 'front' && selections.cuff && COMPONENT_META.cuffs[selections.cuff]) {
        const cuff = COMPONENT_META.cuffs[selections.cuff];
        for (const [key, m] of Object.entries(cuff.measures)) pushEntry(key, m);
    }

    // Hem — front view only
    if (view === 'front' && selections.hem && COMPONENT_META.hems[selections.hem]) {
        const hem = COMPONENT_META.hems[selections.hem];
        for (const [key, m] of Object.entries(hem.measures)) pushEntry(key, m);
    }

    // Pocket — front view ONLY (no back pocket exists on hoodie)
    if (view === 'front' && selections.pocket && COMPONENT_META.pockets[selections.pocket]) {
        const pocket = COMPONENT_META.pockets[selections.pocket];
        for (const [key, m] of Object.entries(pocket.measures)) pushEntry(key, m);
    }

    return results;
}

// ─── collectConstruction ──────────────────────────────────────
// Identical pattern to tshirt.js — gathers construction notes per component.
export function collectConstruction(selections) {
    const notes = [];
    const componentMap = [
        ['torso',  'torsos'],
        ['neck',   'necks'],
        ['hood',   'hoods'],
        ['sleeve', 'sleeves'],
        ['cuff',   'cuffs'],
        ['hem',    'hems'],
        ['pocket', 'pockets']
    ];

    for (const [selectionKey, metaKey] of componentMap) {
        const variant = selections[selectionKey];
        if (variant && COMPONENT_META[metaKey] && COMPONENT_META[metaKey][variant]) {
            notes.push({
                component: COMPONENT_META[metaKey][variant].label,
                note:      COMPONENT_META[metaKey][variant].construction,
                norm:      COMPONENT_META[metaKey][variant].iso_norm
            });
        }
    }
    return notes;
}

// ─── HOODIE_CONFIG ────────────────────────────────────────────
// Declares allowed materials, defaults, dependencies and visibility.
// Keys reference their respective libraries in /config/universal/.
// Hardware library to be added in a separate step (per nomenclature v6).

export const HOODIE_CONFIG = {

    // Materials — placeholder lists. Heavyweight fabrics & 2×2 rib expected
    // once hoodie-specific entries are added to universal/fabrics.js.
    allowedFabrics:     ['french_terry_300', 'brushed_fleece_320', 'brushed_fleece_400', 'heavyweight_fleece_500', 'rib_1x1', 'rib_2x2'],
    allowedEyelets:     ['eyelet_brass_10mm', 'eyelet_xl_matte_black', 'eyelet_invisible_embroidered'],
    allowedDrawcords:   ['drawcord_flat_cotton', 'drawcord_tubular_thick', 'drawcord_reflective'],
    allowedAglets:      ['aglet_metal', 'aglet_heat_shrink', 'aglet_self_sewn'],
    allowedNeedles:     ['ballpoint_80_12', 'ballpoint_90_14'],
    allowedThreads:     ['poly_tex_27', 'poly_tex_40', 'cotton_tex_30'],
    allowedStitches:    ['overlock_4t', 'coverseam_3n', 'flatlock'],
    allowedCareLabels:  ['woven', 'printed', 'heat_transfer', 'satin'],
    allowedBrandLabels: ['woven', 'heat_transfer', 'embroidered', 'printed'],

    // Initial preset — all components in 'reg' silhouette
    defaults: {
        torso:      'reg',
        neck:       'reg',
        hood:       'reg',
        sleeve:     'reg',
        cuff:       'reg',
        hem:        'reg',
        pocket:     'reg',
        fabric:     'brushed_fleece_320',
        eyelet:     'eyelet_brass_10mm',
        drawcord:   'drawcord_flat_cotton',
        aglet:      'aglet_metal',
        needle:     'ballpoint_80_12',
        thread:     'poly_tex_27',
        stitch:     'overlock_4t',
        careLabel:  'woven',
        brandLabel: 'woven'
    },

    // Visibility states (per nomenclature v6)
    // ALWAYS_VISIBLE → rendered, no toggle
    // TOGGLEABLE_DEFAULT_ON → rendered by default, user can disable
    // TOGGLEABLE_DEFAULT_OFF → hidden by default, user can enable
    visibility: {
        torso:         'ALWAYS_VISIBLE',
        neck:          'ALWAYS_VISIBLE',
        hood:          'ALWAYS_VISIBLE',
        sleeve:        'ALWAYS_VISIBLE',
        cuff:          'ALWAYS_VISIBLE',
        hem:           'ALWAYS_VISIBLE',
        pocket:        'TOGGLEABLE_DEFAULT_ON',
        hood_drawcord: 'TOGGLEABLE_DEFAULT_ON',
        hood_eyelets:  'TOGGLEABLE_DEFAULT_ON'
    },

    // Component dependencies (cabled toggles, per nomenclature v6)
    // If parent is OFF, child is forced OFF and disabled in the UI.
    dependencies: [
        {
            parent:  'hood_drawcord',
            child:   'hood_eyelets',
            message: 'Eyelets require a drawcord — they would have no functional purpose without one.'
        }
    ],

// Style presets — cohesive hardware kits per aesthetic.
    // Used by the UI to offer one-click "style" selection that fills hardware fields.
    stylePresets: {
        luxury: {
            label:    'Luxury / Premium',
            eyelet:   'eyelet_brass_10mm',
            drawcord: 'drawcord_flat_cotton',
            aglet:    'aglet_metal'
        },
        streetwear: {
            label:    'Streetwear Pro',
            eyelet:   'eyelet_xl_matte_black',
            drawcord: 'drawcord_tubular_thick',
            aglet:    'aglet_heat_shrink'
        },
        minimalist: {
            label:    'Minimalist / Clean',
            eyelet:   'eyelet_invisible_embroidered',
            drawcord: 'drawcord_flat_cotton',
            aglet:    'aglet_self_sewn'
        },
        athleisure: {
            label:    'Athleisure / Sport',
            eyelet:   'eyelet_brass_10mm',
            drawcord: 'drawcord_reflective',
            aglet:    'aglet_heat_shrink'
        }
    },

    defaultBOM: {
        fabric_main:    { value: 1.8,  unit: 'm',    editable: false, description: 'Main fabric for body, sleeves, hood' },
        fabric_rib:     { value: 0.30, unit: 'm',    editable: false, description: 'Rib fabric for cuffs and waistband' },
        thread_main:    { value: 1,    unit: 'cone', editable: false, description: 'Main sewing thread' },
        thread_cover:   { value: 1,    unit: 'cone', editable: false, description: 'Coverseam thread for rib attachments' },
        eyelet:         { value: 2,    unit: 'pc',   editable: true,  description: 'Metal eyelet (brass recommended)' },
        drawcord:       { value: 1,    unit: 'pc',   editable: true,  description: 'Drawcord for hood' },
        cord_end:       { value: 2,    unit: 'pc',   editable: true,  description: 'Cord end (aglet) — metal or heat-shrink' },
        care_label:     { value: 1,    unit: 'pc',   editable: false, description: 'Care label per garment' },
        brand_label:    { value: 1,    unit: 'pc',   editable: true,  description: 'Brand label per garment' },
        size_label:     { value: 1,    unit: 'pc',   editable: false, description: 'Size label per garment' },
        polybag:        { value: 1,    unit: 'pc',   editable: false, description: 'Polybag for individual packing' }
    }
};
