# CLAUDE.md — Mon Acupunctrice Hub V2
*Lu par Claude Code à chaque session. Ne pas ignorer.*

---

## Objectif du produit

> Ce produit est réussi uniquement si Judith l'utilise réellement chaque semaine.
> Toute décision technique doit servir cet objectif.

**Deuxième objectif :** faire grandir la présence Instagram de Judith
et augmenter le trafic vers son site Wix.

---

## Rôles dans ce projet

- **Claude Desktop** = stratégiste, architecte, troubleshooter
- **Claude Code** = implémenteur, one shot par milestone

---

## Avant de coder quoi que ce soit

Lire dans cet ordre :
1. `project-docs/00_VISION/VISION_FINALE.md`
2. `project-docs/02_ROADMAP/ROADMAP_OVERVIEW.md`
3. Le milestone en cours dans `project-docs/02_ROADMAP/`
4. `project-docs/04_DEV_SYSTEM/TROUBLESHOOT_SYSTEM.md` si debugging

## Système de troubleshoot

Claude Desktop + Claude in Chrome + Desktop Commander.
Voir `project-docs/04_DEV_SYSTEM/TROUBLESHOOT_SYSTEM.md`.
- Injecter des logs préfixés `[DEBUG NomComposant]`
- Lire avec `read_console_messages(pattern="DEBUG")`
- Nettoyer avant commit : 0 console.log en prod

---

## Stack technique

```
Frontend   : Next.js 15 (App Router)
Database   : Firebase Firestore
Auth       : Firebase Auth (Google Sign-In uniquement)
Storage    : Firebase Storage
Functions  : Firebase Cloud Functions
Deployment : Vercel
Styling    : Tailwind CSS
State      : Zustand
```

---

## Règles absolues

### Ne jamais faire

- Ajouter une feature non présente dans le milestone en cours
- Créer de la complexité pour anticiper un besoin futur hypothétique
- Utiliser des patterns Next.js Pages Router (App Router only)
- Laisser des console.log en production
- Créer des fichiers de plus de 150 lignes sans justification

### Toujours faire

- Tester que l'auth fonctionne avant de coder les features
- Utiliser les Server Components par défaut, Client Components seulement si nécessaire
- Nommer les composants de façon explicite (PAS `Component1.tsx`)
- Commenter le POURQUOI, pas le QUOI
- Garder le data model dans `project-docs/03_TECH/DATA_MODEL.md`

---

## Structure du projet

```
/app                    → Next.js App Router pages
/components             → Composants React réutilisables
  /ui                   → Composants UI génériques (boutons, inputs...)
  /features             → Composants de features (editor, calendar...)
/lib                    → Utilities, Firebase config, helpers
/hooks                  → React hooks custom
/store                  → Zustand stores
/types                  → Types TypeScript partagés
/project-docs           → La bible du produit (NE PAS MODIFIER en codant)
```

---

## Ce qu'on ne build pas (voir 05_LATER)

- Système de rappels adaptatif complexe
- Mémoire comportementale
- Analytics avancés
- Multi-utilisateurs
- Génération automatique de contenu
- Éditeur vidéo professionnel avancé (WebGL, effets complexes)

---

## Règle de gel de l'éditeur

> Aucune nouvelle feature éditeur tant que :
> - Auth Firebase fonctionnelle ✅
> - Publication Instagram en 1 clic ✅
> - Dashboard minimal ✅

---

## Definition of Done (par feature)

Une feature est DONE quand :
1. Elle fonctionne sur mobile (375px)
2. Elle fonctionne après refresh (state persisté)
3. Elle ne casse pas les autres features
4. Un non-développeur peut l'utiliser sans explication
