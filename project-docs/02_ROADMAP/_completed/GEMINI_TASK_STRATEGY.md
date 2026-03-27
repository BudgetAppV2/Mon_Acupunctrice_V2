# GEMINI TASK — Analyse de faisabilité Phase Stratégie (S01-S08)

## Ta mission

Analyse la codebase actuelle de Mon Acupunctrice Hub V2 et produis un
**document d'analyse de faisabilité** pour chaque milestone de la Phase
Stratégie (S01 à S08).

Pour chaque milestone, tu dois :
1. Lister **chaque fichier existant** qui devra être modifié, avec ce qui change
2. Lister **chaque nouveau fichier** à créer
3. Identifier les **risques techniques** et les incompatibilités potentielles
4. Évaluer la **complexité** (Petit / Moyen / Gros)
5. Identifier les **dépendances** entre milestones et avec le code existant
6. Signaler si quelque chose dans la roadmap est **infaisable ou mal estimé**

## Ce que tu dois lire AVANT de commencer

### Fichiers critiques (lis-les tous)

**Data model & types :**
- `lib/types/index.ts` → Tous les types TypeScript actuels (ContentItem, enums, etc.)
- `project-docs/03_TECH/DATA_MODEL.md` → Schema Firestore documenté
- `firestore.rules` → Security rules actuelles

**Calendrier (impacté par S01, S02, S07, S08) :**
- `components/features/calendar/CalendarView.tsx` → Composant principal calendrier
- `components/features/calendar/CalendarDay.tsx` → Rendu d'un jour
- `components/features/calendar/CalendarHeader.tsx` → Header du calendrier
- `components/features/calendar/DashboardBar.tsx` → Barre résumé en haut
- `components/features/calendar/ItemDetailSheet.tsx` → Detail sheet au tap
- `components/features/calendar/ScheduleSheet.tsx` → Sheet pour planifier
- `lib/hooks/useCalendar.ts` → Hook custom du calendrier

**Idées (impacté par S01, S06) :**
- `components/features/ideas/` → Tous les fichiers
- `lib/hooks/useContentItems.ts` → Query des content items
- `lib/hooks/useCreateContentItem.ts` → Création
- `lib/hooks/useUpdateContentItem.ts` → Mise à jour

**Publication (impacté par S03, S04, S05) :**
- `app/api/cron/publish/route.ts` → Cron de publication (1x/jour, midi UTC)
- `app/api/publish/route.ts` → API route publication Instagram
- `app/api/publish-facebook/route.ts` → API route Facebook
- `app/api/publish-youtube/route.ts` → API route YouTube
- `app/api/generate-caption/route.ts` → Génération de caption IA
- `lib/hooks/usePublish.ts` → Hook publication côté client
- `components/features/publish/` → Tous les fichiers

**Profil & stats (impacté par S07) :**
- `components/features/profile/` → Tous les fichiers
- `components/features/stats/` → Tous les fichiers
- `app/(app)/profil/page.tsx`
- `app/(app)/stats/page.tsx`

**Configuration :**
- `vercel.json` → Config des crons (actuellement 2 : publish à midi, insights à 10h)
- `firebase.json` → Config Firebase
- `app/(app)/layout.tsx` → Layout principal avec bottom tab bar

**Navigation :**
- `components/ui/BottomTabBar.tsx` (ou similaire) → Navigation principale

### Documents stratégie (contexte produit)
- `project-docs/HANDOFF.md` → Résumé complet du projet
- `project-docs/01_PRODUCT/STRATEGIE/CENTRE_NEVRALGIQUE.md` → Vision stratégique
- `project-docs/01_PRODUCT/CALENDRIER_CADRE.md` → Plan 6 mois
- `project-docs/01_PRODUCT/CONTENT_STRATEGY.md` → Stratégie CTA et conversion

## La roadmap à analyser

Lis le fichier `project-docs/02_ROADMAP/ROADMAP_STRATEGY.md` — c'est la
roadmap complète des 8 milestones. Voici un résumé rapide :

| ID | Nom | Ce qui change |
|----|-----|---------------|
| S01 | Catégorisation par style | Nouveau champ `contentStyle` sur ContentItem, UI dans IdeaDetailSheet et CalendarDay |
| S02 | Calendrier-cadre | Nouvelle collection `calendarSlots`, nouveau hook, UI slots fantômes dans CalendarView |
| S03 | Stories Instagram API | Extension du système de publication pour `media_type=STORIES`, templates d'images |
| S04 | Séquences blogue | Nouvelle collection `blogSequences`, création batch de slots, auto-publish via cron |
| S05 | Optimisation plateforme | Modification de `generateCaption` pour adapter par plateforme, CTA rotatif, indicateur durée |
| S06 | Banque de templates | Nouveau fichier statique `lib/data/templates.ts`, nouvelle page/section Inspiration |
| S07 | Encouragement & progression | Nouveau sous-document user `progressData`, cercle progression, compteur séries, jalons |
| S08 | Calendrier visuel enrichi | Code couleur par style, connexions visuelles séquences, résumé mensuel |

## Format de sortie attendu

Pour **chaque milestone** (S01 à S08), produis une section avec :

```markdown
## S[XX] — [Nom]

### Complexité estimée : [Petit / Moyen / Gros]

### Fichiers à MODIFIER
- `path/to/file.ts` → [Ce qui change précisément]
- ...

### Fichiers à CRÉER
- `path/to/new/file.ts` → [Rôle du fichier]
- ...

### Impacts sur le data model
- [Nouveaux champs, nouvelles collections, indexes requis]

### Impacts sur les security rules
- [Changements à firestore.rules]

### Risques techniques
- [Tout ce qui pourrait mal tourner ou être plus compliqué que prévu]

### Dépendances
- [Quels milestones doivent être faits avant]
- [Quels fichiers existants sont des prérequis]

### Questions ouvertes
- [Points à clarifier avant l'implémentation]
```

## Points spécifiques à analyser

### Cron Vercel
Le cron actuel (`vercel.json`) est limité à 1 exécution/jour par route
sur le plan Hobby. Analyse si c'est suffisant pour S04 (stories auto)
ou s'il faut une stratégie alternative (ex: regrouper dans le même cron,
migrer vers Firebase Scheduled Functions).

### Coexistence slots + contentItems
S02 introduit une collection `calendarSlots` séparée de `contentItems`.
Analyse comment les deux collections cohabitent dans le CalendarView :
- Un jour peut avoir des slots ET des contentItems non liés à un slot
- Le hook `useCalendar` doit merger les deux sources
- Comment éviter les doublons visuels

### Publication Stories vs Reels
S03 ajoute la publication de Stories. Analyse les différences avec le
flow Reels existant dans `app/api/publish/route.ts` :
- Quels paramètres API changent (`media_type=STORIES`)
- Est-ce que le même cron peut gérer Reels ET Stories
- Limitations de l'API Stories (pas de caption, pas de stickers)

### Génération d'images pour Stories auto
S04 nécessite de générer des images de Story programmatiquement.
Analyse les options côté Vercel (Sharp? Canvas? Satori?) et les
contraintes de taille/mémoire des Serverless Functions Vercel.

### Navigation
S06 ajoute une page "Inspiration" (banque de templates). Analyse comment
l'intégrer dans la navigation existante (bottom tab bar, ou section dans
une page existante).

## Contraintes du projet (rappel)
- Heroicons uniquement, zéro emoji dans l'UI
- 0 console.log en production
- Composants < 150 lignes
- TypeScript strict
- Mobile first 375px
- App Router ONLY
- Fichiers à lire avant de coder (pattern one-shot)

## Livrable final

Un seul document Markdown : `CODEBASE_ANALYSIS_STRATEGY.md`
À placer dans `project-docs/02_ROADMAP/`.

Sois exhaustif sur les fichiers à modifier — c'est la partie la plus
importante. Ne sois pas vague ("modifier le calendrier") — nomme chaque
fichier avec le changement précis.
