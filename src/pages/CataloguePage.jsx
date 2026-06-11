import { useState } from "react";
import Game from "../components/Game.jsx";
import GameStyles from "../components/GameStyles.jsx";
import { CATALOG, search } from "../engine/catalog.js";

const FILTERS = [
  { k: "tous", label: "Tous" },
  { k: "concert", label: "🎤 Concerts" },
  { k: "ligue1", label: "⚽ Ligue 1" },
  { k: "festival", label: "🎪 Festivals" },
  { k: "voyage", label: "✈️ Voyages" },
  { k: "vin", label: "🍷 Vins" },
];

const RECIPIENT = "Hermann";
const SENDER = "Léa";

export default function CataloguePage() {
  const [current, setCurrent] = useState(null);
  const [filter, setFilter] = useState("tous");
  const [query, setQuery] = useState("");

  const list = search(query, filter);

  return (
    <div
      className="min-h-screen w-full px-4 py-8"
      style={{ background: "radial-gradient(120% 90% at 50% 0%, #2b0a4e 0%, #160428 55%, #0b0118 100%)", fontFamily: "'Trebuchet MS','Segoe UI',sans-serif", color: "#FDF6FF" }}
    >
      <GameStyles />

      {current ? (
        <Game item={current} recipient={RECIPIENT} sender={SENDER} onBack={() => setCurrent(null)} />
      ) : (
        <div className="w-full max-w-md mx-auto">
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#B68FE8" }}>Air Gifts · Banc de test</p>
          <h1 className="text-3xl font-bold mb-1">Catalogue des expériences</h1>
          <p className="text-sm mb-5" style={{ color: "#D9C5F2" }}>
            {CATALOG.length} événements de démo · jeux générés automatiquement · destinataire : {RECIPIENT}, de la part de {SENDER}.
          </p>

          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un artiste, un club, un festival…"
            className="w-full rounded-xl px-4 py-3 mb-3 outline-none"
            style={{ background: "#1c0533", border: "1.5px solid #5b2a96", color: "#FFF" }}
          />

          <div className="flex gap-2 mb-5 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.k}
                onClick={() => setFilter(f.k)}
                className="px-3 py-2 rounded-full text-sm font-semibold transition-transform active:scale-95"
                style={
                  filter === f.k
                    ? { background: "linear-gradient(90deg,#FF2E92,#FFB930)", color: "#1c0533" }
                    : { background: "rgba(255,255,255,0.07)", border: "1px solid #5b2a96", color: "#D9C5F2" }
                }
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-2 pb-10">
            {list.map((e) => {
              const built = e.build(RECIPIENT, SENDER);
              const interactions = built.stages.length + built.stages.filter((s) => s.surprise).length;
              return (
                <button
                  key={e.id}
                  onClick={() => setCurrent(e)}
                  className="w-full text-left rounded-2xl p-4 flex items-center gap-3 transition-transform active:scale-[0.98]"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(182,143,232,0.3)" }}
                >
                  <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 44, height: 44, fontSize: 24, background: "#3a1463" }}>
                    {e.emoji}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">{e.name}</p>
                    <p className="text-xs truncate" style={{ color: "#B68FE8" }}>{e.place}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className="text-xs px-2 py-1 rounded-full font-semibold"
                      style={
                        e.long
                          ? { background: "rgba(255,185,48,0.15)", color: "#FFB930", border: "1px solid #FFB930" }
                          : { background: "rgba(39,232,224,0.1)", color: "#27E8E0", border: "1px solid rgba(39,232,224,0.4)" }
                      }
                    >
                      {interactions} étapes{e.long ? " · long" : ""}
                    </span>
                  </div>
                </button>
              );
            })}
            {list.length === 0 && (
              <p className="text-center py-8" style={{ color: "#B68FE8" }}>
                Aucun événement ne correspond. Essaie un autre mot-clé ou un autre filtre.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
