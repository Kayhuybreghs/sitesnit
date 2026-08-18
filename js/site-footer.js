import { createClient } from "@supabase/supabase-js";

/*
  Contactformulier-logica. De opmaak staat in index.html + css/contact-footer.css.
*/

const SUCCESS = `
<div class="cfx__done">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
  <b>Bedankt, je aanvraag is verzonden</b>
  <p>Je hoort snel persoonlijk van ons. We nemen contact op via het e-mailadres dat je hebt opgegeven.</p>
</div>
`;

function init() {
  const form = document.getElementById("cf-form");
  if (!form) return;

  const status = form.querySelector(".cfx__status");
  const submit = form.querySelector(".cfx__cta");
  const label = submit.querySelector(".cfx__cta-label");
  const pkg = form.querySelector(".cfx__pkg");

  form.querySelectorAll(".opt").forEach((optLabel) => {
    const input = optLabel.querySelector("input");
    optLabel.addEventListener("mousedown", () => {
      input.dataset.pre = input.checked ? "1" : "0";
    });
    optLabel.addEventListener("click", (e) => {
      if (input.dataset.pre === "1") {
        input.checked = false;
        input.dataset.pre = "0";
        e.preventDefault();
        input.dispatchEvent(new Event("change", { bubbles: true }));
      }
    });
  });

  form.querySelectorAll('input[name="approach"]').forEach((r) => {
    r.addEventListener("change", () => {
      const checked = form.querySelector('input[name="approach"]:checked');
      const isPkg = checked && checked.value === "Pakketwebsite";
      pkg.classList.toggle("is-open", !!isPkg);
      if (!isPkg) {
        form.querySelectorAll('input[name="package_choice"]').forEach((p) => (p.checked = false));
      }
    });
  });

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = url && key ? createClient(url, key) : null;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const val = (name) => (fd.get(name) || "").toString().trim();

    const payload = {
      first_name: val("first_name"),
      company: val("company"),
      email: val("email"),
      project_type: val("project_type"),
      approach: val("approach"),
      package_choice: val("package_choice"),
      message: val("message"),
      page: window.location.pathname || "/",
    };

    status.classList.remove("is-err");
    if (!payload.first_name || !payload.email) {
      status.classList.add("is-err");
      status.textContent = "Vul minimaal je naam en e-mailadres in.";
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      status.classList.add("is-err");
      status.textContent = "Vul een geldig e-mailadres in.";
      return;
    }
    if (!supabase) {
      status.classList.add("is-err");
      status.textContent = "Verzenden is nu niet beschikbaar. Probeer het later opnieuw.";
      return;
    }

    submit.disabled = true;
    label.textContent = "Versturen...";
    status.textContent = "";

    const { error } = await supabase.from("contact_submissions").insert(payload);

    if (error) {
      submit.disabled = false;
      label.textContent = "Bespreek mijn website";
      status.classList.add("is-err");
      status.textContent = "Er ging iets mis bij het verzenden. Probeer het opnieuw.";
      return;
    }

    form.innerHTML = SUCCESS;
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
