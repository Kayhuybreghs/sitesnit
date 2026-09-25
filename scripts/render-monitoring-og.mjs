// Static OG artwork using the same local Manrope + next/og convention as render-guide-og.mjs.
import fs from 'node:fs';
import { createElement as h } from 'react';
import { ImageResponse } from 'next/og.js';

const fonts = [500, 800].map(weight => ({ name: 'Manrope', weight, style: 'normal', data: fs.readFileSync(new URL(`./og-fonts/Manrope-${weight}.ttf`, import.meta.url)) }));
const box = (style, ...children) => h('div', { style: { display: 'flex', ...style } }, ...children.flat());
const text = (value, style = {}) => box({ fontSize: 22, lineHeight: 1.25, ...style }, value);
const ink = '#133f46', blue = '#194cd4';
const art = box({ width: 1200, height: 630, position: 'relative', overflow: 'hidden', background: '#f7f5ed', color: ink, fontFamily: 'Manrope', padding: 52 },
  text('sitesnit / hub', { position: 'absolute', left: 52, top: 38, fontSize: 31, fontWeight: 800, letterSpacing: -1.3 }),
  text('WEBSITE-MONITORING', { position: 'absolute', right: 52, top: 50, fontSize: 13, fontWeight: 800, letterSpacing: 1.8 }),
  box({ position: 'absolute', left: 52, top: 190, width: 520, flexDirection: 'column' },
    text('Je website.', { fontWeight: 800, fontSize: 70, letterSpacing: -3 }),
    text('Helder in beeld.', { color: blue, fontWeight: 800, fontSize: 63, letterSpacing: -3 }),
    text('Bezoekers. Google. Uitgevoerd werk.', { fontSize: 23, marginTop: 27, maxWidth: 490 })),
  box({ position: 'absolute', right: 38, top: 137, width: 506, height: 390, background: '#dce9c6', borderRadius: '96px 32px 80px 32px', transform: 'rotate(-4deg)' }),
  box({ position: 'absolute', right: 64, top: 145, width: 448, flexDirection: 'column', background: '#fffdf7', border: '1px solid #b4c6bd', borderRadius: 24, padding: 26 },
    box({ justifyContent: 'space-between', alignItems: 'center', paddingBottom: 21, borderBottom: '1px solid #dce2d8' }, text('Eén overzicht', { fontWeight: 800, fontSize: 26 }), text('JOUW BRONNEN', { fontSize: 10, letterSpacing: 1, color: '#42615e' })),
    [['GA4', 'Bezoek & gebruik', '#e3eaff'], ['Search Console', 'Vindbaarheid', '#e6efdb'], ['Werklog', 'Wat is uitgevoerd', '#f5ddca']].map(([source, label, color], index) => box({ gap: 16, alignItems: 'center', paddingTop: 20 }, box({ width: 43, height: 43, borderRadius: 13, background: color, alignItems: 'center', justifyContent: 'center', color: blue, fontWeight: 800, fontSize: 16 }, `0${index + 1}`), box({ flexDirection: 'column', gap: 4 }, text(label, { fontSize: 20, fontWeight: 800 }), text(source, { fontSize: 13, color: '#526965' })))),
    text('Met bron, periode en meetmoment.', { marginTop: 23, paddingTop: 17, borderTop: '1px solid #dce2d8', fontSize: 15 })),
  text('sitesnit.nl', { position: 'absolute', left: 52, bottom: 34, fontWeight: 800, fontSize: 18 }),
  text('Inzicht geeft richting.', { position: 'absolute', right: 52, bottom: 34, fontSize: 18 }));
const response = new ImageResponse(art, { width: 1200, height: 630, fonts });
fs.mkdirSync('public/og', { recursive: true });
fs.writeFileSync('public/og/website-monitoring.png', Buffer.from(await response.arrayBuffer()));
console.log('Rendered website-monitoring.png (1200 × 630), without synthetic metrics or customer claims.');
