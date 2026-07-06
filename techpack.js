// ═══ techpack.js — POM engine, tolerance logic, construction notes ═══

import { COMPONENT_META, TOLERANCES } from './config.js';

// ─── 1. POM CODE GENERATOR ───────────────────────────────────────────────────
// Generates a short reference code for each measure row (e.g. TRS-001)
function generatePOMCode(category, index) {
    const prefixes = {
        torso:  'TRS',
        sleeve: 'SLV',
        neck:   'NCK'
    };
    const prefix = prefixes[category] || 'GEN';
    return `${prefix}-${String(index + 1).padStart(3, '0')}`;
}

// ─── 2. BUILD POM TABLE ───────────────────────────────────────────────────────
// Takes state.selections, returns array of POM rows ready for PDF table
export function buildPOM(selections) {
    const rows = [];
    let globalIndex = 0;

    const categories = ['torso', 'neck', 'sleeve'];

    categories.forEach(cat => {
        const key = selections[cat];
        if (!key || key === 'none') return;

        // Map selection key to meta category
        const metaGroup = COMPONENT_META[cat + 's']; // 'torsos', 'necks', 'sleeves'
        if (!metaGroup) return;

        const meta = metaGroup[key];
        if (!meta || !meta.measures) return;

        Object.values(meta.measures).forEach((measure, i) => {
            rows.push({
                code:        generatePOMCode(cat, globalIndex),
                description: measure.label,
                value:       measure.value,
                unit:        measure.unit || 'cm',
                tolerance:   TOLERANCES.formatTolerance(measure.value),
                source:      meta.label   // e.g. "Regular Fit", "Long Sleeve"
            });
            globalIndex++;
        });
    });

    return rows;
}

// ─── 3. BUILD CONSTRUCTION NOTES ─────────────────────────────────────────────
// Returns an array of { component, norm, note } objects
export function buildConstructionNotes(selections, garmentType = 'tshirt', careLabelKey = 'woven') {
    const notes = [];

    // Garment-level norm — jersey = ISO 514 by default
    const garmentNorm = garmentType === 'tshirt'
        ? { component: 'General Assembly', norm: 'ISO 514', note: 'All structural seams executed with 4-thread overlock (ISO 514). Seam allowance: 1 cm throughout.' }
        : { component: 'General Assembly', norm: 'ISO 301', note: 'All structural seams executed with lockstitch (ISO 301). Seam allowance: 1 cm throughout.' };

    notes.push(garmentNorm);

    const categories = ['torso', 'neck', 'sleeve'];
    categories.forEach(cat => {
        const key = selections[cat];
        if (!key || key === 'none') return;

        const metaGroup = COMPONENT_META[cat + 's'];
        if (!metaGroup) return;

        const meta = metaGroup[key];
        if (!meta || !meta.construction) return;

        notes.push({
            component: meta.label,
            norm:      meta.iso_norm,
            note:      meta.construction
        });
    });

    // Static notes always included
        notes.push({
            component: 'Hem — Bottom Edge',
            norm: 'ISO 406',
            note: 'Bottom hem finished with 3-needle coverseam stitch (ISO 406). Fold: 2 cm double-needle. Thread: Tex 18 coverseam thread. No raw edges permitted on finished garment.'
        });
        const careLabel = CARE_LABELS[careLabelKey] || CARE_LABELS.woven;
        notes.push({
            component: `Care Label — ${careLabel.label}`,
            norm: 'EN ISO 3758',
            note: `${careLabel.label} required. ${careLabel.construction}.`
        });
        notes.push({
            component: 'Seam Allowance — All Seams',
            norm: 'ISO 4916',
            note: 'Standard seam allowance: 1.0 cm throughout. Shoulder seams: 1.0 cm, pressed toward back. Side seams: 1.0 cm, pressed open. Armhole seams: 1.0 cm, serged together and pressed toward sleeve.'
        });
        notes.push({
            component: 'Shrinkage Compensation',
            norm: '—',
            note: 'All measurements are finished (post-wash) specifications. Pattern must include shrinkage compensation per the fabric shrinkage values above.'
        });

    return notes;
}

// ─── 4. BUILD FULL TECH PACK STATE ───────────────────────────────────────────
// Master function: call this before generating the PDF
// Returns everything specsheet.js needs
export function buildTechPackState(state, projectMeta = {}) {
    const { selections, selectedCategory } = state;

    const garmentType = selectedCategory || 'tshirt';
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-GB', {
        day: '2-digit', month: 'long', year: 'numeric'
    });

    // Active component labels for display
    const activeComponents = [];
    ['torso', 'neck', 'sleeve'].forEach(cat => {
        const key = selections[cat];
        if (!key || key === 'none') return;
        const metaGroup = COMPONENT_META[cat + 's'];
        if (metaGroup?.[key]) activeComponents.push(metaGroup[key].label);
    });

    return {
        // Header
        header: {
            projectName: projectMeta.name  || 'FlatLabs Technical Spec',
            sku:         projectMeta.sku   || `FL-${garmentType.toUpperCase()}-${now.getFullYear()}`,
            season:      projectMeta.season || `SS${String(now.getFullYear()).slice(2)}`,
            date:        dateStr,
            size:        'EU 38 (ISO 3635)',
            brand:  projectMeta.brand  || 'FlatLabs',
            fabric: state.fabric || 'jersey_180',
            components:  activeComponents.join(' · ')
        },
        // POM table rows
        pom: buildPOM(selections),
        // Construction notes
        constructionNotes: buildConstructionNotes(selections, garmentType, state.careLabel),
        // Bill of Materials — built dynamically from state selections
        bom: buildBOM(state)
    };
}

// ─── 5. BUILD BOM DYNAMICALLY FROM USER SELECTIONS ────────────────────────────
import { TSHIRT_CONFIG } from './config/index.js';
import { FABRIC_SPECS, NEEDLES, THREADS, CARE_LABELS, BRAND_LABELS, STITCH_SPECS } from './config/index.js';

function buildBOM(state) {
    const fabric     = FABRIC_SPECS[state.fabric]      || FABRIC_SPECS.jersey_180;
    const needle     = NEEDLES[state.needle]           || NEEDLES.ballpoint_80_12;
    const thread     = THREADS[state.thread]           || THREADS.poly_tex_27;
    const careLabel  = CARE_LABELS[state.careLabel]    || CARE_LABELS.woven;
    const brandLabel = BRAND_LABELS[state.brandLabel]  || BRAND_LABELS.woven;
    const brandQty   = state.brandLabelQty || 1;

    return [
        { ref: 'FAB-001', description: `Main fabric — ${fabric.label} (${fabric.composition})`, unit: 'm', qty: '1.2' },
        { ref: 'FAB-002', description: 'Rib fabric — 1×1 rib (95% Cotton, 5% Elastane)',         unit: 'm', qty: '0.15' },
        { ref: 'THR-001', description: `Sewing thread — ${thread.label} (${thread.use})`,        unit: 'cone', qty: '1' },
        { ref: 'THR-002', description: 'Coverseam thread — Polyester Tex 18',                    unit: 'cone', qty: '1' },
        { ref: 'NDL-001', description: `Needle — ${needle.label} (${needle.use})`,               unit: 'pc',   qty: '—' },
        { ref: 'LAB-001', description: `Care label — ${careLabel.label}. ${careLabel.construction}`, unit: 'pc', qty: '1' },
        { ref: 'LAB-002', description: `Brand label — ${brandLabel.label}. ${brandLabel.construction}`, unit: 'pc', qty: String(brandQty) },
        { ref: 'LAB-003', description: 'Size label — woven',                                     unit: 'pc', qty: '1' },
        { ref: 'PKG-001', description: 'Polybag 35×45 cm, recycled PE',                          unit: 'pc', qty: '1' }
    ];
}
