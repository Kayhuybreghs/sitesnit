const CASES = {
  brightwave: {
    cat: "Bedrijfswebsite",
    title: "Brightwave",
    sub: "Strategie & design voor een digitaal bureau dat groeide van 5 naar 25 klanten.",
    photo: "https://images.pexels.com/photos/326514/pexels-photo-326514.jpeg?auto=compress&cs=tinysrgb&w=1100",
    info: { pakket: "Maatwerk website", price: "€ 2.450", time: "3 weken", rating: 5 },
    rows: [
      {
        label: "De vraag",
        title: "Een website die matched met hun ambitie",
        body: "<p>Brightwave was snel gegroeid, maar hun oude website vertelde niet meer het juiste verhaal. Bezoekers snapten niet meteen wat ze deden, en de uitstraling paste niet bij de kwaliteit die ze leverden.</p><p>Het doel: een website die binnen 5 seconden duidelijk maakt waarom klanten voor Brightwave kiezen.</p>",
        img: "https://images.pexels.com/photos/6611937/pexels-photo-6611937.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "De nieuwe homepage op laptop: rustig, helder, conversiegericht.",
        reverse: false,
      },
      {
        label: "De aanpak",
        title: "Eerst de richting, dan bouwen",
        body: "<p>We begonnen met een visuele richting: kleuren, typografie en een heldere structuur. Pas toen die klopte, hebben we de volledige website gebouwd.</p><p>De homepage vertelt het verhaal in drie stappen: wat ze doen, voor wie ze het doen, en waarom het werkt.</p>",
        img: "https://images.pexels.com/photos/221043/pexels-photo-221043.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Drie stappen, direct zichtbaar op de homepage.",
        reverse: true,
        features: [
          { icon: "design", title: "Maatwerk design", desc: "Eigen uitstraling, geen template." },
          { icon: "seo", title: "SEO-klaar", desc: "Structuur en teksten geoptimaliseerd." },
          { icon: "anim", title: "Subtiele animaties", desc: "Leiden, niet afleiden." },
          { icon: "mobile", title: "Mobile-first", desc: "Werkt op elk scherm." },
        ],
      },
    ],
    logo: "Brightwave",
  quote: { text: "Eindelijk een website die past bij wie we zijn. We krijgen nu reacties van bedrijven die we eerder niet bereikten.", author: "Mark de Vries — Oprichter Brightwave", stars: 5 },
  },
  acure: {
    cat: "Webshop",
    title: "Acure",
    sub: "Een webshop voor designmeubels met een rustig bestelproces en snelle checkout.",
    photo: "https://images.pexels.com/photos/7191162/pexels-photo-7191162.jpeg?auto=compress&cs=tinysrgb&w=1100",
    info: { pakket: "Webshop pakket", price: "€ 3.200", time: "4 weken", rating: 5 },
    rows: [
      {
        label: "De vraag",
        title: "Verkoop zonder drukte",
        body: "<p>Acure verkocht designmeubels via Instagram, maar had geen eigen webshop. Klanten moesten via DM bestellen, wat traag en onoverzichtelijk was.</p><p>Het doel: een webshop die het bestelproces makkelijker maakt, zonder de rustige uitstraling van het merk te verliezen.</p>",
        img: "https://images.pexels.com/photos/4884110/pexels-photo-4884110.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "De webshop op desktop: overzichtelijk en helder.",
        reverse: false,
      },
      {
        label: "De aanpak",
        title: "Rustig design, vlotte checkout",
        body: "<p>Een productstructuur met heldere categorieën en snelle filters. De checkout is in drie stappen: winkelmand, gegevens, betalen. iDEAL direct beschikbaar.</p>",
        img: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800",
        caption: "Checkout in drie stappen: simpel, snel, veilig.",
        reverse: true,
        features: [
          { icon: "cart", title: "iDEAL checkout", desc: "Snel afrekenen zonder account." },
          { icon: "filter", title: "Slimme filters", desc: "Producten vinden in seconden." },
          { icon: "stock", title: "Live voorraad", desc: "Eerlijke weergave." },
          { icon: "mobile", title: "Mobile-first", desc: "70% bestelt via mobiel." },
        ],
      },
    ],
    logo: "Acure",
  quote: { text: "We hadden niet verwacht dat het zo snel zou gaan. De webshop werkt beter dan we durfden hopen.", author: "Lisa Bakker — Eigenaar Acure", stars: 5 },
  },
  northbay: {
    cat: "Bedrijfswebsite",
    title: "Northbay",
    sub: "SaaS-platform met heldere uitleg en een aanvraagflow die leads verdubbelde.",
    photo: "https://images.pexels.com/photos/6611937/pexels-photo-6611937.jpeg?auto=compress&cs=tinysrgb&w=1100",
    info: { pakket: "Maatwerk website", price: "€ 2.850", time: "3 weken", rating: 5 },
    rows: [
      {
        label: "De vraag",
        title: "Complex product simpel uitleggen",
        body: "<p>Northbay biedt een SaaS-platform voor logistieke analyse. Het product is krachtig, maar moeilijk uit te leggen in een paar zinnen.</p><p>Bezoekers dropden af op de homepage omdat ze niet snel genoeg snapten wat de toegevoegde waarde was.</p>",
        img: "https://images.pexels.com/photos/326514/pexels-photo-326514.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Homepage met calculator direct zichtbaar.",
        reverse: false,
      },
      {
        label: "De aanpak",
        title: "Drie stappen, dan aanvragen",
        body: "<p>Homepage herschreven rond drie kernwaarden met visuele voorbeelden. Een calculator geeft bezoekers direct een prijsindicatie. De aanvraagflow is in vier stappen opgesplitst.</p>",
        img: "https://images.pexels.com/photos/221043/pexels-photo-221043.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "De vier-staps aanvraagflow.",
        reverse: true,
        features: [
          { icon: "calc", title: "Prijscalculator", desc: "Direct een indicatie." },
          { icon: "flow", title: "Aanvraagflow", desc: "Vier stappen, lage drempel." },
          { icon: "seo", title: "SEO-pagina's", desc: "Per doelgroep." },
          { icon: "anim", title: "Subtiele animaties", desc: "Begeleidt de bezoeker." },
        ],
      },
    ],
    logo: "Northbay",
  quote: { text: "Eindelijk snappen mensen wat we doen. De calculator doet het zware werk voor ons.", author: "Tom Janssen — CEO Northbay", stars: 5 },
  },
  cloudly: {
    cat: "One-pager",
    title: "Cloudly",
    sub: "Eén pagina, één boodschap: een cloud-dienst in vijf seconden begrepen.",
    photo: "https://images.pexels.com/photos/4884110/pexels-photo-4884110.jpeg?auto=compress&cs=tinysrgb&w=1100",
    info: { pakket: "One-pager pakket", price: "€ 890", time: "1 week", rating: 5 },
    rows: [
      {
        label: "De vraag",
        title: "Eén pagina, één kans",
        body: "<p>Cloudly lanceerde een nieuwe cloud-dienst en wilde snel een landingspagina om bezoekers direct te converteren. Geen uitgebreide website, maar één pagina die alles vertelt.</p>",
        img: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=800",
        caption: "De one-pager: helder, snel, gericht op conversie.",
        reverse: false,
      },
      {
        label: "De aanpak",
        title: "Richten op de essentie",
        body: "<p>Een one-pager met heldere hero, drie voordelen, korte demo en één aanvraagknop. Alles op één pagina, zonder afleiding. Laadt in onder een seconde.</p>",
        img: "https://images.pexels.com/photos/4884105/pexels-photo-4884105.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Snel, simpel en effectief.",
        reverse: true,
        features: [
          { icon: "speed", title: "Onder 1s laadtijd", desc: "Cruciaal voor conversie." },
          { icon: "design", title: "Strak design", desc: "Past bij het merk." },
          { icon: "cta", title: "Eén call-to-action", desc: "Geen keuzestress." },
          { icon: "seo", title: "SEO-klaar", desc: "Ook één pagina kan ranken." },
        ],
      },
    ],
    logo: "Cloudly",
  quote: { text: "Snel, simpel en effectief. Precies wat we nodig hadden.", author: "Sara Visser — Marketing Cloudly", stars: 5 },
  },
  datafenix: {
    cat: "Redesign",
    title: "Datafenix",
    sub: "Van verouderde site naar een strakke data-platform uitstraling die vertrouwen wekt.",
    photo: "https://images.pexels.com/photos/221043/pexels-photo-221043.jpeg?auto=compress&cs=tinysrgb&w=1100",
    info: { pakket: "Redesign pakket", price: "€ 1.950", time: "3 weken", rating: 5 },
    rows: [
      {
        label: "De vraag",
        title: "Vertrouwen wekken met design",
        body: "<p>Datafenix biedt data-analyse voor financiële instellingen. Hun oude website oogde verouderd en wekte niet het vertrouwen dat hun doelgroep verwacht.</p>",
        img: "https://images.pexels.com/photos/326514/pexels-photo-326514.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Het nieuwe design: donker, strak, professioneel.",
        reverse: false,
      },
      {
        label: "De aanpak",
        title: "Strak, professioneel, modern",
        body: "<p>Een nieuwe visuele identiteit met donkere tinten en heldere typografie. Content herschreven rond drie pijlers: veiligheid, snelheid en inzicht.</p>",
        img: "https://images.pexels.com/photos/6611937/pexels-photo-6611937.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Drie pijlers: veiligheid, snelheid, inzicht.",
        reverse: true,
        features: [
          { icon: "brand", title: "Nieuwe branding", desc: "Kleuren en typografie vernieuwd." },
          { icon: "seo", title: "SEO-klaar", desc: "Teksten geoptimaliseerd." },
          { icon: "anim", title: "Subtiele animaties", desc: "Versterkt het moderne gevoel." },
          { icon: "mobile", title: "Mobile-first", desc: "Werkt overal even strak." },
        ],
      },
    ],
    logo: "Datafenix",
  quote: { text: "We krijgen nu reacties van banken die we eerder niet bereikten. Het design deed het verschil.", author: "Pieter Hartman — Oprichter Datafenix", stars: 5 },
  },
  nova: {
    cat: "Bedrijfswebsite",
    title: "Nova Digital",
    sub: "Volledige website voor een digitaal bureau, van concept tot livegang.",
    photo: "https://images.pexels.com/photos/18105/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1100",
    info: { pakket: "Maatwerk + branding", price: "€ 3.500", time: "4 weken", rating: 5 },
    rows: [
      {
        label: "De vraag",
        title: "Van nul naar compleet",
        body: "<p>Nova Digital was een nieuw digitaal bureau. Ze hadden geen website, geen branding en geen content. Alles moest vanaf nul worden opgebouwd.</p>",
        img: "https://images.pexels.com/photos/4884110/pexels-photo-4884110.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "De volledige homepage: van hero tot contact.",
        reverse: false,
      },
      {
        label: "De aanpak",
        title: "Stap voor stap opgebouwd",
        body: "<p>Eerst de merkidentiteit: logo, kleuren en typografie. Daarna de structuur en teksten. Pas toen alles klopte, hebben we de website gebouwd met scroll-animaties en SEO-optimalisatie.</p>",
        img: "https://images.pexels.com/photos/6611937/pexels-photo-6611937.jpeg?auto=compress&cs=tinysrgb&w=800",
        caption: "Branding, structuur en content — vanaf nul.",
        reverse: true,
        features: [
          { icon: "brand", title: "Branding van nul", desc: "Logo, kleuren, typografie." },
          { icon: "design", title: "Maatwerk design", desc: "Eigen uitstraling." },
          { icon: "anim", title: "Scroll-animaties", desc: "Elke sectie vloeiend." },
          { icon: "seo", title: "SEO-klaar", desc: "Structuur en teksten." },
        ],
      },
    ],
    logo: "Nova Digital",
  quote: { text: "In vier weken van nul naar een website waar we trots op zijn. Ongelooflijk.", author: "Emma de Boer — Oprichter Nova Digital", stars: 5 },
  },
};

const ICONS = {
  design: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg>',
  seo: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>',
  anim: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  mobile: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="7" y="2" width="10" height="20" rx="2"/><path d="M11 18h2"/></svg>',
  cart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>',
  filter: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18M6 12h12M10 18h4"/></svg>',
  stock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="m7 14 4-4 3 3 5-6"/></svg>',
  calc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M8 6h8M8 10h2M14 10h2M8 14h2M14 14h2M8 18h2M14 18h2"/></svg>',
  flow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  speed: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2 3 14h9l-1 8 10-12h-9z"/></svg>',
  cta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg>',
  brand: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2 2 7l10 5 10-5-10-5Z"/><path d="M2 17l10 5 10-5"/></svg>',
};

const DIENST_MAP = {
  "Maatwerk design": { slug: "webdesign", name: "Webdesign" },
  "SEO-klaar": { slug: "tekst-seo", name: "Tekst & SEO" },
  "Subtiele animaties": { slug: "slimme-functies", name: "Slimme functies" },
  "Mobile-first": { slug: "webdesign", name: "Webdesign" },
  "iDEAL checkout": { slug: "webshops", name: "Webshops" },
  "Slimme filters": { slug: "slimme-functies", name: "Slimme functies" },
  "Live voorraad": { slug: "webshops", name: "Webshops" },
  "Prijscalculator": { slug: "slimme-functies", name: "Slimme functies" },
  "Aanvraagflow": { slug: "slimme-functies", name: "Slimme functies" },
  "SEO-pagina's": { slug: "tekst-seo", name: "Tekst & SEO" },
  "Onder 1s laadtijd": { slug: "slimme-functies", name: "Slimme functies" },
  "Strak design": { slug: "webdesign", name: "Webdesign" },
  "Eén call-to-action": { slug: "webdesign", name: "Webdesign" },
  "Nieuwe branding": { slug: "branding", name: "Branding" },
  "Branding van nul": { slug: "branding", name: "Branding" },
  "Scroll-animaties": { slug: "slimme-functies", name: "Slimme functies" },
};

function starSvg() {
  return '<svg viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
}

function render() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get("c") || "brightwave";
  const data = CASES[slug] || CASES.brightwave;

  document.title = data.title + " — sitesnit";
  document.getElementById("caseSub").textContent = data.sub;
  document.getElementById("casePhotoImg").src = data.photo;
  document.getElementById("casePhotoImg").alt = data.title + " — website screenshot";
  document.getElementById("caseTitle").innerHTML = data.title;

  var diensten = [];
  var seen = {};
  data.rows.forEach(function (row) {
    if (row.features) {
      row.features.forEach(function (f) {
        var d = DIENST_MAP[f.title];
        if (d && !seen[d.slug]) { seen[d.slug] = true; diensten.push(d); }
      });
    }
  });

  var pillsEl = document.getElementById("casePills");
  if (pillsEl) {
    pillsEl.innerHTML = diensten.map(function (d) {
      return '<a href="/diensten/#' + d.slug + '">' + d.name + "</a>";
    }).join("");
  }

  var body = document.getElementById("caseBody");
  var html = "";
  data.rows.forEach(function (row, i) {
    html += '<div class="case-row">';
    html += '<span class="case-row__dot">' + (i + 1) + "</span>";
    html += '<div><h3>' + row.title + "</h3>";
    html += '<p>' + row.body.replace(/<\/?p>/g, "") + "</p>";
    if (row.features) {
      html += '<div class="case-features">';
      row.features.forEach(function (f) { html += "<span>" + f.title + "</span>"; });
      html += "</div>";
    }
    html += "</div></div>";
  });
  body.innerHTML = html;

  var quoteEl = document.getElementById("caseQuote");
  var qStars = "";
  for (var s = 0; s < (data.quote.stars || 5); s++) qStars += starSvg();
  quoteEl.innerHTML =
    '<div class="case-testimonial__icon"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg></div>' +
    '<div class="case-testimonial__logo">' + (data.logo || data.title) + "</div>" +
    '<div class="stars">' + qStars + "</div>" +
    "<blockquote>" + data.quote.text + "</blockquote>" +
    "<cite><b>" + data.quote.author + "</b></cite>";

}

render();
