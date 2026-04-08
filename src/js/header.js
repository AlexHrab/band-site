export function initHeader() {
  const burger = document.querySelector(".burger");
  const modal = document.querySelector(".modal");
  const menu = document.querySelector(".modal-menu");
  if (!burger || !modal || !menu) return;
  if (burger.dataset.initialized === "true") return;
  burger.dataset.initialized = "true";
  const closeBtn = modal.querySelector(".modal-close");
  if (!closeBtn) return;

  const setMenuState = (isOpen) => {
    modal.classList.toggle("is-open", isOpen);
    burger.setAttribute("aria-expanded", String(isOpen));
  };

  burger.addEventListener("click", () => {
    const isOpen = !modal.classList.contains("is-open");
    setMenuState(isOpen);
  });

  modal.addEventListener("click", (e) => {
    if (!menu.contains(e.target)) {
      setMenuState(false);
    }
  });

  menu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      setMenuState(false);
    });
  });

  closeBtn.addEventListener("click", () => {
    setMenuState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("is-open")) {
      setMenuState(false);
      burger.focus();
    }
  });
}
