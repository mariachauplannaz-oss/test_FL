// ═══ config/index.js — Re-exports everything from the modular config files ═══

export { FABRIC_SPECS }                                                                    from './universal/fabrics.js';
export { STITCH_SPECS }                                                                    from './universal/stitches.js';
export { NEEDLES }                                                                         from './universal/needles.js';
export { THREADS }                                                                         from './universal/threads.js';
export { CARE_LABELS, BRAND_LABELS }                                                       from './universal/labels.js';
export { COMPATIBILITY_RULES, checkCompatibility, isOptionCompatible }                     from './universal/compatibility.js';
export { CARE_SYMBOLS, FABRIC_CARE_MAP }                                                   from './universal/care-symbols.js';
export { COMPONENT_META, collectMeasurements, collectConstruction, TSHIRT_CONFIG }         from './garments/tshirt.js';
export { ISO_BODY, SIZE_EQUIV, TOLERANCES, GRADING, PANTONE_APPROX, findClosestPantone }   from './measurements.js';
