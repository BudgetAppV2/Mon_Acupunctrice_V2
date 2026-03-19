# DECISIONS_PRODUIT.md
# Décisions validées — Session de planning Mars 2026
# Source de vérité pour les zones grises

---

## Auth & Onboarding

**Décision :** Login Google une seule fois → Face ID / Touch ID ensuite
- Première ouverture : écran login Google (simple, 1 bouton)
- Après authentification initiale : Face ID / Touch ID automatique
- Si biométrie échoue : fallback Google Sign-In
- Jamais de re-login forcé — session Firebase persistante
- Sur PWA standalone : comportement identique à une app native iOS

**Impact technique :**
```typescript
// Firebase Auth persistence
setPersistence(auth, browserLocalPersistence)
// + PWA installée = session maintenue indéfiniment
// Face ID géré par le OS iOS — pas besoin de code custom
// L'app est dévérrouillée via biométrie comme n'importe quelle app native
```

---

## Connexion Instagram

**Décision V1 :** Token hardcodé côté serveur (secret Firebase)
- `META_USER_TOKEN` et `META_IG_ACCOUNT_ID` dans Firebase Secrets
- Judith n'a rien à configurer — ça marche dès le départ
- Limitation : token expire (Meta les révoque périodiquement)
- Solution token expiré : Benoît renouvelle manuellement via Meta Developer

**V2 (futur) :** Flow OAuth dans l'onglet Profil
- Bouton "Connecter Instagram" → OAuth Meta
- Stockage sécurisé du token dans Firestore chiffré
- Refresh automatique

---

## Notifications

**Décision V1 :** Email seulement — 1 type de notification
- ✅ Confirmation quand une publication a réussi (email simple)
- ❌ Pas de rappels de tournage
- ❌ Pas d'alertes de planning
- ❌ Pas de push notifications (PWA push = trop complexe pour V1)

**Format de l'email de confirmation :**
```
Sujet: ✅ Ton Reel est en ligne!
Corps:  "L'eczéma chez l'enfant" a été publié sur Instagram.
        [Voir sur Instagram →]
```

**V2 :** Rappel si aucun contenu planifié cette semaine (1 email/semaine max)

---

## Éditeur — Nombre de clips vidéo

**Décision V1 :** 1 seul clip principal + clips B-roll courts
- Clip principal : la vidéo de Judith face caméra
- Clips B-roll : courtes vidéos supplémentaires (max 3) placées par-dessus
  ou insérées dans la timeline
- Transitions entre clips : coupe franche uniquement en V1
- Architecture store prévue pour multi-clip complet en V2

**Impact DATA_MODEL :**
```typescript
interface VideoTrack {
  mainClip: VideoClip           // Clip principal (obligatoire)
  brollClips: VideoClip[]       // B-roll optionnels (max 3 en V1)
}
```

---

## Onglet Profil — Contenu

**Décision :** 4 sections dans l'onglet Profil

```
┌─────────────────────────────────┐
│  [Photo] Judith Tremblay        │  ← Nom depuis Google Auth
│  Acupunctrice · Montréal        │
├─────────────────────────────────┤
│  📊 MES STATS                   │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐   │
│  │ 12 │ │  3 │ │  5 │ │ 24 │   │
│  │pub.│ │plan│ │prêt│ │idée│   │
│  └────┘ └────┘ └────┘ └────┘   │
├─────────────────────────────────┤
│  📋 HISTORIQUE                  │
│  [liste des 10 dernières publi] │
├─────────────────────────────────┤
│  ⚙️ COMPTE                      │
│  › Mon site Wix                 │
│  › Déconnexion Google           │
└─────────────────────────────────┘
```

**Éléments :**
- ✅ Stats (publiés, planifiés, prêts, idées) — calculés Firestore
- ✅ Historique des publications (10 dernières, lien Instagram)
- ✅ Lien vers son site Wix (configurable dans les settings)
- ✅ Déconnexion Google
- ❌ Connexion Instagram (hardcodé V1 — pas d'UI nécessaire)
- ❌ Préférences langue (app en français uniquement)
- ❌ Gestion des notifications (pas de push en V1)

---

## Caption IA — Ton et contenu

**Décision : SEO-first, hashtags quasi-absents**

Judith a raison — les hashtags sont morts en 2026.
Adam Mosseri (Instagram CEO) l'a confirmé : Instagram fonctionne
maintenant comme un moteur de recherche. Les mots-clés naturels
dans la caption > hashtag stuffing.

**Nouvelle approche :**
- Captions riches en mots-clés naturels que les patients cherchent
- Hook percutant en première ligne (indexé en priorité)
- CTA explicite vers le site Wix selon la catégorie du contenu
- Max 3 hashtags ultra-ciblés (pas génériques)
- Français québécois authentique

**Distribution :**
- V1 : Instagram uniquement
- V2 : YouTube Shorts (même fichier, API Google OAuth)
- V2 : Facebook Reels (même token Meta que IG)

Voir `project-docs/01_PRODUCT/CONTENT_STRATEGY.md` pour le détail complet.

---

## Vue Blitz (session de tournage)

**Décision :** Mode focus — une idée à la fois

```
┌─────────────────────────────────┐
│  ⚡ Session Blitz               │
│  Mercredi 19 mars · 3 idées     │
├─────────────────────────────────┤
│                                 │
│  2 / 3 filmées                  │
│  ████████████░░░░ 67%           │
│                                 │
│  ┌─────────────────────────────┐│
│  │ 🎬 À filmer maintenant      ││
│  │                             ││
│  │ "L'acupuncture et la        ││
│  │  fertilité masculine"       ││
│  │                             ││
│  │ Catégorie : Fertilité       ││
│  │ Notes : parler des points   ││
│  │ d'énergie yang...           ││
│  └─────────────────────────────┘│
│                                 │
│  [✅ Filmé! Suivante →]         │  ← Bouton principal
│  [⏭️ Passer]                    │
│  [📷 Ouvrir l'éditeur]          │
│                                 │
├─────────────────────────────────┤
│  Suivantes : L'insomnie · Sueur │
└─────────────────────────────────┘
```

**Flow :**
1. Judith sélectionne ses idées "à filmer" depuis la banque d'idées
2. L'app les présente une par une en mode focus
3. "Filmé!" → statut passe à "shot" → idée suivante
4. "Ouvrir l'éditeur" → monte directement depuis la session Blitz
5. Barre de progression en haut

---

## Wix — Intégration V1

**Décision :** 2 points de contact seulement

1. **CTA dans les captions** — lien vers le site inclus automatiquement
   URL configurable dans le profil (ex: `judithtremblay-acupuncture.com`)

2. **Lien dans l'onglet Profil** — bouton "Mon site Wix" qui ouvre le site

❌ Pas de tracking pour l'instant (trop complexe, besoin de Wix API)
❌ Pas de classification par objectif commercial
→ V2 quand on a des données d'usage réel

---

## Format d'export

**Décision V1 :** Reels 9:16 uniquement (1080×1920)
- Stories = même format 9:16 → pas de différence technique
- Post carré (1:1) → BACKLOG V2
- Post portrait (4:5) → BACKLOG V2

**Raison :** Judith fait des Reels. C'est son format principal.
Inutile de complexifier l'export pour V1.
