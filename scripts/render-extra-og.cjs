/* Static original OG designs; no network requests or website photographs. */
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const workspace = path.resolve(__dirname, '../..');
const localRequire = createRequire(path.join(workspace, 'site/package.json'));
const { ImageResponse } = localRequire('next/og');
const { createElement: h } = localRequire('react');
const fonts = [500, 800].map(weight => ({
  name: 'Manrope', weight, style: 'normal',
  data: fs.readFileSync(path.join(__dirname, `og-fonts/Manrope-${weight}.ttf`)),
}));
const ink = '#123c39', paper = '#f6f5ed', blue = '#507be7', lime = '#d5edaa';
const box = (style, ...children) => h('div', { style: { display: 'flex', ...style } }, ...children);
const text = (value, style = {}) => box({ fontSize: 24, lineHeight: 1.25, whiteSpace: 'pre-wrap', ...style }, value);
const shell = (label, children) => box({ width: 1200, height: 630, background: paper, color: ink, fontFamily: 'Manrope', position: 'relative', overflow: 'hidden' },
  text('Sitesnit', { position: 'absolute', left: 54, top: 36, fontSize: 26, fontWeight: 800, letterSpacing: -1 }),
  text(label, { position: 'absolute', right: 54, top: 43, fontSize: 15, fontWeight: 800, letterSpacing: 1.5 }),
  ...children,
  text('sitesnit.nl', { position: 'absolute', left: 54, bottom: 30, fontSize: 18, fontWeight: 800 }));
const headline = (value, top = 150, size = 70) => text(value, {
  position: 'absolute', left: 54, top, fontSize: size, fontWeight: 800,
  lineHeight: 1.08, letterSpacing: -3,
});
const rule = (left, top, width, background = ink) => box({ position: 'absolute', left, top, width, height: 5, borderRadius: 4, background });
const toggle = (on) => box({ width: 66, height: 36, borderRadius: 22, padding: 5, background: on ? ink : '#cbd3c8', alignItems: 'center', justifyContent: on ? 'flex-end' : 'flex-start' },
  box({ width: 26, height: 26, borderRadius: 20, background: on ? lime : paper }));
const settingsRow = (label, on) => box({ width: 354, height: 76, borderRadius: 18, background: paper, padding: '0 20px', alignItems: 'center', justifyContent: 'space-between' },
  text(label, { fontSize: 20, fontWeight: 800 }), toggle(on));

const cards = [
  {
    slug: 'algemene-voorwaarden', route: '/algemene-voorwaarden',
    alt: 'Heldere afspraken bij Sitesnit: 60% aanbetaling bij de start en 40% bij afronding van het project.',
    tree: shell('ALGEMENE VOORWAARDEN', [
      headline('Heldere afspraken.\nSamen verder.', 159, 66),
      text('Van start tot oplevering.', { position: 'absolute', left: 58, top: 341, fontSize: 26 }),
      rule(58, 432, 216, blue),
      text('Opdracht · Betaling · Samenwerking', { position: 'absolute', left: 58, top: 468, fontSize: 18, fontWeight: 800 }),
      box({ position: 'absolute', left: 753, top: 133, width: 390, height: 351, borderRadius: 32, background: ink, overflow: 'hidden', flexDirection: 'column' },
        box({ height: 198, padding: '26px 30px', flexDirection: 'column', color: lime },
          text('60%', { fontSize: 103, lineHeight: 1, letterSpacing: -5, fontWeight: 800 }),
          text('Aanbetaling bij de start', { fontSize: 19, marginTop: 11, fontWeight: 800 })),
        box({ height: 153, padding: '22px 30px', background: lime, alignItems: 'center', gap: 24 },
          text('40%', { fontSize: 67, lineHeight: 1, letterSpacing: -3, fontWeight: 800 }),
          text('Bij afronding\nvan je project', { fontSize: 18, fontWeight: 800 }))),
    ]),
  },
  {
    slug: 'cookies', route: '/cookies',
    alt: 'Jouw keuze: Sitesnit-cookie-instellingen met een voorbeeld van functionele opslag en optionele statistieken.',
    tree: shell('COOKIES & INSTELLINGEN', [
      headline('Jouw keuze.', 159, 84),
      text('Helder over cookies.\nRuimte voor je voorkeur.', { position: 'absolute', left: 58, top: 302, fontSize: 29, lineHeight: 1.4 }),
      rule(58, 441, 114, lime),
      text('Instellingen die je kunt aanpassen.', { position: 'absolute', left: 58, top: 475, fontSize: 19, fontWeight: 800 }),
      box({ position: 'absolute', left: 698, top: 141, width: 446, height: 349, background: blue, borderRadius: '38px 72px 38px 38px', padding: '31px 46px', flexDirection: 'column', gap: 16 },
        text('VOORBEELD INSTELLINGEN', { fontSize: 13, letterSpacing: 1.2, fontWeight: 800, color: paper, marginBottom: 6 }),
        settingsRow('Functioneel', true),
        settingsRow('Statistieken', false),
        text('Jij bepaalt wat je toestaat.', { fontSize: 17, fontWeight: 800, color: paper, marginTop: 5 })),
    ]),
  },
  {
    slug: 'webapps', route: '/diensten/webapps',
    alt: 'Webapps door Sitesnit: een schematisch portaal met inloggen, gebruikersrollen en gedeelde projecttaken, duidelijk gelabeld als voorbeeld.',
    tree: shell('DIENSTEN / WEBAPPS', [
      headline('Jouw werk.\nSlim geregeld.', 157, 74),
      text('Een portaal dat past bij je proces.', { position: 'absolute', left: 58, top: 351, fontSize: 24 }),
      box({ position: 'absolute', left: 58, top: 433, gap: 10 }, ...['Inloggen', 'Rollen', 'Overzicht'].map(value => text(value, { border: '2px solid #cdd8ca', borderRadius: 22, padding: '12px 17px', fontSize: 17, fontWeight: 800 }))),
      box({ position: 'absolute', left: 699, top: 129, width: 445, height: 377, background: '#e5eddb', border: '2px solid #cad8c3', borderRadius: 28, overflow: 'hidden', flexDirection: 'column' },
        box({ width: '100%', height: 69, background: ink, padding: '0 25px', justifyContent: 'space-between', alignItems: 'center' },
          text('Mijn portaal', { color: paper, fontSize: 22, fontWeight: 800 }),
          box({ borderRadius: 18, background: lime, width: 82, height: 32, alignItems: 'center', justifyContent: 'center' }, text('Ingelogd', { fontSize: 12, fontWeight: 800 }))),
        box({ width: '100%', height: 253, padding: '24px 23px', gap: 17 },
          box({ width: 98, flexDirection: 'column', gap: 17 },
            text('Projecten', { fontSize: 14, fontWeight: 800, color: blue }),
            text('Taken', { fontSize: 14 }),
            text('Bestanden', { fontSize: 14 }),
            text('Rollen', { fontSize: 14 })),
          box({ width: 280, flexDirection: 'column', gap: 13 },
            text('Samen aan het werk.', { fontSize: 21, fontWeight: 800 }),
            ...[['Project starten', 'Beheerder'], ['Inhoud bekijken', 'Medewerker']].map(([task, role], index) => box({ background: paper, borderRadius: 14, padding: '15px 14px', height: 68, alignItems: 'center', gap: 11 },
              box({ width: 9, height: 34, borderRadius: 5, background: index ? lime : blue }),
              box({ flexDirection: 'column', gap: 4 },
                text(task, { fontSize: 15, fontWeight: 800 }),
                text(role, { fontSize: 12 })))))) ,
        text('SCHEMATISCH VOORBEELD', { fontSize: 12, letterSpacing: 1.2, fontWeight: 800, marginLeft: 26, marginTop: 9 })),
    ]),
  },
];

(async () => {
  const manifest = [];
  for (const { slug, route, alt, tree } of cards) {
    const response = new ImageResponse(tree, { width: 1200, height: 630, fonts });
    const file = path.join(workspace, 'site/public/og', `${slug}.png`);
    const bytes = Buffer.from(await response.arrayBuffer());
    fs.writeFileSync(file, bytes);
    if (bytes.readUInt32BE(16) !== 1200 || bytes.readUInt32BE(20) !== 630) throw new Error(`Invalid PNG size: ${slug}`);
    manifest.push({ slug, route, file, url: `/og/${slug}.png`, width: 1200, height: 630, bytes: bytes.length, alt });
  }
  fs.mkdirSync(path.join(workspace, 'site/reports/seo'), { recursive: true });
  fs.writeFileSync(path.join(workspace, 'site/reports/seo/og-extra-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify(manifest, null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
