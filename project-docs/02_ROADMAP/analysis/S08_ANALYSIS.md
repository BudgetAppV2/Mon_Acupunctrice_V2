# Analyse S08 — Calendrier visuel enrichi

## Complexite reelle : Moyen

Principalement du travail CSS/UI dans des composants existants. Le defi est de garder le calendrier lisible sur 375px avec toutes les informations.

## Fichiers a modifier — Analyse detaillee

### components/features/calendar/CalendarDay.tsx (post-S02/S04 : ~122 lignes)
- **Ce qui existe (post-S04) :** Rendu items + slots fantomes + badges de sequence.
- **Ce qui change :**
  1. Multi-dots : si plusieurs items le meme jour, afficher plusieurs petites pastilles colorees (par style) au lieu d'un seul badge compteur.
  2. Distinction visuelle des 5 etats de slot (open/filled/completed/skipped/auto-story).
  3. Les stories auto ont une icone SparklesIcon.
- **Risque de depasser 150 lignes :** Possible (122 + ~25 = ~147). Tres juste.
- **Plan si depasse :** Extraire le rendu des multi-dots dans un composant `DayIndicators.tsx` (~30 lignes).

### components/features/calendar/DashboardBar.tsx (post-S07 : ~97 lignes)
- **Ce qui existe (post-S07) :** Resume semaine + cercle progression + badge serie.
- **Ce qui change :** Pas de changement direct dans DashboardBar.

### components/features/calendar/CalendarHeader.tsx (post-S04 : ~41 lignes)
- **Ce qui existe (post-S04) :** Mois/annee + prev/next + bouton "Nouvelle sequence".
- **Ce qui change :** Ajouter le resume mensuel : 4 pastilles colorees avec compteurs (Enseigner: 3, Connecter: 2, Aider: 1, Inspirer: 0). ~20 lignes.
- **Risque de depasser 150 lignes :** Non (~41 + 20 = ~61).

### components/features/calendar/CalendarView.tsx (post-S04 : ~148 lignes)
- **Ce qui existe (post-S04) :** Grille + 3 sheets + generation slots.
- **Ce qui change :** Calculer le resume mensuel (compteurs par style) et le passer a CalendarHeader. ~10 lignes de useMemo.
- **Risque de depasser 150 lignes :** OUI (~148 + 10 = ~158).
- **Plan de decoupage :** Extraire la logique des bottom sheets (state + handlers) dans un hook `useCalendarSheets()`. CalendarView ne garde que la grille et les props passing. Estimation post-extraction : ~110 lignes.

## Fichiers a creer

### components/features/calendar/DayIndicators.tsx
- **Role :** Composant de rendu des indicateurs visuels dans une cellule du calendrier. Gere les multi-dots, les etats de slot, les icones de sequence.
- **Estimation lignes :** ~40 lignes.

### components/features/calendar/MonthSummary.tsx
- **Role :** Resume mensuel avec 4 pastilles + alerte douce de desequilibre.
- **Estimation lignes :** ~45 lignes.

## Data model — Changements precis

### Nouveaux types TypeScript
- Aucun. S08 utilise les types deja definis en S01/S02.

### Nouveaux index Firestore
- Aucun.

### Nouvelles security rules
- Aucune.

## Decisions architecturales a prendre

1. **Multi-dots vs badge compteur :**
   - Sur 375px, une cellule de calendrier fait ~48x48px. On peut afficher max 3-4 petites pastilles (6px) en ligne.
   - Si > 4 items le meme jour : pastilles + "+N".
   - **Recommandation :** Max 3 pastilles de couleur + badge "+N" si > 3.

2. **Lien visuel des sequences :**
   - Option A : Ligne SVG entre les cellules (complexe, casse au saut de ligne dim→lun)
   - Option B : Badge commun "Seq 1" ou icone BookOpenIcon sur chaque slot de sequence
   - Option C : Couleur de fond subtile differente pour les slots de sequence
   - **Recommandation : Option B** — badge avec le meme identifiant. Simple, fonctionne meme quand la sequence traverse 2 semaines. Pas besoin de SVG/lignes.

3. **Alerte de desequilibre :**
   - Message discret sous le resume mensuel : "Beaucoup d'Enseigner ce mois, essaie un Connecter?"
   - Apparait seulement si > 60% du contenu est du meme style.
   - **Recommandation :** Pas de seuil strict. Si un style represente > 60% des publications du mois, afficher une suggestion douce. Sinon, rien.

## Risques et bloqueurs potentiels

- **Performance sur 375px :** Plus d'indicateurs visuels = plus de rendu par cellule. Avec 42 cellules (6 semaines) et potentiellement 2-3 items + slots par jour, le DOM peut grossir. **Mitigation :** Utiliser `React.memo` sur CalendarDay et DayIndicators.
- **CalendarView a la limite :** A 148 lignes post-S04, il FAUT le refactoriser en S08 (extraire les sheets dans un hook). C'est un prerequis technique, pas un risque.
- **Lisibilite :** Trop d'indicateurs rendent le calendrier illisible. **Mitigation :** Limiter a 3 pastilles max + 1 badge par cellule. Le reste est visible au tap (detail sheet).

## Impact sur les autres milestones
- Depend de S01 (couleurs de style), S02 (slots), S04 (sequences)
- C'est le dernier milestone de la phase — il "polit" tout ce qui a ete construit
- Necessite le refactoring de CalendarView qui aurait du etre fait plus tot
