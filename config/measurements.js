// ═══ measurements.js — ISO body data, grading, tolerances, Pantone ═══

// ─── ISO Body Measurements (EU38 base) ───────────────────────
export const ISO_BODY = {
    EU38: {
        label: 'EU 38',
        gender: 'female',
        body: {
            bust:             { value: 88,   unit: 'cm', type: 'circumference', description: 'Fullest part of bust' },
            waist:            { value: 72,   unit: 'cm', type: 'circumference', description: 'Natural waistline' },
            hip:              { value: 96,   unit: 'cm', type: 'circumference', description: '20 cm below waist' },
            shoulder_width:   { value: 38,   unit: 'cm', type: 'straight',      description: 'Shoulder point to shoulder point (across back)' },
            back_length:      { value: 40,   unit: 'cm', type: 'straight',      description: 'Nape to waist (center back)' },
            arm_length:       { value: 58,   unit: 'cm', type: 'straight',      description: 'Shoulder point to wrist' },
            upper_arm:        { value: 28,   unit: 'cm', type: 'circumference', description: 'Fullest part of upper arm' },
            neck_base:        { value: 36,   unit: 'cm', type: 'circumference', description: 'Base of neck' },
            armhole_depth:    { value: 20.5, unit: 'cm', type: 'straight',      description: 'HPS to underarm level' },
            front_neck_drop:  { value: 4.5,  unit: 'cm', type: 'straight',      description: 'HPS to center front neck (body landmark)' },
            body_rise:        { value: 27,   unit: 'cm', type: 'straight',      description: 'Waist to crotch' },
            inseam:           { value: 78,   unit: 'cm', type: 'straight',      description: 'Crotch to ankle bone' },
            thigh:            { value: 57,   unit: 'cm', type: 'circumference', description: 'Fullest part of thigh' },
            knee:             { value: 37,   unit: 'cm', type: 'circumference', description: 'At knee center' },
            ankle:            { value: 23,   unit: 'cm', type: 'circumference', description: 'Above ankle bone' },
            total_height:     { value: 168,  unit: 'cm', type: 'straight',      description: 'Total body height' }
        }
    }
};

export const SIZE_EQUIV = {
    female: {
        EU34: { us: '2',  uk: '6',  it: '38', fr: '34', jp: '7',  au: '6'  },
        EU36: { us: '4',  uk: '8',  it: '40', fr: '36', jp: '9',  au: '8'  },
        EU38: { us: '6',  uk: '10', it: '42', fr: '38', jp: '11', au: '10' },
        EU40: { us: '8',  uk: '12', it: '44', fr: '40', jp: '13', au: '12' },
        EU42: { us: '10', uk: '14', it: '46', fr: '42', jp: '15', au: '14' },
        EU44: { us: '12', uk: '16', it: '48', fr: '44', jp: '17', au: '16' }
    },
    male: {
        // Male EU sizing uses chest girth: EU = chest_cm / 2
        // EU 50 = chest 100cm = "M" international
        EU46: { us: 'XS', uk: 'XS', it: '46', fr: '46', jp: 'S',  au: 'XS', label: 'XS' },
        EU48: { us: 'S',  uk: 'S',  it: '48', fr: '48', jp: 'M',  au: 'S',  label: 'S'  },
        EU50: { us: 'M',  uk: 'M',  it: '50', fr: '50', jp: 'L',  au: 'M',  label: 'M'  },
        EU52: { us: 'L',  uk: 'L',  it: '52', fr: '52', jp: 'LL', au: 'L',  label: 'L'  },
        EU54: { us: 'XL', uk: 'XL', it: '54', fr: '54', jp: '3L', au: 'XL', label: 'XL' },
        EU56: { us: 'XXL',uk: 'XXL',it: '56', fr: '56', jp: '4L', au: '2XL',label: 'XXL'}
    }
};

// ─── GENDER OFFSETS ─────────────────────────────────────────────
// Applied to female base measurements to derive male values.
// Source: industry-standard grading rules for menswear vs womenswear.
// Female is baseline (offset = 0). Male values come from female base + offset.
// Some measurements (neck details, ease) barely change between genders.

export const GENDER_OFFSETS = {
    female: {
        // Baseline — no offsets, just for symmetry in the code
    },
    male: {
        // Torso
        chest:         8,    // half: 46 → 54 cm
        waist:        10,    // straight silhouette: waist ≈ chest
        hem:           6,    // 48 → 54
        length:        9,    // 62 → 71 cm body length
        shoulder:      7.5,  // 38.5 → 46
        armhole:       3,    // 21 → 24
        across_back:   8,    // 37 → 45
        back_length:   9,    // 64 → 73

        // Sleeves
        sleeve_length: 5,    // long: 60 → 65; cap: 20 → 25 (capped at +5 max for short)
        bicep:         4,    // 16-17 → 20-21
        cuff_opening:  1.5,  // 10.5 → 12
        sleeve_opening: 3,   // 15.5 → 18.5

        // Necks — minimal changes between genders
        neck_width:    0.5,
        front_drop:    0,
        back_drop:     0,
        binding_width: 0,
        collar_height: 0
    }
};

// ─── Tolerances ───────────────────────────────────────────────
export const TOLERANCES = {
    getRuleCm(valueCm) {
        if (valueCm >= 50) return 1.0;
        if (valueCm >= 20) return 0.5;
        return 0.3;
    },
    formatTolerance(valueCm) {
        const tol = this.getRuleCm(valueCm);
        return `± ${tol.toFixed(1)}`;
    }
};

// ─── Grading ──────────────────────────────────────────────────
export const GRADING = {
    baseSize: 'EU38',
    categories: {
        circumference_full: 4,
        circumference_half: 2,
        length_long:        1,
        length_short:       0.5,
        width_shoulder:     1,
        width_small:        0.4,
        depth_neck:         0.2,
        armhole:            0.5,
        circumference_small: 0.5,
        static:             0,
    },
    sizeSteps: {
        // Female sizes — base EU38
        EU34: -2, EU36: -1, EU38: 0, EU40: 1, EU42: 2, EU44: 3,
        // Male sizes — base EU50 (M)
        EU46: -2, EU48: -1, EU50: 0, EU52: 1, EU54: 2, EU56: 3
    },
    keyMap: {
        chest:         'circumference_half',
        bust:          'circumference_half',
        waist:         'circumference_half',
        hip:           'circumference_half',
        hem:           'circumference_half',
        length:        'length_short',
        body_length:   'length_short',
        back_length:   'length_short',
        across_back:   'length_short',
        shoulder:      'width_shoulder',
        armhole:       'armhole',
        sleeve_length: 'length_long',
        bicep:         'circumference_small',
        cuff_opening:  'circumference_small',
        sleeve_opening:'circumference_half',
        neck_width:    'width_small',
        front_drop:    'static',
        back_drop:     'static',
        binding_width: 'static',
        collar_height: 'static',
        thigh:         'circumference_half',
        knee:          'circumference_half',
        ankle:         'circumference_half',
        inseam:        'length_long',
        outseam:       'length_long',
        body_rise:     'length_short',
    },
    getForSize(size, measureKey, baseValue) {
        const category = this.keyMap[measureKey];
        if (!category) return { value: baseValue, hasGradingRule: false };
        const deltaPerStep = this.categories[category];
        const steps = this.sizeSteps[size];
        if (deltaPerStep === undefined || steps === undefined) {
            return { value: baseValue, hasGradingRule: false };
        }
        return {
            value: baseValue + (deltaPerStep * steps),
            hasGradingRule: true
        };
    }
};

// ─── Pantone approx matching ──────────────────────────────────
export const PANTONE_APPROX = [
    { hex: '#000000', name: 'Black',        pantone: '19-0303 TCX Jet Black' },
    { hex: '#FFFFFF', name: 'White',        pantone: '11-0601 TCX Bright White' },
    { hex: '#1C1C1C', name: 'Off Black',    pantone: '19-0508 TCX Peat' },
    { hex: '#F5F5DC', name: 'Cream',        pantone: '11-0507 TCX Winter White' },
    { hex: '#C4B9A8', name: 'Sand',         pantone: '14-1012 TCX Gilded Beige' },
    { hex: '#808080', name: 'Grey',         pantone: '17-4402 TCX Neutral Gray' },
    { hex: '#D3D3D3', name: 'Light Grey',   pantone: '14-4002 TCX Glacier Gray' },
    { hex: '#4A4A4A', name: 'Charcoal',     pantone: '18-0601 TCX Charcoal Gray' },
    { hex: '#000080', name: 'Navy',         pantone: '19-3832 TCX Medieval Blue' },
    { hex: '#00008B', name: 'Dark Navy',    pantone: '19-3939 TCX Blueprint' },
    { hex: '#4169E1', name: 'Royal Blue',   pantone: '19-3955 TCX Royal Blue' },
    { hex: '#87CEEB', name: 'Sky Blue',     pantone: '14-4318 TCX Sky Blue' },
    { hex: '#B0E0E6', name: 'Powder Blue',  pantone: '13-4411 TCX Crystal Blue' },
    { hex: '#FF0000', name: 'Red',          pantone: '18-1763 TCX High Risk Red' },
    { hex: '#8B0000', name: 'Burgundy',     pantone: '19-1725 TCX Tawny Port' },
    { hex: '#DC143C', name: 'Crimson',      pantone: '19-1762 TCX Jester Red' },
    { hex: '#FF6B6B', name: 'Coral',        pantone: '16-1546 TCX Living Coral' },
    { hex: '#FFC0CB', name: 'Pink',         pantone: '13-2010 TCX Crystal Rose' },
    { hex: '#FF69B4', name: 'Hot Pink',     pantone: '17-2127 TCX Shocking Pink' },
    { hex: '#006400', name: 'Forest Green', pantone: '18-0135 TCX Treetop' },
    { hex: '#556B2F', name: 'Olive',        pantone: '18-0527 TCX Olive Drab' },
    { hex: '#90EE90', name: 'Mint',         pantone: '13-6110 TCX Misty Jade' },
    { hex: '#008080', name: 'Teal',         pantone: '18-4930 TCX Deep Lake' },
    { hex: '#FFD700', name: 'Gold',         pantone: '14-0846 TCX Yolk Yellow' },
    { hex: '#FFA500', name: 'Orange',       pantone: '16-1359 TCX Orange Peel' },
    { hex: '#F5F5F0', name: 'Off White',    pantone: '11-0602 TCX Whisper White' },
    { hex: '#A0522D', name: 'Brown',        pantone: '18-1140 TCX Mocha Bisque' },
    { hex: '#D2B48C', name: 'Tan',          pantone: '15-1225 TCX Sand' },
    { hex: '#800080', name: 'Purple',       pantone: '19-3536 TCX Grape Juice' },
    { hex: '#E6E6FA', name: 'Lavender',     pantone: '13-3820 TCX Lavender Fog' }
];

export function findClosestPantone(hex) {
    const h = hex.startsWith('#') ? hex : '#' + hex;
    const r = parseInt(h.slice(1, 3), 16);
    const g = parseInt(h.slice(3, 5), 16);
    const b = parseInt(h.slice(5, 7), 16);
    let closest = PANTONE_APPROX[0];
    let minDist = Infinity;
    for (const p of PANTONE_APPROX) {
        const pr = parseInt(p.hex.slice(1, 3), 16);
        const pg = parseInt(p.hex.slice(3, 5), 16);
        const pb = parseInt(p.hex.slice(5, 7), 16);
        const dist = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
        if (dist < minDist) { minDist = dist; closest = p; }
    }
    return closest;
}
