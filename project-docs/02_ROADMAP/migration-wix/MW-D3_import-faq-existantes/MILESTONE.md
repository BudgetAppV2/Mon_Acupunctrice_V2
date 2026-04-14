# Milestone MW-D3 : Import des FAQ et ressources existantes → Firestore

**Type** : Content
**Vague** : 4
**Priorité** : High
**Temps estimé Claude Code** : 2-3h
**Dépendances** : MW-B2
**Status** : 🔴 Not started

---

## Objectif

Importer les 6 FAQ existantes et les 5 ressources déjà rédigées et validées depuis `scripts/seo-geo/source/` et `scripts/seo-geo/source-resources/` vers les collections Firestore `faqs` et `ressources`, avec `status: 'published'`.

**Important** : les 5 fichiers dans `source-resources/` vont dans la collection `ressources` (PAS `servicePages`). Voir `docs/migration-wix/DECISIONS_Q1-Q16.md` section "Décision architecturale hub-and-spoke" pour le raisonnement.

---

## Contexte minimal

Un actif majeur existe déjà dans le repo : 6 FAQ rédigées + 5 ressources piliers complètes (fertilité, grossesse, pédiatrie, anxiété transversale, acupuncture sociale), avec sections structurées `### CHAMP: xxx`, citations scientifiques PubMed, et FAQ embarquées. Un script Node fonctionnel existe déjà (`scripts/seo-geo/publish-all-resources.mjs`, 393 lignes) qui extrait les champs et publie vers Wix — notre travail ici est d'adapter ce pattern pour publier vers Firestore à la place.

---

## Livrables

- [ ] **Script d'import** `scripts/import-seo-geo-content.ts` — TypeScript qui réutilise le pattern `extractField()` de `publish-all-resources.mjs`, lit les FAQ et les ressources, et pousse vers Firestore via `firebase-admin`
- [ ] **6 documents `faqs`** avec `status: 'published'`, catégorie assignée, champs relationnels vides (maillage en MW-D6)
- [ ] **5 documents `ressources`** avec `status: 'published'`, toutes les sections (shortAnswer, introSection, scienceSection, mechanismSection, judithApproach, whatToExpect, protocolSection, testimonial, faqJson, citations)
- [ ] **Mode dry-run** (`--dry-run`) pour validation avant écriture
- [ ] **Flag écrit dans NOTES.md** sur les témoignages fictifs à retirer/remplacer avant review Benoit (voir section Contraintes)

---

## Approche technique

**Sources FAQ** (→ collection `faqs`) :
- `scripts/seo-geo/source/01-acupuncture-anxiete.md` → catégorie `seance` (transversal)
- `scripts/seo-geo/source/02-combien-seances-fiv.md` → catégorie `fertilite`
- `scripts/seo-geo/source/03-acupuncture-securitaire-fiv.md` → catégorie `fertilite`
- `scripts/seo-geo/source/04-tomber-enceinte-naturellement.md` → catégorie `fertilite`
- `scripts/seo-geo/source/05-nausees-grossesse.md` → catégorie `grossesse`
- `scripts/seo-geo/source/06-bebe-siege-moxibustion.md` → catégorie `grossesse`

**Sources Ressources** (→ collection `ressources`) :
- `source-resources/01-acupuncture-fertilite-montreal.md` → slug `acupuncture-fertilite-montreal`, category `fertilite`
- `source-resources/02-acupuncture-grossesse-montreal.md` → slug `acupuncture-grossesse-montreal`, category `grossesse`
- `source-resources/03-acupuncture-pediatrique-enfants-bebes.md` → slug `acupuncture-pediatrique-enfants-bebes`, category `pediatrie`
- `source-resources/04-acupuncture-sante-mentale-anxiete.md` → slug `acupuncture-sante-mentale-anxiete`, category `transversal` ou `sante-mentale`
- `source-resources/05-acupuncture-sociale-montreal.md` → slug `acupuncture-sociale-montreal`, category `acupuncture-sociale`

**Script d'import** (`scripts/import-seo-geo-content.ts`) :
1. Réutiliser la fonction `extractField(md, fieldName)` de `publish-all-resources.mjs` (pattern `### CHAMP: xxx`)
2. Pour les FAQ : extraire slug, question (ou title), detailedAnswer (ou body), category, order, construire un document `faqs/{slug}`
3. Pour les ressources : extraire tous les champs (PLAIN_TEXT_FIELDS + RICH_TEXT_FIELDS + DATE_FIELDS de `publish-all-resources.mjs`), **garder le markdown brut** dans les champs rich text (pas de conversion Ricos, Firestore stocke juste du markdown qui sera rendu en React côté site public)
4. Parser le champ `faqJson` de chaque ressource et le stocker comme array d'objets `{question, answer}` (utilisé pour schema.org FAQPage par ressource)
5. Parser le champ `relatedGuides` (array de slugs) et le stocker comme `relatedResources: string[]`
6. Ajouter `status: 'published'`, `publishedAt: Timestamp`, `updatedAt: Timestamp` à chaque document
7. Mode `--dry-run` : afficher les documents qu'on s'apprête à écrire sans toucher Firestore
8. Mode réel : utiliser `firebase-admin` pour écrire dans Firestore

**Mapping catégories FAQ** : explicite dans le script (hardcodé), pas de détection automatique.

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- scripts/import-seo-geo-content.ts

📄 READ (sources) :
- scripts/seo-geo/source/*.md (6 fichiers FAQ)
- scripts/seo-geo/source-resources/*.md (5 fichiers ressources)
- scripts/seo-geo/publish-all-resources.mjs (pattern de référence)
- scripts/seo-geo/publish-all-faq.mjs (pattern de référence)

🔥 FIRESTORE (données créées) :
- faqs/ (6 documents)
- ressources/ (5 documents)
```

---

## Definition of Done

- [ ] 6 documents dans la collection `faqs` avec `status: 'published'`
- [ ] 5 documents dans la collection `ressources` avec `status: 'published'` et toutes les sections riches présentes
- [ ] Chaque FAQ a une question, une réponse, une catégorie, et un ordre
- [ ] Chaque ressource a shortAnswer, introSection, scienceSection, mechanismSection, judithApproach, whatToExpect, protocolSection, testimonial, faqJson parsed, relatedResources, citations
- [ ] Le script en mode `--dry-run` affiche tous les documents avant écriture
- [ ] Le mode réel a été exécuté et les documents sont visibles dans la console Firebase
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution ET un flag explicite sur les témoignages fictifs détectés (ex. "Sarah, 36 ans, Rosemont" dans la ressource fertilité)
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Integration** : ouvrir la console Firebase, vérifier les documents dans `faqs` et `servicePages`
- **Contenu** : lire 2-3 FAQ dans la console et vérifier que la question/réponse correspond au fichier source
- **Schéma** : vérifier que les champs correspondent au schéma MW-B2

---

## Contraintes

- Ne pas modifier le contenu des fichiers source — import fidèle
- Ne pas supprimer les fichiers source après import (ils restent comme référence canonique)
- Le script utilise `firebase-admin` (pas le SDK client)
- Le mapping catégorie doit être explicite dans le script, pas deviné par IA
- Le fichier `04-acupuncture-sante-mentale-anxiete.md` est importé comme **ressource transversale** (confirmé par le fichier lui-même qui est dans `source-resources/`)
- **Témoignages fictifs** : le fichier `01-acupuncture-fertilite-montreal.md` contient un témoignage explicitement marqué comme fictif (Sarah 36 ans). Le script doit détecter ces témoignages (par le tag `⚠️` ou mot "fictif" dans les notes du fichier) et les remplacer par un placeholder `[Témoignage à fournir par Judith]` dans Firestore. Ne PAS importer les témoignages fictifs tels quels. Flag explicite dans NOTES.md.
- Pas de conversion Ricos ici — on stocke le markdown brut dans Firestore (contrairement au script Wix original)

---

## Références

- Contenu existant : `scripts/seo-geo/source/*.md`, `scripts/seo-geo/source-resources/*.md`
- MW-B2 (schémas FAQ et ServicePage)
- CLAUDE.md migration — "Contenu existant à réutiliser (ne pas ignorer)"
- Plan stratégique §5.3 (volume cible FAQ — ces 6 sont les premières)

---

## Notes de planification

- Ce milestone est un quick win : du contenu validé, un schéma défini, juste un script de transformation à écrire.
- Le pattern de référence est **déjà écrit** dans `scripts/seo-geo/publish-all-resources.mjs` (393 lignes). Réutiliser :
  - `loadEnv()` pour charger les credentials
  - `extractField()` pour parser les fichiers `### CHAMP: xxx`
  - Les constantes `RICH_TEXT_FIELDS`, `PLAIN_TEXT_FIELDS`, `DATE_FIELDS`
  - La boucle principale de traitement
- **Différences importantes avec le script Wix** :
  - Pas de conversion Markdown → Ricos (on stocke le markdown brut)
  - Pas d'API Wix (on utilise `firebase-admin`)
  - Destination : collections Firestore au lieu de Wix Data
  - Ajout de `status: 'published'` requis par MW-B2 (amendement A2)
- Les `relatedServices`, `relatedArticles`, `relatedFaqs` sont laissés vides pour l'instant — le maillage sera ajouté en MW-D6.
- Point à valider avec Benoit avant la passe réelle : confirmation de la catégorisation FAQ (le mapping proposé est une estimation basée sur les noms de fichiers).
- Point à valider avec Benoit : la ressource `04-acupuncture-sante-mentale-anxiete.md` doit avoir `category` = `transversal`, `sante-mentale`, ou autre ? Voir `DECISIONS_Q1-Q16.md` Q10.
- **Référence des décisions** : voir `docs/migration-wix/DECISIONS_Q1-Q16.md` pour le contexte complet de ces décisions.
