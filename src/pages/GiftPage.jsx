import { useParams } from "react-router-dom";
import Game from "../components/Game.jsx";
import GameStyles from "../components/GameStyles.jsx";
import { findById } from "../engine/catalog.js";

/**
 * Static demo fixtures: token → { catalogId, recipient, sender }
 * In production, tokens resolve to server-side sealed gifts.
 */
const DEMO_FIXTURES = {
  "demo-bad-bunny": { catalogId: "c0", recipient: "Hermann", sender: "Léa" },
  "demo-celine": { catalogId: "c1", recipient: "Marie", sender: "Thomas" },
  "demo-psg-om": { catalogId: "l0", recipient: "Alexandre", sender: "Sophie" },
  "demo-hellfest": { catalogId: "f0", recipient: "Hugo", sender: "Emma" },
  "demo-rome": { catalogId: "v0", recipient: "Chloé", sender: "Pierre" },
};

export default function GiftPage() {
  const { token } = useParams();
  const fixture = DEMO_FIXTURES[token];

  if (!fixture) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
        style={{ background: "radial-gradient(120% 90% at 50% 0%, #2b0a4e 0%, #160428 55%, #0b0118 100%)", fontFamily: "'Trebuchet MS','Segoe UI',sans-serif", color: "#FDF6FF" }}
      >
        <div style={{ fontSize: 72 }}>🎁</div>
        <h1 className="text-2xl font-bold mt-4 mb-2">Ce cadeau est introuvable</h1>
        <p style={{ color: "#D9C5F2" }}>
          Le lien est peut-être expiré ou invalide. Demande à ton offreur de te renvoyer le lien.
        </p>
      </div>
    );
  }

  const item = findById(fixture.catalogId);

  if (!item) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#0b0118", color: "#FDF6FF", fontFamily: "'Trebuchet MS',sans-serif" }}
      >
        <p>Expérience non trouvée.</p>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen w-full px-4 py-8"
      style={{ background: "radial-gradient(120% 90% at 50% 0%, #2b0a4e 0%, #160428 55%, #0b0118 100%)", fontFamily: "'Trebuchet MS','Segoe UI',sans-serif", color: "#FDF6FF" }}
    >
      <GameStyles />
      <Game item={item} recipient={fixture.recipient} sender={fixture.sender} />
    </div>
  );
}
