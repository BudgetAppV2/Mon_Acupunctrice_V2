# VISION FINALE — Mon Acupunctrice Hub V2
*Version 2.0 — Mars 2026*
*Document fondateur — ne pas modifier sans discussion*

---

## L'objectif en une phrase

> Judith filme, monte, et publie du contenu professionnel
> en moins de 15 minutes. Elle le fait chaque semaine.
> Sans aide externe. Sans friction.

---

## Mesure de succès absolue

> **Ce produit est réussi uniquement si Judith l'utilise réellement chaque semaine.**
> Toute décision technique et produit doit servir cet objectif.

---

## Deuxième objectif

> Faire grandir la présence Instagram de Judith
> et augmenter le trafic vers son site Wix.

---

## Qui est Judith

Judith est acupunctrice solo à Montréal.
Elle crée du contenu éducatif sur l'acupuncture, la fertilité,
la grossesse et le bien-être en médecine traditionnelle chinoise.

Elle n'est pas développeuse.
Elle n'a pas de budget marketing.
Elle a du talent, des idées, et peu de temps.
Elle filme probablement en batch le mercredi.
Elle publie régulièrement sur Instagram pour attirer des clients.

Ce produit est son infrastructure créative complète.

---

## Son workflow réel

### La semaine de Judith

**Lundi–Mardi — Idéation**
Elle note ses idées quand elles viennent.
Dans l'app, depuis son iPhone, en 30 secondes par idée.

**Mercredi — Batch filming**
Elle filme 3-4 vidéos d'un coup.
L'app lui montre ses idées préparées, elle coche au fur et à mesure.

**Mercredi soir / Jeudi — Montage**
Elle monte ses vidéos dans l'éditeur.
Elle ajoute des sous-titres, de la musique, des textes graphiques.
Elle planifie la publication pour les prochains jours.

**Automatique — Publication**
L'app publie aux heures planifiées.
Elle n'a rien à faire.

---

## Ce que le produit fait — Les 4 piliers

### Pilier 1 — Organiser (Banque d'idées)
Capturer les idées rapidement.
Les organiser par catégorie et statut.
Préparer les sessions de tournage.

### Pilier 2 — Produire (Éditeur vidéo pro)
**C'est le coeur du produit. Pas un afterthought.**

Un éditeur CapCut-level avec une UI Instagram-style :
- Timeline multi-track (vidéo + audio + texte + effets)
- Filtres vidéo (style Instagram — 9+ presets)
- Texte overlay graphique (30+ polices, effets, animations d'entrée)
- Sous-titres automatiques (Whisper, style TikTok)
- Bibliothèque musicale (Jamendo, libre de droits)
- Stickers et éléments graphiques
- Export MP4 haute qualité (9:16 vertical pour Reels)

### Pilier 3 — Planifier (Calendrier éditorial)
Vue mensuelle claire.
Voir l'état de chaque contenu (idée → publié).
Assigner des dates et heures de publication.
Cliquer sur un item → détail + accès éditeur.

### Pilier 4 — Publier (Distribution)
Publication Instagram en 1 clic.
Caption générée par IA, éditable.
Scheduler automatique (publie sans que Judith soit là).
Historique des publications.

---

## Ce que le produit ne fait pas

- Il ne génère pas de scripts ou de contenu à sa place
- Il ne décide pas pour elle quoi publier
- Il ne la noie pas de notifications
- Il n'est pas un outil de collaboration d'équipe
- Il n'optimise pas automatiquement pour l'algorithme

---

## L'expérience cible

### Mercredi matin — Judith ouvre l'app

Elle voit son calendrier : 2 Reels planifiés cette semaine, 4 idées prêtes.
Elle ouvre la vue Blitz : ses 4 idées sont listées pour le tournage.
Elle filme les 4 en 45 minutes.

### Mercredi soir — Montage

Elle ouvre la première vidéo dans l'éditeur.
Timeline visible : vidéo, audio, textes, sous-titres.
Elle trim en 30 secondes.
Elle choisit un filtre → Lumineux.
Elle ajoute un texte en Bebas Neue, animation slide-up.
Les sous-titres sont générés automatiquement — elle corrige 2 mots.
Elle ajoute une musique zen de la bibliothèque.
Export en 2 minutes.
Elle planifie pour vendredi 18h.

### Automatique — Vendredi 18h

L'app publie sur Instagram.
La caption est déjà rédigée et validée.
Judith est avec un patient.

### Résultat sur 3 mois

3 Reels par semaine. Constance.
Sa présence grandit organiquement.
Son site Wix reçoit du trafic depuis ses bio links.
Elle prend plus de rendez-vous.

---

## Principes de design produit

1. **Zéro friction** — chaque clic inutile est un ennemi
2. **L'humain crée, le système produit** — l'éditeur fait le travail lourd
3. **Mobile first absolu** — tout pensé pour iPhone
4. **Simple à apprendre, puissant à utiliser** — comme CapCut
5. **Silence intentionnel** — ne pas parler si on n'a rien d'utile à dire
6. **PWA standalone** — plein écran, comme une vraie app

---

## Stack technique

```
Frontend   : Next.js 15 App Router + TypeScript
Styling    : Tailwind CSS + Heroicons
State      : Zustand
Auth       : Firebase Auth (Google Sign-In, session persistante)
Database   : Firebase Firestore
Storage    : Firebase Storage
Functions  : Firebase Cloud Functions
Deployment : Vercel
PWA        : next-pwa (manifest + service worker)
```
