window.addEventListener("DOMContentLoaded", () => {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---- Preview card switching on hover ---- */
  const rows = document.querySelectorAll(".drow[data-idx]");
  const prevs = document.querySelectorAll(".dprev[data-prev]");

  if (rows.length && prevs.length) {
    rows.forEach((row) => {
      row.addEventListener("mouseenter", () => {
        const idx = row.dataset.idx;
        prevs.forEach((p) => {
          p.classList.toggle("dprev--active", p.dataset.prev === idx);
        });
      });
    });
  }

  /* ---- Reveal elements on scroll ---- */
  if (!reduceMotion && "IntersectionObserver" in window) {
    const els = document.querySelectorAll(".drow, .dwork__featured, .dwork__card, .dquiz__box");
    els.forEach((el, i) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(18px)";
      el.style.transition = `opacity 0.5s ease ${(i % 4) * 0.06}s, transform 0.5s cubic-bezier(0.22,1,0.36,1) ${(i % 4) * 0.06}s`;
    });
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = "1";
            entry.target.style.transform = "translateY(0)";
            obs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08 }
    );
    els.forEach((el) => obs.observe(el));
  }

  /* ---- Trigger hero animations (reuse homepage .is-ready) ---- */
  const hero = document.querySelector(".hero--diensten");
  if (hero) {
    requestAnimationFrame(() => hero.classList.add("is-ready"));
  }
});
