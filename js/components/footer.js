const FOOTER_HTML = `
<footer class="ft">
  <div class="ft__wrap">
    <div class="ft__brand">
      <a class="ft__logo" href="/" aria-label="sitesnit home">
        <img class="ft__logoimg" src="/images/sitesnit-horizontal-black-transparent.png" alt="sitesnit — scherp webdesign op maat" />
      </a>
      <div class="ft__socials">
        <a class="ft__soc" href="mailto:info@sitesnit.nl" aria-label="E-mail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg></a>
        <a class="ft__soc" href="#" aria-label="Instagram"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></svg></a>
        <a class="ft__soc" href="#" aria-label="LinkedIn"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="3" /><path d="M8 10v6M8 7v.01M12 16v-3a2 2 0 0 1 4 0v3M12 16v-6" /></svg></a>
      </div>
    </div>
    <div class="ft__col">
      <h4>Navigatie</h4>
      <a href="/">Home</a>
      <a href="/diensten/">Diensten</a>
      <a href="/projecten/">Projecten</a>
      <a href="/#aanpak">Werkwijze</a>
      <a href="/contact/">Contact</a>
    </div>
    <div class="ft__col">
      <h4>Diensten</h4>
      <a href="/diensten/#webdesign">Webdesign</a>
      <a href="/diensten/#pakketwebsites">Pakketwebsites</a>
      <a href="/diensten/#branding">Branding</a>
      <a href="/prijzen/">Prijzen</a>
      <a href="/#faq">Veelgestelde vragen</a>
    </div>
    <div class="ft__col ft__contact">
      <h4>Contact</h4>
      <a href="mailto:info@sitesnit.nl"><span class="ft__cico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="14" rx="2" /><path d="m3 7 9 6 9-6" /></svg></span>info@sitesnit.nl</a>
      <span><span class="ft__cico"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-5.9-7-11a7 7 0 0 1 14 0c0 5.1-7 11-7 11Z" /><circle cx="12" cy="10" r="2.5" /></svg></span>Venlo, Nederland</span>
    </div>
  </div>
  <div class="ft__bar">
    <span>&copy; 2026 Sitesnit. Alle rechten voorbehouden.</span>
    <span class="ft__legal">
      <a href="#">Privacyverklaring</a>
      <a href="#">Algemene voorwaarden</a>
      <a href="#">Cookies</a>
    </span>
  </div>
</footer>
`;

function injectFooter() {
  const slot = document.getElementById("footer-slot");
  if (slot) {
    slot.innerHTML = FOOTER_HTML;
  } else {
    document.body.insertAdjacentHTML("beforeend", FOOTER_HTML);
  }

  // Lazy load contact section photo if present
  const photo = document.querySelector(".contact-photo[data-defer]");
  if (photo) {
    const sources = photo.querySelectorAll("source[data-srcset]");
    sources.forEach((s) => {
      s.srcset = s.dataset.srcset;
      s.removeAttribute("data-srcset");
    });
    const img = photo.querySelector("img[data-src]");
    if (img) {
      img.onload = () => photo.classList.add("is-loaded");
      img.src = img.dataset.src;
      img.removeAttribute("data-src");
    }
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", injectFooter);
} else {
  injectFooter();
}
