// ═══ compatibility.js — Rule engine for material compatibility checks ═══

export const COMPATIBILITY_RULES = [

    // ─── Existing rules (t-shirt era) ─────────────────────────
    {
        id:    'needle_too_fine_for_fabric',
        level: 'warning',
        check: (ctx) => {
            if (!ctx.fabric || !ctx.needle) return false;
            return ctx.fabric.weight > ctx.needle.for_weight.max;
        },
        message: (ctx) =>
            `Needle ${ctx.needle.label} is too fine for ${ctx.fabric.label} ` +
            `(${ctx.fabric.weight} g/m²). Risk of needle breakage. ` +
            `Recommended: a needle rated for at least ${ctx.fabric.weight} g/m².`
    },
    {
        id:    'sharp_needle_on_knit',
        level: 'warning',
        check: (ctx) => {
            if (!ctx.fabric || !ctx.needle) return false;
            return ctx.fabric.knit_type === 'knit' && ctx.needle.point_type === 'sharp';
        },
        message: (ctx) =>
            `Sharp needles can damage knit fabrics like ${ctx.fabric.label} by ` +
            `cutting fibers. Use a ballpoint needle for knits.`
    },
    {
        id:    'thread_too_thick_for_needle',
        level: 'warning',
        check: (ctx) => {
            if (!ctx.thread || !ctx.needle) return false;
            return ctx.thread.for_needle_min_size > ctx.needle.size;
        },
        message: (ctx) =>
            `Thread ${ctx.thread.label} requires a needle size of at least ` +
            `${ctx.thread.for_needle_min_size}. Selected needle is ${ctx.needle.size}.`
    },
    {
        id:    'needle_too_heavy_for_fabric',
        level: 'warning',
        check: (ctx) => {
            if (!ctx.fabric || !ctx.needle) return false;
            return ctx.fabric.weight < ctx.needle.for_weight.min;
        },
        message: (ctx) =>
            `Needle ${ctx.needle.label} is too heavy for ${ctx.fabric.label} ` +
            `(${ctx.fabric.weight} g/m²). It needs at least ${ctx.needle.for_weight.min} g/m².`
    },

    // ─── Hoodie rules (v6) ────────────────────────────────────
    // Silhouette × silhouette
    {
        id:    'silhouette_mismatch_torso_sleeve',
        level: 'warning',
        check: (ctx) => {
            if (!ctx.torso || !ctx.sleeve) return false;
            const t = ctx.torso.ease;
            const s = ctx.sleeve.ease;
            return (t === 'slim' && s === 'oversize') || (t === 'oversize' && s === 'slim');
        },
        message: (ctx) =>
            `Torso "${ctx.torso.label}" with sleeve "${ctx.sleeve.label}" creates an unbalanced silhouette. ` +
            `Mixing extreme slim and oversize on the same garment is not recommended.`
    },
    {
        id:    'rib_silhouette_mismatch_cuff_hem',
        level: 'warning',
        check: (ctx) => {
            if (!ctx.cuff || !ctx.hem) return false;
            return ctx.cuff.ease !== ctx.hem.ease;
        },
        message: (ctx) =>
            `Cuff "${ctx.cuff.label}" and hem "${ctx.hem.label}" use different rib silhouettes. ` +
            `Industry standard is to match them for visual coherence.`
    },

    // Material × silhouette
    {
        id:    'fabric_too_heavy_for_slim',
        level: 'warning',
        check: (ctx) => {
            if (!ctx.fabric || !ctx.torso) return false;
            return ctx.fabric.weight >= 450 && ctx.torso.ease === 'slim';
        },
        message: (ctx) =>
            `${ctx.fabric.label} (${ctx.fabric.weight} g/m²) is too heavy for a slim silhouette. ` +
            `Heavyweight fleece is structured and works best with regular or oversize fits.`
    },
    {
        id:    'fabric_too_light_for_oversize',
        level: 'warning',
        check: (ctx) => {
            if (!ctx.fabric || !ctx.torso) return false;
            return ctx.fabric.weight < 320 && ctx.torso.ease === 'oversize';
        },
        message: (ctx) =>
            `${ctx.fabric.label} (${ctx.fabric.weight} g/m²) lacks structure for an oversize silhouette. ` +
            `Oversize hoodies need at least 320 g/m² to hold their shape.`
    },

    // Hardware × hardware — physical impossibility (only error-level rule)
    {
        id:    'drawcord_too_thick_for_eyelet',
        level: 'error',
        check: (ctx) => {
            if (!ctx.drawcord || !ctx.eyelet) return false;
            const cordSize = ctx.drawcord.diameter || ctx.drawcord.width || 0;
            return cordSize >= 10 && ctx.eyelet.diameter < 10;
        },
        message: (ctx) =>
            `Drawcord ${ctx.drawcord.label} won't physically fit through eyelet ${ctx.eyelet.label}. ` +
            `Use a smaller cord or a larger eyelet.`
    }
];

/**
 * Runs all rules against a selection context.
 * @param {Object} ctx - { fabric, needle, thread, stitch, careLabel, brandLabel,
 *                         torso, sleeve, cuff, hem, eyelet, drawcord, aglet, ... }
 * @returns {Array} of { id, level, message } for each triggered rule
 */
export function checkCompatibility(ctx) {
    const triggered = [];
    for (const rule of COMPATIBILITY_RULES) {
        if (rule.check(ctx)) {
            triggered.push({
                id:      rule.id,
                level:   rule.level,
                message: typeof rule.message === 'function' ? rule.message(ctx) : rule.message
            });
        }
    }
    return triggered;
}

/**
 * Checks if a specific option is compatible given the current selection context.
 * Used to decide which options should be disabled in the UI.
 *
 * @param {string} targetField - any selection field: 'fabric' | 'needle' | 'thread' | 'stitch' |
 *                               'careLabel' | 'brandLabel' | 'torso' | 'sleeve' | 'cuff' | 'hem' |
 *                               'eyelet' | 'drawcord' | 'aglet' | ...
 * @param {Object} candidateItem - the full object of the option being tested
 * @param {Object} ctx - current selection context (other fields filled, target field empty/replaced)
 * @returns {Object} { compatible: boolean, reason: string }
 */
export function isOptionCompatible(targetField, candidateItem, ctx) {
    // Build a hypothetical context where the target field has the candidate
    const testCtx = { ...ctx, [targetField]: candidateItem };
    const issues = checkCompatibility(testCtx);
    if (issues.length === 0) {
        return { compatible: true, reason: '' };
    }
    // Return the first issue's message
    return { compatible: false, reason: issues[0].message };
}
