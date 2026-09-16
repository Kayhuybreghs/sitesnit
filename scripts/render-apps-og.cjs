/* Original typography and app UI; local fonts; no network requests or photos. */
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const prepared = path.resolve(__dirname, '..');
const workspace = path.resolve(prepared, '..');
const localRequire = createRequire(path.join(workspace, 'site/package.json'));
const { ImageResponse } = localRequire('next/og');
const { createElement: h } = localRequire('react');
const fonts = [500, 800].map(weight => ({ name: 'Manrope', weight, style: 'normal', data: fs.readFileSync(path.join(__dirname, `og-fonts/Manrope-${weight}.ttf`)) }));
const ink = '#123c39', paper = '#f6f5ed', blue = '#507be7', lime = '#d5edaa';
const box = (style, ...children) => h('div', { style: { display: 'flex', ...style } }, ...children);
const label = (value, style = {}) => box({ fontSize: 20, lineHeight: 1.25, whiteSpace: 'pre-wrap', ...style }, value);
const line = () => box({ height: 1, width: '100%', background: '#dce5d5' });
const phone = (style, body) => box({ position: 'absolute', border: `6px solid ${ink}`, borderRadius: 33, overflow: 'hidden', background: '#fbfcf7', flexDirection: 'column', boxShadow: '0 18px 25px #123c3920', ...style },
  box({ height: 32, flexShrink: 0, alignItems: 'center', justifyContent: 'space-between', padding: '0 15px' }, label('9:41', { fontSize: 10, fontWeight: 800 }), box({ width: 47, height: 13, borderRadius: 20, background: ink }), label('•••', { fontSize: 12, fontWeight: 800 })),
  ...body,
  box({ width: 64, height: 4, flexShrink: 0, background: ink, borderRadius: 8, alignSelf: 'center', marginTop: 'auto', marginBottom: 8 }));

const tree = box({ width: 1200, height: 630, background: paper, color: ink, fontFamily: 'Manrope', position: 'relative', overflow: 'hidden' },
  label('Sitesnit', { position: 'absolute', left: 54, top: 36, fontSize: 26, fontWeight: 800, letterSpacing: -1 }),
  label('DIENSTEN / APPS', { position: 'absolute', right: 54, top: 43, fontSize: 15, fontWeight: 800, letterSpacing: 1.5 }),
  label('Jouw idee.\nAls app.', { position: 'absolute', left: 54, top: 154, fontSize: 85, fontWeight: 800, lineHeight: 1.06, letterSpacing: -4 }),
  label('Voor iOS en Android.', { position: 'absolute', left: 58, top: 365, fontSize: 28 }),
  box({ position: 'absolute', left: 58, top: 436, gap: 12 },
    label('App Store', { border: '2px solid #ccd8c4', borderRadius: 21, padding: '12px 20px', fontSize: 17, fontWeight: 800 }),
    label('Google Play', { border: '2px solid #ccd8c4', borderRadius: 21, padding: '12px 20px', fontSize: 17, fontWeight: 800 })),
  box({ position: 'absolute', left: 721, top: 99, width: 450, height: 444, borderRadius: '46% 45% 30% 28%', background: lime, transform: 'rotate(-9deg)' }),
  phone({ left: 691, top: 177, width: 222, height: 352, transform: 'rotate(-8deg)' }, [
    box({ flexDirection: 'column', padding: '5px 15px 10px', gap: 10 },
      label('Mijn werkdag', { fontSize: 14, fontWeight: 800 }),
      label('Ruimte voor\nwat telt.', { fontSize: 27, lineHeight: 1.1, letterSpacing: -1.2, fontWeight: 800 }),
      box({ gap: 4, marginTop: 3 }, ...[['MA','14'],['DI','15'],['WO','16'],['DO','17'],['VR','18']].map(([day, date], index) => box({ flex: 1, flexDirection: 'column', alignItems: 'center', gap: 5, padding: '8px 3px', borderRadius: 9, background: index === 3 ? ink : '#edf2e6', color: index === 3 ? paper : ink }, label(day, { fontSize: 7 }), label(date, { fontSize: 13, fontWeight: 800 })))),
      label('Jouw afspraken', { fontSize: 10, fontWeight: 800, marginTop: 3 }),
      ...[['18:30', 'Kennismaking'], ['19:00', 'Project bespreken']].map(([time, title], index) => box({ padding: '11px 9px', alignItems: 'center', gap: 8, borderRadius: 10, background: index ? '#edf2e6' : '#dce7ff' }, label(time, { fontSize: 9, fontWeight: 800 }), label(title, { fontSize: 10, fontWeight: 800 }))),
    ),
  ]),
  phone({ left: 924, top: 109, width: 223, height: 402, transform: 'rotate(6deg)', background: '#f4f7ee' }, [
    box({ padding: '5px 16px 14px', flexDirection: 'column', alignItems: 'center' },
      label('Jouw aanvraag', { fontSize: 12, fontWeight: 800, alignSelf: 'flex-start', marginBottom: 21 }),
      box({ width: 56, height: 56, background: blue, borderRadius: 19, alignItems: 'center', justifyContent: 'center', marginBottom: 13 },
        h('svg', { width: 31, height: 31, viewBox: '0 0 24 24', fill: 'none' }, h('path', { d: 'm5 12 4 4L19 6', stroke: paper, strokeWidth: 2.3, strokeLinecap: 'round', strokeLinejoin: 'round' }))),
      label('Goed geregeld.', { fontSize: 21, fontWeight: 800, letterSpacing: -1 }),
      label('Je aanvraag is ontvangen.', { fontSize: 10, marginTop: 5, marginBottom: 17 }),
      box({ alignSelf: 'stretch', flexDirection: 'column', gap: 8, background: '#fff', borderRadius: 12, padding: '14px 12px' },
        label('Kennismaking', { fontSize: 12, fontWeight: 800 }), line(),
        label('Donderdag · 18:30', { fontSize: 10 }),
        box({ alignItems: 'center', gap: 6 }, box({ width: 5, height: 5, borderRadius: 5, background: blue }), label('Wacht op bevestiging', { fontSize: 8 }))),
      box({ alignSelf: 'stretch', padding: '11px 10px', border: '1px solid #bcccaa', borderRadius: 10, marginTop: 12, justifyContent: 'space-between' }, label('Naar je overzicht', { fontSize: 10, fontWeight: 800 }), h('svg', { width: 14, height: 14, viewBox: '0 0 24 24', fill: 'none' }, h('path', { d: 'M5 12h14m-5-5 5 5-5 5', stroke: ink, strokeWidth: 1.8, strokeLinecap: 'round', strokeLinejoin: 'round' }))),
    ),
  ]),
  label('INTERFACEVOORBEELD', { position: 'absolute', right: 75, bottom: 44, fontSize: 11, fontWeight: 800, letterSpacing: 1.3 }),
  label('sitesnit.nl', { position: 'absolute', left: 54, bottom: 30, fontSize: 18, fontWeight: 800 }));

(async () => {
  const bytes = Buffer.from(await new ImageResponse(tree, { width: 1200, height: 630, fonts }).arrayBuffer());
  if (bytes.readUInt32BE(16) !== 1200 || bytes.readUInt32BE(20) !== 630) throw new Error('Invalid image dimensions');
  const target = path.join(prepared, 'public/og/apps.png');
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, bytes);
  const metadata = { route: '/diensten/apps', url: '/og/apps.png', width: 1200, height: 630, bytes: bytes.length, alt: 'Apps voor iOS en Android door Sitesnit. Twee originele voorbeeldschermen tonen een agenda en een ontvangen aanvraag, met de tekst Jouw idee. Als app.' };
  fs.mkdirSync(path.join(prepared, 'reports/seo'), { recursive: true });
  fs.writeFileSync(path.join(prepared, 'reports/seo/og-apps-manifest.json'), JSON.stringify(metadata, null, 2) + '\n');
  console.log(JSON.stringify(metadata));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
