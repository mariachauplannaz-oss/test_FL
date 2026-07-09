// ═══ glossary-widget.js — Shared glossary tabs+grid, rendered identically on
// index.html and learn/index.html. Single source of truth for glossary data,
// grouping logic, and markup. Not an ES module (index.html doesn't use
// modules) — loaded as a plain <script src="/js/glossary-widget.js">.
//
// Looks for a #glossaryWidget container in the DOM and renders the tabs
// block + grid block into it. Also exposes window.GLOSSARY_COUNT so each
// page can use the live term count in its own copy (e.g. "Browse all N
// terms →").

const GLOSSARY = [
  { id:'FT-TEX-001', category:'Fabric',     name:'Lightweight Jersey',      tooltip:'Breathable and soft, perfect for summer garments or inner layers.',         production:'140-150 g/m²', url:'/learn/fabrics/lightweight-jersey.html' },
  { id:'FT-TEX-002', category:'Fabric',     name:'Midweight Jersey',        tooltip:'The industry standard for high-quality T-shirts.',                          production:'180 g/m²',     url:'/learn/fabrics/midweight-jersey.html' },
  { id:'FT-TEX-003', category:'Fabric',     name:'Heavyweight Jersey',      tooltip:'Thick, structured fabric for a premium "Oversized" look.',                  production:'220-240 g/m²', url:'/learn/fabrics/heavyweight-jersey.html' },
  { id:'FT-TEX-004', category:'Fabric',     name:'1×1 Rib',                 tooltip:'Highly elastic knitted fabric used for finishing.',                         production:'95% Cot, 5% Ela', url:'/learn/fabrics/rib-knit-basics.html' },
  { id:'ISO-514',    category:'Seam',       name:'4-Thread Overlock',       tooltip:'Secure and elastic seam for joining knitted panels.',                       production:'ISO 514',      url:'/learn/seams/iso-514-overlock.html' },
  { id:'ISO-406',    category:'Seam',       name:'Coverseam',               tooltip:'Professional flat finish for hems and sleeve openings.',                    production:'ISO 406',      url:'/learn/seams/iso-406-coverseam.html' },
  { id:'ND-BP-01',   category:'Needle',     name:'Ball Point (SES)',        tooltip:'Designed to pass between fabric loops without cutting fibers.',              production:'70/10-80/12',  url:'/learn/needles/ball-point-ses.html' },
  { id:'LAB-WVN-01', category:'Label',      name:'Main Brand Label',        tooltip:'Woven label for brand identification.',                                     production:'Woven Polyester', url:'/learn/trims/woven-labels.html' },
  { id:'LAB-CARE-01',category:'Label',      name:'Care & Content Label',    tooltip:'Required label for legal and care information.',                            production:'Satin or Nylon', url:'/learn/trims/care-labels-standards.html' },
  { id:'LAB-SIZE-01',category:'Label',      name:'Size Label',              tooltip:'Small woven label indicating the garment size.',                            production:'EU/US Sizing', url:'/learn/trims/size-labeling.html' },
  { id:'THR-P-27',   category:'Thread',     name:'Polyester Thread Tex 27', tooltip:'Standard high-tenacity thread for general sewing.',                        production:'Tex 27 / Ticket 120', url:'/learn/threads/polyester-tex-27.html' },
  { id:'THR-C-18',   category:'Thread',     name:'Coverseam Thread Tex 18', tooltip:'Finer thread for soft, low-profile seams.',                                production:'Tex 18 / Ticket 180', url:'/learn/threads/low-profile-seams.html' },
  { id:'SPI-1012',   category:'Stitch',     name:'10-12 SPI',               tooltip:'Standard stitch density for knitted garments.',                            production:'10-12 SPI',    url:'/learn/construction/stitches-per-inch.html' },
  { id:'PKG-POLY-01',category:'Packing',    name:'Recycled Polybag',        tooltip:'Protective bag for storage and shipping.',                                  production:'35×45 cm',     url:'/learn/packing/recycled-polybags.html' },
  { id:'PKG-FOLD-01',category:'Packing',    name:'Standard Flat Fold',      tooltip:'Garment is folded flat to fit the polybag.',                               production:'Flat Fold',    url:'/learn/packing/folding-guides.html' },
  { id:'FT-CLR-001', category:'Color',      name:'Pantone TCX',             tooltip:'The global standard for textile color on cotton.',                         production:'Pantone FHI',  url:'/learn/color/pantone-tcx-system.html' },
  { id:'FT-DYE-001', category:'Dyeing',     name:'Piece Dyed',              tooltip:'Fabric is dyed in rolls before the garment is cut.',                       production:'Reactive',     url:'/learn/dyeing/piece-dyed-process.html' },
  { id:'FT-DYE-002', category:'Dyeing',     name:'Garment Dyed',            tooltip:'The finished garment is dyed after being sewn.',                           production:'Post-Assembly', url:'/learn/dyeing/garment-dye-guide.html' },
  { id:'FT-PRT-001', category:'Print',      name:'Water-based Screen Print',tooltip:'Eco-friendly ink that integrates into the fabric.',                        production:'Pigment Ink',  url:'/learn/printing/water-based-screen.html' },
  { id:'FT-PRT-002', category:'Print',      name:'Plastisol Print',         tooltip:'Standard durable ink with vibrant color opacity.',                         production:'PVC-Free',     url:'/learn/printing/plastisol-guide.html' },
  { id:'FT-EMB-001', category:'Embroidery', name:'Flat Embroidery',         tooltip:'Classic thread-based logo or design.',                                     production:'Rayon/Poly',   url:'/learn/embellishments/embroidery-basics.html' },
  { id:'FT-PRT-003', category:'Print',      name:'DTG (Direct to Garment)', tooltip:'Digital inkjet ink for unlimited colors and photo-real detail.',           production:'Water-based CMYK', url:'/learn/printing/dtg-direct-to-garment.html' },
  { id:'FT-PRT-004', category:'Print',      name:'Sublimation',             tooltip:'Dye fuses into polyester for zero-texture, all-over graphics.',            production:'Dye-Sublimation', url:'/learn/printing/sublimation-printing.html' },
  { id:'FT-FIN-001', category:'Finish',     name:'Silicon Wash',            tooltip:'Gives the fabric an ultra-soft, silky touch.',                             production:'Softener',     url:'/learn/finishes/silicon-wash.html' },
  { id:'FT-FIN-002', category:'Finish',     name:'Enzyme Wash',             tooltip:'Removes surface fuzz for a clean, pill-resistant look.',                   production:'Bio-Polishing', url:'/learn/finishes/enzyme-wash.html' },
  { id:'FT-FIN-003', category:'Finish',     name:'Sanforized',              tooltip:'Pre-shrinking process to ensure dimensional stability.',                   production:'Pre-shrunk',   url:'/learn/finishes/sanforized-standards.html' },
];

/* ── 6-tab taxonomy: "All" + the 5-group harmonized palette ── */
const GROUPS = [
  { key:'all',           label:'All',          color:'#1A1A1A', colorSoft:'rgba(26,26,26,.08)',     cats:[] },
  { key:'materials',     label:'Materials',    color:'#0f9ed7', colorSoft:'#E8F4FA',               cats:['Fabric','Finish'] },
  { key:'construction',  label:'Construction', color:'#64b916', colorSoft:'#F4FFE3',               cats:['Seam','Stitch','Needle','Thread'] },
  { key:'color-dye',     label:'Color & Dye',  color:'#c31700', colorSoft:'rgba(255,107,87,.10)',   cats:['Color','Dyeing'] },
  { key:'decoration',    label:'Decoration',   color:'#ffb500', colorSoft:'#FFF6E0',               cats:['Print','Embroidery'] },
  { key:'trims-packing', label:'Trims',        color:'#5C5C5C', colorSoft:'#EFEFEA',               cats:['Label','Packing'] },
];

const catToGroup = {};
GROUPS.forEach(g => g.cats.forEach(c => catToGroup[c] = g.key));
GLOSSARY.forEach(t => t.group = catToGroup[t.category] || 'materials');

window.GLOSSARY_COUNT = GLOSSARY.length;

(function initGlossaryWidget() {
  const root = document.getElementById('glossaryWidget');
  if (!root) return;

  let activeGroup = 'materials';

  // ── Tabs block ──
  const tabsWrap = document.createElement('div');
  tabsWrap.className = 'glw-tabs-wrap';
  const tabsInner = document.createElement('div');
  tabsInner.className = 'glw-tabs-inner';
  const tabsLabel = document.createElement('span');
  tabsLabel.className = 'glw-tabs-label';
  tabsLabel.textContent = 'Browse by';
  const tabsEl = document.createElement('div');
  tabsEl.className = 'glw-tabs';
  tabsEl.setAttribute('role', 'tablist');

  tabsInner.appendChild(tabsLabel);
  tabsInner.appendChild(tabsEl);
  tabsWrap.appendChild(tabsInner);

  // ── Grid block ──
  const gridSection = document.createElement('section');
  gridSection.className = 'glw-grid-section';
  const sectionHeading = document.createElement('div');
  sectionHeading.className = 'glw-section-heading';
  const headingEl = document.createElement('h2');
  const countEl = document.createElement('span');
  countEl.className = 'glw-section-count';
  sectionHeading.appendChild(headingEl);
  sectionHeading.appendChild(countEl);
  const gridEl = document.createElement('div');
  gridEl.className = 'glw-grid';
  gridSection.appendChild(sectionHeading);
  gridSection.appendChild(gridEl);

  root.appendChild(tabsWrap);
  root.appendChild(gridSection);

  function termsForGroup(groupKey) {
    return groupKey === 'all' ? GLOSSARY : GLOSSARY.filter(t => t.group === groupKey);
  }

  function renderTabs() {
    tabsEl.innerHTML = '';
    GROUPS.forEach(g => {
      const count = termsForGroup(g.key).length;
      const btn = document.createElement('button');
      btn.className = 'glw-tab' + (g.key === activeGroup ? ' active' : '');
      btn.dataset.group = g.key;
      btn.setAttribute('role', 'tab');
      btn.setAttribute('aria-selected', g.key === activeGroup ? 'true' : 'false');
      btn.style.setProperty('--glw-group', g.color);
      btn.style.setProperty('--glw-group-soft', g.colorSoft);
      btn.innerHTML = `${g.label}<span class="glw-tab-count">${String(count).padStart(2,'0')}</span>`;
      btn.addEventListener('click', () => {
        activeGroup = g.key;
        renderTabs();
        renderGrid();
      });
      tabsEl.appendChild(btn);
    });
  }

  function renderGrid() {
    const group = GROUPS.find(g => g.key === activeGroup);
    const terms = termsForGroup(activeGroup);

    headingEl.innerHTML = `${group.label} <em>terms</em>`;
    countEl.textContent = `${String(terms.length).padStart(2,'0')} ${terms.length === 1 ? 'term' : 'terms'}`;

    gridEl.innerHTML = terms.map(t => {
      const g = GROUPS.find(gr => gr.key === t.group) || group;
      return `
        <a class="glw-card" href="${t.url}" data-group="${t.group}" style="--glw-group:${g.color};--glw-group-soft:${g.colorSoft}">
          <span class="glw-card-cat">${t.category}</span>
          <span class="glw-card-name">${t.name}</span>
          <span class="glw-card-tooltip">${t.tooltip}</span>
          <div class="glw-card-footer">
            <span class="glw-card-id">${t.id}</span>
            <span class="glw-card-link">Read more →</span>
          </div>
        </a>
      `;
    }).join('');
  }

  renderTabs();
  renderGrid();
})();
