import { useState, useEffect, useRef } from "react";

// ---------- Utils ----------
const normalize = (s) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

// ---------- Confetti (or et glace) ----------
const COLORS = ["#F5C26B", "#FFFFFF", "#9FD8FF", "#E8B4D8", "#FFE9C2"];
function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 1.6,
    duration: 2.6 + Math.random() * 2,
    size: 6 + Math.random() * 8,
    color: COLORS[i % COLORS.length],
    rotate: Math.random() * 360,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {pieces.map((p) => (
        <div
          key={p.id}
          style={{
            position: "absolute",
            top: "-20px",
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 0.45}px`,
            backgroundColor: p.color,
            transform: `rotate(${p.rotate}deg)`,
            animation: `ag-fall ${p.duration}s linear ${p.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}

// ---------- Data : l'expérience configurée par l'offreuse ----------
const SENDER = "Léa";
const RECIPIENT = "Hermann";
const TOTAL = 5;

const STAGES = [
  {
    id: "enigme1",
    eyebrow: "Énigme 1 / 5 · L'origine",
    title: "D'où vient ton cadeau ?",
    text: "Ton cadeau est né dans une province d'Amérique du Nord où l'on parle français. On y mange de la poutine, on y dit « c'est correct », et sa plus grande ville s'appelle Montréal.",
    placeholder: "Le nom de la province…",
    answers: ["quebec", "lequebec"],
    hint: "⚜️ Sa devise : « Je me souviens ». Et il paraît que tu y vas bientôt…",
    success: "En plein ça ! Le sceau commence à se fissurer…",
  },
  {
    id: "enigme2",
    eyebrow: "Énigme 2 / 5 · La nature du cadeau",
    title: "Ça ne s'emballe pas…",
    text: "Ton cadeau ne se touche pas, ne se mange pas et ne se range pas dans un placard. Il se vit assis ou debout, il donne des frissons, des milliers de gens y pleurent en même temps… et il ne dure qu'une soirée.",
    placeholder: "C'est un…",
    answers: ["concert", "unconcert", "spectacle", "show"],
    hint: "🎤 Une scène, des projecteurs, une voix immense.",
    success: "Exact ! Tu vas voir quelqu'un sur scène…",
    surprise: {
      emoji: "🚢",
      title: "Surprise… c'est une croisière !",
      text: "Mais non Hermann, je rigole. 😏 Quoique… garde l'image du paquebot dans un coin de ta tête. Elle va resservir. Continue…",
      button: "Mystérieux… continuer",
    },
  },
  {
    id: "enigme3",
    eyebrow: "Énigme 3 / 5 · L'indice de trop",
    title: "Un film, un paquebot, un iceberg",
    text: "1997. Le film le plus vu de sa décennie. Un paquebot réputé insubmersible, un iceberg dans l'Atlantique Nord, et une chanson au générique devenue immortelle. Quel est ce film ?",
    placeholder: "Le titre du film…",
    answers: ["titanic", "letitanic"],
    hint: "🧊 Jack et Rose, une porte qui flotte, et un débat sans fin : il y avait de la place pour deux ?",
    success: "Évidemment. Et qui chantait au générique… ?",
    surprise: {
      emoji: "🎶",
      title: "Indice bonus débloqué !",
      text: "Léa a caché un indice pour toi : la voix que tu vas entendre en vrai est celle du générique de ce film. La plus grande voix du Québec. 💛",
      button: "Ça se précise… continuer",
    },
  },
  {
    id: "enigme4",
    eyebrow: "Énigme 4 / 5 · L'artiste",
    title: "Remets les lettres dans l'ordre",
    text: "Quatorzième enfant d'une famille de Charlemagne, au Québec, elle est devenue l'une des plus grandes voix de tous les temps. Son nom se cache ici :",
    scramble: "NOID ENILEC",
    placeholder: "Son nom…",
    answers: ["celinedion", "celine", "dionceline"],
    hint: "💛 Repense aux indices : Québec + Titanic + une voix immense.",
    success: "Incroyable mais vrai. Le sceau se fend en deux…",
  },
  {
    id: "enigme5",
    eyebrow: "Énigme 5 / 5 · Le code final",
    title: "Déverrouille le cadeau",
    text: "Léa a glissé un code à 3 chiffres : le nombre de lettres de ton prénom (HERMANN), le nombre d'énigmes de ce jeu, et le nombre de places qui t'attendent.",
    placeholder: "_ _ _",
    answers: ["752"],
    hint: "💡 H-E-R-M-A-N-N… ça fait combien ? Puis le nombre d'énigmes… et combien de places pour un duo ?",
    success: "Code accepté. Ouverture…",
    isCode: true,
  },
];

// ---------- Composant principal ----------
export default function AirGiftDemoCeline() {
  // step: -1 = intro, 0..4 = énigmes, 5 = reveal
  const [step, setStep] = useState(-1);
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [flash, setFlash] = useState("");
  const [surprise, setSurprise] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const inputRef = useRef(null);

  const progress = Math.max(0, Math.min(TOTAL, step)) / TOTAL;
  const stage = step >= 0 && step < TOTAL ? STAGES[step] : null;

  useEffect(() => {
    if (step === TOTAL) {
      const t = setTimeout(() => setRevealed(true), 900);
      return () => clearTimeout(t);
    }
  }, [step]);

  const goNext = () => {
    setFlash("");
    setSurprise(null);
    setInput("");
    setShowHint(false);
    setStep((s) => s + 1);
  };

  const submit = () => {
    if (!stage) return;
    const ok = stage.answers.includes(normalize(input));
    if (ok) {
      setFlash(stage.success);
      setTimeout(() => {
        if (stage.surprise) {
          setFlash("");
          setSurprise(stage.surprise);
        } else {
          goNext();
        }
      }, 1100);
    } else {
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-4 py-8"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, #11254d 0%, #081429 55%, #04080f 100%)",
        fontFamily: "Georgia, 'Times New Roman', serif",
        color: "#FBF7EF",
      }}
    >
      <style>{`
        @keyframes ag-fall {
          0% { transform: translateY(-5vh) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(720deg); opacity: 0.8; }
        }
        @keyframes ag-shake {
          0%,100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-5px); }
          80% { transform: translateX(5px); }
        }
        @keyframes ag-pop {
          0% { transform: scale(0.6); opacity: 0; }
          70% { transform: scale(1.06); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes ag-glow {
          0%,100% { box-shadow: 0 0 24px rgba(245,194,107,0.3); }
          50% { box-shadow: 0 0 48px rgba(245,194,107,0.65); }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
        .ag-shake { animation: ag-shake 0.45s ease; }
        .ag-pop { animation: ag-pop 0.6s cubic-bezier(.2,1.4,.4,1) both; }
        .ag-glow { animation: ag-glow 2.4s ease-in-out infinite; }
      `}</style>

      <div className="w-full max-w-md">
        {/* Barre de progression "déballage" */}
        <div className="mb-6">
          <div className="flex justify-between text-xs tracking-widest uppercase mb-2" style={{ color: "#9FB8DC" }}>
            <span>Air Gift · de la part de {SENDER}</span>
            <span>{Math.round(progress * 100)}% déballé</span>
          </div>
          <div className="h-2 rounded-full" style={{ background: "#1c3358" }}>
            <div
              className="h-2 rounded-full transition-all duration-700"
              style={{
                width: `${Math.max(progress * 100, 4)}%`,
                background: "linear-gradient(90deg,#F5C26B,#9FD8FF)",
              }}
            />
          </div>
        </div>

        {/* ---------- INTRO ---------- */}
        {step === -1 && (
          <div className="text-center ag-pop">
            <div
              className="mx-auto mb-6 flex items-center justify-center rounded-full ag-glow"
              style={{ width: 130, height: 130, background: "linear-gradient(135deg,#F5C26B,#1c3358)", fontSize: 56 }}
            >
              🎁
            </div>
            <p className="text-xs tracking-widest uppercase mb-2" style={{ color: "#9FB8DC" }}>
              Un cadeau scellé t'attend
            </p>
            <h1 className="text-3xl font-bold mb-3" style={{ color: "#FFFFFF" }}>
              {RECIPIENT}, {SENDER} t'a envoyé un Air Gift
            </h1>
            <p className="mb-8 leading-relaxed" style={{ color: "#C9D8EE" }}>
              « Prépare les mouchoirs. 5 énigmes te séparent d'un cadeau
              qui va te donner des frissons. 💛 »
            </p>
            <button
              onClick={() => setStep(0)}
              className="w-full py-4 rounded-2xl text-lg font-bold transition-transform active:scale-95"
              style={{ background: "linear-gradient(90deg,#F5C26B,#FFE9C2)", color: "#0b1a33" }}
            >
              Commencer le déballage
            </button>
          </div>
        )}

        {/* ---------- SURPRISE INTERSTITIELLE ---------- */}
        {surprise && (
          <div className="text-center ag-pop">
            <div
              className="rounded-3xl p-8"
              style={{ background: "rgba(159,216,255,0.08)", border: "1.5px solid #9FD8FF" }}
            >
              <div className="mb-4" style={{ fontSize: 64 }}>{surprise.emoji}</div>
              <h2 className="text-2xl font-bold mb-3" style={{ color: "#9FD8FF" }}>
                {surprise.title}
              </h2>
              <p className="leading-relaxed mb-6" style={{ color: "#C9D8EE" }}>
                {surprise.text}
              </p>
              <button
                onClick={goNext}
                className="w-full py-3 rounded-xl font-bold text-lg transition-transform active:scale-95"
                style={{ background: "linear-gradient(90deg,#F5C26B,#FFE9C2)", color: "#0b1a33" }}
              >
                {surprise.button}
              </button>
            </div>
          </div>
        )}

        {/* ---------- ÉNIGMES ---------- */}
        {stage && !surprise && (
          <div className={`ag-pop ${shake ? "ag-shake" : ""}`} key={stage.id}>
            <div
              className="rounded-3xl p-6"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(159,184,220,0.35)" }}
            >
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#F5C26B" }}>
                {stage.eyebrow}
              </p>
              <h2 className="text-2xl font-bold mb-3">{stage.title}</h2>
              <p className="leading-relaxed mb-4" style={{ color: "#C9D8EE" }}>
                {stage.text}
              </p>

              {stage.scramble && (
                <div className="flex justify-center gap-2 mb-5 flex-wrap">
                  {stage.scramble.split("").map((c, i) =>
                    c === " " ? (
                      <div key={i} className="w-3" />
                    ) : (
                      <div
                        key={i}
                        className="flex items-center justify-center rounded-lg font-bold text-lg"
                        style={{ width: 36, height: 44, background: "#1c3358", color: "#F5C26B", border: "1px solid #33548c" }}
                      >
                        {c}
                      </div>
                    )
                  )}
                </div>
              )}

              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
                placeholder={stage.placeholder}
                inputMode={stage.isCode ? "numeric" : "text"}
                className="w-full rounded-xl px-4 py-3 mb-3 text-lg outline-none"
                style={{
                  background: "#0b1a33",
                  border: "1.5px solid #33548c",
                  color: "#FFFFFF",
                  textAlign: stage.isCode ? "center" : "left",
                  letterSpacing: stage.isCode ? "0.5em" : "normal",
                }}
              />

              {flash ? (
                <p className="text-center font-semibold mb-2" style={{ color: "#9FD8FF" }}>
                  {flash}
                </p>
              ) : (
                <button
                  onClick={submit}
                  className="w-full py-3 rounded-xl font-bold text-lg transition-transform active:scale-95"
                  style={{ background: "linear-gradient(90deg,#F5C26B,#FFE9C2)", color: "#0b1a33" }}
                >
                  Valider
                </button>
              )}

              <div className="text-center mt-4">
                {showHint ? (
                  <p className="text-sm" style={{ color: "#F5C26B" }}>{stage.hint}</p>
                ) : (
                  <button
                    onClick={() => setShowHint(true)}
                    className="text-sm underline"
                    style={{ color: "#9FB8DC" }}
                  >
                    Besoin d'un indice ?
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ---------- RÉVÉLATION ---------- */}
        {step === TOTAL && (
          <div className="text-center">
            {revealed && <Confetti />}
            {!revealed ? (
              <div className="ag-pop">
                <div className="mx-auto mb-4" style={{ fontSize: 80 }}>🔓</div>
                <p className="text-xl" style={{ color: "#C9D8EE" }}>Le sceau se brise…</p>
              </div>
            ) : (
              <div className="ag-pop">
                <p className="text-xs tracking-widest uppercase mb-3" style={{ color: "#F5C26B" }}>
                  Hermann, ton cadeau est…
                </p>
                {/* Le billet */}
                <div
                  className="rounded-3xl overflow-hidden text-left ag-glow mb-5"
                  style={{ background: "linear-gradient(135deg,#F5C26B 0%,#33548c 70%,#9FD8FF 140%)" }}
                >
                  <div className="p-6 pb-4">
                    <p className="text-xs tracking-widest uppercase" style={{ color: "#FFF4DC" }}>
                      Concert · Événement complet
                    </p>
                    <h2 className="text-4xl font-extrabold leading-tight" style={{ color: "#FFFFFF" }}>
                      CÉLINE DION
                    </h2>
                    <p className="font-semibold mt-1" style={{ color: "#0b1a33" }}>
                      Tournée mondiale — Paris La Défense Arena
                    </p>
                  </div>
                  <div
                    className="flex justify-between items-center px-6 py-4"
                    style={{ background: "rgba(4,8,15,0.85)", borderTop: "2px dashed rgba(255,255,255,0.5)" }}
                  >
                    <div>
                      <p className="text-xs" style={{ color: "#9FB8DC" }}>Places</p>
                      <p className="font-bold text-lg">2 × Carré Or</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs" style={{ color: "#9FB8DC" }}>Avec</p>
                      <p className="font-bold text-lg">{SENDER} 💛</p>
                    </div>
                  </div>
                </div>
                <p className="mb-6 leading-relaxed" style={{ color: "#C9D8EE" }}>
                  « Et en plus, on s'échauffe pour le Québec en septembre. 🍁 »
                </p>
                <div className="flex gap-3">
                  <button
                    className="flex-1 py-3 rounded-xl font-bold transition-transform active:scale-95"
                    style={{ background: "linear-gradient(90deg,#F5C26B,#FFE9C2)", color: "#0b1a33" }}
                  >
                    Voir mes billets
                  </button>
                  <button
                    className="flex-1 py-3 rounded-xl font-bold transition-transform active:scale-95"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid #33548c", color: "#FFFFFF" }}
                  >
                    📹 Partager ma réaction
                  </button>
                </div>
                <button
                  onClick={() => {
                    setStep(-1);
                    setRevealed(false);
                    setInput("");
                    setShowHint(false);
                    setSurprise(null);
                  }}
                  className="mt-5 text-sm underline"
                  style={{ color: "#9FB8DC" }}
                >
                  Rejouer la démo
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
