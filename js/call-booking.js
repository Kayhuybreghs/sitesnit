import { createClient } from "@supabase/supabase-js";

/*
  Belafspraak-formulier. Slaat op in dezelfde contact_submissions tabel
  met call_date en call_time ingevuld.
*/

const SUCCESS = `
<div class="cfx__done">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
  <b>Je belafspraak is ingepland</b>
  <p>Ik bel je op de gekozen datum en tijd. Tot dan!</p>
</div>
`;

function init() {
  const form = document.getElementById("call-form");
  if (!form) return;

  const status = form.querySelector(".cfx__status");
  const submit = form.querySelector(".cfx__cta");
  const label = submit.querySelector(".cfx__cta-label");
  const dateInput = form.querySelector('input[name="call_date"]');

  // Voorkom dat men vandaag kiest; minimaal morgen
  if (dateInput) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, "0");
    const dd = String(tomorrow.getDate()).padStart(2, "0");
    dateInput.min = `${yyyy}-${mm}-${dd}`;
  }

  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const supabase = url && key ? createClient(url, key) : null;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const val = (name) => (fd.get(name) || "").toString().trim();

    const name = val("call_name");
    const phone = val("call_phone");
    const date = val("call_date");
    const time = val("call_time");

    status.classList.remove("is-err");
    if (!name || !phone || !date || !time) {
      status.classList.add("is-err");
      status.textContent = "Vul je naam, telefoonnummer, datum en tijd in.";
      return;
    }
    if (!supabase) {
      status.classList.add("is-err");
      status.textContent = "Plannen is nu niet beschikbaar. Probeer het later opnieuw.";
      return;
    }

    submit.disabled = true;
    label.textContent = "Inplannen...";
    status.textContent = "";

    const payload = {
      first_name: name,
      phone,
      email: "",
      project_type: "Belafspraak",
      approach: "",
      message: val("call_subject"),
      call_date: date,
      call_time: time,
      page: window.location.pathname || "/",
    };

    const { error } = await supabase.from("contact_submissions").insert(payload);

    if (error) {
      submit.disabled = false;
      label.textContent = "Plan mijn belafspraak";
      status.classList.add("is-err");
      status.textContent = "Er ging iets mis bij het inplannen. Probeer het opnieuw.";
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

// Bot-protected email reveal: email is split across data attributes
// and only assembled on user click. Bots scraping the HTML see nothing.
function initEmailReveal() {
  document.querySelectorAll(".cb-email").forEach((el) => {
    el.addEventListener("click", () => {
      const user = el.dataset.emailUser;
      const domain = el.dataset.emailDomain;
      if (!user || !domain) return;
      const email = `${user}@${domain}`;
      el.textContent = email;
      el.classList.add("is-revealed");

      const link = el.closest(".cb-item").querySelector(".cb-email-link");
      if (link) {
        link.href = `mailto:${email}`;
        link.textContent = "Mail";
        link.style.display = "inline-block";
      }
    });
  });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initEmailReveal);
} else {
  initEmailReveal();
}
