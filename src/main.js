import { initHeader } from "./js/header.js";
import { initContactForm } from "./js/contact.js";
import { initModal } from "./js/modal.js";
import { initConcertsTable } from "./js/concerts.js";

document.addEventListener("DOMContentLoaded", async () => {
  const loads = document.querySelectorAll("load");
  const htmlCache = new Map();

  await Promise.all(
    [...loads].map(async (el) => {
      const src = el.getAttribute("src");
      if (!src) return;
      try {
        if (!htmlCache.has(src)) {
          htmlCache.set(
            src,
            fetch(src).then((resp) => {
              if (!resp.ok) throw new Error(`Cannot load ${src}: ${resp.status}`);
              return resp.text();
            }),
          );
        }

        const html = await htmlCache.get(src);
        el.insertAdjacentHTML("afterend", html);
        el.remove();
      } catch {}
    }),
  );

  initHeader();
  initContactForm();
  initModal();
  initConcertsTable();
});
