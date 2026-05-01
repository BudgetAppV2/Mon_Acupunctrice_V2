# Scouting — Voix éditoriale de Judith

**Date** : 13 avril 2026
**Temps passé** : 25 min
**Statut global** : 🟢 Vert

## TL;DR

Judith a une voix authentique, empathique et accessible, mais **trois registres distincts coexistent** dans le corpus actuel : (1) Judith intime (blog nausées, page À propos — tutoiement, anecdotes, ton maternel), (2) Judith + rédactrice web Claire Thomas (blog co-écrit — plus formel, structuré), (3) Judith SEO (FAQ/piliers locaux — scientifique, vouvoiement, "je" stratégique). La voix est reproductible à ~75% par IA avec un bon prompt. Les 25% restants nécessitent un guide de ton, des anecdotes validées, et un choix clair tu/vous.

## Ce qu'on savait (hypothèses du plan)

- Le plan mentionne "voix de Judith à la première personne" pour les FAQ
- Ton chaleureux, pédagogique, sans jargon
- Cohérent avec le positionnement accessible

## Ce qu'on a trouvé

### Sources analysées

4 corpus distincts ont été échantillonnés :

**A. Blog Wix** (3 articles complets) : nausées de grossesse (janv. 2026), acupuncture sociale (mars 2025), fertilité (mars 2025)

**B. Page À propos** : texte de présentation personnelle

**C. FAQ SEO** : 6 fichiers dans `scripts/seo-geo/source/`

**D. Pages piliers SEO** : 5 fichiers dans `scripts/seo-geo/source-resources/`

### Trois voix, pas une

| Registre | Exemple | Ton | Pronom | Formalité |
|---|---|---|---|---|
| **Judith intime** | Blog nausées, page À propos | Chaleureux, maternel, humour | "je", "tu" | 3/10 |
| **Judith + Claire Thomas** | Blog co-écrit (sociale, fertilité) | Structuré, informatif | "nous", impersonnel | 6-7/10 |
| **Judith SEO** | FAQ + pages piliers locales | Rigoureux, empathique, scientifique | "je", "vous" | 4-5/10 |

**La voix la plus authentique est la voix intime** (registre 1) — c'est celle qu'on reconnaît comme "Judith". Exemples :
- *"Puis un matin, la nausée s'installe. Puis le lendemain. Et le surlendemain."*
- *"(Mais j'ai survécu.)"*
- *"ça paraît que j'ai vécu cette situation"*

### Vocabulaire récurrent

**Registre émotionnel :** accompagner/accompagnement, doux/douceur, parcours, soutenir, bienveillant, écoute, bien-être, harmonie

**Registre scientifique :** méta-analyse, essais contrôlés randomisés, sécuritaire (québécisme), niveau de preuve

**Marqueurs québécois :** tannée, bb1, bedon, "ça paraît que", thérapeute (pour s'auto-désigner)

**Formules-signature :** "Soyons honnêtes", "ce n'est pas un remède miracle", "en complément, pas en remplacement", "la science le confirme"

### Métaphores et style

Judith n'est **pas une styliste**. Peu de métaphores, et quand il y en a, elles sont pragmatiques : "casser la boucle anxieuse", "boîte à outils", "la tête plus légère". Sa force repose sur l'authenticité du vécu, pas sur l'éloquence. Les figures de style sont celles du langage oral québécois.

### Références scientifiques

**Blog Wix :** vagues — noms d'auteurs sans référence formelle (Debra Betts, Isabelle Brabant)
**FAQ/Piliers SEO :** très précises — auteurs, titre, journal, année, liens PubMed, chiffres statistiques

L'écart est majeur entre les deux corpus.

### Pronom tu/vous

C'est **l'inconsistance la plus visible** du corpus :
- Blog nausées : tutoiement dominant
- Blog sociale / fertilité : vouvoiement implicite
- Page À propos : vouvoiement ponctuel
- FAQ/Piliers SEO : vouvoiement dominant avec "je" fréquent

## Surprises et découvertes

1. **Claire Thomas, rédactrice web spécialisée en périnatalité**, co-signe les articles blog. Sa voix est distincte de celle de Judith — plus formelle, plus structurée. Ce n'est pas une ghostwriter transparente.

2. **Les textes SEO locaux** (`scripts/seo-geo/`) ont une voix construite très différente du blog Wix — plus rigoureuse, plus scientifique, avec un "je" stratégique. C'est probablement le travail de Benoit + Claude, pas de Judith directement.

3. **Le passage de l'informatif à l'intime** est le marqueur le plus distinctif de la "vraie" Judith. Dans le blog nausées, elle bascule soudainement de l'explication vers l'empathie vécue. Cette bascule est le coeur de la voix et la partie la plus difficile à reproduire par IA.

4. **Les québécismes sont dosés naturellement** — 2-3 par texte, jamais forcés. Un LLM risque soit de les omettre (trop "français de France"), soit d'en abuser.

## Risques identifiés

1. **Incohérence tu/vous** 🟡 : si non tranchée, le site aura un ton inconsistant qui mine la crédibilité. Il faut décider maintenant : tu (intime, cohérent avec Instagram) ou vous (professionnel, cohérent avec le positionnement clinique).

2. **Anecdotes personnelles non inventables** 🟡 : Judith mentionne ses 3 grossesses, ses nausées, la maison de naissance, son passé dans le spectacle vivant. Un LLM ne peut pas inventer ça — il faut un répertoire d'anecdotes validées par Judith.

3. **Deux auteurs, deux voix** 🟡 : les articles blog co-écrits avec Claire Thomas ont un ton différent des textes purement Judith. Décider quelle voix est la "voix du site" avant de produire du contenu.

## Recommandations d'ajustement du plan

1. **Ajouter un livrable "Guide de ton"** à la Mission 6 : 2-3 pages avec exemples positifs/négatifs, choix tu/vous par contexte, glossaire québécois dosé (3-4 expressions par texte max), répertoire d'anecdotes

2. **Trancher tu/vous maintenant** — suggestion : blog et FAQ = "vous" (plus professionnel, plus large), captions Instagram = "tu" (intime, communauté). C'est un choix à valider avec Judith.

3. **Prévoir des few-shot examples dans le prompt système** : inclure 2-3 paragraphes réels de Judith (voix intime) comme référence pour la génération de contenu

4. **Le plan parle de "voix de Judith à la première personne" pour les FAQ** — c'est confirmé comme le bon choix, mais il faut calibrer le "je" pour qu'il sonne Judith et pas générique

## Questions à ramener à Benoit

1. **Tutoiement ou vouvoiement pour le site public ?** Le blog Wix est inconsistant. Judith tutoie sur Instagram et dans ses meilleurs textes. Le vouvoiement est plus attendu pour un site professionnel de santé. Quel choix ?

2. **Claire Thomas continuera-t-elle à co-écrire pour le nouveau site ?** Si oui, le guide de ton doit aussi la cibler. Si non, il faut décider si on reproduit sa voix ou si on revient à la voix pure de Judith.

3. **Judith peut-elle fournir 5-10 anecdotes personnelles validées** (grossesses, parcours, moments marquants avec patientes — anonymisés) pour alimenter le répertoire de contenu ?

4. **Les textes SEO dans `scripts/seo-geo/` ont été validés par Judith ?** Leur ton est assez différent du blog — est-ce délibéré ou un écart à corriger ?
