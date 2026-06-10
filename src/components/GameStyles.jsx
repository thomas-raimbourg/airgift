export default function GameStyles() {
  return (
    <style>{`
      @keyframes ag-fall {
        0% { transform: translateY(-5vh) rotate(0deg); opacity: 1; }
        100% { transform: translateY(110vh) rotate(720deg); opacity: .8; }
      }
      @keyframes ag-shake {
        0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)}
        40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)}
      }
      @keyframes ag-pop {
        0%{transform:scale(.6);opacity:0} 70%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1}
      }
      @keyframes ag-glow {
        0%,100%{box-shadow:0 0 24px rgba(255,46,146,.35)} 50%{box-shadow:0 0 48px rgba(255,46,146,.7)}
      }
      @media (prefers-reduced-motion: reduce){ *{animation:none!important;transition:none!important} }
      .ag-shake{animation:ag-shake .45s ease}
      .ag-pop{animation:ag-pop .6s cubic-bezier(.2,1.4,.4,1) both}
      .ag-glow{animation:ag-glow 2.4s ease-in-out infinite}
    `}</style>
  );
}
