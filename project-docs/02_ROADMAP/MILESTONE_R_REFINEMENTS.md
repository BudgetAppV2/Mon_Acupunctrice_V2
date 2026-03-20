# UX FEEDBACK & REFINEMENTS — Pre-M08
*Feedback de Benoît — 19 mars 2026*
*À implémenter AVANT les milestones M08-M13*

---

## Principe

> L'app doit être agréable et fonctionnelle de bout en bout
> AVANT le déploiement. On ne déploie pas un MVP bancal.

---

## Décisions prises

| Sujet | Décision |
|-------|----------|
| Onglet Blitz | **Remplacé par Stats** (page vide pour l'instant, contenu M12) |
| Catégories | **Dropdown + "Autre" avec champ texte libre** |
| Statut des idées | **Automatique basé sur l'état du système** |
| Captions | **Judith écrit le texte, le système enrichit** (pas de génération IA du texte principal) |

---

## R01 — Page Idées : carte cliquable + dialogue de détail

### Problème
Les cartes d'idées ne sont pas cliquables. On ne peut pas voir ou éditer les métadonnées d'une idée (notes, catégorie, statut). Le seul CTA est le swipe-to-delete.

### Solution
Cliquer sur une ContentCard ouvre un **IdeaDetailSheet** (bottom sheet) qui montre le détail de l'idée et offre des actions contextuelles.

### Contenu du IdeaDetailSheet

**Section info (toujours visible) :**
- Titre (éditable inline ou via bouton modifier)
- Catégorie (dropdown éditable)
- Notes (textarea éditable)
- Statut actuel (badge, lecture seule — calculé automatiquement)
- Date de création

**Section vidéo (si vidéo associée) :**
- Thumbnail preview
- Durée
- Date d'export

**Section caption :**
- Zone de texte pour que Judith écrive sa caption (ou l'édite si elle existe)
- Bouton "Optimiser" → le système enrichit le texte de Judith :
  - Reformate pour la plateforme (longueur, structure)
  - Ajoute les mots-clés SEO naturels selon la catégorie
  - Insère le CTA + lien Wix approprié
  - Ajoute 3 hashtags ciblés
  - Applique les bonnes pratiques créateur (hook en première ligne, etc.)
- Judith garde le contrôle : elle voit le résultat et peut modifier
- Le texte original de Judith est préservé (champ `captionDraft`),
  le texte enrichi est dans `caption`
- Bouton "Repartir de mon texte" pour annuler l'enrichissement

**Actions contextuelles (boutons en bas, varient selon le statut) :**

| Statut actuel | Actions disponibles |
|---------------|---------------------|
| Idée | "Ouvrir l'éditeur" (importer une vidéo) · Modifier · Supprimer |
| Filmée | "Ouvrir l'éditeur" (monter la vidéo) · Modifier · Supprimer |
| En montage | "Continuer le montage" · Modifier · Supprimer |
| Prête | "Planifier" · "Publier maintenant" · "Ouvrir l'éditeur" · Supprimer |
| Planifiée | "Changer la date" · "Déprogrammer" · "Ouvrir l'éditeur" |
| Publiée | "Voir sur Instagram" · "Voir les stats" (→ /stats ou détail performance) · "Republier" (futur) |

Le bouton principal (pleine largeur, couleur sage) est toujours l'action la plus logique :
- Idée → "Créer le contenu" (ouvre l'éditeur avec import vidéo)
- Filmée → "Monter la vidéo"
- Prête → "Planifier la publication"
- Publiée → "Voir les stats"

### Fichiers concernés
- `components/features/ideas/IdeaDetailSheet.tsx` (nouveau)
- `components/features/ideas/ContentCard.tsx` (ajouter onClick)
- `components/features/ideas/IdeaList.tsx` (passer le handler)
- `app/(app)/idees/page.tsx` (state pour le sheet)

---

## R02 — Swipe-to-delete : bouton visible derrière la carte

### Problème
Le bouton supprimer rouge (TrashIcon) est partiellement visible derrière la carte au repos. Il dépasse visuellement.

### Solution
Le fond rouge avec l'icône ne doit être visible QUE pendant le swipe.
Ajouter `opacity-0` par défaut et l'afficher progressivement pendant le swipe.
Ou : clip le conteneur pour que rien ne dépasse au repos.

### Fichier concerné
- `components/features/ideas/ContentCard.tsx`

---

## R03 — Statut automatique des idées (workflow state machine)

### Problème
Le statut d'une idée ne change jamais automatiquement. Judith doit mentalement tracker où elle en est. Rien n'apparaît dans les filtres ou le calendrier parce qu'aucune idée n'atteint les statuts avancés.

### Solution
Le `workflowState` est calculé automatiquement basé sur les champs remplis du contentItem :

```
Règles de dérivation du statut (évaluées de haut en bas, premier match gagne) :

1. distributionStatus === 'published'      → 'ready'
   Trigger : la Cloud Function publishToInstagram met distributionStatus='published'
   Affiché : "Publiée"

2. distributionStatus === 'scheduled'      → 'ready'
   Trigger : Judith planifie une date dans le calendrier ou le detail sheet
   Affiché : "Planifiée" (avec date)

3. videoUrl existe ET exportedAt existe    → 'ready'
   Trigger : l'export vidéo est terminé (ExportButton écrit videoUrl + exportedAt)
   Affiché : "Prête"

4. videoUrl existe ET editorTouchedAt existe → 'editing'
   Trigger : Judith modifie n'importe quel paramètre dans l'éditeur
   (filtre, texte, sous-titre, audio, trim). Le store écrit editorTouchedAt
   au premier changement après ouverture.
   Affiché : "En montage"

5. videoUrl existe                         → 'shot'
   Trigger : Judith importe ou filme une vidéo dans l'éditeur.
   L'éditeur écrit videoUrl dans Firestore dès l'import.
   Affiché : "Filmée"

6. scheduledAt existe (sans vidéo)          → 'planned'
   Trigger : Judith assigne une date à une idée sans vidéo
   Affiché : "Planifiée"

7. sinon                                   → 'idea'
   Trigger : création d'une nouvelle idée
   Affiché : "Idée"
```

**Nouveaux champs Firestore nécessaires sur ContentItem :**
```typescript
editorTouchedAt?: Timestamp  // mis à jour quand Judith modifie un param éditeur
exportedAt?: Timestamp       // mis à jour quand l'export est terminé
captionDraft?: string        // texte original de Judith (avant enrichissement IA)
```

**Important :** On garde `workflowState` dans Firestore pour les queries et filtres, mais on le recalcule à chaque mise à jour du document. Le statut affiché combine `workflowState` + `distributionStatus` pour donner le vrai état.

**Statut affiché (ce que Judith voit) :**

| workflowState | distributionStatus | Affiché |
|---------------|--------------------|---------|
| idea | draft | Idée |
| planned | draft | Planifiée |
| shot | draft | Filmée |
| editing | draft | En montage |
| ready | draft | Prête |
| ready | scheduled | Planifiée (avec date) |
| ready | publishing | Publication en cours... |
| ready | published | Publiée |
| ready | failed | Échec publication |

### Implémentation
- Créer `lib/utils/deriveWorkflowState.ts` — fonction pure qui prend un ContentItem et retourne le workflowState
- Appeler cette fonction dans `useUpdateContentItem` et `useCreateContentItem` à chaque écriture
- Le hook met à jour `workflowState` automatiquement, Judith n'a rien à faire

### Fichiers concernés
- `lib/utils/deriveWorkflowState.ts` (nouveau)
- `lib/hooks/useUpdateContentItem.ts` (appeler deriveWorkflowState avant chaque update)
- `lib/hooks/useCreateContentItem.ts` (set workflowState = 'idea' par défaut)

---

## R04 — Filtres simplifiés (boutons + bottom sheets)

### Problème
Les filtres par statut et par catégorie sont des rangées de pills scrollables horizontalement. Sur mobile c'est peu ergonomique — on ne voit pas toutes les options, et ça prend beaucoup de place verticale (2 rangées).

### Solution
Remplacer par **2 boutons-filtres compacts** côte à côte. Chaque bouton ouvre un **bottom sheet** avec la liste des options.

```
┌──────────────┐  ┌──────────────┐
│ Tous statuts ▾│  │ Catégorie   ▾│
└──────────────┘  └──────────────┘
         ↓ tap
┌─────────────────────────────┐
│  Filtrer par statut          │
├─────────────────────────────┤
│  ○ Tous                      │
│  ○ Idée                      │
│  ○ Filmée                    │
│  ○ En montage                │
│  ○ Prête                     │
│  ○ Planifiée                 │
│  ○ Publiée                   │
└─────────────────────────────┘
```

- Tap sur "Tous statuts" → bottom sheet avec les options de statut (radio single-select)
- Tap sur "Catégorie" → bottom sheet avec les catégories (radio single-select)
- Quand un filtre est actif → le bouton a un style visuel distinct (texte sage, background sage/10, badge ●)
- Sélection auto-ferme le sheet
- Cohérent avec le pattern iOS (bottom sheet natif) utilisé partout dans l'app
- Gain de place : 1 rangée compacte au lieu de 2 rangées de pills

### Fichiers concernés
- `components/features/ideas/IdeaFilters.tsx` (réécrire)
- `components/features/ideas/FilterSheet.tsx` (nouveau — bottom sheet réutilisable pour filtres)

---

## R05 — Catégories personnalisables

### Problème
Les catégories sont hardcodées : Fertilité, Grossesse, Bien-être, MTC, Autre. Si Judith veut ajouter "Douleurs chroniques" ou "Sommeil", elle ne peut pas.

### Solution
Les catégories deviennent dynamiques, stockées dans le profil utilisateur Firestore.

**Catégories par défaut (seed) :**
Fertilité, Grossesse, Bien-être, MTC, Autre

**Gestion :**
- Dans CreateIdeaSheet et IdeaDetailSheet : dropdown avec les catégories existantes + option "Autre..."
- Si "Autre..." sélectionné → champ texte apparaît pour saisir la nouvelle catégorie
- La nouvelle catégorie est sauvegardée dans `users/{userId}.customCategories[]`
- La liste des catégories = catégories par défaut + customCategories
- Possibilité de supprimer une catégorie custom dans /profil (section discrète)

**Data model :**
```typescript
// users/{userId}
customCategories?: string[]  // ex: ['douleurs_chroniques', 'sommeil']
```

**ContentItem.category** passe de `ContentCategory` (enum) à `string` pour supporter les catégories custom. On garde les labels par défaut dans le code, et les custom sont leur propre label.

### Fichiers concernés
- `lib/types/index.ts` (category: string au lieu d'enum, garder les defaults)
- `lib/hooks/useUserProfile.ts` (nouveau — lire customCategories)
- `components/features/ideas/CreateIdeaSheet.tsx` (dropdown dynamique)
- `components/features/ideas/IdeaDetailSheet.tsx` (dropdown dynamique)
- `components/features/ideas/IdeaFilters.tsx` (catégories dynamiques)

---

## R06 — Calendrier : interactions sur les items existants

### Problème
Le calendrier est vide (normal — rien n'est planifié). Mais même avec des items, les interactions sont limitées : cliquer sur une date vide montre un ScheduleSheet qui dit "Aucun contenu prêt à planifier". Il n'y a pas de façon fluide de planifier, re-dater, ou ré-éditer depuis le calendrier.

### Solution
Le calendrier doit être un **hub de gestion des publications** :

**Clic sur date vide :**
- ScheduleSheet actuel MAIS liste TOUS les items avec vidéo (pas seulement workflowState='ready')
- Un item "Filmée" peut être planifié → ça motive Judith à le monter
- Message si aucun item : "Crée du contenu dans l'onglet Idées pour le planifier ici"

**Clic sur item planifié :**
- ItemDetailSheet actuel (déjà bien) mais enrichir avec :
  - **Changer la date** (date picker inline)
  - **Changer l'heure** (picker d'heures suggérées : 8h, 12h, 18h, 20h + custom)
  - Boutons existants : Modifier (éditeur) · Publier maintenant · Déprogrammer

**Vue dots/indicateurs :**
- Un dot de couleur sur chaque date avec un item planifié (déjà implémenté)
- Ajouter : petit badge du nombre d'items si > 1 item sur la même date

### Fichiers concernés
- `components/features/calendar/ScheduleSheet.tsx` (élargir le filtre)
- `components/features/calendar/ItemDetailSheet.tsx` (ajouter date/heure picker)
- `components/features/calendar/CalendarDay.tsx` (badge nombre si > 1)

---

## R07 — Onglet Blitz → Stats

### Problème
L'onglet Blitz n'est utile que si le workflow de statut fonctionne (status = ready_to_shoot). Avec le statut automatique (R03), la notion de "prêt à filmer" devient implicite. L'onglet Blitz est une logistique de trop.

### Solution
Remplacer l'onglet Blitz par un onglet Stats dans la bottom tab bar.

**Pour l'instant (pre-M12) :**
- Page placeholder : "Tes statistiques apparaîtront ici bientôt"
- Icône : ChartBarIcon (Heroicons)
- Le contenu sera implémenté dans M12

**Changements navigation :**
```
Avant : Idées · Calendrier · Blitz · Profil
Après : Idées · Calendrier · Stats · Profil
```

### Fichiers concernés
- `app/(app)/layout.tsx` (changer le tab Blitz → Stats)
- `app/(app)/stats/page.tsx` (nouveau — placeholder)
- `app/(app)/blitz/` (archiver dans _archive ou garder pour référence)

---

## R08 — Page Profil : simplifier pour le contexte actuel

### Problème
La page profil est "pauvre et peu enthousiasmante". C'est un outil personnel pour Judith, pas un produit distribué. La page profil n'a pas besoin d'être un dashboard complet tout de suite.

### Solution
Garder la page profil simple mais utile pour le contexte actuel :

**Ce qui reste :**
- Avatar + nom (déjà là)
- Stats simples : Publiées · Planifiées · Prêtes (déjà là)
- Historique des publications (déjà là)
- Lien site Wix (déjà là)
- Déconnexion (déjà là)

**Ce qu'on ajoute maintenant :**
- Section "Mes catégories" — gestion des catégories custom (R05)
- Lien "Voir toutes les stats →" (pointe vers /stats, placeholder pour l'instant)

**Ce qu'on ajoutera plus tard :**
- Connexions Instagram/YouTube (M09, M11)
- Configuration UTM / Wix mapping (M13)
- Stats enrichies (M12)

Pas besoin de sur-investir le profil maintenant.

### Fichiers concernés
- `app/(app)/profil/page.tsx` (ajouter section catégories + lien stats)

---

## R09 — Captions : Judith écrit, le système enrichit

### Problème
Actuellement, `generateCaption` génère la caption entièrement par IA à partir du titre et de la catégorie. Judith préfère écrire son propre texte — c'est sa voix, son expertise. L'IA ne devrait pas écrire à sa place.

### Solution
Le flux de caption devient **assisté** au lieu de **généré** :

**Flow utilisateur :**
1. Judith écrit son texte dans le champ caption (IdeaDetailSheet ou PublishSheet)
2. Elle appuie sur "Optimiser" (Heroicon: sparkles)
3. Le système prend son texte et l'enrichit :
   - **Hook en première ligne** : reformule la première phrase en question ou fait surprenant
   - **Mots-clés SEO** : insère naturellement les termes que les patients cherchent
     (ex: "acupuncture Montréal", "fertilité naturelle")
   - **CTA + lien Wix** : ajoute l'appel à l'action adapté à la catégorie
   - **Hashtags** : 3 hashtags ciblés (pas de stuffing)
   - **Formatage plateforme** : longueur et style adaptés (Instagram vs Facebook vs YouTube)
4. Judith voit le résultat enrichi, peut modifier, puis valide
5. Bouton "Repartir de mon texte" pour annuler l'enrichissement

**Ce que l'IA NE fait PAS :**
- Ne réécrit pas le contenu principal de Judith
- Ne change pas le ton ou le message
- Ne génère pas de texte à partir de rien (sauf si Judith laisse le champ vide)

**Fallback si caption vide :**
Si Judith ne tape rien et appuie sur Optimiser, là oui, l'IA génère une caption
complète à partir du titre et de la catégorie (comportement actuel, comme backup).

### Bonnes pratiques créateur à encapsuler dans le prompt

**Instagram 2026 :**
- Hook en première ligne (indexé en priorité par l'algo)
- Mots-clés naturels > hashtags (Instagram = moteur de recherche)
- Max 3 hashtags ultra-ciblés
- CTA clair ("lien en bio")
- 150-200 mots max

**Facebook :**
- Liens cliquables directement dans le texte (avantage vs IG)
- Peut être légèrement plus long
- Hashtags moins importants

**YouTube :**
- Description plus longue (SEO Google)
- Liens cliquables
- Tags dans les metadata (pas dans la description)
- #Shorts dans le titre ou la description
- Timestamps si applicable

### Data model
```typescript
// ContentItem (ajouts)
captionDraft?: string   // Texte original de Judith
caption?: string        // Texte enrichi par le système (ou édité par Judith après enrichissement)
```

### Prompt d'enrichissement (remplace le prompt de génération actuel)
```
Tu es l'assistante de Judith Tremblay, acupunctrice à Montréal.
Judith a écrit ce texte pour accompagner son Reel :

"{captionDraft}"

Catégorie : {catégorie}
Plateforme : {platform}

ENRICHIS ce texte en respectant ces règles :
1. GARDE le message et le ton de Judith — ne réécris pas son contenu
2. Reformule la première ligne en hook percutant (question ou fait surprenant)
3. Insère naturellement des mots-clés SEO que ses patients chercheraient
4. Ajoute le CTA : "{cta}" avec l'URL {wixUrl}
5. Ajoute max 3 hashtags ultra-ciblés à la fin
6. Français québécois authentique
7. 150-200 mots maximum
{platformSpecificRules}
```

### Fichiers concernés
- `functions/src/index.ts` (adapter generateCaption pour mode enrichissement)
- `components/features/ideas/IdeaDetailSheet.tsx` (section caption avec Optimiser)
- `components/features/publish/CaptionEditor.tsx` (adapter pour le nouveau flow)
- `lib/types/index.ts` (ajouter captionDraft)

---

## Ordre d'implémentation recommandé

Ces refinements forment un **Milestone R (Refinements)** à exécuter avant M08.
Ordre logique basé sur les dépendances :

| # | Tâche | Dépend de | Effort |
|---|-------|-----------|--------|
| 1 | R03 — Statut automatique | — | Moyen |
| 2 | R05 — Catégories custom | — | Moyen |
| 3 | R02 — Fix swipe-to-delete | — | Petit |
| 4 | R04 — Filtres bottom sheet | R05 (catégories dynamiques) | Moyen |
| 5 | R09 — Captions assistées | — | Moyen |
| 6 | R01 — IdeaDetailSheet | R03, R05, R09 (caption) | Gros |
| 7 | R06 — Calendrier enrichi | R03 (statut) | Moyen |
| 8 | R07 — Blitz → Stats | — | Petit |
| 9 | R08 — Profil catégories | R05 | Petit |

Total estimé : 2 sessions Claude Code (R01-R05 + R06-R09), possiblement 3 si on teste bien.

---

## Contraintes (les mêmes que toujours)

- Heroicons UNIQUEMENT, zéro emoji
- 0 console.log en production
- Composants < 150 lignes
- TypeScript strict
- Mobile first 375px
- App Router ONLY
