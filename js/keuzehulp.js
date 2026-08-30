const QUESTIONS = [
  {
    id: "situatie",
    step: "Vraag 1",
    title: "Waar sta je nu?",
    multi: false,
    options: [
      { key: "A", label: "Ik start vanaf nul", sub: "Ik heb nog geen website of sterke online basis." },
      { key: "B", label: "Ik wil mijn website vervangen", sub: "Mijn huidige website past niet meer bij mijn bedrijf." },
      { key: "C", label: "Ik wil mijn website verbeteren", sub: "De basis kan mogelijk blijven staan." },
      { key: "D", label: "Ik wil online producten verkopen", sub: "Ik heb een webshop nodig." },
      { key: "E", label: "Ik weet het nog niet precies", sub: "Ik wil eerst weten wat logisch is." },
    ],
  },
  {
    id: "omvang",
    step: "Vraag 2",
    title: "Hoe uitgebreid moet de website worden?",
    multi: false,
    options: [
      { key: "A", label: "Eén sterke pagina", sub: "Alles op één pagina — aanbod, informatie en contact." },
      { key: "B", label: "Kleine bedrijfswebsite", sub: "2–3 overzichtelijke pagina's." },
      { key: "C", label: "Complete bedrijfswebsite", sub: "4–8 pagina's met meerdere diensten." },
      { key: "D", label: "Uitgebreide website", sub: "Veel diensten, doelgroepen of content." },
      { key: "E", label: "Geen idee", sub: "De keuzehulp bepaalt de omvang." },
    ],
  },
  {
    id: "doel",
    step: "Vraag 3",
    title: "Wat moet je website vooral doen?",
    multi: true,
    maxSelect: 2,
    options: [
      { key: "prof", label: "Professioneler overkomen" },
      { key: "leads", label: "Meer aanvragen krijgen" },
      { key: "seo", label: "Beter gevonden worden" },
      { key: "aanbod", label: "Mijn aanbod duidelijker presenteren" },
      { key: "func", label: "Bezoekers iets laten kiezen, berekenen of aanvragen" },
      { key: "sell", label: "Producten online verkopen" },
      { key: "brand", label: "Een sterker merk neerzetten" },
      { key: "grow", label: "Mijn bestaande website verder laten groeien" },
    ],
  },
  {
    id: "vrijheid",
    step: "Vraag 4",
    title: "Hoeveel vrijheid heb je nodig in de opbouw?",
    multi: false,
    options: [
      { key: "A", label: "Duidelijk en professioneel", sub: "Geen ingewikkelde structuur of bijzondere interacties nodig." },
      { key: "B", label: "Meer vrijheid in pagina's", sub: "Verschillende layouts en meer mogelijkheden." },
      { key: "C", label: "Veel vrijheid en bijzondere interactie", sub: "Visueel of inhoudelijk verder dan een normale bedrijfswebsite." },
      { key: "D", label: "Geen idee", sub: "Overige antwoorden bepalen de route." },
    ],
  },
  {
    id: "functies",
    step: "Vraag 5",
    title: "Wat moet de website kunnen?",
    multi: true,
    maxSelect: 99,
    options: [
      { key: "info", label: "Alleen informatie tonen" },
      { key: "contact", label: "Contactformulier" },
      { key: "offerte", label: "Offerteformulier" },
      { key: "flow", label: "Uitgebreide aanvraagflow" },
      { key: "upload", label: "Bestanden laten uploaden" },
      { key: "calc", label: "Calculator / prijsberekening" },
      { key: "config", label: "Keuzehulp / configurator" },
      { key: "api", label: "Koppeling met externe systemen" },
      { key: "accounts", label: "Accounts / persoonlijke omgeving" },
      { key: "shop", label: "Producten verkopen" },
      { key: "dunno", label: "Ik weet niet wat mogelijk is" },
    ],
  },
  {
    id: "teksten",
    step: "Vraag 6",
    title: "Hoe staat het met je teksten?",
    multi: false,
    options: [
      { key: "A", label: "Mijn teksten zijn al goed" },
      { key: "B", label: "Ze moeten scherper", sub: "Er is een basis maar het kan beter." },
      { key: "C", label: "Moeten nog grotendeels geschreven worden" },
      { key: "D", label: "Ik wil vooral beter gevonden worden" },
      { key: "E", label: "Ik weet het niet zeker" },
    ],
  },
  {
    id: "huisstijl",
    step: "Vraag 7",
    title: "Heb je al een sterke visuele identiteit?",
    multi: false,
    options: [
      { key: "A", label: "Ja", sub: "Logo, kleuren, typografie en uitstraling staan goed." },
      { key: "B", label: "Gedeeltelijk", sub: "Er is een basis, maar het voelt nog niet als één geheel." },
      { key: "C", label: "Nee", sub: "Ik start zonder duidelijke huisstijl." },
      { key: "D", label: "Mijn merk moet vernieuwd worden" },
    ],
  },
];

const COMPLEX_FUNCS = ["flow", "upload", "calc", "config", "api", "accounts"];

function computeResult(answers) {
  const sit = answers.situatie;
  const omv = answers.omvang;
  const doelen = answers.doel || [];
  const vrij = answers.vrijheid;
  const funcs = answers.functies || [];
  const tekst = answers.teksten;
  const stijl = answers.huisstijl;

  const hasComplexFunc = funcs.some((f) => COMPLEX_FUNCS.includes(f));
  const wantsShop = sit === "D" || doelen.includes("sell") || funcs.includes("shop");

  let type = "MAATWERK";
  let title = "";
  let lead = "";
  let recommended = [];
  let also = [];
  let notNeeded = [];
  let reasons = [];
  let price = "Op offerte";

  if (wantsShop) {
    title = hasComplexFunc ? "Webshop + slimme functies" : "Webshop";
    lead = "Je website wordt onderdeel van het verkoopproces. Productstructuur, presentatie en bestelproces worden als één geheel opgebouwd.";
    recommended = ["Webshops"];
    if (hasComplexFunc) recommended.push("Slimme functies");
    reasons.push("Je wilt online producten verkopen");
    if (hasComplexFunc) reasons.push("Je hebt specifieke technische eisen");
  } else if (hasComplexFunc) {
    title = "Webdesign + slimme functies";
    lead = "Je website moet meer doen dan alleen informatie presenteren. De functionaliteit wordt onderdeel van de oplossing.";
    recommended = ["Webdesign", "Slimme functies"];
    reasons.push("Je hebt specifieke functionaliteit nodig");
    if (funcs.includes("calc")) reasons.push("Je wilt een calculator of prijsberekening");
    if (funcs.includes("upload")) reasons.push("Je wilt bestanden laten uploaden");
    if (funcs.includes("flow")) reasons.push("Je wilt een uitgebreide aanvraagflow");
  } else if (omv === "A") {
    title = "One-pager";
    lead = "Je aanbod past op één pagina. Een sterke, doelgerichte website wordt opgebouwd rond jouw bedrijf.";
    recommended = ["Webdesign"];
    reasons.push("Je wilt één sterke pagina");
  } else if ((vrij === "C" || vrij === "B") && (omv === "D" || omv === "C")) {
    title = "Webdesign op maat";
    lead = "Je wensen passen niet logisch binnen een vaste scope. De website wordt volledig rond je structuur en doelen opgebouwd.";
    recommended = ["Webdesign"];
    reasons.push("Je hebt meer vrijheid nodig in de opbouw");
    if (omv === "D") reasons.push("Je website wordt uitgebreid");
  } else if (omv === "D") {
    title = "Webdesign op maat";
    lead = "Met veel pagina's, diensten of content is maatwerk de logische route.";
    recommended = ["Webdesign"];
    reasons.push("Je website heeft een uitgebreide omvang");
  } else if (sit === "C" && vrij !== "C") {
    const websiteOk = funcs.every((f) => ["info", "contact", "offerte", "dunno"].includes(f));
    if (websiteOk && doelen.every((d) => ["seo", "grow"].includes(d))) {
      title = "Bestaande website verbeteren";
      lead = "Je hoeft waarschijnlijk niet opnieuw te beginnen. De meeste winst zit in inhoud en vindbaarheid.";
      recommended = ["Tekst & SEO", "Onderhoud & groei"];
      reasons.push("Je bestaande website kan mogelijk blijven staan");
      price = "Op offerte";
    } else {
      title = "Webdesign op maat";
      lead = "Je wilt je bestaande website flink verbeteren — dat vraagt om een rebuild.";
      recommended = ["Webdesign"];
      reasons.push("Je huidige website past niet meer");
    }
  } else if ((omv === "B" || omv === "E") && (vrij === "A" || vrij === "D")) {
    type = "PAKKETWEBSITE";
    title = "Compact en compleet";
    lead = "Je wensen passen binnen een duidelijke website-opzet. Een uitgebreider traject voegt voor jouw situatie weinig extra waarde toe.";
    recommended = ["Pakketwebsite"];
    reasons.push("Je wilt een overzichtelijke website");
    reasons.push("Je hebt geen complexe functionaliteit nodig");
    price = "€799";
  } else if (omv === "C" && (vrij === "A" || vrij === "D")) {
    type = "PAKKETWEBSITE";
    title = "Meer ruimte, nog steeds duidelijk afgebakend";
    lead = "Je website wordt inhoudelijk uitgebreider, maar je wensen blijven binnen een duidelijke scope.";
    recommended = ["Pakketwebsite"];
    reasons.push("Je wilt een complete bedrijfswebsite");
    reasons.push("De functionaliteit blijft overzichtelijk");
    price = "€1.649";
  } else {
    title = "Webdesign op maat";
    lead = "Op basis van je antwoorden is maatwerk de meest logische aanpak.";
    recommended = ["Webdesign"];
    reasons.push("Je wensen gaan verder dan een pakketscope");
  }

  if (tekst && ["B", "C", "D"].includes(tekst)) {
    if (!recommended.includes("Tekst & SEO")) also.push("Tekst & SEO");
    reasons.push("Je teksten of vindbaarheid kunnen sterker");
  } else if (tekst === "E") {
    if (!recommended.includes("Tekst & SEO")) also.push("Tekst & SEO");
  }
  if (tekst === "A" && !recommended.includes("Tekst & SEO")) {
    notNeeded.push("Tekst & SEO");
  }

  if (stijl && ["C", "D"].includes(stijl)) {
    if (!recommended.includes("Branding & huisstijl")) {
      also.push("Branding & huisstijl");
      reasons.push("Je mist een sterke visuele identiteit");
    }
  } else if (stijl === "B") {
    if (!recommended.includes("Branding & huisstijl")) also.push("Branding & huisstijl");
  }
  if (stijl === "A") notNeeded.push("Branding & huisstijl");

  if (doelen.includes("grow") && !recommended.includes("Onderhoud & groei")) {
    also.push("Onderhoud & groei");
  }

  return { type, title, lead, recommended, also, notNeeded, reasons, price };
}

function renderQuestion(idx, answers) {
  const q = QUESTIONS[idx];
  const letters = "ABCDEFGHIJK";
  const prev = answers[q.id];

  let optsHtml = `<div class="dq__opts">`;
  q.options.forEach((opt, i) => {
    const letter = opt.key.length === 1 ? opt.key : letters[i];
    const isSelected = q.multi
      ? Array.isArray(prev) && prev.includes(opt.key)
      : prev === opt.key;
    const cls = ["dq__opt"];
    if (isSelected) cls.push("is-selected");
    if (q.multi) cls.push("has-check");
    optsHtml += `<div class="${cls.join(" ")}" data-key="${opt.key}">`;
    optsHtml += `<span class="dq__opt-letter">${letter}</span>`;
    optsHtml += `<div class="dq__opt-body"><span class="dq__opt-title">${opt.label}</span>`;
    if (opt.sub) optsHtml += `<span class="dq__opt-sub">${opt.sub}</span>`;
    optsHtml += `</div></div>`;
  });
  optsHtml += `</div>`;

  let navHtml = `<div class="dq__nav">`;
  if (idx > 0) {
    navHtml += `<button class="dq__back" type="button" data-action="back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7" /></svg> Vorige</button>`;
  } else {
    navHtml += `<span></span>`;
  }
  const hasAnswer = q.multi ? (Array.isArray(prev) && prev.length > 0) : !!prev;
  navHtml += `<button class="dq__next" type="button" data-action="next" ${hasAnswer ? "" : "disabled"}>${idx < QUESTIONS.length - 1 ? "Volgende" : "Bekijk advies"} <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></button>`;
  navHtml += `</div>`;

  return `<div class="dq__layout">
    <div class="dq__head">
      <div class="dq__step">${q.step}</div>
      <h3 class="dq__title">${q.title}</h3>
      ${q.multi ? `<p class="dq__multi-note">${q.maxSelect && q.maxSelect < 99 ? `Maximaal ${q.maxSelect} antwoorden.` : "Meerdere antwoorden mogelijk."}</p>` : ""}
    </div>
    <div class="dq__body">${optsHtml}${navHtml}</div>
  </div>`;
}

function renderResult(result) {
  let html = `<div class="dqr">`;
  html += `<div class="dqr__type">${result.type}</div>`;
  html += `<h3 class="dqr__title">${result.title}<span class="dot">.</span></h3>`;
  html += `<p class="dqr__lead">${result.lead}</p>`;
  if (result.reasons.length) {
    html += `<div class="dqr__why"><h4>Waarom dit advies?</h4><ul>`;
    result.reasons.forEach((r) => (html += `<li>${r}</li>`));
    html += `</ul></div>`;
  }
  html += `<div class="dqr__services">`;
  result.recommended.forEach((s) => (html += `<span class="dqr__svc">${s}</span>`));
  html += `</div>`;
  if (result.also.length) {
    html += `<p class="dqr__also">Eventueel aanvullend</p><div class="dqr__services">`;
    result.also.forEach((s) => (html += `<span class="dqr__svc dqr__svc--muted">${s}</span>`));
    html += `</div>`;
  }
  if (result.notNeeded.length) {
    html += `<p class="dqr__not">Niet nodig op dit moment: ${result.notNeeded.join(", ")}</p>`;
  }
  html += `<a href="/contact/" class="btn btn--outline dqr__cta">Neem contact op <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg></a>`;
  html += `<br /><button class="dqr__restart" type="button" data-action="restart"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><path d="M1 4v6h6M23 20v-6h-6" /><path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" /></svg> Opnieuw beginnen</button>`;
  html += `</div>`;
  return html;
}

function init() {
  const box = document.getElementById("quizBox");
  const bar = document.getElementById("quizBar");
  const content = document.getElementById("quizContent");
  if (!box || !content || !bar) return;

  let currentIdx = 0;
  const answers = {};

  function render() {
    const pct = currentIdx < QUESTIONS.length
      ? ((currentIdx + 1) / (QUESTIONS.length + 1)) * 100
      : 100;
    bar.style.width = pct + "%";
    if (currentIdx >= QUESTIONS.length) {
      const result = computeResult(answers);
      content.innerHTML = renderResult(result);
    } else {
      content.innerHTML = renderQuestion(currentIdx, answers);
    }
  }

  content.addEventListener("click", (e) => {
    const opt = e.target.closest(".dq__opt");
    if (opt) {
      const q = QUESTIONS[currentIdx];
      const key = opt.dataset.key;
      if (q.multi) {
        if (!answers[q.id]) answers[q.id] = [];
        const arr = answers[q.id];
        const idx = arr.indexOf(key);
        if (idx >= 0) {
          arr.splice(idx, 1);
        } else if (!q.maxSelect || arr.length < q.maxSelect) {
          arr.push(key);
        }
      } else {
        answers[q.id] = key;
      }
      render();
    }

    const action = e.target.closest("[data-action]");
    if (action) {
      const act = action.dataset.action;
      if (act === "next" && !action.disabled) {
        currentIdx++;
        render();
        box.scrollIntoView({ behavior: "smooth", block: "nearest" });
      } else if (act === "back" && currentIdx > 0) {
        currentIdx--;
        render();
      } else if (act === "restart") {
        currentIdx = 0;
        Object.keys(answers).forEach((k) => delete answers[k]);
        render();
        box.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  });

  render();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
