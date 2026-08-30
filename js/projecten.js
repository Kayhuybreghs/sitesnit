var PROJECTS = [
  { slug: "brightwave", cat: "bedrijf", number: "01", title: "Brightwave", type: "Maatwerk website", desc: "Een heldere digitale basis voor een bureau dat hard groeide.", image: "/images/bf35e93d-6a51-47a2-aab9-307bfba16cfa.png", diensten: ["Webdesign", "Tekst & SEO", "Slimme functies"], date: "Juni 2026" },
  { slug: "acure", cat: "webshop", number: "02", title: "Acure", type: "Webshop met checkout", desc: "Een rustige webshop waarin bezoekers makkelijk kunnen kiezen en bestellen.", image: "/images/ChatGPT_Image_9_aug_2026,_09_28_34.png", diensten: ["Webshop", "Webdesign", "Slimme functies"], date: "Mei 2026" },
  { slug: "northbay", cat: "bedrijf", number: "03", title: "Northbay", type: "SaaS-platform", desc: "Heldere uitleg voor een complex product, met een aanvraagflow die leads verdubbelde.", image: "/images/ChatGPT_Image_28_jul_2026,_13_16_12_(1).png", diensten: ["Webdesign", "Tekst & SEO", "Slimme functies"], date: "April 2026" },
  { slug: "cloudly", cat: "onepager", number: "04", title: "Cloudly", type: "One-pager", desc: "Eén pagina, één boodschap: een cloud-dienst in vijf seconden begrepen.", image: "/images/ChatGPT_Image_28_jul_2026,_13_16_12_(2).png", diensten: ["Webdesign", "Tekst & SEO"], date: "Maart 2026" },
  { slug: "datafenix", cat: "redesign", number: "05", title: "Datafenix", type: "Redesign & onderhoud", desc: "Een frisse uitstraling die vertrouwen geeft en zorgt voor betere aanvragen.", image: "/images/ChatGPT_Image_9_aug_2026,_09_35_54.png", diensten: ["Webdesign", "Tekst & SEO", "Branding"], date: "Februari 2026" },
  { slug: "nova", cat: "bedrijf", number: "06", title: "Nova Digital", type: "Maatwerk + branding", desc: "Volledige website voor een digitaal bureau, van concept tot livegang.", image: "/images/ChatGPT_Image_28_jul_2026,_13_16_12_(3).png", diensten: ["Webdesign", "Branding", "Tekst & SEO"], date: "Januari 2026" },
];

function renderGrid() {
  var target = document.getElementById("portfolioCards");
  if (!target) return;
  target.innerHTML = PROJECTS.map(function (p) {
    var dienstTags = p.diensten.map(function (d) { return "<span>" + d + "</span>"; }).join("");
    return '<a class="proj-card" href="/projecten/cases/?c=' + p.slug + '" data-cat="' + p.cat + '">' +
      '<div class="proj-card__img">' +
        '<span class="proj-card__num">' + p.number + '</span>' +
        '<img src="' + p.image + '" alt="' + p.title + ' website" loading="lazy" />' +
        '<div class="proj-card__overlay"><span>Bekijk case <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span></div>' +
      '</div>' +
      '<div class="proj-card__body">' +
        '<div class="proj-card__meta">' +
          '<h3 class="proj-card__title">' + p.title + '</h3>' +
          '<span class="proj-card__date">' + p.date + '</span>' +
        '</div>' +
        '<p class="proj-card__type">' + p.type + '</p>' +
        '<p class="proj-card__desc">' + p.desc + '</p>' +
        '<div class="proj-card__diensten">' + dienstTags + '</div>' +
      '</div>' +
    '</a>';
  }).join("");
}

function initFilters() {
  var buttons = document.querySelectorAll(".proj-filter");
  var cards = document.querySelectorAll(".proj-card");
  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      buttons.forEach(function (b) { b.classList.remove("is-active"); });
      button.classList.add("is-active");
      var filter = button.dataset.filter;
      cards.forEach(function (card) {
        card.classList.toggle("proj-card-hidden", filter !== "all" && card.dataset.cat !== filter);
      });
    });
  });
}

function init() {
  renderGrid();
  initFilters();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
