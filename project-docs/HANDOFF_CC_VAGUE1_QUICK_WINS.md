# Handoff CC — Vague 1 quick wins (post-audit Codex)

**Date** : 2026-05-07 (fin d'après-midi)
**Contexte** : Codex a audité le Chantier 1 AEO et a remonté 5 risques + 7 quick wins. On exécute la **Vague 1** maintenant (~30 min). Vagues 2 et 3 documentées en bas pour plus tard.

---

## 1. Retour Codex en bref

**Verdict** : 90 % du système est solide. 2 risques critiques restants : (a) anti-drift entre SOT/canonical/llms, (b) preuve externe encore sous-développée.

**Top 5 risques identifiés** :
1. Surexposition de sous-thèmes (FIV/IUI/SOPK/endométriose) sans pages dédiées
2. Risque de dérive SOT ↔ entity-canonical ↔ llms (la discipline humaine ne suffira pas)
3. `llms-full.txt` n'est pas vraiment "full" (manque les blog posts Firestore)
4. `aggregateRating` LSSI peut être interprété comme preuve sociale de Judith
5. Proof graph externe sous-développé (pas de Lumino, OAQ profil, page équipe LSSI dans `sameAs`)

**Validation factuelle effectuée** : Codex a raison sur les 2 points spécifiques où il pointe une drift documentaire dans `CLAUDE.md` :
- Ligne 141 : *"Les 5 services de base (fertilité, grossesse, pédiatrie, sociale, **stress/anxiété**)"* → on a 4 piliers dans le canonical, "stress/anxiété" n'en fait plus partie
- Lignes 130-141 : workflow *"Décommenter la ligne dans GlobalJsonLd.tsx"* → obsolète, c'est `EMERGING_SPECIALTIES` dans entity-canonical qui gère ça maintenant

---

## 2. Vague 1 — 3 quick wins à exécuter

### Action 1 — Cleanup `CLAUDE.md` (lignes 130-141)

**Problème** : section *"⚠️ RÈGLE CRITIQUE — Cohérence AEO"* contient un workflow obsolète et une liste fausse de services.

**Fichier** : `CLAUDE.md`

**Bloc à remplacer** (cherche la ligne *"Quand une ressource passe de pending → published"* et le bloc qui suit) :

```markdown
Quand une ressource passe de pending → published (Judith approuve dans le Hub) :
1. Décommenter la ligne correspondante dans `app/(public)/_components/GlobalJsonLd.tsx` (knowsAbout + availableService)
2. Ajouter le sujet dans `public/llms.txt` (description + specialties)
3. Régénérer `llms-full.txt` : `node scripts/generate-llms-full.mjs`
4. Commiter et pousser

Quand une ressource est retirée (published → draft via retire.mjs) :
1. Commenter la ligne dans GlobalJsonLd.tsx
2. Retirer du llms.txt
3. Régénérer llms-full.txt
4. Commiter et pousser

Les 5 services de base (fertilité, grossesse, pédiatrie, sociale, stress/anxiété) sont TOUJOURS déclarés — ils ont des pages permanentes. Les sujets additionnels (ménopause, SOPK, douleur chronique, FIV, endométriose, etc.) ne sont ajoutés que quand leur ressource est publiée.
```

**Par** :

```markdown
Workflow concret depuis le refactor v1.7 (commit `0b268b7`) :

1. **Source canonique exécutable** : `lib/entity-canonical.mjs` exporte `PILIERS` (4 piliers permanents : fertilité, grossesse, pédiatrie, acupuncture sociale) et `EMERGING_SPECIALTIES` (spécialités hors piliers, désactivées par défaut, ex: ménopause).

2. **Activer une nouvelle spécialité** (quand sa page/ressource est publiée) :
   - Si c'est un nouveau pilier permanent → ajouter une entrée dans `PILIERS` (entity-canonical.mjs)
   - Si c'est une spécialité émergente → déplacer l'entrée de `EMERGING_SPECIALTIES` vers `PILIERS`, ou flagger `activated: true`
   - Régénérer les deux fichiers exposés : `node scripts/generate-llms.mjs && node scripts/generate-llms-full.mjs`
   - Le JSON-LD est automatiquement à jour (importe `PILIERS` à chaque build Next.js)
   - Mettre à jour le SOT (`ENTITY_SOURCE_OF_TRUTH.md`) en parallèle (discipline humaine)
   - Commiter et pousser

3. **Désactiver une spécialité** : opération inverse — déplacer de `PILIERS` vers `EMERGING_SPECIALTIES`, régénérer, commiter.

**Les 4 piliers permanents sont** : fertilité, grossesse & périnatalité, pédiatrie, acupuncture sociale. Toute autre spécialité (ménopause, SOPK, FIV comme spécialité autonome, endométriose, douleur chronique, stress/anxiété, etc.) doit avoir une page publiée AVANT d'apparaître dans le schema, llms.txt ou llms-full.txt.
```


### Action 2 — Retirer `aggregateRating` du JSON-LD global

**Problème** : un LLM peut interpréter le `aggregateRating: 4.9 / 1215 reviews` comme une preuve sociale de Judith alors que ces avis sont attachés à la clinique LSSI globalement (1215 patients de toutes les disciplines confondues, pas seulement de Judith).

**Contexte** : Judith a aujourd'hui 6 avis Google sur sa propre fiche GBP. C'est encore peu pour exposer un `aggregateRating` propre — l'objectif du Chantier 2 est d'atteindre 20-25 avis spécifiques à Judith via affiche QR code dans le cabinet (pointant vers `https://g.page/r/CQt_EeseQ8U_EBM/review`). Quand on aura 20+ avis Judith, on pourra ré-introduire un `aggregateRating` propre dans le JSON-LD.

**Fichier** : `app/(public)/_components/GlobalJsonLd.tsx`

**Bloc à retirer** : le bloc `aggregateRating` à l'intérieur du Place LSSI (cherche la ligne avec `ratingValue: '4.9'`). Remplacer par un commentaire explicatif :

```tsx
        // ⚠️ aggregateRating volontairement retiré (audit Codex 2026-05-07).
        // Les avis 4.9/1215 sont attachés à la clinique LSSI (toutes disciplines
        // confondues), pas à Judith. Les LLMs peuvent attribuer ce rating à
        // Judith par mauvaise lecture du graphe. À ré-introduire avec les
        // avis spécifiques à Judith quand sa fiche GBP atteindra 20+ avis
        // (Chantier 2 du plan op — actuellement à 6/20).
```

Le reste du Place LSSI (address, geo) reste inchangé.

### Action 3 — Ajouter `SAMEAS.authority` placeholder

**Problème** : Codex (point #5) recommande d'ajouter une liste séparée `sameAs.authority` pour les profils d'autorité (OAQ public, Lumino, GoRendezVous, page équipe LSSI, etc.) — distincte des réseaux sociaux. Ces URLs ne sont pas encore toutes disponibles (en attente d'Annie LSSI pour Lumino + corrections page équipe), mais on peut **préparer la structure dès maintenant** pour qu'on n'ait qu'à ajouter les URLs au fur et à mesure.

**Fichier 1** : `lib/entity-canonical.mjs`

Ajouter dans l'objet `SAMEAS` un nouveau champ `authority` :

```mjs
export const SAMEAS = {
  social: [...],
  business: [...],
  // Profils d'autorité externes — sources qui corroborent l'identité de Judith
  // de façon faisant autorité (ordre professionnel, plateformes santé, page
  // équipe officielle des cliniques où elle pratique). À ajouter au schema
  // sameAs au fur et à mesure que les URLs deviennent vérifiables et stables.
  // En attente : Lumino (Sun Life), GoRendezVous profil public, page équipe
  // LSSI corrigée, vérification HealthDoc, profil OAQ public si disponible.
  authority: [],
  gbpReviewLink: 'https://g.page/r/CQt_EeseQ8U_EBM/review',
  gbpShareUrl: 'https://share.google/ncO1Alzja10AmsUfR',
};
```

**Fichier 2** : `lib/entity-canonical.d.ts`

Mettre à jour l'interface `SameAs` :

```ts
export interface SameAs {
  readonly social: readonly string[];
  readonly business: readonly string[];
  readonly authority: readonly string[];
  readonly gbpReviewLink: string;
  readonly gbpShareUrl: string;
}
```

**Note** : ne PAS encore consommer `SAMEAS.authority` dans `GlobalJsonLd.tsx` ou les scripts `llms*` puisque le tableau est vide. Quand on commencera à le remplir, on ajoutera `...SAMEAS.authority` dans le `sameAs` du MedicalBusiness (et possiblement aussi du Person, à discuter).


### Action 4 — Update SOT v1.8

**Fichier** : `project-docs/02_ROADMAP/content-strategy/ENTITY_SOURCE_OF_TRUTH.md`

Ajouter une nouvelle ligne dans le tableau de versioning (après la 1.7) :

```markdown
| 1.8 | 2026-05-07 | Benoit + Claude + Codex | Audit Codex passé. Vague 1 quick wins appliqués : (a) cleanup `CLAUDE.md` — workflow obsolète "décommenter dans GlobalJsonLd.tsx" remplacé par le nouveau workflow basé sur `EMERGING_SPECIALTIES` dans entity-canonical, et la mention erronée de "5 services incluant stress/anxiété" corrigée vers les 4 piliers réels ; (b) `aggregateRating` du Place LSSI retiré du JSON-LD pour éviter l'ambiguïté Judith vs clinique (à ré-introduire au Chantier 2 quand Judith aura 20+ avis sur sa fiche GBP — actuellement à 6) ; (c) ajout d'un placeholder `SAMEAS.authority: []` dans entity-canonical pour préparer l'intégration future des profils d'autorité (OAQ public, Lumino, GoRendezVous, page équipe LSSI). Vagues 2 (anti-drift script) et 3 (refonte @graph + provider/founder) reportées — voir `project-docs/HANDOFF_CC_VAGUE1_QUICK_WINS.md` pour le détail. |
```

Aussi : ajouter une note dans la section Cross-refs internes pour documenter que `SAMEAS.authority` est volontairement vide pour l'instant et listant les profils en attente d'ajout.

---

## 3. Vérification + commit + push

### Build check (CRITIQUE)

```bash
cd /Users/benoitarchambault/Desktop/Mon_Acupunctrice_V2
npm run build
```

Le build doit passer sans erreur. Le retrait de `aggregateRating` ne casse rien (c'est juste une suppression de champ optionnel JSON-LD). L'ajout de `authority: []` à `SAMEAS` n'affecte aucun consommateur actuel (personne ne le lit encore).

### Régénérer les fichiers exposés

Pour être sûr que `llms.txt` et `llms-full.txt` reflètent toute mise à jour potentielle (en théorie ils ne devraient pas changer puisque rien d'identitaire n'a bougé, mais par précaution) :

```bash
node scripts/generate-llms.mjs
node scripts/generate-llms-full.mjs
```

Vérifier `git status --short` après — si `public/llms.txt` ou `public/llms-full.txt` apparaissent en modifié, vérifier le diff (`git diff public/llms.txt`) et confirmer que le diff est vide ou cosmétique. Sinon, **NE PAS** commiter ces fichiers (un changement ici signifierait qu'on a bougé quelque chose qu'on ne voulait pas bouger).

### Commit ciblé

Stager UNIQUEMENT :

```bash
git add CLAUDE.md \
        app/\(public\)/_components/GlobalJsonLd.tsx \
        lib/entity-canonical.mjs \
        lib/entity-canonical.d.ts \
        project-docs/02_ROADMAP/content-strategy/ENTITY_SOURCE_OF_TRUTH.md
```

(5 fichiers, tous dans le scope de la Vague 1)

Vérifier le staged :

```bash
git status --short
git diff --cached --stat
```

Commit message proposé :

```
chore(content-strategy): apply Codex audit Vague 1 quick wins (SOT v1.8)

External audit by Codex on Chantier 1 AEO surfaced 5 risks and 7 quick
wins. This commit applies the 3 most actionable quick wins (~30 min,
zero functional risk) and defers the structural improvements (Vague 2
anti-drift script and Vague 3 JSON-LD @graph refactor) to follow-up
sessions.

CLAUDE.md cleanup
- Section "RÈGLE CRITIQUE — Cohérence AEO" was describing a workflow
  that became obsolete with the v1.7 refactor (commit 0b268b7). The
  outdated workflow said "decomment the line in GlobalJsonLd.tsx" but
  GlobalJsonLd no longer has commented-out lines — it imports PILIERS
  and EMERGING_SPECIALTIES from entity-canonical.mjs, and the canonical
  module is the single point of truth for activation/deactivation.
- The fix : replaced the entire workflow section with the post-v1.7
  procedure based on PILIERS / EMERGING_SPECIALTIES + regen scripts.
- Also corrected the "5 services including stress/anxiety" mention:
  there are 4 active piliers, and stress/anxiety is not one of them.

JSON-LD: aggregateRating removed
- The Place LSSI block carried aggregateRating 4.9 / 1215 reviews —
  these reflect the LSSI clinic globally (all practitioners, all
  disciplines), not Judith specifically. LLMs reading the graph fast
  could attribute this rating to Judith herself, which would be a
  misleading proof-graph signal.
- Removed with an explanatory comment. Will be re-introduced as a
  Judith-specific aggregateRating once her own GBP profile reaches
  20+ reviews (Chantier 2 of the operational plan — currently at 6).

SAMEAS.authority placeholder
- Codex (risk #5) recommended a separate authority list for
  professional-order, health-platform, and clinic-team profiles —
  distinct from social media. Not all URLs are available yet (waiting
  on LSSI owner Annie for Lumino and team-page corrections), so this
  commit only sets up the structure (empty array + .d.ts type).
- Will be populated incrementally as URLs become verifiable.

SOT v1.8 documents the audit pass and the Vague 1 application.
```

Puis :

```bash
git push origin main
```


### Vérification post-déploiement (~5 min)

Vercel rebuild ~3-5 min après push. Vérifier :

1. `https://www.acupuncturejudith.ca/` charge (homepage)
2. View Source de la homepage → chercher `application/ld+json` → confirmer **absence** du bloc `aggregateRating`. Le reste du JSON-LD doit être identique.
3. `https://www.acupuncturejudith.ca/llms.txt` charge (au cas où)
4. `https://www.acupuncturejudith.ca/llms-full.txt` charge

---

## 4. Pièges à éviter

1. **NE PAS committer** `lib/animations/constants.ts` ni `lib/animations/setup.ts` — WIP non lié.
2. **NE PAS committer** les fichiers " 2." (doublons macOS Finder).
3. **NE PAS committer** `project-docs/PROMPT_CC_UNPUBLISH.md` ni `project-docs/AUDIT_BRIEF_FOR_CODEX.md` (sauf si tu le souhaites — le brief Codex peut être archivé en commit séparé `docs(audit): archive Codex audit brief` si tu veux le garder dans l'historique).
4. **VÉRIFIER LE BUILD avant push** — précédent du matin (commit `23866ed`) où Vercel a cassé pendant 13h faute de check.
5. Si `npm run build` casse à cause du `.d.ts` modifié : vérifier que la nouvelle ligne `readonly authority: readonly string[];` est bien présente dans `interface SameAs`.

---

## 5. Vagues 2 et 3 — pour info, pas à exécuter aujourd'hui

### Vague 2 — Anti-drift (1-2h, à planifier)

**Script** : `scripts/audit-entity-coherence.mjs`

À écrire dans une session dédiée. Doit vérifier :
- Les valeurs critiques du SOT (NAP, OAQ, contact, piliers, emerging specialties) sont identiques dans `entity-canonical.mjs`. Faisable par parsing YAML/markdown du SOT et comparaison avec les exports du module.
- `public/llms.txt` et `public/llms-full.txt` ne contiennent **aucun** des `name` listés dans `EMERGING_SPECIALTIES` (sauf si flagger `activated: true`). Échec sinon.
- Toutes les URLs `/services/*` listées dans `app/sitemap.ts` apparaissent dans `public/llms-full.txt`. Toutes les URLs `/ressources/*` aussi. (On exclut `/blog/*` du test : Codex avait raison qu'ils manquent dans llms-full, mais on documente ce choix éditorial — le blog est du contenu secondaire pour AEO, llms-full se concentre sur services + ressources + faq.)
- Les bios canoniques (`BIOS.short`, `BIOS.medium`, `BIOS.long`) contiennent toutes le numéro OAQ `A-008-24`.
- Les NAP de `entity-canonical.NAP.lssi` et `entity-canonical.NAP.eden` sont consommés sans modification dans `lib/utils/rdvUrl.ts` (vérifier l'objet `CLINICS`).

**Intégration** : ajouter `"audit:entity": "node scripts/audit-entity-coherence.mjs"` dans `package.json`. Idéalement, faire tourner aussi en pre-commit hook (Husky) ou en GitHub Action sur PR.

### Vague 3 — Optimisations sémantiques (1-2h, optionnel)

- Refonte du JSON-LD en `@graph` unique au lieu d'un tableau de blocs séparés (recommandation Codex 6.3) :
  ```jsonc
  {
    "@context": "https://schema.org",
    "@graph": [
      { "@type": "WebSite", "@id": "...", ... },
      { "@type": "Person", "@id": "...", ... },
      { "@type": "MedicalBusiness", "@id": "...", ... }
    ]
  }
  ```
- Modélisation Judith ↔ MedicalBusiness via `provider` / `founder` / `workLocation` au lieu d'`employee` (recommandation Codex 6.3).
- Ajout d'`ACTIVE_SUBTOPICS` séparé de `PLANNED_SUBTOPICS` dans entity-canonical (recommandation Codex risque #1) — distingue les sous-thèmes mentionnés dans le narratif des piliers (ex: FIV sous Fertilité) vs ceux qui méritent leur propre page décisionnelle (Chantier 3).

---

## 6. Récap actions

```
[ ] Action 1 — Cleanup CLAUDE.md (lignes 130-141)
[ ] Action 2 — Retirer aggregateRating de GlobalJsonLd.tsx
[ ] Action 3 — Ajouter SAMEAS.authority placeholder (.mjs + .d.ts)
[ ] Action 4 — Update SOT v1.8
[ ] npm run build (CRITIQUE — doit passer sans erreur)
[ ] Régénérer llms.txt et llms-full.txt (par précaution)
[ ] git add ciblé (5 fichiers seulement)
[ ] git commit avec le message proposé
[ ] git push origin main
[ ] Vérification Vercel build + JSON-LD homepage (~5 min)
```

Bonne session !
