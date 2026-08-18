document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".pr-qa__q").forEach((btn) => {
    btn.addEventListener("click", () => {
      const item = btn.closest(".pr-qa__item");
      if (!item) return;
      const wasOpen = item.classList.contains("is-open");
      const panel = item.querySelector(".pr-qa__a");

      document.querySelectorAll(".pr-qa__item").forEach((entry) => {
        entry.classList.remove("is-open");
        const a = entry.querySelector(".pr-qa__a");
        if (a) a.style.maxHeight = null;
        const q = entry.querySelector(".pr-qa__q");
        if (q) q.setAttribute("aria-expanded", "false");
      });

      if (!wasOpen) {
        item.classList.add("is-open");
        btn.setAttribute("aria-expanded", "true");
        if (panel) panel.style.maxHeight = `${panel.scrollHeight}px`;
      }
    });
  });
});
