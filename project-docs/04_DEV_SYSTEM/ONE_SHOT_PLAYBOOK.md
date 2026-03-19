# ONE SHOT PLAYBOOK
*Comment construire un prompt one shot efficace pour Claude Code*

---

## Principe

Chaque milestone = 1 prompt one shot bien construit.
Claude Code reçoit le contexte, les contraintes, et les livrables.
Il livre. On valide. On commit.

---

## Structure d'un prompt one shot

```
# Milestone [N] — [Nom]

## Contexte
[2-3 phrases sur ce que l'app fait et où on en est]

## Stack
[Rappel du stack technique]

## Ce qui existe déjà
[Fichiers et features déjà en place]

## Objectif de ce milestone
[Ce qu'on veut construire — 1 phrase claire]

## Livrables attendus
[Liste précise de fichiers/features à créer ou modifier]

## Contraintes
[Ce qu'on ne doit PAS faire dans ce milestone]

## Definition of Done
[Comment savoir que c'est terminé]

## Référence
[Fichiers à lire avant de commencer]
```

---

## Exemple — Milestone 01 Auth

```markdown
# Milestone 01 — Auth Google + Structure Next.js

## Contexte
Mon Acupunctrice Hub est une app web pour Judith, acupunctrice solo.
Elle lui permet de gérer ses idées de contenu, monter des vidéos,
et publier sur Instagram. On part de zéro avec un nouveau repo.

## Stack
Next.js 15 App Router, TypeScript, Tailwind CSS,
Firebase Auth, Firebase Firestore, déployé sur Vercel.

## Ce qui existe déjà
Rien. Nouveau projet.

## Objectif de ce milestone
Créer la structure Next.js complète avec Auth Google Firebase,
route protégée, et layout de base.

## Livrables attendus
- [ ] `next.config.ts` configuré (headers COOP/COEP pour FFmpeg futur)
- [ ] Firebase config dans `/lib/firebase.ts`
- [ ] AuthContext + useAuth hook
- [ ] Page `/login` avec bouton Google Sign-In
- [ ] Layout protégé `(app)/layout.tsx`
- [ ] Page d'accueil `/` qui redirige vers `/calendrier`
- [ ] Page `/calendrier` placeholder
- [ ] Tailwind configuré avec palette sage/sand (couleurs Judith)
- [ ] Types de base dans `/types/index.ts`

## Contraintes
- App Router ONLY (pas de pages/)
- Session persistante (Firebase gère ça automatiquement)
- Pas de feature métier dans ce milestone
- Mobile first (375px)

## Definition of Done
- [ ] `npm run build` passe sans erreur
- [ ] Se connecter avec Google fonctionne
- [ ] Refresh préserve la session
- [ ] `/calendrier` est accessible seulement si connecté
- [ ] Page login redirige vers `/calendrier` si déjà connecté

## Référence
- project-docs/00_VISION/VISION_FINALE.md
- project-docs/03_TECH/ARCHITECTURE.md
- project-docs/03_TECH/DATA_MODEL.md
```

---

## Règles du one shot

1. **Un seul objectif par milestone** — pas de scope creep
2. **Livrables précis** — liste de fichiers, pas "faire l'auth"
3. **Contraintes explicites** — dire ce qu'on ne veut PAS
4. **Definition of Done vérifiable** — checkboxes concrètes
5. **Context minimal** — ne pas noyer Claude Code dans 20 fichiers

---

## Signaux que le prompt est trop large

- Plus de 8 livrables
- Le DoD a plus de 6 items
- On mentionne plus de 2 features différentes
- Le milestone prend "2-3 sessions"

→ Couper en deux milestones distincts

---

## Workflow de validation après livraison

```
1. `npm run build` — doit passer
2. Tester sur mobile (DevTools 375px)
3. Tester le flow complet (pas juste la feature isolée)
4. Commit sur branche feature
5. PR → review → merge main
6. Deploy Vercel automatique
7. Test sur URL Vercel
```
