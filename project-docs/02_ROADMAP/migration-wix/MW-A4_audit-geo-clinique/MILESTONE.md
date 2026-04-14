# Milestone MW-A4 : Audit GEO + plan d'action clinique La Source en Soi

**Type** : Prep
**Vague** : 0
**Priorité** : High
**Temps estimé Claude Code** : 2-3h
**Dépendances** : Aucune
**Status** : 🔴 Not started

---

## Objectif

Consolider l'audit géolocalisé de la présence en ligne de Judith, vérifier la cohérence NAP sur le web, analyser les avis Google de La Source en Soi, et produire un plan d'action présentable à la direction de la clinique pour maximiser la stratégie d'emprunt de réputation.

---

## Contexte minimal

La stratégie GEO repose sur l'emprunt de réputation de La Source en Soi (4,9/5, ~1 215 avis Google — presque 3× le leader SEO Synergek). Le scouting R4 a confirmé la fiche GBP et le backlink existant. Ce milestone transforme les découvertes du scouting en un plan d'action concret avec un argumentaire pour la direction de la clinique.

---

## Livrables

- [ ] **Audit NAP complet** — vérification de la cohérence Nom-Adresse-Téléphone de Judith sur : Pages Jaunes, Ordre des acupuncteurs du Québec, Yelp, annuaires santé, Facebook, LinkedIn, Lumino Health (Sun Life). Liste des incohérences avec corrections recommandées.
- [ ] **Analyse des 50 avis récents La Source en Soi** — combien mentionnent Judith, quels thèmes reviennent, 3-5 avis citables pour la page `/reserver` (avec attribution source)
- [ ] **Plan d'action clinique** — document présentable à la direction de La Source en Soi avec : argumentaire (pourquoi le site de Judith bénéficie à la clinique), actions demandées (mise à jour backlink, ajout dans fiche GBP, posts GBP), livrables offerts en retour (trafic qualifié, contenu SEO)
- [ ] **Kit "avis mentionnant Judith"** — texte modèle que Judith peut envoyer à ses patientes satisfaites pour demander un avis Google mentionnant son nom

---

## Approche technique

**Audit NAP** :
1. Rechercher "Judith Dufour-Savard" et "acupuncturejudith.ca" sur les annuaires majeurs (Pages Jaunes, Yelp, Ordre des acupuncteurs, Lumino Health)
2. Pour chaque fiche trouvée, documenter : nom affiché, adresse, téléphone, URL du site, lien vers la fiche
3. Identifier les incohérences (adresse différente, téléphone obsolète, ancien site web)
4. Le NAP canonique doit être celui de La Source en Soi (décision plan §8.2)

**Analyse avis Google** :
1. Lire les 50 avis les plus récents de La Source en Soi sur Google Maps
2. Compter les mentions explicites de "Judith" ou "Dufour-Savard"
3. Catégoriser les thèmes (fertilité, grossesse, douleur, stress, accueil, etc.)
4. Sélectionner 3-5 avis récents pertinents pour la page `/reserver` — en priorité ceux qui mentionnent Judith

**Plan d'action clinique** :
Document markdown structuré en 3 sections :
1. Argumentaire : "Le site de Judith va générer du trafic qualifié vers la clinique via SEO local"
2. Demandes : mise à jour du backlink existant (nouveau domaine ou vérification de la redirection), ajout de Judith dans la fiche GBP, posts GBP, encouragement des avis mentionnant Judith
3. Offre : Judith apporte du contenu SEO, une présence sociale active, et un funnel vers Go Rendez-Vous

**Kit avis** :
Template de message SMS/email que Judith peut personnaliser et envoyer après une séance réussie.

---

## Fichiers impactés

```
📄 NEW (artefacts produits) :
- MW-A4_audit-geo-clinique/artefacts/audit-nap.md
- MW-A4_audit-geo-clinique/artefacts/analyse-avis-google.md
- MW-A4_audit-geo-clinique/artefacts/plan-action-clinique.md
- MW-A4_audit-geo-clinique/artefacts/kit-avis-judith.md
```

---

## Definition of Done

- [ ] Au moins 6 sources NAP vérifiées (Pages Jaunes, Ordre, Lumino, Yelp, Facebook, LinkedIn)
- [ ] Au moins 50 avis Google analysés avec décompte des mentions de Judith
- [ ] 3-5 avis sélectionnés et prêts à être affichés sur `/reserver` avec attribution source
- [ ] Le plan d'action clinique est lisible par un non-tech (la direction de La Source en Soi)
- [ ] Le kit avis contient un modèle de message prêt à l'emploi
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Critères de validation du livrable

- **Actionabilité** : le plan d'action contient des demandes concrètes avec des actions spécifiques (pas "collaborer plus")
- **Attribution rigoureuse** : chaque avis cité est attribué à "Avis Google sur la clinique La Source en Soi" — pas de fausse attribution à Judith directement
- **Cohérence** : le NAP recommandé est celui de La Source en Soi (adresse clinique, téléphone clinique), conformément à la stratégie plan §8.1

---

## Contraintes

- Ne pas modifier le code du Hub admin
- Ne pas inventer de témoignages ou reformuler des avis — citation fidèle avec attribution
- Ne pas contacter la direction de La Source en Soi — le plan d'action est un document que Benoit/Judith présenteront eux-mêmes
- Ne pas créer de fiche GBP séparée pour Judith (invariant du projet — plan §8.1)
- Les données Lumino Health (3 avis seulement) ne sont pas une priorité — les 1 215 avis Google sont l'actif principal

---

## Références

- Plan stratégique §8 (stratégie GEO local), §8.1 (emprunt de réputation), §8.1b (affichage stratégique des avis), §8.2 (leviers GEO), §8.3 (backlinks locaux), Mission 4 (§10)
- CLAUDE.md migration — invariant "pas de GBP Judith séparée", invariant "La Source en Soi mentionnée partout"
- Scouting R4 : `docs/migration-wix/02-recherche/scouting/` (fiche GBP confirmée, backlink identifié)
- Plan stratégique §9.1 (page `/reserver` avec témoignages curatés)

---

## Notes de planification

- L'accès aux avis Google Maps peut se faire manuellement (scroll + copier) ou via scraping léger. Pas d'API officielle Google Reviews pour les avis textuels sans Places API payante.
- Le plan d'action clinique est un document de négociation — le ton doit être collaboratif, pas unilatéral. Judith et la clinique ont un intérêt mutuel.
- Point à valider avec Benoit : est-ce que Judith a déjà une relation formelle avec la direction qui faciliterait la présentation du plan ?
- Le kit avis doit être simple et non-intrusif — certaines patientes peuvent se sentir gênées si la demande est trop directe.
