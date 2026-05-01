<!--
Template FAQ — copier dans content/faq/<slug>.md et remplir.

Categories valides : fertilite | grossesse | pediatrie | acupuncture-sociale | seance
Order : 1 pour la plus importante de la categorie, puis 2, 3...
Status : pending (par defaut), draft (brouillon non soumis), published (apres approbation Judith)

Pour injecter :
  node content/scripts/inject.mjs content/faq/<slug>.md --collection=faqs

Pour batch :
  node content/scripts/inject.mjs content/faq/*.md --collection=faqs
-->
---
slug: "exemple-slug-court"
question: "La question telle qu'elle apparaitra sur le site (avec point d'interrogation) ?"
category: "seance"
order: 1
status: pending
lastResearchedAt: "2026-04-29"
---

## reponse

Reponse en markdown. Idealement entre 100 et 300 mots.

Structure recommandee :
1. **Reponse directe** (oui / non / depend) en premiere phrase
2. **Justification breve** (etudes, mecanisme, experience clinique)
3. **Note pratique** (combien de seances, comment ca se passe, mention des cliniques si pertinent)
4. **Renvoi possible** vers une ressource plus complete (lien interne en markdown)

Voix de Judith :
- Honnete, jamais "miracle" ni garantie de guerison (regle OAQ)
- Sourcee quand pertinent ("une meta-analyse de 2025 montre que...")
- Personnelle ("plusieurs de mes patientes...", "dans ma pratique...")
- Concrete (chiffres, frequences, duree des seances)
- Termine souvent par une porte ouverte (rdv, ressource complete, suivi medecin)

Exemple court :
> Oui. L'acupuncture a un effet documente sur l'anxiete : une meta-analyse de 2024
> portant sur 20 essais contre placebo et medicaments montre une reduction
> significative des scores d'anxiete, comparable aux SSRI mais sans effets
> secondaires. Dans ma pratique, je vois la majorite des patientes constater
> une amelioration apres 4-6 seances. Pour l'anxiete persistante, je recommande
> un suivi parallele avec votre medecin.
