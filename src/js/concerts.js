import { concertsList } from "../../public/concerts-list.js";
import {
  getConcertById,
  loadConcertsState,
  saveConcertsState,
} from "./concerts-store.js";

export function notifyBookingChanged() {
  window.dispatchEvent(new CustomEvent("bookingChanged"));
}

export function initConcertsTable() {
  const tbody = document.querySelector("#concerts-body");
  const loadMoreBtn = document.getElementById("load-more");
  const tableWrapper = document.querySelector(".table-wrapper");
  if (!tbody || !loadMoreBtn || !tableWrapper) return;
  if (tbody.dataset.initialized === "true") return;
  tbody.dataset.initialized = "true";

  const ITEMS_PER_PAGE = 4;
  let currentIndex = 0;
  let isFirstLoad = true;
  let initialHeight = null;

  loadConcertsState();

  const rowMap = new Map();

  function formatDate(dateStr) {
    return dateStr.split("-").reverse().join(".");
  }

  function renderRow(concert) {
    const tr = document.createElement("tr");
    tr.dataset.id = concert.id;

    tr.innerHTML = `
      <td><span>${concert.city} — </span><span>${concert.place}</span></td>
      <td>${concert.seats || 500}</td>
      <td><time datetime="${concert.date}T${concert.time}"><span>${formatDate(concert.date)},</span> <span>${concert.time}</span></time></td>
      <td>
        <button class="btn ${concert.booked ? "btn-green" : "btn-pink"}">
          ${concert.booked ? "✓ Скасувати бронювання" : "Замовити квиток"}
        </button>
      </td>
    `;

    rowMap.set(concert.id, tr);
    return tr;
  }

  function updateRow(concert) {
    const tr = rowMap.get(concert.id);
    if (!tr) return;
    const btn = tr.querySelector("button");
    btn.className = `btn ${concert.booked ? "btn-green" : "btn-pink"}`;
    btn.textContent = concert.booked
      ? "✓ Скасувати бронювання"
      : "Замовити квиток";
  }

  function loadItems() {
    const nextItems = concertsList.slice(
      currentIndex,
      currentIndex + ITEMS_PER_PAGE,
    );
    let firstNewRow = null;

    const fragment = document.createDocumentFragment();
    nextItems.forEach((concert) => {
      const tr = renderRow(concert);
      if (!firstNewRow) firstNewRow = tr;
      fragment.appendChild(tr);
    });
    tbody.appendChild(fragment);

    currentIndex += ITEMS_PER_PAGE;

    if (isFirstLoad) {
      initialHeight = tableWrapper.offsetHeight;
      isFirstLoad = false;
    } else {
      tableWrapper.style.maxHeight = `${initialHeight}px`;
      tableWrapper.style.overflowY = "auto";
    }

    if (firstNewRow) {
      tableWrapper.scrollTo({
        top: firstNewRow.offsetTop - tbody.offsetTop,
        behavior: "smooth",
      });
    }

    loadMoreBtn.style.display =
      currentIndex >= concertsList.length ? "none" : "block";
  }

  loadMoreBtn.addEventListener("click", loadItems);

  tbody.addEventListener("click", (event) => {
    const button = event.target.closest("button");
    if (!button) return;
    const row = button.closest("tr");
    if (!row) return;

    const concertId = Number(row.dataset.id);
    const concert = getConcertById(concertId);
    if (!concert) return;

    if (concert.booked) {
      concert.booked = false;
      saveConcertsState();
      updateRow(concert);
      notifyBookingChanged();
      return;
    }

    openModalWithConcert(concert);
  });

  window.addEventListener("bookingChanged", () => {
    concertsList.forEach((concert) => updateRow(concert));
  });

  loadItems();
}

export function openModalWithConcert(concert) {
  const overlay = document.querySelector(".overlay");
  const modal = document.querySelector(".modal-window");
  const select = document.querySelector("#list");
  const dateInput = document.querySelector("#event-date");

  if (!overlay || !modal || !select || !dateInput) return;

  overlay.classList.add("is-open");

  select.innerHTML = "";
  const option = document.createElement("option");
  option.value = concert.id;
  option.textContent = `${concert.city} — ${concert.place}`;
  option.selected = true;
  select.appendChild(option);

  dateInput.value = concert.date;
}
