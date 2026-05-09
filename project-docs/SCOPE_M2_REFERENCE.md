# Scope M2 — Document de référence

**Date** : 2026-05-08 (soirée)
**Statut** : Scope figé, pas exécuté. À reprendre dans une session future.
**Prérequis** : M1 (commit `4e4e2f6`) + M1.5 (commit `9027bca`) déployés en prod.

---

## 1. Contexte

Suite logique du travail de robustesse sur le pipeline de contenu Mon Acupunctrice Hub, ce document fige le scope de **M2A** (pipeline images multiples) et **M2B** (bridge contenu → social), à exécuter dans deux sessions distinctes pour ne pas mélanger des décisions UX trop différentes.

**Pourquoi ce document existe** : permettre à toute future session de stratégie + handoff CC de partir d'un scope verrouillé, sans avoir à reconstruire les 11 décisions UX qu'on a arbitrées le 8 mai 2026.

**Comment l'utiliser** :
1. À la prochaine session, Benoit lance simplement *"on attaque M2A"* (ou M2B)
2. Claude (chat web) lit ce document + génère un handoff CC exécutable basé sur le scope verrouillé
3. CC exécute, déploie, valide

**Ordre obligatoire** : M2A doit précéder M2B parce que le bridge social a besoin des images choisies par Judith pour alimenter les calendarSlots (sinon le bridge consommerait des placeholders vides).

---

## 2. Décisions UX actées (Q1-Q6 + 11 sous-décisions)

### Décisions de la pré-session (M1)

| # | Question | Décision |
|---|---|---|
| Q1 | Workflow blog | (b) Review pending → published comme ressources/FAQ — **livré M1** |
| Q2 | Bridge contenu → social | (c) Opt-in via checkbox au moment du publish/approve |
| Q3 | Source du blog | (c) Tiptap + markdown via inject.mjs — **livré M1** |
| Q4 | Bridge ressources/FAQ aussi | (b) Toutes — bridge dispo pour tout type, contrôlé par checkbox |
| Q5 | Format séquence | (a) Format unique J+0/J+1/J+3/J+7 pour tous types |
| Q6 | Captions auto | (c) LLM avec fallback templates statiques |

### Décisions M2A (pipeline images multiples)

| # | Question | Décision |
|---|---|---|
| A1 | Layout grille | **Tinder swipe (framer-motion à installer)**, fallback 2×2 si CC juge trop complexe |
| A1.1 | Direction swipe | Gauche=refuser, Droite=accepter |
| A1.2 | Acceptation | Sélection immédiate, pile fermée, retour vue normale |
| A1.3 | Si 4 refus | Bouton "Régénérer 4 nouvelles propositions" (max 2 régénérations par article) |
| A1.4 | Rewind | Oui, bouton "Annuler le dernier swipe" |
| A1.5 | Lib | framer-motion (à installer) — alternative GSAP Draggable possible mais plus de code |
| A2 | Changement d'avis Judith | Oui, les 4 combos restent en Storage tant que pas approuvé |
| A3 | Échec partiel génération | 3 OK + placeholder pour le 4ème + bouton "Régénérer celle-ci" |
| A4 | Perf inject markdown | Génération asynchrone (background), inject termine vite |
| A5 | Tiptap publish | Hybride : 1ère cover sync (rapide UX) + 3 alternatives async |

### Décisions M2B (bridge contenu → social)

| # | Question | Décision |
|---|---|---|
| B1 | Cron heure publication | 14h UTC (10h Mtl, prime time IG mère) — modifier le cron actuel à 12h UTC |
| B2 | Slot reel non rempli | Comportement actuel (expire) — pas de modif |
| B3 | Unpublish avec séquence active | Confirmation modale + suppression slots futurs non publiés |
| B4 | Refactor useBlogSequence | Refactor (préserve logique captions, change juste la source URL → ContentRef) |
| B5 | LLM génération captions | Claude Haiku 4.5 (`claude-haiku-4-5-20251001`) par défaut + Groq Llama 3.1 70B fallback |
| B6 | Ton captions | (c) Auto-détecté selon pilier (table de prompts par pilier ci-dessous) |
| Bonus | Captions éditables Judith | OUI — Judith peut modifier les 4 captions générées dans le slot calendrier avant publication |

### Modèles LLM B5 — précisions

- **Anthropic** : modèle exact `claude-haiku-4-5-20251001` (sortie octobre 2025, actif et performant)
- **Groq** : modèle Llama 3.1 70B (gratuit, ~1s de latence)
- **Logique fallback** : appel Claude Haiku → si erreur réseau / 5xx / timeout 5s → fallback Groq → si Groq échoue aussi → templates statiques
- **Coût estimé** : Haiku ~$0.0001 par caption × 4 captions × volume Mon Acupunctrice = négligeable

### Tons captions B6 — table par pilier

Chaque pilier a son ton dans le prompt système LLM. **Pas d'emoji partout** (consigne explicite Benoit). Si Judith veut en ajouter au cas par cas, elle l'éditera dans le slot.

| Pilier | Ton | Exemple court |
|---|---|---|
| **Fertilité** | Doux, encourageant, sans pression. Vocabulaire respectueux des parcours difficiles (FIV, IUI, attente). | *"Comprendre comment l'acupuncture peut soutenir un parcours FIV — nouveau billet sur le blog."* |
| **Grossesse & périnatalité** | Rassurant, posé, informatif. Évite vocabulaire alarmiste. | *"Acupuncture en fin de grossesse : ce que la recherche dit sur la préparation à l'accouchement."* |
| **Pédiatrie** | Chaleureux, informatif. Adresse les parents directement. | *"Comment l'acupuncture pédiatrique soutient le sommeil des nourrissons."* |
| **Acupuncture sociale** | Engagé, accessible, militant doux. Met l'accent sur la démocratisation du soin. | *"L'acupuncture en groupe : un soin accessible chaque jeudi à La Source en Soi."* |

---

## 3. Scope M2A — Pipeline images multiples

### 3.1. Architecture cible

```
                Article approuvé/injecté avec status=pending
                                 │
                                 ▼
                  Génération de 4 combinaisons BG+lineart
                  (depuis content/visual-bank/, async pour inject)
                                 │
                                 ▼
                  4 covers (1200×675) + 4 stories (1080×1920)
                  uploadées dans Firebase Storage
                                 │
                                 ▼
                  URLs sauvées dans le doc Firestore :
                  imageProposals: [{ id, coverUrl, storyUrl }, ...]
                  selectedImageId: null  (pas encore choisi)
                                 │
                                 ▼
            Hub /contenu — Card affiche un bouton "Choisir image"
                                 │
                                 ▼
                  Au clic : ouvre TinderStack avec les 4 cartes
                  Judith swipe gauche=refuser / droite=accepter
                                 │
                                 ▼
                  Acceptation → selectedImageId set, modal ferme
                  Refus 4× → bouton "Régénérer 4 nouvelles" (max 2×)
                                 │
                                 ▼
                  Card affiche maintenant la cover sélectionnée
                  Judith peut alors cliquer "Approuver l'article"
```

### 3.2. Fichiers à créer / modifier

**Nouveaux fichiers** :

| Fichier | Rôle |
|---|---|
| `lib/cover-generator/variations.ts` | Module qui génère N propositions (BG+lineart différents) en appelant `compose.ts` × N. Param `count` (default 4), `pilier`, `title`. Returns array de `{ coverBuffer, storyBuffer, combo: { bgPath, lineartPath } }` |
| `lib/cover-generator/upload-batch.ts` | Upload batch dans Firebase Storage avec naming convention `proposals/{slug}/{combo-id}-cover.jpg` et `-story.jpg`. Returns array d'URLs |
| `app/api/cover/generate-proposals/route.ts` | Endpoint POST qui prend `{ slug, type, title, pilier }`, lance `variations.ts` + `upload-batch.ts`, met à jour le doc Firestore avec `imageProposals` array. Async, retourne 202 Accepted |
| `app/api/cover/select-proposal/route.ts` | Endpoint POST qui prend `{ slug, type, proposalId }`, set `selectedImageId` dans le doc, set `coverImage` et `storyImage` aux URLs sélectionnées |
| `app/api/cover/regenerate-proposals/route.ts` | Endpoint POST qui régénère N nouvelles propositions (jusqu'à 2× max, tracked par champ `regenerationCount` dans le doc). Supprime les anciennes URLs Storage non-retenues |
| `components/features/cms/TinderStack.tsx` | Composant React — pile de 4 cartes empilées, drag swipe gauche/droite via framer-motion, callbacks `onAccept(proposalId)` et `onReject(proposalId)`. Bouton "Annuler dernier swipe" et "Régénérer" |
| `components/features/cms/ImageProposalsModal.tsx` | Modal qui wrap TinderStack, gère le state local des swipes, appelle les endpoints API au moment des actions, affiche bouton fallback "Créer une image custom" → ouvre l'éditeur d'images existant |

**Fichiers à modifier** :

| Fichier | Changement |
|---|---|
| `content/scripts/inject.mjs` | Après injection en `pending`, déclencher async (fetch sans await) `/api/cover/generate-proposals` pour ce nouveau doc. Ne PAS bloquer l'inject. |
| `app/api/blog/publish/route.ts` (Tiptap) | Hybride A5 : génération sync de la 1ère cover (rapide, ~3-5s) + déclenchement async des 3 alternatives via `/api/cover/generate-proposals` avec param `count: 3` et `excludeCombo: <combo de la 1ère>` |
| `app/(app)/contenu/page.tsx` | Ajouter handler `handleOpenProposals(item)` qui ouvre `ImageProposalsModal` avec les `imageProposals` du doc. Bouton "Choisir image" rendu si `imageProposals.length > 0 && !selectedImageId`. |
| `lib/cover-generator/compose.ts` | Refactor mineur : accepter param optionnel `seed` ou `combo: { bgPath, lineartPath }` pour permettre la génération de combos spécifiques (vs random actuel). Préserver le comportement par défaut. |

### 3.3. Référence pattern Tinder swipe

**Composant existant à étudier** : `Karmacash_V2/src/features/bankReconciliation/components/SwipeInterface/SwipeCard.jsx` (et fichiers voisins du dossier `SwipeInterface/`).

Repo privé sur GitHub. Au moment de l'exécution M2A, CC doit :
1. `git clone https://github.com/BudgetAppV2/Karmacash_V2.git /tmp/karmacash_v2_ref` (avec credentials git locaux de Benoit, déjà configurés)
2. Lire le dossier `src/features/bankReconciliation/components/SwipeInterface/` complet
3. Adapter le pattern au contexte Mon Acupunctrice (4 propositions d'image au lieu de transactions, callbacks `onAccept(image)` / `onReject(image)`, etc.)
4. Supprimer le clone temporaire après extraction du pattern

### 3.4. Estimation effort M2A

| Étape | Effort estimé |
|---|---|
| Setup framer-motion (`npm install framer-motion`) + clone Karmacash_V2 ref | 15 min |
| `lib/cover-generator/variations.ts` + `upload-batch.ts` | 45 min |
| 3 nouveaux endpoints API (generate-proposals, select-proposal, regenerate-proposals) | 1h |
| `TinderStack.tsx` (port pattern KarmaCash → 4 cartes images) | 1h |
| `ImageProposalsModal.tsx` (wrap TinderStack + état + appels API) | 30 min |
| Modifs `inject.mjs`, `/api/blog/publish`, `app/(app)/contenu/page.tsx` | 30 min |
| Tests cohérence code + npm run build + commit + push | 30 min |
| **Total** | **~4-5h** |

Estimation conservatrice. Si CC trouve que le port du pattern KarmaCash est plus rapide que prévu, on peut viser 3.5h. Si Tinder swipe est jugé trop complexe à porter, fallback layout 2×2 statique → -1h sur le total.

### 3.5. Tests E2E à valider après déploiement

1. Inject `content/blog/test-m2a.md` minimal → vérifier doc Firestore en `pending` avec `imageProposals: []` puis `imageProposals: [4 entries]` après ~10-30s (génération async)
2. Hub `/contenu` → bouton "Choisir image" visible sur la card du test
3. Click → modal Tinder ouvre avec 4 cartes
4. Swipe les 3 premières à gauche, accepter la 4ème → modal ferme, card affiche la cover sélectionnée
5. Vérifier `selectedImageId` set dans Firestore + `coverImage`/`storyImage` URLs
6. Bouton "Approuver" devient visible (déblocage par sélection image)
7. Approuver → article live sur `/blog/<slug>` avec la cover choisie
8. Test alt : refuser les 4 → bouton "Régénérer" → 4 nouvelles propositions → accepter une
9. Test fallback : bouton "Créer une image custom" → ouvre l'éditeur d'images existant

---

## 4. Scope M2B — Bridge contenu → social

### 4.1. Architecture cible

```
            Article approuvé via /api/cms/approve
            (avec selectedImageId set par M2A)
                          │
                          ▼
            Checkbox "Créer aussi la séquence sociale" cochée ?
            (default: true pour blog, false pour ressources/FAQ)
                          │
                          ▼
            Si oui → createSocialSequence(contentRef, selectedImageUrls)
                          │
                          ▼
            Génération 4 captions LLM (Claude Haiku 4.5)
            avec ton adapté au pilier (table B6)
            Fallback Groq si Anthropic down, puis templates si Groq down
                          │
                          ▼
            Création de 4 calendarSlots dans Firestore :
            - slot 1 : J+0  story_promo    autoPublish=true
            - slot 2 : J+1  reel_resume    autoPublish=false (Judith remplit)
            - slot 3 : J+3  reel_pratique  autoPublish=false (Judith remplit)
            - slot 4 : J+7  story_rappel   autoPublish=true
            Chaque slot a sequenceId, sequenceRole, contentRef, caption
                          │
                          ▼
            Cron /api/cron/publish (14h UTC quotidien)
            sort les slots autoPublish=true du jour
                          │
                          ▼
            Stories J+0 et J+7 publiées sur IG via instagrapi
            Reels J+1 et J+3 attendent que Judith les remplisse
```

### 4.2. Fichiers à créer / modifier

**Nouveaux fichiers** :

| Fichier | Rôle |
|---|---|
| `lib/social/createSocialSequence.ts` | Fonction qui prend `(contentRef, imageUrls, pilier)` et crée 4 calendarSlots. Appelle `generateCaptions` ci-dessous |
| `lib/social/generateCaptions.ts` | Fonction qui appelle Claude Haiku → Groq fallback → templates fallback. Returns array de 4 captions sur mesure |
| `lib/social/captionTemplates.ts` | Templates statiques de fallback ultime, par pilier × par rôle (story_promo, reel_resume, reel_pratique, story_rappel) — 16 templates total |
| `lib/social/promptByPilier.ts` | Génère le prompt système pour Claude/Groq selon le pilier (cf. table B6) |

**Fichiers à modifier** :

| Fichier | Changement |
|---|---|
| `lib/hooks/useBlogSequence.ts` | Refactor : accepter `contentRef: { type, slug }` au lieu d'URL externe. Génère `acupuncturejudith.ca/{type}/{slug}` en interne |
| `lib/utils/storyImageGenerator.ts` | Idem : prendre `(contentType, slug, title)` → URL interne canonique. Ne plus prendre URL externe Wix |
| `app/api/cms/approve/route.ts` | Accepter param `createSocialSequence: boolean` dans body. Si true ET selectedImageId set → appeler `createSocialSequence()` après l'update du status |
| `app/api/cms/unpublish/route.ts` | Si le doc a une `sequenceId` active, déclencher confirmation modale côté UI (B3) puis supprimer slots futurs non publiés |
| `app/api/cron/publish/route.ts` | Changer schedule de 12h UTC à **14h UTC** (10h Mtl) — fichier `vercel.json` ou variable d'environnement |
| `components/features/cms/ContentReviewCard.tsx` | Ajouter checkbox "Créer aussi la séquence sociale" (visible quand le contenu a `selectedImageId`). Default coché pour blog, décoché pour ressources/FAQ |
| `app/(app)/contenu/page.tsx` | Passer `createSocialSequence` au call `/api/cms/approve` selon état checkbox |
| `vercel.json` | Modifier le schedule cron `/api/cron/publish` de `0 12 * * *` à `0 14 * * *` |

### 4.3. Prompts LLM par pilier (à raffiner en exécution)

**Prompt système commun** (toujours envoyé) :

```
Tu es l'assistant social de Judith Dufour-Savard, acupunctrice à Montréal.
Tu rédiges des légendes courtes en français pour ses publications Instagram
et Facebook, à partir d'un titre d'article et d'un extrait.

Règles strictes :
- 100-200 caractères maximum par légende
- Pas d'emoji
- Voix Judith : posée, informative, professionnelle, jamais sensationnaliste
- Pas de hashtags (Judith les ajoute manuellement si elle veut)
- Pas de "lien dans la bio" ni d'incitations marketing agressives
- Toujours respecter le code déontologique de l'OAQ : pas de promesses
  de guérison, pas de revendications thérapeutiques non démontrées
- Pour chaque article, génère 4 légendes différentes correspondant aux 4 rôles :
  1. story_promo (annonce du nouvel article)
  2. reel_resume (résumé pédagogique de l'article)
  3. reel_pratique (un takeaway concret de l'article)
  4. story_rappel (rappel doux 7 jours après, pour ceux qui auraient manqué)

Retourne uniquement un JSON valide : { "captions": [{ "role": "story_promo", "text": "..." }, ...] }
```

**Prompt complémentaire par pilier** (ajouté au système commun) :

| Pilier | Ajout au prompt |
|---|---|
| **fertilite** | "Le sujet touche la fertilité, parfois des parcours difficiles (FIV, IUI, attente). Ton encourageant sans promesse, vocabulaire respectueux." |
| **grossesse-perinatalite** | "Le sujet touche la grossesse, l'accouchement ou le post-partum. Ton rassurant et informatif, évite tout vocabulaire alarmiste." |
| **pediatrie** | "Le sujet touche les enfants et nourrissons. Ton chaleureux qui s'adresse aux parents, vocabulaire accessible." |
| **acupuncture-sociale** | "Le sujet touche l'acupuncture en groupe à tarif réduit. Ton engagé et accessible, met l'accent sur la démocratisation du soin." |

**Prompt utilisateur** (envoyé à chaque génération) :

```
Pilier : {pilier}
Titre de l'article : {title}
Extrait (160 premiers caractères) : {excerpt}
URL de l'article (à mentionner dans story_promo et story_rappel) : {url}

Génère les 4 légendes au format JSON spécifié.
```

### 4.4. Estimation effort M2B

| Étape | Effort estimé |
|---|---|
| Refactor `useBlogSequence.ts` URL → ContentRef | 30 min |
| Refactor `storyImageGenerator.ts` slug interne | 30 min |
| `lib/social/createSocialSequence.ts` | 45 min |
| `lib/social/generateCaptions.ts` (Claude + Groq + fallback) | 1h |
| `lib/social/captionTemplates.ts` (16 templates) | 30 min |
| `lib/social/promptByPilier.ts` | 15 min |
| Modifs `/api/cms/approve` + `/api/cms/unpublish` (B3 modale) | 30 min |
| UI checkbox dans `ContentReviewCard` + handler dans page.tsx | 30 min |
| Modif `vercel.json` cron 14h UTC | 5 min |
| Setup variables d'env Anthropic + Groq API keys (à demander à Benoit) | 10 min |
| Tests cohérence code + npm run build + commit + push | 30 min |
| **Total** | **~5h** |

### 4.5. Tests E2E à valider après déploiement

1. Approuver un blog avec image sélectionnée + checkbox cochée → vérifier 4 calendarSlots créés en Firestore avec sequenceId commun
2. Vérifier que les 4 captions sont distinctes et matchent le pilier (lecture manuelle des slots)
3. Modifier une caption manuellement dans le slot → vérifier que la modif persiste
4. Attendre 14h UTC ou trigger le cron manuellement → vérifier publication story IG (J+0)
5. Test fallback : couper temporairement l'API key Anthropic → approuver un autre blog → vérifier fallback Groq
6. Test fallback ultime : couper aussi Groq → vérifier templates statiques utilisés
7. Test B3 : approuver un blog avec séquence active, puis dépublier → modale apparaît "Cette action va annuler 3 publications sociales programmées" → confirmer → vérifier slots futurs supprimés, slots passés préservés
8. Test ressources : approuver une ressource avec checkbox **décochée** → vérifier qu'aucun slot n'est créé
9. Test ressources : approuver une ressource avec checkbox **cochée** manuellement → vérifier 4 slots créés

---

## 5. Pièges connus

### Pour M2A

1. **Volume Storage** : 4 covers + 4 stories = 8 images × 100-200 KB = ~1.5 MB par article. Pour 50 articles batch = 75 MB. Pas critique mais à surveiller (quota Firebase Storage gratuit = 5 GB).
2. **Régénération non bornée** : sans le compteur `regenerationCount`, Judith pourrait régénérer indéfiniment. Hard limit à 2 régénérations max par article.
3. **Cleanup des combos non-retenues** : à l'approbation d'un article, il faut supprimer les 3 covers + 3 stories non sélectionnées de Storage. Sinon pollution progressive. Faire ça dans `/api/cms/approve` ou en cron de cleanup nocturne.
4. **Race condition génération async vs review** : si Judith ouvre `/contenu` pendant que la génération est encore en cours (10-30s après inject), elle ne verra pas le bouton "Choisir image". Afficher un loader genre "Génération des propositions visuelles…" si `imageProposals.length === 0` et que le doc a été créé il y a moins de 60s.
5. **Tinder swipe sur desktop** : framer-motion `drag` fonctionne aussi à la souris, mais l'UX est moins naturelle qu'au tactile. Tester sur les 2 contextes (mobile Hub iOS pour Judith + desktop pour Benoit).

### Pour M2B

1. **API keys manquantes** : Anthropic et Groq nécessitent des keys dans `.env.local` et Vercel env vars. À setup avant la session M2B (Benoit doit créer les keys s'il n'en a pas déjà).
2. **Limite de tokens Claude Haiku** : 200K contexte input, mais on n'envoie qu'un titre + extrait court. Output max ~500 tokens pour 4 captions courtes. Largement OK.
3. **Modèle Haiku peut être déprecié** : vérifier disponibilité de `claude-haiku-4-5-20251001` au moment de l'exécution. Si déprécié, utiliser le dernier Haiku disponible.
4. **Comportement actuel des slots qui expirent (B2)** : à confirmer côté code que c'est bien ce comportement aujourd'hui. Si les slots non remplis restent indéfiniment au lieu d'expirer, ajouter un cron de cleanup quotidien qui marque les slots `pending` plus vieux que 7 jours en `expired`.
5. **Suppression slots futurs au unpublish (B3)** : préserver les `publishedAt` et `publishedTo` des slots déjà publiés (J+0) pour traçabilité historique. Supprimer uniquement les slots futurs `status: pending`.

---

## 6. Checklist pré-session pour la prochaine fois

### Avant d'ouvrir la session M2A

- [ ] Confirmer que les commits `4e4e2f6` (M1) et `9027bca` (M1.5) sont bien en prod et stables (pas de bugs reportés depuis la fin de leur déploiement)
- [ ] Vérifier que `lib/cover-generator/` est encore intact (compose.ts, pige.ts, line-art-processor.ts, placement-analyzer.ts, fonts.ts, upload.ts, types.ts, templates/cover-blog.ts, templates/story-instagram.ts)
- [ ] Vérifier que `content/visual-bank/` contient toujours ~38 backgrounds JPG + 7 lineart SVG par pilier
- [ ] Vérifier qu'aucun WIP non lié n'a dérivé depuis (notamment `lib/animations/*` toujours en working tree)
- [ ] Confirmer que les credentials git Benoit sont OK pour clone du repo privé `Karmacash_V2`

### Avant d'ouvrir la session M2B

- [ ] M2A déployé, validé E2E, stable depuis au moins quelques jours
- [ ] Confirmer que `selectedImageId` est bien set sur des articles tests (résultat de M2A)
- [ ] Avoir une API key Anthropic (`ANTHROPIC_API_KEY`) prête à être ajoutée dans `.env.local` + Vercel env vars
- [ ] Avoir une API key Groq (`GROQ_API_KEY`) prête (compte gratuit suffit)
- [ ] Avoir confirmé avec Judith le ton final des captions par pilier (table B6 = ébauche, à valider)
- [ ] Vérifier le code actuel du cron `/api/cron/publish` (5.7 KB, 5 avril) pour s'assurer que la modif de schedule à 14h UTC ne casse rien

### Process de session

1. Benoit lance *"on attaque M2A"* (ou M2B)
2. Claude (chat web) lit ce document de référence
3. Claude génère un handoff CC exécutable (`HANDOFF_CC_M2A.md` ou `HANDOFF_CC_M2B.md`) basé sur le scope verrouillé ici
4. CC reçoit le prompt avec lien vers le handoff, fait un récap, exécute
5. Validation E2E par Benoit après déploiement Vercel
6. Si M2A OK → planifier M2B dans une session ultérieure (pas immédiatement après pour laisser stabiliser)

---

## 7. Annexes

### 7.1. Versions de modèles LLM (au 8 mai 2026)

- Claude Opus 4.7 (model: `claude-opus-4-7`)
- Claude Opus 4.6 (model: `claude-opus-4-6`)
- Claude Sonnet 4.6 (model: `claude-sonnet-4-6`)
- **Claude Haiku 4.5 (model: `claude-haiku-4-5-20251001`)** ← utilisé en M2B
- Llama 3.1 70B via Groq (free tier suffit pour notre volume)

### 7.2. Documentation de référence

- Anthropic API : `https://docs.claude.com/`
- Groq API : `https://console.groq.com/docs`
- framer-motion : `https://motion.dev/docs/react`
- Pattern Tinder swipe : `Karmacash_V2/src/features/bankReconciliation/components/SwipeInterface/SwipeCard.jsx` (repo privé GitHub, à cloner par CC au moment M2A)

---

**Fin du document de référence M2.**
