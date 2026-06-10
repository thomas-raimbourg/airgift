import { useState, useEffect } from "react";
import Confetti from "./Confetti.jsx";
import { norm } from "../engine/utils.js";

const ACCENTS = {
  concert: { a: "#FF2E92", b: "#FFB930" },
  ligue1: { a: "#3DDC6A", b: "#27E8E0" },
  festival: { a: "#FFB930", b: "#FF2E92" },
  voyage: { a: "#27E8E0", b: "#9B5CFF" },
};

export default function Game({ item, recipient = "Hermann", sender = "Léa", onBack }) {
  const [game] = useState(() => item.build(recipient, sender));
  const stages = game.stages;
  const TOTAL = stages.length;
  const [step, setStep] = useState(-1);
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [flash, setFlash] = useState("");
  const [surprise, setSurprise] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const acc = ACCENTS[item.type] || ACCENTS.concert;

  const progress = Math.max(0, Math.min(TOTAL, step)) / TOTAL;
  const stage = step >= 0 && step < TOTAL ? stages[step] : null;

  useEffect(() => {
    if (step === TOTAL) {
      const t = setTimeout(() => setRevealed(true), 900);
      return () => clearTimeout(t);
    }
  }, [step, TOTAL]);

  const goNext = () => {
    setFlash("");
    setSurprise(null);
    setInput("");
    setHintIdx(0);
    setStep((s) => s + 1);
  };

  const submit = () => {
    if (!stage) return;
    if (stage.a.includes(norm(input))) {
      setFlash("✅ Exact ! Le sceau se fissure…");
      setTimeout(() => {
        if (stage.surprise) { setFlash(""); setSurprise(stage.surprise); }
        else goNext();
      }, 1000);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  const grad = `linear-gradient(90deg,${acc.a},${acc.b})`;

  return (
    <div className="w-full max-w-md mx-auto">
      {onBack && (
        <button onClick={onBack} className="mb-4 text-sm underline" style={{ color: "#B68FE8" }}>
          ← Retour au catalogue
        </button>
      )}

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-xs tracking-widest uppercase mb-2" style={{ color: "#B68FE8" }}>
          <span>Air Gift · de la part de {sender}</span>
          <span>{Math.round(progress * 100)}% déballé</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: "#3a1463" }}>
          <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${Math.max(progress * 100, 4)}%`, background: grad }} />
        </div>
      </div>

      {/* Intro screen */}
      {step === -1 && (
        <div className="text-center ag-pop">
          <div className="mx-auto mb-6 flex items-center justify-center rounded-full ag-glow" style={{ width: 120, height: 120, background: `linear-gradient(135deg,${acc.a},#9B5CFF)`, fontSize: 52 }}>🎁</div>
          <h1 className="text-2xl font-bold mb-3">{recipient}, {sender} t'a envoyé un Air Gift</h1>
          <p className="mb-8 leading-relaxed" style={{ color: "#D9C5F2" }}>« Tu ne devineras jamais ce que c'est. {TOTAL} énigmes te séparent de ton cadeau. 😏 »</p>
          <button onClick={() => setStep(0)} className="w-full py-4 rounded-2xl text-lg font-bold transition-transform active:scale-95" style={{ background: grad, color: "#1c0533" }}>
            Commencer le déballage
          </button>
        </div>
      )}

      {/* Surprise interstitial */}
      {surprise && (
        <div className="text-center ag-pop">
          <div className="rounded-3xl p-8" style={{ background: "rgba(255,185,48,0.1)", border: "1.5px solid #FFB930" }}>
            <div className="mb-4" style={{ fontSize: 60 }}>{surprise.emoji}</div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: "#FFB930" }}>{surprise.title}</h2>
            <p className="leading-relaxed mb-6" style={{ color: "#D9C5F2" }}>{surprise.text}</p>
            <button onClick={goNext} className="w-full py-3 rounded-xl font-bold text-lg active:scale-95 transition-transform" style={{ background: grad, color: "#1c0533" }}>
              {surprise.button}
            </button>
          </div>
        </div>
      )}

      {/* Stage card */}
      {stage && !surprise && (
        <div className={`ag-pop ${shake ? "ag-shake" : ""}`} key={step}>
          <div className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(182,143,232,0.35)" }}>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: acc.b }}>Énigme {step + 1} / {TOTAL}</p>
            <h2 className="text-2xl font-bold mb-3">{stage.title}</h2>
            <p className="leading-relaxed mb-4" style={{ color: "#D9C5F2" }}>{stage.text}</p>

            {stage.scramble && (
              <div className="flex justify-center gap-1 mb-5 flex-wrap">
                {stage.scramble.split("").map((c, i) =>
                  c === " " ? (
                    <div key={i} className="w-3" />
                  ) : (
                    <div key={i} className="flex items-center justify-center rounded-lg font-bold" style={{ width: 30, height: 38, background: "#3a1463", color: "#27E8E0", border: "1px solid #5b2a96" }}>
                      {c}
                    </div>
                  )
                )}
              </div>
            )}

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder={stage.ph}
              inputMode={stage.isCode ? "numeric" : "text"}
              className="w-full rounded-xl px-4 py-3 mb-3 text-lg outline-none"
              style={{ background: "#1c0533", border: "1.5px solid #5b2a96", color: "#FFF", textAlign: stage.isCode ? "center" : "left", letterSpacing: stage.isCode ? "0.5em" : "normal" }}
            />

            {flash ? (
              <p className="text-center font-semibold mb-2" style={{ color: "#27E8E0" }}>{flash}</p>
            ) : (
              <button onClick={submit} className="w-full py-3 rounded-xl font-bold text-lg active:scale-95 transition-transform" style={{ background: grad, color: "#1c0533" }}>
                Valider
              </button>
            )}

            <div className="text-center mt-4 space-y-2">
              {stage.hs.slice(0, hintIdx).map((h, i) => (
                <p key={i} className="text-sm" style={{ color: "#FFB930" }}>{h}</p>
              ))}
              {hintIdx < stage.hs.length && (
                <button onClick={() => setHintIdx(hintIdx + 1)} className="text-sm underline" style={{ color: "#B68FE8" }}>
                  {hintIdx === 0 ? `Besoin d'un indice ? (${stage.hs.length} dispo)` : `Encore un indice (${hintIdx + 1}/${stage.hs.length})`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Final reveal */}
      {step === TOTAL && (
        <div className="text-center">
          {revealed && <Confetti />}
          {!revealed ? (
            <div className="ag-pop">
              <div className="mx-auto mb-4" style={{ fontSize: 76 }}>🔓</div>
              <p className="text-xl" style={{ color: "#D9C5F2" }}>Le sceau se brise…</p>
            </div>
          ) : (
            <div className="ag-pop">
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: acc.b }}>{recipient}, ton cadeau est…</p>
              <div className="rounded-3xl overflow-hidden text-left ag-glow mb-5" style={{ background: `linear-gradient(135deg,${acc.a} 0%,#9B5CFF 60%,${acc.b} 140%)` }}>
                <div className="p-6 pb-4">
                  <p className="text-xs tracking-widest uppercase" style={{ color: "#FFE3F2" }}>{game.ticket.sur}</p>
                  <h2 className="text-3xl font-extrabold leading-tight" style={{ color: "#FFF" }}>{game.ticket.emoji} {game.ticket.big}</h2>
                  <p className="font-semibold mt-1" style={{ color: "#1c0533" }}>{game.ticket.sub}</p>
                </div>
                <div className="flex justify-between items-center px-6 py-4" style={{ background: "rgba(12,1,24,0.85)", borderTop: "2px dashed rgba(255,255,255,0.5)" }}>
                  <div>
                    <p className="text-xs" style={{ color: "#B68FE8" }}>Places</p>
                    <p className="font-bold text-lg">2 × Carré Or</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs" style={{ color: "#B68FE8" }}>Avec</p>
                    <p className="font-bold text-lg">{sender} ❤️</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-3 rounded-xl font-bold active:scale-95 transition-transform" style={{ background: grad, color: "#1c0533" }}>
                  Voir mes billets
                </button>
                <button className="flex-1 py-3 rounded-xl font-bold active:scale-95 transition-transform" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid #5b2a96", color: "#FFF" }}>
                  📹 Partager
                </button>
              </div>
              {onBack && (
                <button onClick={onBack} className="mt-5 text-sm underline" style={{ color: "#B68FE8" }}>
                  ← Tester un autre événement
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
