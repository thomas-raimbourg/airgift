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
  emoji: type === "ligue1" ? "🧣" : type === "festival" ? "🎫" : type === "voyage" ? "🧳" : type === "vin" ? "🧃" : "💿",
  title: type === "ligue1" ? "Surprise… c'est une écharpe !" : type === "festival" ? "Surprise… c'est un porte-clés !" : type === "voyage" ? "Surprise… c'est une valise vide !" : type === "vin" ? "Surprise… c'est du jus de raisin !" : "Surprise… c'est un CD !",
  text: `Mais non ${recipient}, je rigole. 😏 C'est ${type === "vin" ? "du vrai vin, promis" : "BEAUCOUP plus gros que ça"}. Continue…`,
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

export function buildVinEscape(wine, recipient = "Sophie", sender = "Marc", duration = "court") {
  const [domaine, appellation, region, emoji, sousRegion] = wine;

  // ── Étapes communes aux 3 durées ─────────────────────────────────────────

  const sRegion = Q(
    "D'où vient ce vin ?",
    "Les Romains appelaient cette grande région viticole française « Pagus Burgundionum ». Ses Grands Crus sont parmi les vins les plus chers au monde — une seule bouteille de son cru le plus mythique peut se vendre plus de 30 000 € aux enchères.",
    "La région…",
    ["bourgogne", "burgundy"],
    ["🗺️ Située entre la Champagne et le Beaujolais", "🏰 Sa capitale est Dijon", "🍇 Elle produit les plus grands Pinot Noir du monde"]
  );

  const sCepage = {
    ...Q(
      "Le raisin capricieux",
      "Ce vin rouge est issu du cépage emblématique de Bourgogne. On le surnomme parfois « le raisin des cœurs brisés » : exigeant, sensible aux maladies, il redoute le gel et les excès de chaleur. Thomas Jefferson le considérait comme le meilleur raisin du monde. Mais il donne les vins rouges les plus soyeux et complexes qui soient.",
      "Le cépage…",
      ["pinotnoir", "pinot"],
      ["🍇 Sa peau est fine, son jus naturellement peu coloré", "🌡️ Il préfère les régions fraîches aux pays chauds", "🔤 Deux mots : le premier est un type de conifère, le second est une couleur"]
    ),
    surprise: fakeSurprise("vin", recipient),
  };

  const sCommune = {
    ...Q(
      "La cité de Mercure",
      `Ce vin rouge provient d'une commune de la Côte Chalonnaise dont le nom honore un dieu romain, messager des dieux et protecteur des marchands. Des archéologues y ont mis au jour les fondations d'un temple dédié à ce dieu, datant du Ier siècle après J.-C. Avec plus de 640 hectares de vignes, c'est l'appellation phare de la ${sousRegion}.`,
      "La commune…",
      ["mercurey", "mercure"],
      ["⚡ Ce dieu romain est aussi protecteur des voleurs et des voyageurs…", "🪐 La planète la plus proche du Soleil porte son nom", "🔤 7 lettres, commence par M, finit par EY"]
    ),
    surprise: {
      emoji: "🏛️",
      title: "Anecdote débloquée !",
      text: "En 1846, des fouilles sur la colline de Mercurey ont révélé les fondations d'un temple romain dédié à Mercure. Le dieu et ses marchands avaient bien du goût : ils avaient choisi les meilleures pentes viticoles de la région !",
      button: "Fascinant ! Continuer",
    },
  };

  const sAnagramme = {
    ...Q(
      "Les lettres s'emmêlent",
      "Réarrange ces lettres pour retrouver le nom de la commune.",
      "La commune…",
      ["mercurey"],
      ["🔤 7 lettres, commence par M", "📍 C'est aussi le nom d'un dieu romain", "✨ Finit en -EY"]
    ),
    scramble: scramble(appellation.toUpperCase()),
  };

  const sDomaine = Q(
    "Une affaire de famille",
    `Ce vin est produit par le Domaine ${domaine}, une propriété familiale implantée à ${appellation} depuis plusieurs générations. « Jeannin » est un diminutif affectueux d'un prénom masculin très répandu en France. Ce prénom est porté par plusieurs rois de France (Jean le Bon, Jean le Grand) et d'innombrables vignerons bourguignons. Quel est ce prénom ?`,
    "Le prénom…",
    ["jean"],
    ["👑 Jean le Bon, Jean le Grand… le prénom des rois de France", "📖 Dans la Bible : Jean-Baptiste et Jean l'Évangéliste", "🔤 4 lettres seulement"]
  );

  // ── Étapes MOYEN + LONG ───────────────────────────────────────────────────

  const sCisterciens = {
    ...Q(
      "Les bâtisseurs de vignes",
      "Au XIIe siècle, des moines au vêtement blanc installés en Côte d'Or ont révolutionné la viticulture bourguignonne. Ils ont cartographié les meilleurs terroirs, bâti des murs de pierre autour des parcelles d'exception (les fameux « clos ») et développé une méthode d'observation scientifique de la vigne inégalée. Quel est l'ordre monastique fondé à Cîteaux en 1098, à l'origine du Clos de Vougeot ?",
      "L'ordre monastique…",
      ["cisterciens", "cistercien", "citeaux"],
      ["⚪ Ils portaient des robes blanches (contre les Bénédictins en noir)", "🏛️ Leur abbaye-mère est à Cîteaux, en Côte d'Or", "🍷 Ce sont eux qui ont créé le fameux Clos de Vougeot"]
    ),
    surprise: {
      emoji: "📜",
      title: "Anecdote débloquée !",
      text: "Les moines cisterciens goûtaient la terre à genoux et observaient chaque parcelle pendant des décennies. Cette rigueur est à l'origine du concept bourguignon de « Climat » (microparcelle) — classé au Patrimoine mondial de l'UNESCO en 2015.",
      button: "Continuer",
    },
  };

  const sCoteChalonnaise = Q(
    "Entre deux grandes régions",
    `${appellation} appartient à une sous-région de Bourgogne enclavée entre la Côte d'Or au nord et le Mâconnais au sud. Elle tire son nom d'une ville médiévale commerçante au bord de la Saône, connue pour ses foires et son patrimoine romain.`,
    "La sous-région (ou la ville qui lui donne son nom)…",
    ["cotechalonnaise", "chalonnaise", "chalonsursaone", "chalon"],
    ["🌊 La ville est au bord de la Saône", "🏙️ C'est une ville de Bourgogne-Franche-Comté entre Dijon et Lyon", "🔤 La sous-région s'appelle Côte… quoi ?"]
  );

  const sCesar = Q(
    "Message chiffré du caviste",
    `Le caviste t'a laissé un indice codé. Dans ce code, chaque lettre est remplacée par la lettre suivante dans l'alphabet (A→B, B→C… Z→A). Déchiffre : ${caesar(appellation)}`,
    "La commune…",
    [norm(appellation)],
    ["🔁 Fais l'inverse : recule chaque lettre d'un cran (B→A, C→B…)", "📍 C'est le nom de la commune de ce vin", `🔡 La première lettre décodée est « ${appellation[0].toUpperCase()} »`]
  );

  // ── Étapes LONG uniquement ────────────────────────────────────────────────

  const sUNESCO = Q(
    "La consécration mondiale",
    "En 2015, les vignobles de Bourgogne ont obtenu une reconnaissance internationale exceptionnelle. Leur concept de « Climat » — chaque parcelle de vigne nommée, délimitée et identifiée depuis des siècles — est désormais protégé par une institution de l'ONU. De quelle reconnaissance s'agit-il ?",
    "La reconnaissance…",
    ["patrimoinemondial", "unescopatrimoinemondial", "classementunesco"],
    ["🌍 C'est l'UNESCO qui l'attribue", "🏺 Elle protège les « Climats du vignoble de Bourgogne »", "🎖️ Les Pyramides d'Égypte et Notre-Dame ont aussi ce titre"]
  );

  const sPremiersCrus = {
    ...Q(
      "La noblesse de Mercurey",
      `${appellation} est l'une des appellations les plus riches de la ${sousRegion}. Ses parcelles les plus nobles portent des noms qui racontent l'histoire locale : « Clos du Roy » (la vigne du roi), « Les Champs Martins » (saint Martin), « Clos l'Évêque » (l'évêque). Combien ${appellation} possède-t-il de parcelles classées Premier Cru ?`,
      "Le nombre…",
      ["32", "trentedeux"],
      ["🔢 C'est un nombre entre 30 et 35", "📍 C'est le plus grand nombre de Premiers Crus de la Côte Chalonnaise", "🔤 Trente-deux"]
    ),
    surprise: {
      emoji: "👑",
      title: "Anecdote débloquée !",
      text: "Le « Clos du Roy » de Mercurey doit son nom au roi de France, qui possédait cette parcelle au Moyen Âge. La vigne bourguignonne a toujours été une affaire d'État — et de roi.",
      button: "Continuer",
    },
  };

  const sTaskevin = Q(
    "La coupe des chevaliers",
    "Depuis des siècles, les vignerons de Bourgogne utilisent un petit ustensile en argent ou en étain pour évaluer la couleur et la qualité de leur vin, même à la lueur d'une bougie. Sa forme cannelée amplifie les reflets du vin. En 1934, une confrérie a pris cet objet comme emblème et se réunit chaque année au Château du Clos de Vougeot pour célébrer la Bourgogne. Comment s'appelle cet ustensile ?",
    "L'ustensile…",
    ["tastevin"],
    ["🥄 C'est une petite coupe peu profonde, pas un verre à pied", "👁️ Ses cannelures reflètent la lumière pour voir la couleur du vin à la bougie", "🎭 La confrérie s'appelle « Les Chevaliers du… »"]
  );

  const sFut = {
    ...Q(
      "Le bois qui fait le vin",
      "Après la fermentation, les vins de Bourgogne sont élevés 12 à 18 mois dans des récipients en bois. Ces pièces bourguignonnes (228 litres chacune) sont fabriquées à partir d'un arbre dont le bois à grain fin affine le vin sans le dominer. Les forêts de Tronçais et d'Allier sont réputées pour ce bois. Quel est cet arbre ?",
      "L'arbre…",
      ["chene", "futs", "piece"],
      ["🌳 C'est un arbre majestueux qui peut vivre 500 ans et plus", "🌰 Il produit des glands", "🍷 On dit que le vin est élevé « en fûts de… »"]
    ),
    surprise: {
      emoji: "🪵",
      title: "Anecdote débloquée !",
      text: "Une pièce bourguignonne (fût de 228 litres) neuve coûte environ 800 à 1 000 €. Pour un domaine qui produit 20 000 bouteilles, le renouvellement annuel des fûts représente un investissement colossal — et se retrouve dans le prix de chaque bouteille.",
      button: "Continuer",
    },
  };

  // ── Assemblage par durée ──────────────────────────────────────────────────

  const st = [];

  if (duration === "court") {
    // 5 énigmes + code = 6 total
    st.push(sRegion, sCepage, sCommune, sAnagramme, sDomaine);
    st.push({
      title: "Ouvre la bouteille !",
      text: `${sender} a verrouillé la bouteille avec un cadenas à 3 chiffres : (nombre de lettres de ton prénom) puis (nombre total d'énigmes de ce jeu, celle-ci comprise) puis (1, comme une unique bouteille à partager).`,
      ph: "_ _ _",
      a: [`${recipient.length}61`],
      isCode: true,
      hs: [`🔤 ${recipient.toUpperCase()} : compte les lettres.`, `💡 ${recipient.length} … 6 … et combien de bouteilles ?`],
    });
  } else if (duration === "moyen") {
    // 8 énigmes + code = 9 total
    st.push(sRegion, sCepage, sCisterciens, sCoteChalonnaise, sCommune, sCesar, sAnagramme, sDomaine);
    st.push({
      title: "Ouvre la bouteille !",
      text: `${sender} a verrouillé la bouteille avec un cadenas à 3 chiffres : (nombre de lettres de ton prénom) puis (nombre total d'énigmes, celle-ci comprise) puis (1, comme une unique bouteille).`,
      ph: "_ _ _",
      a: [`${recipient.length}91`],
      isCode: true,
      hs: [`🔤 ${recipient.toUpperCase()} : compte les lettres.`, `💡 ${recipient.length} … 9 … et combien de bouteilles ?`],
    });
  } else {
    // 12 énigmes + code = 13 total (cadenas 4 chiffres)
    st.push(sRegion, sCepage, sCisterciens, sUNESCO, sCoteChalonnaise, sCommune, sCesar, sAnagramme, sPremiersCrus, sTaskevin, sFut, sDomaine);
    st.push({
      title: "Le Grand Code de la Bouteille",
      text: `${sender} a verrouillé cette bouteille d'exception avec un cadenas à 4 chiffres : (nombre de lettres de ton prénom) puis (13, nombre total d'énigmes de cette grande quête) puis (1, comme une unique bouteille).`,
      ph: "_ _ _ _",
      a: [`${recipient.length}131`],
      isCode: true,
      hs: [`🔤 ${recipient.toUpperCase()} : compte les lettres.`, `💡 ${recipient.length} … 13 … et combien de bouteilles ?`],
    });
  }

  const durLabel = duration === "court" ? "15 min" : duration === "moyen" ? "30 min" : "1 heure";

  return {
    stages: st,
    ticket: {
      sur: `Vin · Escape Game ${durLabel}`,
      big: `${appellation.toUpperCase()} ROUGE`,
      sub: `Domaine ${domaine} · ${sousRegion}`,
      emoji,
      dl: "Appellation",
      dv: `AOC ${appellation} · ${region}`,
      cta: "🍷 Déboucher la bouteille",
    },
  };
}
