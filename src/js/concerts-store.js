import { concertsList } from "../../public/concerts-list.js";

const concertById = new Map(
  concertsList.map((concert) => [concert.id, concert]),
);

export function getConcertById(id) {
  return concertById.get(id);
}

export function getFirstAvailableByDate(date) {
  return concertsList.find(
    (concert) => !concert.booked && concert.date === date,
  );
}

export function loadConcertsState() {
  const stored = localStorage.getItem("concerts");
  if (!stored) return;

  try {
    const parsed = JSON.parse(stored);
    parsed.forEach((storedConcert) => {
      const concert = getConcertById(storedConcert.id);
      if (concert) {
        concert.booked = Boolean(storedConcert.booked);
      }
    });
  } catch {
    localStorage.removeItem("concerts");
  }
}

export function saveConcertsState() {
  localStorage.setItem("concerts", JSON.stringify(concertsList));
}
