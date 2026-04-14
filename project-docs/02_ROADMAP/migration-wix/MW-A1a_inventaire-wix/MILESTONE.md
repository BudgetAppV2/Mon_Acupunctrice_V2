# Milestone MW-A1a : Inventaire Wix complet + export contenu éditorial

**Type** : Prep
**Vague** : 0
**Priorité** : Critical
**Temps estimé Claude Code** : 2-3h
**Dépendances** : Aucune
**Status** : 🔴 Not started

**Note de découpage** : ce milestone était initialement `MW-A1` et incluait aussi le rapatriement des assets v4. Il a été découpé en `MW-A1a` (inventaire Wix, ce fichier) et `MW-A1b` (assets v4, dans `MW-A1b_assets-v4/`). Voir `project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/NOTES_PREPA.md` pour la justification du découpage.

---

## Objectif

Récupérer 100 % du contenu éditorial exploitable du site Wix (`acupuncturejudith.ca`) — articles de blog (Ricos JSON), pages statiques, FAQ, images inline — pour alimenter les milestones d'import (MW-B4, MW-D1, MW-D3) et la matrice de redirections 301 du lancement (MW-G2).

---

## Contexte minimal

Le site Wix actuel contient 27 URLs indexables (8 pages statiques, 11 articles de blog, 6 FAQ, 2 pages utilitaires). Le SEO à préserver est quasi-nul (aucune position organique significative sauf un article nausées ~position 6), mais le contenu éditorial — surtout les 11 articles co-écrits avec Claire Thomas — est un actif à migrer tel quel.

---

## Livrables

- [ ] **Matrice de redirections 301** — mapping complet de chaque URL Wix vers sa future URL Next.js (`/bienfaits` → redistribué dans `/faq/*`, `/contact` → `/contact`, etc.), avec attention particulière au backlink `lasourceensoi.com/equipe/judith-dufour-savard/`
- [ ] **Export des 11 articles de blog** — contenu Ricos JSON récupéré via API Wix `/blog/v3/posts/{postId}`, métadonnées extraites (titre, date, catégorie, extrait, cover, co-auteur Claire Thomas), images téléchargées en version originale
- [ ] **Export des 8 pages statiques Wix** — texte brut, structure des titres, images associées
- [ ] **Export des 6 FAQ Wix** — question + réponse complètes
- [ ] **Inventaire des images articles Wix** (30-60 estimées) — URLs originales, noms cohérents, classement par article, téléchargement local dans `artefacts/images/`

---

## Approche technique

**Export blog Wix** : utiliser l'API Wix Blog v3 existante (credentials dans `.env.local`, endpoints déjà dans `app/api/blog/`). Pour chaque article :
1. `GET /blog/v3/posts/{postId}` avec `fieldsets: GENERATED_RICH_CONTENT` pour obtenir le Ricos JSON complet
2. Extraire les métadonnées (title, excerpt, publishedDate, coverImage, categories)
3. Sauvegarder le Ricos JSON brut dans `artefacts/blog-ricos/`
4. Télécharger les images inline et cover en résolution originale dans `artefacts/images/blog/`

**Export pages statiques** : crawl via fetch des 8 URLs connues, extraction du DOM côté serveur (le rendu Wix Thunderbolt est client-side, mais le contenu textuel est récupérable via l'API ou en parsant le JSON initial).

**Export FAQ Wix** : les 6 FAQ dynamiques sont probablement stockées dans l'application Wix FAQ — récupérer via l'API Wix si disponible, sinon extraction manuelle du DOM.

**Matrice de redirections** : document markdown avec table `| URL Wix | URL Next.js | Type (301/410) | Notes |`. Les redirections seront implémentées plus tard dans `next.config.ts` ou via `vercel.json`.

---

## Fichiers impactés

```
📄 NEW (artefacts produits — aucune modification du code repo) :
- MW-A1a_inventaire-wix/artefacts/redirections-301.md
- MW-A1a_inventaire-wix/artefacts/blog-ricos/ (11 fichiers JSON)
- MW-A1a_inventaire-wix/artefacts/pages-statiques/ (8 fichiers .md)
- MW-A1a_inventaire-wix/artefacts/faq-wix/ (6 fichiers .md)
- MW-A1a_inventaire-wix/artefacts/images/blog/ (index + images téléchargées)
- MW-A1a_inventaire-wix/NOTES.md
```

**Aucune modification du code source de l'app** (`app/`, `components/`, `lib/`, `public/`). Tout vit dans `project-docs/02_ROADMAP/migration-wix/MW-A1a_inventaire-wix/artefacts/`.

---

## Definition of Done

- [ ] Les 11 articles de blog Wix sont exportés en Ricos JSON avec leurs images — vérifiable en ouvrant un fichier JSON et en voyant le contenu structuré
- [ ] Les 8 pages statiques sont exportées en markdown lisible
- [ ] Les 6 FAQ sont exportées avec question + réponse complètes
- [ ] La matrice de redirections 301 couvre toutes les URLs indexables du sitemap Wix + le backlink `lasourceensoi.com/equipe/judith-dufour-savard/`
- [ ] Les images inline des articles sont téléchargées et indexées
- [ ] `git diff` ne montre **aucune modification** dans `app/`, `components/`, `lib/`, `public/`
- [ ] `NOTES.md` créé avec le journal d'exécution, + 2-3 lignes sur les articles les plus intéressants trouvés

---

## Tests requis

- **Validation contenu blog** : ouvrir 2-3 fichiers Ricos JSON et vérifier qu'ils contiennent le contenu attendu (titres, paragraphes, images inline)
- **Validation images** : vérifier que les images téléchargées s'ouvrent correctement et sont en résolution exploitable
- **Validation matrice** : vérifier que chaque URL du sitemap Wix a une correspondance dans la matrice

---

## Contraintes

- Ne pas modifier le code du Hub admin (`app/(app)/`, `app/(auth)/`)
- Ne pas pousser le contenu dans Firestore — c'est le travail de MW-B4 et MW-D1/D3
- Ne pas réécrire ou "améliorer" les articles de Claire Thomas — export fidèle uniquement
- Ne pas supprimer ou modifier quoi que ce soit sur le site Wix en production
- **Ne pas toucher aux assets v4** (photos Eric Bates, SVG, textures) — c'est le scope de MW-A1b
- **Ne pas toucher aux 5 ressources + 6 FAQ dans `scripts/seo-geo/`** — c'est MW-D3 qui les importera dans Firestore
- Ne pas installer de nouvelle dépendance npm

---

## Références

- Plan stratégique §1.1 (situation actuelle Wix), Mission 1 (§10)
- CLAUDE.md migration — section "Contenu existant à réutiliser"
- API Wix Blog existante dans `app/api/blog/list/` et `app/api/blog/carousel/`
- Credentials dans `.env.local`
- NOTES_PREPA.md voisin pour le contexte du découpage A1a/A1b

---

## Notes de planification

- L'API Wix Blog v3 retourne le Ricos JSON via le fieldset `GENERATED_RICH_CONTENT`. Le parser Ricos → markdown sera écrit en MW-B4 — ici on stocke juste le JSON brut.
- La page `/bienfaits` de Wix contient du contenu FAQ qui sera redistribué dans les FAQ par pilier (décision plan §4.1). La matrice de redirections doit le documenter.
- Les credentials Wix API sont déjà dans `.env.local` — vérifier qu'ils sont toujours valides avant de lancer.
- **Contenu bonus déjà dans le repo** : les 5 ressources dans `scripts/seo-geo/source-resources/` et les 6 FAQ dans `scripts/seo-geo/source/` sont **déjà disponibles**. Ce milestone **ne s'en occupe pas** — c'est MW-D3 qui les importera dans Firestore. MW-A1a se concentre uniquement sur l'inventaire Wix.
