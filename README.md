# Air Gifts 🎁

**Le papier cadeau dématérialisé.** L'offreur scelle un cadeau derrière une série d'énigmes personnalisées ; le gifté doit les résoudre pour découvrir progressivement l'univers du cadeau, jusqu'à la révélation finale.

## Concept

- **100% digital** : billets, cartes cadeaux, annonces, voyages — scellés dans l'app, révélés après le jeu.
- **QR retail** : carte/sticker QR vierge vendu en caisse (~0,50–2 €), activé via l'app par l'acheteur, scanné par le gifté.
- **Cadenas optionnel (phase 2)** : cadenas 3 chiffres + câble universel ; le code final du jeu ouvre le cadeau physique (bouteille, boîte, placard).

## Démos (`/demos`)

| Fichier | Contenu |
|---|---|
| `air-gift-demo.jsx` | Expérience gifté : concert Bad Bunny, 5 énigmes + surprises |
| `air-gift-demo-celine.jsx` | Même moteur, re-skin Céline Dion (thème or/glace) |
| `air-gift-catalogue.jsx` | Banc de test : 134 événements (concerts, Ligue 1, festivals, voyages), jeux générés par templates, indices progressifs, chiffre de César, anagrammes |

Les démos sont des composants React autonomes (Tailwind core), pensés mobile-first.

## Architecture cible (MVP)

- **Gifté** : web app sans installation (lien ou QR) — friction zéro.
- **Offreur** : app/web, création d'expérience, personnalisation par 3-4 questions → génération LLM des énigmes (API Anthropic), multilingue par construction.
- **Backend** : scellement du cadeau (le contenu n'est révélé qu'à la dernière énigme), QR vierges activables, paiement à l'acte (2–4 € standard, 6–10 € premium).

## Validation marché

Avant de coder l'app complète : landing page + 50 expériences vendues à la main.
