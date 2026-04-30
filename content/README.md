# Content Pipeline — acupuncturejudith.ca

Pipeline d'injection de contenu (ressources, FAQ, blog) dans Firestore depuis des fichiers markdown versionnés.

## Architecture

```
content/
├── ressources/        ← Pages ressources longues (2500+ mots, citations PubMed)
│   ├── _TEMPLATE.md
│   └── *.md
├── faq/               ← FAQ courtes (100-300 mots)
│   ├── _TEMPLATE.md
│   └── *.md
├── blog/              ← Articles de blog
├── scripts/
│   ├── inject.mjs           ← Markdown → Firestore (upsert)
│   ├── audit-freshness.mjs  ← Audit fraîcheur des sources
│   └── retire.mjs           ← Retire ou supprime un contenu
└── README.md          ← Ce fichier
```

**Principe** : les fichiers markdown sont la **source de vérité** (versionnés git). Firestore est un miroir alimenté par les scripts. Le Hub CMS permet à Judith de valider et publier sans toucher au code.

---

## Workflow standard (de la production à la mise en ligne)

```
1. Produire markdown   → fichier dans content/ressources/ ou content/faq/
2. Vérifier (dry-run)  → node content/scripts/inject.mjs <file> --dry-run
3. Injecter            → node content/scripts/inject.mjs <file>
                         (status: pending par défaut)
4. Validation Judith   → Hub /contenu → Approuver / Commenter
                         (status: published, ISR rafraîchit le site)
5. Audit fraîcheur     → node content/scripts/audit-freshness.mjs (à faire 1x / mois)
6. Retrait éventuel    → bouton "Retirer du site" dans le Hub, OU script retire.mjs
```

Le pipeline est **idempotent** : on peut re-injecter le même fichier autant de fois qu'on veut. Le script utilise `set(merge: true)`, qui met à jour les champs présents dans le markdown sans écraser les autres.

---

## Production d'une ressource

### Format

Voir `content/ressources/_TEMPLATE.md`. Frontmatter YAML obligatoire + sections markdown nommées.

```yaml
---
slug: "acupuncture-sopk-montreal"          # devient l'ID Firestore
title: "..."
type: "guide"
pilier: "fertilite"                        # fertilite | grossesse | pediatrie | acupuncture-sociale | transversal
status: pending                            # pending | draft | published
metaTitle: "..."
metaDescription: "..."                     # 155 chars max
heroImageAlt: "..."
authorName: "Judith Dufour-Savard"

relatedServices: [transversal]             # arrays YAML inline OU multi-lignes
relatedFaqs: []                            # le parser gère [] correctement
relatedArticles: []
relatedResources:
  - autre-slug

lastResearchedAt: "2026-04-29"
newestSourceYear: 2026
freshnessNote: "Basé sur N méta-analyses publiées entre AAAA et AAAA"

citations:
  - authors: "Auteur et al."
    title: "..."
    journal: "..."
    year: 2025
    url: "https://..."
  # (autant de citations que nécessaire)

faqEntries:
  - question: "..."
    answer: "..."
  # (FAQ inline dans la ressource — différent des FAQ standalone)
---

## shortAnswer
Phrase d'accroche (1-2 phrases) qui répond directement à la question principale.

## introSection
Introduction du sujet (~300 mots).

## scienceSection
Ce que la science dit (~500 mots, avec références aux citations du frontmatter).

## mechanismSection
Mécanismes biologiques (~300 mots, optionnel).

## judithApproach
Mon approche personnelle (~300 mots). Mentionner les 2 cliniques.

## whatToExpect
Ce qui se passe en séance (~200 mots).

## protocolSection
Protocole type — phases, fréquence, durée.

## testimonial
Citation patient anonymisée (optionnel).
```

### Exemple complet
Voir `content/ressources/acupuncture-menopause.md` (premier exemplaire produit, sert de référence).

### Sections supportées par le rendu public
- `shortAnswer`, `introSection`, `judithApproach`, `whatToExpect`, `protocolSection`, `scienceSection`, `mechanismSection`, `testimonial`

L'ordre d'affichage est défini dans `app/(public)/ressources/[slug]/page.tsx` — actuellement : intro → judith → whatToExpect → protocol → science → mechanism → testimonial.

---

## Production d'une FAQ

### Format

Voir `content/faq/_TEMPLATE.md`.

```yaml
---
slug: "acupuncture-anxiete"                # devient l'ID Firestore
question: "Est-ce que l'acupuncture aide pour l'anxiété ?"
category: "seance"                          # fertilite | grossesse | pediatrie | acupuncture-sociale | seance
order: 2                                    # ordre d'affichage dans la catégorie
status: pending
lastResearchedAt: "2026-04-29"
---

## reponse

(Markdown 100-300 mots — voir voix Judith plus bas)
```

### ⚠️ Convention de nommage du champ « réponse »

Le champ Firestore officiel est **`reponse`** (français), pas `answer`. C'est défini dans `lib/types/faq.ts`. Le Hub CMS et le rendu public utilisent ce nom.

**Côté markdown**, deux noms de section sont acceptés (rétrocompatibilité) :
- `## reponse` ✅ (recommandé, cohérent avec Firestore)
- `## answer` (toléré, parsé pareil)

### Catégories valides
`fertilite` | `grossesse` | `pediatrie` | `acupuncture-sociale` | `seance`

Le default est `seance` si non précisé. Toute autre valeur est un bug — vérifier `FaqCategory` dans `lib/types/faq.ts` avant d'inventer une nouvelle catégorie.

### Champs auto-remplis par inject.mjs
Si non précisés dans le frontmatter, ils prennent ces valeurs :
- `ctaVariant: 'reserver'`
- `relatedServices: []`
- `relatedArticles: []`
- `relatedFaqs: []`
- `publishedAt: null` (ou `now` si status=published à l'injection)

---

## Voix de Judith (à respecter pour tout contenu)

Calibrée par les 53 corrections appliquées dans `b2af0c4` et la ressource ménopause.

**À faire**
- Affirmation directe en première phrase (oui / non / dépend)
- Justifier scientifiquement (méta-analyses, ECR, sans citation lourde dans une FAQ courte)
- Personnel : « dans ma pratique », « plusieurs de mes patientes », « mon approche »
- Concret : chiffres, fréquences (« 1 à 2 séances/semaine pendant 6 semaines »)
- Mentionner les 2 cliniques quand pertinent (LSSI Rosemont + Éden Repentigny)
- Pédagogique : expliquer les mécanismes sans jargon
- Caveat médical à la fin : « consultez aussi votre médecin », « complète, ne remplace pas »

**À ne pas faire** (déontologie OAQ + retours Judith)
- ❌ Promettre une guérison ou un résultat (art. 5 OAQ)
- ❌ Mots type « miracle », « magique », « toujours efficace »
- ❌ Témoignages inventés ou non sourcés
- ❌ Comparaisons commerciales hostiles avec d'autres pratiques
- ❌ Affirmations non sourcées présentées comme scientifiques
- ❌ Suggérer d'arrêter un traitement médical en cours

---

## Commandes utiles

### Vérifier sans rien écrire (dry-run)
```bash
node content/scripts/inject.mjs content/ressources/sopk.md --dry-run
node content/scripts/inject.mjs content/faq/*.md --collection=faqs --dry-run
```

Affiche les champs qui seraient écrits, sans toucher Firestore. Toujours faire ça en premier sur du nouveau contenu.

### Injecter une ressource
```bash
node content/scripts/inject.mjs content/ressources/sopk.md
```

### Injecter toutes les FAQ (batch)
```bash
node content/scripts/inject.mjs content/faq/*.md --collection=faqs
```

Le flag `--collection=faqs` est nécessaire si le path ne contient pas `/faq/` (sécurité contre la mauvaise collection).

Les fichiers `_TEMPLATE.md` sont automatiquement skipés (le préfixe `_` les exclut).

### Re-injecter (mise à jour idempotente)
Modifie le markdown, relance la même commande. Le script fait un `set(merge: true)` :
- Les champs présents dans le markdown sont mis à jour
- Les autres champs Firestore sont préservés (notamment `reviewedBy`, `publishedAt` historique, etc.)
- Les anciens champs renommés sont supprimés explicitement (cf. `FieldValue.delete()` pour `answer` → `reponse`)

### Retirer un contenu du site
**Préférer le bouton « Retirer du site »** dans le Hub CMS — c'est l'interface conçue pour Judith, et ça déclenche le revalidate ISR proprement.

Sinon, en ligne de commande :
```bash
# Statut → pending (réapprouvable en 1 clic depuis le Hub)
node content/scripts/retire.mjs ressources acupuncture-menopause-montreal

# Statut → draft (archivé, déplacé hors du flux de validation)
node content/scripts/retire.mjs ressources acupuncture-menopause-montreal --draft

# Suppression Firestore (irréversible)
node content/scripts/retire.mjs ressources acupuncture-menopause-montreal --delete
```

### Audit de fraîcheur (sources scientifiques)
```bash
node content/scripts/audit-freshness.mjs
```
Liste les ressources dont `lastResearchedAt` > 12 mois ou `newestSourceYear` > 2 ans. À lancer 1x par mois pour détecter le contenu à mettre à jour.

---

## Cycle de validation Judith (workflow CMS)

```
draft  ──── soumettre ────▶  pending  ──── approuver ────▶  published  ──── retirer ────▶  pending
  ▲                            │                              │                              │
  └────── (script --draft)     │                              │                              │
                               └─── commenter (statut reste pending)                         │
                                                                                              │
                                                              ◀──────── (réapprouver) ───────┘
```

**Points clés** :
- À l'injection : status par défaut = `pending` (sauf si le markdown précise autre chose).
- Le bouton « Retirer du site » remet en `pending`, pas en `draft` — Judith réapprouve en 1 clic.
- `publishedAt` est **préservé** lors d'un retrait (traçabilité de la première publication).
- L'ISR du site public revalide automatiquement à chaque approbation/retrait.
- En dev local, l'ISR ne s'applique pas (SSR à chaque requête) — les changements sont visibles immédiatement.

---

## Schéma Firestore (résumé)

### Collection `ressources` (type `Ressource` dans `lib/types/ressource.ts`)
```
slug, title, type, pilier, status, metaTitle, metaDescription,
heroImageUrl, heroImageAlt,
shortAnswer, introSection, scienceSection, mechanismSection,
judithApproach, whatToExpect, protocolSection, testimonial,
faqEntries[], citations[],
relatedServices[], relatedFaqs[], relatedArticles[], relatedResources[],
authorName,
publishedAt, updatedAt, createdAt,
_lastResearchedAt, _newestSourceYear, _freshnessNote
```

### Collection `faqs` (type `FAQ` dans `lib/types/faq.ts`)
```
question, reponse, category, order, status,
ctaVariant, relatedServices[], relatedArticles[], relatedFaqs[],
publishedAt, updatedAt, createdAt,
reviewComment, reviewedAt, reviewedBy, submittedAt,
_lastResearchedAt
```

⚠️ **Champ `reponse` (français), pas `answer`**. Si vous voyez `answer` dans un doc Firestore, c'est de la dette d'une ancienne version d'inject.mjs — à nettoyer.

---

## Indexes Firestore requis

Voir `firestore.indexes.json` à la racine. Les indexes critiques pour le pipeline :

| Collection | Champs | Usage |
|------------|--------|-------|
| `publicBlog` | `(status ASC, updatedAt DESC)` | Hub CMS — filtre par statut |
| `faqs` | `(status ASC, updatedAt DESC)` | Hub CMS — filtre par statut |
| `ressources` | `(status ASC, updatedAt DESC)` | Hub CMS — filtre par statut |
| `faqs` | `(status, category, order)` | Site public /faq |
| `ressources` | `(status, pilier, publishedAt DESC)` | Site public /ressources |
| `publicBlog` | `(status, publishedAt DESC)` | Site public /blog |

Après modification du fichier d'indexes :
```bash
firebase deploy --only firestore:indexes
```
La construction prend 1-5 minutes. Pendant ce temps, les requêtes filtrées plantent silencieusement (Promise.allSettled côté API masque l'erreur).

---

## Gotchas / Troubleshooting

### Le contenu ne s'affiche pas après injection
1. Vérifier le statut dans Firestore (probablement `pending`)
2. Approuver dans le Hub /contenu (bouton « Approuver »)
3. En dev local, recharger la page (l'ISR ne s'applique pas en dev)
4. En prod, attendre quelques secondes pour le revalidate ISR

### Le Hub affiche un champ vide alors que le markdown a du contenu
Probablement un mismatch de nom de champ (cf. bug `answer` vs `reponse` pour les FAQ). Vérifier que le champ Firestore correspond au type TypeScript dans `lib/types/`.

### `ressource.X.map is not a function` sur le site public
Un champ array contient une string (typiquement `"[]"` à la place de `[]`). Causes connues :
- Vieille donnée injectée par une ancienne version d'inject.mjs (le parser ne gérait pas `[]` inline)
- Re-injecter le markdown corrige Firestore. La fonction `normalizeRessource()` dans `lib/firestore/public-ressources.ts` masque ce cas en defense in depth.

### Les filtres du Hub /contenu ne renvoient rien
Indexes Firestore composites manquants ou en cours de construction. Vérifier `firestore.indexes.json` puis `firebase deploy --only firestore:indexes`. État dans la Firebase Console > Firestore > Indexes.

### Le parser YAML interprète mal une valeur
Le parser d'`inject.mjs` est custom (pas une vraie lib YAML, par choix de zéro-dépendance). Il gère :
- Strings entre `"..."` (recommandé pour tout texte avec apostrophes ou caractères spéciaux)
- Numbers (auto-détectés)
- Booleans (`true` / `false`)
- Arrays vides inline (`[]`)
- Arrays multi-lignes (`- item`)
- Objects multi-lignes (citations, faqEntries — indentation 2 espaces)

Il NE gère PAS :
- Arrays inline non vides (`[a, b, c]`) — utiliser le format multi-lignes
- Multi-line strings (`>` ou `|`) — utiliser une seule ligne entre guillemets, ou le mettre dans une section markdown
- Anchors / aliases YAML

En cas de doute, faire un dry-run et vérifier que les valeurs sont du bon type.

### Erreur Firebase "FAILED_PRECONDITION : The query requires an index"
Ajouter l'index proposé dans le message d'erreur à `firestore.indexes.json`, puis `firebase deploy --only firestore:indexes`.

---

## Références

- Type ressource : `lib/types/ressource.ts`
- Type FAQ : `lib/types/faq.ts`
- API CMS : `app/api/cms/`
- Hub UI : `app/(app)/contenu/`
- Site public ressources : `app/(public)/ressources/[slug]/page.tsx`
- Site public FAQ : `app/(public)/faq/page.tsx`
- Lecture Firestore (avec normalisation) : `lib/firestore/public-ressources.ts`, `lib/firestore/public-faq.ts`
