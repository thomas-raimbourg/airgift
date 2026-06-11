import { Link } from "react-router-dom";

const PREORDER_URL = "#preorder"; // → remplacer par lien Stripe/Gumroad réel
const CONTACT_EMAIL = "thomas@airgifts.fr";

const HOW_IT_WORKS = [
  {
    emoji: "🛍️",
    title: "Tu choisis l'expérience",
    desc: "Un concert, un match, un voyage... tu valides et on crée l'enveloppe numérique.",
  },
  {
    emoji: "🔐",
    title: "On scelle ton cadeau derrière des énigmes",
    desc: "3 à 5 indices personnalisés, calibrés sur l'identité du destinataire.",
  },
  {
    emoji: "🎉",
    title: "Ton proche reçoit le lien et déchiffre",
    desc: "Zéro installation. Une URL, un téléphone, et la magie opère.",
  },
];

const PRICING_FEATURES = [
  "1 Air Gift pour une expérience au choix",
  "Livraison manuelle sous 24h",
  "Personnalisation complète",
  "Valable pour tout événement du catalogue",
];

export default function LandingPage() {
  return (
    <div
      className="min-h-screen w-full px-4 py-8"
      style={{
        background:
          "radial-gradient(120% 90% at 50% 0%, #2b0a4e 0%, #160428 55%, #0b0118 100%)",
        fontFamily: "'Trebuchet MS','Segoe UI',sans-serif",
        color: "#FDF6FF",
      }}
    >
      <div className="w-full max-w-md mx-auto">

        {/* ── HERO ─────────────────────────────────────── */}
        <div className="text-center pt-4 pb-2">
          <div style={{ fontSize: 64 }} className="mb-4">🎁</div>

          <p
            className="text-xs tracking-widest uppercase mb-3"
            style={{ color: "#B68FE8" }}
          >
            Air Gifts · Pré-lancement
          </p>

          <h1 className="text-3xl font-bold mb-4 leading-tight">
            Le papier cadeau qui raconte une histoire.
          </h1>

          <p className="text-sm mb-8" style={{ color: "#D9C5F2", lineHeight: 1.6 }}>
            Offre un concert, un voyage, une soirée — avec des énigmes
            personnalisées que le destinataire résout pour découvrir son cadeau.
          </p>

          <div className="flex flex-col gap-3">
            <a
              href={PREORDER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full px-6 py-4 font-bold text-lg w-full active:scale-95 text-center"
              style={{
                background: "linear-gradient(90deg,#FF2E92,#FFB930)",
                color: "#1c0533",
                display: "block",
                transition: "transform 0.1s",
              }}
            >
              Réserver mon Air Gift — 3 €
            </a>

            <Link
              to="/g/demo-bad-bunny"
              className="rounded-full px-6 py-4 font-semibold text-base w-full active:scale-95 text-center"
              style={{
                background: "rgba(255,255,255,0.07)",
                border: "1px solid #5b2a96",
                color: "#D9C5F2",
                display: "block",
                transition: "transform 0.1s",
              }}
            >
              Voir la démo en direct →
            </Link>
          </div>
        </div>

        {/* ── COMMENT ÇA MARCHE ────────────────────────── */}
        <div className="mt-12">
          <p
            className="text-xs tracking-widest uppercase mb-5"
            style={{ color: "#B68FE8" }}
          >
            Comment ça marche
          </p>

          <div className="space-y-5">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.emoji} className="flex gap-4 items-start">
                <div
                  className="shrink-0 flex items-center justify-center rounded-full text-xl"
                  style={{
                    width: 44,
                    height: 44,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(182,143,232,0.3)",
                  }}
                >
                  {step.emoji}
                </div>
                <div>
                  <p className="font-semibold text-sm">{step.title}</p>
                  <p className="text-xs mt-1" style={{ color: "#D9C5F2", lineHeight: 1.5 }}>
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── DÉMO ─────────────────────────────────────── */}
        <div className="mt-12">
          <p
            className="text-xs tracking-widest uppercase mb-5"
            style={{ color: "#B68FE8" }}
          >
            La démo
          </p>

          {/* Placeholder vidéo — remplacer par <iframe src="https://www.youtube.com/embed/VIDEO_ID" ... /> quand prêt */}
          <div
            className="rounded-2xl flex flex-col items-center justify-center gap-2 mb-4"
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(182,143,232,0.3)",
              height: 200,
            }}
          >
            <div style={{ fontSize: 48 }}>▶️</div>
            <p className="font-semibold text-sm">Voir la démo en vidéo</p>
            <p className="text-xs" style={{ color: "#B68FE8" }}>
              Bientôt disponible
            </p>
          </div>

          <Link
            to="/g/demo-bad-bunny"
            className="rounded-full px-6 py-4 font-semibold text-sm w-full active:scale-95 text-center"
            style={{
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(182,143,232,0.3)",
              color: "#D9C5F2",
              display: "block",
              transition: "transform 0.1s",
            }}
          >
            🎁 Essayer l'expérience live (Bad Bunny)
          </Link>
        </div>

        {/* ── URGENCE ──────────────────────────────────── */}
        <div
          className="rounded-2xl p-4 text-center mt-10"
          style={{
            background: "rgba(255,185,48,0.08)",
            border: "1px solid rgba(255,185,48,0.3)",
          }}
        >
          <p className="font-semibold text-sm" style={{ color: "#FFB930" }}>
            ⚡ Pré-lancement · 50 places disponibles à tarif fondateur
          </p>
        </div>

        {/* ── PRICING ──────────────────────────────────── */}
        <div
          className="rounded-2xl p-6 mt-6"
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(182,143,232,0.3)",
          }}
        >
          <div className="flex items-baseline gap-2 mb-4">
            <span style={{ fontSize: 52, fontWeight: 800, lineHeight: 1 }}>3 €</span>
            <span className="text-sm" style={{ color: "#D9C5F2" }}>
              tarif fondateur
            </span>
          </div>

          <div className="space-y-2 mb-6">
            {PRICING_FEATURES.map((feat) => (
              <div key={feat} className="flex items-start gap-2 text-sm">
                <span style={{ color: "#27E8E0" }}>✓</span>
                <span style={{ color: "#D9C5F2" }}>{feat}</span>
              </div>
            ))}
          </div>

          <a
            href={PREORDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-6 py-4 font-bold text-base w-full active:scale-95 text-center"
            style={{
              background: "linear-gradient(90deg,#FF2E92,#FFB930)",
              color: "#1c0533",
              display: "block",
              transition: "transform 0.1s",
            }}
          >
            Réserver maintenant →
          </a>

          <p className="text-xs text-center mt-3" style={{ color: "#B68FE8" }}>
            Paiement sécurisé · Remboursement si non satisfait
          </p>
        </div>

        {/* ── CTA REPEAT ───────────────────────────────── */}
        <div className="mt-10 text-center">
          <p className="text-sm mb-6" style={{ color: "#D9C5F2", lineHeight: 1.6 }}>
            Tu as des questions ? On est deux fondateurs passionnés,
            on répond en moins d'une heure.
          </p>

          <a
            href={PREORDER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-6 py-4 font-bold text-lg w-full active:scale-95 text-center"
            style={{
              background: "linear-gradient(90deg,#FF2E92,#FFB930)",
              color: "#1c0533",
              display: "block",
              transition: "transform 0.1s",
            }}
          >
            Réserver mon Air Gift — 3 €
          </a>
        </div>

        {/* ── FOOTER ───────────────────────────────────── */}
        <div
          className="mt-12 pt-6 text-center text-xs space-y-2"
          style={{
            borderTop: "1px solid rgba(182,143,232,0.2)",
            color: "#B68FE8",
          }}
        >
          <p>Air Gifts · 2025</p>
          <p>
            Contact :{" "}
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline"
              style={{ color: "#9B5CFF" }}
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p>
            <Link
              to="/demo"
              className="underline"
              style={{ color: "#9B5CFF" }}
            >
              Voir le catalogue de démos
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
