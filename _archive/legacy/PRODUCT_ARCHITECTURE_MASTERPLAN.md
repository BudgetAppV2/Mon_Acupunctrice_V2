# PRODUCT_ARCHITECTURE_MASTERPLAN.md
# Mon_Acupunctrice — Document directeur vivant
*Version 1.1 — Mars 2026*
*Produit par : Benoît Archambault + Claude + ChatGPT/Codex*

---

## Principe central

> **L'humain crée, le système soutient.**

Ce produit n'est pas un générateur de contenu IA.
C'est un **hub éditorial personnel** qui aide Judith à rester organisée,
maintenir une cadence réaliste, et publier régulièrement.

---

## Règle de priorisation

> Une feature est prioritaire seulement si elle aide Judith à :
> - publier plus facilement
> - publier plus régulièrement
> - comprendre où elle en est
>
> Si une feature ne répond pas à ces critères → elle est reportée.

---

## Règle de gel de l'éditeur

> **Aucune nouvelle feature éditeur tant que :**
> - l'auth n'est pas en place
> - les règles Firestore ne sont pas sécurisées
> - Judith peut publier en 1 clic depuis l'éditeur
> - un dashboard simple existe
>
> L'éditeur actuel est **suffisant** pour publier.
> Il deviendra excellent après la stabilisation.

### L'éditeur "suffisant" (état actuel — assez bon)
- ✅ Trim fonctionnel
- ✅ Ajout de texte overlay (Konva)
- ✅ Sous-titres automatiques (Whisper)
- ✅ Import musique (Jamendo)
- ✅ Export MP4 stable
- ✅ Publication possible
- ✅ Slider timeline fonctionnel

### L'éditeur "excellent" (Phase polish — reporté)
- Filtres vidéo presets (9 styles CSS)
- Google Fonts picker (30 polices curées)
- Styles de texte presets (Neon, Gold, Stroke...)
- Animations d'entrée/sortie
- Stickers/Emojis (Twemoji)
- Templates quick-start
- Export WebCodecs (10-50x plus rapide)

---

## Positionnement

**Ce que le produit EST :**
Un système d'exploitation léger pour la production et la publication de
contenu d'une créatrice solo, avec mémoire, rappels, planification et
intelligence contextuelle minimale.

**Ce que le produit N'EST PAS :**
- Un générateur automatique de contenu
- Un "AI social media autopilot"
- Un outil de montage vidéo professionnel complexe
- Un remplacement de la créativité de Judith

---

## Rôle de l'IA

### Rôles acceptables (observer et recadrer)
- Rappeler ce qui doit être fait
- Résumer l'état du pipeline
- Détecter les trous de planning
- Suggérer un focus de semaine
- Mémoriser ce qui a été publié

### Rôles à limiter
- Création autonome de contenu
- Décisions opaques
- Recommandations trop fréquentes
- Écriture marketing générique

---

## Roadmap — Ordre de priorité

### 🔴 Milestone 01 — Foundation (MAINTENANT)
> Rendre le produit sûr et cohérent

1. Firebase Auth (priorité #1 absolue)
2. Firestore/Storage security rules
3. Nettoyer les console.log de debug
4. Clarifier les deployments (1 URL canonique)
5. Unifier les statuts métier

**Règle : Rien d'autre avant M1 complété.**

### 🟠 Milestone 02 — Assistance (APRÈS M1)
> Soutenir la constance de Judith

1. Bouton "Publier maintenant" depuis l'éditeur
2. Publication programmée (scheduler)
3. Dashboard de santé éditoriale
4. Rappels intelligents (email)
5. Mémoire légère du pipeline

### 🟡 Milestone 03 — Polish Éditeur (APRÈS M2)
> Rendre l'éditeur excellent — pas avant

Voir MILESTONE_03_EDITOR_PRO.md

### 🟢 Milestone 04 — Growth (LONG TERME)
> Orienter vers Wix et conversions

- CTA mieux structurés
- Classification par objectif
- Liens Wix ciblés
- Métriques post → clic

---

## Schéma métier — ContentItem

### WorkflowState (production)
```
idea → planned → ready_to_shoot → shot → editing → ready
```

### DistributionStatus
```
draft → scheduled → publishing → published → failed
```

### Structure cible
```
ContentItem {
  idea: { title, topic, category, notes, createdAt }
  production: { workflowState, blitzSessionId, scheduledDate }
  asset: { videoUrl, thumbnailUrl, exportedAt }
  distribution: {
    instagram: { status, scheduledAt, publishedAt, postId, caption }
  }
  memory: { lastSuggestedAt, reuseScore, tags }
  analytics: { wixClicks, instagramViews }
}
```

---

## Architecture technique

### Stack
- Frontend : React 18 + Vite 6 + Tailwind (sage/sand)
- Backend : Firebase (Firestore + Storage + Cloud Functions)
- Déploiement : `mon-acupunctrice-hub1.onrender.com` (Node.js)
- Auth : ❌ MANQUANTE — priorité #1

### Dev local
```bash
cd hub && PORT=3001 node server.js   # Proxy Express
cd hub && npm run dev                 # Vite :5173
firebase emulators:start --only functions
```

---

## Risques identifiés

### 🔴 Critique
1. **Pas d'auth** — données publiquement accessibles
2. **Firestore rules ouvertes** — écriture possible par n'importe qui
3. **console.log** en production — debug logs visibles

### 🟡 Important
4. **Deux deployments** — clarifier URL canonique
5. **Statuts métier incohérents** — refactor progressif
6. **Export lent** — dette WebCodecs (Phase polish)

---

## Ce qui est construit (état mars 2026)

### ✅ Fonctionnel
- Banque d'idées, Calendrier, Vue Blitz
- Éditeur vidéo complet (webcam, trim, texte, sous-titres, audio)
- Export MP4 (FFmpeg.wasm multithreaded)
- Sauvegarde Firebase + thumbnail
- Bibliothèque Jamendo + musique sync
- Publication Instagram + scheduler
- Slider timeline (seekTo via Zustand)
- Navigation React Router

### ❌ Manquant (M1 + M2)
- Firebase Auth
- Security rules
- Bouton "Publier maintenant"
- Dashboard santé éditoriale
- Rappels intelligents
