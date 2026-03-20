# One-Shot Prompt Writer — Skill pour Claude Desktop

## Quand utiliser ce skill

Utiliser quand Benoît demande de :
- Planifier un milestone ou un refinement
- Écrire un prompt one-shot pour Claude Code
- Découper un gros travail en one-shots implémentables
- Transformer du feedback utilisateur en tâches actionables

## Contexte projet

Ce skill est conçu pour **Mon Acupunctrice Hub V2** mais le pattern est générique.
Le projet utilise un workflow à 3 Claude (Desktop=Architecte, Code=Dev, Chrome=Testeur).

## Le pattern de prompt one-shot

Chaque prompt one-shot est un document Markdown autonome que Benoît copie-colle
dans Claude Code. Claude Code doit pouvoir implémenter SANS poser de questions.

### Structure obligatoire

```markdown
# Milestone [ID] — [Nom court]

## Contexte
[2-3 phrases : quoi, pour qui, où on en est. Pas l'histoire du projet — juste l'état actuel.]

## Stack
[1 ligne. Ex: Next.js 15 App Router, TypeScript, Tailwind, Firebase, Heroicons.]

## Fichiers à lire AVANT de commencer
[Liste de 4-8 fichiers existants que Claude Code DOIT lire pour comprendre
le code existant. Format : `path → ce qu'il va y trouver`]

## Livrable N — [Nom]
[Pour chaque livrable :]
- Quel fichier créer ou modifier
- Le code exact des interfaces TypeScript si pertinent
- La logique métier en pseudocode ou en texte clair
- Comment ça interagit avec le code existant
[Répéter pour chaque livrable]

## Contraintes
[Ce qu'on ne doit PAS faire. Toujours inclure les non-négociables du projet.]

## Definition of Done
[Checkboxes vérifiables. Pas de DoD subjective ("ça marche bien").]
```

### Règles du prompt

1. **Contexte minimal** — Claude Code n'a pas besoin de l'historique du projet,
   juste de savoir où on en est et quoi construire

2. **Fichiers à lire en premier** — C'est la section la plus importante.
   Claude Code va lire la codebase AVANT d'écrire du code. Si on ne lui dit pas
   quoi lire, il va deviner et possiblement écrire du code incompatible.

3. **Interfaces TypeScript** — Si le milestone modifie le data model,
   inclure les interfaces exactes. Pas de description en prose de la structure.

4. **Un livrable = un objectif clair** — Si un livrable a plus de 2 features,
   le découper. Claude Code est meilleur avec des tâches précises.

5. **Les contraintes disent ce qu'on ne fait PAS** — Plus important que ce qu'on fait.
   "Ne PAS modifier l'éditeur" empêche le scope creep.

6. **DoD vérifiable** — Chaque item doit être testable en 10 secondes.
   ❌ "L'UX est bonne" → ✅ "Cliquer sur une carte ouvre le detail sheet"

### Signaux que le prompt est trop gros

- Plus de 3 livrables → découper en 2 prompts
- Plus de 8 fichiers à modifier → trop de scope
- Le DoD a plus de 10 items → trop ambitieux
- On mentionne plus de 2 pages/routes différentes → séparer

### Signaux que le prompt est trop vague

- Aucun fichier à lire → Claude Code va deviner la structure
- Pas d'interface TypeScript → les types vont diverger
- "Implémenter le feature X" sans détail → scope ambigu
- Pas de contraintes → Claude Code va ajouter des extras

## Processus de création d'un prompt

### Étape 1 — Comprendre le besoin
Lire le milestone doc ou le feedback utilisateur.
Identifier : quoi construire, quels fichiers sont impactés, quelles dépendances.

### Étape 2 — Lire la codebase
Utiliser le Filesystem MCP pour lire les fichiers existants pertinents.
Comprendre la structure actuelle AVANT de planifier les changements.

### Étape 3 — Écrire le prompt
Suivre la structure obligatoire ci-dessus.
Être spécifique : noms de fichiers exacts, interfaces TypeScript, logique métier.

### Étape 4 — Valider avec Benoît
Résumer le prompt en 3-4 points et demander validation.
Ajuster si nécessaire.

### Étape 5 — Sauvegarder
Écrire le fichier .md dans le dossier du milestone.
Convention : `[ID]_PROMPT.md` (ex: `R-A_PROMPT.md`, `M08_PROMPT.md`)

## Conventions Mon Acupunctrice

Ces contraintes sont TOUJOURS incluses dans chaque prompt :
- Heroicons uniquement, zéro emoji dans l'UI
- 0 console.log en production
- Composants < 150 lignes
- TypeScript strict
- Mobile first 375px
- App Router ONLY
- Sauvegarder via les hooks existants (useUpdateContentItem, etc.)

## Exemple de bon prompt

Voir `project-docs/02_ROADMAP/milestone_R/R-A_PROMPT.md` pour un exemple complet
qui suit toutes ces règles.
