# Analyse S06 — Banque de templates (hooks & captions)

## Complexite reelle : Petit

Donnees statiques + 1 page + integration navigation. Pas de Firestore.

## Fichiers a modifier — Analyse detaillee

### app/(app)/layout.tsx (actuellement 82 lignes)
- **Ce qui existe :** BottomTabBar avec 4 onglets (Idees, Calendrier, Stats, Profil) en `grid-cols-4`. Icones outline/solid selon actif. Se cache sur `/editeur/*`.
- **Ce qui change :** Remplacer l'onglet "Stats" par "Inspiration" (stats reste accessible via /profil). OU ajouter un 5e onglet et passer en `grid-cols-5`.
- **Risque de depasser 150 lignes :** Non (82 + ~5 = ~87).
- **Decision critique :** 4 onglets ou 5?

### app/(app)/blitz/page.tsx (actuellement 43 lignes)
- **Ce qui existe :** Mode Blitz — filtre les items "ready_to_shoot" et les affiche pour tournage rapide. Utilise le composant BlitzSession.
- **Ce qui change :** Si on remplace Blitz par Inspiration, ce fichier est supprime.
- **Question :** Le Blitz est-il utilise par Judith? Si oui, le garder accessible mais pas dans la nav principale.

## Fichiers a creer

### lib/data/templates.ts
- **Role :** Donnees statiques des hooks et structures de captions, tagees par ContentStyle.
- **Structure :**
```typescript
export interface HookTemplate {
  id: string;
  style: ContentStyle;
  text: string;
  category: 'hook' | 'caption_structure';
}

export const HOOK_TEMPLATES: HookTemplate[] = [
  { id: 'e1', style: 'enseigner', text: 'Savais-tu que [fait surprenant]?', category: 'hook' },
  // ... ~30 templates
];

export const CAPTION_STRUCTURES: HookTemplate[] = [
  { id: 'cs1', style: 'enseigner', text: 'Stat → 3 points → CTA', category: 'caption_structure' },
  // ... ~10 structures
];
```
- **Estimation lignes :** ~80 lignes.

### app/(app)/inspiration/page.tsx
- **Role :** Page principale Inspiration avec filtres par style et liste de templates.
- **Pattern a suivre :** `app/(app)/idees/page.tsx` (header + filtres + liste).
- **Estimation lignes :** ~50 lignes.

### components/features/inspiration/TemplateList.tsx
- **Role :** Liste filtrable de templates avec bouton "Copier" par item.
- **Pattern a suivre :** IdeaList.tsx (presentational list).
- **Estimation lignes :** ~60 lignes.

### components/features/inspiration/TemplateCard.tsx
- **Role :** Carte individuelle avec texte du template, badge de style, bouton copier.
- **Estimation lignes :** ~35 lignes.

## Data model — Changements precis

### Nouveaux types TypeScript
```typescript
export interface HookTemplate {
  id: string;
  style: ContentStyle;
  text: string;
  category: 'hook' | 'caption_structure';
}
```

### Nouveaux index Firestore
- Aucun (donnees statiques).

### Nouvelles security rules
- Aucune.

## Decisions architecturales a prendre

1. **Navigation — 4 ou 5 onglets :**
   - Option A : Remplacer "Stats" par "Inspiration". Stats accessible via /profil (lien existant).
   - Option B : Remplacer "Blitz" (mais blitz n'est pas dans la nav actuellement — c'est deja une page cachee).
   - Option C : 5 onglets (`grid-cols-5`). Sur 375px, chaque onglet fait 75px — suffisant pour icone + label court.
   - **Recommandation : Option A** — remplacer "Stats" par "Inspiration". Le lien "Voir toutes les stats" dans /profil suffit pour acceder aux stats. L'inspiration est plus utile au quotidien que les stats dans la nav principale.

2. **Lien contextuel depuis les slots :**
   - Dans FillSlotSheet (S02), quand le style est defini, ajouter un lien "Voir des idees de hooks →" qui navigue vers `/inspiration?style=enseigner`.
   - Implementer via un query param `?style=X` qui pre-filtre la page.

## Risques et bloqueurs potentiels

- **Aucun risque technique.** C'est le milestone le plus simple — donnees statiques, pas de Firestore, pas de backend.
- **Risque UX :** Si les templates sont trop generiques, Judith ne les utilisera pas. Les templates doivent etre specifiques a l'acupuncture. Le contenu des templates est plus important que le code.

## Impact sur les autres milestones
- Depend de S01 (ContentStyle pour le filtrage)
- S02 ajoute le lien contextuel depuis FillSlotSheet
- Modifie la navigation (layout.tsx) — impacte potentiellement l'emplacement des stats (S07)
