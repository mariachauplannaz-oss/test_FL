// ═══ care-symbols.js — ISO 3758:2012 care label symbol geometries ═══
// SVGs extracted from a verified Figma export (React JSX), validated for ISO
// compliance, and converted to self-contained <svg> element strings — no
// React/JSX, no build step. Rendered to canvas for PDF embedding in
// specsheet.js (Part 2 — not implemented here).

// Structure of each symbol:
// {
//   id: string,
//   category: 'washing'|'bleaching'|'drying'|'ironing'|'professional',
//   label: string,          // human-readable label for PDF text
//   svg: string             // self-contained <svg> element, viewBox 0 0 32 32
// }

export const CARE_SYMBOLS = {

    // ─── WASHING ───────────────────────────────────────────────
    wash_30: {
        id: 'wash_30',
        category: 'washing',
        label: 'Machine Wash 30°C',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 4,5 L 28,5 L 25,19 Q 16,23 7,19 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="16" y="13" dy=".35em" text-anchor="middle" font-size="8" fill="currentColor" font-family="system-ui, -apple-system, sans-serif" font-weight="600">30</text>
        </svg>`
    },
    wash_40: {
        id: 'wash_40',
        category: 'washing',
        label: 'Machine Wash 40°C',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 4,5 L 28,5 L 25,19 Q 16,23 7,19 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="16" y="13" dy=".35em" text-anchor="middle" font-size="8" fill="currentColor" font-family="system-ui, -apple-system, sans-serif" font-weight="600">40</text>
        </svg>`
    },
    wash_60: {
        id: 'wash_60',
        category: 'washing',
        label: 'Machine Wash 60°C',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 4,5 L 28,5 L 25,19 Q 16,23 7,19 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="16" y="13" dy=".35em" text-anchor="middle" font-size="8" fill="currentColor" font-family="system-ui, -apple-system, sans-serif" font-weight="600">60</text>
        </svg>`
    },
    wash_30_gentle: {
        id: 'wash_30_gentle',
        category: 'washing',
        label: 'Machine Wash 30°C — Gentle/Permanent Press',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 4,5 L 28,5 L 25,19 Q 16,23 7,19 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="16" y="13" dy=".35em" text-anchor="middle" font-size="8" fill="currentColor" font-family="system-ui, -apple-system, sans-serif" font-weight="600">30</text>
            <line x1="4" y1="26" x2="28" y2="26" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>`
    },
    wash_40_gentle: {
        id: 'wash_40_gentle',
        category: 'washing',
        label: 'Machine Wash 40°C — Gentle/Permanent Press',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 4,5 L 28,5 L 25,19 Q 16,23 7,19 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="16" y="13" dy=".35em" text-anchor="middle" font-size="8" fill="currentColor" font-family="system-ui, -apple-system, sans-serif" font-weight="600">40</text>
            <line x1="4" y1="26" x2="28" y2="26" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>`
    },
    wash_30_very_gentle: {
        id: 'wash_30_very_gentle',
        category: 'washing',
        label: 'Machine Wash 30°C — Very Gentle/Wool',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 4,5 L 28,5 L 25,19 Q 16,23 7,19 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <text x="16" y="13" dy=".35em" text-anchor="middle" font-size="8" fill="currentColor" font-family="system-ui, -apple-system, sans-serif" font-weight="600">30</text>
            <line x1="4" y1="26" x2="28" y2="26" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="4" y1="29" x2="28" y2="29" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>`
    },
    hand_wash: {
        id: 'hand_wash',
        category: 'washing',
        label: 'Hand Wash Only',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 4,5 L 28,5 L 25,19 Q 16,23 7,19 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="12" y1="10" x2="12" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="15" y1="9" x2="15" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="18" y1="9" x2="18" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="21" y1="10" x2="21" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <path d="M 10,16 Q 16.5,21.5 23,16" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
    },
    do_not_wash: {
        id: 'do_not_wash',
        category: 'washing',
        label: 'Do Not Wash',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 4,5 L 28,5 L 25,19 Q 16,23 7,19 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="7" y1="7" x2="25" y2="25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="25" y1="7" x2="7" y2="25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`
    },

    // ─── BLEACHING ─────────────────────────────────────────────
    bleach_any: {
        id: 'bleach_any',
        category: 'bleaching',
        label: 'Bleach, Any (When Needed)',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 16,4 L 29,27 L 3,27 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>`
    },
    bleach_non_chlorine: {
        id: 'bleach_non_chlorine',
        category: 'bleaching',
        label: 'Non-Chlorine Bleach Only',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <defs>
                <clipPath id="care-tri-clip">
                    <path d="M 16,4 L 29,27 L 3,27 Z"/>
                </clipPath>
            </defs>
            <path d="M 16,4 L 29,27 L 3,27 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <g clip-path="url(#care-tri-clip)">
                <line x1="5" y1="30" x2="22" y2="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="11" y1="30" x2="28" y2="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                <line x1="17" y1="30" x2="34" y2="3" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
            </g>
        </svg>`
    },
    do_not_bleach: {
        id: 'do_not_bleach',
        category: 'bleaching',
        label: 'Do Not Bleach',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 16,4 L 29,27 L 3,27 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="7" y1="7" x2="25" y2="25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="25" y1="7" x2="7" y2="25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`
    },

    // ─── DRYING ────────────────────────────────────────────────
    tumble_dry: {
        id: 'tumble_dry',
        category: 'drying',
        label: 'Tumble Dry, Any Heat',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 3,3 H 29 V 29 H 3 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="16" cy="16" r="8" stroke="currentColor" stroke-width="1.6" fill="none"/>
        </svg>`
    },
    tumble_dry_low: {
        id: 'tumble_dry_low',
        category: 'drying',
        label: 'Tumble Dry, Low Heat',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 3,3 H 29 V 29 H 3 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="16" cy="16" r="8" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <circle cx="16" cy="16" r="1.7" fill="currentColor" stroke="none"/>
        </svg>`
    },
    tumble_dry_med: {
        id: 'tumble_dry_med',
        category: 'drying',
        label: 'Tumble Dry, Medium Heat',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 3,3 H 29 V 29 H 3 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="16" cy="16" r="8" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <circle cx="13" cy="16" r="1.7" fill="currentColor" stroke="none"/>
            <circle cx="19" cy="16" r="1.7" fill="currentColor" stroke="none"/>
        </svg>`
    },
    do_not_tumble_dry: {
        id: 'do_not_tumble_dry',
        category: 'drying',
        label: 'Do Not Tumble Dry',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 3,3 H 29 V 29 H 3 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="16" cy="16" r="8" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <line x1="7" y1="7" x2="25" y2="25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="25" y1="7" x2="7" y2="25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`
    },
    line_dry: {
        id: 'line_dry',
        category: 'drying',
        label: 'Line Dry',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 3,3 H 29 V 29 H 3 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="6" y1="16" x2="26" y2="16" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>`
    },
    drip_dry: {
        id: 'drip_dry',
        category: 'drying',
        label: 'Drip Dry',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 3,3 H 29 V 29 H 3 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="11" y1="9" x2="11" y2="23" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="16" y1="9" x2="16" y2="23" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="21" y1="9" x2="21" y2="23" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>`
    },
    dry_flat: {
        id: 'dry_flat',
        category: 'drying',
        label: 'Dry Flat',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 3,3 H 29 V 29 H 3 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="6" y1="13" x2="26" y2="13" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
            <line x1="6" y1="19" x2="26" y2="19" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>`
    },

    // ─── IRONING ───────────────────────────────────────────────
    iron_low: {
        id: 'iron_low',
        category: 'ironing',
        label: 'Iron, Low Heat',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 3,22 L 25,22 L 29,18 L 26,14 L 8,14 Q 3,14 3,19 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M 8,14 L 8,10 Q 8,8 11,8 L 21,8 Q 24,8 24,10 L 24,14" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="18" r="1.4" fill="currentColor" stroke="none"/>
        </svg>`
    },
    iron_medium: {
        id: 'iron_medium',
        category: 'ironing',
        label: 'Iron, Medium Heat',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 3,22 L 25,22 L 29,18 L 26,14 L 8,14 Q 3,14 3,19 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M 8,14 L 8,10 Q 8,8 11,8 L 21,8 Q 24,8 24,10 L 24,14" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="18" r="1.4" fill="currentColor" stroke="none"/>
            <circle cx="17" cy="18" r="1.4" fill="currentColor" stroke="none"/>
        </svg>`
    },
    iron_high: {
        id: 'iron_high',
        category: 'ironing',
        label: 'Iron, High Heat',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 3,22 L 25,22 L 29,18 L 26,14 L 8,14 Q 3,14 3,19 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M 8,14 L 8,10 Q 8,8 11,8 L 21,8 Q 24,8 24,10 L 24,14" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <circle cx="12" cy="18" r="1.4" fill="currentColor" stroke="none"/>
            <circle cx="17" cy="18" r="1.4" fill="currentColor" stroke="none"/>
            <circle cx="22" cy="18" r="1.4" fill="currentColor" stroke="none"/>
        </svg>`
    },
    do_not_iron: {
        id: 'do_not_iron',
        category: 'ironing',
        label: 'Do Not Iron',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <path d="M 3,22 L 25,22 L 29,18 L 26,14 L 8,14 Q 3,14 3,19 Z" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M 8,14 L 8,10 Q 8,8 11,8 L 21,8 Q 24,8 24,10 L 24,14" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            <line x1="7" y1="7" x2="25" y2="25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="25" y1="7" x2="7" y2="25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`
    },

    // ─── PROFESSIONAL CARE ─────────────────────────────────────
    dry_clean_any: {
        id: 'dry_clean_any',
        category: 'professional',
        label: 'Dry Clean, Any Solvent',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <text x="16" y="16" dy=".35em" text-anchor="middle" font-size="10" fill="currentColor" font-family="system-ui, -apple-system, sans-serif" font-weight="700">P</text>
        </svg>`
    },
    dry_clean_petro: {
        id: 'dry_clean_petro',
        category: 'professional',
        label: 'Dry Clean, Petroleum Solvent Only',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <text x="16" y="16" dy=".35em" text-anchor="middle" font-size="10" fill="currentColor" font-family="system-ui, -apple-system, sans-serif" font-weight="700">F</text>
        </svg>`
    },
    dry_clean_gentle: {
        id: 'dry_clean_gentle',
        category: 'professional',
        label: 'Dry Clean, Gentle Cycle',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <circle cx="16" cy="13" r="10" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <text x="16" y="13" dy=".35em" text-anchor="middle" font-size="10" fill="currentColor" font-family="system-ui, -apple-system, sans-serif" font-weight="700">P</text>
            <line x1="6" y1="27" x2="26" y2="27" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>`
    },
    do_not_dry_clean: {
        id: 'do_not_dry_clean',
        category: 'professional',
        label: 'Do Not Dry Clean',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <line x1="7" y1="7" x2="25" y2="25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
            <line x1="25" y1="7" x2="7" y2="25" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
        </svg>`
    },
    wet_clean: {
        id: 'wet_clean',
        category: 'professional',
        label: 'Wet Clean',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <text x="16" y="16" dy=".35em" text-anchor="middle" font-size="10" fill="currentColor" font-family="system-ui, -apple-system, sans-serif" font-weight="700">W</text>
        </svg>`
    },
    wet_clean_gentle: {
        id: 'wet_clean_gentle',
        category: 'professional',
        label: 'Wet Clean, Gentle Cycle',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <circle cx="16" cy="13" r="10" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <text x="16" y="13" dy=".35em" text-anchor="middle" font-size="10" fill="currentColor" font-family="system-ui, -apple-system, sans-serif" font-weight="700">W</text>
            <line x1="6" y1="27" x2="26" y2="27" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>
        </svg>`
    },
    do_not_wet_clean: {
        id: 'do_not_wet_clean',
        category: 'professional',
        label: 'Do Not Wet Clean',
        svg: `<svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" color="currentColor">
            <circle cx="16" cy="16" r="12" stroke="currentColor" stroke-width="1.6" fill="none"/>
            <text x="16" y="16" dy=".35em" text-anchor="middle" font-size="10" fill="currentColor" font-family="system-ui, -apple-system, sans-serif" font-weight="700">W</text>
            <g stroke="currentColor" stroke-width="1.8" stroke-linecap="round">
                <line x1="7" y1="7" x2="25" y2="25"/>
                <line x1="25" y1="7" x2="7" y2="25"/>
            </g>
        </svg>`
    }
};

// FABRIC_CARE_MAP maps each FABRIC_SPECS key to exactly 5 CARE_SYMBOLS ids,
// one per category, in order: [washing, bleaching, drying, ironing, professional]
export const FABRIC_CARE_MAP = {
    jersey_150:             ['wash_40', 'bleach_non_chlorine', 'tumble_dry_low', 'iron_medium', 'dry_clean_any'],
    jersey_180:             ['wash_40', 'bleach_non_chlorine', 'tumble_dry_low', 'iron_medium', 'dry_clean_any'],
    jersey_200:             ['wash_40', 'bleach_non_chlorine', 'tumble_dry_low', 'iron_medium', 'dry_clean_any'],
    rib_1x1:                ['wash_30_gentle', 'bleach_non_chlorine', 'tumble_dry_low', 'iron_low', 'dry_clean_gentle'],
    rib_2x2:                ['wash_30_gentle', 'bleach_non_chlorine', 'tumble_dry_low', 'iron_low', 'dry_clean_gentle'],
    french_terry_300:       ['wash_40', 'bleach_non_chlorine', 'tumble_dry_low', 'iron_low', 'dry_clean_any'],
    brushed_fleece_320:     ['wash_30_gentle', 'do_not_bleach', 'do_not_tumble_dry', 'iron_low', 'dry_clean_gentle'],
    brushed_fleece_400:     ['wash_30_gentle', 'do_not_bleach', 'do_not_tumble_dry', 'iron_low', 'dry_clean_gentle'],
    heavyweight_fleece_500: ['wash_30_gentle', 'do_not_bleach', 'do_not_tumble_dry', 'do_not_iron', 'dry_clean_gentle']
};
