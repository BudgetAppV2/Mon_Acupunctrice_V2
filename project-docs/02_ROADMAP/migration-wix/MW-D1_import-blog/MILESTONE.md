# Milestone MW-D1 : Import des 11 articles blog Wix → Firestore

**Type** : Content
**Vague** : 4
**Priorité** : High
**Temps estimé Claude Code** : 1-2h
**Dépendances** : MW-B4
**Status** : 🔴 Not started

---

## Objectif

Exécuter le script de migration (écrit en MW-B4) pour pousser les 11 articles de blog Wix dans la collection `publicBlog` Firestore avec images re-uploadées dans Firebase Storage.

---

## Contexte minimal

MW-A1 a exporté les articles en Ricos JSON brut. MW-B4 a écrit le parser Ricos → markdown et le script de migration. Ce milestone est l'exécution du script + la validation du résultat. C'est un milestone court car le travail technique lourd est déjà fait.

---

## Livrables

- [ ] **11 documents `publicBlog`** dans Firestore avec `status: 'published'`, contenu markdown, métadonnées complètes
- [ ] **Images re-uploadées** dans Firebase Storage sous `/public/site/blog/{slug}/`
- [ ] **Rapport de migration** — nombre d'articles importés, erreurs, warnings, URLs d'images migrées

---

## Approche technique

1. Vérifier que MW-B4 est complet (parser + script fonctionnels)
2. Lancer le script en mode `--dry-run` pour valider
3. Vérifier 2-3 articles en dry-run : contenu markdown lisible, images référencées, métadonnées correctes
4. Lancer le script en mode réel
5. Valider dans la console Firebase que les 11 documents sont créés
6. Vérifier que les images sont accessibles via leurs URLs Firebase Storage

**Données à vérifier par article** :
- `title` : titre original de l'article Wix
- `slug` : dérivé du titre, lowercase, hyphen-separated, sans accents
- `content` : markdown converti depuis Ricos JSON
- `excerpt` : extrait de l'article (premiers 200 caractères ou extrait Wix)
- `coverImage` : URL Firebase Storage de l'image de couverture
- `author` : "Judith Dufour-Savard" ou "Judith Dufour-Savard et Claire Thomas"
- `status` : `'published'`
- `publishedAt` : date de publication originale Wix
- `wixPostId` : ID du post Wix (pour la double publication future)

---

## Fichiers impactés

```
📄 NEW (artefacts produits) :
- MW-D1_import-blog/artefacts/rapport-migration-blog.md

🔥 FIRESTORE (données créées) :
- publicBlog/ (11 documents)

☁️ STORAGE (fichiers uploadés) :
- /public/site/blog/{slug}/ (images par article)
```

---

## Definition of Done

- [ ] 11 documents présents dans la collection `publicBlog` Firestore
- [ ] Chaque document a `status: 'published'`, un `slug` unique, et un contenu markdown non vide
- [ ] Les images inline sont accessibles via leurs URLs Firebase Storage (vérifier 3-4 images aléatoires)
- [ ] Les dates de publication originales sont préservées
- [ ] Le rapport de migration ne contient aucune erreur
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Integration** : ouvrir la console Firebase, vérifier les 11 documents dans `publicBlog`
- **Contenu** : lire le markdown de 2-3 articles dans la console et vérifier la qualité de conversion
- **Images** : ouvrir 3-4 URLs Firebase Storage dans un navigateur — les images doivent s'afficher

---

## Contraintes

- Ne pas modifier le contenu des articles — import fidèle
- Ne pas exécuter le script sur la production sans validation dry-run préalable
- Les articles co-écrits avec Claire Thomas doivent la créditer dans le champ `author`
- Ne pas supprimer les articles du site Wix — double existence pendant la transition

---

## Références

- MW-A1 (exports Ricos JSON)
- MW-B4 (parser + script de migration)
- MW-B2 (schéma `PublicBlogPost`)
- Amendement A3 (double publication — le `wixPostId` permet le lien)

---

## Notes de planification

- Ce milestone est court (1-2h) car il s'agit principalement d'exécuter un script déjà écrit et de valider le résultat.
- Si le script de MW-B4 a des bugs, les corriger ici et noter les corrections dans le NOTES.md.
- Les slugs générés doivent correspondre aux URLs futures `/blog/[slug]` — vérifier qu'ils sont URL-safe (pas d'accents, pas d'espaces, pas de caractères spéciaux).
