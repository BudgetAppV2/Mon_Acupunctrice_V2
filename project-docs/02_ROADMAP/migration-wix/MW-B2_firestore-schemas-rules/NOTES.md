# MW-B2 — Notes d'exécution

**Date** : 14 avril 2026
**Exécuté par** : Claude Code (Opus)
**Branche** : `feature/site-public-migration`

---

## Résumé

5 fichiers de types TypeScript créés dans `lib/types/` (faq.ts, ressource.ts, public-blog.ts, service-page.ts, site-config.ts). Firestore rules mis à jour avec `isAdmin()` (allowlist emails vérifiés Benoit + Judith) et 5 blocs match pour les nouvelles collections. 4 indexes composites ajoutés dans `firestore.indexes.json`. DATA_MODEL.md documenté avec les 5 nouvelles collections. Build passe, JSON valide, zéro modification des fichiers Hub existants.

---

## Points bloquants rencontrés

Aucun.

---

## Note sur `isAdmin()` (QS2 — résolue)

**Mécanisme choisi** : allowlist d'emails vérifiés, directement dans les Firestore rules :
- `barchambault@grandsballets.com` (Benoit)
- `jdufourdsavard@gmail.com` (Judith)

Vérifie `request.auth.token.email_verified == true` en plus — automatiquement vrai pour les comptes Google mais protège contre un provider non vérifié.

**Prérequis pour MW-E1** : Judith doit s'être connectée au moins une fois au Hub avec `jdufourdsavard@gmail.com` pour que son compte Firebase Auth existe. Si ce n'est pas le cas, les writes côté client depuis l'admin FAQ échoueront silencieusement.

**Pour ajouter un admin** : éditer la liste dans `firestore.rules`, commiter, `firebase deploy --only firestore:rules`.

---

## Décisions appliquées

- **QS1** : `Ressource` avec 8 champs structurés riches (pas `content: string`) — aligné sur `DECISIONS_Q1-Q16.md` et les fichiers `source-resources/*.md`
- **QS2** : `isAdmin()` par allowlist emails vérifiés (pas UID hardcodé, pas `auth != null`)
- **Q11** : status `'rejected'` ajouté + `rejectionReason?`, `rejectedAt?`, `rejectedBy?` sur toutes les collections avec status
- **SiteConfig** : JSDoc d'avertissement ajouté car lecture publique sans auth — ne jamais y stocker de données sensibles

---

## Livrables créés/modifiés

| # | Livrable | Fichier(s) |
|---|----------|------------|
| L1 | Types TypeScript | `lib/types/faq.ts`, `ressource.ts`, `public-blog.ts`, `service-page.ts`, `site-config.ts` |
| L2 | Firestore rules | `firestore.rules` (43 lignes ajoutées, 0 modifiées) |
| L3 | Indexes | `firestore.indexes.json` (4 indexes ajoutés) |
| L4 | Documentation | `project-docs/03_TECH/DATA_MODEL.md` (5 collections documentées) |
