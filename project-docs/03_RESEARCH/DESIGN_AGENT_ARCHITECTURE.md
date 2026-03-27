# Agent Directeur Artistique — Architecture

## Ce qu'on sait maintenant

Un skill Claude Code a 3 couches de chargement progressif :

1. **Metadata** (~100 tokens) — toujours en mémoire, c'est le trigger
2. **SKILL.md** (~2000 tokens) — chargé quand le skill est activé
3. **Bundled resources** (scripts/, references/, assets/) — chargé à la demande

Pour un agent directeur artistique, on utilise les 3 couches :

## Architecture du skill `directeur-artistique`

```
/mnt/skills/user/directeur-artistique/
├── SKILL.md                    ← Instructions + system prompt DA
├── references/
│   ├── design-rules.md         ← 10 règles validées terrain
│   ├── color-theory.md         ← Théorie des couleurs santé/bien-être
│   ├── typography-guide.md     ← Font pairings, tailles, lisibilité
│   ├── safe-zones.md           ← Zones sûres Instagram 2026
│   ├── anti-patterns.md        ← Ce qui fait amateur, liste noire
│   ├── trends-2026.md          ← Tendances visuelles condensées
│   └── niche-wellness.md       ← Spécificités niche santé/acupuncture
├── scripts/
│   ├── validate-contrast.ts    ← Script de validation contraste WCAG
│   ├── generate-preview.ts     ← Génère un preview HTML/SVG d'un preset
│   └── critique-preset.ts      ← Auto-critique sur 8 dimensions
├── templates/
│   ├── theme-template.json     ← Schema VideoTheme à remplir
│   └── critique-template.md    ← Grille d'évaluation 8 dimensions
└── examples/
    ├── sage-zen-theme.json     ← Exemple de thème validé
    └── bad-theme-example.json  ← Exemple de thème rejeté (pour apprendre)
```

## Ce qui rend l'agent PLUS qu'un system prompt

### 1. References chargées à la demande
Le SKILL.md dit : "Avant de créer un preset, lis `references/design-rules.md`
et `references/typography-guide.md`". Claude Code charge ces fichiers SEULEMENT
quand il génère un preset — pas à chaque interaction. Ça garde le contexte léger
mais donne une knowledge base profonde quand nécessaire.

### 2. Scripts de validation exécutables
Le script `validate-contrast.ts` vérifie programmatiquement que les combinaisons
de couleurs respectent WCAG 4.5:1. L'agent l'exécute APRÈS avoir généré un preset.
Si le contraste échoue, il régénère. C'est de la validation automatique objective.

### 3. Loop de critique structurée
Le `critique-template.md` est une grille de 8 dimensions :
- Lisibilité mobile (font size, contraste)
- Cohérence palette (max 3 couleurs, harmonie)
- Authenticité niche (pas de "AI look", tons terreux)
- Hiérarchie visuelle (hook > corps > CTA)
- Safe zones respectées
- Différenciation (chaque thème est distinct)
- Tendances 2026 (serif revival, warm organic)
- Impact engagement (hook attention, sous-titres)

Score minimum 3.5/5 sur chaque dimension. En dessous → régénération.

### 4. Preview visuel exécutable
Le script `generate-preview.ts` crée un HTML/SVG qui simule un Reel
avec le thème appliqué — texte, couleurs, fond, sous-titres. L'agent
peut ensuite l'ouvrir dans le navigateur ou l'afficher comme artifact.

### 5. Exemples positifs ET négatifs
Les exemples incluent un "bon" thème (sage-zen) et un "mauvais" thème
(trop générique, contraste faible, fonts incompatibles). L'agent apprend
PAR L'EXEMPLE ce qui est accepté vs rejeté.

## Workflow complet de l'agent

```
Utilisateur : "Crée un nouveau thème pour les vidéos éducatives de Judith"
                                    ↓
1. Claude Code active le skill "directeur-artistique"
                                    ↓
2. Charge SKILL.md (instructions + persona)
                                    ↓
3. Charge references/ (design-rules, typography, trends-2026, niche)
                                    ↓
4. Génère un VideoTheme JSON (palette, fonts, styles, animations)
                                    ↓
5. Exécute validate-contrast.ts → vérifie WCAG 4.5:1
   Si FAIL → ajuste les couleurs et recommence step 4
                                    ↓
6. Auto-critique via critique-template.md → score 8 dimensions
   Si score < 3.5 sur une dimension → régénère
                                    ↓
7. Exécute generate-preview.ts → crée un HTML preview
                                    ↓
8. Affiche le preview + le score de critique à l'utilisateur
                                    ↓
9. Utilisateur valide ou demande des ajustements
                                    ↓
10. Si validé → ajoute le thème à lib/data/videoThemes.ts
```

## Ce que ça garantit vs un simple prompt

| Simple prompt | Agent avec skill complet |
|---------------|------------------------|
| Génère des couleurs "au feeling" | Vérifie le contraste WCAG programmatiquement |
| Font pairings théoriques | Pairings validés par données terrain |
| Pas de critique | Auto-critique sur 8 dimensions avec seuil |
| Pas de preview | Preview HTML/SVG exécutable |
| Résultats génériques | Règles niche-spécifiques chargées à la demande |
| Pas d'apprentissage | Exemples positifs/négatifs pour calibrer |
| Résultat unique | Loop itérative : génère → critique → affine |

## Plan d'implémentation

### Phase A — Le skill et ses references (ce soir)
1. Créer la structure du dossier skill
2. Écrire le SKILL.md (persona + instructions)
3. Extraire les données des rapports de recherche dans les references/
4. Créer le schema de thème et la grille de critique

### Phase B — Les scripts de validation
1. validate-contrast.ts (WCAG)
2. generate-preview.ts (HTML/SVG d'un Reel simulé)
3. critique-preset.ts (scoring automatique)

### Phase C — Génération des thèmes
1. Utiliser l'agent pour générer 8 thèmes
2. Valider visuellement les previews
3. Itérer avec l'auto-critique
4. Intégrer les thèmes validés dans videoThemes.ts
