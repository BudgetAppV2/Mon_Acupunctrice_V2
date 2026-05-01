# Milestone MW-C3 : 4 pages services (fertilité, grossesse, pédiatrie, acupuncture sociale)

**Type** : UI
**Vague** : 3
**Priorité** : Critical
**Temps estimé Claude Code** : 4-6h
**Dépendances** : MW-B1, MW-B3
**Status** : 🔴 Not started

---

## Objectif

Créer les 4 pages hubs SEO pour chaque pilier de contenu — `/services/fertilite`, `/services/grossesse`, `/services/pediatrie`, `/services/acupuncture-sociale` — optimisées pour le référencement local avec mention La Source en Soi, CTAs contextuels, et schema.org `Service`.

---

## Contexte minimal

Les 4 piliers sont le cœur de la stratégie SEO (plan §3.1). Chaque page service est un hub dans l'architecture hub-and-spoke (plan §4.4.1) — elle centralise l'autorité thématique et pointe vers ses spokes (FAQ, articles, ressources).

**Source de contenu — découverte du 14 avril** : les 4 ressources pilier existent déjà dans `scripts/seo-geo/source-resources/` et seront importées dans la collection `ressources` par MW-D3. Les pages services `/services/*` ne répètent pas tout ce contenu long — elles **extraient les sections courtes** (`introSection`, `judithApproach`, `whatToExpect`) de la ressource correspondante pour leur contenu, et pointent vers la ressource complète via un CTA "Lire le guide scientifique complet". C'est le pattern hub-and-spoke à double exploitation d'un seul corpus (voir `docs/migration-wix/DECISIONS_Q1-Q16.md`).

---

## Livrables

- [ ] **Page `/services/page.tsx`** — vue d'ensemble des 4 piliers avec 4 `<PilierCard />` et introduction courte
- [ ] **Page `/services/fertilite/page.tsx`** — hub SEO fertilité complet
- [ ] **Page `/services/grossesse/page.tsx`** — hub SEO grossesse & périnatalité
- [ ] **Page `/services/pediatrie/page.tsx`** — hub SEO acupuncture pédiatrique
- [ ] **Page `/services/acupuncture-sociale/page.tsx`** — hub SEO + manifeste acupuncture sociale

---

## Approche technique

**Source de contenu** : les 4 ressources correspondantes (importées par MW-D3 dans la collection `ressources`) sont la base. Chaque page service extrait les sections suivantes de SA ressource :
- `/services/fertilite` ← `ressources/acupuncture-fertilite-montreal`
- `/services/grossesse` ← `ressources/acupuncture-grossesse-montreal`
- `/services/pediatrie` ← `ressources/acupuncture-pediatrique-enfants-bebes`
- `/services/acupuncture-sociale` ← `ressources/acupuncture-sociale-montreal`

**Structure commune à chaque page service** (hub court ~800 mots) :

1. **Hero** — H1 optimisé SEO local (ex: "Acupuncture fertilité à Rosemont — Clinique La Source en Soi"), sous-titre court, CTA primaire "Réserver une séance [pilier]", photo Judith
2. **Introduction narrative** — extrait de la section `introSection` de la ressource (2-3 paragraphes, ton chaleureux "je" de Judith, ancrage dans la clinique)
3. **Mon approche pour [pilier]** — extrait de `judithApproach` de la ressource (positionnement La Source en Soi, parcours Judith en résumé)
4. **À quoi s'attendre** — extrait court de `whatToExpect` (1ʳᵉ séance + nombre de séances typiques), pas tout le détail de la ressource
5. **Encart "Où exerce Judith"** — adresse La Source en Soi, map (image statique), lien fiche GBP, `<ClinicBadge />` avec 4,9/5 · 1 200+ avis
6. **Section FAQ inline** — 3-5 questions fréquentes du pilier (query Firestore `faqs where category == pilier limit 5` si MW-D3 terminé, sinon hardcodé)
7. **CTA "Pour aller plus loin"** — lien vers la ressource longue : "Lire notre guide scientifique complet sur [pilier] →"
8. **CTA de fin de page** — "Réserver une séance [pilier]"

**Pattern code recommandé** : créer un composant partagé `<ServicePageTemplate />` dans `app/(public)/_components/ServicePageTemplate.tsx` qui prend en props `{ slug, title, heroImage, extractedSections, faqCategory }` et chaque page service l'utilise avec ses props spécifiques. Évite la duplication de 4 pages quasi-identiques.

**Récupération des sections** : au build (SSG), chaque page service query Firestore pour récupérer la ressource correspondante et extraire les champs `introSection`, `judithApproach`, `whatToExpect`. Si la ressource n'est pas encore importée (MW-D3 pas fini), utiliser du contenu placeholder dans le code.

**Spécificités par page** :

- **Fertilité** : concurrence forte (Synergek, Sino-Santé) → viser les long-tail + créneau "Rosemont + tarif solidaire" (plan §3.1). Le H1 doit mentionner Rosemont explicitement.
- **Grossesse** : La Source en Soi apparaît déjà top 1 sur "acupuncture grossesse Rosemont" → amplifier ce signal.
- **Pédiatrie** : niche quasi-vide à Montréal (scouting R3). **⚠️ À valider avec Benoit avant publication** : est-ce que Judith pratique vraiment la pédiatrie activement ? Si non, la ressource reste dispo (`/ressources/acupuncture-pediatrique-enfants-bebes`) mais la page service est reportée post-MVP. Voir `DECISIONS_Q1-Q16.md` Q8.
- **Acupuncture sociale** : page hybride hub SEO + manifeste court. Le manifeste complet est dans la ressource longue. La page service explique le modèle solidaire en 3-4 paragraphes, avec fourchette de tarifs 35-50 $.

**Metadata SEO** (via `generateMetadata`) :
- Title : "[Pilier] à Rosemont — Judith Dufour-Savard | La Source en Soi"
- Description : mentionne le pilier, Rosemont, La Source en Soi, et un bénéfice clé (extrait de `shortAnswer` de la ressource)
- OG image : photo Judith correspondante

**Schema.org** (`Service` ou `MedicalTherapy` lié à la `Person` et `MedicalClinic`) :
```json
{
  "@type": "Service",
  "name": "Acupuncture fertilité",
  "provider": { "@type": "Person", "name": "Judith Dufour-Savard" },
  "areaServed": { "@type": "City", "name": "Montréal" },
  "availableAtOrFrom": { "@type": "MedicalClinic", "name": "La Source en Soi" }
}
```

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(public)/services/page.tsx
- app/(public)/services/fertilite/page.tsx
- app/(public)/services/grossesse/page.tsx
- app/(public)/services/pediatrie/page.tsx
- app/(public)/services/acupuncture-sociale/page.tsx
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] Les 5 pages (overview + 4 piliers) s'affichent correctement
- [ ] Chaque page service mentionne La Source en Soi dans le contenu ET dans les meta tags
- [ ] Chaque page a un H1 optimisé avec mention locale (Rosemont/Montréal)
- [ ] Chaque page contient au moins 2 CTAs vers `/reserver`
- [ ] L'encart "Où exerce Judith" est présent sur chaque page service
- [ ] Lighthouse 95+ sur chaque page
- [ ] Schema.org `Service` validé via validator.schema.org pour chaque page
- [ ] Responsive correct à 375px, 768px, 1024px
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Visual** : 375px et 1024px pour chaque page service
- **SEO** : meta tags, H1 unique par page, schema.org Service validé, breadcrumb
- **Contenu** : La Source en Soi mentionnée, ton vouvoiement + "je", pas de jargon non vulgarisé
- **Navigation** : liens entre la page overview et les 4 pages individuelles fonctionnels

---

## Contraintes

- Ne pas modifier le code du Hub admin
- Le contenu des pages piliers existantes (`scripts/seo-geo/source-resources/`) est la base — le reformuler pour le vouvoiement + "je" mais ne pas le réécrire complètement
- Chaque page < 150 lignes (extraire les sections en composants si nécessaire)
- La page pédiatrie doit rester prudente sur les affirmations médicales — "accompagner" plutôt que "traiter" (plan §3.1)
- La page acupuncture sociale doit expliquer le modèle solidaire sans gêne, avec pédagogie (plan §2.1)
- Mobile-first 375px
- Pas d'emojis — Heroicons uniquement

---

## Références

- Plan stratégique §3.1 (piliers + sous-thèmes), §4.4.1 (hub-and-spoke), §8.2 (pages landing locales), §9.1 (CTAs pages services)
- Contenu existant : `scripts/seo-geo/source-resources/01-05` (5 pages piliers)
- CLAUDE.md migration — invariants La Source en Soi, vouvoiement
- MW-B3 (`<SectionHeading />`, `<ClinicBadge />`, `<CtaButton />`, `<PilierCard />`)

---

## Notes de planification

- Ce milestone est le plus gros de la vague 3 (5 pages). Si le temps dépasse 6h, envisager de découper : MW-C3a (overview + fertilité + grossesse) et MW-C3b (pédiatrie + acupuncture sociale). La page vue d'ensemble et les 2 premiers piliers sont les plus critiques SEO.
- **Dépendance implicite MW-D3** : idéalement, MW-D3 est fait **avant** MW-C3 pour que les ressources soient déjà dans Firestore et que les pages services puissent query leur contenu au build. Si MW-C3 est lancé avant MW-D3, utiliser du contenu placeholder hardcodé extrait manuellement des fichiers `source-resources/*.md`.
- Les FAQ inline (section 5 de chaque page) sont hardcodées pour l'instant. Après MW-D3/D4, elles pourront être dynamiques (query Firestore par catégorie). Prévoir un placeholder clair commenté dans le code.
- **Réutiliser un composant `<ServicePageTemplate />`** plutôt que de dupliquer 4 fois le JSX. Une fois écrit, chaque page service ne fait que 15-20 lignes avec ses props.
- **Point critique à valider avec Benoit avant publication pédiatrie** : Judith pratique-t-elle vraiment la pédiatrie activement ? Voir `DECISIONS_Q1-Q16.md` Q8. Si non, la page `/services/pediatrie` est reportée et retirée de la nav au lancement — mais la ressource `/ressources/acupuncture-pediatrique-enfants-bebes` peut rester (elle fait du contenu SEO sans promettre de service actif).
- **Référence des décisions** : voir `docs/migration-wix/DECISIONS_Q1-Q16.md` pour le pattern hub-and-spoke et les décisions architecturales.
