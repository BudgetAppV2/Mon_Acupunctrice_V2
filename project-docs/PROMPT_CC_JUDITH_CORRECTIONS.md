# Mission CC : Intégrer les corrections de Judith — Révision complète du site

## ⚠️ Contexte de branche
Tu es sur `feature/site-public-migration`. Le site public n'est PAS encore live.
Fais UN commit propre avec toutes les corrections.

## Source
Le document de Judith est dans : `docs/migration-wix/04-contenu/Note site web.docx`
Tu peux le lire avec `textutil -convert txt -stdout "docs/migration-wix/04-contenu/Note site web.docx"`
Mais toutes les corrections sont détaillées ci-dessous.

## Principes transversaux (appliquer PARTOUT)

### P1 — Retirer TOUTES les formulations "pas un miracle"
Chercher et supprimer dans TOUS les fichiers du site public :
- "n'est pas un miracle"
- "n'est pas un traitement miracle"
- "n'est pas magique"
- "soyons honnêtes"
- "honnêtement"
- "Ma lecture honnête" (retirer la section entière quand elle existe)
- "ce n'est pas un miracle"

### P2 — Inverser l'ordre science/pratique
Quand un texte dit "les études montrent X, donc l'acupuncture fait Y",
reformuler en "l'acupuncture fait Y. Les études confirment X."
Mener avec la pratique, appuyer avec la science.

### P3 — Tarifs corrigés
- Adulte : 100$ (pas 90$)
- Enfant : 90$
- Sociale : 35$ à 60$ (pas 35$ à 50$)
- Première séance : 100$ (pas 90$)

### P4 — Terminologie corrigée
- "shino shin" au lieu de "laser" (outil pédiatrique sans aiguilles)
- "DEC" au lieu de "DEP" (diplôme d'études collégiales, pas professionnelles)
- "ventouse" à ajouter dans les outils pédiatriques
- "push pin" à mentionner quand pertinent
- Retirer les mentions de "protocole Paulus" partout

---

## CORRECTIONS PAR PAGE

### PAGE D'ACCUEIL (app/(public)/page.tsx ou sections homepage)

1. Dans l'intro, ajouter mention de tarifs abordables. Texte proposé par Judith :
"Acupunctrice à Rosemont, j'accompagne les femmes et les familles dans leur parcours de fertilité, de grossesse, et au-delà. Avec douceur, écoute et l'envie sincère de vous aider. Tout en militant pour rendre l'acupuncture accessible à tous."

2. Remplacer "ex-maison de naissance" par "ancienne accompagnante en maison de naissance" ou retirer la mention si elle ne fonctionne pas dans le contexte.

3. La photo de la section acupuncture sociale ne fonctionne pas — noter dans un commentaire TODO pour changement photo ultérieur.

---

### PAGE FERTILITÉ (app/(public)/services/fertilite/)

#### F1. "bb1" → "bébé 1"
Chercher "bb1" et remplacer par "bébé 1"

#### F2. Cycle irrégulier
Remplacer :
"Peut-être que votre cycle est irrégulier, ou au contraire trop régulier pour ne rien donner."
Par :
"Peut-être que votre cycle est irrégulier, ou qu'il est bien régulier, mais que d'autres facteurs nuisent à la conception."

#### F3. Section "Ma lecture honnête de ces données"
Remplacer le titre "Ma lecture honnête de ces données" par "Ma lecture de ces données"
Remplacer :
"l'acupuncture n'est pas un traitement miracle, et les études sérieuses le reconnaissent. Mais elle apporte"
Par :
"l'acupuncture favorise la fécondité, mais il ne s'agit pas d'un traitement miracle. Elle apporte"

#### F4. Section "Mon approche" — praticiens de La Source en Soi
Remplacer :
"acupunctrices, physiothérapeute, doulas, psychologue et ostéopathes"
Par :
"acupunctrices, physiothérapeute, doulas et ostéopathes"
(retirer "psychologue")

#### F5. Ce qui me différencie — connaissance réseau
Remplacer :
"Accessible en français, avec une connaissance du réseau québécois (cliniques de fertilité, RAMQ, assurances)"
Par :
"Connaissance du réseau québécois : cliniques de fertilité, hormonothérapie, RAMQ"

#### F6. Combien de séances — corrections
- "séances pendant la stimulation" → "séances pendant la stimulation ovarienne"
- Retirer "+ séance pré-transfert et post-transfert (protocole Paulus)" → remplacer par "+ séance pré-transfert et post-transfert."
- "4-6 séances souvent suffisent" → "8 séances souvent suffisent"

#### F7. Section conjoint/fertilité masculine — REMPLACEMENT COMPLET
Remplacer la section "Votre conjoint est bienvenu" par :
"Chez l'homme, l'acupuncture peut améliorer la qualité, la quantité et la motilité des spermatozoïdes. Étant donné que la spermatogenèse prend environ 72 jours, il est généralement recommandé de suivre 9 à 10 séances pour observer des améliorations lors du prochain cycle de production de spermatozoïdes.

Certaines recherches suggèrent que l'acupuncture pourrait aider à réguler les hormones, et quelques études indiquent un effet positif sur la production de testostérone, notamment chez certains hommes infertiles.

Par ailleurs, l'acupuncture peut activer le système parasympathique et favoriser une sensation de relaxation, ce qui aide à réduire le stress lié à la fertilité."

#### F8. Retirer la section "Le protocole scientifiquement documenté pour la FIV"
Judith ne pratique pas de cette manière. Supprimer cette section entière.

#### F9. FAQ fertilité
- Retirer "selon le protocole Paulus" dans la question sur les séances avant FIV
- Retirer le paragraphe "Soyons honnêtes : Si votre infertilité a une cause mécanique..." dans les FAQ

---

### PAGE GROSSESSE (app/(public)/services/grossesse/)

#### G1. Intro hero
Remplacer :
"documenté par la recherche, et pratiqué ici avec l'expérience d'une ex-maison de naissance"
Par :
"documenté par la recherche, et pratiqué ici avec expérience"

#### G2. Trimestres — corrections importantes
Premier trimestre : remplacer le contenu par :
"Survivre aux nausées
Plusieurs patientes voient une amélioration dès la 1ère ou 2e séance. Fréquence : 2x/semaine pendant 2 semaines."
Ajouter lien vers article blog nausées grossesse.
Retirer "Points PC6 et ST36 spécifiques, documentés."
Retirer "l'anxiété de la première échographie."

Deuxième trimestre :
"Fréquence : 1 séance toutes les 2-3 semaines" → "Fréquence : 2 à 3 séances toutes les semaines"
"Maintenir un bon sommeil avant que le troisième trimestre ne le complique davantage" → "Maintenir un bon sommeil"

Troisième trimestre :
"Version du siège" → "Version du bébé en siège"
Ajouter lien vers article blog accouchement et acupuncture.

#### G3. Section corps fait quelque chose d'extraordinaire
"j'ai travaillé en maison de naissance auprès de femmes qui accouchaient" → "j'ai travaillé en maison de naissance"

#### G4. Section "Ce que la science dit"
Retirer le mot "honnêtement" dans "présentés honnêtement" → "Voici les résultats les plus importants à connaître."

#### G5. Ajouter liens vers articles de blog dans les sections :
- Nausées → lien vers "L'acupuncture pour les nausées de grossesse..."
- Version du bébé en siège → lien vers "Bébé en siège : comment l'acupuncture peut aider..."
- Préparation accouchement → lien vers "Accouchement et acupuncture..."

#### G6. Retirer la section "Ma lecture honnête" de la page grossesse

#### G7. Section "Mon approche pour la grossesse"
Remplacer le titre "Pourquoi moi pour votre grossesse" et le paragraphe "Ce qui me distingue des autres acupunctrices..." par :
"Mon expérience en maison de naissance m'a donné une compréhension intime de ce que vivent les femmes à chaque étape — pas seulement les points d'acupuncture à utiliser, mais aussi les peurs, les doutes, les joies et les découvertes qui viennent avec chaque trimestre.
Je suis aussi mère de trois enfants. J'ai vécu les nausées, la fatigue, l'impatience, la peur de l'accouchement, et la beauté de la rencontre. Cette expérience change fondamentalement ma façon de vous accompagner."

Ajouter :
"Je pratique à La Source en Soi, une clinique familiale sur Beaubien Est à Rosemont qui réunit acupunctrices, physiothérapeute, doulas et ostéopathes — un écosystème complet pour votre grossesse"

#### G8. Section Sécurité grossesse
Remplacer :
"L'acupuncture est reconnue comme sécuritaire pendant la grossesse par les grandes méta-analyses (aucun effet indésirable grave rapporté sur les nouveau-nés dans les études). Certains points sont évités pendant la grossesse — c'est une formation spécifique que j'ai suivie et qui fait partie de ma pratique courante."
Par :
"L'acupuncture est reconnue comme sécuritaire pendant la grossesse. J'ai suivi une formation spécifique pour accompagner les femmes pendant leur grossesse."

#### G9. Fréquence recommandée grossesse
Mettre à jour les fréquences :
- Premier trimestre : "2 séances par semaine pendant 2 semaines"
- Deuxième trimestre : "2-3 séances toutes les semaines puis espacement selon amélioration"
- Troisième trimestre : "1 séance par semaine à partir de 36 semaines"
- Version du siège : "3 séances rapprochées entre 33 et 36 semaines"

#### G10. Témoignage grossesse (faux témoignage)
Le témoignage signé "Ingrid M." est un faux témoignage inventé. Le remplacer par un vrai avis (attente de clarification OAQ) ou le retirer complètement.

#### G11. FAQ grossesse — version du siège
Remplacer la section sur le moment idéal :
Retirer "Après 36-37 semaines : les chances diminuent car bébé devient plus gros et a moins d'espace"
Remplacer "À partir de 37 semaines : on peut encore essayer, mais souvent en parallèle d'une version manuelle par le médecin"
Par : "À partir de 37 semaines : la version manuelle par un médecin sera conseillée, un traitement le jour même peut augmenter vos chances de réussite."

#### G12. Moxibustion fréquence
"15-20 minutes par jour, 1 à 2 fois par jour" → "15-20 minutes par jour, 1 fois par jour"

#### G13. Retirer la section "Si ça ne fonctionne pas" (version siège)
Retirer : "Soyons honnêtes : la moxibustion n'est pas efficace à 100 %..."

#### G14. FAQ nausées — fréquence
Remplacer le bloc :
"2 séances la première semaine / 1 séance par semaine pendant 2-4 semaines / Puis ajustement"
Par :
"2 séances par semaine pour 2 semaines (4 séances en tout) pour un soulagement rapide / Puis ajustement selon l'évolution"

---

### PAGE PÉDIATRIE (app/(public)/services/pediatrie/)

#### P1. Outils pédiatriques
Remplacer "laser" par "shino shin" partout
Ajouter "ventouse" dans la liste des techniques
Ajouter "shino shin" avec description : "objet en forme d'éventail qui vient stimuler les points par la pression"

#### P2. Section intro
"acupression, laser, aimants, tuina pédiatrique" → "acupression, shino shin, aimants, tuina pédiatrique"

#### P3. Techniques possibles — REMPLACEMENT
Remplacer la liste des techniques par :
- Aiguilles ultra-fines : "aiguilles de la grosseur d'un cheveu — la plupart des enfants ne sentent rien."
- Aimants : "Collés sur les points, ne percent pas le derme."
- Ventouse : "création d'une succion temporaire sur la peau"
- Shino shin : "objet en forme d'éventail qui vient stimuler les points par la pression"
- Tuina pédiatrique : Massage chinois sur les points.
- Acupression : Simple pression douce, sans aiguilles.

Retirer : "Laser — Pas d'aiguille, stimulation lumineuse des points."

#### P4. Bébés coliqueux
"Bien souvent, les bébés pleurent moins pendant la séance qu'à une prise de sang ordinaire."
→ "Bien souvent, les bébés ne pleurent pas."

#### P5. Durée séances
Ajouter : "Par contre, le temps de rencontre est d'une heure pour pouvoir bien expliquer ce que l'on fait à l'enfant et aux parents."
Aussi : "moins d'aiguilles, insertion plus brève" → "moins d'aiguilles ou pas d'aiguille, insertion plus brève"

#### P6. Séances ultra-courtes
Retirer le mot "ultra-courtes" — "séances sont adaptées à l'âge"

#### P7. Section recherche pédiatrique
Retirer entièrement "Vue d'ensemble de la recherche pédiatrique" et "Ma lecture honnête"

#### P8. Pourquoi les enfants m'aiment bien
"laser, l'acupression, le tuina" → "le shino shin, les ventouses, l'acupression, le tuina"

#### P9. Consultation pédiatrique par âge
Bébés 0-12 mois :
- Réaction typique : ajouter "(moins qu'à la vaccination)"
- Coliques fréquence : "2 séances par semaine pendant 2-3 semaines"

Enfants 1-12 ans :
- "alternatives sans aiguilles (laser, acupression, tuina)" → "alternatives sans aiguilles (ventouse, acupression, tuina)"
- "l'enfant explore, touche les aiguilles (avec capuchon!)" → "l'enfant explore, touche les ventouses et/ou le shino shin"

Adolescents 12+ :
- Ajouter : "un adolescent de 14 ans et plus n'a pas besoin du consentement des parents pour recevoir un traitement."

#### P10. Est-ce que ça fait mal
"5 à 10 fois plus fines qu'une aiguille de vaccination" → "de la même grosseur qu'un cheveu"

#### P11. Tarif pédiatrique
"Les frais pour une consultation pédiatrique sont les mêmes que pour un adulte" → "Les frais pour une consultation pédiatrique sont de 90$"

#### P12. Ajouter section outils pédiatriques
Judith demande une section où les outils pédiatriques sont montrés : ventouses, shino shin, push pin (aiguilles).
Ajouter un TODO commentaire pour cette section avec photos des outils.

---

### PAGE ACUPUNCTURE SOCIALE (app/(public)/services/acupuncture-sociale/)

#### S1. Clinique d'Hochelaga
"la Clinique d'Hochelaga" → "la Clinique d'acupuncture sociale d'Hochelaga"

#### S2. Description de l'espace
"plusieurs fauteuils inclinables (ou divans selon la configuration), des couvertures douces" → "plusieurs fauteuils inclinables et"
Retirer "(ou divans selon la configuration)" et "des couvertures douces"

#### S3. Durée sociale
"30-45 min" → "60 min" partout dans la page sociale

#### S4. Tarif social
"35 $ à 50 $" → "35 $ à 60 $" partout

#### S5. Tableau comparatif social vs privé
- Durée sociale : "30-45 min" → "60 min"
- Échange initial privé : "Approfondi (60 min)" → "Approfondi (20 min)"
- Conditions traitées sociale : "Stress, anxiété, douleurs, sommeil, bien-être général" → "Tout"
- Suivi sociale : "Libre, sans rendez-vous" → "Sur rendez-vous"
- Tarif sociale : "35-50 $" → "35-60 $"

#### S6. "Conditions idéales pour le format social" → "Raisons de consultation courantes"

#### S7. Retirer la note sur les conditions complexes
Retirer : "Note : Pour les conditions plus complexes (fertilité, grossesse, pédiatrie), je recommande généralement de commencer par une séance privée puis de compléter avec des séances sociales."

#### S8. Repos avec aiguilles
"20 à 30 minutes" → "30 minutes"

#### S9. Formation
"le même baccalauréat de 4 ans reconnu par l'OAQ" → "la même technique de 3 ans reconnu par l'OAQ"

#### S10. Séances plus courtes
Retirer la ligne "Séances un peu plus courtes (30-45 min au lieu de 60 min)" de la liste des différences

---

### PAGE ANXIÉTÉ/STRESS (app/(public)/services/ ou ressources/)

#### A1. La Source en Soi
"les ressources de guérison existent déjà en vous" → "les ressources existent déjà en vous"

#### A2. Évaluation
Retirer "(c'est un diagnostic en soi)" de la phrase sur le pouls

#### A3. Fréquence anxiété
- "Phase initiale (anxiété aiguë)" → "Phase initiale (si anxiété aiguë)"
- "Phase de stabilisation" → "Phase de stabilisation (si anxiété sub-aiguë)"
- "pendant 4-6 semaines" → "pendant 4 semaines"

---

### PAGE À PROPOS (app/(public)/a-propos/)

#### AP1. Diplôme
"DEP en acupuncture" → "DEC en acupuncture"

#### AP2. Équipe LSSI
"des acupunctrices, des ostéopathes, des sages-femmes et des doulas" → "des acupunctrices, des ostéopathes, des physiothérapeutes et des doulas"

---

### PAGE TARIFS (app/(public)/tarifs/)

#### T1. Tarifs
- Privé adulte : 100$
- Enfant : 90$
- Sociale : 35-60$

#### T2. FAQ tarifs - première séance
"Une première séance coûte 90 $" → "Une première séance coûte 100 $"

#### T3. FAQ tarifs - acupuncture sociale
"tarif libre entre 35 $ et 50 $" → "tarif libre entre 35 $ et 60 $"

---

### RESSOURCE ACUPUNCTURE SOCIALE (Firestore collection `ressources`)

#### RS1. Formation
"le même baccalauréat de 4 ans" → "la même technique de 3 ans"

#### RS2. Durée
"30-45 min" → "60 min"

#### RS3. Tarif
"35-50$" → "35-60$"

#### RS4. "Conditions idéales" → "Raisons de consultation courantes"

---

## Vérifications finales

Après toutes les corrections :

1. Chercher globalement dans app/(public)/ :
   - grep "miracle" → doit retourner 0 résultat (sauf dans le texte fertilité "il ne s'agit pas d'un traitement miracle")
   - grep "honnête" → doit retourner 0 résultat
   - grep "soyons" → doit retourner 0 résultat
   - grep "DEP" → doit retourner 0 (sauf si dans un contexte non lié au diplôme)
   - grep "laser" → doit retourner 0 dans le contexte pédiatrique
   - grep "Paulus" → doit retourner 0
   - grep "50 \\\$" dans le contexte sociale → doit retourner 0 (maintenant 60$)
   - grep "90 \\\$" dans le contexte adulte → doit retourner 0 (maintenant 100$)

2. Pour les corrections Firestore (ressources), créer un script Node.js qui met à jour les documents concernés.

3. Build : npm run build → doit passer

4. Commit message :
"fix(public): intègre les corrections de Judith — révision complète du contenu

Corrections transversales :
- Retrait de toutes les formulations 'pas un miracle' / 'soyons honnêtes'
- Tarifs corrigés : adulte 100$, enfant 90$, sociale 35-60$
- Terminologie : shino shin (pas laser), DEC (pas DEP), ventouse ajouté
- Retrait de 'protocole Paulus' partout
- Retrait des sections 'Ma lecture honnête'

Par page : fertilité (9 corrections), grossesse (14 corrections),
pédiatrie (12 corrections), sociale (10 corrections), anxiété (3 corrections),
à-propos (2 corrections), tarifs (3 corrections)"

