/* Price-independent OG illustrations: only the three outdated price promotions. */
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { createRequire } = require('node:module');
const workspace = path.resolve(__dirname, '../..');
const localRequire = createRequire(path.join(workspace, 'site/package.json'));
const { ImageResponse } = localRequire('next/og');
const { createElement: h } = localRequire('react');
const fonts = [500, 800].map(weight => ({ name: 'Manrope', weight, style: 'normal', data: fs.readFileSync(path.join(__dirname, `og-fonts/Manrope-${weight}.ttf`)) }));
const ink = '#123c39', paper = '#f6f5ed', blue = '#507be7', lime = '#d5edaa';
const box = (style, ...children) => h('div', { style: { display: 'flex', ...style } }, ...children.flat());
const text = (value, style = {}) => box({ fontSize: 24, lineHeight: 1.25, whiteSpace: 'pre-wrap', ...style }, value);
const shell = (label, ...children) => box({ width: 1200, height: 630, background: paper, color: ink, fontFamily: 'Manrope', position: 'relative', overflow: 'hidden' },
  text('Sitesnit', { position: 'absolute', left: 54, top: 36, fontSize: 26, fontWeight: 800, letterSpacing: -1 }),
  text(label, { position: 'absolute', right: 54, top: 43, fontSize: 15, fontWeight: 800, letterSpacing: 1.5 }),
  ...children,
  text('sitesnit.nl', { position: 'absolute', left: 54, bottom: 30, fontSize: 18, fontWeight: 800 }));
const headline = (value, size = 72, top = 144) => text(value, { position: 'absolute', left: 54, top, fontSize: size, fontWeight: 800, letterSpacing: -3, lineHeight: 1.08 });
const svg = (w, height, children, style = {}) => h('svg', { width: w, height, viewBox: `0 0 ${w} ${height}`, style }, ...children);
const rule = (top, width = 342) => box({ height: 1, width, background: '#bdcdb1', position: 'absolute', left: 27, top });

function costs() {
  return shell('KOSTEN & PAKKETTEN',
    headline('Wat kost\njouw website?', 77),
    text('Eenmalige bouw.\nHosting apart in beeld.', { position: 'absolute', left: 58, top: 341, fontSize: 28, lineHeight: 1.35 }),
    text('Onepager · Website · Maatwerk', { position: 'absolute', left: 58, top: 465, fontSize: 20, fontWeight: 800 }),
    box({ position: 'absolute', left: 712, top: 127, width: 432, height: 394, background: blue, borderRadius: '36px 80px 36px 36px', padding: 29, flexDirection: 'column', gap: 16 },
      text('JE INVESTERING', { color: paper, fontSize: 14, letterSpacing: 1.5, fontWeight: 800, marginBottom: 5 }),
      box({ height: 104, borderRadius: 19, background: paper, padding: '20px 22px', flexDirection: 'column', gap: 6 },
        text('Bouw', { fontSize: 31, fontWeight: 800 }),
        text('Eenmalig voor je website', { fontSize: 16 })),
      box({ height: 114, borderRadius: 19, background: lime, padding: '20px 22px', flexDirection: 'column', gap: 6 },
        text('+ Hosting', { fontSize: 31, fontWeight: 800 }),
        text('Per maand · minimaal 12 maanden', { fontSize: 15 })),
      text('Alle onderdelen duidelijk uitgelegd.', { color: paper, fontSize: 16, fontWeight: 800, marginTop: 5 })));
}

function priceCheck() {
  return shell('PRIJSCHECK',
    headline('Een passende\ninvestering.', 74, 151),
    text('Van jouw wensen naar\nbouw én hosting.', { position: 'absolute', left: 58, top: 344, fontSize: 28, lineHeight: 1.35 }),
    box({ position: 'absolute', left: 58, top: 461, height: 45, padding: '11px 19px', background: ink, color: paper, borderRadius: 24 },
      text('15 vragen. Daarna je prijsindicatie.', { fontSize: 17, fontWeight: 800 })),
    box({ position: 'absolute', left: 721, top: 139, width: 402, height: 355, borderRadius: 29, background: blue, transform: 'rotate(5deg)' }),
    box({ position: 'absolute', left: 697, top: 112, width: 425, height: 390, borderRadius: 29, background: lime, border: '2px solid #c4dda0', flexDirection: 'column', position: 'absolute' },
      text('VOORBEELD / JOUW ROUTE', { position: 'absolute', left: 27, top: 27, fontSize: 12, fontWeight: 800, letterSpacing: 1.3 }),
      text('Website', { position: 'absolute', left: 26, top: 70, fontSize: 48, fontWeight: 800, letterSpacing: -2 }),
      text('5 pagina’s', { position: 'absolute', left: 29, top: 136, fontSize: 24 }),
      rule(190, 367),
      box({ position: 'absolute', left: 29, top: 218, flexDirection: 'column', gap: 10 },
        text('BOUW', { fontSize: 13, letterSpacing: 1, fontWeight: 800 }),
        text('Eenmalig', { fontSize: 23, fontWeight: 800 })),
      text('+', { position: 'absolute', left: 186, top: 230, fontSize: 28, fontWeight: 800, color: blue }),
      box({ position: 'absolute', left: 243, top: 218, flexDirection: 'column', gap: 10 },
        text('HOSTING', { fontSize: 13, letterSpacing: 1, fontWeight: 800 }),
        text('Per maand', { fontSize: 23, fontWeight: 800 })),
      rule(302, 367),
      text('Jouw keuzes bepalen de route.', { position: 'absolute', left: 29, top: 333, fontSize: 17, fontWeight: 800 })));
}

function tools() {
  return shell('TOOLS & CHECKS',
    headline('Maak je volgende\nstap duidelijk.', 62, 129),
    box({ position: 'absolute', left: 134, top: 323 },
      svg(310, 220, [
        h('circle', { cx: 144, cy: 102, r: 98, fill: lime }),
        h('path', { d: 'M99 21L268 156L179 163L139 216L99 21Z', fill: blue }),
      ])),
    box({ position: 'absolute', left: 715, top: 112, width: 431, height: 430, background: '#fffef9', border: '2px solid #dbe2d6', borderRadius: 29, overflow: 'hidden' },
      text('01 / WEBSITECHECK', { position: 'absolute', left: 27, top: 26, fontSize: 13, letterSpacing: 1, fontWeight: 800 }),
      box({ position: 'absolute', left: 27, top: 70, width: 372, height: 15, gap: 7 }, ...Array.from({ length: 10 }, (_, i) => box({ width: 30, height: 15, borderRadius: 8, background: i < 4 ? blue : '#e3eadd' }))),
      rule(111, 372),
      text('02 / PRIJSCHECK', { position: 'absolute', left: 27, top: 135, fontSize: 13, letterSpacing: 1, fontWeight: 800 }),
      text('Bouw + hosting', { position: 'absolute', left: 25, top: 170, fontSize: 33, fontWeight: 800, letterSpacing: -1.3 }),
      text('Een passende route voor je wensen.', { position: 'absolute', left: 28, top: 219, fontSize: 15 }),
      rule(261, 372),
      text('03 / EERSTE ONTWERP', { position: 'absolute', left: 27, top: 285, fontSize: 13, letterSpacing: 1, fontWeight: 800 }),
      box({ position: 'absolute', left: 27, top: 334, gap: 12 },
        ...[ink, blue, lime].map(background => box({ width: 77, height: 66, borderRadius: 16, background })),
        box({ width: 102, height: 66, borderRadius: 16, border: '1px solid #dbe2d6', background: paper, padding: 11, flexDirection: 'column', gap: 9 },
          box({ height: 5, width: 78, background: '#c9d3c3', borderRadius: 3 }),
          box({ gap: 8 },
            box({ height: 28, width: 31, background: blue, borderRadius: 6 }),
            box({ flexDirection: 'column', gap: 8 },
              box({ width: 37, height: 4, borderRadius: 3, background: ink }),
              box({ width: 24, height: 4, borderRadius: 3, background: '#c9d3c3' })))))));
}

const cards = [
  { slug: 'kosten', route: '/kosten', render: costs, alt: 'Wat kost jouw website? Sitesnit maakt eenmalige bouw en hosting voor minimaal twaalf maanden apart inzichtelijk.' },
  { slug: 'prijscheck', route: '/prijscheck', render: priceCheck, alt: 'Sitesnit-prijscheck: vijftien vragen leiden naar een passende route, met bouw en hosting apart in het voorbeeldresultaat.' },
  { slug: 'tools', route: '/tools', render: tools, alt: 'Sitesnit-tools: verbeterpunten voor je website, een prijsindicatie voor bouw en hosting en een eerste ontwerp.' },
];
(async () => {
  const manifest = [];
  for (const card of cards) {
    const image = new ImageResponse(card.render(), { width: 1200, height: 630, fonts });
    const bytes = Buffer.from(await image.arrayBuffer());
    const file = path.join(workspace, 'site/public/og', `${card.slug}.png`);
    fs.writeFileSync(file, bytes);
    if (bytes.readUInt32BE(16) !== 1200 || bytes.readUInt32BE(20) !== 630) throw new Error('Invalid PNG dimensions');
    manifest.push({ slug: card.slug, route: card.route, file, url: `/og/${card.slug}.png`, width: 1200, height: 630, bytes: bytes.length, sha256: crypto.createHash('sha256').update(bytes).digest('hex'), alt: card.alt });
  }
  fs.mkdirSync(path.join(workspace, 'site/reports/seo'), { recursive: true });
  fs.writeFileSync(path.join(workspace, 'site/reports/seo/og-pricing-manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(JSON.stringify(manifest, null, 2));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
