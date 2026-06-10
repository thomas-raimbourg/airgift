import { useState, useEffect } from "react";

/* ================= UTILS ================= */
const norm = (s) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");

// Mélange déterministe (vrai brouillage, plus dur que la simple inversion)
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
const scramble = (name) =>
  name.toUpperCase().split(" ").map((w, i) => shuffleWord(w, w.length * 7 + i + 3)).join(" ");

// Chiffre de César (+1) : A→B, Z→A
const caesar = (s) =>
  norm(s).toUpperCase().replace(/[A-Z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 65 + 1) % 26) + 65));

const RECIPIENT = "Hermann";
const SENDER = "Léa";

/* ================= DICTIONNAIRES (énigmes durcies, indices progressifs) ================= */
const COUNTRIES = {
  usa: { t: "Ce pays n'a aucune langue officielle au niveau fédéral, a acheté un septième de son territoire à la Russie pour une bouchée de pain, et son hymne national reprend la mélodie… d'une chanson à boire anglaise.", a: ["usa", "etatsunis", "lesetatsunis", "amerique", "lamerique", "unitedstates"], hs: ["🧊 Le territoire acheté en 1867 : l'Alaska, 2 cents l'hectare.", "🌙 Premier (et seul) pays à avoir marché sur la Lune.", "🗽 Hollywood, burgers, statue de la Liberté."] },
  uk: { t: "Ce pays n'a pas de constitution écrite, son souverain possède légalement tous les cygnes de ses fleuves, et l'on y conduit du côté où les chevaliers dégainaient leur épée.", a: ["angleterre", "langleterre", "royaumeuni", "leroyaumeuni", "uk", "grandebretagne", "lagrandebretagne"], hs: ["🦢 Les cygnes de la Tamise appartiennent à la Couronne, véridique.", "⚔️ On y dégainait à droite, donc on chevauche à gauche.", "🇬🇧 Big Ben, bus rouges, Londres."] },
  canada: { t: "Sa frontière sud est la plus longue frontière non militarisée du monde, ses troupes ont brûlé la Maison-Blanche en 1814, et ses distributeurs servent du lait… en sachets.", a: ["canada", "lecanada"], hs: ["🥛 Le lait en sac, spécialité de l'Ontario.", "🔥 1814 : la revanche méconnue sur Washington.", "🍁 Sirop d'érable, capitale Ottawa."] },
  quebec: { t: "Sur ses plaques d'immatriculation, une devise en trois mots. On y « magasine » au lieu de faire du shopping, on s'écrit des « courriels », et la « fin de semaine » y remplace un mot anglais que tu utilises tous les vendredis.", a: ["quebec", "lequebec"], hs: ["📬 Courriel, dépanneur, char : tout un vocabulaire.", "⚜️ La devise : « Je me souviens ».", "🍁 Sa plus grande ville : Montréal. Tu y vas bientôt…"] },
  puertorico: { t: "Ses habitants sont citoyens d'un grand pays… sans pouvoir voter pour son président. Un fort y garde la baie depuis 500 ans, et son symbole sonore est une minuscule grenouille nocturne.", a: ["puertorico", "portorico"], hs: ["🐸 La grenouille : le coquí, qu'on entend partout la nuit.", "🏰 Le fort El Morro, à l'entrée de la capitale.", "🇵🇷 Littéralement : « port riche ». Capitale San Juan."] },
  colombie: { t: "Le seul pays d'Amérique du Sud bordé par deux océans, qui fête son indépendance deux fois par an, et dont la légende d'un roi couvert d'or a rendu fous les conquistadors.", a: ["colombie", "lacolombie"], hs: ["👑 La légende : El Dorado, née sur la lagune de Guatavita.", "📚 García Márquez y a inventé Macondo.", "☕ Café, Bogotá, maillot jaune."] },
  espagne: { t: "Ce royaume possède deux enclaves sur le continent africain, un hymne national sans paroles, et l'on y avale douze grains de raisin au rythme des douze coups de minuit chaque 31 décembre.", a: ["espagne", "lespagne"], hs: ["🍇 Les douze raisins de la Puerta del Sol, tradition de 1909.", "🌍 Les enclaves : Ceuta et Melilla.", "🥘 Paella, flamenco, Madrid."] },
  belgique: { t: "Ce pays a tenu 541 jours sans gouvernement (record du monde), un atome géant de 102 mètres domine sa capitale, et il revendique l'invention d'un aliment que le monde entier attribue à son voisin.", a: ["belgique", "labelgique"], hs: ["🍟 L'aliment disputé : la frite, évidemment.", "⚛️ L'Atomium, vestige de l'Expo 58.", "🎷 Le saxophone y est né aussi. Capitale Bruxelles."] },
  france: { t: "Le pays le plus visité du monde, qui possède plus de fuseaux horaires que la Russie grâce à ses confettis d'outre-mer, et où un fromage différent par jour de l'année ne suffirait pas à faire le tour.", a: ["france", "lafrance"], hs: ["🕐 Douze fuseaux horaires, record mondial absolu.", "🧀 Plus de 1200 variétés de fromages recensées.", "🗼 Allez Hermann… c'est chez toi."] },
  allemagne: { t: "Ce pays recense plus de 1500 variétés de saucisses et 5000 bières différentes, sa capitale compte plus de ponts que Venise, et certaines de ses routes n'ont aucune limite de vitesse.", a: ["allemagne", "lallemagne"], hs: ["🌉 Berlin : environ 960 ponts, Venise 400.", "🧱 Son mur le plus célèbre est tombé en 1989.", "🥨 Bretzels, Bayern, Berlin."] },
  australie: { t: "Ce pays a officiellement perdu une guerre contre des oiseaux en 1932, possède une clôture plus longue que la distance Paris–New York, et sa capitale fut inventée de toutes pièces pour départager deux villes rivales.", a: ["australie", "laustralie"], hs: ["🐦 La « Grande Guerre de l'émeu » : l'armée a perdu, véridique.", "🏙️ Les rivales : Sydney et Melbourne. La capitale : ni l'une ni l'autre.", "🦘 Kangourous, surf, Canberra."] },
  irlande: { t: "Cette île ne compte aucun serpent (un saint les aurait chassés), son emblème national est un instrument de musique — cas unique au monde — et sa bière la plus célèbre repose sur un bail de 9000 ans.", a: ["irlande", "lirlande"], hs: ["🍺 Le bail de 9000 ans : signé en 1759 par Arthur Guinness.", "🎵 L'emblème : la harpe celtique.", "🍀 Saint-Patrick, Dublin."] },
  nigeria: { t: "Un Africain sur cinq y vit, son industrie du cinéma produit plus de films que Hollywood, et il a déménagé sa capitale au centre exact du pays en 1991 pour calmer les rivalités.", a: ["nigeria", "lenigeria"], hs: ["🎬 Cette industrie : Nollywood, 2500 films par an.", "🏙️ L'ancienne capitale, devenue mégapole : Lagos.", "🌍 La nouvelle capitale : Abuja."] },
  barbade: { t: "Cette île a remplacé la reine d'Angleterre par une présidente en 2021, abrite la plus vieille distillerie de rhum du monde, et a élevé une chanteuse au rang officiel de « héroïne nationale ».", a: ["barbade", "labarbade"], hs: ["🥃 La distillerie : Mount Gay, fondée en 1703.", "👩‍🎤 L'héroïne nationale chante « Umbrella ».", "🏝️ Capitale : Bridgetown."] },
  italie: { t: "Ce pays en forme de botte compte plus de sites classés UNESCO que tout autre, abrite deux États indépendants à l'intérieur de ses frontières, et y commander un cappuccino après 11 heures relève du sacrilège.", a: ["italie", "litalie", "italia"], hs: ["⛪ Les deux États : le Vatican et Saint-Marin.", "🛵 Pâtes, Vespa, dolce vita.", "🇮🇹 Capitale : Rome."] },
  portugal: { t: "Le plus vieux pays d'Europe aux frontières quasi inchangées depuis 1249, jadis centre d'un empire allant du Brésil à Macao, et dont la musique nationale est une mélancolie classée à l'UNESCO.", a: ["portugal", "leportugal"], hs: ["🎶 Cette musique : le fado.", "🐟 Morue, pastéis de nata, azulejos.", "🇵🇹 Capitale : Lisbonne."] },
  paysbas: { t: "Un tiers de ce pays se trouve sous le niveau de la mer, on y compte plus de vélos que d'habitants, et il fut saisi au XVIIe siècle par une folie spéculative… autour d'une fleur à bulbe.", a: ["paysbas", "lespaysbas", "hollande", "lahollande", "netherlands"], hs: ["🌷 La folie : la tulipomanie de 1637.", "🚲 23 millions de vélos pour 18 millions d'habitants.", "🇳🇱 Capitale : Amsterdam."] },
  tchequie: { t: "Ce pays détient le record mondial de consommation de bière par habitant, son château est le plus vaste château ancien du monde, et il s'est séparé de son jumeau en 1993 sans qu'une seule vitre ne soit brisée.", a: ["tchequie", "latchequie", "republiquetcheque", "larepubliquetcheque"], hs: ["🤝 La séparation : le « divorce de velours » avec la Slovaquie.", "🍺 La pilsner y est née, à Plzeň.", "🇨🇿 Capitale : Prague."] },
  autriche: { t: "La psychanalyse, la valse et — n'en déplaise aux boulangers français — l'ancêtre du croissant sont nés dans ce pays alpin, qui n'a plus d'empereur depuis 1918 mais en a gardé tous les palais.", a: ["autriche", "lautriche"], hs: ["🥐 L'ancêtre du croissant : le kipferl viennois.", "🛋️ Le divan de Freud était dans sa capitale.", "🇦🇹 Mozart, Sissi, Vienne."] },
  hongrie: { t: "Sa langue ne ressemble à aucune de celles de ses voisins, sa capitale est née du mariage de deux villes séparées par un fleuve, et un de ses professeurs a inventé le casse-tête le plus vendu de l'histoire.", a: ["hongrie", "lahongrie"], hs: ["🧩 Le casse-tête : le Rubik's Cube, 1974.", "♨️ Ses bains thermaux Belle Époque sont légendaires.", "🇭🇺 Les deux villes : Buda et Pest."] },
  danemark: { t: "Le plus vieux royaume d'Europe, abonné aux podiums des pays « les plus heureux », qui a offert au monde des briques en plastique et un art de vivre douillet au nom intraduisible.", a: ["danemark", "ledanemark"], hs: ["🧱 Les briques : Lego, « leg godt » = « joue bien ».", "🕯️ L'art de vivre : le hygge.", "🧜 Sa petite sirène attend sur un rocher de Copenhague."] },
  grece: { t: "On y a inventé la démocratie, le théâtre et le marathon ; ce pays compte 6000 îles dont à peine 200 habitées, et y casser des assiettes fut longtemps une forme officielle d'enthousiasme.", a: ["grece", "lagrece"], hs: ["🏛️ Son Parthénon veille depuis 2500 ans.", "🫒 Feta, ouzo, sirtaki.", "🇬🇷 Capitale : Athènes."] },
  suisse: { t: "Ce pays n'a pas connu la guerre depuis 1815, compte plus d'abris antiatomiques que nécessaire pour toute sa population, vote sur tout plusieurs fois par an, et perce les plus longs tunnels du monde.", a: ["suisse", "lasuisse"], hs: ["🚂 Le tunnel du Gothard : 57 km sous les Alpes.", "🧀 Fondue, chocolat, montres, neutralité.", "🇨🇭 Capitale : Berne (ni Genève, ni Zurich)."] },
  croatie: { t: "La cravate y est née et porte le nom de ses habitants, sa côte égrène plus de 1000 îles, et l'une de ses villes fortifiées a servi de décor à une capitale de série télé où l'hiver vient.", a: ["croatie", "lacroatie"], hs: ["👔 Cravate vient de « croate », via les cavaliers du XVIIe.", "🐉 La ville-décor : Dubrovnik, alias King's Landing.", "🇭🇷 Capitale : Zagreb."] },
};

const GENRES = {
  pop: { t: "Trois lettres pour le genre-caméléon : il avale tout (rock, électro, R&B), domine les charts depuis les Beatles et son nom vient du mot « populaire ».", a: ["pop", "lapop", "musiquepop"], hs: ["🎵 Michael Jackson en fut couronné roi.", "📻 Pop, tout simplement."] },
  rock: { t: "Né du blues dans les années 50, il a fait scandale avec un déhanché d'Elvis, se joue à deux guitares, une basse et une batterie, et son nom évoque une pierre.", a: ["rock", "lerock"], hs: ["🎸 Les Rolling Stones en sont les grands-pères encore vivants.", "🤘 Rock'n'roll, baby."] },
  rap: { t: "Né dans les block parties du Bronx dans les années 70, c'est aujourd'hui le genre le plus streamé de France. Pas besoin de chanter juste : il faut du flow.", a: ["rap", "lerap", "hiphop", "lehiphop"], hs: ["🎤 Eminem, Booba, Ninho : même famille musicale.", "🗣️ Trois lettres, des rimes, des punchlines."] },
  reggaeton: { t: "Son squelette rythmique s'appelle le « dembow », il est né entre Panama et Porto Rico dans les années 90, et son nom rend hommage à un genre jamaïcain.", a: ["reggaeton", "lereggaeton", "regueton", "reggeaton"], hs: ["🇯🇲 Reggae + une terminaison espagnole.", "💃 Daddy Yankee, « Gasolina », ça te revient ?"] },
  metal: { t: "Plus lourd, plus sombre et plus rapide que son père le rock : guitares accordées plus bas, double grosse caisse, et un public qui fait tourner des cercles de danse violents mais étonnamment bienveillants.", a: ["metal", "lemetal", "heavymetal", "leheavymetal"], hs: ["🌀 Ces cercles s'appellent des « circle pits ».", "🤘 Black Sabbath l'a inventé. C'est du… ?"] },
  electro: { t: "Pas un instrument « classique » sur scène : des machines, des synthés, des drops. La France en a fourni l'aristocratie mondiale — deux robots casqués en tête.", a: ["electro", "lelectro", "musiqueelectronique", "techno", "latechno", "edm", "house"], hs: ["🤖 Les deux robots : Daft Punk.", "🎧 French Touch, BPM et bras en l'air."] },
  rnb: { t: "Héritier de la soul et du gospel, il se chante en mélismes sur des grooves lents. Son nom est une abréviation anglaise de cinq syllabes qui tient en trois caractères.", a: ["rnb", "lernb", "randb", "rhythmandblues"], hs: ["🎙️ Rhythm and blues, en abrégé.", "💜 Beyoncé et The Weeknd en sont les souverains."] },
  chanson: { t: "Ici le texte est roi : on raconte plus qu'on ne chante. Brel, Barbara et Piaf en ont fait un patrimoine national que le monde entier nous envie sans le comprendre.", a: ["chanson", "lachanson", "chansonfrancaise", "lachansonfrancaise", "variete", "lavariete", "varietefrancaise"], hs: ["🇫🇷 Un genre 100% hexagonal.", "🎶 La … française."] },
  afrobeats: { t: "Attention au « s » final : sans lui, c'est le genre de Fela Kuti ; avec lui, c'est le son solaire de Lagos qui a conquis toutes les playlists mondiales depuis 2015.", a: ["afrobeats", "afrobeat", "lafrobeat", "afropop"], hs: ["🇳🇬 Burna Boy et Wizkid en sont les ambassadeurs.", "🌞 Afro + beats."] },
  jazz: { t: "Né dans les bordels et les fanfares de La Nouvelle-Orléans, c'est le seul genre où se tromper de note peut devenir une idée géniale : tout est improvisation.", a: ["jazz", "lejazz"], hs: ["🎺 Louis Armstrong, Miles Davis, John Coltrane.", "🎷 Quatre lettres, deux Z."] },
};

const CITYR = {
  paris: { t: "Une ville traversée par 37 ponts, qui compte plus de chiens que d'enfants selon la légende, et dont le monument le plus visité devait être démonté en 1909.", a: ["paris"], hs: ["🗼 Le monument en question est en fer puddlé.", "🥐 La Ville Lumière, capitale."] },
  marseille: { t: "La plus vieille ville de France, fondée par des Grecs il y a 2600 ans, où l'exagération est un art de vivre et où l'on garde la peine et la joie « à jamais ».", a: ["marseille"], hs: ["⚽ « À jamais les premiers », ça parle aux supporters.", "⚓ Cité phocéenne, Vieux-Port, savon."] },
  lyon: { t: "Capitale des Gaules, ville natale du cinéma (les frères qui l'ont inventé y avaient leur usine), posée au confluent de deux cours d'eau.", a: ["lyon"], hs: ["🎬 Les frères Lumière, ça aide ?", "🦁 Entre Rhône et Saône. Ses habitants : les Gones."] },
  lille: { t: "Tout au nord, une ville flamande qui organise chaque septembre la plus grande braderie d'Europe et a vu naître un certain Charles de Gaulle.", a: ["lille"], hs: ["🛍️ Sa braderie attire deux millions de visiteurs.", "🧇 Capitale des Flandres françaises."] },
  bordeaux: { t: "Une ville-port classée à l'UNESCO, dont le nom est devenu synonyme de vin dans toutes les langues du monde.", a: ["bordeaux"], hs: ["💧 Son miroir d'eau est le plus grand du monde.", "🍷 Au bord de la Garonne."] },
  saintetienne: { t: "Ancienne capitale du ruban et de la mine, ville natale du Manufrance, dont le club de foot a fait pleurer la France entière un soir de 1976 à Glasgow.", a: ["saintetienne", "sainte"], hs: ["⚽ Les poteaux carrés de Glasgow, une blessure nationale.", "💚 La ville verte du Forez."] },
  lens: { t: "Une petite ville du bassin minier dont le stade peut accueillir plus de monde qu'elle ne compte d'habitants, et dont le terril jumeau est classé à l'UNESCO.", a: ["lens"], hs: ["🏔️ Ses terrils sont les plus hauts d'Europe.", "⛏️ Pas-de-Calais, sang et or. Un Louvre y a ouvert une antenne."] },
  monaco: { t: "Un État de 2 km² où une personne sur trois est millionnaire, où la police compte un agent pour 70 habitants, et où des bolides traversent la ville chaque printemps.", a: ["monaco"], hs: ["🏎️ Son Grand Prix se court en pleine rue depuis 1929.", "🎰 Principauté, rocher, casino de Monte-Carlo."] },
  nice: { t: "Cette ville fut italienne jusqu'en 1860, sa promenade porte le nom d'un peuple étranger, et sa salade est probablement trahie dans tous les restaurants du monde.", a: ["nice"], hs: ["🇮🇹 Garibaldi y est né quand elle s'appelait Nizza.", "🌊 Promenade des Anglais, Côte d'Azur."] },
  rennes: { t: "Capitale d'une région à l'identité farouche, ravagée par un grand incendie en 1720, où le parlement de province a été reconstruit deux fois.", a: ["rennes"], hs: ["🥞 Capitale de la Bretagne.", "⚫🔴 Son club joue au Roazhon Park."] },
  nantes: { t: "Ville des ducs de Bretagne… qui n'est plus en Bretagne administrativement (sujet sensible, ne pas aborder en soirée). Un éléphant mécanique de 12 mètres s'y promène.", a: ["nantes"], hs: ["🐘 L'éléphant des Machines de l'île.", "🟡 Au bord de la Loire, son club : les Canaris."] },
  strasbourg: { t: "Ville-siège d'institutions européennes, dont la cathédrale fut le plus haut édifice du monde pendant deux siècles, et dont le marché de Noël date de 1570.", a: ["strasbourg"], hs: ["🇪🇺 Le Parlement européen y siège.", "🥨 Capitale de l'Alsace."] },
  brest: { t: "Port militaire du bout du monde, rasé à 90% pendant la Seconde Guerre mondiale, célébré par Prévert dans un poème où il pleut sans cesse.", a: ["brest"], hs: ["📜 « Rappelle-toi Barbara… »", "⛵ Tout au bout du Finistère."] },
  toulouse: { t: "On y assemble les plus gros avions du monde, on y parle avec l'assent, et ses briques lui donnent un surnom coloré.", a: ["toulouse"], hs: ["✈️ Airbus y a son siège.", "💗 La Ville rose, sur la Garonne."] },
};

const VENUES = {
  pda: { n: "Paris La Défense Arena", city: "paris", t: "La plus grande salle couverte d'Europe : 40 000 places, posée au milieu des gratte-ciel, et un club de rugby y joue ses matchs à domicile.", a: ["parisladefensearena", "ladefensearena", "ladefense", "defensearena"], hs: ["🏉 Le Racing 92 y reçoit.", "🏙️ Le quartier d'affaires à l'ouest de Paris."] },
  sdf: { n: "Stade de France", city: "paris", t: "80 000 places construites pour un Mondial que le pays hôte a gagné, dans une ville au nom de saint qui n'est pas Paris.", a: ["stadedefrance", "lestadedefrance"], hs: ["⚽ 12 juillet 1998, deux buts de la tête.", "🏟️ À Saint-Denis. Son nom est celui du pays."] },
  accor: { n: "Accor Arena", city: "paris", t: "Une pyramide aux flancs couverts de gazon, au bord de la Seine, que tout le monde appelle encore par le nom de son quartier.", a: ["accorarena", "bercy", "accorhotelarena", "popb"], hs: ["🔺 Le quartier : Bercy.", "🏨 Son sponsor actuel est un groupe hôtelier."] },
  zenith: { n: "Zénith de Paris", city: "paris", t: "La première salle d'une famille qui a essaimé dans toute la France, née en 1984 dans le parc de la Villette. Son nom désigne le point le plus haut du ciel.", a: ["zenith", "zenithdeparis", "lezenith"], hs: ["🌟 Le contraire du nadir.", "🎪 Z comme…"] },
  olympia: { n: "L'Olympia", city: "paris", t: "Ses lettres rouges sont classées monument historique. Piaf, Brel et les Beatles y ont chanté. Elle a failli devenir un parking dans les années 90.", a: ["olympia", "lolympia"], hs: ["🔴 Boulevard des Capucines.", "🏛️ Son nom évoque une montagne grecque."] },
  groupama: { n: "Groupama Stadium", city: "lyon", t: "Un stade de 59 000 places construit sans argent public, fierté d'un président de club aussi célèbre que ses joueurs.", a: ["groupamastadium", "groupama", "parcol"], hs: ["🦁 Jean-Michel Aulas l'a voulu.", "🏟️ Son sponsor est un assureur. À Décines."] },
  velodrome: { n: "Orange Vélodrome", city: "marseille", t: "Son nom rappelle qu'on y faisait du vélo, son toit ondule comme la mer, et son virage sud est considéré comme le plus chaud de France.", a: ["velodrome", "orangevelodrome", "stadevelodrome", "levelodrome"], hs: ["🚴 Des pistes cyclables y entouraient le terrain jusqu'en 1985.", "📞 Son sponsor est un opérateur télécom."] },
  mauroy: { n: "Stade Pierre-Mauroy", city: "lille", t: "Le couteau suisse des stades : toit qui se ferme en 30 minutes, pelouse qui se soulève pour révéler une salle de basket. Il porte le nom d'un ancien Premier ministre.", a: ["pierremauroy", "stadepierremauroy"], hs: ["🏀 La Coupe Davis et l'Eurobasket s'y sont joués.", "🏗️ Pierre M., Premier ministre de Mitterrand."] },
  arkea: { n: "Arkéa Arena", city: "bordeaux", t: "La grande salle de la métropole girondine, à Floirac, sponsorisée par une banque bretonne.", a: ["arkeaarena", "arkea"], hs: ["🏦 Crédit Mutuel… Arkéa.", "🍇 Sur la rive droite de la Garonne."] },
  htg: { n: "Halle Tony Garnier", city: "lyon", t: "Un ancien marché aux bestiaux devenu salle de concert, œuvre d'un architecte utopiste local qui rêvait de cités idéales.", a: ["halletonygarnier", "tonygarnier"], hs: ["🐄 On y vendait du bétail jusqu'en 1974.", "🏭 L'architecte : Tony G."] },
};

/* ================= CATALOGUE ================= */
const CONCERTS = [
  ["Bad Bunny", "puertorico", "reggaeton", "pda", "🐰", 1],
  ["Céline Dion", "quebec", "pop", "pda", "💛", 1],
  ["Taylor Swift", "usa", "pop", "sdf", "🫶", 1],
  ["Beyoncé", "usa", "rnb", "sdf", "🐝", 1],
  ["Coldplay", "uk", "rock", "sdf", "🌈", 1],
  ["Ed Sheeran", "uk", "pop", "sdf", "➗", 0],
  ["Adele", "uk", "pop", "pda", "🎹", 1],
  ["Rihanna", "barbade", "rnb", "sdf", "☔", 1],
  ["Drake", "canada", "rap", "pda", "🦉", 0],
  ["The Weeknd", "canada", "rnb", "sdf", "🌙", 1],
  ["Billie Eilish", "usa", "pop", "accor", "🟢", 0],
  ["Dua Lipa", "uk", "pop", "pda", "💋", 0],
  ["Bruno Mars", "usa", "pop", "pda", "🎩", 0],
  ["Lady Gaga", "usa", "pop", "sdf", "🎭", 1],
  ["Justin Bieber", "canada", "pop", "pda", "🧢", 0],
  ["Imagine Dragons", "usa", "rock", "sdf", "🐉", 0],
  ["Metallica", "usa", "metal", "sdf", "⚡", 1],
  ["Iron Maiden", "uk", "metal", "pda", "💀", 0],
  ["AC DC", "australie", "rock", "sdf", "⚡", 1],
  ["Rammstein", "allemagne", "metal", "sdf", "🔥", 1],
  ["Depeche Mode", "uk", "electro", "accor", "🖤", 0],
  ["U2", "irlande", "rock", "sdf", "🍀", 0],
  ["Rosalia", "espagne", "pop", "accor", "🌹", 0],
  ["Karol G", "colombie", "reggaeton", "pda", "💖", 0],
  ["Shakira", "colombie", "pop", "sdf", "🐺", 1],
  ["Burna Boy", "nigeria", "afrobeats", "sdf", "🦍", 0],
  ["Wizkid", "nigeria", "afrobeats", "accor", "⭐", 0],
  ["Stromae", "belgique", "electro", "pda", "🎩", 1],
  ["Angèle", "belgique", "pop", "accor", "🌸", 0],
  ["Damso", "belgique", "rap", "sdf", "🖤", 0],
  ["Hamza", "belgique", "rap", "accor", "🦋", 0],
  ["Ninho", "france", "rap", "sdf", "💶", 0],
  ["Jul", "france", "rap", "velodrome", "⭐", 1],
  ["SCH", "france", "rap", "velodrome", "🪐", 0],
  ["PNL", "france", "rap", "sdf", "🌍", 0],
  ["Aya Nakamura", "france", "pop", "pda", "💅", 0],
  ["Orelsan", "france", "rap", "pda", "🧢", 1],
  ["Gims", "france", "pop", "sdf", "🕶️", 0],
  ["Soprano", "france", "pop", "velodrome", "🎤", 0],
  ["Indochine", "france", "rock", "sdf", "⚔️", 1],
  ["Mylène Farmer", "france", "pop", "sdf", "🦢", 1],
  ["David Guetta", "france", "electro", "sdf", "🎧", 1],
  ["DJ Snake", "france", "electro", "sdf", "🐍", 1],
  ["Justice", "france", "electro", "accor", "✝️", 0],
  ["M Pokora", "france", "pop", "accor", "🕺", 0],
  ["Clara Luciani", "france", "chanson", "zenith", "💃", 0],
  ["Zaho de Sagazan", "france", "chanson", "olympia", "🌊", 0],
  ["Gazo", "france", "rap", "accor", "💨", 0],
  ["Tiakola", "france", "rap", "accor", "🌟", 0],
  ["Lomepal", "france", "rap", "accor", "🛹", 0],
  ["Nekfeu", "france", "rap", "pda", "🌧️", 0],
  ["Vianney", "france", "chanson", "zenith", "🎸", 0],
  ["Louane", "france", "chanson", "zenith", "🌼", 0],
  ["Slimane", "france", "chanson", "accor", "🎙️", 0],
  ["Calogero", "france", "chanson", "htg", "🎻", 0],
  ["Francis Cabrel", "france", "chanson", "arkea", "🪕", 0],
  ["Julien Doré", "france", "chanson", "htg", "🐨", 0],
  ["Phoenix", "france", "rock", "accor", "🐦", 0],
  ["Kendrick Lamar", "usa", "rap", "pda", "👑", 1],
  ["Travis Scott", "usa", "rap", "sdf", "🎢", 0],
  ["Post Malone", "usa", "rap", "pda", "🤠", 0],
  ["Eminem", "usa", "rap", "sdf", "🎤", 1],
  ["Olivia Rodrigo", "usa", "pop", "accor", "🦋", 0],
  ["Sabrina Carpenter", "usa", "pop", "accor", "☕", 0],
  ["Harry Styles", "uk", "pop", "sdf", "🍉", 0],
  ["Oasis", "uk", "rock", "sdf", "🌀", 1],
  ["Linkin Park", "usa", "rock", "pda", "🔲", 0],
  ["Green Day", "usa", "rock", "accor", "💚", 0],
  ["Muse", "uk", "rock", "sdf", "🧠", 0],
  ["Arctic Monkeys", "uk", "rock", "accor", "🐒", 0],
  ["Sting", "uk", "rock", "accor", "🐝", 0],
  ["Paul McCartney", "uk", "rock", "pda", "🪲", 1],
];

const CLUBS = {
  psg: { n: "PSG", full: "Paris Saint-Germain", city: "paris", stade: "Parc des Princes", sa: ["parcdesprinces", "leparcdesprinces", "leparc"], st: "Construit sur d'anciennes fortifications, porte de Saint-Cloud, son nom évoque des têtes couronnées qui venaient y chasser.", sh: ["👑 Des princes…", "🏟️ « Le Parc », tout simplement."], a: ["psg", "parissaintgermain", "paris", "lepsg"], xq: "Quel monument figure sur le logo du club ?", xa: ["toureiffel", "latoureiffel"], xh: ["🗼 7300 tonnes de fer.", "🇫🇷 LE monument parisien."], away: "le club de la capitale, fondé en 1970, premier titre européen en 2025" },
  om: { n: "OM", full: "Olympique de Marseille", city: "marseille", stade: "Orange Vélodrome", sa: ["velodrome", "orangevelodrome", "stadevelodrome", "levelodrome"], st: "Son nom rappelle un sport à pédales qu'on y pratiquait, et son toit ondule comme la mer toute proche.", sh: ["🚴 Pédales…", "🌊 Le Vél', pour les intimes."], a: ["om", "olympiquedemarseille", "marseille", "lom"], xq: "Complète la devise du club : « Droit au … »", xa: ["but", "aubut", "droitaubut"], xh: ["⚽ Là où le ballon doit finir.", "🥅 D-R-O-I-T A-U …"], away: "le seul club français champion d'Europe, en 1993" },
  ol: { n: "OL", full: "Olympique Lyonnais", city: "lyon", stade: "Groupama Stadium", sa: ["groupamastadium", "groupama", "parcol"], st: "Un stade construit sans un euro d'argent public, à Décines, sponsorisé par un assureur.", sh: ["🦁 L'antre des Gones.", "🏟️ L'assureur commence par G."], a: ["ol", "olympiquelyonnais", "lyon", "lol"], xq: "Quel est le surnom des joueurs lyonnais ?", xa: ["gones", "lesgones"], xh: ["👶 Ça veut dire « gamins » en parler local.", "🗣️ Les G…"], away: "le club aux sept titres consécutifs dans les années 2000" },
  asse: { n: "ASSE", full: "AS Saint-Étienne", city: "saintetienne", stade: "Stade Geoffroy-Guichard", sa: ["geoffroyguichard", "lechaudron", "chaudron", "stadegeoffroyguichard"], st: "Il porte le nom du fondateur d'un empire de la grande distribution (Casino), mais tout le monde l'appelle par son surnom culinaire.", sh: ["🍲 Ça bout dedans.", "🔥 « Le Chaudron »."], a: ["asse", "saintetienne", "assaintetienne", "sainte"], xq: "Quel est le surnom du club ?", xa: ["lesverts", "verts"], xh: ["💚 La couleur de l'espoir.", "🟢 Allez les V… !"], away: "le club légendaire des années 70, tout de vert vêtu" },
  losc: { n: "LOSC", full: "LOSC Lille", city: "lille", stade: "Stade Pierre-Mauroy", sa: ["pierremauroy", "stadepierremauroy"], st: "Toit rétractable, pelouse qui se soulève : il porte le nom d'un ancien Premier ministre, maire de la ville pendant 28 ans.", sh: ["🏗️ Premier ministre de Mitterrand.", "📛 Pierre M…"], a: ["losc", "lille", "lelosc", "lillelosc"], xq: "Quel est le surnom des joueurs lillois ?", xa: ["lesdogues", "dogues"], xh: ["🐕 Un molosse anglais.", "🦮 Les D…"], away: "les Dogues, champions surprise en 2021 devant le PSG" },
  lens: { n: "RC Lens", full: "Racing Club de Lens", city: "lens", stade: "Stade Bollaert-Delelis", sa: ["bollaert", "bollaertdelelis", "stadebollaert"], st: "Il peut contenir plus de monde que la ville ne compte d'habitants, et porte les noms de deux figures locales : un directeur des mines et un maire.", sh: ["⛏️ Le premier nom est celui d'un patron des mines.", "🟡🔴 Bollaert-…"], a: ["lens", "rclens", "racingclubdelens", "lercl"], xq: "Quelles sont les couleurs mythiques du club ?", xa: ["sangetor", "sangor", "rougeetjaune", "jauneetrouge", "rougeetor", "oretsang"], xh: ["🩸 Un liquide vital + un métal précieux.", "🟥🟨 Sang et…"], away: "les Sang et Or, portés par le public le plus chaud de France" },
  monaco: { n: "AS Monaco", full: "AS Monaco", city: "monaco", stade: "Stade Louis-II", sa: ["louis2", "louisii", "stadelouis2", "stadelouisii"], st: "Posé sur la mer, reconnaissable à ses neuf arches, il porte le prénom d'un prince… en chiffres romains.", sh: ["🏛️ Neuf arches face à la Méditerranée.", "👑 Louis… deuxième du nom."], a: ["monaco", "asmonaco", "lasm", "asm"], xq: "Comment s'appelle le prince régnant de la principauté ?", xa: ["albert", "albert2", "albertii", "princealbert"], xh: ["🤴 Fils de Rainier III et de Grace Kelly.", "🅰️ Son prénom commence par A."], away: "le club princier à la diagonale rouge et blanche" },
  nice: { n: "OGC Nice", full: "OGC Nice", city: "nice", stade: "Allianz Riviera", sa: ["allianzriviera", "allianz"], st: "Un stade éco-conçu aux courbes blanches dans la plaine du Var, sponsorisé par un assureur allemand, avec un nom de littoral.", sh: ["🌊 Riviera = la côte.", "🏦 L'assureur sponsorise aussi un stade à Munich."], a: ["nice", "ogcnice", "logcnice"], xq: "Quel est le surnom des joueurs niçois ?", xa: ["lesaiglons", "aiglons"], xh: ["🦅 Des petits de rapace.", "🐣 Les Aig…"], away: "les Aiglons de la Côte d'Azur" },
  rennes: { n: "Stade Rennais", full: "Stade Rennais", city: "rennes", stade: "Roazhon Park", sa: ["roazhonpark", "roazhon"], st: "Son nom n'est autre que celui de la ville… traduit dans la langue régionale.", sh: ["🗣️ La langue : le breton.", "🏟️ Roazhon = Rennes."], a: ["rennes", "staderennais", "srfc", "lestaderennais"], xq: "Quelles sont les couleurs du club breton ?", xa: ["rougeetnoir", "noiretrouge"], xh: ["📕 Comme le roman de Stendhal.", "⚫🔴 Noir et… ?"], away: "le club breton, vainqueur de la Coupe 2019 face au PSG" },
  nantes: { n: "FC Nantes", full: "FC Nantes", city: "nantes", stade: "Stade de la Beaujoire", sa: ["beaujoire", "labeaujoire", "stadedelabeaujoire"], st: "Inauguré pour l'Euro 1984, son nom est celui du quartier, et il a vu éclore le « jeu à la nantaise ».", sh: ["🌸 Beau + joire.", "🏟️ La B…"], a: ["nantes", "fcnantes", "lefcnantes", "lefcn"], xq: "Quel est le surnom des joueurs nantais ?", xa: ["lescanaris", "canaris"], xh: ["🐤 Un oiseau jaune en cage.", "🟡 Les Can…"], away: "les Canaris, huit fois champions de France" },
  strasbourg: { n: "RC Strasbourg", full: "RC Strasbourg", city: "strasbourg", stade: "Stade de la Meinau", sa: ["meinau", "lameinau", "stadedelameinau"], st: "Le stade historique du club porte le nom de son quartier, au sud de la ville.", sh: ["🏘️ Le quartier : la M…", "🥨 La Meinau."], a: ["strasbourg", "rcstrasbourg", "racing", "lercs"], xq: "Dans quelle région joue ce club ?", xa: ["alsace", "lalsace", "grandest", "legrandest"], xh: ["🍷 Sa route des vins est célèbre.", "🥨 Choucroute et colombages."], away: "le Racing alsacien et son public fidèle" },
  brest: { n: "Stade Brestois", full: "Stade Brestois 29", city: "brest", stade: "Stade Francis-Le Blé", sa: ["francisleble", "leble", "stadefrancisleble"], st: "Un petit stade de bord de mer qui a accueilli la Ligue des champions, du nom d'un ancien maire céréalier d'apparence.", sh: ["🌾 Le Blé, comme la céréale.", "🏟️ Francis Le B…"], a: ["brest", "stadebrestois", "sb29", "lestadebrestois"], xq: "Dans quelle région joue ce club ?", xa: ["bretagne", "labretagne"], xh: ["🥞 Crêpes, phares, hermines.", "⚓ Penn ar Bed : le bout du monde."], away: "le petit poucet breton qui a goûté à la Ligue des champions" },
  toulouse: { n: "Toulouse FC", full: "Toulouse FC", city: "toulouse", stade: "Stadium de Toulouse", sa: ["stadium", "stadiumdetoulouse", "lestadium"], st: "Construit sur une île de la Garonne pour le Mondial 1938, on l'appelle simplement par le mot anglais pour « stade ».", sh: ["🏝️ Sur l'île du Ramier.", "🇬🇧 Stade, en anglais."], a: ["toulouse", "toulousefc", "tfc", "letfc"], xq: "Quelle est la couleur emblématique du club ?", xa: ["violet", "leviolet", "violette"], xh: ["🌸 Comme la fleur emblème de la ville.", "💜 Le V…"], away: "le club violet de la Ville rose" },
};

const FIXTURES = [
  ["psg", "om", "Le Classique", 1],
  ["om", "psg", "Le Classique", 1],
  ["ol", "asse", "Derby rhodanien", 1],
  ["asse", "ol", "Derby rhodanien", 0],
  ["losc", "lens", "Derby du Nord", 1],
  ["lens", "losc", "Derby du Nord", 0],
  ["om", "ol", "L'Olympico", 0],
  ["ol", "om", "L'Olympico", 0],
  ["psg", "ol", "", 0],
  ["psg", "monaco", "", 0],
  ["monaco", "psg", "", 0],
  ["nice", "monaco", "Derby azuréen", 0],
  ["monaco", "nice", "Derby azuréen", 0],
  ["rennes", "nantes", "Derby breton", 1],
  ["nantes", "rennes", "Derby breton", 0],
  ["lens", "psg", "", 0],
  ["brest", "rennes", "", 0],
  ["strasbourg", "psg", "", 0],
  ["toulouse", "om", "", 0],
  ["nice", "om", "", 0],
];

const FESTIVALS = [
  ["Hellfest", "metal", "🤘", "Une petite ville viticole de Loire-Atlantique, au château médiéval et à l'architecture italienne, qui multiplie sa population par 30 un week-end par an.", ["clisson"], ["🍇 Au milieu du vignoble du muscadet.", "😈 Près de Nantes. Son nom commence comme « enfer » en anglais."], "Clisson"],
  ["Rock en Seine", "rock", "🎸", "Un domaine national dessiné par Le Nôtre, dont le château a brûlé en 1870 et n'a jamais été reconstruit, aux portes ouest de Paris.", ["saintcloud", "parcdesaintcloud"], ["🏰 Il ne reste que le parc, le château a disparu.", "🌳 Saint-… (un saint, pas un nuage)."], "Domaine de Saint-Cloud"],
  ["Les Vieilles Charrues", "chanson", "🚜", "Une petite ville du centre-Bretagne de 7000 âmes qui devient, le temps d'un week-end, l'une des plus grandes villes de France.", ["carhaix"], ["🥞 En plein Finistère intérieur.", "🚜 Car-haix, en deux syllabes."], "Carhaix"],
  ["Solidays", "pop", "❤️", "Un hippodrome parisien du bois de Boulogne, où les festivaliers remplacent les chevaux au profit de la lutte contre le sida.", ["paris", "longchamp", "hippodromedelongchamp"], ["🐎 Le prix de l'Arc de Triomphe s'y court.", "🏇 Long-quelque chose."], "Hippodrome de Longchamp, Paris"],
  ["Lollapalooza Paris", "pop", "🎡", "Le même hippodrome du bois de Boulogne qu'un festival solidaire, investi cette fois par un géant américain né à Chicago.", ["paris", "longchamp", "hippodromedelongchamp"], ["🇺🇸 Le festival d'origine est né en 1991 aux États-Unis.", "🐎 Encore les chevaux de Longchamp."], "Hippodrome de Longchamp, Paris"],
  ["We Love Green", "electro", "🌿", "Le grand bois de l'est parisien, avec château, zoo et lac, version festival écoresponsable alimenté aux énergies renouvelables.", ["paris", "boisdevincennes", "vincennes"], ["🏰 Son château a une vraie tour médiévale.", "🌳 L'autre grand bois de Paris, à l'est."], "Bois de Vincennes, Paris"],
  ["Main Square Festival", "rock", "🏰", "Une citadelle Vauban du Pas-de-Calais, dans une ville aux deux places baroques classées à l'UNESCO. Le nom du festival signifie « grand-place » en anglais.", ["arras"], ["🧱 Ses beffrois et ses places flamandes sont classés.", "🏰 A-deux-R-A-S."], "Citadelle d'Arras"],
  ["Les Eurockéennes", "rock", "🦁", "Une presqu'île sur un lac, au pied d'une ville gardée par un lion de grès rose sculpté par l'auteur de la statue de la Liberté.", ["belfort"], ["🗽 Bartholdi a sculpté les deux.", "🦁 Son lion fait 22 mètres de long."], "Presqu'île du Malsaucy, Belfort"],
  ["Printemps de Bourges", "chanson", "🌷", "Une ville du Berry à la cathédrale UNESCO, proche du centre géographique exact de la France, qui lance chaque année la saison des festivals.", ["bourges"], ["📍 Le centre de la France est à côté, à Vesdun.", "⛪ B-O-U-R-G-E-S."], "Bourges"],
  ["Les Francofolies", "chanson", "⛵", "Un port de Charente-Maritime gardé par deux tours médiévales, célèbre pour son Vieux-Port, son aquarium et ses vélos jaunes avant tout le monde.", ["larochelle"], ["🚲 Pionnière du vélo en libre-service dès 1976.", "🗼 La R…, ses tours gardent l'entrée du port."], "La Rochelle"],
  ["Garorock", "electro", "🐊", "Une petite ville du Lot-et-Garonne dont la tomate est une variété connue de tous les jardiniers de France.", ["marmande"], ["🍅 La tomate de M…", "🐊 Garonne + rock = le nom du festival."], "Marmande"],
  ["Jazz à Vienne", "jazz", "🎷", "Un théâtre antique romain de 7000 places au bord du Rhône, dans une ville qui partage son nom avec une capitale européenne.", ["vienne"], ["🇦🇹 La capitale homonyme est en Autriche.", "🏛️ En Isère, au sud de Lyon."], "Théâtre antique de Vienne"],
  ["Nuits de Fourvière", "chanson", "🏛️", "Une colline antique surnommée « la colline qui prie », qui domine une grande ville et abrite deux théâtres romains et une basilique.", ["lyon", "fourviere"], ["⛪ Sa basilique blanche veille sur la ville des Gones.", "🦁 La ville en bas : capitale des Gaules."], "Théâtres romains de Fourvière, Lyon"],
  ["Festival de Nîmes", "pop", "🏟️", "Des arènes romaines de 2000 ans parmi les mieux conservées du monde, dans une ville dont l'emblème est un crocodile enchaîné à un palmier.", ["nimes"], ["🐊 Le crocodile rappelle les vétérans de César revenus d'Égypte.", "👖 Le « denim » vient du tissu « de Nîmes »."], "Arènes de Nîmes"],
];

/* ================= GÉNÉRATEUR ================= */
const Q = (title, text, ph, a, hs) => ({ title, text, ph, a, hs: Array.isArray(hs) ? hs : [hs] });

const NATURE = Q(
  "Ça ne s'emballe pas…",
  "Ton cadeau ne pèse rien et pourtant il peut faire pleurer 80 000 personnes en même temps. Il ne s'achète qu'à l'avance, se vit debout, dure quelques heures… et reste gravé pour toujours.",
  "C'est un…",
  ["concert", "unconcert", "spectacle", "show"],
  ["🎟️ Il faut souvent faire la queue en ligne des mois avant pour l'obtenir.", "🎤 Une scène, des projecteurs, une foule qui chante."]
);

const fakeSurprise = (type) => ({
  emoji: type === "ligue1" ? "🧣" : type === "festival" ? "🎫" : type === "voyage" ? "🧳" : "💿",
  title: type === "ligue1" ? "Surprise… c'est une écharpe !" : type === "festival" ? "Surprise… c'est un porte-clés !" : type === "voyage" ? "Surprise… c'est une valise vide !" : "Surprise… c'est un CD !",
  text: `Mais non ${RECIPIENT}, je rigole. 😏 C'est BEAUCOUP plus gros que ça. Continue…`,
  button: "Ouf. Continuer",
});
const bonusSurprise = (emoji, hint) => ({
  emoji, title: "Indice bonus débloqué !",
  text: `${SENDER} a caché un indice pour toi : ${hint}`,
  button: "Intéressant… continuer",
});

function codeStage(total) {
  return {
    title: "Déverrouille le cadeau",
    text: `${SENDER} a verrouillé le cadeau avec un code à 3 chiffres : (nombre de lettres de ton prénom) puis (nombre d'énigmes de ce jeu, celle-ci comprise) puis (nombre de places qui t'attendent).`,
    ph: "_ _ _", a: [`${RECIPIENT.length}${total}2`], isCode: true,
    hs: [`🔤 ${RECIPIENT.toUpperCase()} : compte les lettres.`, `💡 ${RECIPIENT.length} … ${total} … et combien de places pour un duo ?`],
  };
}

const caesarStage = (cityKey, label) => {
  const plain = CITYR[cityKey].a[0];
  return Q(
    "Message intercepté",
    `${SENDER} a chiffré ${label} avec le code de César : chaque lettre est décalée d'un cran dans l'alphabet (A→B, B→C… Z→A). Décode : ${caesar(plain)}`,
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

function buildConcert(ev) {
  const [name, c, g, v, emoji, long] = ev;
  const C = COUNTRIES[c], G = GENRES[g], V = VENUES[v];
  const st = [];
  st.push(Q("D'où vient ton cadeau ?", C.t, "Le pays ou la région…", C.a, C.hs));
  st.push({ ...NATURE, surprise: fakeSurprise("concert") });
  st.push(Q("Quel genre de musique ?", G.t, "Le genre…", G.a, G.hs));
  if (long) {
    st.push({ ...caesarStage(V.city, "la ville du concert"), surprise: bonusSurprise(emoji, `l'artiste mystère tient en un emoji : ${emoji}. Garde ça en tête.`) });
    st.push(initialsStage(name, "de scène de l'artiste mystère"));
  } else {
    st[2].surprise = bonusSurprise(emoji, `l'artiste mystère tient en un emoji : ${emoji}. Garde ça en tête.`);
  }
  st.push({ ...Q("Lettres en vrac", "Chaque mot du nom de l'artiste a été passé au mixeur :", "Le nom de l'artiste…", [norm(name)], [`${emoji} Repense à l'indice bonus.`, `🔤 ${name.split(" ").length > 1 ? `${name.split(" ").length} mots` : "Un seul mot"}, ${norm(name).length} lettres en tout.`]), scramble: scramble(name) });
  if (long) st.push(Q("Et la salle ?", V.t, "Le nom de la salle / du stade…", V.a, V.hs));
  st.push(codeStage(st.length + 1));
  return { stages: st, ticket: { sur: "Concert · Événement complet", big: name.toUpperCase(), sub: V.n, emoji } };
}

function buildLigue1(fx) {
  const [hk, ak, label, long] = fx;
  const H = CLUBS[hk], A = CLUBS[ak], CI = CITYR[H.city];
  const st = [];
  st.push(Q("La nature du cadeau", "Onze contre onze, 90 minutes officielles mais jamais vraiment, un rectangle vert, et 60 000 experts dans les tribunes qui auraient tous fait mieux que l'arbitre.", "C'est un match de…", ["football", "foot", "lefoot", "lefootball", "matchdefoot", "matchdefootball"], ["⚽ Le sport le plus regardé de la planète.", "🥅 On y marque des buts avec les pieds (et la tête)."]));
  if (long) {
    st.push({ ...caesarStage(H.city, "la ville du match"), surprise: fakeSurprise("ligue1") });
  } else {
    st.push({ ...Q("Dans quelle ville ?", CI.t, "La ville…", CI.a, CI.hs), surprise: fakeSurprise("ligue1") });
  }
  st.push(Q("Quel stade ?", H.st, "Le nom du stade…", H.sa, H.sh));
  if (long) st.push(Q("Question bonus", H.xq, "Ta réponse…", H.xa, H.xh));
  st.push({ ...Q("Lettres en vrac", "Le club qui reçoit, passé au mixeur :", "Le club…", H.a, ["🏟️ Le club à domicile ce soir-là.", `🔤 Son nom court compte ${H.n.replace(/ /g, "").length} caractères.`]), scramble: scramble(H.n) });
  const adv = Q("Et l'adversaire ?", `Face à lui ce soir-là : ${A.away}.`, "Le club adverse…", A.a, [`🆚 ${label || "Une affiche de Ligue 1."}`, `🔤 Ça commence par « ${A.n[0]} ».`]);
  if (long) adv.surprise = bonusSurprise("⚽", `ce match est ${label ? `« ${label} » — ` : ""}une des plus grosses affiches de la saison.`);
  st.push(adv);
  if (long) st.push(initialsStage(H.full, "complet du club qui reçoit"));
  st.push(codeStage(st.length + 1));
  return { stages: st, ticket: { sur: `Ligue 1${label ? " · " + label : ""}`, big: `${H.n} – ${A.n}`, sub: H.stade, emoji: "⚽" } };
}

function buildFestival(f) {
  const [name, g, emoji, cityT, cityA, cityHs, lieu] = f;
  const G = GENRES[g];
  const st = [];
  st.push(Q("La nature du cadeau", "Plusieurs scènes, plusieurs jours, des dizaines d'artistes, un bracelet qu'on garde au poignet bien après, et des douches dont on préfère ne pas parler.", "C'est un…", ["festival", "unfestival", "festivaldemusique"], ["⛺ Il y a souvent un camping à côté.", "🎪 Coachella et Tomorrowland en sont."]));
  st.push({ ...Q("Où ça ?", cityT, "Le lieu…", cityA, cityHs), surprise: fakeSurprise("festival") });
  st.push(Q("Quel style ?", G.t, "Le genre…", G.a, G.hs));
  st.push({ ...Q("Message intercepté", `${SENDER} a chiffré le lieu avec le code de César (A→B, Z→A). Décode : ${caesar(cityA[0])}`, "Le mot décodé…", cityA, ["🔁 Recule chaque lettre d'un cran (B→A).", `🔡 Première lettre décodée : « ${cityA[0][0].toUpperCase()} ».`]) });
  st.push({ ...Q("Lettres en vrac", "Chaque mot du nom du festival a été passé au mixeur :", "Le nom du festival…", [norm(name), norm(name.replace(/^les? /i, ""))], [`${emoji} L'un des plus grands festivals de France.`, `🔤 ${norm(name).length} lettres en tout.`]), scramble: scramble(name) });
  st.push(codeStage(st.length + 1));
  return { stages: st, ticket: { sur: "Festival · Pass 3 jours", big: name.toUpperCase(), sub: lieu, emoji } };
}

// Voyages : [nom, ville|nature, pays, emoji, énigme-lieu, réponses, indices[2], sous-titre, long?]
const VOYAGES = [
  ["Rome", "ville", "italie", "🏛️", "Une ville bâtie sur sept collines, où l'on jette des pièces par-dessus son épaule dans une fontaine baroque, et où la légende veut qu'une louve ait élevé les deux fondateurs.", ["rome", "roma"], ["⛲ La fontaine : Trevi, 3000 € de pièces par jour.", "🐺 Les jumeaux : Romulus et Remus."], "City-trip · Italie", 1],
  ["Lisbonne", "ville", "portugal", "🚋", "Bâtie sur sept collines elle aussi, rasée par un séisme en 1755, parcourue par des tramways jaunes brinquebalants et gardée par un pont rouge très californien.", ["lisbonne", "lisboa"], ["🚃 Le tram 28, le plus photographié du monde.", "🌉 Son pont du 25-Avril ressemble au Golden Gate."], "City-trip · Portugal", 0],
  ["Barcelone", "ville", "espagne", "🦎", "Une basilique en chantier depuis 1882 y nargue les grues, œuvre d'un architecte génial mort fauché par un tramway, et une avenue y déambule sur 1,2 km.", ["barcelone", "barcelona"], ["⛪ La basilique : la Sagrada Família.", "🎨 L'architecte : Antoni Gaudí. L'avenue : les Ramblas."], "City-trip · Espagne", 0],
  ["Amsterdam", "ville", "paysbas", "🚲", "165 canaux, des maisons si étroites et penchées qu'on hisse les meubles par les fenêtres grâce à des crochets en façade.", ["amsterdam"], ["🪝 Les crochets de levage, au sommet de chaque pignon.", "🌷 La capitale du pays des tulipes."], "City-trip · Pays-Bas", 0],
  ["Prague", "ville", "tchequie", "🕰️", "Une horloge astronomique de 1410 y rassemble les foules à chaque heure pile, et un pont gothique bordé de 30 statues noircies enjambe son fleuve.", ["prague", "praha"], ["🌉 Le pont : Charles, commencé en 1357.", "🏰 La « ville aux cent clochers », sur la Vltava."], "City-trip · Tchéquie", 0],
  ["Vienne", "ville", "autriche", "🎻", "On y ouvre l'année en valsant, ses cafés sont classés au patrimoine immatériel de l'UNESCO, et une grande roue de 1897 tourne toujours dans son parc d'attractions.", ["vienne", "wien"], ["🎡 La roue : la Riesenrad du Prater.", "🍰 La Sachertorte y est jalousement gardée."], "City-trip · Autriche", 0],
  ["Budapest", "ville", "hongrie", "♨️", "On s'y baigne dehors dans des thermes Belle Époque même sous la neige, et son parlement néogothique — le troisième plus grand du monde — se mire dans le Danube.", ["budapest"], ["♨️ Les bains : Széchenyi, Gellért…", "🌉 Buda d'un côté, Pest de l'autre."], "City-trip · Hongrie", 0],
  ["Copenhague", "ville", "danemark", "🧜", "Un quartier autoproclamé « ville libre » y vit selon ses propres règles depuis 1971, on y pédale par -5 °C, et une statue de bronze y fixe la mer depuis 1913.", ["copenhague", "kobenhavn", "copenhagen"], ["🏴 Le quartier : Christiania.", "🧜‍♀️ La statue : la Petite Sirène, souvent décapitée, toujours réparée."], "City-trip · Danemark", 0],
  ["Séville", "ville", "espagne", "💃", "La plus grande cathédrale gothique du monde y côtoie un palais mauresque toujours habité par la famille royale, et il y fait si chaud l'été qu'on y vit la nuit.", ["seville", "sevilla"], ["🍊 Ses 40 000 orangers parfument les rues en mars.", "💃 Capitale de l'Andalousie, berceau du flamenco."], "City-trip · Espagne", 0],
  ["Porto", "ville", "portugal", "🍷", "Une ville en amphithéâtre dont le vin éponyme vieillit en réalité sur la rive d'en face, et dont une librairie aux escaliers rouges aurait inspiré une certaine école de sorciers.", ["porto"], ["📚 La librairie : Lello.", "🌉 Son pont métallique est signé d'un disciple d'Eiffel."], "City-trip · Portugal", 0],
  ["Venise", "ville", "italie", "🛶", "118 îles, plus de 400 ponts, zéro voiture : on y prend le bus sur l'eau, et la ville s'enfonce de quelques millimètres chaque année.", ["venise", "venezia"], ["🚤 Le bus : le vaporetto.", "🎭 Son carnaval masqué dure deux semaines."], "City-trip · Italie", 0],
  ["Berlin", "ville", "allemagne", "🐻", "Coupée en deux pendant 28 ans, cette capitale compte plus de musées qu'il ne pleut de jours par an, neuf fois plus de ponts que Venise, et son emblème est un ours debout.", ["berlin"], ["🧱 Le plus long morceau du Mur restant est une galerie d'art à ciel ouvert.", "🚪 Sa porte de Brandebourg a vu défiler toute l'Histoire."], "City-trip · Allemagne", 0],
  ["Gorges du Verdon", "nature", "france", "🛶", "Le plus grand canyon d'Europe : 700 mètres de falaises au-dessus d'une eau si turquoise qu'elle semble teintée — et son nom vient justement de cette couleur.", ["verdon", "gorgesduverdon", "lesgorgesduverdon"], ["💚 Vert… don.", "🛶 En Provence, entre le lac de Sainte-Croix et les vautours."], "Week-end nature · Provence", 0],
  ["Luberon", "nature", "france", "💜", "Des villages perchés couleur ocre, un parfum violet qui envahit les champs en juillet, et un livre d'un Anglais expatrié qui a fait rêver le monde entier d'une « année » ici.", ["luberon", "leluberon"], ["📖 Le livre : « Une année en Provence », de Peter Mayle.", "💜 Gordes, Roussillon, et la lavande à perte de vue."], "Week-end nature · Provence", 0],
  ["Dordogne", "nature", "france", "🦆", "Plus de 1000 châteaux, des parois ornées par des artistes d'il y a 17 000 ans, et une gastronomie qui ignore superbement le mot « léger ».", ["dordogne", "ladordogne", "perigord", "leperigord"], ["🖼️ Les artistes préhistoriques : grotte de Lascaux.", "🦆 Foie gras, confit, noix : le Périgord."], "Week-end nature · Sud-Ouest", 0],
  ["Route des vins d'Alsace", "nature", "france", "🍇", "170 km de villages à colombages aux noms imprononçables, des vignes à flanc de colline, et de grands oiseaux qui nichent sur les cheminées.", ["alsace", "lalsace", "routedesvins", "routedesvinsdalsace"], ["🪶 Les oiseaux : des cigognes.", "🍷 Riesling, gewurztraminer, Riquewihr, Eguisheim."], "Week-end nature · Grand Est", 0],
  ["Presqu'île de Crozon", "nature", "france", "🌊", "Des criques aux eaux dignes des Caraïbes (la température en moins), des landes de bruyère et des falaises de grès, tout au bout du bout de la France.", ["crozon", "presquiledecrozon", "lapresquiledecrozon"], ["🏖️ Sa plage de l'île Vierge fut élue parmi les plus belles d'Europe.", "🥞 Dans le Finistère : « la fin de la terre »."], "Week-end nature · Bretagne", 0],
  ["Pays Basque", "nature", "france", "🌶️", "Des maisons blanc et rouge, une langue sans aucune famille connue, un gâteau qui cache sa garniture et un piment qui sèche en guirlandes sur les façades.", ["paysbasque", "lepaysbasque"], ["🌶️ Le piment : Espelette.", "⛰️ Entre Biarritz, Espelette et la Rhune."], "Week-end nature · Sud-Ouest", 0],
  ["Volcans d'Auvergne", "nature", "france", "🌋", "Quatre-vingts volcans endormis alignés sur 45 km, dont le plus célèbre a donné son nom à un département et sert de ligne d'arrivée à des milliers de cyclistes.", ["auvergne", "lauvergne", "puydedome", "lepuydedome", "chainedespuys", "lachainedespuys"], ["⛰️ Le plus célèbre : le puy de Dôme.", "🧀 Saint-nectaire, cantal et truffade au ravitaillement."], "Week-end nature · Massif central", 0],
  ["Champagne", "nature", "france", "🥂", "Des coteaux classés UNESCO sous lesquels dorment des millions de bouteilles, dans 250 km de caves creusées dans la craie — et une avenue dont le sous-sol vaut des milliards.", ["champagne", "lachampagne"], ["🍾 L'avenue : l'avenue de Champagne, à Épernay.", "🥂 Ça se sabre, ça pétille, c'est à l'est de Paris."], "Week-end nature · Grand Est", 0],
  ["Annecy", "nature", "france", "🏔️", "Le lac réputé le plus pur d'Europe, une vieille ville traversée de canaux fleuris, et un surnom qui emprunte à une ville italienne sur l'eau.", ["annecy", "lacdannecy", "lelacdannecy"], ["🛶 Le surnom : la « Venise des Alpes ».", "🏔️ En Haute-Savoie, vélo autour du lac obligatoire."], "Week-end nature · Alpes", 0],
  ["Mont-Saint-Michel", "nature", "france", "🏰", "Une abbaye sur un rocher cerné par les plus grandes marées d'Europe — la mer y monte « à la vitesse d'un cheval au galop » — et que deux régions se disputent depuis mille ans.", ["montsaintmichel", "lemontsaintmichel"], ["🌊 Marnage record : jusqu'à 15 mètres.", "⚔️ Normandie ou Bretagne ? (Officiellement : Normandie.)"], "Week-end nature · Normandie", 1],
  ["Toscane", "nature", "italie", "🌻", "Des collines ondulées ponctuées de cyprès, des cités-musées rivales depuis le Moyen Âge, et un vin dont la zone historique s'identifie à un coq noir.", ["toscane", "latoscane", "toscana"], ["🍷 Le coq noir : le Chianti Classico.", "🖼️ Florence, Sienne, Pise et San Gimignano."], "Week-end nature · Italie", 1],
  ["Algarve", "nature", "portugal", "🏖️", "Des falaises ocre percées de grottes marines au sud d'un pays de navigateurs, là où l'Europe a longtemps cru que le monde s'arrêtait.", ["algarve", "lalgarve"], ["🌊 Sa grotte la plus célèbre : Benagil, accessible seulement par la mer.", "🧭 Le cap Saint-Vincent : le « bout du monde » des Anciens."], "Week-end nature · Portugal", 0],
  ["Forêt-Noire", "nature", "allemagne", "🌲", "Une forêt de sapins si sombre qu'elle a nourri les contes des frères Grimm, patrie d'une horloge à oiseau… et d'un gâteau cerises-chocolat-chantilly.", ["foretnoire", "laforetnoire", "schwarzwald"], ["⏰ L'horloge : le coucou.", "🍒 Le gâteau porte le même nom que la forêt."], "Week-end nature · Allemagne", 0],
  ["Interlaken", "nature", "suisse", "🪂", "Son nom dit tout : « entre les lacs ». Au-dessus, trois sommets mythiques dont une « Vierge » à 4158 mètres et un « Ogre » à la face nord assassine.", ["interlaken"], ["🏔️ Les trois : Eiger, Mönch et Jungfrau.", "🇨🇭 Dans l'Oberland bernois, capitale du parapente."], "Week-end nature · Suisse", 0],
  ["Lacs de Plitvice", "nature", "croatie", "💧", "Seize lacs en terrasses reliés par 90 cascades, aux eaux si turquoise qu'on les croirait retouchées, dans le premier parc national de son pays.", ["plitvice", "lacsdeplitvice", "leslacsdeplitvice"], ["🚶 On les parcourt sur des passerelles de bois flottantes.", "🇭🇷 Entre Zagreb et la côte dalmate."], "Week-end nature · Croatie", 0],
  ["Santorin", "nature", "grece", "🌅", "Un croissant de falaises noires couronné de villages blancs, vestige d'une éruption colossale qui aurait englouti une civilisation — et peut-être inspiré le mythe de l'Atlantide.", ["santorin", "santorini"], ["🌋 L'éruption : vers 1600 av. J.-C., l'une des plus violentes de l'Histoire.", "🔵 Coupoles bleues et couchers de soleil à Oia."], "Week-end nature · Grèce", 1],
  ["Côte d'Émeraude", "nature", "france", "🏴‍☠️", "Une côte au nom de pierre précieuse, gardée par une cité corsaire fortifiée dont les habitants se disent « ni Français, ni Bretons »… et par les plus grandes marées d'Europe.", ["cotedemeraude", "lacotedemeraude", "saintmalo"], ["🏴‍☠️ La cité corsaire : Saint-Malo.", "💚 L'émeraude, c'est la couleur de sa mer."], "Week-end nature · Bretagne", 0],
];

const KIND_VOYAGE = {
  ville: Q("Ville ou campagne ?", "Pour ce week-end, le réveil sonnera plutôt sirènes et terrasses que chants d'oiseaux : musées, ruelles pavées et apéros en terrasse au programme.", "Plutôt…", ["ville", "laville", "enville", "citytrip", "encity", "city"], ["🏙️ Le contraire de la campagne.", "🥂 Terrasses, musées, métro."]),
  nature: Q("Ville ou campagne ?", "Pour ce week-end, oublie les klaxons : le réveil sera un chant d'oiseau, et le programme sentira l'herbe coupée, les kilomètres à pied et le feu de cheminée.", "Plutôt…", ["campagne", "lacampagne", "nature", "lanature", "vert", "auvert"], ["🌿 Le contraire de la ville.", "🥾 Chaussures de marche conseillées."]),
};

function buildVoyage(vg) {
  const [name, kind, country, emoji, destT, destA, destHs, sub, long] = vg;
  const C = COUNTRIES[country];
  const st = [];
  st.push(Q("La nature du cadeau", "Ton cadeau tient dans un sac de 48 heures : il commence un vendredi soir avec des étoiles dans les yeux et finit un dimanche avec des courbatures de bonheur et 400 photos.", "C'est un…", ["voyage", "unvoyage", "weekend", "unweekend", "escapade", "uneescapade", "sejour", "unsejour", "citytrip", "voyagesurprise"], ["🧳 Il faut préparer un petit sac.", "✈️ Ou un plein d'essence, selon la destination."]));
  st.push({ ...KIND_VOYAGE[kind], surprise: fakeSurprise("voyage") });
  st.push(Q("Quel pays ?", C.t, "Le pays…", C.a, C.hs));
  st.push({ ...Q("La destination", destT, "La destination…", destA, destHs), surprise: bonusSurprise(emoji, `la destination tient en un emoji : ${emoji}. Garde ça en tête.`) });
  if (long) {
    st.push(Q("Message intercepté", `${SENDER} a chiffré la destination avec le code de César : chaque lettre est décalée d'un cran (A→B, Z→A). Décode : ${caesar(destA[0])}`, "Le mot décodé…", destA, ["🔁 Recule chaque lettre d'un cran (B→A).", `🔡 Première lettre décodée : « ${destA[0][0].toUpperCase()} ».`]));
    st.push(initialsStage(name, "de la destination"));
  }
  st.push({ ...Q("Lettres en vrac", "La destination, passée au mixeur :", "La destination…", destA.concat([norm(name)]), [`${emoji} Repense à l'indice bonus.`, `🔤 ${norm(name).length} lettres en tout.`]), scramble: scramble(name) });
  st.push(codeStage(st.length + 1));
  return { stages: st, ticket: { sur: "Week-end surprise · 2 personnes", big: name.toUpperCase(), sub, emoji } };
}

/* Catalogue complet */
const CATALOG = [
  ...CONCERTS.map((c, i) => ({ id: `c${i}`, type: "concert", name: c[0], place: VENUES[c[3]].n, emoji: c[4], long: !!c[5], build: () => buildConcert(c) })),
  ...FIXTURES.map((f, i) => ({ id: `l${i}`, type: "ligue1", name: `${CLUBS[f[0]].n} – ${CLUBS[f[1]].n}`, place: `${CLUBS[f[0]].stade}${f[2] ? " · " + f[2] : ""}`, emoji: "⚽", long: !!f[3], build: () => buildLigue1(f) })),
  ...FESTIVALS.map((f, i) => ({ id: `f${i}`, type: "festival", name: f[0], place: f[6], emoji: f[2], long: false, build: () => buildFestival(f) })),
  ...VOYAGES.map((v, i) => ({ id: `v${i}`, type: "voyage", name: v[0], place: v[7], emoji: v[3], long: !!v[8], build: () => buildVoyage(v) })),
];

const ACCENTS = {
  concert: { a: "#FF2E92", b: "#FFB930" },
  ligue1: { a: "#3DDC6A", b: "#27E8E0" },
  festival: { a: "#FFB930", b: "#FF2E92" },
  voyage: { a: "#27E8E0", b: "#9B5CFF" },
};

/* ================= CONFETTI ================= */
const COLORS = ["#FF2E92", "#FFB930", "#27E8E0", "#9B5CFF", "#FFFFFF"];
function Confetti() {
  const pieces = Array.from({ length: 60 }, (_, i) => ({
    id: i, left: Math.random() * 100, delay: Math.random() * 1.6,
    duration: 2.6 + Math.random() * 2, size: 6 + Math.random() * 8,
    color: COLORS[i % COLORS.length], rotate: Math.random() * 360,
  }));
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-50">
      {pieces.map((p) => (
        <div key={p.id} style={{ position: "absolute", top: "-20px", left: `${p.left}%`, width: `${p.size}px`, height: `${p.size * 0.45}px`, backgroundColor: p.color, transform: `rotate(${p.rotate}deg)`, animation: `ag-fall ${p.duration}s linear ${p.delay}s infinite` }} />
      ))}
    </div>
  );
}

/* ================= MOTEUR DE JEU ================= */
function Game({ item, onBack }) {
  const [game] = useState(() => item.build());
  const stages = game.stages;
  const TOTAL = stages.length;
  const [step, setStep] = useState(-1);
  const [input, setInput] = useState("");
  const [shake, setShake] = useState(false);
  const [hintIdx, setHintIdx] = useState(0);
  const [flash, setFlash] = useState("");
  const [surprise, setSurprise] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const acc = ACCENTS[item.type];

  const progress = Math.max(0, Math.min(TOTAL, step)) / TOTAL;
  const stage = step >= 0 && step < TOTAL ? stages[step] : null;

  useEffect(() => {
    if (step === TOTAL) {
      const t = setTimeout(() => setRevealed(true), 900);
      return () => clearTimeout(t);
    }
  }, [step, TOTAL]);

  const goNext = () => { setFlash(""); setSurprise(null); setInput(""); setHintIdx(0); setStep((s) => s + 1); };

  const submit = () => {
    if (!stage) return;
    if (stage.a.includes(norm(input))) {
      setFlash("✅ Exact ! Le sceau se fissure…");
      setTimeout(() => { stage.surprise ? (setFlash(""), setSurprise(stage.surprise)) : goNext(); }, 1000);
    } else { setShake(true); setTimeout(() => setShake(false), 500); }
  };

  const grad = `linear-gradient(90deg,${acc.a},${acc.b})`;

  return (
    <div className="w-full max-w-md mx-auto">
      <button onClick={onBack} className="mb-4 text-sm underline" style={{ color: "#B68FE8" }}>← Retour au catalogue</button>
      <div className="mb-6">
        <div className="flex justify-between text-xs tracking-widest uppercase mb-2" style={{ color: "#B68FE8" }}>
          <span>Air Gift · de la part de {SENDER}</span>
          <span>{Math.round(progress * 100)}% déballé</span>
        </div>
        <div className="h-2 rounded-full" style={{ background: "#3a1463" }}>
          <div className="h-2 rounded-full transition-all duration-700" style={{ width: `${Math.max(progress * 100, 4)}%`, background: grad }} />
        </div>
      </div>

      {step === -1 && (
        <div className="text-center ag-pop">
          <div className="mx-auto mb-6 flex items-center justify-center rounded-full ag-glow" style={{ width: 120, height: 120, background: `linear-gradient(135deg,${acc.a},#9B5CFF)`, fontSize: 52 }}>🎁</div>
          <h1 className="text-2xl font-bold mb-3">{RECIPIENT}, {SENDER} t'a envoyé un Air Gift</h1>
          <p className="mb-8 leading-relaxed" style={{ color: "#D9C5F2" }}>« Tu ne devineras jamais ce que c'est. {TOTAL} énigmes te séparent de ton cadeau. 😏 »</p>
          <button onClick={() => setStep(0)} className="w-full py-4 rounded-2xl text-lg font-bold transition-transform active:scale-95" style={{ background: grad, color: "#1c0533" }}>Commencer le déballage</button>
        </div>
      )}

      {surprise && (
        <div className="text-center ag-pop">
          <div className="rounded-3xl p-8" style={{ background: "rgba(255,185,48,0.1)", border: "1.5px solid #FFB930" }}>
            <div className="mb-4" style={{ fontSize: 60 }}>{surprise.emoji}</div>
            <h2 className="text-2xl font-bold mb-3" style={{ color: "#FFB930" }}>{surprise.title}</h2>
            <p className="leading-relaxed mb-6" style={{ color: "#D9C5F2" }}>{surprise.text}</p>
            <button onClick={goNext} className="w-full py-3 rounded-xl font-bold text-lg active:scale-95 transition-transform" style={{ background: grad, color: "#1c0533" }}>{surprise.button}</button>
          </div>
        </div>
      )}

      {stage && !surprise && (
        <div className={`ag-pop ${shake ? "ag-shake" : ""}`} key={step}>
          <div className="rounded-3xl p-6" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(182,143,232,0.35)" }}>
            <p className="text-xs tracking-widest uppercase mb-3" style={{ color: acc.b }}>Énigme {step + 1} / {TOTAL}</p>
            <h2 className="text-2xl font-bold mb-3">{stage.title}</h2>
            <p className="leading-relaxed mb-4" style={{ color: "#D9C5F2" }}>{stage.text}</p>

            {stage.scramble && (
              <div className="flex justify-center gap-1 mb-5 flex-wrap">
                {stage.scramble.split("").map((c, i) =>
                  c === " " ? <div key={i} className="w-3" /> : (
                    <div key={i} className="flex items-center justify-center rounded-lg font-bold" style={{ width: 30, height: 38, background: "#3a1463", color: "#27E8E0", border: "1px solid #5b2a96" }}>{c}</div>
                  ))}
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
              <button onClick={submit} className="w-full py-3 rounded-xl font-bold text-lg active:scale-95 transition-transform" style={{ background: grad, color: "#1c0533" }}>Valider</button>
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
              <p className="text-xs tracking-widest uppercase mb-3" style={{ color: acc.b }}>{RECIPIENT}, ton cadeau est…</p>
              <div className="rounded-3xl overflow-hidden text-left ag-glow mb-5" style={{ background: `linear-gradient(135deg,${acc.a} 0%,#9B5CFF 60%,${acc.b} 140%)` }}>
                <div className="p-6 pb-4">
                  <p className="text-xs tracking-widest uppercase" style={{ color: "#FFE3F2" }}>{game.ticket.sur}</p>
                  <h2 className="text-3xl font-extrabold leading-tight" style={{ color: "#FFF" }}>{game.ticket.emoji} {game.ticket.big}</h2>
                  <p className="font-semibold mt-1" style={{ color: "#1c0533" }}>{game.ticket.sub}</p>
                </div>
                <div className="flex justify-between items-center px-6 py-4" style={{ background: "rgba(12,1,24,0.85)", borderTop: "2px dashed rgba(255,255,255,0.5)" }}>
                  <div><p className="text-xs" style={{ color: "#B68FE8" }}>Places</p><p className="font-bold text-lg">2 × Carré Or</p></div>
                  <div className="text-right"><p className="text-xs" style={{ color: "#B68FE8" }}>Avec</p><p className="font-bold text-lg">{SENDER} ❤️</p></div>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="flex-1 py-3 rounded-xl font-bold active:scale-95 transition-transform" style={{ background: grad, color: "#1c0533" }}>Voir mes billets</button>
                <button className="flex-1 py-3 rounded-xl font-bold active:scale-95 transition-transform" style={{ background: "rgba(255,255,255,0.1)", border: "1px solid #5b2a96", color: "#FFF" }}>📹 Partager</button>
              </div>
              <button onClick={onBack} className="mt-5 text-sm underline" style={{ color: "#B68FE8" }}>← Tester un autre événement</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ================= HOMEPAGE / CATALOGUE ================= */
const FILTERS = [
  { k: "tous", label: "Tous" },
  { k: "concert", label: "🎤 Concerts" },
  { k: "ligue1", label: "⚽ Ligue 1" },
  { k: "festival", label: "🎪 Festivals" },
  { k: "voyage", label: "✈️ Voyages" },
];

export default function AirGiftTestBench() {
  const [current, setCurrent] = useState(null);
  const [filter, setFilter] = useState("tous");
  const [search, setSearch] = useState("");

  const list = CATALOG.filter(
    (e) => (filter === "tous" || e.type === filter) && (search === "" || norm(e.name + e.place).includes(norm(search)))
  );

  return (
    <div className="min-h-screen w-full px-4 py-8" style={{ background: "radial-gradient(120% 90% at 50% 0%, #2b0a4e 0%, #160428 55%, #0b0118 100%)", fontFamily: "'Trebuchet MS','Segoe UI',sans-serif", color: "#FDF6FF" }}>
      <style>{`
        @keyframes ag-fall { 0% { transform: translateY(-5vh) rotate(0deg); opacity: 1; } 100% { transform: translateY(110vh) rotate(720deg); opacity: .8; } }
        @keyframes ag-shake { 0%,100%{transform:translateX(0)} 20%{transform:translateX(-8px)} 40%{transform:translateX(8px)} 60%{transform:translateX(-5px)} 80%{transform:translateX(5px)} }
        @keyframes ag-pop { 0%{transform:scale(.6);opacity:0} 70%{transform:scale(1.06)} 100%{transform:scale(1);opacity:1} }
        @keyframes ag-glow { 0%,100%{box-shadow:0 0 24px rgba(255,46,146,.35)} 50%{box-shadow:0 0 48px rgba(255,46,146,.7)} }
        @media (prefers-reduced-motion: reduce){ *{animation:none!important;transition:none!important} }
        .ag-shake{animation:ag-shake .45s ease}
        .ag-pop{animation:ag-pop .6s cubic-bezier(.2,1.4,.4,1) both}
        .ag-glow{animation:ag-glow 2.4s ease-in-out infinite}
      `}</style>

      {current ? (
        <Game item={current} onBack={() => setCurrent(null)} />
      ) : (
        <div className="w-full max-w-md mx-auto">
          <p className="text-xs tracking-widest uppercase mb-1" style={{ color: "#B68FE8" }}>Air Gifts · Banc de test</p>
          <h1 className="text-3xl font-bold mb-1">Catalogue des expériences</h1>
          <p className="text-sm mb-5" style={{ color: "#D9C5F2" }}>
            {CATALOG.length} événements de démo · jeux générés automatiquement · destinataire : {RECIPIENT}, de la part de {SENDER}.
          </p>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
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
                style={filter === f.k
                  ? { background: "linear-gradient(90deg,#FF2E92,#FFB930)", color: "#1c0533" }
                  : { background: "rgba(255,255,255,0.07)", border: "1px solid #5b2a96", color: "#D9C5F2" }}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="space-y-2 pb-10">
            {list.map((e) => {
              const built = e.build();
              const interactions = built.stages.length + built.stages.filter((s) => s.surprise).length;
              return (
                <button
                  key={e.id}
                  onClick={() => setCurrent(e)}
                  className="w-full text-left rounded-2xl p-4 flex items-center gap-3 transition-transform active:scale-[0.98]"
                  style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(182,143,232,0.3)" }}
                >
                  <div className="flex items-center justify-center rounded-xl shrink-0" style={{ width: 44, height: 44, fontSize: 24, background: "#3a1463" }}>{e.emoji}</div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold truncate">{e.name}</p>
                    <p className="text-xs truncate" style={{ color: "#B68FE8" }}>{e.place}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs px-2 py-1 rounded-full font-semibold" style={e.long ? { background: "rgba(255,185,48,0.15)", color: "#FFB930", border: "1px solid #FFB930" } : { background: "rgba(39,232,224,0.1)", color: "#27E8E0", border: "1px solid rgba(39,232,224,0.4)" }}>
                      {interactions} étapes{e.long ? " · long" : ""}
                    </span>
                  </div>
                </button>
              );
            })}
            {list.length === 0 && (
              <p className="text-center py-8" style={{ color: "#B68FE8" }}>Aucun événement ne correspond. Essaie un autre mot-clé ou un autre filtre.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
