# PROOF GRAPH — Plan Opérationnel 90 jours

**Date** : 6 mai 2026
**Source** : Retour Codex 2026-05-06 sur le `PROOF_GRAPH_BACKLOG.md`
**Statut** : Plan exécutable (vs catalogue)

---

## 🎯 Objectif global 90 jours

Faire en sorte qu'un LLM voie Judith comme une **entité locale corroborée** :

> *Judith Dufour-Savard, Ac., acupunctrice OAQ spécialisée fertilité, grossesse et périnatalité à Rosemont, Montréal.*

### Résultats attendus à 90 jours

| Métrique | Cible 90j |
|---|---|
| Cohérence des profils externes (NAP) | 100 % |
| Avis Google Reviews directement liés à Judith | 20-25 |
| Mentions / backlinks externes pertinents | 5+ |
| Pages décisionnelles publiées | 6 |
| Prompts LLM testés où Judith est citée/recommandée | 4-6/10 |

---

## 📐 Architecture : 4 chantiers parallèles

```
CHANTIER 1                CHANTIER 2              CHANTIER 3              CHANTIER 4
Cohérence d'entité   →    Avis Judith        →   Mentions/backlinks  →   Pages décisionnelles
(corriger ce qui      (générer la preuve     (renforcer le proof    (capter les prompts
existe déjà)          sociale directe)        graph externe)         commerciaux)

⚠️ LE CHANTIER 1 EST UN PRÉ-REQUIS — ne rien lancer d'autre tant qu'il n'est pas terminé.
```

---

## 🏗️ Chantier 1 — Cohérence d'entité (Semaine 1, prioritaire)

### But
Que toutes les sources externes disent **exactement la même chose** sur Judith. Un LLM qui voit des incohérences (code postal, nom, spécialité) baisse son niveau de confiance et n'ose pas recommander.

### Livrable principal — Entity Source of Truth

À créer : un fichier `ENTITY_SOURCE_OF_TRUTH.md` (à ajouter dans `project-docs/02_ROADMAP/content-strategy/`) qui contient les valeurs canoniques **uniques** à utiliser partout.

#### Contenu obligatoire

```yaml
# Identité canonique
nom_canonique: "Judith Dufour-Savard, Ac."
metier: "Acupunctrice membre de l'OAQ"
numero_oaq: "A-008-24"

# Spécialités (ordre cohérent partout)
specialites:
  - Fertilité
  - Grossesse
  - Périnatalité
  - FIV
  - Pédiatrie

# Lieu principal (NAP canonique)
adresse: "La Source en Soi, 2554 rue Beaubien Est"
ville: "Montréal"
quartier: "Rosemont"
code_postal: "H1Y 1G3"
pays: "Canada"

# Coordonnées
telephone: "[À documenter — actuellement partagé avec LSSI]"
site_web: "https://www.acupuncturejudith.ca"
reservation: "https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708"

# Réseaux sociaux (sameAs)
instagram: "@mon_acupunctrice"
youtube: "@JudithDufourSavard"
facebook: "id=61562614934143"
linkedin: "judith-dufour-savard-acu"
wikidata: "Q139677208"

# Bios (3 longueurs canoniques pour réutilisation)
bio_courte_300: |
  Judith Dufour-Savard, acupunctrice OAQ à Rosemont (Montréal). Spécialisée en
  fertilité, grossesse, périnatalité et pédiatrie. Pratique à La Source en Soi
  et à Repentigny. Ancienne accompagnante en maison de naissance.

bio_moyenne_800: |
  [À rédiger — ~800 caractères, reprend bio courte + parcours formation +
  approche personnelle + cliniques + gamme de soutiens offerts]

bio_longue_1500: |
  [À rédiger — ~1500 caractères, ajoute mention recherche scientifique,
  philosophie de pratique, témoignage anonymisé OAQ-safe, déontologie]
```

### To-do Semaine 1 (prioritaire absolu)

| # | Action | Effort | Status |
|---|---|---|---|
| 1.1 | Créer `ENTITY_SOURCE_OF_TRUTH.md` avec les 3 bios | 45 min | ⬜ |
| 1.2 | Corriger Lumino FR + EN (code postal `H1Y 1G3`) | 15 min | ⬜ |
| 1.3 | Vérifier + harmoniser HealthDoc | 15 min | ⬜ |
| 1.4 | Vérifier + harmoniser GoRendezVous | 10 min | ⬜ |
| 1.5 | Vérifier OAQ (fiche publique) | 15 min + délai | ⬜ |
| 1.6 | Vérifier La Source en Soi (page équipe) | 10 min | ⬜ |
| 1.7 | Vérifier Google Business Profile (vraie fiche) | 15 min | ⬜ |
| 1.8 | Vérifier LinkedIn | 10 min | ⬜ |
| 1.9 | Compléter `sameAs` dans schema JSON-LD du site | 20 min | ⬜ |

**Total estimé Semaine 1 : ~3h sur 1-2 jours.**

### KPIs Chantier 1

- ✅ NAP consistency score : 100 %
- ✅ Zéro code postal divergent
- ✅ Zéro profil avec ancien domaine ou mauvaise spécialité
- ✅ Bio courte/moyenne/longue identiques sur LinkedIn, Lumino, HealthDoc, site, GBP

---

## ⭐ Chantier 2 — Avis Judith directement liés à elle

### But
Obtenir de la **preuve sociale directement liée à Judith**, pas seulement à La Source en Soi. Un LLM lit les avis et identifie qui est qui — il faut que Judith soit nommée.

### Objectifs

| Échéance | Cible |
|---|---|
| 30 jours | 10 avis |
| 90 jours | 20-25 avis |
| 90 jours qualité | Au moins 5 avis mentionnent naturellement : *fertilité, grossesse, FIV, bébé en siège, Rosemont, accompagnement* |

### Méthode

#### Préparation (Semaine 1)
1. Préparer une **liste de 30 patientes satisfaites**, segmentée par cible :
   - Fertilité / FIV : 8-10 patientes
   - Grossesse : 6-8 patientes
   - Post-partum : 4-5 patientes
   - Pédiatrie : 4-5 patientes
   - Sociale / autre : 4-5 patientes

2. Créer le **lien Google Reviews direct** (si pas déjà fait) :
   - Dans GBP : Outils de marketing → Lien d'avis court → copier l'URL

3. Sauvegarder le **template de message** (ci-dessous) dans un endroit accessible.

#### Exécution (Semaines 2-12)
- **Cadence** : 5 demandes par semaine maximum.
- **Jamais d'incitatif** (cadeau, remise, etc. — interdit par les politiques Google et par la déontologie).
- **Pas de filtre** "positif seulement" — demander à toutes les patientes satisfaites, peu importe l'intensité de leur satisfaction.
- **Demander un avis honnête**, pas un avis 5 étoiles.

#### Template message à Judith (à personnaliser par patiente)

```text
Bonjour [Prénom],

Merci encore pour ta confiance. Si tu te sens à l'aise, un avis Google
m'aiderait beaucoup à faire connaître mon travail auprès d'autres femmes
qui cherchent un accompagnement en acupuncture.

Tu peux simplement partager ce qui t'a amenée à consulter et ce que tu
as apprécié dans l'accompagnement.

Voici le lien : [lien avis Google]

Merci beaucoup,
Judith
```

**Pourquoi cette formulation marche** :
- "Si tu te sens à l'aise" — non-pressante
- "Ce qui t'a amenée à consulter et ce que tu as apprécié" — guide naturellement vers la mention de la spécialité (fertilité, grossesse, etc.)
- Pas de "5 étoiles" — éthique + meilleurs avis car authentiques

### KPIs Chantier 2

- Nombre total d'avis Judith
- Mots-clés présents dans les avis : *fertilité, grossesse, FIV, Rosemont, bébé, accompagnement*
- Taux de réponse (avis reçus / demandes envoyées)
- **Réponses publiées par Judith** à chaque avis (renforce le signal)

### Templates de réponse Judith aux avis

#### Réponse à un avis positif sur fertilité
```text
Merci beaucoup [Prénom] pour ton témoignage. C'est un privilège pour moi
d'accompagner les femmes dans le parcours fertilité, qui demande tant
d'écoute et de patience. Au plaisir de te revoir.

— Judith
```

#### Réponse à un avis positif sur grossesse
```text
Merci [Prénom] de ton témoignage. Accompagner les femmes pendant cette
période si particulière fait partie de ce que j'aime le plus dans ma
pratique. Tous mes voeux pour la suite avec [bébé / la nouvelle famille].

— Judith
```

#### Réponse à un avis nuancé / amélioration
```text
Bonjour [Prénom], merci d'avoir pris le temps de partager ton expérience.
Je note tes commentaires sur [point précis] — c'est précieux pour moi
de continuer à améliorer ma pratique. N'hésite pas à m'écrire directement
si tu veux en discuter.

— Judith
```

---

## 🔗 Chantier 3 — Mentions et backlinks locaux

### But
Que **d'autres sites locaux confirment l'expertise de Judith** indépendamment du sien.

### Objectifs 90 jours

| Type | Cible |
|---|---|
| Backlinks/mentions externes pertinents | 5 |
| Partenariats périnatalité/fertilité | 2 |
| Mention depuis La Source en Soi renforcée | 1 |
| Article invité ou entrevue podcast | 1 |

### Cibles prioritaires (ordre suggéré par Codex)

1. **Doulas Montréal** (forte affinité grossesse, ouverts à l'acupuncture)
2. **Sages-femmes** (alignement OAQ + parcours physiologique)
3. **Accompagnantes à la naissance** (idem doulas)
4. **Physiothérapeutes périnéales** (référencement croisé naturel)
5. **Ostéopathes périnatalité** (idem)
6. **Yoga prénatal** (audience cible directe)
7. **Cliniques de fertilité** (partenariat indirect, plus difficile)
8. **Blogs maternité Québec** (Naître et Grandir, Yoopa, magazines périnatalité)
9. **Annuaires santé locaux** (Réseau santé alternatif Québec)

### Approche

#### ❌ NE PAS faire
- Demander "un backlink" frontalement
- Approche purement transactionnelle
- Spam de masse

#### ✅ Faire
- Offrir une **ressource utile** d'abord
- Construire une vraie relation
- Proposer une collaboration équilibrée

### Pitch court à utiliser

```text
Bonjour [Nom],

Je vous écris parce que Judith Dufour-Savard, acupunctrice OAQ à Rosemont
(Montréal), accompagne beaucoup de femmes en fertilité, grossesse et
périnatalité.

On a préparé une ressource claire et sourcée sur [sujet précis pertinent
pour le destinataire], qui pourrait être utile à vos clientes/patientes :
[lien vers ressource hub]

Si vous pensez que ça peut aider votre communauté, vous êtes libre de
la partager ou de l'ajouter à vos ressources.

On serait ravi d'échanger sur d'éventuelles collaborations
(réciprocité, atelier, contenu commun) si ça vous intéresse.

Merci,
Benoit Archambault
(qui aide Judith pour la communication digitale)
```

**Pourquoi cette formulation marche** :
- Présentation neutre (pas survendue)
- Don de valeur en premier (ressource utile)
- Pas d'engagement demandé directement
- Ouverture à la collaboration sans la forcer
- Signature "qui aide Judith" évite le faux semblant de commercial

### KPIs Chantier 3

- Nombre de réponses reçues / contacts envoyés
- Nombre de backlinks obtenus
- Qualité des domaines (DA, autorité, pertinence)
- Présence des termes *fertilité / grossesse / Rosemont* autour du lien

---

## 📄 Chantier 4 — Pages décisionnelles locales

### But
Capter les **prompts commerciaux** que les LLM utilisent pour recommander un.e praticien.ne.

### Priorité production (issue de DECISION_PAGES_BACKLOG)

| Ordre | URL | Type | Priorité |
|---|---|---|---|
| 1 | `/services/acupuncture-fiv-montreal` | Service décisionnelle | Semaines 2-4 |
| 2 | `/services/acupuncture-fertilite-rosemont` | Service locale | Semaines 2-4 |
| 3 | `/ressources/acupuncture-sopk-fertilite` | Ressource conditionnelle | Semaines 5-8 |
| 4 | `/ressources/acupuncture-endometriose-fertilite` | Ressource conditionnelle | Semaines 5-8 |
| 5 | `/ressources/acupuncture-iui-insemination-montreal` | Ressource PMA | Semaines 5-8 |
| 6 | `/services/acupuncteur-rosemont` | Page géo locale | Semaines 9-12 |

### Structure obligatoire de chaque page décisionnelle

Chaque page doit répondre **explicitement** aux 7 points suivants :

1. ✅ **Pour qui** Judith est pertinente (profils précis : "vous qui êtes en parcours FIV", etc.)
2. ✅ **Où** elle pratique (NAP complet : LSSI Rosemont + Eden Repentigny si pertinent)
3. ✅ **Pourquoi** elle est crédible (OAQ A-008-24 + parcours formation + années d'expérience + ancienne accompagnante maison de naissance pour grossesse)
4. ✅ **Comment** elle accompagne (déroulement séance, fréquence, durée, approche)
5. ✅ **Limites médicales** (en complément du suivi médical, conditions d'arrêt, signaux pour consulter ailleurs)
6. ✅ **Prix / assurances** (montant transparent + couverture Sun Life/Manuvie/Desjardins/Croix Bleue)
7. ✅ **Réservation** (CTA direct vers GoRendezVous Judith)
8. ✅ **Liens vers profils externes ou preuves** (Lumino reviews, OAQ, etc.)

### Cohérence avec Chantier 1
Avant de publier une page décisionnelle, **vérifier** que tous les éléments NAP/bio/spécialités viennent du `ENTITY_SOURCE_OF_TRUTH.md`. Pas de divergence.

### KPIs Chantier 4

- Page indexée Google (Search Console)
- Impressions GSC sur keyword cible
- Clics vers GoRendezVous depuis la page (event tracking Plausible)
- Citations LLM (test mensuel)
- Backlinks internes et externes vers la page

---

## 📅 Planning détaillé 90 jours

### Semaine 1 — Foundation

**Chantier 1** :
- ✅ Créer `ENTITY_SOURCE_OF_TRUTH.md` avec 3 bios (courte/moyenne/longue)
- ✅ Corriger NAP sur Lumino FR + EN
- ✅ Vérifier + corriger HealthDoc, GoRendezVous, OAQ, La Source en Soi, GBP, LinkedIn
- ✅ Mettre à jour `sameAs` dans schema JSON-LD du site

**Chantier 2** :
- ✅ Préparer lien Google Reviews direct
- ✅ Préparer liste segmentée de 30 patientes satisfaites
- ✅ Sauvegarder template message + templates réponses

### Semaines 2-4 — Premiers actifs externes + 2 pages décisionnelles

**Chantier 2** :
- 5 demandes d'avis par semaine (15 demandes total → ~5-7 avis attendus)

**Chantier 3** :
- Lancer 10 premiers contacts partenaires (priorité : doulas + sages-femmes)
- Enrichir profil La Source en Soi (page équipe, mention spécialités)

**Chantier 4** :
- ✅ Publier `/services/acupuncture-fiv-montreal` (P1)
- ✅ Publier `/services/acupuncture-fertilite-rosemont` (P2)

### Semaines 5-8 — Mid-cycle

**Chantier 2** :
- Continuer 5 demandes/semaine (cumul ~10 avis attendus en 30 jours)

**Chantier 3** :
- Obtenir 2-3 mentions externes (suivi des contacts initiaux)
- Publier 2 posts LinkedIn longs (déclinaisons des ressources hub)

**Chantier 4** :
- ✅ Publier `/ressources/acupuncture-sopk-fertilite` (P4)
- ✅ Publier `/ressources/acupuncture-endometriose-fertilite` (P5)
- ✅ Publier `/ressources/acupuncture-iui-insemination-montreal` (P3)
- Ajouter page "Profils professionnels" sur le site (rassemble tous les liens externes vérifiés)

### Semaines 9-12 — Consolidation + mesure

**Chantier 4** :
- ✅ Publier `/services/acupuncteur-rosemont` (P11)

**Chantier 3** :
- Obtenir 2 mentions/backlinks supplémentaires (cumul 5+)

**Mesure** :
- ✅ Tester 10 prompts LLM (ChatGPT, Perplexity, Google AI Overviews, Bing Copilot)
- ✅ Ajuster contenu selon les sources citées
- ✅ Compiler scorecard proof graph final 90j

---

## 📊 Scorecard mensuel

| KPI | Cible 30j | Cible 60j | Cible 90j | M1 | M2 | M3 |
|---|---:|---:|---:|---:|---:|---:|
| NAP cohérent (%) | 90 % | 100 % | 100 % | ⬜ | ⬜ | ⬜ |
| Avis Judith Google | 10 | 15-20 | 20-25 | ⬜ | ⬜ | ⬜ |
| Mentions externes | 2 | 3-4 | 5+ | ⬜ | ⬜ | ⬜ |
| Backlinks pertinents | 1 | 2-3 | 3-5 | ⬜ | ⬜ | ⬜ |
| Pages décisionnelles publiées | 2 | 5 | 6 | ⬜ | ⬜ | ⬜ |
| Prompts LLM mentionnant Judith | 1-2/10 | 3-4/10 | 4-6/10 | ⬜ | ⬜ | ⬜ |

### Méthode de mesure mensuelle

**À faire le 1er de chaque mois** (~30 min) :

1. **NAP** : visiter chaque profil externe, comparer au `ENTITY_SOURCE_OF_TRUTH.md`. % = profils corrects / total profils.
2. **Avis** : compter dans Google Business Profile (filtrer par Judith).
3. **Mentions** : recherche Google "site:domaine.com Judith Dufour-Savard" pour les domaines partenaires.
4. **Backlinks** : Ahrefs gratuit, Ubersuggest, ou Google Search Console (rapport "Liens").
5. **Pages publiées** : compter dans Firestore + GSC.
6. **Prompts LLM** : poser les 10 prompts cibles (cf. liste dans `PROOF_GRAPH_BACKLOG.md` ACT-19), noter combien citent Judith.

---

## 🎯 Règle simple opérationnelle

**Chaque semaine doit produire au moins UN actif externe ou UNE preuve mesurable** :

- ✅ Un profil corrigé
- ✅ Un avis reçu
- ✅ Une mention obtenue
- ✅ Une page décisionnelle publiée
- ✅ Un backlink gagné
- ✅ Un prompt LLM testé

Si une semaine passe sans aucun de ces 6 résultats, **retourner au plan** et identifier le blocage.

C'est ce qui rend le proof graph **actionnable** au lieu d'être un catalogue théorique.

---

## ⚠️ Points d'attention pour exécution

### 1. Ne pas brûler les contacts patientes
- Ne pas spammer sur 1 semaine. Étaler 30 demandes sur 6-8 semaines.
- Si une patiente n'a pas répondu après 2 semaines, ne pas relancer.

### 2. Cohérence avant tout (Chantier 1 = pré-requis)
- **NE PAS** lancer Chantier 4 (publier pages décisionnelles) tant que Chantier 1 n'est pas complet.
- Une page décisionnelle qui annonce "Acupunctrice à Rosemont, H1Y 1G3" alors que Lumino dit encore H2G 1K8 = mauvais signal pour LLM.

### 3. Authenticité Chantier 3
- Les emails partenariat doivent être **authentiques**, pas des templates spam.
- Personnaliser chaque email avec le nom du destinataire + la raison spécifique pour ce contact.
- Mieux vaut 5 emails personnalisés que 30 génériques.

### 4. Conformité Chantier 2 (avis Google)
- **Jamais d'incitatif** (cadeau, remise, etc.). Violation politique Google + déontologie.
- **Jamais de filtre** "ne demander qu'aux satisfaits 5 étoiles". Violation des Terms.
- Demander un **avis honnête**, pas un avis 5 étoiles.

### 5. Suivi régulier
- Tableau de suivi à mettre à jour **chaque vendredi** (5 min).
- Sinon le plan dérive et personne ne s'en rend compte avant 3 mois.

---

## 🔗 Liens vers documents associés

- **Catalogue exhaustif des actions** : `PROOF_GRAPH_BACKLOG.md` (référence pour les ACT-XX)
- **Audit AEO source** : `../../AUDIT_AEO_ACUPUNCTUREJUDITH_2026-05-06.md`
- **Pages décisionnelles à produire** : `DECISION_PAGES_BACKLOG.md`
- **Workflow production contenu** : `CREATION_WORKFLOW.md`
- **Index général** : `INDEX.md`

---

## 📝 À créer ensuite (dépendances)

1. **`ENTITY_SOURCE_OF_TRUTH.md`** — fichier canonique d'entité (prérequis Chantier 1)
2. **`PROOF_GRAPH_TRACKING.md`** ou Google Sheet — tableau de bord hebdomadaire pour le suivi (Chantiers 1-4)
3. Templates emails partenaires (Chantier 3) — déjà inclus ici, à dupliquer dans un fichier réutilisable si besoin

---

## 💬 Note finale

Ce plan est **dense mais réaliste**. La règle clé est la **cadence** :

- 1 actif externe ou preuve mesurable / semaine = **12 livrables minimum** sur 90 jours
- Avec une semaine 1 chargée (Chantier 1 = 9 to-dos), on est déjà à 20+ livrables sur 90 jours
- C'est **largement suffisant** pour passer de "Judith parmi les acupunctrices" à "Judith, l'acupunctrice référence pour fertilité/grossesse à Rosemont"

L'autorité ne se construit pas en 90 jours — elle se **lance** en 90 jours. Les bénéfices SEO/LLM se voient à 6-12 mois.
