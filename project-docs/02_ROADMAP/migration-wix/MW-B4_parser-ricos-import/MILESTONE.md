# Milestone MW-B4 : Parser Ricos JSON + script migration Wix → Firestore

**Type** : Infra
**Vague** : 2
**Priorité** : Critical
**Temps estimé Claude Code** : 3-4h
**Dépendances** : MW-B2, MW-A1
**Status** : 🔴 Not started

---

## Objectif

Écrire un parser Ricos JSON → markdown fiable et un script de migration qui transforme les 11 articles de blog Wix en documents `publicBlog` Firestore avec images re-uploadées vers Firebase Storage.

---

## Contexte minimal

MW-A1 a exporté les 11 articles en Ricos JSON brut et téléchargé leurs images. MW-B2 a défini le schéma `PublicBlogPost` dans Firestore. Ce milestone fait le pont : convertir le format propriétaire Wix (Ricos JSON) en markdown exploitable, et pousser le résultat dans Firestore avec les images dans Firebase Storage.

---

## Livrables

- [ ] **Parser Ricos → Markdown** — module TypeScript qui convertit un document Ricos JSON en markdown avec support des éléments courants (paragraphes, titres, listes, images, liens, bold/italic, citations)
- [ ] **Script de migration** — script exécutable qui itère sur les 11 articles, les convertit, re-uploade les images, et écrit dans `publicBlog` Firestore avec `status: 'published'`
- [ ] **Mode dry-run** — le script peut tourner sans écrire dans Firestore pour validation

---

## Approche technique

**Parser Ricos JSON** (`lib/utils/ricos-parser.ts`) :

Le format Ricos est un arbre de nœuds avec `type`, `nodes` (enfants), et `textData` ou `imageData`. Les types principaux à supporter :

- `PARAGRAPH` → paragraphe markdown
- `HEADING` (levels 1-6) → `#`, `##`, `###`
- `BULLETED_LIST` / `ORDERED_LIST` + `LIST_ITEM` → listes
- `IMAGE` → `![alt](url)` avec téléchargement + re-upload
- `LINK_PREVIEW` / inline link → `[text](url)`
- `BLOCKQUOTE` → `>`
- Text decorations : `BOLD`, `ITALIC`, `UNDERLINE` → `**`, `*`, markup approprié

Structure du parser :
```typescript
function parseRicosToMarkdown(ricosContent: RicosContent): string
function parseNode(node: RicosNode): string
function parseTextNode(node: RicosTextNode): string
```

**Script de migration** (`scripts/migrate-wix-blog.ts`) :

1. Lire les fichiers Ricos JSON depuis `MW-A1_inventaire-wix/artefacts/blog-ricos/`
2. Pour chaque article :
   a. Parser le Ricos JSON → markdown
   b. Extraire les métadonnées (titre, date, catégorie, extrait, auteur)
   c. Identifier les images inline dans le contenu
   d. Télécharger chaque image et l'uploader vers Firebase Storage sous `/public/site/blog/{slug}/`
   e. Remplacer les URLs Wix dans le markdown par les nouvelles URLs Firebase Storage
   f. Construire le document `PublicBlogPost` (schéma MW-B2)
   g. Écrire dans Firestore `publicBlog/{slug}`
3. Générer un rapport de migration (succès/échecs/warnings)

**Mode dry-run** : flag `--dry-run` qui exécute tout sauf les écritures Firestore et les uploads Storage. Affiche les documents qui seraient créés dans la console.

**Gestion des images** :
- Les images Wix sont servies depuis `static.wixstatic.com` — URLs de la forme `https://static.wixstatic.com/media/...`
- Télécharger en résolution originale (pas de transformation Wix `w_XXX,h_YYY`)
- Upload vers Firebase Storage avec le chemin : `public/site/blog/{slug}/{image-index}.{ext}`
- Générer les URLs publiques via `getDownloadURL`

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- lib/utils/ricos-parser.ts
- scripts/migrate-wix-blog.ts

📄 READ (sources) :
- MW-A1_inventaire-wix/artefacts/blog-ricos/ (11 fichiers JSON)
- lib/types/public-blog.ts (schéma cible)
- lib/firebase-admin.ts (config Admin pour écriture Firestore)
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] Le parser Ricos → Markdown produit du markdown lisible pour les 11 articles
- [ ] Les titres, paragraphes, listes, images, liens et citations sont correctement convertis
- [ ] Le script de migration en mode `--dry-run` affiche 11 documents valides avec leurs métadonnées
- [ ] Le script de migration en mode réel écrit 11 documents dans `publicBlog` avec `status: 'published'`
- [ ] Les images sont re-uploadées dans Firebase Storage et les URLs dans le markdown pointent vers Storage
- [ ] Le rapport de migration ne contient aucune erreur
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Unit** : parser Ricos sur 2-3 cas de test (paragraphe simple, liste imbriquée, image inline, texte bold/italic)
- **Integration** : dry-run complet sur les 11 articles — vérifier que le markdown est lisible et que les métadonnées sont correctes
- **Visual** : ouvrir 2-3 fichiers markdown générés dans un renderer pour vérifier la qualité de conversion
- **Images** : vérifier que 2-3 images sont bien téléchargées et accessibles via leur URL Firebase Storage

---

## Contraintes

- Ne pas modifier le code du Hub admin
- Ne pas réécrire ou "améliorer" le contenu des articles de Claire Thomas — conversion fidèle uniquement
- Le parser doit gérer gracieusement les types Ricos non reconnus (log warning + fallback texte brut)
- Ne pas utiliser de bibliothèque Ricos officielle Wix (elle est lourde et orientée rendu DOM, pas conversion markdown)
- Le script de migration ne doit PAS s'exécuter automatiquement au build — c'est un one-shot lancé manuellement par Benoit
- Les écritures Firestore utilisent `firebase-admin` (server-side, pas les SDK client)

---

## Références

- Plan stratégique §4.5 (intégration Wix Blog pour l'import), Mission 1 (§10)
- MW-A1 (exports Ricos JSON — prérequis)
- MW-B2 (schéma `PublicBlogPost` — prérequis)
- API Wix Blog existante dans `app/api/blog/` (pour comprendre le format des données)
- `lib/firebase-admin.ts` (config Admin existante)

---

## Notes de planification

- Le format Ricos est documenté partiellement par Wix. La source de vérité est l'inspection des JSON exportés en MW-A1 — le parser doit être écrit en analysant les données réelles, pas la doc Wix.
- Les articles de Claire Thomas peuvent contenir des éléments Ricos exotiques (dividers, embeds YouTube, etc.). Prévoir des fallbacks plutôt que des crashes.
- Le script de migration peut être réutilisé si de nouveaux articles sont publiés sur Wix pendant la période de transition (avant le switch DNS). La double publication (amendement A3) utilise une approche différente (écriture directe dans Firestore depuis l'API du Hub).
- Point à valider avec Benoit : les images Wix sont-elles en haute résolution ou compressées par le CDN Wix ? Tester avec une image pour vérifier la qualité avant de migrer les 11 articles.
- Gotcha : certains articles Wix ont peut-être des galeries d'images (grid layout dans Ricos). Le parser doit les traiter comme des images séquentielles en markdown.
