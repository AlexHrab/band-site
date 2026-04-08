import { showToast } from "./toast.js";

export function initContactForm() {
  const form = document.querySelector(".contact form");
  if (!form) return;
  if (form.dataset.initialized === "true") return;
  form.dataset.initialized = "true";

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    try {
      const params = new URLSearchParams(new FormData(form));
      const res = await fetch(`https://httpbin.org/get?${params}`, {
        method: "GET",
      });
      if (!res.ok) throw new Error(`Request failed: ${res.status}`);

      form.reset();
      showToast("Повідомлення відправлено! ✓", "pink");
    } catch {
      showToast("Щось пішло не так. Спробуй ще раз.", "red");
    }
  });
}
