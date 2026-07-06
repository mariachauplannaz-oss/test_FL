// ═══ tshirt.js — T-shirt component metadata, measurements, construction ═══

import { GRADING, TOLERANCES, GENDER_OFFSETS } from '../measurements.js';

export const COMPONENT_META = {

    // ─── TORSOS ───────────────────────────────────────────────
    torsos: {
        reg: {
            label: 'Regular Fit',
            ease: 'regular',
            measures: {
                chest:      { letter: 'TS-A', label: 'Chest (1/2)',           value: 46,   unit: 'cm', pom: 'Measured flat, 2.5 cm below armhole seam, edge to edge' },
                waist:      { letter: 'TS-B', label: 'Waist (1/2)',           value: 44,   unit: 'cm', pom: 'Measured flat at natural waist, edge to edge' },
                length:     { letter: 'TS-C', label: 'Body Length (HPS)',     value: 62,   unit: 'cm', pom: 'From HPS seam straight down to hem edge' },
                shoulder:   { letter: 'TS-D', label: 'Shoulder Width',        value: 38.5, unit: 'cm', pom: 'Shoulder seam to shoulder seam, across back yoke' },
                hem:        { letter: 'TS-E', label: 'Hem Width (1/2)',       value: 48,   unit: 'cm', pom: 'Measured flat at hem, edge to edge' },
                armhole:    { letter: 'TS-F', label: 'Armhole Straight',      value: 21,   unit: 'cm', pom: 'Shoulder seam to underarm seam, straight' }
            },
            back_measures: {
                across_back: { letter: 'TS-N', label: 'Across Back (1/2)', value: 37, unit: 'cm', pom: 'Armhole seam to armhole seam, 10 cm below CB neck, measured flat' },
                back_length: { letter: 'TS-O', label: 'CB Length',         value: 64, unit: 'cm', pom: 'From CB neck seam straight down to hem edge' }
            },
            construction: 'Side seams: ISO 514 (overlock 4-thread). Hem: double-needle coverseam 2 cm.',
            iso_norm: 'ISO 514'
        },
        crp: {
            label: 'Crop Fit',
            ease: 'regular',
            measures: {
                chest:      { letter: 'TS-A', label: 'Chest (1/2)',           value: 46,   unit: 'cm', pom: 'Measured flat, 2.5 cm below armhole seam, edge to edge' },
                waist:      { letter: 'TS-B', label: 'Waist (1/2)',           value: 44,   unit: 'cm', pom: 'Measured flat at natural waist, edge to edge' },
                length:     { letter: 'TS-C', label: 'Body Length (HPS)',     value: 48,   unit: 'cm', pom: 'From HPS seam straight down to hem edge' },
                shoulder:   { letter: 'TS-D', label: 'Shoulder Width',        value: 38.5, unit: 'cm', pom: 'Shoulder seam to shoulder seam, across back yoke' },
                hem:        { letter: 'TS-E', label: 'Hem Width (1/2)',       value: 46,   unit: 'cm', pom: 'Measured flat at hem, edge to edge' },
                armhole:    { letter: 'TS-F', label: 'Armhole Straight',      value: 21,   unit: 'cm', pom: 'Shoulder seam to underarm seam, straight' }
            },
            back_measures: {
                across_back: { letter: 'TS-N', label: 'Across Back (1/2)', value: 37, unit: 'cm', pom: 'Armhole seam to armhole seam, 10 cm below CB neck, measured flat' },
                back_length: { letter: 'TS-O', label: 'CB Length',         value: 50, unit: 'cm', pom: 'From CB neck seam straight down to hem edge' }
            },
            construction: 'Side seams: ISO 514 (overlock 4-thread). Hem: exposed raw edge or coverseam.',
            iso_norm: 'ISO 514'
        },
        slm: {
            label: 'Slim Fit',
            ease: 'slim',
            measures: {
                chest:      { letter: 'TS-A', label: 'Chest (1/2)',       value: 44,   unit: 'cm', pom: 'Measured flat, 2.5 cm below armhole seam, edge to edge' },
                waist:      { letter: 'TS-B', label: 'Waist (1/2)',       value: 41,   unit: 'cm', pom: 'Measured flat at natural waist, edge to edge' },
                length:     { letter: 'TS-C', label: 'Body Length (HPS)', value: 62,   unit: 'cm', pom: 'From HPS seam straight down to hem edge' },
                shoulder:   { letter: 'TS-D', label: 'Shoulder Width',    value: 37.5, unit: 'cm', pom: 'Shoulder seam to shoulder seam, across back yoke' },
                hem:        { letter: 'TS-E', label: 'Hem Width (1/2)',   value: 44,   unit: 'cm', pom: 'Measured flat at hem, edge to edge' },
                armhole:    { letter: 'TS-F', label: 'Armhole Straight',  value: 20,   unit: 'cm', pom: 'Shoulder seam to underarm seam, straight' }
            },
            back_measures: {
                across_back: { letter: 'TS-N', label: 'Across Back (1/2)', value: 36, unit: 'cm', pom: 'Armhole seam to armhole seam, 10 cm below CB neck, measured flat' },
                back_length: { letter: 'TS-O', label: 'CB Length',         value: 64, unit: 'cm', pom: 'From CB neck seam straight down to hem edge' }
            },
            construction: 'Side seams: ISO 514 (overlock 4-thread). Hem: double-needle coverseam 2 cm.',
            iso_norm: 'ISO 514'
        }
    },

    // ─── SLEEVES ──────────────────────────────────────────────
    sleeves: {
        lon: {
            label: 'Long Sleeve',
            measures: {
                sleeve_length:  { letter: 'TS-K', label: 'Sleeve Length',      value: 60,   unit: 'cm', pom: 'Shoulder seam to cuff edge, arm straight' },
                bicep:          { letter: 'TS-L', label: 'Bicep Width (1/2)',  value: 16,   unit: 'cm', pom: 'Measured flat, 2.5 cm below armhole seam' },
                cuff_opening:   { letter: 'TS-M', label: 'Cuff Opening (1/2)', value: 10.5, unit: 'cm', pom: 'Measured flat at cuff, edge to edge' }
            },
            construction: 'Sleeve seam: ISO 514 (overlock). Cuff: coverseam ISO 406, 2 cm.',
            iso_norm: 'ISO 514'
        },
        cap: {
            label: 'Short Sleeve',
            measures: {
                sleeve_length:  { letter: 'TS-K', label: 'Sleeve Length',          value: 20,   unit: 'cm', pom: 'Shoulder seam to sleeve hem, arm straight' },
                bicep:          { letter: 'TS-L', label: 'Bicep Width (1/2)',      value: 17,   unit: 'cm', pom: 'Measured flat, 2.5 cm below armhole seam' },
                sleeve_opening: { letter: 'TS-M', label: 'Sleeve Opening (1/2)',   value: 15.5, unit: 'cm', pom: 'Measured flat at sleeve hem, edge to edge' }
            },
            construction: 'Sleeve hem: coverseam ISO 406, 2 cm. Set-in sleeve.',
            iso_norm: 'ISO 514'
        }
    },

    // ─── NECKS ────────────────────────────────────────────────
    necks: {
        rnd: {
            label: 'Crew Neck',
            measures: {
                neck_width:     { letter: 'TS-G', label: 'Neck Width (1/2)',    value: 9,    unit: 'cm', pom: 'Measured flat at HPS, half of neck opening' },
                front_drop:     { letter: 'TS-H', label: 'Front Neck Drop',     value: 8.5,  unit: 'cm', pom: 'From HPS to lowest point of front neckline, straight' },
                back_drop:      { letter: 'TS-I', label: 'Back Neck Drop',      value: 2.5,  unit: 'cm', pom: 'From HPS to lowest point of back neckline, straight' },
                binding_width:  { letter: 'TS-J', label: 'Rib Binding Width',   value: 1.5,  unit: 'cm', pom: 'Finished width of neck binding' }
            },
            construction: 'Rib binding 2×1 (cotton/elastane). Attached with ISO 607 flatlock stitch 0.1 cm from edge. Binding stretched 90% of neckline length.',
            iso_norm: 'ISO 607'
        },
        v: {
            label: 'V-Neck',
            measures: {
                neck_width:     { letter: 'TS-G', label: 'Neck Width (1/2)',    value: 9,    unit: 'cm', pom: 'Measured flat at HPS, half of neck opening' },
                front_drop:     { letter: 'TS-H', label: 'Front Neck Drop',     value: 18,   unit: 'cm', pom: 'From HPS to V-point, straight' },
                back_drop:      { letter: 'TS-I', label: 'Back Neck Drop',      value: 2.5,  unit: 'cm', pom: 'From HPS to lowest point of back neckline, straight' },
                binding_width:  { letter: 'TS-J', label: 'Rib Binding Width',   value: 1.5,  unit: 'cm', pom: 'Finished width of neck binding' }
            },
            construction: 'Rib binding 2×1. ISO 607 flatlock stitch. V-point: mitered finish with tape reinforcement.',
            iso_norm: 'ISO 607'
        },
        mok: {
            label: 'Mock Neck',
            measures: {
                neck_width:     { letter: 'TS-G', label: 'Neck Width (1/2)',    value: 8.5,  unit: 'cm', pom: 'Measured flat at HPS, half of neck opening' },
                collar_height:  { letter: 'TS-J', label: 'Collar Height',       value: 4.5,  unit: 'cm', pom: 'From neckline seam to top of collar, straight' },
                front_drop:     { letter: 'TS-H', label: 'Front Neck Drop',     value: 1.5,  unit: 'cm', pom: 'From HPS to neckline seam at CF' },
                back_drop:      { letter: 'TS-I', label: 'Back Neck Drop',      value: 1.5,  unit: 'cm', pom: 'From HPS to neckline seam at CB' }
            },
            construction: 'Self-fabric mock collar. ISO 607 flatlock stitch on collar seam. Fold at 4.5 cm.',
            iso_norm: 'ISO 607'
        },
        scp: {
            label: 'Scoop Neck',
            measures: {
                neck_width:     { letter: 'TS-G', label: 'Neck Width (1/2)',    value: 10,   unit: 'cm', pom: 'Measured flat at HPS, half of neck opening' },
                front_drop:     { letter: 'TS-H', label: 'Front Neck Drop',     value: 14,   unit: 'cm', pom: 'From HPS to lowest point of scoop, straight' },
                back_drop:      { letter: 'TS-I', label: 'Back Neck Drop',      value: 2.5,  unit: 'cm', pom: 'From HPS to lowest point of back neckline, straight' },
                binding_width:  { letter: 'TS-J', label: 'Rib Binding Width',   value: 1.2,  unit: 'cm', pom: 'Finished width of neck binding' }
            },
            construction: 'Rib binding 2×1 (cotton/elastane). ISO 607 flatlock stitch 0.1 cm from edge.',
            iso_norm: 'ISO 607'
        },
        bot: {
            label: 'Boat Neck',
            measures: {
                neck_width:     { letter: 'TS-G', label: 'Neck Width (1/2)',    value: 12,   unit: 'cm', pom: 'Measured flat at HPS, half of neck opening' },
                front_drop:     { letter: 'TS-H', label: 'Front Neck Drop',     value: 5,    unit: 'cm', pom: 'From HPS to lowest point of neckline at CF, straight' },
                back_drop:      { letter: 'TS-I', label: 'Back Neck Drop',      value: 5,    unit: 'cm', pom: 'Same as front — symmetric neckline' },
                binding_width:  { letter: 'TS-J', label: 'Self-Finish Width',   value: 1.5,  unit: 'cm', pom: 'Folded self-fabric edge finish' }
            },
            construction: 'Self-fabric fold finish. ISO 301 stitch at edge. No separate binding.',
            iso_norm: 'ISO 301'
        }
    },

    // ─── BOM ──────────────────────────────────────────────────
    bom: {
        tshirt: [
            { ref: 'FAB-001', description: 'Main fabric — Jersey 180g/m² (95% Cotton, 5% Elastane)', unit: 'm',    qty: '1.2'  },
            { ref: 'FAB-002', description: 'Rib fabric — 1×1 rib (95% Cotton, 5% Elastane)',         unit: 'm',    qty: '0.15' },
            { ref: 'THR-001', description: 'Polyester sewing thread — Tex 27 (ISO 180/2)',            unit: 'cone', qty: '1'    },
            { ref: 'THR-002', description: 'Coverseam thread — Tex 18',                              unit: 'cone', qty: '1'    },
            { ref: 'LAB-001', description: 'Care label — woven (symbols per EN ISO 3758)',            unit: 'pc',   qty: '1'    },
            { ref: 'LAB-002', description: 'Brand label — woven or heat transfer',                   unit: 'pc',   qty: '1'    },
            { ref: 'LAB-003', description: 'Size label — woven',                                     unit: 'pc',   qty: '1'    },
            { ref: 'PKG-001', description: 'Polybag 35×45 cm, recycled PE',                          unit: 'pc',   qty: '1'    }
        ]
    }
};

// ─── collectMeasurements ──────────────────────────────────────
export function collectMeasurements(selections, size = 'EU38', view = 'front', includeAllSizes = false, gender = 'female') {
    const results = [];
    const FEMALE_SIZES = ['EU34', 'EU36', 'EU38', 'EU40', 'EU42', 'EU44'];
    const MALE_SIZES   = ['EU46', 'EU48', 'EU50', 'EU52', 'EU54', 'EU56'];
    const ALL_SIZES    = gender === 'male' ? MALE_SIZES : FEMALE_SIZES;

    if (selections.torso && COMPONENT_META.torsos[selections.torso]) {
        const torso = COMPONENT_META.torsos[selections.torso];
        const measureSource = view === 'back' ? torso.back_measures : torso.measures;
        if (measureSource) {
            for (const [key, m] of Object.entries(measureSource)) {
                // Apply gender offset before grading
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
            }
        }
    }

    if (view === 'front' && selections.neck && COMPONENT_META.necks[selections.neck]) {
        const neck = COMPONENT_META.necks[selections.neck];
        for (const [key, m] of Object.entries(neck.measures)) {
            // Apply gender offset before grading
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
        }
    }

    if (view === 'front' && selections.sleeve && COMPONENT_META.sleeves[selections.sleeve]) {
        const sleeve = COMPONENT_META.sleeves[selections.sleeve];
        for (const [key, m] of Object.entries(sleeve.measures)) {
            // Apply gender offset before grading
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
        }
    }

    return results;
}

// ─── collectConstruction ──────────────────────────────────────
export function collectConstruction(selections) {
    const notes = [];
    if (selections.torso && COMPONENT_META.torsos[selections.torso]) {
        notes.push({
            component: COMPONENT_META.torsos[selections.torso].label,
            note:      COMPONENT_META.torsos[selections.torso].construction,
            norm:      COMPONENT_META.torsos[selections.torso].iso_norm
        });
    }
    if (selections.neck && COMPONENT_META.necks[selections.neck]) {
        notes.push({
            component: COMPONENT_META.necks[selections.neck].label,
            note:      COMPONENT_META.necks[selections.neck].construction,
            norm:      COMPONENT_META.necks[selections.neck].iso_norm
        });
    }
    if (selections.sleeve && COMPONENT_META.sleeves[selections.sleeve]) {
        notes.push({
            component: COMPONENT_META.sleeves[selections.sleeve].label,
            note:      COMPONENT_META.sleeves[selections.sleeve].construction,
            norm:      COMPONENT_META.sleeves[selections.sleeve].iso_norm
        });
    }
    return notes;
}

// ─── TSHIRT_CONFIG ────────────────────────────────────────────
// Declares allowed materials and defaults for t-shirt construction.
// Keys reference their respective libraries in /config/universal/.
// Wired to UI in Phase 5.

export const TSHIRT_CONFIG = {

    allowedFabrics:     ['jersey_150', 'jersey_180', 'jersey_200'],
    allowedNeedles:     ['ballpoint_70_10', 'ballpoint_80_12', 'ballpoint_90_14'],
    allowedThreads:     ['poly_tex_27', 'poly_tex_18', 'poly_tex_40'],
    allowedStitches:    ['overlock_4t', 'coverseam_3n', 'flatlock'],
    allowedCareLabels:  ['woven', 'printed', 'heat_transfer', 'satin'],
    allowedBrandLabels: ['woven', 'heat_transfer', 'embroidered', 'printed'],

    defaults: {
        fabric:     'jersey_180',
        needle:     'ballpoint_80_12',
        thread:     'poly_tex_27',
        stitch:     'overlock_4t',
        careLabel:  'woven',
        brandLabel: 'woven'
    },

    defaultBOM: {
        fabric_main:  { value: 1.2,  unit: 'm',    editable: false, description: 'Main fabric for body and sleeves' },
        fabric_rib:   { value: 0.15, unit: 'm',    editable: false, description: 'Rib fabric for neck binding' },
        thread_main:  { value: 1,    unit: 'cone', editable: false, description: 'Main sewing thread' },
        thread_cover: { value: 1,    unit: 'cone', editable: false, description: 'Coverseam thread for hems' },
        care_label:   { value: 1,    unit: 'pc',   editable: false, description: 'Care label per garment' },
        brand_label:  { value: 1,    unit: 'pc',   editable: true,  description: 'Brand label per garment' },
        size_label:   { value: 1,    unit: 'pc',   editable: false, description: 'Size label per garment' },
        polybag:      { value: 1,    unit: 'pc',   editable: false, description: 'Polybag for individual packing' }
    }
};
