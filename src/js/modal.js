import { concertsList } from "../assets/concerts-list.js";
import { notifyBookingChanged, openModalWithConcert } from "./concerts.js";
import {
  getConcertById,
  getFirstAvailableByDate,
  loadConcertsState,
  saveConcertsState,
} from "./concerts-store.js";
import { showToast } from "./toast.js";

export function initModal() {
  const button = document.querySelector(".concert-btn");
  const overlay = document.querySelector(".overlay");
  const modal = document.querySelector(".modal-window");
  const select = document.querySelector("#list");
  const dateInput = document.querySelector("#event-date");
  const form = modal?.querySelector("form");

  if (!button || !overlay || !modal || !select || !dateInput || !form) return;
  if (overlay.dataset.initialized === "true") return;
  overlay.dataset.initialized = "true";
  const closeBtn = modal.querySelector(".modal-close");
  if (!closeBtn) return;
  let lastFocusedElement = null;

  function getFocusableElements() {
    return modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
  }

  const setModalState = (isOpen) => {
    overlay.classList.toggle("is-open", isOpen);
    if (isOpen) {
      lastFocusedElement = document.activeElement;
      const firstFocusable = getFocusableElements()[0];
      if (firstFocusable) firstFocusable.focus();
      return;
    }

    if (lastFocusedElement instanceof HTMLElement) {
      lastFocusedElement.focus();
    }
  };

  loadConcertsState();

  function renderConcerts() {
    select.innerHTML = `<option disabled selected>Оберіть концерт</option>`;
    const selectedDate = dateInput.value;
    let hasAvailable = false;
    concertsList.forEach((concert) => {
      if (concert.booked) return;
      if (selectedDate && concert.date !== selectedDate) return;
      const option = document.createElement("option");
      option.value = concert.id;
      option.textContent = `${concert.city} — ${concert.place}`;
      select.appendChild(option);
      hasAvailable = true;
    });
    if (!hasAvailable) {
      const option = document.createElement("option");
      option.disabled = true;
      option.textContent = "Немає доступних концертів";
      select.appendChild(option);
    }
  }

  button.addEventListener("click", () => {
    setModalState(true);
    renderConcerts();
  });

  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) setModalState(false);
  });

  dateInput.addEventListener("change", () => {
    renderConcerts();
    const matching = concertsList.filter(
      (concert) => !concert.booked && concert.date === dateInput.value,
    );
    if (!matching.length)
      showToast("На цю дату немає доступних концертів!", "pink");
  });

  select.addEventListener("change", () => {
    const selectedId = Number(select.value);
    const selected = getConcertById(selectedId);
    if (!selected) return;
    dateInput.value = selected.date;
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    let selectedId = Number(select.value);
    let selected = getConcertById(selectedId);

    if (!selected && dateInput.value) {
      const available = getFirstAvailableByDate(dateInput.value);
      if (available) {
        selected = available;
        selectedId = available.id;
        select.value = selectedId;
      }
    }

    if (!selected) {
      showToast("Будь ласка, оберіть концерт!", "pink");
      return;
    }

    const formData = {
      name: form.name.value,
      email: form.email.value,
      concert: {
        city: selected.city,
        place: selected.place,
        date: selected.date,
        time: selected.time,
      },
    };

    try {
      const resp = await fetch("https://httpbin.org/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!resp.ok) throw new Error("Не вдалося забронювати концерт");

      selected.booked = true;
      saveConcertsState();
      notifyBookingChanged();

      setModalState(false);
      form.reset();
      dateInput.value = "";
      renderConcerts();
      showToast(`Концерт у ${selected.city} заброньовано! ✓`, "pink");
    } catch {
      showToast("Сталася помилка. Спробуй ще раз.", "pink");
    }
  });

  closeBtn.addEventListener("click", () => {
    setModalState(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && overlay.classList.contains("is-open")) {
      setModalState(false);
      button.focus();
    }

    if (event.key !== "Tab" || !overlay.classList.contains("is-open")) return;
    const focusable = getFocusableElements();
    if (!focusable.length) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const active = document.activeElement;

    if (event.shiftKey && active === first) {
      event.preventDefault();
      last.focus();
      return;
    }

    if (!event.shiftKey && active === last) {
      event.preventDefault();
      first.focus();
    }
  });
}
