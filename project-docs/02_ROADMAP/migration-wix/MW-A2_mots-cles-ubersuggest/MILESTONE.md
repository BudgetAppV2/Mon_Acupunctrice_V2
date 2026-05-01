# Milestone MW-A2 : Recherche mots-clés Ubersuggest Pro

**Type** : Prep
**Vague** : 0
**Priorité** : High
**Temps estimé Claude Code** : Manuel 2h (Benoit opère Ubersuggest, Claude Code structure les résultats)
**Dépendances** : Aucune
**Status** : 🔴 Not started

---

## Objectif

Obtenir les volumes de recherche réels et la difficulté concurrentielle chiffrée pour les mots-clés cibles des 4 piliers, afin de prioriser le contenu à produire au lancement.

---

## Contexte minimal

Le plan stratégique v0.3 (§3.2) identifie ~40 mots-clés hypothétiques répartis sur 4 piliers + un pilier transversal GEO local. Le scouting R2 a confirmé que Judith est absente du top 10 pour 6/8 requêtes testées — c'est une création SEO, pas une migration. Un abonnement Ubersuggest Pro (~30 $ pour 1 mois) est nécessaire pour obtenir les volumes réels Canada/Québec.

---

## Livrables

- [ ] **Dataset mots-clés par pilier** — pour chaque pilier (fertilité, grossesse, pédiatrie, acupuncture sociale), 30-50 mots-clés avec : volume mensuel réel (Canada), difficulté concurrentielle (SD), intention de recherche, top 3 résultats actuels sur Google Canada
- [ ] **Priorisation en 3 tiers** — quick wins (SD < 30, volume > 50), moyen terme (SD 30-50), long terme (SD > 50 ou head terms)
- [ ] **Liste finale des 20-30 mots-clés prioritaires** — ceux qui seront ciblés au lancement du site, avec la page cible assignée pour chacun (`/services/fertilite`, `/faq/grossesse`, `/blog/[slug]`, etc.)

---

## Approche technique

Ce milestone est **majoritairement manuel** :

1. **Benoit** achète l'abonnement Ubersuggest Pro (30 $/mois) et exporte les données
2. **Benoit** lance les recherches par batch : les mots-clés du plan §3.2 + les PAA identifiées dans le scouting
3. **Claude Code** structure les exports CSV/Excel d'Ubersuggest en un document markdown exploitable
4. **Claude Code** croise les données avec les PAA du scouting pour identifier les opportunités de contenu
5. **Claude Code** produit la priorisation et le mapping mots-clés → pages

Le dataset final alimentera la rédaction des meta tags, des H1, et du contenu des FAQ/ressources dans les milestones suivants.

---

## Fichiers impactés

```
📄 NEW (artefacts produits) :
- MW-A2_mots-cles-ubersuggest/artefacts/keywords-fertilite.md
- MW-A2_mots-cles-ubersuggest/artefacts/keywords-grossesse.md
- MW-A2_mots-cles-ubersuggest/artefacts/keywords-pediatrie.md
- MW-A2_mots-cles-ubersuggest/artefacts/keywords-sociale.md
- MW-A2_mots-cles-ubersuggest/artefacts/keywords-geo-local.md
- MW-A2_mots-cles-ubersuggest/artefacts/priorisation-finale.md
```

---

## Definition of Done

- [ ] Au moins 120 mots-clés documentés avec volumes réels (30+ par pilier)
- [ ] Chaque mot-clé a un volume mensuel, une difficulté, et une intention de recherche assignée
- [ ] La liste finale de 20-30 mots-clés prioritaires est produite avec page cible pour chacun
- [ ] La priorisation en 3 tiers est argumentée (pas juste un tri par volume)
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Critères de validation du livrable

- **Couverture** : les 4 piliers sont couverts + les keywords "combien coûte" + les keywords de marque
- **Réalisme** : les volumes correspondent à des recherches Canada/Québec, pas mondiales
- **Actionabilité** : chaque mot-clé prioritaire pointe vers une page cible spécifique du plan d'arborescence (§4.1)
- **Cohérence** : les mots-clés pédiatriques (niche ouverte identifiée en scouting R3) sont bien présents et priorisés

---

## Contraintes

- Ne pas modifier le code du Hub admin
- Ne pas modifier le plan éditorial v0.3 — ce milestone l'alimente, il ne le remplace pas
- Benoit doit fournir l'accès Ubersuggest — Claude Code ne peut pas acheter l'abonnement
- Annuler l'abonnement Ubersuggest après extraction des données

---

## Références

- Plan stratégique §3.2 (stratégie mots-clés), §3.3 (intentions de recherche)
- Rapports de scouting : `docs/migration-wix/02-recherche/scouting/` (surtout R2 pour les positions actuelles, R3 pour la niche pédiatrique)
- Plan stratégique §5.3 (volume cible FAQ — les mots-clés informent le nombre de FAQ à produire)

---

## Notes de planification

- Le scouting R2 a déjà validé les hypothèses de mots-clés de manière qualitative. Ubersuggest donne les chiffres réels pour arbitrer.
- Le pilier pédiatrique est identifié comme niche quasi-vide à Montréal (scouting R3) — les données Ubersuggest confirmeront ou infirmeront cette opportunité.
- Le mot-clé "acupuncture sociale" est confirmé comme réellement recherché au Québec (article Radio-Canada). Ubersuggest donnera le volume exact.
- Point à valider avec Benoit : est-ce que l'export Ubersuggest inclut les PAA (People Also Ask) ou faut-il les collecter séparément ?
