# HANDOFF — Session Troubleshoot du 24 mars 2026
*Pour la prochaine instance Claude Desktop*

## Ce qui a été fait ce soir

### Firestore
- Rules + indexes déployés pour `calendarSlots` et `blogSequences`

### Calendrier — refonte majeure
- **Vue semaine** avec toggle Semaine/Mois (défaut: semaine)
- **DashboardBar repensé** : "2 publications cette semaine" au lieu de "Semaine 13"
- **Streak textuel** : flamme + "semaines — t'es en feu!" (caché si 0)
- **Slots remplis = carte imbriquée** : la slot (coquille avec style+format) contient une sous-carte de l'idée (fond teinté + titre + thumbnail)
- **Indicateurs agrandis** en vue mois (w-1.5→w-2.5, icônes plus grosses)
- **Jours vides** en carte pâle avec noms de jours plus foncés
- **generateWeekSlots** corrigé : recrée les slots manquants par jour (pas par semaine)

### Publication & Slots
- **PublishSheet adapté aux slots** : "Confirmer" au lieu de "Publier maintenant", message "Publication automatique à 8h"
- **Redirection calendrier** après publication (toujours, pas juste slots)
- **Déprogrammer remet le slot à open** + remet le workflowState correctement (idea si pas de vidéo, ready si vidéo)
- **Bouton contextuel** : "Créer le contenu" si pas de vidéo, "Modifier" si vidéo existe
- **Cron fixé** : marque le calendarSlot `completed` quand un contentItem lié est publié

### Inspiration & Suggestions
- **Page Inspiration refontée** : questions de réflexion (coaching doux) en premier, hooks en section secondaire
- **Bouton "Nouvelles suggestions"** : appelle `/api/reflection-prompts` (endpoint Claude dédié avec prompt strict)
- **InspirationHint** dans CreateIdeaSheet : "Besoin d'inspiration?" expandable + boutons Autres/IA
- **Cartes teintées par style** sur la page Inspiration
- **Changement de filtre = reset** des suggestions IA

### Idées
- **IdeaCaptionSection** appelle `/api/generate-caption-v2` avec platform + contentStyle
- **Bouton "Retirer la vidéo"** dans IdeaActions (sans supprimer l'idée)
- **Bouton "Effacer"** sur la caption générée
- **FillSlotSheet ne force plus workflowState: 'ready'** (garde le state original)

### Types
- `sequencePosition`, `sequenceLength`, `storyImageUrl` ajoutés à CalendarSlot

## Commits (du plus ancien au plus récent)
```
d593f36  S08: agrandir indicateurs calendrier
7c0eacb  Vue semaine avec toggle, DashboardBar repensé
0b2710a  Jours vides en carte pâle, noms de jours plus foncés
02ce070  S05: IdeaCaptionSection → generate-caption-v2
4c436c1  Suggestions de réflexion contextuelles
3f88a37  Inspiration: questions + bouton IA
2882f80  Inspiration: style unifié, refresh remplace tout
0db364d  API reflection-prompts dédiée
4be19e1  Inspiration: fond teinté par style
9000fa7  Cron: marquer slot completed
1be32c7  Fix: déprogrammer remet slot à open
9538775  PublishSheet adapté aux slots, thumbnails WeekView
137dd9d  generateWeekSlots par jour, redirection calendrier
b7fa826  Bouton retirer vidéo, effacer caption
b826378  Cartes slot teintées par style
fb16920  Carte imbriquée, déprogrammer remet state+slot
860821a  Bouton Créer/Modifier contextuel
1cb3a53  Fix: workflowState correct au déprogrammer
```

## Ce qu'il reste à faire

### Priorité haute — UX
1. **Bottom sheets pour filtres/sélecteurs** — remplacer tous les dropdowns natifs par des BottomSheet mobile-friendly (page Idées, Inspiration, catégories)
2. **Milestone E01 — Éditeur Timeline Pro** — voir `project-docs/02_ROADMAP/MILESTONE_E01.md`
   - E01-A : Divider draggable + presets (preview max / balanced / timeline max)
   - E01-B : Timeline hauteur flexible
   - E01-C : Trim handles sur les clips

### Priorité moyenne — Bugs/Polish
3. **CalendarHeader en vue mois** — dédupliquer la navigation (le header a ses propres flèches + le toggle en a aussi)
4. **MonthSummary double-comptage** — vérifier qu'on ne compte pas slots + items en double
5. **Auto-skip loop potentiel** — `useCalendarSlots` écrit dans Firestore depuis un `onSnapshot`
6. **S03 Stories** — tester la publication Story IG en live (pas encore testé)

### Backlog
7. **Accents français** dans l'UI — plusieurs labels sans accents (Creer, Deprogrammer, etc.)
8. **Tests de publication** avec Judith — flow complet slot→éditeur→export→cron→publication

## Repo et déploiement
- **Dernier commit** : `1cb3a53` sur `main`
- **Vercel** : webhook GitHub fonctionnel, auto-deploy
- **Firebase** : rules + indexes déployés
