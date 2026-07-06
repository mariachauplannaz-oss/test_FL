// ═══ stitches.js — Stitch specifications ═══

export const STITCH_SPECS = {
    overlock_4t: {
        label: '4-Thread Overlock',
        iso: 'ISO 514',
        spi: 12,
        needle: 'Ballpoint 80/12 (SUK)',
        tension: 'Medium — adjusted for stretch',
        use: 'Side seams, shoulder seams'
    },
    coverseam_3n: {
        label: '3-Needle Coverseam',
        iso: 'ISO 406',
        spi: 10,
        needle: 'Ballpoint 75/11 (SUK)',
        tension: 'Light — allows stretch recovery',
        use: 'Hems, sleeve hems, topstitching'
    },
    flatlock: {
        label: 'Flatlock Stitch',
        iso: 'ISO 607',
        spi: 14,
        needle: 'Ballpoint 70/10 (SUK)',
        tension: 'Light',
        use: 'Neckband attachment, decorative flat seams'
    }
};
