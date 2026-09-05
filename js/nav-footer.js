const navHTML = `<nav class="nav" id="nav">
  <div class="nav__inner">
    <a class="logo" href="/" aria-label="Sitesnit home">
      <img class="logo__icon" src="/images/sitesnit-horizontal-black-transparent.png" alt="Sitesnit" height="30" />
    </a>
    <div class="nav__links">
      <div class="nav__item"><a class="nav__link" href="/">Home</a></div>
      <div class="nav__item nav__item--drop" id="nav-diensten">
        <button class="nav__link" type="button" aria-expanded="false">Diensten <svg class="nav__chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg></button>
        <div class="megamenu">
          <a class="megamenu__overview" href="/diensten/"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg> Alle diensten <svg class="megamenu__overview-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>
          <div class="megamenu__cols">
            <a class="megamenu__main" href="/diensten/webdesign/"><span class="megamenu__num">01</span><span class="megamenu__title">Webdesign <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span><span class="megamenu__desc">Maatwerk websites ontworpen en gebouwd in eigen code.</span></a>
            <a class="megamenu__main" href="/diensten/webshops/"><span class="megamenu__num">02</span><span class="megamenu__title">Webshops <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span><span class="megamenu__desc">Online winkels met aantrekkelijk design en slimme functies.</span></a>
            <a class="megamenu__main" href="/diensten/tekst-seo/"><span class="megamenu__num">03</span><span class="megamenu__title">Tekst &amp; SEO <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span><span class="megamenu__desc">Heldere teksten en SEO die bezoekers en zoekmachines vinden.</span></a>
            <a class="megamenu__main" href="/diensten/branding/"><span class="megamenu__num">04</span><span class="megamenu__title">Branding <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span><span class="megamenu__desc">Logo, kleuren en uitstraling die jouw merk versterken.</span></a>
            <a class="megamenu__main" href="/diensten/slimme-functies/"><span class="megamenu__num">05</span><span class="megamenu__title">Slimme functies <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span><span class="megamenu__desc">Formulieren, calculators en aanvraagflows die tijd besparen.</span></a>
            <a class="megamenu__main" href="/diensten/onderhoud-groei/"><span class="megamenu__num">06</span><span class="megamenu__title">Onderhoud &amp; groei <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></span><span class="megamenu__desc">Updates, nieuwe pagina's en extra functies na lancering.</span></a>
          </div>
        </div>
      </div>
      <div class="nav__item"><a class="nav__link" href="/projecten/">Projecten</a></div>
      <div class="nav__item"><a class="nav__link" href="/prijzen/">Prijzen</a></div>
      <div class="nav__item"><a class="nav__link" href="/contact/">Contact</a></div>
    </div>
    <a class="nav__cta btn btn--outline" href="/contact/">Start project</a>
    <button class="nav__burger" type="button" id="burger" aria-label="Menu openen"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 6h16M4 12h16M4 18h16"/></svg> Menu</button>
  </div>
</nav>
<div class="mobilemenu" id="mobilemenu">
  <div class="mobilemenu__head">
    <a class="logo" href="/"><img class="logo__icon" src="/images/sitesnit-horizontal-black-transparent.png" alt="Sitesnit" height="30" /></a>
    <button class="mobilemenu__close" id="mm-close" aria-label="Menu sluiten"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18M6 6l12 12"/></svg></button>
  </div>
  <div class="mobilemenu__links">
    <a href="/"><span>01</span> Home</a>
    <a href="/diensten/" class="mobilemenu__parent"><span>02</span> Diensten</a>
    <div class="mobilemenu__sub">
      <a href="/diensten/webdesign/">Webdesign</a>
      <a href="/diensten/webshops/">Webshops</a>
      <a href="/diensten/tekst-seo/">Tekst &amp; SEO</a>
      <a href="/diensten/branding/">Branding</a>
      <a href="/diensten/slimme-functies/">Slimme functies</a>
      <a href="/diensten/onderhoud-groei/">Onderhoud &amp; groei</a>
    </div>
    <a href="/projecten/"><span>03</span> Projecten</a>
    <a href="/prijzen/"><span>04</span> Prijzen</a>
    <a href="/contact/"><span>05</span> Contact</a>
  </div>
  <a class="btn btn--solid mobilemenu__cta" href="/contact/">Start project</a>
  <div class="mobilemenu__soc">
    <a href="mailto:info@sitesnit.nl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="m4 4 8 8 8-8"/></svg> E-mail</a>
    <a href="tel:+31612345678"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.36 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.34 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg> Bel</a>
  </div>
</div>`;

const footerHTML = `<footer class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__brand">
      <img src="/images/sitesnit-horizontal-black-transparent.png" alt="Sitesnit" height="28" />
      <p>Webdesign bureau in Venlo. Maatwerk websites die vertrouwen wekken en aanvragen opleveren.</p>
    </div>
    <div class="site-footer__links">
      <div class="site-footer__col">
        <h4>Diensten</h4>
        <a href="/diensten/webdesign/">Webdesign</a>
        <a href="/diensten/webshops/">Webshops</a>
        <a href="/diensten/tekst-seo/">Tekst &amp; SEO</a>
        <a href="/diensten/branding/">Branding</a>
        <a href="/diensten/slimme-functies/">Slimme functies</a>
        <a href="/diensten/onderhoud-groei/">Onderhoud &amp; groei</a>
      </div>
      <div class="site-footer__col">
        <h4>Site</h4>
        <a href="/">Home</a>
        <a href="/projecten/">Projecten</a>
        <a href="/prijzen/">Prijzen</a>
        <a href="/contact/">Contact</a>
      </div>
      <div class="site-footer__col">
        <h4>Contact</h4>
        <a href="mailto:info@sitesnit.nl">info@sitesnit.nl</a>
        <a href="tel:+31612345678">+31 6 1234 5678</a>
      </div>
    </div>
  </div>
  <div class="site-footer__bottom">
    <span>&copy; ${new Date().getFullYear()} Sitesnit. Alle rechten voorbehouden.</span>
  </div>
</footer>`;

function injectNav() {
  const navSlot = document.getElementById("nav-slot");
  if (navSlot && !navSlot.querySelector(".nav")) {
    navSlot.innerHTML = navHTML;
    const nav = document.getElementById("nav");
    const burger = document.getElementById("burger");
    const mobilemenu = document.getElementById("mobilemenu");
    const mmClose = document.getElementById("mm-close");
    const dropBtn = nav?.querySelector(".nav__item--drop .nav__link");

    const onScroll = () => {
      if (window.scrollY > 20) nav?.classList.add("nav--scrolled");
      else nav?.classList.remove("nav--scrolled");
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    if (burger && mobilemenu) {
      burger.addEventListener("click", () => {
        mobilemenu.classList.add("is-open");
        document.body.classList.add("menu-open");
      });
    }
    if (mmClose) {
      mmClose.addEventListener("click", () => {
        mobilemenu.classList.remove("is-open");
        document.body.classList.remove("menu-open");
      });
    }
    if (dropBtn) {
      const dropItem = dropBtn.closest(".nav__item--drop");
      dropBtn.addEventListener("click", (e) => {
        e.preventDefault();
        const open = dropItem.classList.toggle("is-open");
        dropBtn.setAttribute("aria-expanded", open ? "true" : "false");
      });
      document.addEventListener("click", (e) => {
        if (!dropItem.contains(e.target)) {
          dropItem.classList.remove("is-open");
          dropBtn.setAttribute("aria-expanded", "false");
        }
      });
    }
  }
}

function injectFooter() {
  const footerSlot = document.getElementById("footer-slot");
  if (footerSlot && !footerSlot.querySelector(".site-footer")) {
    footerSlot.innerHTML = footerHTML;
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    injectNav();
    injectFooter();
  });
} else {
  injectNav();
  injectFooter();
}
