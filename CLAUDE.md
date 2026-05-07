# CLAUDE.md — Mon Acupunctrice Hub V2
*Lu par Claude Code à chaque session. Ne pas ignorer.*

---

## Objectif du produit

> Ce produit est réussi uniquement si Judith l'utilise réellement chaque semaine.
> Toute décision technique doit servir cet objectif.

**Deuxième objectif :** faire grandir la présence en ligne de Judith
et augmenter les prises de rendez-vous via Go Rendez-Vous.

---

## Rôles dans ce projet

- **Claude Desktop** = stratégiste, architecte, troubleshooter
- **Claude Code** = implémenteur, one shot par milestone, analyse codebase
- **Gemini CLI** = premier passage d'analyse, recherche, audit

---

## Avant de coder quoi que ce soit

Lire dans cet ordre :
1. Ce fichier (CLAUDE.md)
2. `project-docs/HANDOFF.md` → résumé complet du projet
3. **Si tu travailles sur la migration du site public de Judith** : lire `docs/migration-wix/CLAUDE.md` puis le milestone en cours dans `project-docs/02_ROADMAP/migration-wix/`
4. Sinon : le milestone en cours dans `project-docs/02_ROADMAP/`
5. `project-docs/04_DEV_SYSTEM/TROUBLESHOOT_SYSTEM.md` si debugging

---

## État actuel — Avril 2026

### Tout est complété et déployé ✅

| # | Milestone | Résumé |
|---|-----------|--------|
| M01-M07 | Fondations | Auth, PWA, Idées, Calendrier, Éditeur vidéo, Sous-titres, Publication IG |
| M08 | Deploy | Vercel production (mon-acupunctrice-v2.vercel.app) |
| M09 | OAuth Instagram | Business Login, token long-lived |
| M10 | Facebook Reels | OAuth + publication via Graph API |
| M11 | YouTube Shorts | OAuth Google + resumable upload |
| M12 | Stats & Analytics | Instagram Insights + recharts + cron quotidien |
| R/R2/R3 | Refinements | UX fixes, transcription vocale, éditeur multi-blocs |
| SCHEDULER | Cron Vercel | Publication automatique planifiée |
| S01-S08 | Stratégie | Système d'accompagnement contenu (archivé dans `_completed/`) |
| IMAGE_EDITOR | Éditeur d'image Fabric.js | Intégré à l'éditeur |

### Phase actuelle : MIGRATION WIX → VERCEL

On migre le site public de Judith (`acupuncturejudith.ca`) depuis Wix vers
une section publique du Hub V2 (Next.js/Vercel). Objectif : unifier
l'écosystème, reprendre le contrôle SEO, exploiter la réputation massive
de la clinique La Source en Soi (1 215 avis 4,9/5 sur Google).

**Documentation de la migration** :
- Plan éditorial stratégique : `docs/migration-wix/01-strategie/PLAN_EDITORIAL_SEO_GEO_v0.3.md`
- Contexte permanent Claude Code : `docs/migration-wix/CLAUDE.md`
- Milestones exécutables : `project-docs/02_ROADMAP/migration-wix/`
- Rapports de scouting : `docs/migration-wix/02-recherche/scouting/`

**Pipeline de contenu SEO/GEO (post-migration)** :
- Vision du pipeline : `project-docs/02_ROADMAP/content-strategy/VISION.md`
- Architecture technique (CC audit) : `project-docs/02_ROADMAP/content-strategy/ARCHITECTURE.md`
- Backlog mots-clés + données Ubersuggest/ATP : `project-docs/02_ROADMAP/content-strategy/KEYWORD_BACKLOG.md` (767 lignes, 150+ mots-clés)
- Plan de lancement : `project-docs/02_ROADMAP/LAUNCH_PLAN.md` (626 lignes, 6 phases)
- Handoff : `project-docs/HANDOFF_DESKTOP_2026-04-29.md`

**Décisions prises** :
- R1 : Couper Wix → OUI
- R2 : Auth admin → hardcoder UID Benoit
- R3 : Analytics → Plausible Cloud 9$/mois
- R4 : Éditeur CMS → textarea markdown + preview
- R5 : Bilingue → NON pour l'instant (data-driven après 2-3 mois)
- R6 : GBP → UN SEUL GBP praticien (multi-site), adresse principale LSSI
- R7 : Avis Google → zone grise OAQ, courriel envoyé pour clarification
- R8 : Domaines → garder 3 (acupuncturejudith.ca, grossesseacupuncture.ca, mon-acupunctrice.ca), expirer judithdufoursavardacu.com

**Sprints CC complétés** :
- ✅ MW-F3a : Plausible Analytics (script + goal events)
- ✅ MW-E3 : Blog publish → Firestore (Wix coupé, -157 lignes)
- ✅ MW-E1 : CMS FAQ (CRUD + MarkdownField réutilisable)
- ✅ MW-E2 : CMS Ressources (formulaire multi-section, citations, FAQ)
- ✅ MW-E4 : Workflow validation Judith (approve/comment/submit, badge pending)
- ✅ GRV : centralisation URLs dans lib/utils/rdvUrl.ts (LSSI + Eden)
- ✅ Eden Yoga Pilates : 2e clinique intégrée (18 fichiers)
- ✅ Corrections Judith : 53 corrections appliquées (tarifs, terminologie, formulations)

**📌 Source canonique d'entité** : `project-docs/02_ROADMAP/content-strategy/ENTITY_SOURCE_OF_TRUTH.md` (SOT v1.5+).
Toute mise à jour identité/NAP/spécialités/bios/profils externes part de ce fichier. En cas de divergence avec le résumé ci-dessous, le SOT fait foi.

**Deux cliniques** :
- La Source en Soi : 2554 rue Beaubien Est, Montréal QC H1Y 1G3 (Rosemont) | GRV companyId=104074 eids=175708
- Éden Yoga Pilates : 121 boulevard Industriel local 225, Repentigny QC J6A 7K4 | GRV companyId=141296 eids=192390 stype=Acupuncture
- Judith : LSSI lun-mar-jeu-ven, Éden mercredi 9h-15h (pas d'acupuncture sociale à Éden)

**Profils sociaux officiels** (utiliser ces URLs exactes partout — schema, footer, llms.txt) :
- Instagram : `https://www.instagram.com/mon_acupunctrice/`
- YouTube : `https://www.youtube.com/@JudithDufourSavard`
- Facebook : `https://www.facebook.com/profile.php?id=61562614934143`
- LinkedIn : `https://www.linkedin.com/in/judith-dufour-savard-acu/`
- Wikidata : `https://www.wikidata.org/wiki/Q139677208`

**Domaine canonique** : `https://www.acupuncturejudith.ca` (avec www, redirect 308 non-www → www)

**AEO (AI Engine Optimization)** :
- Score Framer AEO : 98/100
- Score CiteRadar : 86/100
- llms.txt : `public/llms.txt` (statique, sujets publiés seulement)
- llms-full.txt : `public/llms-full.txt` (auto-généré via `node scripts/generate-llms-full.mjs`)
- GlobalJsonLd : `app/(public)/_components/GlobalJsonLd.tsx` (WebSite, Person, MedicalBusiness, 2 Places)
- Pont admin : `AdminFloatingButton.tsx` (visible seulement aux users Firebase Auth connectés)
- Crawlers AI : 7 autorisés explicitement dans robots.txt (GPTBot, ClaudeBot, PerplexityBot, etc.)

**Pipeline d'injection de contenu** :
- Source de vérité : fichiers markdown dans `content/` (versionnés git)
- Template : `content/ressources/_TEMPLATE.md` (frontmatter YAML + sections ##)
- Injection : `node content/scripts/inject.mjs content/ressources/fichier.md [--dry-run]`
- Audit fraîcheur : `node content/scripts/audit-freshness.mjs`
- Retrait : `node content/scripts/retire.mjs <collection> <slug> [--delete]`
- Workflow : markdown → inject (status pending) → Judith approuve dans Hub → published → ISR
- Documentation complète : `content/README.md`

**⚠️ RÈGLE CRITIQUE — Cohérence AEO (contenu pending vs déclarations)** :
Ne JAMAIS déclarer dans le schema JSON-LD (`knowsAbout`, `availableService`), dans `llms.txt`, ou dans `llms-full.txt` un sujet dont la page/ressource n'est PAS encore publiée (status !== published). Les LLMs détectent l'incohérence entre "ce site dit traiter la ménopause" et "la page ménopause retourne 404".

Quand une ressource passe de pending → published (Judith approuve dans le Hub) :
1. Décommenter la ligne correspondante dans `app/(public)/_components/GlobalJsonLd.tsx` (knowsAbout + availableService)
2. Ajouter le sujet dans `public/llms.txt` (description + specialties)
3. Régénérer `llms-full.txt` : `node scripts/generate-llms-full.mjs`
4. Commiter et pousser

Quand une ressource est retirée (published → draft via retire.mjs) :
1. Commenter la ligne dans GlobalJsonLd.tsx
2. Retirer du llms.txt
3. Régénérer llms-full.txt
4. Commiter et pousser

Les 5 services de base (fertilité, grossesse, pédiatrie, sociale, stress/anxiété) sont TOUJOURS déclarés — ils ont des pages permanentes. Les sujets additionnels (ménopause, SOPK, douleur chronique, FIV, endométriose, etc.) ne sont ajoutés que quand leur ressource est publiée.

**CMS dans le Hub** :
- Onglet "Contenu" dans la navigation (5e onglet)
- Dashboard unifié : blog + FAQ + ressources avec filtres type/statut
- Formulaires : /contenu/faq/new, /contenu/faq/[id], /contenu/ressources/new, /contenu/ressources/[id]
- API routes : /api/cms/list, /api/cms/approve, /api/cms/comment, /api/cms/submit, /api/cms/faq/*, /api/cms/ressources/*
- Composants réutilisables : MarkdownField, StatusBadge, ContentReviewCard

### Feedback de Judith (toujours valide)

- Elle aime les 4 styles : Enseigner / Connecter / Aider / Inspirer
- Elle est déjà à ~2 publications/semaine
- Elle veut une STRUCTURE, pas des suggestions de contenu IA
- Les sujets doivent être ouverts (ex: acupuncture solidaire)
- Le générateur de caption existant est conservé tel quel

---

## Stack technique

```
Frontend   : Next.js 15 App Router + TypeScript
Styling    : Tailwind CSS + Heroicons
State      : Zustand
Auth       : Firebase Auth (Google Sign-In)
Database   : Firebase Firestore
Storage    : Firebase Storage
Functions  : Firebase Cloud Functions (Gen 2)
Video      : WebCodecs + FFmpeg.wasm (fallback)
Deployment : Vercel
Charts     : recharts
PWA        : next-pwa
```

---

## Structure du projet

```
app/
  (app)/                     → Pages protégées
    calendrier/              → CalendarView (grille mensuelle)
    idees/                   → Banque d'idées
    editeur/                 → Éditeur vidéo
    profil/                  → Profil + stats résumé
    stats/                   → Stats détaillées (recharts)
    inspiration/              → Page Inspiration (suggestions de contenu)
    layout.tsx               → BottomTabBar (4 onglets: Idées, Calendrier, Stats, Profil)
  (auth)/                    → Login
  api/
    cron/publish/            → Cron publication multi-plateforme (1x/jour midi UTC)
    cron/fetch-insights/     → Cron stats Instagram (1x/jour 10h UTC)
    generate-caption/        → Proxy vers CF generateCaption (Claude/Anthropic)
    publish/                 → Proxy vers CF publishToInstagram
    publish-facebook/        → Publication Facebook directe
    publish-youtube/         → Publication YouTube directe
    voice-idea/              → Transcription vocale

components/features/
  calendar/                  → CalendarView, CalendarDay, CalendarHeader,
                               DashboardBar, ItemDetailSheet, ScheduleSheet
  ideas/                     → IdeaDetailSheet, ContentCard, CreateIdeaSheet
  editor/                    → Éditeur vidéo complet
  publish/                   → PublishSheet, CoverPicker, PlatformToggles
  profile/                   → Profil utilisateur, StatsSummary
  stats/                     → Graphiques recharts

lib/
  types/index.ts             → ContentItem, enums, types éditeur
  hooks/                     → useCalendar, useContentItems, usePublish, etc.
  store/                     → Zustand stores
  utils/                     → Utilitaires
  firebase.ts                → Config client
  firebase-admin.ts          → Config Admin (server-side)
```

---

## Architecture actuelle critique

### Calendrier
- `useCalendar` query `contentItems` par `scheduledAt` (range du mois)
- `CalendarDay` affiche un point coloré par workflowState
- Tap jour vide → `ScheduleSheet` (assigner un contentItem existant)
- Tap jour avec item → `ItemDetailSheet` (détails, publier, éditer)
- **Pas de notion de "slot" ou d'emplacement vide typé** — c'est ce qu'on ajoute en S02

### Publication
- `usePublish` hook : publish immédiat (IG) ou schedule (date → Firestore)
- Cron `/api/cron/publish` : query `distributionStatus=='scheduled' + scheduledAt<=now`
- Publie IG via Cloud Function, FB et YT directement dans le cron
- **1 seul cron/jour** (vercel.json, plan Hobby) à midi UTC (8h Montréal)

### Captions IA
- `generateCaption` : proxy → Cloud Function → Claude (Anthropic)
- Accepte `title, category, notes, captionDraft`
- **Ne connaît pas la plateforme cible** ni le style de contenu — c'est ce qu'on ajoute en S05

### Navigation
- 4 onglets dans BottomTabBar : Idées, Calendrier, Stats, Profil
- 4 onglets dans BottomTabBar : Idées, Calendrier, Inspiration, Profil
- `grid-cols-4` dans le layout

---

## Crons Vercel (vercel.json)

```json
{
  "crons": [
    { "path": "/api/cron/publish", "schedule": "0 12 * * *" },
    { "path": "/api/cron/fetch-insights", "schedule": "0 10 * * *" }
  ]
}
```

**Contraintes plan Hobby** (mises à jour avril 2026) :
- **100 crons max par projet** (limite portée de 2 à 100 en janvier 2026)
- **1 exécution par jour maximum** par cron (ex. `0 12 * * *` OK, `0 * * * *` rejeté au déploiement)
- **Timing imprécis** : Vercel peut déclencher dans n'importe quelle minute de l'heure spécifiée (pour `0 12 * * *`, le trigger peut arriver entre 12:00 et 12:59)

On a donc de la marge pour ajouter des crons de migration (ISR revalidation,
fraîcheur SEO, sitemap) sans upgrade Pro. Si on a un jour besoin d'un cron
sub-quotidien ou précis à la minute, il faudra passer au plan Pro.

---

## Firestore indexes existants (firestore.indexes.json)

Tous sur `contentItems` :
- userId + workflowState + createdAt DESC
- userId + category + createdAt DESC
- userId + distributionStatus + scheduledAt ASC
- userId + createdAt DESC
- userId + scheduledAt ASC

**Nouvelle collection = nouveaux indexes à ajouter.**

---

## Règles absolues

### Ne jamais faire
- Ajouter une feature non présente dans le milestone en cours
- Créer de la complexité pour anticiper un besoin futur hypothétique
- Utiliser des patterns Pages Router (App Router only)
- Laisser des console.log en production
- Créer des fichiers de plus de 150 lignes sans justification
- Mettre des emoji dans l'UI (Heroicons uniquement)

### Toujours faire
- Tester que l'auth fonctionne avant de coder les features
- Server Components par défaut, Client Components si nécessaire
- Nommer les composants explicitement
- Commenter le POURQUOI, pas le QUOI
- Garder le data model dans `project-docs/03_TECH/DATA_MODEL.md`
- Mobile first 375px

---

## Definition of Done (par feature)

1. Fonctionne sur mobile (375px)
2. Fonctionne après refresh (state persisté)
3. Ne casse pas les autres features
4. Un non-développeur peut l'utiliser sans explication

---

## Ce qu'on ne build pas (voir 05_LATER)

- TikTok
- Système de rappels adaptatif / notifications push
- Mémoire comportementale
- Multi-utilisateurs
- Génération automatique de contenu (Judith ne veut pas)
- Éditeur vidéo avancé (WebGL)
- Intégration Canva API
