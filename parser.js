// ═══ parser.js — SVG auto-discovery parser ═══

export function parseSVG(svgText) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(svgText, 'image/svg+xml');
    const root = doc.documentElement;
    const cleanId = id => id ? id.replace(/_x5F_/g, '_') : '';

    const data = {
        viewBox: root.getAttribute('viewBox') || '0 0 400 800',
        mannequin: null,
        front: { torsos:{}, necks:{}, sleeves:{}, pockets:{} },
        back:  { torsos:{}, necks:{}, sleeves:{}, pockets:{} }
    };

    // Mannequin ghost (preview only) — clone body_front_grp WITHOUT measurements
    // The fm_*/bm_* cross markers are stored separately so they only render in the PDF
    const frontGrp = root.querySelector('[id="body_front_grp"]')
                  || root.querySelector('[id^="Mannequin_GRP"], [id^="Mannequin_x5F_GRP"], [id^="Mannequin_STY"]');

    if (frontGrp) {
        const clone = frontGrp.cloneNode(true);
        const cp = clone.querySelector('[id^="construction_points"], [id*="construction_x5F_points"]');
        if (cp) cp.remove();
        data.mannequin = new XMLSerializer().serializeToString(clone);
    }

    // Front measurement points (fm_*) — collect ALL fm_* groups wherever they live
    // in the SVG hierarchy, wrap them in a single group, and serialize.
    const fmGroups = root.querySelectorAll('g[id^="fm_"]');
    if (fmGroups.length) {
        const wrapper = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
        wrapper.setAttribute('id', 'front_measurements_collected');
        fmGroups.forEach(g => wrapper.appendChild(g.cloneNode(true)));
        data.measurementsFront = new XMLSerializer().serializeToString(wrapper);
    }

    // Back body ghost (preview only) — clone body_back_grp WITHOUT measurements
    const backGrp = root.querySelector('[id="body_back_grp"]');
    if (backGrp) {
        const clone = backGrp.cloneNode(true);
        const cp = clone.querySelector('[id^="construction_points"], [id*="construction_x5F_points"]');
        if (cp) cp.remove();
        data.mannequinBack = new XMLSerializer().serializeToString(clone);
    }

    // Back measurement points (bm_*) — collect ALL bm_* groups wherever they live
    const bmGroups = root.querySelectorAll('g[id^="bm_"]');
    if (bmGroups.length) {
        const wrapper = doc.createElementNS('http://www.w3.org/2000/svg', 'g');
        wrapper.setAttribute('id', 'back_measurements_collected');
        bmGroups.forEach(g => wrapper.appendChild(g.cloneNode(true)));
        data.measurementsBack = new XMLSerializer().serializeToString(wrapper);
    }

    // Parse garments for both views
    parseView('f', root, data.front);
    parseView('b', root, data.back);

    // Legacy aliases so generator can use data.torsos etc (= front)
    data.torsos = data.front.torsos;
    data.necks = data.front.necks;
    data.sleeves = data.front.sleeves;
    data.pockets = data.front.pockets;

    // NEW: extract measurement cross-points from the mannequin SVG
    data.measurementPoints = parseMeasurementPoints(root);

    return data;
}

// ─── NEW FUNCTION ────────────────────────────────────────────────────────────
// Reads all fm_* and bm_* cross markers from the SVG.
// Each marker is a <g> containing 2 <line> elements (one horizontal, one vertical).
// Returns { front: { key: {x, y}, ... }, back: { key: {x, y}, ... } }
function parseMeasurementPoints(root) {
    const result = { front: {}, back: {} };

    // Helper: given a container group, extract all cross-point centers
    // prefix = 'fm_' for front, 'bm_' for back
    function extractPoints(containerGroup, prefix, store) {
        containerGroup.querySelectorAll('g[id]').forEach(g => {
            const rawId = g.getAttribute('id');
            if (!rawId || !rawId.startsWith(prefix)) return;

            // Key = ID without the prefix (e.g. 'fm_chest_l' → 'chest_l')
            const key = rawId.slice(prefix.length);

            const lines = Array.from(g.querySelectorAll('line'));
            if (lines.length < 2) {
                console.warn(`parseMeasurementPoints: "${rawId}" has fewer than 2 lines — skipping`);
                return;
            }

            // Parse a single <line> into its 4 numeric coordinates
            function readLine(el) {
                const x1 = parseFloat(el.getAttribute('x1'));
                const y1 = parseFloat(el.getAttribute('y1'));
                const x2 = parseFloat(el.getAttribute('x2'));
                const y2 = parseFloat(el.getAttribute('y2'));
                if ([x1, y1, x2, y2].some(isNaN)) {
                    console.warn(`parseMeasurementPoints: a line inside "${rawId}" has invalid coordinates — skipping`);
                    return null;
                }
                return { x1, y1, x2, y2 };
            }

            const l0 = readLine(lines[0]);
            const l1 = readLine(lines[1]);
            if (!l0 || !l1) return;

            // Identify which line is horizontal (y1 === y2) and which is vertical (x1 === x2)
            // Use approximate equality (±0.1) to tolerate floating-point rounding from Illustrator
            function isHorizontal(l) { return Math.abs(l.y1 - l.y2) < 0.1; }
            function isVertical(l)   { return Math.abs(l.x1 - l.x2) < 0.1; }

            const h = isHorizontal(l0) ? l0 : isHorizontal(l1) ? l1 : null;
            const v = isVertical(l0)   ? l0 : isVertical(l1)   ? l1 : null;

            if (!h || !v) {
                console.warn(`parseMeasurementPoints: "${rawId}" lines are neither clearly horizontal nor vertical — skipping`);
                return;
            }

            // Center of horizontal line: midpoint of x, y is constant
            const hCenter = { x: (h.x1 + h.x2) / 2, y: h.y1 };
            // Center of vertical line: x is constant, midpoint of y
            const vCenter = { x: v.x1, y: (v.y1 + v.y2) / 2 };

            // Average both centers for robustness
            store[key] = {
                x: Math.round(((hCenter.x + vCenter.x) / 2) * 100) / 100,
                y: Math.round(((hCenter.y + vCenter.y) / 2) * 100) / 100
            };
        });
    }

    // Front measurements
    const frontGroup = root.querySelector('[id="front_measurements"]');
    if (!frontGroup) {
        console.warn('parseMeasurementPoints: front_measurements group not found — returning empty');
    } else {
        extractPoints(frontGroup, 'fm_', result.front);
    }

    // Back measurements
    const backGroup = root.querySelector('[id="back_measurements"]');
    if (!backGroup) {
        console.warn('parseMeasurementPoints: back_measurements group not found — returning empty');
    } else {
        extractPoints(backGroup, 'bm_', result.back);
    }

    return result;
}
// ─────────────────────────────────────────────────────────────────────────────

function parseView(viewPrefix, root, store) {
    const cleanId = id => id ? id.replace(/_x5F_/g, '_') : '';

    // Find the garment group for this view
    const grpId = `${viewPrefix}_top_ts_GRP`;
    const topGrp = root.querySelector(`[id="${grpId}"], [id="${grpId.replace(/_/g, '_x5F_')}"]`);
    const searchRoot = topGrp || root;

    // Auto-discover _GRP components
    searchRoot.querySelectorAll('g[id]').forEach(g => {
        const rawId = g.getAttribute('id');
        const id = cleanId(rawId);
        if (!id.endsWith('_GRP') || id === grpId) return;

        const base = id.replace('_GRP', '');
        const parts = base.split('_');
        if (parts.length < 5) return;

        const [view, cat, type, component, variant] = parts;
        if (view !== viewPrefix) return;
        // Skip nested subgroups (rib, line, etc.) — only process top-level component groups
        if (parts.length > 5) return;

        const extracted = extractFromGroup(g, cleanId);

        if (component === 'tor') store.torsos[variant] = extracted;
        else if (component === 'nck') store.necks[variant] = extracted;
        else if (component === 'slv') store.sleeves[variant] = extracted;
        else if (component === 'pkt') store.pockets[variant] = extracted;
    });

    // Fallback: discover sleeves without _GRP wrapper
    if (Object.keys(store.sleeves).length === 0 && topGrp) {
        const slvGroups = {};
        topGrp.querySelectorAll('g[id]').forEach(g => {
            const id = cleanId(g.getAttribute('id'));
            const match = id.match(new RegExp(`^${viewPrefix}_top_ts_slv_(\\w+)_([lr])$`));
            if (!match) return;
            const variant = match[1];
            if (!slvGroups[variant]) {
                slvGroups[variant] = { main:null, main_l:null, main_r:null, seams:[], fills:[], borders:[], shapes:[] };
            }
            const side = match[2];
            g.querySelectorAll('path, polyline, line').forEach(el => {
                const childId = cleanId(el.getAttribute('id') || '');
                const pathD = getPathD(el);
                if (!pathD) return;

                if (childId.includes('_sem_')) {
                    slvGroups[variant].seams.push(pathD);
                } else if (childId.includes('_border_')) {
                    slvGroups[variant].borders.push(pathD);
                } else if (childId.includes('_shape_')) {
                    if (side === 'l') slvGroups[variant].main_l = pathD;
                    else slvGroups[variant].main_r = pathD;
                } else if (pathD && !childId.includes('_sem_')) {
                    if (childId.endsWith('_l') || side === 'l') {
                        if (!slvGroups[variant].main_l) slvGroups[variant].main_l = pathD;
                    } else if (childId.endsWith('_r') || side === 'r') {
                        if (!slvGroups[variant].main_r) slvGroups[variant].main_r = pathD;
                    }
                }
            });
        });
        Object.assign(store.sleeves, slvGroups);
    }
}

function extractFromGroup(g, cleanId) {
    const extracted = { main:null, main_l:null, main_r:null, seams:[], fills:[], borders:[], shapes:[], rib:[] };
 
    g.querySelectorAll('path, polyline, line').forEach(el => {
        const childId = cleanId(el.getAttribute('id') || '');
        const pathD = getPathD(el);
        if (!pathD) return;
 
        if (!childId) {
            const parentId = cleanId(el.parentElement?.getAttribute('id') || el.parentElement?.parentElement?.getAttribute('id') || '');
            if (parentId.includes('_sem_')) {
                extracted.seams.push(pathD);
            } else if (parentId.includes('_rib_')) {
                extracted.rib.push(pathD);
            }
            return;
        }
 
        if (childId.includes('_rib_')) {
            extracted.rib.push(pathD);
        } else if (childId.includes('_sem_') || childId.match(/_sem$/)) {
            extracted.seams.push(pathD);
        } else if (childId.includes('_fil') || childId.includes('_inside')) {
            extracted.fills.push(pathD);
        } else if (childId.includes('_border_')) {
            extracted.borders.push(pathD);
        } else if (childId.includes('_shape_')) {
            if (childId.endsWith('_l')) extracted.main_l = pathD;
            else if (childId.endsWith('_r')) extracted.main_r = pathD;
            else extracted.shapes.push(pathD);
        } else if (childId.includes('_inline') || childId.includes('_outline')) {
            if (childId.includes('_outline')) extracted.main = pathD;
            else extracted.seams.push(pathD);
        } else if (pathD) {
            if (childId.endsWith('_l')) extracted.main_l = pathD;
            else if (childId.endsWith('_r')) extracted.main_r = pathD;
            else if (!extracted.main) extracted.main = pathD;
            else extracted.shapes.push(pathD);
        }
    });
 
    return extracted;
}

function getPathD(el) {
    const d = el.getAttribute('d');
    if (d) return d;
    if (el.tagName === 'line') {
        const x1 = el.getAttribute('x1'), y1 = el.getAttribute('y1');
        const x2 = el.getAttribute('x2'), y2 = el.getAttribute('y2');
        if (x1 && y1 && x2 && y2) return `M${x1},${y1}L${x2},${y2}`;
    }
    if (el.tagName === 'polyline' || el.tagName === 'polygon') {
        const pts = el.getAttribute('points');
        if (!pts) return null;
        // points="x1 y1 x2 y2 x3 y3 ..." → "Mx1,y1 Lx2,y2 Lx3,y3 ..."
        const nums = pts.trim().split(/[\s,]+/).map(parseFloat).filter(n => !isNaN(n));
        if (nums.length < 4 || nums.length % 2 !== 0) return null;
        let out = `M${nums[0]},${nums[1]}`;
        for (let i = 2; i < nums.length; i += 2) {
            out += ` L${nums[i]},${nums[i+1]}`;
        }
        if (el.tagName === 'polygon') out += ' Z';
        return out;
    }
    return null;
}
