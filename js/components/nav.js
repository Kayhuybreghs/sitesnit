const currentPage = window.location.pathname;
const isHome = currentPage === "/" || currentPage === "/index.html" || currentPage.endsWith("/index.html");
const isDiensten = currentPage.includes("diensten");
const isProjecten = currentPage.includes("projecten");
const isPrijzen = currentPage.includes("prijzen");
const isContact = currentPage.includes("contact");

function activeClass(page) {
  if (page === "diensten" && isDiensten) return " nav__link--active";
  if (page === "projecten" && isProjecten) return " nav__link--active";
  if (page === "prijzen" && isPrijzen) return " nav__link--active";
  if (page === "contact" && isContact) return " nav__link--active";
  return "";
}

const NAV_HTML = `
<header class="nav" id="siteNav">
  <div class="nav__inner">
    <a href="/" class="logo" aria-label="sitesnit home">
      <img class="logo__icon" src="/images/sitesnit-icon-black-transparent.png" alt="" />
      <span class="logo__word">sitesnit</span>
    </a>
    <nav class="nav__links" aria-label="Hoofdmenu">
      <div class="nav__item nav__item--drop">
        <a href="/diensten/" class="nav__link nav__toggle${activeClass("diensten")}">
          Diensten
          <svg class="nav__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6" /></svg>
        </a>
        <div class="megamenu" id="diensten-menu" role="menu">
          <a class="megamenu__overview" href="/diensten/" role="menuitem">
            Bekijk alle diensten
            <svg class="megamenu__overview-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </a>
          <div class="megamenu__cols">
            <a class="megamenu__main" href="/diensten/webdesign/" role="menuitem">
              <span class="megamenu__title">Webdesign
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
              <span class="megamenu__desc">Bedrijfswebsite, one-pager, redesign of landingspagina.</span>
            </a>
            <a class="megamenu__main" href="/diensten/pakketwebsites/" role="menuitem">
              <span class="megamenu__title">Pakketwebsites
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
              <span class="megamenu__desc">Een complete website met een duidelijke, vaste opzet.</span>
            </a>
            <a class="megamenu__main" href="/diensten/webshops/" role="menuitem">
              <span class="megamenu__title">Webshops
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
              <span class="megamenu__desc">Een webshop met een heldere kooproute.</span>
            </a>
            <a class="megamenu__main" href="/diensten/slimme-functies/" role="menuitem">
              <span class="megamenu__title">Slimme functies
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
              <span class="megamenu__desc">Calculators, formulieren en aanvraagflows.</span>
            </a>
            <a class="megamenu__main" href="/diensten/tekst-seo/" role="menuitem">
              <span class="megamenu__title">Tekst &amp; SEO
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
              <span class="megamenu__desc">Webteksten en SEO-structuur die bezoekers bereiken.</span>
            </a>
            <a class="megamenu__main" href="/diensten/branding/" role="menuitem">
              <span class="megamenu__title">Branding
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
              <span class="megamenu__desc">Logo, kleur en typografie voor online gebruik.</span>
            </a>
            <a class="megamenu__main" href="/diensten/onderhoud-groei/" role="menuitem">
              <span class="megamenu__title">Onderhoud &amp; groei
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              </span>
              <span class="megamenu__desc">Nieuwe pagina's, aanpassingen en doorontwikkeling.</span>
            </a>
          </div>
        </div>
      </div>
      <a href="/projecten/" class="nav__link${activeClass("projecten")}">Projecten</a>
      <a href="/prijzen/" class="nav__link${activeClass("prijzen")}">Prijzen</a>
      <a href="/contact/" class="nav__link${activeClass("contact")}">Contact</a>
    </nav>
    <a href="/contact/" class="btn btn--solid nav__cta">
      Bespreek je website
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </a>
    <button type="button" class="nav__burger" aria-expanded="false" aria-controls="mobileMenu" aria-label="Menu openen">
      <span>MENU</span>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12h18M3 6h18M3 18h18" /></svg>
    </button>
  </div>
</header>

<div class="mobilemenu" id="mobileMenu" aria-hidden="true">
  <div class="mobilemenu__head">
    <a href="/" class="logo" aria-label="sitesnit home">
      <img class="logo__icon" src="/images/sitesnit-icon-black-transparent.png" alt="" />
      <span class="logo__word">sitesnit</span>
    </a>
    <button type="button" class="mobilemenu__close" aria-label="Menu sluiten">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12" /></svg>
    </button>
  </div>
  <nav class="mobilemenu__links" aria-label="Mobiel menu">
    <a href="/diensten/" class="mobilemenu__parent"><span>01</span>Diensten</a>
    <div class="mobilemenu__sub">
      <a href="/diensten/webdesign/">Webdesign</a>
      <a href="/diensten/pakketwebsites/">Pakketwebsites</a>
      <a href="/diensten/webshops/">Webshops</a>
      <a href="/diensten/slimme-functies/">Slimme functies</a>
      <a href="/diensten/tekst-seo/">Tekst &amp; SEO</a>
      <a href="/diensten/branding/">Branding</a>
      <a href="/diensten/onderhoud-groei/">Onderhoud &amp; groei</a>
    </div>
    <a href="/projecten/"><span>02</span>Projecten</a>
    <a href="/prijzen/"><span>03</span>Prijzen</a>
    <a href="/contact/"><span>04</span>Contact</a>
  </nav>
  <a href="/contact/" class="btn btn--solid mobilemenu__cta">
    Bespreek je website
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  </a>
  <div class="mobilemenu__soc">
    <a href="#" aria-label="Instagram">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></svg>
      Instagram
    </a>
    <a href="#" aria-label="LinkedIn">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v6M8 7v.01M12 16v-3a2 2 0 0 1 4 0v3M12 16v-6" /></svg>
      LinkedIn
    </a>
  </div>
</div>
`;

// Inject immediately (synchronous, before DOMContentLoaded)
const navSlot = document.getElementById("nav-slot");
if (navSlot) {
  navSlot.innerHTML = NAV_HTML;
} else {
  document.body.insertAdjacentHTML("afterbegin", NAV_HTML);
}

// Initialize nav behavior once DOM is ready
function initNav() {
  const nav = document.getElementById("siteNav");
  if (nav) {
    const onScroll = () =>
      nav.classList.toggle("nav--scrolled", window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }

  // Diensten dropdown
  const drop = document.querySelector(".nav__item--drop");
  if (drop) {
    const toggle = drop.querySelector(".nav__toggle");
    let closeTimer = null;

    const openDrop = () => {
      clearTimeout(closeTimer);
      drop.classList.add("is-open");
    };
    const closeDrop = () => {
      drop.classList.remove("is-open");
    };
    const delayClose = () => {
      closeTimer = setTimeout(closeDrop, 120);
    };

    drop.addEventListener("mouseenter", openDrop);
    drop.addEventListener("mouseleave", delayClose);

    const mega = drop.querySelector(".megamenu");
    if (mega) {
      mega.addEventListener("mouseenter", openDrop);
      mega.addEventListener("mouseleave", delayClose);
    }

    document.addEventListener("click", (e) => {
      if (!drop.contains(e.target)) closeDrop();
    });
    drop.querySelectorAll(".megamenu a").forEach((a) =>
      a.addEventListener("click", closeDrop)
    );
    drop.addEventListener("focusin", openDrop);
    drop.addEventListener("focusout", (e) => {
      if (!drop.contains(e.relatedTarget)) closeDrop();
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeDrop();
    });
  }

  // Mobile menu
  const burger = document.querySelector(".nav__burger");
  const mobileMenu = document.getElementById("mobileMenu");
  const closeBtn = mobileMenu ? mobileMenu.querySelector(".mobilemenu__close") : null;
  if (burger && mobileMenu) {
    const openMenu = () => {
      mobileMenu.classList.add("is-open");
      mobileMenu.setAttribute("aria-hidden", "false");
      burger.setAttribute("aria-expanded", "true");
      document.body.style.overflow = "hidden";
    };
    const closeMenu = () => {
      mobileMenu.classList.remove("is-open");
      mobileMenu.setAttribute("aria-hidden", "true");
      burger.setAttribute("aria-expanded", "false");
      document.body.style.overflow = "";
    };
    burger.addEventListener("click", openMenu);
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    mobileMenu.querySelectorAll("a").forEach((a) =>
      a.addEventListener("click", closeMenu)
    );
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initNav);
} else {
  initNav();
}
