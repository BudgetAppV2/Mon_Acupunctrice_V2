# Milestone MW-A1 : Inventaire Wix complet + rapatriement assets v4

**Type** : Prep
**Vague** : 0
**Priorité** : Critical
**Temps estimé Claude Code** : 3-4h
**Dépendances** : Aucune
**Status** : 🔴 Not started

---

## Objectif

Récupérer 100 % du contenu exploitable du site Wix (`acupuncturejudith.ca`) — articles de blog, pages statiques, FAQ, images — et rapatrier les assets de la maquette v4 dans le repo, pour alimenter les milestones d'import et de build.

---

## Contexte minimal

Le site Wix actuel contient 27 URLs indexables (8 pages statiques, 11 articles de blog, 6 FAQ, 2 pages utilitaires). Le SEO à préserver est quasi-nul (aucune position organique significative sauf un article nausées ~position 6), mais le contenu éditorial — surtout les 11 articles co-écrits avec Claire Thomas — est un actif à migrer tel quel. Les assets visuels de la maquette `homepage-v4.html` (photos Eric Bates, SVG Freepik, textures papier) doivent aussi être rapatriés dans le repo car ils servent de base au design system de toute la migration.

---

## Livrables

- [ ] **Matrice de redirections 301** — mapping complet de chaque URL Wix vers sa future URL Next.js (`/bienfaits` → redistribué dans `/faq/*`, `/contact` → `/contact`, etc.), avec attention particulière au backlink `lasourceensoi.com/equipe/judith-dufour-savard/`
- [ ] **Export des 11 articles de blog** — contenu Ricos JSON récupéré via API Wix `/blog/v3/posts/{postId}`, métadonnées extraites (titre, date, catégorie, extrait, cover, co-auteur Claire Thomas), images téléchargées en version originale
- [ ] **Export des 8 pages statiques + 6 FAQ Wix** — texte brut, structure des titres, images associées
- [ ] **Inventaire des images** (30-60 estimées) — URLs originales, noms cohérents, classement par page/article, téléchargement local
- [ ] **Rapatriement des assets v4** — photos Eric Bates Images depuis `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/assets/photos_Judith/Croped/` vers `public/site/judith/`, SVG Freepik vers `public/site/decorations/`, textures papier vers `public/site/textures/`

---

## Approche technique

**Export blog Wix** : utiliser l'API Wix Blog v3 existante (credentials dans `.env.local`, endpoints déjà dans `app/api/blog/`). Pour chaque article :
1. `GET /blog/v3/posts/{postId}` avec `fieldsets: GENERATED_RICH_CONTENT` pour obtenir le Ricos JSON complet
2. Extraire les métadonnées (title, excerpt, publishedDate, coverImage, categories)
3. Sauvegarder le Ricos JSON brut dans `artefacts/blog-ricos/`
4. Télécharger les images inline et cover en résolution originale

**Export pages statiques** : crawl via fetch des 8 URLs connues, extraction du DOM côté serveur (le rendu Wix Thunderbolt est client-side, mais le contenu textuel est récupérable via l'API ou en parsant le JSON initial).

**Export FAQ Wix** : les 6 FAQ dynamiques sont probablement stockées dans l'application Wix FAQ — récupérer via l'API Wix si disponible, sinon extraction manuelle du DOM.

**Matrice de redirections** : document markdown avec table `| URL Wix | URL Next.js | Notes |`. Les redirections seront implémentées plus tard dans `next.config.ts` ou via `vercel.json`.

**Rapatriement assets v4** : copie depuis le filesystem local vers le repo. Les photos Eric Bates sont l'actif visuel central du site — 8 portraits haute résolution. Les SVG et textures sont des fichiers statiques légers.

---

## Fichiers impactés

```
📄 NEW (artefacts produits) :
- MW-A1_inventaire-wix/artefacts/redirections-301.md
- MW-A1_inventaire-wix/artefacts/blog-ricos/ (11 fichiers JSON)
- MW-A1_inventaire-wix/artefacts/pages-statiques/ (8 fichiers .md)
- MW-A1_inventaire-wix/artefacts/faq-wix/ (6 fichiers .md)
- MW-A1_inventaire-wix/artefacts/images/ (index + images téléchargées)

📄 NEW (assets rapatriés dans le repo) :
- public/site/judith/ (8 photos Eric Bates)
- public/site/decorations/ (~5 SVG Freepik)
- public/site/textures/ (2 textures papier japonais)
```

---

## Definition of Done

- [ ] Les 11 articles de blog Wix sont exportés en Ricos JSON avec leurs images — vérifiable en ouvrant un fichier JSON et en voyant le contenu structuré
- [ ] Les 8 pages statiques sont exportées en markdown lisible
- [ ] Les 6 FAQ sont exportées avec question + réponse complètes
- [ ] La matrice de redirections 301 couvre toutes les URLs indexables du sitemap Wix
- [ ] Les 8 photos Eric Bates sont présentes dans `public/site/judith/` et visibles dans le repo
- [ ] Les SVG et textures sont présents dans `public/site/decorations/` et `public/site/textures/`
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Validation contenu** : ouvrir 2-3 fichiers Ricos JSON et vérifier qu'ils contiennent le contenu attendu (titres, paragraphes, images inline)
- **Validation images** : vérifier que les images téléchargées s'ouvrent correctement et sont en résolution exploitable
- **Validation matrice** : vérifier que chaque URL du sitemap Wix a une correspondance dans la matrice
- **Validation assets v4** : vérifier que les 8 photos, les SVG et les textures sont au bon emplacement dans le repo

---

## Contraintes

- Ne pas modifier le code du Hub admin (`app/(app)/`, `app/(auth)/`)
- Ne pas pousser le contenu dans Firestore — c'est le travail de MW-B4 et MW-D1/D3
- Ne pas réécrire ou "améliorer" les articles de Claire Thomas — export fidèle uniquement
- Ne pas supprimer ou modifier quoi que ce soit sur le site Wix en production
- **Droits photos Eric Bates vérifiés (14 avril 2026)** : contrat professionnel payé, les photos appartiennent à Judith. OK pour commit dans le repo et déploiement Vercel. Voir `docs/migration-wix/DECISIONS_Q1-Q16.md`.

---

## Références

- Plan stratégique §1.1 (situation actuelle Wix), §4.6.4 (assets à migrer), Mission 1 (§10)
- CLAUDE.md migration — section "Contenu existant à réutiliser"
- API Wix Blog existante dans `app/api/blog/list/` et `app/api/blog/carousel/`
- Maquette v4 : `~/Documents/Judith_SEO_GEO/05_maquettes/nouveau-site/homepage-v4.html`

---

## Notes de planification

- L'API Wix Blog v3 retourne le Ricos JSON via le fieldset `GENERATED_RICH_CONTENT`. Le parser Ricos → markdown sera écrit en MW-B4 — ici on stocke juste le JSON brut.
- La page `/bienfaits` de Wix contient du contenu FAQ qui sera redistribué dans les FAQ par pilier (décision plan §4.1). La matrice de redirections doit le documenter.
- **Droits photos Eric Bates : RÉSOLU** — contrat professionnel, Judith est propriétaire des images. Pas de restriction pour usage repo/Vercel/Firebase Storage. Voir `docs/migration-wix/DECISIONS_Q1-Q16.md`.
- Les credentials Wix API sont déjà dans `.env.local` — vérifier qu'ils sont toujours valides avant de lancer.
- **Contenu bonus découvert le 14 avril** : les 5 ressources dans `scripts/seo-geo/source-resources/` et les 6 FAQ dans `scripts/seo-geo/source/` sont **déjà dans le repo**. Ce milestone **ne s'en occupe pas** — c'est MW-D3 qui les importera dans Firestore. MW-A1 se concentre uniquement sur l'inventaire Wix et les assets de la maquette v4.
