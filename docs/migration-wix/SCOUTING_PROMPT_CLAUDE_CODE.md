# Mission Claude Code — Scouting Phase 1 : Migration Wix → Vercel

**Projet** : acupuncturejudith.ca v2 (migration Wix → Next.js / Vercel, intégration dans Mon Acupunctrice Hub V2)
**Phase** : Scouting en éclaireur, avant le vrai travail
**Repo** : `~/Desktop/Mon_Acupunctrice_V2/`
**Branche de travail** : `feature/site-public-migration`
**Temps-boîte** : 2 à 3 heures maximum total
**Livrables** : 7 fichiers markdown dans `docs/migration-wix/02-recherche/scouting/`

---

## Contexte

Tu es Claude Code sur la machine de Benoit Archambault. Benoit prépare une migration du site Wix de sa conjointe Judith (acupuncturejudith.ca) vers une section publique du projet Next.js existant **Mon Acupunctrice Hub V2**.

Une stratégie détaillée a été rédigée en session Claude Desktop et se trouve dans :

```
~/Desktop/Mon_Acupunctrice_V2/docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO.md
```

**Avant toute action, lis ce document en entier.** Il contient l'architecture proposée, les 3 piliers (fertilité, grossesse, acupuncture sociale), la stratégie GEO capitalisant sur la clinique La Source en Soi, la structure de maillage interne hub-and-spoke, et plein de détails contextuels.

**Ton rôle** : faire une passe de scouting rapide pour valider/invalider les hypothèses du plan et dégrossir les inconnues avant qu'on lance les vraies missions de build.

**Ce que tu n'es PAS supposé faire** : exécuter les missions en profondeur, produire du code, créer des routes, modifier le schéma Firestore, installer des dépendances. Tu observes, tu rapportes, tu recommandes.

---

## Setup initial

1. **Basculer sur la branche de travail**
   ```bash
   cd ~/Desktop/Mon_Acupunctrice_V2
   git status  # vérifier qu'il n'y a pas de changements non commitées
   git checkout -b feature/site-public-migration  # ou git checkout feature/site-public-migration si déjà existante
   ```

2. **Créer la structure de dossier `docs/migration-wix/`** dans le repo si elle n'existe pas :
   ```
   docs/migration-wix/
   ├── 01-strategie/
   │   └── PLAN_EDITORIAL_SEO_GEO.md     (placé par Benoit)
   ├── 02-recherche/
   │   └── scouting/                      (tes 7 rapports vont ici)
   ├── 03-architecture/                   (vide pour l'instant)
   ├── 04-contenu/                        (vide pour l'instant)
   └── 05-build/                          (vide pour l'instant)
   ```

3. **Vérifier la présence du plan stratégique** dans `01-strategie/`. S'il n'y est pas, demander à Benoit de le placer avant de continuer (ne pas essayer de le reconstruire).

4. **Lire `PLAN_EDITORIAL_SEO_GEO.md` en entier** avant d'attaquer les rapports. C'est non-négociable.

---

## Livrables : 6 rapports de scouting + 1 synthèse finale

Chaque rapport doit faire **1 à 3 pages maximum**, suivre le template commun (voir plus bas), et pointer les observations qui ont un impact réel sur le plan.

Tu n'es PAS censé produire des rapports exhaustifs — tu es censé faire 15 à 30 minutes d'investigation par zone et synthétiser ce que tu vois. Si une zone demande plus de travail, notes-le dans les recommandations de la synthèse finale au lieu de le faire toi-même.

### Rapport 1 — `scout-wix-actuel.md`

**Objectif** : estimer la taille et la qualité du contenu actuel sur acupuncturejudith.ca.

**À investiguer** :
- Combien de pages environ existent sur le site (lecture du sitemap.xml, crawl léger)
- Combien d'articles de blog (approximatif, pas besoin d'une liste complète)
- Plateforme de blog Wix utilisée (Wix Blog classique ? Ricos ?)
- Qualité apparente du contenu sur 3-5 pages échantillonnées seulement : vaut-il la peine d'être migré tel quel, réécrit, ou jeté ?
- Présence actuelle de schema.org, meta tags, sitemap
- Charge de travail estimée pour un inventaire complet plus tard (en heures)

**Méthode** : lecture du sitemap, crawl léger, échantillon de 3-5 pages maximum. Pas d'extraction complète — c'est du scouting.

### Rapport 2 — `scout-mots-cles.md`

**Objectif** : valider ou invalider les hypothèses de mots-clés de la section 3.2 du plan.

**À investiguer** :
- Est-ce que "acupuncture fertilité Montréal", "acupuncture grossesse Rosemont" ont du volume réel de recherche ?
- Top 3 résultats Google Canada actuels pour 5-8 requêtes clés
- Le terme "acupuncture sociale" est-il réellement utilisé en recherche, ou faut-il trouver une autre formulation (tarif solidaire, échelle mobile, accessible) ?
- "People Also Ask" révélateurs sur 3-4 requêtes importantes
- Signaux Reddit / forums FR (r/Quebec, r/montreal, Mamanpourlavie) sur les thèmes des piliers

**Méthode** : Exa search + recherches web ciblées, ~10-15 requêtes max.

**À NE PAS faire** : bâtir le corpus complet de 30-50 mots-clés par pilier (c'est la vraie Mission 2 future, pas le scouting).

### Rapport 3 — `scout-concurrence.md`

**Objectif** : photo rapide du paysage concurrentiel montréalais.

**À investiguer** :
- 5-8 acupuncteurs visibles à Montréal, focus est / Rosemont / Plateau
- Y a-t-il des concurrents qui pratiquent une **tarification solidaire** ou approche sociale similaire ? (critique pour valider la différenciation "acupuncture sociale")
- Qualité SEO apparente (sites Wix basiques ou vraiment optimisés)
- Présence et qualité de contenu FAQ / ressources chez les concurrents
- Trous évidents dans le marché

**Méthode** : recherches Google "acupuncture Montréal", Google Maps, visite rapide de 5-8 sites.

### Rapport 4 — `scout-geo-local.md`

**Important** : la stratégie GEO est radicalement différente de l'audit GBP habituel. **Lis la section 8 du plan avant d'attaquer.** Judith n'a PAS de GBP en propre — on capitalise sur celui de **La Source en Soi**.

**À investiguer** :
- État de la fiche Google Business Profile de **La Source en Soi** : existence, vérification, avis, note, photos, posts
- Judith est-elle listée comme praticienne dans la fiche ?
- Recherche Google Maps "acupuncture Rosemont" : où apparaît La Source en Soi dans les résultats ?
- Fiche Lumino Health : `https://luminohealth.sunlife.ca/en/health-care-provider-profile/acupuncturist/la-source-en-soi/judith-dufour-savard-1007631-714482/` — peux-tu accéder aux avis ? Combien ? Faut-il un login Sun Life ?
- Le site de La Source en Soi mentionne-t-il Judith (page équipe, page praticiens) ?
- Quick wins évidents

**À NE PAS faire** : chercher un GBP de Judith en propre (il n'existe pas, c'est volontaire).

### Rapport 5 — `scout-voix-judith.md`

**Objectif** : sentir la voix éditoriale de Judith pour savoir si Claude peut la reproduire facilement.

**À investiguer** :
- Échantillonner 3-5 textes existants (articles de blog Wix, captions IG si possible via Hub, page À propos)
- Caractériser : ton, vocabulaire récurrent, niveau de formalité, usage du "je" vs "nous", longueur de phrase typique, métaphores fréquentes
- Verdict : voix facile à reproduire (ton standard pro de la santé) ou très spécifique (demandera une calibration fine) ?

**Méthode** : lecture attentive de 3-5 textes. Si tu veux récupérer les articles de blog proprement, utilise l'API Wix Blog déjà intégrée dans le Hub V2 — cherche le code d'intégration dans le repo (voir Rapport 6 pour les pistes).

### Rapport 6 — `scout-integrations-techniques.md`

**Le rapport le plus critique.** Demande une inspection approfondie du repo Hub V2 existant.

**À investiguer dans `~/Desktop/Mon_Acupunctrice_V2/`** :

1. **Structure actuelle des routes Next.js** (dossier `app/`) :
   - Quelles routes existent actuellement ?
   - Y a-t-il déjà des routes publiques, ou tout est sous `app/admin/` (ou équivalent) ?
   - Quel serait le pattern le plus propre pour ajouter des routes publiques sans casser l'existant ? (route groups Next.js 15 `(public)`, middleware d'auth, layout séparé ?)
   - Comment sont organisés les layouts partagés (`layout.tsx`) ?
   - Y a-t-il un système de thème / tokens de design déjà en place ?

2. **Schéma Firestore actuel** (chercher : services Firestore, types TypeScript, règles `firestore.rules`) :
   - Quelles collections existent ?
   - Les nouvelles collections proposées dans le plan (`faqs`, `ressources`, `servicePages`) entrent-elles en conflit avec l'existant ?
   - Les règles de sécurité actuelles sont-elles compatibles avec des **lectures publiques** (non authentifiées) sur les nouvelles collections ?
   - Quelle est la stratégie d'auth actuelle (Firebase Auth ? NextAuth ?) et comment elle cohabite avec des pages publiques ?

3. **Intégration Wix Blog actuelle** :
   - Où est le code d'intégration Wix Blog dans le repo (API routes ? services ?)
   - Quelle API du Wix SDK est utilisée ?
   - Y a-t-il déjà un script/fonction qui liste tous les articles ? qui récupère le contenu complet d'un article (Ricos JSON) ?
   - Comment sont stockés les credentials Wix (variables d'env ? vercel env ?)
   - Ce code sera-t-il réutilisable pour le script d'import futur ?

4. **Go Rendez-Vous** :
   - La stratégie est confirmée : redirection vers `https://gorendezvous.com/lasourceensoi`, l'utilisateur sélectionne Judith manuellement
   - Vérifier rapidement s'il y a des paramètres URL utiles pour le tracking (UTM, etc.)
   - Pas besoin de creuser profond — la stratégie est décidée, c'est juste validation

5. **Images Wix** :
   - Les images actuelles sont-elles sur `static.wixstatic.com` ?
   - Stratégie de migration : URLs directes (rapide mais dépendant de Wix) ou re-upload vers Firebase Storage (propre, indépendant) ?
   - Quelle est la taille approximative du corpus d'images à migrer ?

6. **Domaine et DNS** :
   - Le domaine `acupuncturejudith.ca` est-il géré chez Wix ou un registrar externe ?
   - Quel serait le chemin de migration DNS (DNS géré par Wix vs géré ailleurs change tout) ?

**Méthode** : lecture du code, `grep` ciblé sur les patterns attendus, lecture de quelques fichiers clés (`package.json`, `app/layout.tsx`, `firestore.rules`, services d'intégration Wix). Pas besoin de lire le repo entier — cible les réponses aux questions ci-dessus.

### Rapport 7 — `SCOUTING_SUMMARY.md` (synthèse finale, 1 page maximum)

Récapitule tout ce qui précède en une page, avec :

1. **Les 3 plus gros risques** identifiés toutes zones confondues
2. **Les 3 plus grosses opportunités** identifiées
3. **Les décisions humaines requises** avant de démarrer la Phase 2 (architecture technique) — liste des questions à ramener à Benoit
4. **Recommandation globale** : 🟢 go / 🟡 ajuster / 🔴 no-go
5. **Ajustements suggérés au plan** : liste numérotée des modifications à apporter à `PLAN_EDITORIAL_SEO_GEO.md` — **ne pas les appliquer toi-même**, Benoit les intègrera après revue
6. **Prochaines étapes recommandées** : dans quel ordre Benoit devrait-il attaquer les vraies missions de build ?

---

## Template commun des rapports 1 à 6

Chaque rapport doit suivre cette structure exacte :

```markdown
# Scouting — [Nom de la zone]

**Date** : [date du jour]
**Temps passé** : [estimation, exemple "20 min"]
**Statut global** : 🟢 Vert / 🟡 Jaune / 🔴 Rouge

## TL;DR

[3-5 lignes qui résument tout]

## Ce qu'on savait (hypothèses du plan)

[rappel des hypothèses de PLAN_EDITORIAL_SEO_GEO.md pertinentes pour cette zone]

## Ce qu'on a trouvé

[observations concrètes, données, extraits de code, captures de SERPs, etc.]

## Surprises et découvertes

[ce qui n'était pas dans le plan, bonnes ou mauvaises]

## Risques identifiés

[obstacles, inconnues préoccupantes, dépendances cachées]

## Recommandations d'ajustement du plan

[propositions de modifications à PLAN_EDITORIAL_SEO_GEO.md — ne pas les appliquer]

## Questions à ramener à Benoit

[questions qui nécessitent une décision humaine]
```

---

## Contraintes importantes

1. **Temps-boîte strict** : 2 à 3 heures de travail total pour les 7 fichiers. Pas plus. Si tu manques de temps sur une zone, notes-le et passe à la suivante. Mieux vaut 6 rapports courts et finis qu'un rapport parfait et les autres vides.

2. **Pas de code produit**. Tu observes, tu rapportes, tu recommandes. Tu ne crées ni routes, ni composants, ni schémas, ni fichiers TypeScript, ni migration Firestore. Rien d'autre que les 7 fichiers markdown.

3. **Ne pas modifier `PLAN_EDITORIAL_SEO_GEO.md`**. Tes recommandations vont dans les rapports. Benoit les intègrera au plan après revue en session Claude Desktop.

4. **Pas de commits automatiques**. Laisse les fichiers en attente dans la branche — Benoit reviewra et commitera lui-même.

5. **Signaler les inconnues clairement**. Si tu ne peux pas accéder à quelque chose (ex. avis Lumino Health derrière auth Sun Life), dis-le. Si une donnée te manque, marque-la 🟡 ou 🔴 et explique pourquoi. Pas d'extrapolation hasardeuse.

6. **Respect du positionnement décidé**. La stratégie est arrêtée :
   - Emprunt de réputation La Source en Soi (pas de GBP Judith séparé)
   - Page `/reserver` comme landing de confiance qui transforme la friction en signal
   - Maillage hub-and-spoke par pilier
   - Intégration dans le Hub V2 existant (pas de nouveau repo)
   
   Si tu trouves quelque chose qui remet ça en question, notes-le comme recommandation dans la synthèse finale — ne redéfinis pas la stratégie dans tes rapports.

7. **Utilise les outils à ta disposition efficacement** : bash, lecture de fichiers dans le repo, `grep`, `find`, web_fetch, Exa search si dispo, outils Playwright/Chrome MCP si configurés. Priorité à l'efficacité, pas à l'exhaustivité.

---

## Ordre d'exécution suggéré

1. Setup initial (branche, structure dossiers, lecture du plan) — **15 min**
2. **Rapport 6** (intégrations techniques) — 30-40 min *(le plus critique, le faire tôt)*
3. **Rapport 1** (Wix actuel) — 20 min
4. **Rapport 5** (voix Judith) — 15 min *(peut se faire en parallèle du Rapport 1 si tu récupères les articles via l'API Wix)*
5. **Rapport 2** (mots-clés) — 25 min
6. **Rapport 3** (concurrence) — 20 min
7. **Rapport 4** (GEO local) — 25 min
8. **Rapport 7** (synthèse finale) — 20 min

**Total : ~2h50**. C'est serré, vise le minimum viable sur chaque rapport.

---

## Quand tu as fini

**Arrête-toi après le rapport de synthèse.** Ne pas continuer vers l'exécution des vraies phases, ne pas commencer à coder, ne pas modifier le plan stratégique.

Affiche un résumé final dans le terminal avec :
- Le chemin des 7 fichiers créés
- Le statut global de chacun (🟢🟡🔴)
- La recommandation finale (🟢 go / 🟡 ajuster / 🔴 no-go)
- Une phrase d'accroche pour que Benoit sache quoi faire ensuite

Puis rends la main. Benoit prendra les rapports, reviendra en session Claude Desktop pour les analyser et raffiner le plan, puis relancera Claude Code pour les vraies missions de build.

Bonne chasse 🔍
