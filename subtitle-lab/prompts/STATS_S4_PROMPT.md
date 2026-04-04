# S4 — Graphique de croissance followers + reach

## Contexte
Le dashboard (S1) a les summary cards et le compteur followers. On ajoute un graphique de tendance entre les cards et la liste des publications pour visualiser la croissance.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS, recharts, Firebase Firestore.

## Fichiers a lire AVANT de commencer
- `app/(app)/stats/page.tsx` → page a etendre
- `lib/hooks/useAnalytics.ts` → hook useDailyAnalytics(days) existant
- `components/features/stats/` → aucun composant graphique existant (supprimes en S1)

## Livrable 1 — Creer GrowthChart.tsx

Creer `components/features/stats/GrowthChart.tsx` :
- Props : `{ data: { date: string; followerCount: number; reach: number }[]; metric: 'followers' | 'reach' }`
- Utiliser recharts `ResponsiveContainer` + `AreaChart`
- Hauteur : 160px
- Style :
  - Gradient fill sage vert (comme l'ancien ReachChart)
  - Stroke 2px sage
  - XAxis : dates formatees "DD mmm" (ex: "3 avr"), tick compact text-[10px]
  - YAxis : masque (hide) pour gagner de la place sur mobile
  - Tooltip : affiche la date et la valeur au tap/hover
- Si `metric === 'followers'` : dataKey = "followerCount", label tooltip = "Abonnes"
- Si `metric === 'reach'` : dataKey = "reach", label tooltip = "Portee"
- Si data est vide, retourner null (ne pas afficher le graphique)

## Livrable 2 — Toggle metric dans le graphique

Dans le composant parent (ou dans GrowthChart), ajouter un header avec :
- Titre "Tendance" a gauche (text-sm font-semibold)
- Toggle "Abonnes" / "Portee" a droite (2 boutons compacts, style identique au toggle de tri de S2)
- State local `chartMetric: 'followers' | 'reach'`, defaut 'followers'

## Livrable 3 — Integrer dans stats/page.tsx

Inserer entre les summary cards et la section Publications :
- Appeler `useDailyAnalytics(period)` avec la periode du toggle global
- Passer les data et le metric au GrowthChart
- Ne pas afficher la section si aucune donnee daily

## Contraintes
- Heroicons uniquement, zero emoji dans l'UI
- 0 console.log en production
- Mobile first 375px
- Utiliser recharts (deja installe)
- Touch-friendly : le tooltip doit fonctionner au tap sur mobile (pas hover-only)
- Ne PAS ajouter de nouvelles dependances

## Definition of Done
- [ ] Graphique de tendance visible entre les cards et les publications
- [ ] Toggle "Abonnes" / "Portee" change le graphique
- [ ] Le graphique respecte la periode selectionnee (7j/30j/90j)
- [ ] Pas de graphique si aucune donnee daily
- [ ] Touch-friendly (tooltip au tap)
- [ ] Mobile 375px
- [ ] npm run build passe
