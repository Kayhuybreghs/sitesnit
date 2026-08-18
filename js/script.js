window.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---- Case switcher ---- */
  const caseSwitch = document.querySelector(".case__switch");
  if (caseSwitch) {
    caseSwitch.addEventListener("click", (e) => {
      const btn = e.target.closest("button[data-target]");
      if (!btn) return;
      const target = btn.dataset.target;
      caseSwitch
        .querySelectorAll("button")
        .forEach((b) => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      document.querySelectorAll(".case__panel").forEach((p) => {
        p.classList.toggle("is-active", p.dataset.case === target);
      });
    });
  }

  /* ---- Case cover: bekijk case follows mouse ---- */
  const caseCover = document.querySelector(".case__cover");
  if (caseCover && !matchMedia("(pointer: coarse)").matches) {
    caseCover.addEventListener("mousemove", (e) => {
      const rect = caseCover.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      caseCover.style.setProperty("--mx", `${x}px`);
      caseCover.style.setProperty("--my", `${y}px`);
    }, { passive: true });
  }
  const mock2 = document.querySelector(".mock2");
  const aanpakSection = document.querySelector(".aanpak");
  if (mock2) {
    const tabs = mock2.querySelectorAll(".mtab");
    const screens = mock2.querySelectorAll(".scr");
    let currentTab = -1;

    const showTab = (idx) => {
      if (idx === currentTab) return;
      currentTab = idx;
      tabs.forEach((t) =>
        t.classList.toggle("is-active", t.dataset.tab === String(idx))
      );
      screens.forEach((s) =>
        s.classList.toggle("is-active", s.dataset.scr === String(idx))
      );
      if (idx === 3) mock2.classList.add("is-live");
      else mock2.classList.remove("is-live");
    };

    if (tabs.length && screens.length) showTab(0);

    tabs.forEach((tab) => {
      tab.addEventListener("click", () => showTab(Number(tab.dataset.tab)));
    });

    if (aanpakSection && !reduceMotion) {
      const steps = aanpakSection.querySelectorAll(".ap__step");
      const lineFill = aanpakSection.querySelector(".ap__line-fill");
      const onAanpakScroll = () => {
        const rect = aanpakSection.getBoundingClientRect();
        const vh = window.innerHeight;
        const total = aanpakSection.offsetHeight - vh;
        if (total <= 0) return;
        const progress = Math.max(0, Math.min(1, -rect.top / total));
        const idx = Math.min(tabs.length - 1, Math.floor(progress * tabs.length));
        showTab(idx);
        steps.forEach((s, i) =>
          s.classList.toggle("is-active", i === idx)
        );
        if (lineFill)
          lineFill.style.height = `${(idx / (steps.length - 1)) * 100}%`;
      };
      window.addEventListener("scroll", onAanpakScroll, { passive: true });
      onAanpakScroll();
    }
  }

  /* ---- Hero entrance ---- */
  const hero = document.querySelector(".hero, .proj-hero, .hero--diensten, .hero--dienst, .hero--contact");
  if (hero) {
    requestAnimationFrame(() => hero.classList.add("is-ready"));
  }
  // Fallback: ensure body gets is-ready even if inline script is missing
  if (!document.body.classList.contains("is-ready")) {
    requestAnimationFrame(() => document.body.classList.add("is-ready"));
  }

  /* ---- Contact hero images: mark loaded, settle after entrance ---- */
  const heroImgs = document.querySelectorAll(".contact-hero-art img");
  heroImgs.forEach((img) => {
    const mark = () => img.classList.add("is-loaded");
    if (img.complete && img.naturalWidth > 0) {
      requestAnimationFrame(mark);
    } else {
      img.addEventListener("load", mark, { once: true });
      img.addEventListener("error", mark, { once: true });
    }
  });
  // Enable hover only after the entire entrance sequence finishes
  // (last delay 0.78s + duration 0.7s + buffer)
  setTimeout(() => {
    heroImgs.forEach((img) => img.classList.add("is-settled"));
  }, 1700);

  /* ---- FAQ accordion (homepage faq__list) ---- */
  const faq = document.querySelector(".faq__list");
  if (faq) {
    faq.addEventListener("click", (e) => {
      const btn = e.target.closest(".faq__q");
      if (!btn) return;
      const item = btn.closest(".faq__item");
      const isOpen = item.classList.contains("is-open");
      faq.querySelectorAll(".faq__item").forEach((it) => {
        it.classList.remove("is-open");
        const q = it.querySelector(".faq__q");
        if (q) q.setAttribute("aria-expanded", "false");
      });
      if (!isOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
      }
    });
  }

  /* ---- Scroll reveal (subpages) ---- */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    // On dienst detail pages, delay the first reveal section until the H1 entrance finishes
    const dienstHero = document.querySelector(".hero--dienst");
    if (dienstHero && revealEls[0] && !reduceMotion) {
      revealEls[0].style.setProperty("--rd", "0.9s");
    }
    if (reduceMotion) {
      revealEls.forEach((el) => el.classList.add("in"));
    } else {
      const io = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              obs.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.12, rootMargin: "0px 0px -7% 0px" }
      );
      revealEls.forEach((el) => io.observe(el));
    }
  }

  /* ---- QA accordion (subpages) ---- */
  document.querySelectorAll(".qa").forEach((qa) => {
    qa.addEventListener("click", (e) => {
      const btn = e.target.closest(".qa__q");
      if (!btn) return;
      const item = btn.closest(".qa__item");
      const panel = item.querySelector(".qa__a");
      const open = item.classList.contains("is-open");
      qa.querySelectorAll(".qa__item").forEach((it) => {
        it.classList.remove("is-open");
        const a = it.querySelector(".qa__a");
        if (a) a.style.maxHeight = null;
        const q = it.querySelector(".qa__q");
        if (q) q.setAttribute("aria-expanded", "false");
      });
      if (!open) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        if (panel) panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });

  /* ---- Float parallax ---- */
  const floats = document.querySelectorAll(".float");
  if (!reduceMotion && floats.length) {
  let cx = window.innerWidth / 2;
  let cy = window.innerHeight / 2;
  let mx = cx;
  let my = cy;

  const fit = () => {
    cx = window.innerWidth / 2;
    cy = window.innerHeight / 2;
  };
  fit();

  const onScroll = () => {
    const sy = window.scrollY;
    floats.forEach((f) => {
      const d = parseFloat(f.dataset.depth) || 5;
      const yOff = -(sy / d) * 0.3;
      f.style.setProperty("--sy", `${yOff}px`);
    });
  };

  const loop = () => {
    floats.forEach((f) => {
      const d = parseFloat(f.dataset.depth) || 5;
      const xOff = (mx - cx) / (d * 8);
      const yOff = (my - cy) / (d * 8);
      const sy = parseFloat(f.style.getPropertyValue("--sy")) || 0;
      f.style.setProperty("--px", `${xOff}px`);
      f.style.setProperty("--py", `${yOff + sy}px`);
    });
    requestAnimationFrame(loop);
  };

  window.addEventListener(
    "mousemove",
    (e) => {
      mx = e.clientX;
      my = e.clientY;
    },
    { passive: true }
  );

  if (!reduceMotion) requestAnimationFrame(loop);
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener(
    "resize",
    () => {
      fit();
      onScroll();
    },
    { passive: true }
  );
  window.addEventListener("load", fit);
  } /* end floats */

  /* ---- Van sterk ontwerp: stacked sticky cards ---- */
  const prows = document.querySelectorAll(".prow");
  if (prows.length && !reduceMotion) {
    const onPossScroll = () => {
      const vh = window.innerHeight;
      prows.forEach((prow, i) => {
        const rect = prow.getBoundingClientRect();
        const article = prow.querySelector("article");
        if (!article) return;
        if (i < prows.length - 1) {
          const next = prows[i + 1];
          const nextRect = next.getBoundingClientRect();
          const overlap = nextRect.top - rect.top;
          if (overlap <= 0) {
            const progress = Math.min(1, -overlap / (rect.height * 0.55));
            article.style.transform = `scale(${1 - progress * 0.04})`;
            article.style.opacity = `${1 - progress * 0.5}`;
          } else {
            article.style.transform = "scale(1)";
            article.style.opacity = "1";
          }
        }
      });
    };
    window.addEventListener("scroll", onPossScroll, { passive: true });
    onPossScroll();
  }

  /* ---- Contact photo: defer load until after page is ready ---- */
  const deferPhoto = document.querySelector("[data-defer]");
  if (deferPhoto) {
    const loadPhoto = () => {
      const img = deferPhoto.querySelector("img[data-src]");
      const source = deferPhoto.querySelector("source[data-srcset]");
      if (source) source.srcset = source.dataset.srcset;
      if (img) img.src = img.dataset.src;
      requestAnimationFrame(() => deferPhoto.classList.add("is-loaded"));
    };
    if (document.readyState === "complete") loadPhoto();
    else window.addEventListener("load", loadPhoto);
  }

  /* ---- Contact process: stacked sticky cards (zelfde als homepage) ---- */
  const cprows = document.querySelectorAll(".cprow");
  if (cprows.length && !reduceMotion) {
    const onCpScroll = () => {
      cprows.forEach((cprow, i) => {
        const rect = cprow.getBoundingClientRect();
        const article = cprow.querySelector("article");
        if (!article) return;
        if (i < cprows.length - 1) {
          const next = cprows[i + 1];
          const nextRect = next.getBoundingClientRect();
          const overlap = nextRect.top - rect.top;
          if (overlap <= 0) {
            const progress = Math.min(1, -overlap / (rect.height * 0.55));
            article.style.transform = `scale(${1 - progress * 0.04})`;
            article.style.opacity = `${1 - progress * 0.5}`;
          } else {
            article.style.transform = "scale(1)";
            article.style.opacity = "1";
          }
        }
      });
    };
    window.addEventListener("scroll", onCpScroll, { passive: true });
    onCpScroll();
  }

  /* ---- Fotogalerij: scroll + pijltjes + dots ---- */
  const galleryViewport = document.getElementById("galleryViewport");
  if (galleryViewport) {
    const track = galleryViewport.querySelector(".gallery__track");
    const items = galleryViewport.querySelectorAll(".gallery__item");
    const prevBtn = document.getElementById("galleryPrev");
    const nextBtn = document.getElementById("galleryNext");
    const dotsWrap = document.getElementById("galleryDots");

    const step = () => items[0].getBoundingClientRect().width + 18;

    let currentIdx = 0;

    const updateDots = () => {
      dotsWrap.querySelectorAll(".gallery__dot").forEach((d, i) => {
        d.classList.toggle("is-active", i === currentIdx);
      });
    };

    const updateButtons = () => {
      const maxScroll = track.scrollWidth - galleryViewport.clientWidth;
      prevBtn.disabled = galleryViewport.scrollLeft <= 2;
      nextBtn.disabled = galleryViewport.scrollLeft >= maxScroll - 2;
    };

    const scrollToIdx = (idx) => {
      const max = items.length - 1;
      currentIdx = Math.max(0, Math.min(max, idx));
      galleryViewport.scrollTo({ left: currentIdx * step(), behavior: "smooth" });
    };

    items.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.className = "gallery__dot";
      dot.type = "button";
      dot.setAttribute("aria-label", `Foto ${i + 1}`);
      dot.addEventListener("click", () => scrollToIdx(i));
      dotsWrap.appendChild(dot);
    });

    prevBtn.addEventListener("click", () => scrollToIdx(currentIdx - 1));
    nextBtn.addEventListener("click", () => scrollToIdx(currentIdx + 1));

    galleryViewport.addEventListener("scroll", () => {
      currentIdx = Math.round(galleryViewport.scrollLeft / step());
      updateDots();
      updateButtons();
    }, { passive: true });

    window.addEventListener("resize", updateButtons, { passive: true });
    updateDots();
    updateButtons();
  }
});
