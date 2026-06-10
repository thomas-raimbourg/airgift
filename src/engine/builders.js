import { norm, scramble, caesar } from "./utils.js";
import { COUNTRIES, GENRES, CITYR, VENUES, CLUBS } from "./data.js";

const Q = (title, text, ph, a, hs) => ({ title, text, ph, a, hs: Array.isArray(hs) ? hs : [hs] });

const NATURE_CONCERT = Q(
  "Ça ne s'emballe pas…",
  "Ton cadeau ne pèse rien et pourtant il peut faire pleurer 80 000 personnes en même temps. Il ne s'achète qu'à l'avance, se vit debout, dure quelques heures… et reste gravé pour toujours.",
  "C'est un…",
  ["concert", "unconcert", "spectacle", "show"],
  ["🎟️ Il faut souvent faire la queue en ligne des mois avant pour l'obtenir.", "🎤 Une scène, des projecteurs, une foule qui chante."]
);

export const fakeSurprise = (type, recipient) => ({
  emoji: type === "ligue1" ? "🧣" : type === "festival" ? "🎫" : type === "voyage" ? "🧳" : "💿",
  title: type === "ligue1" ? "Surprise… c'est une écharpe !" : type === "festival" ? "Surprise… c'est un porte-clés !" : type === "voyage" ? "Surprise… c'est une valise vide !" : "Surprise… c'est un CD !",
  text: `Mais non ${recipient}, je rigole. 😏 C'est BEAUCOUP plus gros que ça. Continue…`,
  button: "Ouf. Continuer",
});

export const bonusSurprise = (emoji, hint, sender) => ({
  emoji, title: "Indice bonus débloqué !",
  text: `${sender} a caché un indice pour toi : ${hint}`,
  button: "Intéressant… continuer",
});

export function codeStage(total, recipient, sender) {
  return {
    title: "Déverrouille le cadeau",
    text: `${sender} a verrouillé le cadeau avec un code à 3 chiffres : (nombre de lettres de ton prénom) puis (nombre d'énigmes de ce jeu, celle-ci comprise) puis (nombre de places qui t'attendent).`,
    ph: "_ _ _",
    a: [`${recipient.length}${total}2`],
    isCode: true,
    hs: [`🔤 ${recipient.toUpperCase()} : compte les lettres.`, `💡 ${recipient.length} … ${total} … et combien de places pour un duo ?`],
  };
}

const caesarStage = (cityKey, label) => {
  const plain = CITYR[cityKey].a[0];
  return Q(
    "Message intercepté",
    `Léa a chiffré ${label} avec le code de César : chaque lettre est décalée d'un cran dans l'alphabet (A→B, B→C… Z→A). Décode : ${caesar(plain)}`,
    "Le mot décodé…",
    CITYR[cityKey].a,
    ["🔁 Fais l'inverse : recule chaque lettre d'un cran (B→A).", `🔡 La première lettre décodée est « ${plain[0].toUpperCase()} ».`]
  );
};

const initialsStage = (name, label) => {
  const n = norm(name);
  return Q(
    "Les bornes du nom",
    `Sans le révéler, donne la PREMIÈRE et la DERNIÈRE lettre du nom ${label} (collées, ex : « AZ »).`,
    "Deux lettres…",
    [n[0] + n[n.length - 1]],
    ["🔤 Espaces et symboles ne comptent pas.", `🅰️ La première lettre est « ${n[0].toUpperCase()} »…`]
  );
};

export function buildConcert(ev, recipient = "Hermann", sender = "Léa") {
  const [name, c, g, v, emoji, long] = ev;
  const C = COUNTRIES[c], G = GENRES[g], V = VENUES[v];
  const st = [];
  st.push(Q("D'où vient ton cadeau ?", C.t, "Le pays ou la région…", C.a, C.hs));
  st.push({ ...NATURE_CONCERT, surprise: fakeSurprise("concert", recipient) });
  st.push(Q("Quel genre de musique ?", G.t, "Le genre…", G.a, G.hs));
  if (long) {
    st.push({ ...caesarStage(V.city, "la ville du concert"), surprise: bonusSurprise(emoji, `l'artiste mystère tient en un emoji : ${emoji}. Garde ça en tête.`, sender) });
    st.push(initialsStage(name, "de scène de l'artiste mystère"));
  } else {
    st[2].surprise = bonusSurprise(emoji, `l'artiste mystère tient en un emoji : ${emoji}. Garde ça en tête.`, sender);
  }
  st.push({ ...Q("Lettres en vrac", "Chaque mot du nom de l'artiste a été passé au mixeur :", "Le nom de l'artiste…", [norm(name)], [`${emoji} Repense à l'indice bonus.`, `🔤 ${name.split(" ").length > 1 ? `${name.split(" ").length} mots` : "Un seul mot"}, ${norm(name).length} lettres en tout.`]), scramble: scramble(name) });
  if (long) st.push(Q("Et la salle ?", V.t, "Le nom de la salle / du stade…", V.a, V.hs));
  st.push(codeStage(st.length + 1, recipient, sender));
  return { stages: st, ticket: { sur: "Concert · Événement complet", big: name.toUpperCase(), sub: V.n, emoji } };
}

export function buildLigue1(fx, recipient = "Hermann", sender = "Léa") {
  const [hk, ak, label, long] = fx;
  const H = CLUBS[hk], A = CLUBS[ak], CI = CITYR[H.city];
  const st = [];
  st.push(Q("La nature du cadeau", "Onze contre onze, 90 minutes officielles mais jamais vraiment, un rectangle vert, et 60 000 experts dans les tribunes qui auraient tous fait mieux que l'arbitre.", "C'est un match de…", ["football", "foot", "lefoot", "lefootball", "matchdefoot", "matchdefootball"], ["⚽ Le sport le plus regardé de la planète.", "🥅 On y marque des buts avec les pieds (et la tête)."]));
  if (long) {
    st.push({ ...caesarStage(H.city, "la ville du match"), surprise: fakeSurprise("ligue1", recipient) });
  } else {
    st.push({ ...Q("Dans quelle ville ?", CI.t, "La ville…", CI.a, CI.hs), surprise: fakeSurprise("ligue1", recipient) });
  }
  st.push(Q("Quel stade ?", H.st, "Le nom du stade…", H.sa, H.sh));
  if (long) st.push(Q("Question bonus", H.xq, "Ta réponse…", H.xa, H.xh));
  st.push({ ...Q("Lettres en vrac", "Le club qui reçoit, passé au mixeur :", "Le club…", H.a, ["🏟️ Le club à domicile ce soir-là.", `🔤 Son nom court compte ${H.n.replace(/ /g, "").length} caractères.`]), scramble: scramble(H.n) });
  const adv = Q("Et l'adversaire ?", `Face à lui ce soir-là : ${A.away}.`, "Le club adverse…", A.a, [`🆚 ${label || "Une affiche de Ligue 1."}`, `🔤 Ça commence par « ${A.n[0]} ».`]);
  if (long) adv.surprise = bonusSurprise("⚽", `ce match est ${label ? `« ${label} » — ` : ""}une des plus grosses affiches de la saison.`, sender);
  st.push(adv);
  if (long) st.push(initialsStage(H.full, "complet du club qui reçoit"));
  st.push(codeStage(st.length + 1, recipient, sender));
  return { stages: st, ticket: { sur: `Ligue 1${label ? " · " + label : ""}`, big: `${H.n} – ${A.n}`, sub: H.stade, emoji: "⚽" } };
}

export function buildFestival(f, recipient = "Hermann", sender = "Léa") {
  const [name, g, emoji, cityT, cityA, cityHs, lieu] = f;
  const G = GENRES[g];
  const st = [];
  st.push(Q("La nature du cadeau", "Plusieurs scènes, plusieurs jours, des dizaines d'artistes, un bracelet qu'on garde au poignet bien après, et des douches dont on préfère ne pas parler.", "C'est un…", ["festival", "unfestival", "festivaldemusique"], ["⛺ Il y a souvent un camping à côté.", "🎪 Coachella et Tomorrowland en sont."]));
  st.push({ ...Q("Où ça ?", cityT, "Le lieu…", cityA, cityHs), surprise: fakeSurprise("festival", recipient) });
  st.push(Q("Quel style ?", G.t, "Le genre…", G.a, G.hs));
  st.push({ ...Q("Message intercepté", `${sender} a chiffré le lieu avec le code de César (A→B, Z→A). Décode : ${caesar(cityA[0])}`, "Le mot décodé…", cityA, ["🔁 Recule chaque lettre d'un cran (B→A).", `🔡 Première lettre décodée : « ${cityA[0][0].toUpperCase()} ».`]) });
  st.push({ ...Q("Lettres en vrac", "Chaque mot du nom du festival a été passé au mixeur :", "Le nom du festival…", [norm(name), norm(name.replace(/^les? /i, ""))], [`${emoji} L'un des plus grands festivals de France.`, `🔤 ${norm(name).length} lettres en tout.`]), scramble: scramble(name) });
  st.push(codeStage(st.length + 1, recipient, sender));
  return { stages: st, ticket: { sur: "Festival · Pass 3 jours", big: name.toUpperCase(), sub: lieu, emoji } };
}

const KIND_VOYAGE = {
  ville: Q("Ville ou campagne ?", "Pour ce week-end, le réveil sonnera plutôt sirènes et terrasses que chants d'oiseaux : musées, ruelles pavées et apéros en terrasse au programme.", "Plutôt…", ["ville", "laville", "enville", "citytrip", "encity", "city"], ["🏙️ Le contraire de la campagne.", "🥂 Terrasses, musées, métro."]),
  nature: Q("Ville ou campagne ?", "Pour ce week-end, oublie les klaxons : le réveil sera un chant d'oiseau, et le programme sentira l'herbe coupée, les kilomètres à pied et le feu de cheminée.", "Plutôt…", ["campagne", "lacampagne", "nature", "lanature", "vert", "auvert"], ["🌿 Le contraire de la ville.", "🥾 Chaussures de marche conseillées."]),
};

export function buildVoyage(vg, recipient = "Hermann", sender = "Léa") {
  const [name, kind, country, emoji, destT, destA, destHs, sub, long] = vg;
  const C = COUNTRIES[country];
  const st = [];
  st.push(Q("La nature du cadeau", "Ton cadeau tient dans un sac de 48 heures : il commence un vendredi soir avec des étoiles dans les yeux et finit un dimanche avec des courbatures de bonheur et 400 photos.", "C'est un…", ["voyage", "unvoyage", "weekend", "unweekend", "escapade", "uneescapade", "sejour", "unsejour", "citytrip", "voyagesurprise"], ["🧳 Il faut préparer un petit sac.", "✈️ Ou un plein d'essence, selon la destination."]));
  st.push({ ...KIND_VOYAGE[kind], surprise: fakeSurprise("voyage", recipient) });
  st.push(Q("Quel pays ?", C.t, "Le pays…", C.a, C.hs));
  st.push({ ...Q("La destination", destT, "La destination…", destA, destHs), surprise: bonusSurprise(emoji, `la destination tient en un emoji : ${emoji}. Garde ça en tête.`, sender) });
  if (long) {
    st.push(Q("Message intercepté", `${sender} a chiffré la destination avec le code de César : chaque lettre est décalée d'un cran (A→B, Z→A). Décode : ${caesar(destA[0])}`, "Le mot décodé…", destA, ["🔁 Recule chaque lettre d'un cran (B→A).", `🔡 Première lettre décodée : « ${destA[0][0].toUpperCase()} ».`]));
    st.push(initialsStage(name, "de la destination"));
  }
  st.push({ ...Q("Lettres en vrac", "La destination, passée au mixeur :", "La destination…", destA.concat([norm(name)]), [`${emoji} Repense à l'indice bonus.`, `🔤 ${norm(name).length} lettres en tout.`]), scramble: scramble(name) });
  st.push(codeStage(st.length + 1, recipient, sender));
  return { stages: st, ticket: { sur: "Week-end surprise · 2 personnes", big: name.toUpperCase(), sub, emoji } };
}
