// ═══ glossary.js — Technical knowledge base for info-modals ═══
// Source: FlatLabs Tech Pack Structure Google Sheet
// 24 terms across 12 categories

export const GLOSSARY = {
    'ft_tex_001': {
        id: `FT-TEX-001`,
        category: `Fabric`,
        name: `Lightweight Jersey`,
        tooltip: `Breathable and soft, perfect for summer garments or inner layers.`,
        detail: `100% Cotton. Provides high breathability but may be slightly sheer in lighter colors. Ideal for fast-fashion basics.`,
        production: `140-150 g/m2`,
        url: `learn/fabrics/lightweight-jersey`
    },
    'ft_tex_002': {
        id: `FT-TEX-002`,
        category: `Fabric`,
        name: `Midweight Jersey`,
        tooltip: `The industry standard for high-quality T-shirts.`,
        detail: `95% Cotton, 5% Elastane. The elastane provides excellent shape recovery, preventing sagging after multiple washes.`,
        production: `180 g/m2`,
        url: `learn/fabrics/midweight-jersey`
    },
    'ft_tex_003': {
        id: `FT-TEX-003`,
        category: `Fabric`,
        name: `Heavyweight Jersey`,
        tooltip: `Thick, structured fabric for a premium "Oversized" look.`,
        detail: `100% Cotton. High durability and rigid structure that holds the silhouette without clinging to the body.`,
        production: `220-240 g/m2`,
        url: `learn/fabrics/heavyweight-jersey`
    },
    'ft_tex_004': {
        id: `FT-TEX-004`,
        category: `Fabric`,
        name: `1x1 Rib`,
        tooltip: `Highly elastic knitted fabric used for finishing.`,
        detail: `Great stretch and recovery. Primarily used for necklines (Neck Width) and cuffs to ensure a snug fit.`,
        production: `95% Cot, 5% Ela`,
        url: `learn/fabrics/rib-knit-basics`
    },
    'iso_514': {
        id: `ISO-514`,
        category: `Seam`,
        name: `4-Thread Overlock`,
        tooltip: `Secure and elastic seam for joining knitted panels.`,
        detail: `Prevents fraying while allowing the seam to stretch with the fabric. Essential for side seams and shoulders.`,
        production: `ISO 514`,
        url: `learn/seams/iso-514-overlock`
    },
    'iso_406': {
        id: `ISO-406`,
        category: `Seam`,
        name: `Coverseam`,
        tooltip: `Professional flat finish for hems and sleeve openings.`,
        detail: `Double-needle stitch with bottom cover. Provides a clean look and prevents raw edges from rolling.`,
        production: `ISO 406`,
        url: `learn/seams/iso-406-coverseam`
    },
    'nd_bp_01': {
        id: `ND-BP-01`,
        category: `Needle`,
        name: `Ball Point (SES)`,
        tooltip: `Designed to pass between fabric loops without cutting fibers.`,
        detail: `Essential for jersey and knitted fabrics to avoid "run" holes or fabric damage during sewing.`,
        production: `Size 70/10 - 80/12`,
        url: `learn/needles/ball-point-ses`
    },
    'lab_wvn_01': {
        id: `LAB-WVN-01`,
        category: `Label`,
        name: `Main Brand Label`,
        tooltip: `Woven label for brand identification.`,
        detail: `High-definition damask weave. Placement: Center back neck, 1 cm below seam.`,
        production: `Woven Polyester`,
        url: `learn/trims/woven-labels`
    },
    'lab_care_01': {
        id: `LAB-CARE-01`,
        category: `Label`,
        name: `Care & Content Label`,
        tooltip: `Required label for legal and care information.`,
        detail: `Includes fiber content and wash symbols per EN ISO 3758. Placement: Left side seam, 10 cm from hem.`,
        production: `Satin or Nylon`,
        url: `learn/trims/care-labels-standards`
    },
    'lab_size_01': {
        id: `LAB-SIZE-01`,
        category: `Label`,
        name: `Size Label`,
        tooltip: `Small woven label indicating the garment size.`,
        detail: `Usually placed next to the brand label or integrated into the care label.`,
        production: `EU/US Sizing`,
        url: `learn/trims/size-labeling`
    },
    'thr_p_27': {
        id: `THR-P-27`,
        category: `Thread`,
        name: `Polyester Thread Tex 27`,
        tooltip: `Standard high-tenacity thread for general sewing.`,
        detail: `Corespun polyester (ISO 180/2). Offers high resistance to chemicals and abrasion.`,
        production: `Tex 27 / Ticket 120`,
        url: `learn/threads/polyester-tex-27`
    },
    'thr_c_18': {
        id: `THR-C-18`,
        category: `Thread`,
        name: `Coverseam Thread Tex 18`,
        tooltip: `Finer thread for soft, low-profile seams.`,
        detail: `Ideal for overlock and coverseam to prevent bulkiness against the skin.`,
        production: `Tex 18 / Ticket 180`,
        url: `learn/threads/low-profile-seams`
    },
    'spi_1012': {
        id: `SPI-1012`,
        category: `Stitch`,
        name: `10-12 SPI`,
        tooltip: `Standard stitch density for knitted garments.`,
        detail: `10 to 12 Stitches Per Inch (SPI). Balances production speed with seam strength and elasticity.`,
        production: `10-12 SPI`,
        url: `learn/construction/stitches-per-inch`
    },
    'pkg_poly_01': {
        id: `PKG-POLY-01`,
        category: `Packing`,
        name: `Recycled Polybag`,
        tooltip: `Protective bag for storage and shipping.`,
        detail: `Made from 100% Recycled PE. Includes suffocation warning in multiple languages.`,
        production: `35x45 cm`,
        url: `learn/packing/recycled-polybags`
    },
    'pkg_fold_01': {
        id: `PKG-FOLD-01`,
        category: `Packing`,
        name: `Standard Flat Fold`,
        tooltip: `Garment is folded flat to fit the polybag.`,
        detail: `Folded with tissue paper to prevent moisture and wrinkles. Front view facing up.`,
        production: `Flat Fold`,
        url: `learn/packing/folding-guides`
    },
    'ft_clr_001': {
        id: `FT-CLR-001`,
        category: `Color`,
        name: `Pantone TCX`,
        tooltip: `The global standard for textile color on cotton.`,
        detail: `"Textile Cotton eXtended". Essential for accurate color matching between screen and dye house.`,
        production: `Pantone FHI`,
        url: `learn/color/pantone-tcx-system`
    },
    'ft_dye_001': {
        id: `FT-DYE-001`,
        category: `Dyeing`,
        name: `Piece Dyed`,
        tooltip: `Fabric is dyed in rolls before the garment is cut.`,
        detail: `The most common method. Ensures uniform color across the entire production lot.`,
        production: `Reactive Dyeing`,
        url: `learn/dyeing/piece-dyed-process`
    },
    'ft_dye_002': {
        id: `FT-DYE-002`,
        category: `Dyeing`,
        name: `Garment Dyed`,
        tooltip: `The finished garment is dyed after being sewn.`,
        detail: `Creates a vintage, "washed" look with slight color variations at the seams.`,
        production: `Post-Assembly`,
        url: `learn/dyeing/garment-dye-guide`
    },
    'ft_prt_001': {
        id: `FT-PRT-001`,
        category: `Print`,
        name: `Water-based Screen Print`,
        tooltip: `Eco-friendly ink that integrates into the fabric.`,
        detail: `Very soft hand feel. Breathable and ideal for large graphics on light-colored fabrics.`,
        production: `Pigment Ink`,
        url: `learn/printing/water-based-screen`
    },
    'ft_prt_002': {
        id: `FT-PRT-002`,
        category: `Print`,
        name: `Plastisol Print`,
        tooltip: `Standard durable ink with vibrant color opacity.`,
        detail: `Sits on top of the fabric. Best for dark fabrics but has a thicker, "plastic" feel.`,
        production: `PVC-Free Plastisol`,
        url: `learn/printing/plastisol-guide`
    },
    'ft_emb_001': {
        id: `FT-EMB-001`,
        category: `Embroidery`,
        name: `Flat Embroidery`,
        tooltip: `Classic thread-based logo or design.`,
        detail: `High durability and premium feel. Measured in stitch count (e.g., 5,000 stitches).`,
        production: `Rayon/Poly Thread`,
        url: `learn/embellishments/embroidery-basics`
    },
    'ft_prt_003': {
        id: `FT-PRT-003`,
        category: `Print`,
        name: `DTG (Direct to Garment)`,
        tooltip: `Digital inkjet ink for unlimited colors and photo-real detail.`,
        detail: `Water-based CMYK ink printed directly onto cotton. No setup fees, ideal for full-color art.`,
        production: `Water-based CMYK Ink`,
        url: `learn/printing/dtg-direct-to-garment`
    },
    'ft_prt_004': {
        id: `FT-PRT-004`,
        category: `Print`,
        name: `Sublimation`,
        tooltip: `Dye fuses into polyester for zero-texture, all-over graphics.`,
        detail: `Ink turns to gas and bonds with polyester fibers. Zero hand feel, fully permanent color.`,
        production: `Dye-Sublimation Ink`,
        url: `learn/printing/sublimation-printing`
    },
    'ft_fin_001': {
        id: `FT-FIN-001`,
        category: `Finish`,
        name: `Silicon Wash`,
        tooltip: `Gives the fabric an ultra-soft, silky touch.`,
        detail: `Chemical softener that reduces friction and increases fabric drape. Common for premium T-shirts.`,
        production: `Softener Finish`,
        url: `learn/finishes/silicon-wash`
    },
    'ft_fin_002': {
        id: `FT-FIN-002`,
        category: `Finish`,
        name: `Enzyme Wash`,
        tooltip: `Removes surface fuzz for a clean, pill-resistant look.`,
        detail: `Uses cellulase enzymes to eat away loose fibers. Improves color brightness and prevents pilling.`,
        production: `Bio-Polishing`,
        url: `learn/finishes/enzyme-wash`
    },
    'ft_fin_003': {
        id: `FT-FIN-003`,
        category: `Finish`,
        name: `Sanforized`,
        tooltip: `Pre-shrinking process to ensure dimensional stability.`,
        detail: `Mechanical process that limits residual shrinkage to less than 3%. Critical for consistent sizing.`,
        production: `Pre-shrunk`,
        url: `learn/finishes/sanforized-standards`
    }
};

// Helper: Get all terms by category
export function getByCategory(category) {
    return Object.values(GLOSSARY).filter(t => t.category === category);
}

// Helper: Get a single term by ID
export function getTerm(key) {
    return GLOSSARY[key] || null;
}

// Categories present in the glossary
export const GLOSSARY_CATEGORIES = [...new Set(Object.values(GLOSSARY).map(t => t.category))];
