# ROADMAP — Phase Stratégie (S-Series)
# Mon Acupunctrice Hub V2
*Mars 2026 — Planifié par Claude Desktop*

---

## Principe directeur

> Judith veut une **structure**, pas des suggestions IA.
> Le Hub encadre, encourage, et rend chaque publication optimale.
> Les sujets viennent d'elle. Le cadre vient du Hub.

---

## Résumé de la phase

La Phase Stratégie transforme le Hub d'un outil de publication en un
**système d'accompagnement** qui aide Judith à publier régulièrement,
à varier son contenu, et à maximiser l'impact de chaque publication
sur chaque plateforme.

### Ce qu'on construit

| Axe | Objectif |
|-----|----------|
| **Structure** | Un calendrier-cadre qui propose des emplacements typés (Enseigner/Connecter/Aider/Inspirer) avec gradation progressive du rythme |
| **Séquences** | Quand Judith publie un article de blogue, le Hub déploie une séquence de contenu dérivé sur 1-3 semaines |
| **Optimisation** | Chaque publication est optimisée pour sa plateforme (hooks, durée, CTA, hashtags, lien RDV) |
| **Encouragement** | Suivi visuel de la progression, séries de régularité, jalons soulignés — sans pression |
| **Ressources** | Banque de templates de hooks et de captions accessibles comme référence |

### Feedback de Judith intégré

- ✅ Les 4 styles (Enseigner/Connecter/Aider/Inspirer) la parlent
- ✅ Elle est déjà à ~2 publications/semaine
- ✅ Elle veut une structure, pas des suggestions de contenu IA
- ✅ Les sujets doivent être ouverts (ex: acupuncture solidaire) — pas de catégories fermées
- ✅ Le générateur de caption existant est conservé tel quel pour l'instant

---

## Vue d'ensemble des milestones

| ID | Nom | Type | Scope | Dépendances |
|----|-----|------|-------|-------------|
| **S01** | Catégorisation par style | Frontend + Data | Petit | Aucune |
| **S02** | Calendrier-cadre | Frontend + Data + Config | Moyen | S01 |
| **S03** | Stories Instagram API | Backend + Frontend | Moyen | Aucune |
| **S04** | Séquences blogue | Backend + Frontend | Gros | S02, S03 |
| **S05** | Optimisation par plateforme | Backend + Frontend | Moyen | Aucune |
| **S06** | Banque de templates | Frontend + Data | Petit | S01 |
| **S07** | Encouragement & progression | Frontend + Data | Moyen | S02 |
| **S08** | Calendrier visuel enrichi | Frontend | Moyen | S01, S02 |

### Ordre d'implémentation recommandé

```
Sprint 1 : S01 (catégorisation) + S03 (Stories API)
           → Fondations : les styles existent dans le data model,
             les Stories sont publiables via l'API

Sprint 2 : S02 (calendrier-cadre) + S05 (optimisation plateforme)
           → Le cadre hebdomadaire est en place,
             chaque publication est optimisée

Sprint 3 : S04 (séquences blogue) + S06 (banque templates)
           → Le pipeline blogue fonctionne,
             Judith a des ressources d'inspiration

Sprint 4 : S07 (encouragement) + S08 (calendrier visuel)
           → L'expérience est complète et motivante
```

---

## S01 — Catégorisation par style

### Objectif
Ajouter le concept de **style de contenu** (Enseigner / Connecter / Aider / Inspirer)
aux idées et publications de Judith. Les sujets restent libres — c'est le style
qui structure le calendrier.

### Phase
STRUCTURER

### Pourquoi en premier
Tout le reste (calendrier-cadre, séquences, encouragement) dépend de savoir
quel *style* de contenu Judith est en train de créer. C'est la brique de base.

### Changements au data model

```typescript
// Ajout sur ContentItem
contentStyle?: ContentStyle  // Le style du contenu

type ContentStyle = 'enseigner' | 'connecter' | 'aider' | 'inspirer'
```

**Note :** Le champ `category` existant (fertilite/grossesse/bien_etre/mtc/autre)
reste tel quel comme sujet. Le nouveau champ `contentStyle` est orthogonal —
une idée peut être "fertilité" + "enseigner" ou "acupuncture solidaire" + "connecter".

### Livrables

1. **Modifier `IdeaDetailSheet`** — Ajouter un sélecteur de style (4 boutons colorés)
   sous le sélecteur de catégorie existant. Optionnel (pas obligatoire pour sauvegarder).
   Couleurs : 🔵 Enseigner, 🟢 Connecter, 🟡 Aider, 🟣 Inspirer.

2. **Modifier la création rapide d'idée** — Ajouter le même sélecteur de style
   dans le flow de création (optionnel).

3. **Modifier `CalendarDay`** — Si un contentItem a un style, afficher un petit
   indicateur de couleur sur la pastille du calendrier.

4. **Mettre à jour `DATA_MODEL.md`** — Documenter le nouveau champ.

### Definition of Done

- [ ] Le champ `contentStyle` existe sur ContentItem dans Firestore
- [ ] L'IdeaDetailSheet affiche 4 boutons de style avec code couleur
- [ ] Le style est sauvegardé et persiste après refresh
- [ ] Le style est optionnel (on peut sauvegarder sans)
- [ ] Le calendrier montre un indicateur coloré si le style est défini

---

## S02 — Calendrier-cadre

### Objectif
Programmer un **cadre hebdomadaire** dans le Hub : des emplacements vides
pré-positionnés aux bons jours, typés par style, que Judith remplit avec
ses propres idées. Le cadre est configurable et augmente progressivement.

### Phase
STRUCTURER

### Dépendances
- S01 (les styles doivent exister dans le data model)

### Concept clé : les « slots »

Un slot est un **emplacement vide dans le calendrier** qui dit :
"Ce jour-là, le Hub suggère un contenu de style X".
Judith peut l'ignorer, le remplir avec une idée de sa banque,
ou créer directement du contenu.

```typescript
interface CalendarSlot {
  id: string
  userId: string

  // Position
  scheduledDate: Timestamp
  dayOfWeek: number              // 0=dim ... 6=sam

  // Type
  contentStyle: ContentStyle     // 'enseigner' | 'connecter' | 'aider' | 'inspirer'
  format: SlotFormat             // 'reel' | 'story' | 'post'

  // Lien avec le contenu
  contentItemId?: string         // Rempli quand Judith assigne une idée
  status: SlotStatus             // 'open' | 'filled' | 'completed' | 'skipped'

  // Séquence (rempli par S04)
  sequenceId?: string
  sequenceRole?: string

  // Métadonnées du cadre
  weekNumber: number             // Semaine dans le plan (1, 2, 3...)
  planPhase: number              // Phase de rythme (1=début, 2=intermédiaire, 3=croisière)

  createdAt: Timestamp
  updatedAt: Timestamp
}

type SlotFormat = 'reel' | 'story' | 'post'
type SlotStatus = 'open' | 'filled' | 'completed' | 'skipped'
```

### Le plan-cadre configurable

Le plan n'est **pas** hardcodé semaine par semaine. C'est un ensemble de
**règles de rythme** par phase que le Hub applique pour générer les slots :

```typescript
interface PlanPhase {
  phase: number                  // 1, 2, 3
  label: string                  // "Début", "Intermédiaire", "Croisière"
  reelsPerWeek: number           // 2, 3, 4
  storiesPerWeek: number         // suggestion, pas des slots formels
  weekPattern: WeekPattern[]     // ex: [mardi=enseigner, vendredi=connecter]
}

interface WeekPattern {
  dayOfWeek: number
  contentStyle: ContentStyle
  format: SlotFormat
}
```

**Phase 1 (actuelle, ~2/sem)** :
- Mardi → Reel (style varie)
- Vendredi → Reel (style varie)

**Phase 2 (~3/sem)** :
- Lundi → Reel
- Mercredi → Reel
- Vendredi → Reel

**Phase 3 (~4/sem)** :
- Lundi → Reel
- Mercredi → Reel
- Vendredi → Reel
- Dimanche → Reel

**Important :** Les jours et les styles sont des suggestions. Judith pourra
éventuellement configurer ses jours préférés et son rythme dans les settings
(pas dans ce milestone — ici on hardcode la phase 1 comme défaut).

### Livrables

1. **Collection Firestore `calendarSlots`** — Nouvelle collection avec les
   règles de sécurité appropriées (même pattern que contentItems).

2. **Utilitaire `generateWeekSlots()`** — Fonction qui génère les slots pour
   une semaine donnée selon la phase active. Appelée quand Judith navigue
   vers une semaine future qui n'a pas encore de slots.

3. **Configuration initiale** — Hardcoder Phase 1 (2 slots/semaine,
   mardi et vendredi). Le passage entre phases sera manuel pour l'instant
   (Judith ou Benoit change la phase dans Firestore ou via un setting futur).

4. **UI Calendrier — Slots vides** — Les slots apparaissent comme des
   cartes fantômes (outline pointillé, couleur du style, icône +) dans le
   calendrier. Tap → ouvre un sheet "Remplir ce slot" avec :
   - Le style suggéré (ex: "Enseigner")
   - Bouton "Choisir une idée" (filtre la banque par style)
   - Bouton "Créer une idée"
   - Bouton "Passer" (status → skipped, pas de pénalité)

5. **UI Calendrier — Slots remplis** — Quand une idée est assignée,
   le slot passe de fantôme à carte pleine (comme un contentItem actuel).
   Le slot garde son code couleur de style.

6. **Vue semaine simplifiée** — En haut du calendrier, un résumé de la
   semaine courante : "Semaine 12 — 2 emplacements" avec des cercles
   qui montrent le statut (ouvert/rempli/complété).

### Questions de design à trancher

- Est-ce que les slots sont générés à l'avance (ex: 4 semaines) ou
  à la demande quand Judith navigue? → Recommandation : à la demande
- Quand un contentItem est publié et qu'il est lié à un slot, le slot
  passe automatiquement à "completed"? → Oui
- Les slots passés non remplis deviennent "skipped" automatiquement? → Oui

### Definition of Done

- [ ] La collection `calendarSlots` existe avec les bonnes security rules
- [ ] 2 slots/semaine apparaissent dans le calendrier (mardi/vendredi)
- [ ] Les slots vides sont visuellement distincts des contentItems
- [ ] Taper un slot vide ouvre le sheet de remplissage
- [ ] "Choisir une idée" ouvre la banque filtrée par style
- [ ] Un slot rempli affiche le titre de l'idée assignée
- [ ] Le résumé de semaine en haut montre la progression
- [ ] Les slots passés sont auto-marqués "skipped"
- [ ] La publication d'un contentItem lié marque le slot "completed"

---

## S03 — Stories Instagram API

### Objectif
Permettre au Hub de publier des **Stories Instagram** via l'API
(media_type=STORIES). Nécessaire pour les stories automatiques des
séquences blogue (S04).

### Phase
DISTRIBUER

### Dépendances
- Aucune (peut être fait en parallèle de S01)

### Contexte technique

L'API Instagram Content Publishing supporte `media_type=STORIES` depuis 2023.
Le Hub utilise déjà cette API pour les Reels (M09). Les Stories supportent
images et vidéos mais PAS les stickers interactifs (sondages, liens, questions).
Workaround : texte "Lien dans ma bio 👆" incrusté sur l'image/vidéo.

### Livrables

1. **Fonction de publication Story** — Étendre le système de publication
   existant pour supporter `media_type=STORIES`. Même flow que les Reels
   mais avec les params différents de l'API.

2. **UI de création de Story** — Nouveau flow simplifié :
   - Upload image ou vidéo (max 60 sec pour vidéo)
   - Aperçu 9:16
   - Pas besoin de caption (les Stories n'ont pas de caption visible)
   - Bouton "Publier en Story"

3. **Templates de Story pour séquences blogue (pré-S04)** — Préparer
   la génération d'images de Story simples :
   - Fond de couleur uni (palette de Judith)
   - Titre de l'article en gros
   - Texte "Nouvel article! Lien dans ma bio 👆" ou "Tu as manqué cet article?"
   - Généré côté client avec Canvas API ou côté serveur avec Sharp/Canvas

4. **Mettre à jour le sélecteur de plateforme** — Ajouter "Story Instagram"
   comme option de publication (en plus de Reel IG, Facebook, YouTube).

### Limitations connues

- Stories : pas de stickers interactifs via l'API
- Stories vidéo : max 60 secondes
- Stories images : disparaissent après 24h (comportement normal)
- Pas de scheduling natif pour les Stories dans l'API Meta →
  utiliser le même cron Vercel que les Reels

### Definition of Done

- [ ] Une image peut être publiée en Story Instagram depuis le Hub
- [ ] Une vidéo ≤60 sec peut être publiée en Story Instagram
- [ ] Les templates de Story blogue génèrent une image correcte (texte lisible, 1080x1920)
- [ ] Le statut de publication Story est visible dans le Hub
- [ ] Le scheduling fonctionne (story planifiée → publiée par le cron)

---

## S04 — Séquences blogue

### Objectif
Quand Judith entre un lien d'article de blogue, le Hub crée automatiquement
une **séquence de contenus dérivés** positionnés dans le calendrier :
stories automatiques + slots de Reels à créer.

### Phase
AMPLIFIER

### Dépendances
- S02 (les slots du calendrier existent)
- S03 (les Stories sont publiables)

### Le pipeline

```
Judith colle un lien d'article
  │
  ├─ Le Hub scrape le titre (et optionnellement l'image OG)
  │
  ├─ Crée une séquence de slots dans le calendrier :
  │
  │   Jour J   → 🤖 Story promo (auto) — "Nouvel article! Lien dans ma bio"
  │   Jour J+1 → 🎬 Slot Reel ENSEIGNER — "Résume l'article en 30-60 sec"
  │   Jour J+3 → 🎬 Slot Reel AIDER — "Un conseil concret tiré de l'article"
  │   Jour J+7 → 🤖 Story rappel (auto) — "Tu as manqué mon article?"
  │
  │   (Optionnel, configurable plus tard :)
  │   Jour J+14 → Post citation/infographie
  │   Jour J+21 → Reel angle différent
  │
  └─ Les stories auto sont publiées automatiquement via S03
     Les slots Reel sont des emplacements que Judith remplit
```

### Changements au data model

```typescript
// Nouvelle collection ou sous-collection
interface BlogSequence {
  id: string
  userId: string
  blogUrl: string
  blogTitle: string
  blogImageUrl?: string          // Image OG scrapée
  startDate: Timestamp           // Jour de publication de l'article
  status: 'active' | 'completed'
  slotIds: string[]              // Références aux calendarSlots créés
  createdAt: Timestamp
}

// Ajouts sur CalendarSlot (déjà prévu dans S02)
sequenceId?: string              // Lien vers BlogSequence
sequenceRole?: 'story_promo' | 'reel_resume' | 'reel_pratique' | 'story_rappel'
```

### Livrables

1. **UI "Nouvelle séquence blogue"** — Accessible depuis le calendrier
   (bouton ou action dans le menu). Judith colle un lien → le Hub :
   - Fetch le titre via OG tags ou scrape basique
   - Affiche un aperçu : titre + séquence prévue avec les dates
   - Bouton "Créer la séquence"

2. **Fonction `createBlogSequence()`** — Batch Firestore qui crée :
   - Le document BlogSequence
   - 4 CalendarSlots liés (2 auto-story + 2 slots Reel)
   - Les stories auto ont `autoPublish: true` et un template assigné

3. **Publication automatique des stories** — Le cron Vercel existant
   détecte les slots avec `autoPublish: true` + `scheduledDate ≤ now`
   et publie via S03. Utilise les templates de story (titre + image).

4. **Vue séquence dans le calendrier** — Les 4 éléments de la séquence
   sont visuellement liés (badge numéroté 1/4, 2/4... ou ligne de connexion).
   Taper sur un élément de séquence montre le contexte : "Fait partie de
   la séquence pour l'article [titre]".

5. **Prompts d'aide sur les slots Reel** — Les slots de la séquence
   ont un `promptTitle` et `promptDescription` pré-remplis :
   - Reel résumé : "Regarde la caméra et explique le point principal de ton
     article '[titre]' en 30-60 sec"
   - Reel pratique : "Donne UN conseil concret tiré de '[titre]' que les
     gens peuvent essayer chez eux"

### Definition of Done

- [ ] Judith peut coller un lien de blogue et créer une séquence
- [ ] Le titre de l'article est automatiquement récupéré
- [ ] 4 éléments apparaissent dans le calendrier aux bonnes dates
- [ ] Les 2 stories auto se publient via le cron sans intervention
- [ ] Les 2 slots Reel ont des prompts d'aide contextuels
- [ ] Les éléments de séquence sont visuellement liés dans le calendrier
- [ ] Une séquence est marquée "completed" quand tous ses éléments sont done

---

## S05 — Optimisation par plateforme

### Objectif
Rendre chaque publication **optimale pour sa plateforme** en appliquant
automatiquement les meilleures pratiques : CTA adapté, durée recommandée,
lien RDV au bon endroit, hashtags ciblés.

### Phase
OPTIMISER

### Dépendances
- Aucune (peut être fait en parallèle)

### Ce que la recherche nous dit (docs Claude Code)

| Élément | Instagram Reels | Facebook Reels | YouTube Shorts |
|---------|----------------|----------------|----------------|
| Durée idéale | 15-30s (portée) ou 60-90s (engagement) | Même vidéo | 13-15s ou 60s (bimodal) |
| Caption | Courte, hook en 125 premiers chars | Peut être plus longue | Titre SEO (mots-clés) |
| Hashtags | 3-5 max (2026) | Optionnels | Pas de hashtags, mots-clés dans titre |
| CTA | "Enregistre 📌" ou "Lien en bio" | "Lien en bio" | "Lien dans la description" |
| Lien RDV | Dans la bio uniquement | Dans la bio | Cliquable dans la description |
| Sous-titres | Essentiels (visionnage muet) | Essentiels | Essentiels + SEO |
| Heure optimale | Mar-Jeu 11h-14h | 10h-15h semaine | Mar-Mer 18h-19h |

### Livrables

1. **Enrichir `generateCaption`** — Adapter le prompt selon la plateforme
   cible. Le même contenu doit produire des captions différentes :
   - **Instagram** : Hook ≤125 chars en première ligne + CTA adapté au style
     + 3-5 hashtags ciblés + "Lien dans ma bio" (1 post sur 4-5)
   - **Facebook** : Caption plus longue autorisée + CTA communautaire
   - **YouTube** : Titre SEO-first (mots-clés) + description avec lien RDV
     cliquable + pas de hashtags

2. **CTA rotatif intelligent** — Le système alterne les CTAs selon le style
   du contenu et la plateforme, en suivant la stratégie de CONTENT_STRATEGY.md :
   - Enseigner → "Enregistre ce post"
   - Connecter → "Tu vis ça aussi? Dis-le en commentaire"
   - Aider → "Essaie et dis-moi comment ça s'est passé"
   - Inspirer → "Lien RDV dans ma bio" (seul style avec CTA conversion)

3. **Lien RDV automatique** — Utiliser la config Wix existante (M13)
   ou la créer si M13 n'est pas encore fait :
   - Instagram : texte "Lien dans ma bio" (pas de lien cliquable)
   - YouTube : lien complet avec UTM dans la description
   - Facebook : lien complet avec UTM

4. **Indicateur de durée** — Dans l'éditeur vidéo, afficher la durée
   recommandée selon la plateforme cible. Pas bloquant — juste informatif.
   "✓ 28 sec — Idéal pour Instagram" ou "⚠️ 45 sec — YouTube préfère 13-15s ou 60s"

5. **Checklist pré-publication** — Avant publication, rappeler les bonnes
   pratiques (optionnel, peut être caché) :
   - ✅ Hook dans les 3 premières secondes
   - ✅ Sous-titres activés
   - ✅ CTA clair
   - ✅ Géolocalisation (rappel pour Instagram)

### Definition of Done

- [ ] Les captions générées diffèrent selon la plateforme (IG vs FB vs YT)
- [ ] Le CTA varie selon le style du contenu
- [ ] Le lien RDV est inclus dans les captions YouTube/Facebook
- [ ] L'indicateur de durée est visible dans l'éditeur
- [ ] La checklist pré-publication s'affiche avant de publier

---

## S06 — Banque de templates (hooks & captions)

### Objectif
Fournir à Judith une **bibliothèque de référence** de formules de hooks
et de structures de captions, organisée par style, qu'elle peut consulter
quand elle cherche l'inspiration. PAS de l'IA qui génère — des templates
humains qu'elle consulte.

### Phase
OUTILLER

### Dépendances
- S01 (les styles existent pour filtrer les templates)

### Contenu de la banque

**Hooks (accroches pour les 3 premières secondes d'un Reel) :**

Enseigner :
- "Savais-tu que [fait surprenant]?"
- "3 choses que tu ne sais pas sur [sujet]"
- "Arrête de [habitude] si tu veux [résultat]"
- "La vérité sur [mythe courant]"

Connecter :
- "POV : une journée d'acupunctrice"
- "Ce que tu ne vois jamais dans une clinique"
- "Ce que [X] années de pratique m'ont appris"
- "Ma routine du [jour] à la clinique"

Aider :
- "Essaie ce point d'acupression ce soir"
- "Si tu as [symptôme], regarde ceci"
- "Le point que tout le monde devrait connaître"
- "Testez ça pendant 7 jours"

Inspirer :
- "Une patiente m'a dit [citation]"
- "[Nombre] séances plus tard, elle [résultat]"
- "Ce qui me touche le plus dans mon métier"
- "Pourquoi je fais de l'acupuncture solidaire"

**Structures de captions :**
- Template éducatif (stat → 3 points → CTA)
- Template témoignage (citation → contexte → résultat → CTA)
- Template FAQ (question → réponse courte → réponse longue → CTA)
- Template coulisses (moment → ce qu'on ne sait pas → question)

### Livrables

1. **Fichier de données statique** — `lib/data/templates.ts` contenant
   tous les hooks et structures, tagués par style. Pas de collection
   Firestore — c'est du contenu statique qui évolue rarement.

2. **Page ou section "Inspiration"** — Accessible depuis la navigation.
   Affiche les templates filtrables par style (4 onglets colorés).
   Chaque template a un bouton "Copier" pour le presse-papier.

3. **Lien contextuel depuis les slots** — Quand Judith ouvre un slot
   (S02) de style "Enseigner", un lien "Voir des idées de hooks →"
   l'amène à la banque filtrée sur "Enseigner".

### Definition of Done

- [ ] La page Inspiration affiche les templates par style
- [ ] Les templates sont filtrables par les 4 styles
- [ ] Le bouton Copier fonctionne sur chaque template
- [ ] Un lien contextuel existe depuis les slots du calendrier
- [ ] Les templates sont dans un fichier statique (pas Firestore)

---

## S07 — Encouragement & progression

### Objectif
Donner à Judith un **feedback visuel positif** sur sa régularité et ses
accomplissements, sans pression ni culpabilité. Style fitness tracker,
pas jeu mobile.

### Phase
MOTIVER

### Dépendances
- S02 (les slots et le calendrier-cadre existent pour calculer la progression)

### Concept : pas de gamification, de l'encouragement

**Ce qu'on fait :**
- Cercle de progression hebdomadaire (style Apple Watch)
- Compteur de séries de régularité (semaines consécutives avec au moins 1 publication)
- Jalons discrets (premier Reel, première séquence complète, 10 publications...)
- Messages contextuels chaleureux quand un slot est complété

**Ce qu'on ne fait PAS :**
- Points, XP, niveaux
- Classements
- Notifications push de rappel
- Messages culpabilisants ("Tu as perdu ta série!")
- Le mot "mission" ou "gamification" nulle part dans l'UI

### Livrables

1. **Cercle de progression hebdomadaire** — Composant en haut du calendrier
   ou du dashboard. Montre X/Y slots complétés cette semaine.
   Animation douce quand ça progresse. Couleur qui change :
   pas commencé (gris) → en cours (sage) → complété (vert).

2. **Compteur de séries** — Petit badge discret : "4 semaines 🔥"
   (ou icône Heroicons `FireIcon`). Visible dans le profil ou le dashboard.
   Règle : une semaine compte si ≥1 publication a été faite.
   Si une semaine est sautée, la série repart à 0 sans message négatif.
   Message quand elle reprend : "Tu reprends cette semaine! 💪"

3. **Jalons** — Collection Firestore `milestones` (ou sous-doc du user).
   Jalons prédéfinis :
   - "Première publication via le Hub"
   - "Première Story automatique"
   - "Première séquence blogue complète"
   - "10 publications"
   - "25 publications"
   - "Série de 4 semaines"
   - "Série de 8 semaines"
   Quand un jalon est atteint, un toast/banner apparaît une fois.
   Les jalons sont visibles dans une section du profil.

4. **Messages contextuels** — Quand Judith complète un slot, un petit
   message contextuel apparaît (toast 3 sec) :
   - Slot standard : "✓ Publié!" (sobre)
   - Dernier slot de la semaine : "Semaine complète! 🎉"
   - Séquence blogue complète : "Ta séquence pour '[titre]' est complète!"
   - Nouveau jalon : "10 publications! Tu construis quelque chose de beau."

### Données à stocker

```typescript
// users/{userId} — champs ajoutés ou sous-document
progressData: {
  currentStreak: number          // Semaines consécutives actives
  longestStreak: number          // Record personnel
  totalPublished: number         // Total publications via le Hub
  milestonesUnlocked: string[]   // IDs des jalons débloqués
  lastActiveWeek: string         // "2026-W15" — pour calculer la série
}
```

### Definition of Done

- [ ] Le cercle de progression affiche X/Y pour la semaine courante
- [ ] Le compteur de séries affiche le bon nombre de semaines
- [ ] Un jalon déclenche un toast quand atteint pour la première fois
- [ ] Les jalons sont visibles dans le profil
- [ ] Aucun message négatif n'apparaît si Judith saute une semaine
- [ ] La série repart à 0 silencieusement (pas de "tu as perdu!")

---

## S08 — Calendrier visuel enrichi

### Objectif
Enrichir le calendrier existant avec des **indicateurs visuels** qui
permettent à Judith de voir d'un coup d'œil l'équilibre de son contenu,
les séquences en cours, et le rythme du mois.

### Phase
POLIR

### Dépendances
- S01 (code couleur par style)
- S02 (slots dans le calendrier)

### Livrables

1. **Code couleur par style** — Chaque jour dans le calendrier montre
   un indicateur coloré selon le style du contenu :
   🔵 Enseigner, 🟢 Connecter, 🟡 Aider, 🟣 Inspirer.
   Si plusieurs contenus le même jour, plusieurs points.

2. **Indicateur de séquence** — Les éléments d'une séquence blogue
   sont connectés visuellement. Options :
   - Ligne pointillée entre les jours concernés
   - Badge "1/4" "2/4" sur chaque élément
   - Ou simplement une icône commune (ex: BookOpenIcon)

3. **Résumé mensuel** — En haut du calendrier, un résumé du mois :
   - Répartition par style (4 pastilles avec compteur)
   - Alerte douce si déséquilibre (ex: "Beaucoup d'Enseigner ce mois-ci,
     tu pourrais essayer un Connecter?" — pas bloquant, juste informatif)

4. **État visuel des slots** — Distinction claire entre :
   - Slot ouvert (outline pointillé, couleur du style)
   - Slot rempli (carte avec titre, couleur du style)
   - Slot complété (checkmark, couleur atténuée)
   - Slot skippé (grisé, discret)
   - Story auto (icône robot/sparkle, pas d'action requise de Judith)

### Definition of Done

- [ ] Les jours du calendrier montrent les pastilles de couleur par style
- [ ] Les séquences blogue sont visuellement liées
- [ ] Le résumé mensuel montre la répartition par style
- [ ] Les 5 états de slot sont visuellement distincts
- [ ] Le calendrier reste lisible sur mobile 375px

---

## Documents à mettre à jour après chaque milestone

| Document | Quoi mettre à jour |
|----------|--------------------|
| `03_TECH/DATA_MODEL.md` | Nouveaux champs, nouvelles collections |
| `02_ROADMAP/ROADMAP_OVERVIEW.md` | Status des milestones |
| `01_PRODUCT/STRATEGIE/CENTRE_NEVRALGIQUE.md` | Features complétées |
| `CLAUDE.md` | Si nouvelles règles ou conventions |

---

## Prompt one-shot

Chaque milestone aura son prompt one-shot rédigé au moment de l'implémenter,
suivant le format de `/skills/oneshot-prompt-writer/SKILL.md`.
Les prompts seront sauvegardés dans `project-docs/02_ROADMAP/prompts_used/milestone_S[XX]/`.

Le prompt sera rédigé par Claude Desktop (architecte) après avoir lu
la codebase actuelle pertinente, et donné à Claude Code (implémenteur)
comme one-shot autonome.

---

## Après la Phase Stratégie

| Feature | Phase |
|---------|-------|
| Configuration du rythme par Judith | AUTONOMIE |
| Thèmes mensuels saisonniers (MTC) | CONTENU |
| TikTok distribution | DISTRIBUER |
| Tableau d'inspiration (sauvegarder des posts IG) | OUTILLER |
| Refonte blogue Wix | EXTERNE |
| Page lien RDV optimisée | CONVERTIR |
