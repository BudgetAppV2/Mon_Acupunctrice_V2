# Scouting — Synthèse finale

**Date** : 13 avril 2026
**Durée totale du scouting** : ~2h30
**Recommandation globale** : 🟢 GO — avec ajustements mineurs

---

## Les 3 plus gros risques

1. **Faible autorité de domaine** 🟡 — `acupuncturejudith.ca` n'a quasi aucun historique SEO. Le seul ranking trouvé est un article en position ~6 sur une requête nationale. C'est une **création SEO**, pas une migration avec préservation de jus. Le temps de montée en ranking sera de 6-12 mois minimum. Mitigation : contenu de qualité dès le lancement, maillage interne, backlinks locaux (La Source en Soi, ordre professionnel).

2. **Dépendance à La Source en Soi** 🟡 — La stratégie GEO repose sur les 1,215 avis (4.9/5) de la clinique. Si Judith quitte la clinique, une partie du travail GEO est à refaire. Mitigation : construire en parallèle l'autorité propre de Judith via le blog et les backlinks personnels. Réévaluer à 12 mois.

3. **DNS probablement chez Wix** 🟡 — Si le domaine `acupuncturejudith.ca` est géré par Wix, la migration DNS est un point de friction avec risque de downtime. Mitigation : clarifier maintenant, transférer le domaine chez un registrar externe avant la migration du site.

## Les 3 plus grosses opportunités

1. **Positionnement unique confirmé** 🟢 — **Personne à Montréal ne combine spécialisation fertilité/grossesse + tarification solidaire.** Les cliniques fertilité sont premium. Les cliniques solidaires sont généralistes. Judith est la seule à occuper cette intersection. C'est le différenciateur stratégique le plus fort.

2. **1,215 avis Google (4.9/5) sur La Source en Soi** 🟢 — C'est un actif de réputation massif, bien plus puissant qu'anticipé. La plupart des concurrents ont 20-100 avis. Cette donnée doit être affichée sur le site comme argument de confiance ("Judith exerce à La Source en Soi, clinique notée 4.9/5 avec plus de 1,200 avis").

3. **Champ de contenu SEO grand ouvert** 🟢 — En dehors de Synergek, aucun concurrent n'a de blog actif, de FAQ structurées (schema.org FAQPage), ou de pages géo-locales. Les questions "People Also Ask" sont non couvertes localement. Le contenu existant (11 articles + 6 FAQ + 5 pages piliers) donne une longueur d'avance significative.

## Décisions humaines requises

Avant de démarrer la Phase 2 (architecture technique), Benoit doit trancher :

1. **DNS : où est géré `acupuncturejudith.ca` ?** — Wix ou registrar externe ? Ça conditionne la timeline de migration.

2. **Tu ou vous pour le site public ?** — Judith tutoie naturellement (Instagram, blog nausées). Le vouvoiement est plus attendu pour un site de santé. Le corpus actuel est inconsistant. Il faut trancher.

3. **Claire Thomas continue-t-elle à co-écrire ?** — Sa voix est distincte de celle de Judith. Ça impacte le guide de ton et la stratégie de contenu.

4. **L'acupuncture pédiatrique est-elle un pilier ?** — 3 articles blog existants, niche quasi-vierge à Montréal. Le plan mentionne "pédiatrie légère" comme incertain. Les données suggèrent une vraie opportunité.

5. **Upgrade Vercel Pro ?** — Les 2 crons Hobby sont occupés. Le plan mentionne un cron de fraîcheur SEO. ~20 $/mois.

6. **Budget outil SEO ?** — Un mois d'Ahrefs (~100 $) ou Ubersuggest Pro (~30 $) donnerait des volumes réels pour affiner la stratégie de mots-clés.

7. **Le contenu SEO dans `scripts/seo-geo/` est-il validé par Judith ?** — 6 FAQ + 5 pages piliers déjà rédigées. Si validées, c'est du contenu prêt à déployer.

8. **Droits de republication des articles Claire Thomas ?** — Question de propriété intellectuelle sur les 11 articles co-écrits.

## Ajustements suggérés au plan

**Ne pas appliquer directement** — Benoit intègrera après revue.

1. **Section 4.1 — Arborescence** : ajouter `/bienfaits` (page existante non prévue) ou intégrer son contenu dans les FAQ. Considérer `/services/pediatrie` si le pilier pédiatrique est confirmé.

2. **Section 3.2 — Mots-clés** : ajouter "acupuncture pédiatrique Montréal" comme keyword cible. Ajouter "combien coûte l'acupuncture Montréal" comme requête transactionnelle ciblée par `/tarifs`.

3. **Section 8 — Stratégie GEO** : amplifier la mention des 1,215 avis (4.9/5) de La Source en Soi. Ce chiffre doit apparaître sur `/reserver`, `/a-propos`, et les pages services. Réduire l'importance de Lumino Health (3 avis seulement, pas la source de social proof espérée).

4. **Section 8 — Schema.org** : le schema `Person` + `MedicalBusiness` existe déjà sur le site Wix actuel. Le recréer en Next.js avec la structure `Person.worksFor → MedicalClinic` proposée dans le plan est une amélioration, pas une création.

5. **Section 9.1 — Page /reserver** : ajouter la mention explicite de la note Google de la clinique comme argument de confiance. Revoir la section témoignages Lumino (3 avis est faible — compléter avec d'autres sources).

6. **Section 10 — Missions** : ajouter une matrice de redirections 301 (URL Wix → URL Next.js) comme livrable de la Mission 1. Ajouter un endpoint d'import de contenu Ricos → markdown comme livrable technique.

7. **Ajouter une section "Guide de ton"** dans les livrables de la Mission 6. Inclure : choix tu/vous, glossaire québécois dosé, répertoire d'anecdotes, few-shot examples.

8. **Section Risques (8.4)** : ajouter le risque DNS/migration de domaine comme risque technique.

9. **Architecture technique** : documenter le pattern `(public)/` route group dans Next.js 15 App Router. C'est la solution propre pour cohabiter avec les routes protégées existantes.

10. **Crons Vercel** : documenter la contrainte 2 crons max (plan Hobby) et l'impact sur le cron de fraîcheur SEO prévu.

## Prochaines étapes recommandées

Ordre suggéré pour les vraies missions de build :

1. **Clarifier les décisions humaines** (DNS, tu/vous, pédiatrie, Claire Thomas) — avant toute architecture
2. **Mission 1 — Inventaire Wix complet** + matrice de redirections 301 + extraction images
3. **Mission 6 — Voix de Judith** (guide de ton) — en parallèle de Mission 1
4. **Architecture technique** — route group `(public)`, layout public, schema Firestore, Firestore rules publiques
5. **Mission 2 — Recherche mots-clés réels** (avec outil SEO si budget disponible)
6. **Mission 3 — Analyse concurrentielle** approfondie (focus Synergek + cliniques solidaires)
7. **Mission 4 — Audit GEO complet** (NAP, backlinks, avis Google mentionnant Judith)
8. **Build phase 1** — Pages statiques (accueil, à propos, services, tarifs, contact, réserver)
9. **Build phase 2** — Blog migration + FAQ CMS
10. **Build phase 3** — Contenu SEO (PAA articles, FAQ par pilier, pages géo-locales)

---

**Verdict final : 🟢 GO.** Le plan stratégique est solide, les hypothèses sont largement validées, et le positionnement unique de Judith est confirmé par les données terrain. Les ajustements sont mineurs (amplifier La Source en Soi, réduire Lumino, ajouter pédiatrie). Aucun bloqueur technique dans le repo. Le champ SEO est ouvert. C'est le bon moment pour lancer.
