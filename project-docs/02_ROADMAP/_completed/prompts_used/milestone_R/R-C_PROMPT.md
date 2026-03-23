# Milestone R-C — Pages secondaires : Calendrier enrichi + Blitz→Stats + Profil

## Contexte
Mon Acupunctrice Hub — PWA Next.js 15 pour Judith, acupunctrice solo.
Les milestones R-A et R-B sont complétés : statut automatique, catégories custom,
filtres bottom sheet, IdeaDetailSheet avec captions assistées. On finalise
les pages secondaires : enrichir le calendrier, remplacer Blitz par Stats,
et ajouter la gestion des catégories au profil.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, Firebase Auth/Firestore,
Zustand, Heroicons. Mobile first 375px.

## Fichiers à lire AVANT de commencer
- `app/(app)/calendrier/page.tsx` → page calendrier actuelle
- `components/features/calendar/CalendarView.tsx` → grille mensuelle
- `components/features/calendar/CalendarDay.tsx` → cellule de jour
- `components/features/calendar/ScheduleSheet.tsx` → sheet de planification
- `components/features/calendar/ItemDetailSheet.tsx` → detail d'un item planifié
- `app/(app)/layout.tsx` → bottom tab bar (4 onglets actuels)
- `app/(app)/blitz/page.tsx` → page Blitz actuelle (à remplacer)
- `app/(app)/profil/page.tsx` → page profil actuelle
- `lib/hooks/useUserProfile.ts` → hook profil avec customCategories (R-A)
- `lib/utils/categories.ts` → getAllCategories, getCategoryLabel (R-A)
- `project-docs/02_ROADMAP/MILESTONE_R_REFINEMENTS.md` → specs R06, R07, R08

## Livrable 1 — Calendrier enrichi (R06)

Modifier `components/features/calendar/ScheduleSheet.tsx` :
- Élargir le filtre : afficher TOUS les items qui ont une vidéo (videoUrl existe),
  pas seulement ceux avec workflowState='ready'
- Regrouper par statut dans la liste :
  - "Prêtes à publier" (workflowState='ready', distributionStatus='draft')
  - "En montage" (workflowState='editing')
  - "Filmées" (workflowState='shot') — avec note discrète "montage à terminer"
- Si aucun item → message : "Crée du contenu dans l'onglet Idées pour le planifier ici"
  avec icône LightBulbIcon

Modifier `components/features/calendar/ItemDetailSheet.tsx` :
- Ajouter un bouton "Changer la date" :
  - Input type="date" natif (simple et fiable sur mobile)
  - Met à jour scheduledAt dans Firestore
- Ajouter un sélecteur d'heure :
  - 4 boutons compacts : 8h · 12h · 18h · 20h (heures suggérées Instagram)
  - Bouton "Autre" → input type="time" natif
  - L'heure est combinée avec la date dans scheduledAt
- Garder les boutons existants : Modifier · Publier · Déprogrammer

Modifier `components/features/calendar/CalendarDay.tsx` :
- Si > 1 item sur le même jour → afficher un petit badge numérique (ex: "2")
  au lieu d'un seul dot

## Livrable 2 — Onglet Blitz → Stats (R07)

Modifier `app/(app)/layout.tsx` :
- Changer le 3e tab de Blitz vers Stats
- Icône : ChartBarIcon (outline) / ChartBarIcon (solid) de Heroicons
- Label : "Stats"
- Href : /stats

Créer `app/(app)/stats/page.tsx` :
- Page placeholder avec un message encourageant
- Layout :
  ```
  ┌──────────────────────────┐
  │       ChartBarIcon       │  (48px, sage/40)
  │                          │
  │  Tes stats arrivent      │  (titre)
  │  bientôt                 │
  │                          │
  │  On prépare un tableau   │  (sous-titre, text-gray-400)
  │  de bord pour suivre     │
  │  tes performances.       │
  └──────────────────────────┘
  ```
- Header avec titre "Statistiques"

Archiver Blitz :
- NE PAS supprimer `app/(app)/blitz/` ni `components/features/blitz/`
- Juste retirer le lien de la navigation (le code reste pour référence)

## Livrable 3 — Profil : gestion des catégories (R08)

Modifier `app/(app)/profil/page.tsx` :
- Ajouter une section "Mes catégories" entre les stats et l'historique
- Afficher la liste des catégories custom (pas les defaults — elles sont fixes)
- Pour chaque catégorie custom : nom + bouton supprimer (XMarkIcon, petit)
- Bouton "Ajouter une catégorie" → champ texte inline + bouton confirmer
- La suppression retire la catégorie de customCategories via useUserProfile
  (les items existants avec cette catégorie gardent leur catégorie — on ne la supprime
  pas de l'item, juste de la liste de suggestions)

- Ajouter un lien "Voir toutes les stats →" :
  - Sous les cartes de stats actuelles
  - Texte sage, ChevronRightIcon
  - Navigate vers /stats

- Retirer le bouton "Déconnexion" du header du calendrier
  (il est déjà dans le profil, pas besoin de le dupliquer)

## Contraintes
- Heroicons uniquement, zéro emoji
- 0 console.log en production
- Composants < 150 lignes
- TypeScript strict
- Mobile first 375px
- Ne PAS modifier la page idées, l'éditeur, ou la publication (déjà fait en R-A/R-B)
- Le ScheduleSheet et ItemDetailSheet doivent rester rétrocompatibles
  (les items existants continuent de fonctionner)

## Definition of Done
- [ ] `npm run build` passe sans erreur
- [ ] Calendrier : clic sur date vide montre tous les items avec vidéo (pas juste 'ready')
- [ ] Calendrier : les items sont groupés par statut dans le ScheduleSheet
- [ ] Calendrier : on peut changer la date et l'heure d'un item planifié
- [ ] Calendrier : badge numérique si > 1 item sur un même jour
- [ ] Navigation : l'onglet Blitz est remplacé par Stats
- [ ] Stats : page placeholder avec message encourageant
- [ ] Profil : section "Mes catégories" avec ajout/suppression
- [ ] Profil : lien "Voir toutes les stats →" vers /stats
- [ ] La déconnexion n'apparaît plus dans le header du calendrier
