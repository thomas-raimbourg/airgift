export const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]/g, "");

function shuffleWord(w, seed) {
  const a = w.split("");
  let s = seed;
  for (let i = a.length - 1; i > 0; i--) {
    s = (s * 9301 + 49297) % 233280;
    const j = Math.floor((s / 233280) * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  const r = a.join("");
  return r === w && w.length > 1 ? a.reverse().join("") : r;
}

export const scramble = (name) =>
  name.toUpperCase().split(" ").map((w, i) => shuffleWord(w, w.length * 7 + i + 3)).join(" ");

export const caesar = (s) =>
  norm(s).toUpperCase().replace(/[A-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 65 + 1) % 26) + 65));
