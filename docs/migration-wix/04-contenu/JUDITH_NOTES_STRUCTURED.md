# Notes Judith — Corrections structurées

> **Source** : `docs/migration-wix/04-contenu/Note site web.docx` (717 paragraphes, 80+ corrections)
> **Date d'extraction** : 30 avril 2026
> **Rappel commit existant** : `b7c9682` (53 corrections appliquées). Ce document re-vérifie TOUT pour identifier ce qui reste.
>
> **Format** : ❌ AVANT → ✅ APRÈS. Cocher [x] quand vérifié dans le code.

---

## A. RÈGLES GLOBALES (s'appliquent partout)

### A1. Ton — pas de "miracle", pas de "magique" [BANNI]
- [ ] Chercher dans tout le contenu : `miracle`, `magique`, `n'est pas un miracle`, `l'acupuncture n'est pas magique`, `traitement miracle`
- **Justification Judith** : « Trop souvent il est mentionné. Pourrions-nous enlever ce type de formulation ? »

### A2. Ordre du discours
- ❌ "Voici les études scientifiques parce que la science a raison"
- ✅ D'abord ce que fait l'acupuncture, ENSUITE les études probantes
- À surveiller dans toutes les sections "scienceSection" des ressources

### A3. Tarifs unifiés (à propager partout)
| Type | Tarif | À chercher dans le code |
|------|-------|------------------------|
| Adulte privé | **100 $** | toute occurrence de "90 $" pour adulte → 100 |
| Enfant privé | **90 $** | toute occurrence de prix pédiatrique |
| Sociale (sliding scale) | **35 $ – 60 $** | toute occurrence "35 $ à 50 $" → 35 $ à 60 $ |

### A4. "Ex-maison de naissance" — à requalifier
- ❌ « Ex-maison de naissance, ça marche pas »
- ✅ « doula retraitée » OU simplement « expérience en maison de naissance »
- Contexte intro : éviter l'étiquette « ex- » qui sonne mal

---

## B. PAGE D'ACCUEIL

### B1. Intro mentionne tarifs abordables
- [ ] Vérifier `app/(public)/page.tsx` : mentionne-t-il les tarifs accessibles ?
- **Suggestion Judith** : intégrer mention de « tarifs abordables »

### B2. Exemple d'intro fournie par Judith
> Acupunctrice à Rosemont, j'accompagne les femmes et les familles dans leur parcours de fertilité, de grossesse, et au-delà. Avec douceur, écoute et l'envie sincère de vous aider. Tout en militant pour rendre l'acupuncture accessible à tous.

À comparer avec l'intro actuelle.

### B3. Photos
- [ ] Photo « acupuncture sociale » ne fonctionne pas — Judith en propose une autre (référence visuelle dans le docx, à récupérer dans Dropbox)
- [ ] Photo « fertilité » à remplacer par une suggestion spécifique

---

## C. PAGE FERTILITÉ

### C1. Reformulation cycle
- ❌ « Peut-être que votre cycle est irrégulier, ou au contraire trop régulier pour ne rien donner »
- ✅ « Peut-être que votre cycle est irrégulier, ou qu'il est bien régulier, mais que d'autres facteurs nuisent à la conception »

### C2. "bb1" → "bébé 1"
- [ ] Chercher `bb1` dans le code

### C3. "Ma lecture honnête" → "Ma lecture de ces données"
- ❌ Titre : « Ma lecture honnête de ces données »
- ✅ Titre : « Ma lecture de ces données »
- ❌ « l'acupuncture n'est pas un traitement miracle, et les études sérieuses le reconnaissent. Mais elle apporte plusieurs bénéfices mesurables »
- ✅ « l'acupuncture favorise la fécondité, mais il ne s'agit pas d'un traitement miracle. Mais elle apporte plusieurs bénéfices mesurables »

### C4. Connaissance du réseau québécois (raccourcir)
- ❌ « Accessible en français, avec une connaissance du réseau québécois (cliniques de fertilité, RAMQ, assurances) »
- ✅ « Connaissance du réseau québécois : cliniques de fertilité, hormonothérapie, RAMQ »

### C5. Régulation du cycle — nombre de séances
- ❌ « Pour réguler un cycle : 4-6 séances souvent suffisent »
- ✅ « Pour réguler un cycle : 8 séances souvent suffisent »

### C6. FIV — "stimulation" → "stimulation ovarienne"
- [ ] Chercher « pendant la stimulation » → ajouter « ovarienne »

### C7. Section conjoint à enrichir
- ❌ Section actuelle générique
- ✅ Ajouter détail sur l'homme :
  - 9-10 séances recommandées
  - Cycle spermatogenèse = 72 jours
  - Effet sur qualité, quantité, motilité des spermatozoïdes
  - Effet régulation hormones / testostérone
  - Effet parasympathique sur stress lié à la fertilité

### C8. Enlever "Le protocole scientifiquement documenté pour la FIV"
- **Justification Judith** : « Je ne pratique pas de cette manière »
- [ ] Chercher cette section et la supprimer

### C9. FAQ FIV — enlever "selon le protocole Paulus"
- [ ] Chercher « Paulus » et retirer la mention

---

## D. PAGE GROSSESSE ET PÉRINATALITÉ

### D1. Intro — ex-maison de naissance
- ❌ « pratiqué ici avec l'expérience d'une ex-maison de naissance »
- ✅ « pratiqué ici avec expérience »

### D2. Bio — "auprès de femmes qui accouchaient"
- ❌ « j'ai travaillé en maison de naissance auprès de femmes qui accouchaient »
- ✅ « j'ai travaillé en maison de naissance »

### D3. Fréquences trimestres ajustées
| Trimestre | ❌ Avant | ✅ Après |
|-----------|---------|---------|
| 1er (nausées) | 1-2x/sem pendant 2-3 sem | **2x/sem pendant 2 sem** |
| 2e (confort) | 1 séance toutes les 2-3 sem | **2-3 séances toutes les semaines** |
| 3e (préparation) | 1x/sem dès 36 sem | OK (inchangé) |

### D4. Liens vers articles de blog (à créer + intégrer)
À ajouter aux sections correspondantes :
- [ ] 1er trimestre nausées → lien vers « L'acupuncture pour les nausées de grossesse : un soulagement naturel au premier trimestre »
- [ ] Version bébé en siège → lien vers « Bébé en siège : comment l'acupuncture peut aider à la version »
- [ ] Préparation accouchement → lien vers « Accouchement et acupuncture : une aide naturelle pour bien se préparer »

> ⚠️ Ces 3 articles n'existent peut-être pas encore. À vérifier dans `publicBlog`. Si manquants → liste pour la production blog post-launch.

### D5. ❌ Faux témoignage Ingrid M.
- [ ] Vérifier qu'il a bien été retiré (mentionné dans `b7c9682`)
- À remplacer par un vrai témoignage si Judith en obtient un

### D6. "version du siège" → "version du bébé en siège"
- [ ] Chercher `version du siège` (sans "bébé en")

### D7. Section "Mon approche pour la grossesse" — simplifier
- ❌ « Pourquoi moi pour votre grossesse / Ce qui me distingue des autres acupunctrices... »
- ✅ Garder uniquement l'expérience maison de naissance + mère de 3 enfants

### D8. Liste équipe LSSI — ajout physiothérapeute
- ❌ « acupunctrices, physiothérapeute, doulas, psychologue et ostéopathes »
- ✅ « acupunctrices, physiothérapeute, doulas et ostéopathes » (sans psychologue, avec physiothérapeute confirmé)
- ⚠️ Note : Judith écrit « physiothéraeuthe » (faute de frappe), mais c'est bien physiothérapeute

### D9. Sécurité grossesse — simplifier
- ❌ « L'acupuncture est reconnue comme sécuritaire pendant la grossesse par les grandes méta-analyses (aucun effet indésirable grave rapporté sur les nouveau-nés dans les études). Certains points sont évités pendant la grossesse — c'est une formation spécifique que j'ai suivie et qui fait partie de ma pratique courante. »
- ✅ « L'acupuncture est reconnue comme sécuritaire pendant la grossesse. J'ai suivi une formation spécifique pour accompagner les femmes pendant leur grossesse. »

### D10. ❌ Enlever "ma lecture honnête" (toutes occurrences)

### D11. ❌ Enlever "l'anxiété de la première échographie" (1er trimestre)

### D12. "Maintenir un bon sommeil avant que..." → simplifier
- ❌ « Maintenir un bon sommeil avant que le troisième trimestre ne le complique davantage »
- ✅ « Maintenir un bon sommeil »

---

## E. PAGE PÉDIATRIE

### E1. ❌ Remplacer "laser" → "shino shin"
- [ ] Chercher toutes occurrences de `laser` dans le contenu pédiatrie
- ⚠️ Plusieurs endroits : description pratique, liste techniques, "À quoi s'attendre"

### E2. Durée séance vs durée rencontre
- Préciser : « Le **temps de rencontre** est d'**1 heure** pour pouvoir bien expliquer ce que l'on fait à l'enfant et aux parents »
- Distinct de la durée de la séance elle-même (20-30 min bébés, 30-45 min enfants)

### E3. Liste des techniques pédiatriques (refonte complète)
**❌ Liste actuelle :**
- Aiguilles ultra-fines : 5 à 10 fois plus fines qu'aiguille de vaccination
- **Laser** : Pas d'aiguille, stimulation lumineuse
- Aimants : Collés sur les points, portés quelques jours
- Tuina pédiatrique
- Acupression

**✅ Liste corrigée :**
- Aiguilles ultra-fines : **« aiguilles de la grosseur d'un cheveu »**
- ~~Laser~~ ❌ supprimé
- Aimants : **« Collés sur les points, ne perce pas le derme »**
- **Ventouse** : « création d'une succion temporaire sur la peau » 🆕
- **Shino shin** : « objet en forme d'éventail qui vient stimuler les points par la pression » 🆕
- Tuina pédiatrique
- Acupression

### E4. Bébés coliqueux
- ❌ « Bien souvent, les bébés pleurent moins pendant la séance qu'à une prise de sang ordinaire »
- ✅ « Bien souvent, les bébés ne pleurent pas »

### E5. ❌ Enlever "ultra-courtes" dans la description scientifique
- ❌ « Les séances sont **ultra-courtes**, adaptées à l'âge »
- ✅ « Les séances sont adaptées à l'âge »

### E6. ❌ Enlever "La chiropratique" de la liste des choses essayées
- [ ] Chercher la mention dans la section coliques

### E7. ❌ Enlever section "Vue d'ensemble de la recherche pédiatrique"
- ❌ « Une revue de portée (scoping review) publiée en 2025 dans Global Pediatrics... »
- (toute la section)

### E8. ❌ Enlever section "Ma lecture honnête" (pédiatrie)

### E9. "Pourquoi les enfants m'aiment bien" — corriger les techniques
- ❌ « On peut utiliser le laser, l'acupression, le tuina pédiatrique »
- ✅ « On peut utiliser le shino shin, les ventouses, l'acupression, le tuina pédiatrique »

### E10. À quoi s'attendre — bébés
- ❌ « Fréquence (coliques) : 2 séances par semaine pendant 2 semaines »
- ✅ « Fréquence (coliques) : 2 séances par semaine pendant **2-3 semaines** »
- ❌ « Réaction typique : certains bébés ne réagissent pas du tout, d'autres pleurent brièvement »
- ✅ « ... pleurent brièvement (**moins qu'à la vaccination**) »

### E11. À quoi s'attendre — enfants 1-12 ans
- ❌ « alternatives sans aiguilles (laser, acupression, tuina) »
- ✅ « alternatives sans aiguilles (**ventouse, acupression, tuina**) »
- ❌ « l'enfant explore, touche les aiguilles (avec capuchon!) »
- ✅ « l'enfant explore, **touche les ventouses et/ou le shino shin**, pose ses questions »

### E12. Adolescents 12+ — ajout consentement
- ✅ Ajouter : « **un adolescent de 14 ans et plus n'a pas besoin du consentement des parents pour recevoir un traitement** »

### E13. Est-ce que ça fait mal — corriger comparaison
- ❌ « les aiguilles d'acupuncture sont 5 à 10 fois plus fines qu'une aiguille de vaccination »
- ✅ « les aiguilles d'acupuncture sont **de la même grosseur qu'un cheveu** »

### E14. Combien ça coûte (pédiatrie)
- ❌ « Les frais pour une consultation pédiatrique sont **les mêmes que pour un adulte** »
- ✅ « Les frais pour une consultation pédiatrique sont de **90 $** »

---

## F. PAGE ACUPUNCTURE SOCIALE

### F1. Origine du modèle (préciser)
- ❌ « importé au Québec par la **Clinique d'Hochelaga** »
- ✅ « importé au Québec par la **Clinique d'acupuncture sociale d'Hochelaga** »

### F2. Description de l'espace (épurer)
- ❌ « espace lumineux avec plusieurs fauteuils inclinables (**ou divans selon la configuration**), des **couvertures douces**, une lumière tamisée »
- ✅ « espace lumineux avec plusieurs fauteuils inclinables et une lumière tamisée »

### F3. Tableau comparatif sociale vs privée — DURÉE et TARIF
| | ❌ Avant | ✅ Après |
|---|---------|---------|
| Durée sociale | 30-45 min | **60 min** |
| Tarif sociale | 35-50 $ | **35-60 $** |

### F4. ❌ Enlever section "Conditions idéales pour le format social"
- À remplacer par : « **Raison de consultation courante** » (titre + content à reformuler)

### F5. ❌ Enlever la note : "Pour les conditions plus complexes (fertilité, grossesse, pédiatrie), je recommande généralement de commencer par une séance privée puis de compléter avec des séances sociales."

### F6. "Ce qu'il faut savoir" (durée + tarif)
- ❌ « Entre 30 et 45 minutes par séance »
- ✅ « Entre 60 minutes par séance » ⚠️ correction grammaticale : « **60 minutes par séance** »
- ❌ « 35 $ à 50 $ »
- ✅ « 35 $ à 60 $ »

### F7. Formation — corriger durée et type
- ❌ « le même **baccalauréat de 4 ans** reconnu par l'OAQ »
- ✅ « la même **technique de 3 ans** reconnu par l'OAQ »

### F8. ❌ Enlever "Séances un peu plus courtes (30-45 min au lieu de 60 min)"
- (cohérent avec F3 — durée sociale = 60 min comme privée)

### F9. Repos pendant la séance
- ❌ « vous restez 20 à 30 minutes avec les aiguilles »
- ✅ « vous restez **30 minutes** avec les aiguilles »

---

## G. PAGE ANXIÉTÉ ET STRESS

### G1. La Source en Soi — épurer
- ❌ « les ressources **de guérison** existent déjà en vous »
- ✅ « les ressources existent déjà en vous »

### G2. Diagnostic pouls — épurer
- ❌ « je prends votre pouls (aux deux poignets, **c'est un diagnostic en soi**) »
- ✅ « je prends votre pouls (aux deux poignets) »

### G3. Fréquence recommandée — préciser conditionnel
| | ❌ Avant | ✅ Après |
|---|---------|---------|
| Phase initiale | « anxiété aiguë » | « **si** anxiété aiguë » |
| Phase stabilisation | « 4-6 semaines » | **« si anxiété sub-aiguë » : 4 semaines** |

---

## H. PAGE FAQ (transversale)

### H1. ❌ Enlever passage défaitiste fertilité mécanique
> « Soyons honnêtes : Si votre infertilité a une cause mécanique (trompes bouchées, spermogramme très altéré, réserve ovarienne très diminuée), l'acupuncture seule ne résoudra probablement pas le problème. Mon rôle sera alors de vous accompagner émotionnellement... »

### H2. Nausées — fréquence
- ❌ « 2 séances la première semaine pour un soulagement rapide / 1 séance par semaine pendant 2-4 semaines »
- ✅ « **2 séances par semaine pour 2 semaines (4 séances en tout)** pour un soulagement rapide / Puis ajustement selon l'évolution »

### H3. Version bébé en siège — 37 semaines
- ❌ « À partir de 37 semaines : on peut encore essayer, mais souvent en parallèle d'une version manuelle par le médecin »
- ✅ « À partir de 37 semaines : la **version manuelle par un médecin sera conseillée**, un traitement le jour même peut augmenter vos chances de réussite »

### H4. Moxibustion — fréquence
- ❌ « 15-20 minutes par jour, **1 à 2 fois par jour**, pendant 7 à 10 jours »
- ✅ « 15-20 minutes par jour, **1 fois par jour**, pendant 7 à 10 jours »

### H5. ❌ Enlever "Si ça ne fonctionne pas" (siège)
> « Soyons honnêtes : la moxibustion n'est pas efficace à 100 %. Si bébé reste en siège malgré le protocole, d'autres options restent disponibles (version par manœuvre externe par votre médecin, césarienne programmée). L'important est d'avoir tout essayé sans pression. »

### H6. Tarif première séance
- ❌ « 90 $ »
- ✅ « **100 $** »

### H7. Tarif acupuncture sociale
- ❌ « 35 $ et 50 $ »
- ✅ « 35 $ et **60 $** »

---

## I. PAGE MON PARCOURS / À PROPOS

### I1. ❌ "DEP" → "DEC"
- ❌ « j'ai complété mon **DEP** en acupuncture au Collège de Rosemont »
- ✅ « j'ai complété mon **DEC** en acupuncture au Collège de Rosemont »

### I2. Liste équipe LSSI
- ❌ « acupunctrices, ostéopathes, **sages-femmes**, doulas »
- ✅ « acupunctrices, ostéopathes, **physiothérapeutes**, doulas »

---

## J. AJOUT (page service ou nouvelle section)

### J1. Section visuelle outils pédiatriques
- ✅ « Ajouter une section où les outils pédiatriques sont montrés ex : ventouses, shino shin, push pin (aiguilles) »
- Idée : galerie photo dans `/services/pediatrie` ou nouvelle section

---

## K. CHECKLIST RAPIDE — patterns à grep dans le code

Lancer ces recherches sur l'ensemble du code (Hub + site public + ressources Firestore) :

| Pattern à chercher | Action si trouvé |
|---|---|
| `miracle` | À reformuler ou supprimer |
| `magique` | À supprimer |
| `bb1` | → `bébé 1` |
| `Ma lecture honnête` | → `Ma lecture de ces données` |
| `4-6 séances` (régulation cycle) | → `8 séances` |
| `protocole Paulus` | À supprimer |
| `Paulus` | À supprimer |
| `ex-maison de naissance` | → `expérience` ou `doula retraitée` |
| `version du siège` (sans "bébé en") | → `version du bébé en siège` |
| `5 à 10 fois plus fines` | → `de la même grosseur qu'un cheveu` |
| `laser` (en pédiatrie) | → `shino shin` |
| `chiropratique` (en pédiatrie) | À retirer |
| `ultra-courtes` (séances pédiatrie) | → enlever « ultra- » |
| `35 $ à 50` | → `35 $ à 60` |
| `35 à 50` | → `35 à 60` |
| `30-45 min` (sociale) | → `60 min` |
| `baccalauréat de 4 ans` | → `technique de 3 ans` |
| `DEP en acupuncture` | → `DEC en acupuncture` |
| `Clinique d'Hochelaga` | → `Clinique d'acupuncture sociale d'Hochelaga` |
| `90 $` (première séance) | → `100 $` |
| `Soyons honnêtes` | À évaluer (souvent défaitiste) |
| `première échographie` | À retirer (anxiété 1er trimestre) |

---

## Statut global

Une fois l'audit du code fait (Étape 2), cocher chaque ligne A1, B1, C1... pour matérialiser les corrections appliquées.

Le commit `b7c9682` (« 53 corrections appliquées ») a fait passer un premier batch. Ce document liste l'**ensemble** des demandes Judith — utile pour vérifier qu'aucune n'a été oubliée et pour audit final pre-launch.

---

## Backlog post-launch (decisions reportees)

- **Pediatrie comme 4e pilier sur l'accueil** : actuellement seul Fertilite / Grossesse / Sociale apparaissent dans la section Piliers de la home. Pediatrie a sa propre page `/services/pediatrie` mais n'est pas mise en avant sur l'accueil. Decision Benoit (30 avril) : on garde le triptyque actuel pour le launch, on revisitera apres.
- **3 articles de blog grossesse cites dans les notes Judith** mais pas encore produits :
  1. « L'acupuncture pour les nausees de grossesse : un soulagement naturel au premier trimestre »
  2. « Bebe en siege : comment l'acupuncture peut aider a la version »
  3. « Accouchement et acupuncture : une aide naturelle pour bien se preparer »
  → a produire post-launch (pipeline blog hybride MW-BLOG2). Les liens internes seront ajoutes a ce moment-la.
- **Galerie photo outils pediatriques** (note J1) : ajouter section visuelle ventouses + shino shin + aiguilles dans `/services/pediatrie`.
