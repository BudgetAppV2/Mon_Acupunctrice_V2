# METAPROMPT — Draft d'un PROMPT.md one-shot pour la migration Wix

**Usage** : copier-coller ce fichier en entrée d'une session Claude Code (`--dangerously-skip-permissions`) quand on veut drafter le `PROMPT.md` du prochain milestone MW-XX. Remplacer `MW-XX_<nom-court>` par l'ID et le nom du milestone ciblé avant d'envoyer.

**Séquence attendue dans la session Claude Code** :
1. Cette session drafte **uniquement** le PROMPT.md, elle ne code rien
2. Commit du draft
3. Stop et attente d'une instruction de review depuis Claude Desktop
4. Plus tard dans la **même session** : instruction courte "exécute MW-XX" → Claude Code lit le PROMPT.md finalisé et implémente

---

## Prompt à copier-coller

```
Tu vas drafter le PROMPT.md one-shot pour le milestone MW-XX_<nom-court> de la migration Wix → Vercel. Tu ne codes rien, tu n'implémentes rien, tu écris UNIQUEMENT le fichier PROMPT.md.

## Lis d'abord, dans cet ordre

1. CLAUDE.md (racine du repo) — conventions générales Mon Acupunctrice Hub V2
2. docs/migration-wix/CLAUDE.md — invariants permanents de la migration (design system, tokens v4, règles absolues, 4 piliers, arborescence cible)
3. skills/oneshot-prompt-writer/SKILL.md — la structure obligatoire d'un PROMPT.md (Contexte, Stack, Fichiers à lire AVANT, Livrables, Contraintes, DoD)
4. project-docs/02_ROADMAP/migration-wix/MW-XX_<nom-court>/MILESTONE.md — ta source de vérité sur quoi construire
5. project-docs/02_ROADMAP/migration-wix/MW-B1_route-group-public/PROMPT.md — la référence qualité. C'est le premier PROMPT.md produit (par Claude Desktop) et il est validé. Tu vises cette densité et cette précision.
6. docs/migration-wix/DECISIONS_Q1-Q16.md — décisions déjà tranchées. Vérifie si ton milestone a une question résolue dedans.
7. Les fichiers de la codebase pertinents au milestone, que tu identifies en lisant le MILESTONE.md (section "Fichiers impactés" + "Approche technique"). Typiquement : le layout public actuel, tailwind.config.ts, firestore.rules, firebase-admin.ts, etc.

## Chasse aux gotchas OBLIGATOIRE

Avant d'écrire le PROMPT.md, lis le code impacté avec les yeux d'un "mine hunter" et liste mentalement :

- **Anti-patterns existants à NE PAS reproduire** (ex. 'use client' dans un layout qui doit rester Server Component, usage d'un framework UI, pattern d'auth qui ne s'applique pas au site public)
- **Variables globales, classes CSS, fonts ou tokens qui pourraient interférer** avec le nouveau code (ex. bg-sand appliqué au <body> root qui écrase le fond beige v4)
- **Dépendances déjà présentes vs à ajouter** (si tu ajoutes une dep, justifie-la)
- **Conventions de naming et de structure** déjà établies dans le repo
- **Décisions de design déjà prises** dans des fichiers voisins ou dans DECISIONS_Q1-Q16.md

Intègre ces gotchas explicitement dans la section "Fichiers à lire AVANT de commencer" du PROMPT.md, avec une phrase "Gotcha critique : ..." pour chaque point à risque.

## Structure OBLIGATOIRE du PROMPT.md

Suis la structure du skill oneshot-prompt-writer SANS dévier :

1. **Header** : titre du milestone, phrase d'intro "one-shot prompt pour Claude Code"
2. **Contexte** : 3 phrases max, où on en est et ce qu'on construit
3. **Stack** : 1 ligne
4. **Fichiers à lire AVANT de commencer** : 6-10 fichiers numérotés, chacun avec "ce que tu vas y trouver" + gotchas éventuels
5. **Livrable 1, 2, 3...** : un livrable par objectif clair, avec snippets TypeScript/config EXACTS quand pertinent. Pas de prose floue — du code directement copiable.
6. **Contraintes** : liste négative de ce qu'on ne fait PAS (au minimum 8-12 items)
7. **Mobile first (SEO critique)** si le milestone touche au rendu public : règles 375px, test DevTools, inclure dans la DoD
8. **Definition of Done** : checkboxes TESTABLES en moins de 30 secondes chacune. Si la DoD a un item subjectif ("l'UX est bonne"), tu le reformules en item vérifiable.
9. **Q<N> à résoudre pendant l'exécution** si le milestone a une question ouverte dans DECISIONS_Q1-Q16.md à traiter en début d'exécution
10. **Notes d'exécution** : conseils pragmatiques (ordre des livrables, debug, gotchas connus)
11. **Commit final attendu** : message exact + "pas de merge dans main"
12. **Références** : liens vers MILESTONE.md, CLAUDE.md migration, plan stratégique, skill

## Décisions stratégiques non triviales

Si pendant l'écriture tu identifies une décision non triviale qui devrait venir de Benoit + Claude Desktop (exemples typiques : "est-ce qu'on reporte ce livrable à un milestone ultérieur ?", "est-ce qu'on découpe en XXa + XXb ?", "est-ce qu'on préfère approche A ou B pour ce pattern ?"), tu NE tranches PAS tout seul.

À la place :
- Continue le draft avec ton meilleur jugement par défaut (le plus conservateur/safe)
- Ajoute à la fin du PROMPT.md une section "## Questions stratégiques pour review Desktop" qui liste chaque décision avec : le contexte, les options, ta reco par défaut, et ce que ça change
- Claude Desktop tranchera lors du review

## Après l'écriture

1. Écris le fichier : project-docs/02_ROADMAP/migration-wix/MW-XX_<nom-court>/PROMPT.md
2. Commit avec ce message exact :
   docs(migration): PROMPT.md draft MW-XX <nom-court>
3. STOP. N'exécute pas. Ne modifie aucun fichier source. Ne lance pas npm run build. Ne touche à rien d'autre que PROMPT.md.
4. Affiche un bref résumé en 4-6 points :
   - Nombre de livrables
   - Fichiers à lire identifiés (combien, et les 2-3 plus importants)
   - Gotchas critiques trouvés (combien, et lesquels)
   - Questions stratégiques ouvertes s'il y en a
   - Ligne-count du PROMPT.md produit
5. Attends les instructions suivantes de Benoit (qui va être "review OK, exécute MW-XX" ou "voici les corrections")

## Règles absolues

- NE PAS exécuter le PROMPT.md après l'avoir écrit
- NE PAS modifier le code source du repo (app/, components/, lib/, etc.)
- NE PAS lancer npm install, npm run build, npm run dev
- NE PAS créer de fichier autre que PROMPT.md dans le dossier du milestone
- NE PAS trancher une décision stratégique (scope, découpage, approche A vs B) — c'est le job de Claude Desktop
- OUI copier intelligemment des patterns du PROMPT.md de MW-B1 quand ils s'appliquent (structure, ton, niveau de détail)
```

---

## Comment utiliser ce méta-prompt

### Première fois d'une session Claude Code

Depuis le terminal dans le repo Mon_Acupunctrice_V2 :

```bash
claude --dangerously-skip-permissions
```

Puis coller le contenu du bloc ci-dessus en remplaçant `MW-XX_<nom-court>` par l'ID réel. Exemple pour MW-B2 :

> Tu vas drafter le PROMPT.md one-shot pour le milestone MW-B2_firestore-schemas de la migration Wix → Vercel. [...reste du méta-prompt...]

### Sessions suivantes dans la même session Claude Code

Une fois que MW-B2 est drafté, reviewé par Desktop et exécuté, tu peux enchaîner sans redonner tout le méta-prompt. Message court :

> Draft maintenant le PROMPT.md de MW-XX_<nom-court> en suivant les mêmes règles que pour MW-B2. Lis le MILESTONE.md et les fichiers pertinents, chasse aux gotchas, écris, commit, stop.

Claude Code a déjà le skill et la référence en contexte, pas besoin de répéter.

### Pour exécuter un PROMPT.md validé par Desktop

Message court dans la même session :

> Exécute maintenant le milestone MW-XX. Lis project-docs/02_ROADMAP/migration-wix/MW-XX_<nom-court>/PROMPT.md et implémente. Tu peux utiliser --dangerously-skip-permissions, le milestone est propre.

---

## Historique des PROMPT.md produits avec ce workflow

| Milestone | Drafter | Lignes | Status |
|---|---|---|---|
| MW-B1 | Claude Desktop (manuel) | 436 | 🟢 Exécuté, commit 61b7a38 |
| MW-B2 | _à venir_ | — | 🔴 |
| MW-B3 | _à venir_ | — | 🔴 |

*À mettre à jour après chaque milestone.*

---

*Méta-prompt v1 — 14 avril 2026. Si tu améliores ce fichier, incrémente la version et note la date.*
