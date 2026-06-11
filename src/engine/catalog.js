import { CONCERTS, FIXTURES, FESTIVALS, VOYAGES, VINS } from "./data.js";
import { VENUES, CLUBS } from "./data.js";
import { buildConcert, buildLigue1, buildFestival, buildVoyage, buildVinEscape } from "./builders.js";
import { norm } from "./utils.js";

export const CATALOG = [
  ...CONCERTS.map((c, i) => ({
    id: `c${i}`, type: "concert", name: c[0], place: VENUES[c[3]].n,
    emoji: c[4], long: !!c[5],
    build: (recipient, sender) => buildConcert(c, recipient, sender),
  })),
  ...FIXTURES.map((f, i) => ({
    id: `l${i}`, type: "ligue1",
    name: `${CLUBS[f[0]].n} – ${CLUBS[f[1]].n}`,
    place: `${CLUBS[f[0]].stade}${f[2] ? " · " + f[2] : ""}`,
    emoji: "⚽", long: !!f[3],
    build: (recipient, sender) => buildLigue1(f, recipient, sender),
  })),
  ...FESTIVALS.map((f, i) => ({
    id: `f${i}`, type: "festival", name: f[0], place: f[6],
    emoji: f[2], long: false,
    build: (recipient, sender) => buildFestival(f, recipient, sender),
  })),
  ...VOYAGES.map((v, i) => ({
    id: `v${i}`, type: "voyage", name: v[0], place: v[7],
    emoji: v[3], long: !!v[8],
    build: (recipient, sender) => buildVoyage(v, recipient, sender),
  })),
  ...VINS.flatMap((w, i) => [
    { id: `w${i}c`, type: "vin", name: `${w[0]} — ${w[1]}`, place: "Escape Game · 15 min", emoji: w[3], long: false, build: (r, s) => buildVinEscape(w, r, s, "court") },
    { id: `w${i}m`, type: "vin", name: `${w[0]} — ${w[1]}`, place: "Escape Game · 30 min", emoji: w[3], long: false, build: (r, s) => buildVinEscape(w, r, s, "moyen") },
    { id: `w${i}l`, type: "vin", name: `${w[0]} — ${w[1]}`, place: "Escape Game · 1 heure", emoji: w[3], long: true,  build: (r, s) => buildVinEscape(w, r, s, "long") },
  ]),
];

export function findById(id) {
  return CATALOG.find((e) => e.id === id) || null;
}

export function search(query, filter = "tous") {
  return CATALOG.filter(
    (e) =>
      (filter === "tous" || e.type === filter) &&
      (query === "" || norm(e.name + e.place).includes(norm(query)))
  );
}
