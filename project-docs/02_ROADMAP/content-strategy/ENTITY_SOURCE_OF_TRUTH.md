# ENTITY SOURCE OF TRUTH — Judith Dufour-Savard

**Date création** : 6 mai 2026
**Statut** : ✅ Source canonique active — toute divergence externe doit être corrigée vers ce fichier
**Source** : `PROOF_GRAPH_OPERATIONAL_PLAN.md` Chantier 1, livrable principal
**Cross-refs internes** :
- `app/(public)/_components/GlobalJsonLd.tsx` (schema JSON-LD du site — doit refléter ce fichier)
- `app/(public)/a-propos/page.tsx` (page À propos — doit refléter ce fichier)
- `lib/utils/rdvUrl.ts` (constantes `CLINICS` consommées par le code applicatif — doit refléter ce fichier)
- `public/llms.txt` (index pour LLMs, créé 2026-05-07 — doit refléter ce fichier)
- `public/llms-full.txt` (contenu complet généré par `scripts/generate-llms-full.mjs` — script à auditer car contient ménopause non encore publiée et omet le numéro OAQ)
- `CLAUDE.md` (règle critique cohérence AEO + résumé NAP)

---

## ⚠️ Règle d'or

Toutes les sources externes (Lumino, HealthDoc, GoRendezVous, OAQ, GBP, LinkedIn, La Source en Soi, etc.)
**doivent dire exactement la même chose** que ce fichier. Un LLM qui détecte une incohérence (code postal,
spécialité, nom, téléphone) baisse son niveau de confiance et hésite à recommander Judith.

Avant de publier une page décisionnelle, vérifier que TOUS les éléments NAP/bio/spécialités viennent
de ce fichier. Pas de divergence.

---

## 1. Identité canonique

```yaml
nom_canonique: "Judith Dufour-Savard"
nom_avec_titre: "Judith Dufour-Savard, Ac."
metier_court: "Acupunctrice"
metier_long: "Acupunctrice membre de l'Ordre des acupuncteurs du Québec"

numero_oaq: "A-008-24"
ordre_pro: "Ordre des acupuncteurs du Québec (OAQ)"
url_oaq: "https://o-a-q.org"

diplome: "DEC en acupuncture"
ecole: "Collège de Rosemont"

wikidata_id: "Q139677208"
wikidata_url: "https://www.wikidata.org/wiki/Q139677208"

# Affiliations professionnelles (signal d'autorité — à mentionner dans bio longue)
affiliations:
  - nom: "Association des Acupuncteurs du Québec (AAQ)"
    role: "Ancienne administratrice du conseil d'administration"
    statut: "Mandat terminé (démission récente)"
    url: "https://acupuncture-quebec.com/conseil-d-administration/"
    note: "Signal d'autorité significatif pour le proof graph, à mentionner comme expérience passée. Formulation suggérée : 'Ancienne administratrice au conseil d'administration de l'AAQ' ou 'A siégé au conseil d'administration de l'AAQ'."
```

**Règles d'orthographe** :
- ✅ `Judith Dufour-Savard` (trait d'union, pas d'espace)
- ❌ `Judith Dufour Savard`, `Judith Savard`, `Judith Dufour`
- ✅ `Ac.` (avec point) après le nom dans contexte pro
- ✅ Accent sur Québec : `Québec`, jamais `Quebec`

---

## 2. Spécialités

> **Modèle à 3 niveaux** pour permettre la souplesse d'évolution sans casser la cohérence externe.
> - **Niveau 1 (piliers canoniques)** : figés, présents partout — site, schema, profils externes, bios.
> - **Niveau 2 (sous-thèmes actifs)** : déclinaisons d'un pilier, activés au fur et à mesure que les pages publient.
> - **Niveau 3 (émergentes)** : pas encore actives publiquement — ne PAS mentionner dans les profils externes ni les bios courte/moyenne tant qu'elles ne sont pas remontées au niveau 2.

### 2.1 Piliers canoniques (FIGÉS — toujours mentionner)

```yaml
piliers:
  - nom: "Fertilité"
    url: "/services/fertilite"
    label_long: "Acupuncture en fertilité"

  - nom: "Grossesse & périnatalité"
    url: "/services/grossesse"
    label_long: "Acupuncture en grossesse et périnatalité"

  - nom: "Pédiatrie"
    url: "/services/pediatrie"
    label_long: "Acupuncture pédiatrique"

  - nom: "Acupuncture sociale"
    url: "/services/acupuncture-sociale"
    label_long: "Acupuncture sociale (tarif réduit)"
```

### 2.2 Sous-thèmes actifs (mis à jour quand pages publiées)

> Activer un sous-thème = la page existe ET est publiée. Avant publication, garder en niveau 3.

**Fertilité** :
- FIV (fécondation in vitro) — page prévue : `/services/acupuncture-fiv-montreal`
- IUI / Insémination — page prévue : `/ressources/acupuncture-iui-insemination-montreal`
- SOPK (syndrome des ovaires polykystiques) — page prévue : `/ressources/acupuncture-sopk-fertilite`
- Endométriose — page prévue : `/ressources/acupuncture-endometriose-fertilite`
- Fertilité naturelle (sans PMA)

**Grossesse & périnatalité** :
- Premier trimestre / nausées
- Préparation à l'accouchement
- Moxibustion (bébé en siège)
- Post-partum
- Allaitement

**Pédiatrie** :
- Bébés (techniques sans aiguille — aimants, shōnishin)
- Enfants (sommeil, digestion, immunité)

**Acupuncture sociale** :
- NADA (protocole oreille)
- Tarif réduit / accessibilité

### 2.3 Spécialités émergentes (NE PAS encore mentionner externement)

> Ces spécialités sont prévues mais pas encore activées dans le schema JSON-LD ni les profils externes.
> Quand une ressource sur le sujet est publiée → faire monter au niveau 2.2 ET décommenter dans `GlobalJsonLd.tsx`.

- **Ménopause** — actuellement commentée dans `GlobalJsonLd.tsx` (`knowsAbout` + `availableService`).
  Activation conditionnelle : publication d'au moins une ressource pilier.
- _(ajouter ici les futures spécialités au fur et à mesure des plans éditoriaux)_

---

## 3. NAP — Lieu principal (canonique)

```yaml
nom_clinique: "La Source en Soi"
nom_clinique_court: "LSSI"
adresse_rue: "2554 rue Beaubien Est"
adresse_complement: ""
ville: "Montréal"
quartier: "Rosemont"
arrondissement: "Rosemont—La Petite-Patrie"
region: "QC"
code_postal: "H1Y 1G3"
pays: "Canada"
pays_iso: "CA"

# Géolocalisation
latitude: 45.5408
longitude: -73.5823
# ⚠️ DIVERGENCE À RÉSOUDRE : `lib/utils/rdvUrl.ts` indique 45.5501, -73.5832 pour la même adresse.
# Vérifier sur Google Maps quelle est la coordonnée précise de 2554 rue Beaubien Est, Montréal,
# puis aligner les 3 sources : ce fichier, `GlobalJsonLd.tsx` et `rdvUrl.ts`.

# Jours de pratique de Judith à LSSI
jours_pratique: ["lundi", "mardi", "jeudi", "vendredi"]

# Identifiants externes liés à LSSI
gorendezvous_company_id: "104074"
gorendezvous_employee_id: "175708"
gorendezvous_url: "https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708"
url_clinique: "https://lasourceensoi.com/"
```

**Format canonique pour citations courtes** :
- Ultra-court : `Rosemont, Montréal`
- Court : `La Source en Soi, 2554 Beaubien Est, Rosemont`
- Long : `La Source en Soi, 2554 rue Beaubien Est, Montréal (Rosemont), H1Y 1G3`

---

## 4. NAP — Lieu secondaire

```yaml
nom_clinique: "Éden Yoga Pilates"
adresse_rue: "121 boulevard Industriel"
adresse_complement: "local 225"
ville: "Repentigny"
region: "QC"
code_postal: "J6A 7K4"
pays: "Canada"
pays_iso: "CA"

# Site web officiel de la clinique
url_clinique: "https://edenyogapilates.ca/"
url_clinique_alt: "https://edensantemieuxetre.com/"

# Géolocalisation (depuis lib/utils/rdvUrl.ts)
latitude: 45.7422
longitude: -73.4515

# Identifiants externes liés à Éden (depuis lib/utils/rdvUrl.ts)
gorendezvous_company_id: "141296"
gorendezvous_employee_id: "192390"
gorendezvous_stype: "Acupuncture"
gorendezvous_url: "https://www.gorendezvous.com/edenyogapilates?companyId=141296&eids=192390&stype=Acupuncture"

# Jours de pratique de Judith à Éden
jours_pratique: ["mercredi"]
horaire: "9h00 à 15h00"
note: "Pas d'acupuncture sociale offerte à Éden."
```

⚠️ **Confusion à éviter** : il existe un autre studio nommé **Edem Yoga Pilates** (avec un M, pas un N) au 80 boulevard Brien #2200, Repentigny J6A 5K7 — sans aucun lien avec Éden Yoga Pilates. Toujours vérifier l'orthographe.

**Format canonique** :
- Court : `Éden Yoga Pilates, Repentigny`
- Long : `Éden Yoga Pilates, 121 boulevard Industriel, local 225, Repentigny (QC) J6A 7K4`
- Variante GBP/Google Maps : `121 Bd Industriel Local 225, Repentigny, Quebec J6A 7K4`

---

## 5. Coordonnées canoniques

```yaml
telephone: "+1-514-750-3735"
telephone_format_local: "514 750-3735"
telephone_format_international: "+1 514 750-3735"

email: "info@acupuncturejudith.ca"

site_web: "https://www.acupuncturejudith.ca"
site_web_sans_www: "https://acupuncturejudith.ca"

# URL de réservation directe — toujours utiliser celle-ci dans CTA, profils externes, signatures
reservation: "https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708"
```

**Note redirection** : `mon-acupunctrice.ca` redirige vers `acupuncturejudith.ca` (legacy Wix).
Toujours utiliser `acupuncturejudith.ca` dans tous les profils externes.

---

## 6. Réseaux sociaux (sameAs)

> Toujours utiliser ces URLs exactes — sur le schema, dans les footers, sur tous les profils externes.

```yaml
instagram_handle: "@mon_acupunctrice"
instagram_url: "https://www.instagram.com/mon_acupunctrice/"

youtube_handle: "@JudithDufourSavard"
youtube_url: "https://www.youtube.com/@JudithDufourSavard"

facebook_id: "61562614934143"
facebook_url: "https://www.facebook.com/profile.php?id=61562614934143"

linkedin_handle: "judith-dufour-savard-acu"
linkedin_url: "https://www.linkedin.com/in/judith-dufour-savard-acu/"

wikidata_id: "Q139677208"
wikidata_url: "https://www.wikidata.org/wiki/Q139677208"

# Lien associé (clinique principale)
lasourceensoi_url: "https://lasourceensoi.com/"

# Google Business Profile de Judith
gbp_share_url: "https://share.google/ncO1Alzja10AmsUfR"
# Note : récupérer aussi le lien d'avis court depuis GBP (Outils marketing → Lien d'avis)
# pour pouvoir le partager aux patientes (Chantier 2 du plan op).
gbp_avis_short_link: "[À RÉCUPÉRER par Benoit/Judith dans GBP]"
```

---

## 7. Bios canoniques

> **Convention** : 3 bios à la 3e personne, pour profils externes (Lumino, HealthDoc, LinkedIn, GBP, OAQ, annuaires).
> Le site `/a-propos` utilise sa propre voix éditoriale à la **1re personne** — c'est volontaire, pas une divergence.
> Quand un profil externe demande une bio en 1re personne, adapter en gardant les mêmes faits.

### 7.1 Bio courte (~300 caractères) — pour annuaires, signatures, profils sociaux brefs

```text
Judith Dufour-Savard, Ac., est acupunctrice membre de l'OAQ (A-008-24).
Elle pratique à La Source en Soi (Rosemont, Montréal) et à Éden Yoga
Pilates (Repentigny). Spécialisée en fertilité, grossesse et périnatalité,
pédiatrie et acupuncture sociale. Ancienne accompagnante à la Maison de
naissance Côte-des-Neiges.
```

### 7.2 Bio moyenne (~800 caractères) — pour Lumino, HealthDoc, LinkedIn About

```text
Judith Dufour-Savard, Ac., est acupunctrice membre de l'Ordre des
acupuncteurs du Québec (A-008-24). Diplômée du DEC en acupuncture du
Collège de Rosemont, elle a accompagné de nombreuses familles à la
Maison de naissance Côte-des-Neiges pendant ses études — une expérience
qui a profondément orienté sa pratique vers la santé des femmes et les
transitions de vie.

Elle pratique du lundi au vendredi (sauf le mercredi) à La Source en Soi,
2554 Beaubien Est dans Rosemont à Montréal, et le mercredi à Éden Yoga
Pilates à Repentigny. Ses séances durent 60 minutes : le temps d'écouter,
d'évaluer, de traiter et d'expliquer.

Ses spécialités : fertilité (incluant FIV et insémination), grossesse et
périnatalité (du premier trimestre au post-partum), pédiatrie (techniques
douces sans aiguille pour les plus petits) et acupuncture sociale à
tarif réduit.
```

### 7.3 Bio longue (~1500 caractères) — pour page À propos externe, articles invités, présentations

```text
Judith Dufour-Savard, Ac., est acupunctrice membre de l'Ordre des
acupuncteurs du Québec (A-008-24). Elle a d'abord eu une première vie
dans le spectacle vivant — en régie et en éclairage. C'est l'arrivée de
ses enfants qui l'a menée vers la périnatalité, puis vers le DEC en
acupuncture au Collège de Rosemont. Pendant ses études, elle a travaillé
à la Maison de naissance Côte-des-Neiges, où elle a accompagné de
nombreuses familles dans les débuts de la vie. Cette expérience a
profondément orienté sa pratique vers la santé des femmes et les
transitions de vie.

Aujourd'hui, elle pratique à Rosemont (La Source en Soi, 2554 Beaubien
Est) du lundi au vendredi sauf le mercredi, jour où elle reçoit à Éden
Yoga Pilates à Repentigny. Ses séances durent 60 minutes : le temps
d'écouter, d'évaluer, de traiter et d'expliquer.

Sa pratique se concentre sur quatre piliers. La fertilité, incluant le
soutien en FIV, en insémination, et pour des conditions comme le SOPK
et l'endométriose. La grossesse et la périnatalité, du premier trimestre
au post-partum (nausées, douleurs, préparation à l'accouchement,
moxibustion pour bébé en siège). La pédiatrie, avec des techniques
adaptées et souvent sans aiguille pour les plus petits (aimants,
shōnishin). Et l'acupuncture sociale, des soins à tarif réduit pour
rendre la santé accessible.

Au-delà de sa pratique clinique, Judith s'est engagée dans le
rayonnement de la profession en siégeant au conseil d'administration de
l'Association des Acupuncteurs du Québec (AAQ) à titre d'administratrice.
Elle se forme continuellement auprès de professionnels experts dans
leur domaine.
```

### 7.4 Variante 1re personne (référence — site /a-propos)

La page `/a-propos` utilise une voix première personne assumée. Voir les
sections `AboutHeroSection.tsx`, `AboutParcoursSection.tsx`,
`AboutPratiqueSection.tsx` pour la voix éditoriale exacte. Les **faits**
doivent rester identiques au présent fichier ; seule la voix change.

---

## 8. Vocabulaire canonique

> Mots à utiliser et mots à éviter pour rester cohérent partout.

### ✅ Termes à utiliser

| Préféré | Au lieu de |
|---|---|
| `Acupunctrice` | acupuncteure, acupuncteuse |
| `Acupunctrice membre de l'OAQ` | acupunctrice certifiée, acupunctrice agréée |
| `Ordre des acupuncteurs du Québec (OAQ)` | OAQ tout court (au moins 1× le nom complet par page) |
| `Fertilité` | infertilité, hypofertilité (sauf contexte clinique précis) |
| `Grossesse et périnatalité` | maternité, prénatal (séparément) |
| `Pédiatrie` / `acupuncture pédiatrique` | acupuncture pour enfants (en complément OK) |
| `Acupuncture sociale` | acupuncture communautaire, acupuncture à bas prix |
| `Séance` | consultation, traitement (acceptables mais "séance" prioritaire) |
| `Rosemont, Montréal` | Plateau, Montréal-Est, etc. |
| `Repentigny` | Lanaudière, Rive-Nord (sauf contexte régional explicite) |

### ⚠️ À éviter

- ❌ "guérir" (terme régulé) → préférer `accompagner`, `soutenir`, `soulager`
- ❌ "traiter [maladie médicale]" sans nuance → préférer `accompagner en complément du suivi médical`
- ❌ Promesses de résultat (taux de succès FIV, etc.) sans nuance scientifique
- ❌ "Best", "meilleur", "expert·e" en superlatif sans qualification
- ❌ "Spécialiste de..." (terme régulé OAQ) → préférer `spécialisée en...`

---

## 9. Profils externes à harmoniser (checklist Chantier 1)

> Pour chaque profil : vérifier que le NAP, la bio, les spécialités et les liens correspondent **exactement** à ce fichier. Cocher après vérification.

| # | Profil | URL/ID | Statut | Notes |
|---|---|---|---|---|
| 1.2a | Lumino EN | [`/health-care-provider-profile/.../judith-dufour-savard-1007631-1001446/`](https://luminohealth.sunlife.ca/en/health-care-provider-profile/acupuncturist/la-source-en-soi-centre/judith-dufour-savard-1007631-1001446/) | ⚠️ non-revendiqué | NAP cohérent (H1Y 1G3 ✅). Profil affiche "Is this you? Sign up for your free profile" → **action prioritaire** : revendiquer le profil pour pouvoir éditer bio + spécialités + photo. |
| 1.2b | Lumino FR | _(même URL avec `/fr/` au lieu de `/en/`)_ | ⚠️ non-revendiqué | Lumino utilise une URL bilingue. Revendiquer 1.2a active aussi la version FR. |
| 1.3 | HealthDoc (healthdoc.ca) | _(profil inexistant)_ | ⬜ opportunité | Aucun profil Judith trouvé. **Décision à prendre** : créer un profil ? D'autres acupuncteur·trices québécois y figurent (ex. Geneviève Perron-Dufour, Julie Savard). Quick win possible pour le proof graph. |
| 1.4 | GoRendezVous | `companyId=104074&eids=175708` | ⬜ | Vérifier bio, photo, spécialités, et que le bouton mène bien au profil Judith (pas LSSI globale). |
| 1.5 | OAQ — fiche publique | A-008-24 | ⬜ | Vérifier sur le registre OAQ (`o-a-q.org`) que les infos publiques correspondent. Modifications via OAQ — délai possible. |
| 1.6 | La Source en Soi — page équipe | [`lasourceensoi.com/equipe/judith-dufour-savard/`](https://lasourceensoi.com/equipe/judith-dufour-savard/) | ⬜ divergences détectées | Bio actuelle utilise `infertilité` (au lieu de `fertilité`) et ne mentionne pas les spécialités piliers de façon structurée. **Action** : envoyer à LSSI une bio courte ou moyenne canonique pour remplacer la version actuelle. |
| 1.7 | Google Business Profile (Judith) | [`share.google/ncO1Alzja10AmsUfR`](https://share.google/ncO1Alzja10AmsUfR) | ✅ existence confirmée | Fiche GBP propre à Judith, distincte de LSSI. **Encore à récupérer** : (a) lien d'avis court depuis GBP (Outils marketing → Lien d'avis) — débloque le Chantier 2 ; (b) optionnellement, URL Google Maps directe (`maps.app.goo.gl/...`) pour un `sameAs` plus parlant. |
| 1.8 | LinkedIn | [`linkedin.com/in/judith-dufour-savard-acu/`](https://www.linkedin.com/in/judith-dufour-savard-acu/) | ⬜ | Bio About + Experience + Skills + Featured (lien `acupuncturejudith.ca`). Photo de profil à harmoniser avec celle du site. |
| 1.9 | Facebook business | [`profile.php?id=61562614934143`](https://www.facebook.com/profile.php?id=61562614934143) | ⚠️ vs profil perso | À distinguer du profil personnel `facebook.com/judith.dufoursavard/`. S'assurer que le `sameAs` du schema pointe bien vers la **page business** (id 615...) et pas le profil perso. |
| 1.10 | AAQ — mention historique | [`acupuncture-quebec.com/conseil-d-administration/`](https://acupuncture-quebec.com/conseil-d-administration/) | ⚠️ mandat terminé | Judith **a démissionné récemment** du CA. La page AAQ peut encore la lister — vérifier et au besoin demander retrait pour ne pas créer d'ambiguïté. À mentionner dans bios canoniques comme **expérience passée** (signal d'autorité durable même après mandat). |
| 1.11 | Schema JSON-LD du site (`GlobalJsonLd.tsx`) | repo | ⚠️ partiellement aligné | **Action** : ajouter le passé AAQ dans `alumniOf` ou `affiliation` (pas `memberOf` car non actif). Pas d'ajout `sameAs` AAQ tant que la page AAQ liste encore Judith — risque d'incohérence si elle est retirée. À revérifier après chaque édit du présent fichier (cf. §10 protocole). |
| 1.12 | `public/llms.txt` | repo | ⬜ | Confirmer cohérence avec présent fichier (identité, affiliations, spécialités, NAP). |

### Note critique GBP (Chantier 1.7 et Chantier 2)

La note `aggregateRating 4.9 / 1215 avis` actuellement dans `GlobalJsonLd.tsx` est celle de **La Source en Soi** dans son ensemble — pas de Judith spécifiquement.

Pour le Chantier 2 (objectif 20-25 avis Judith d'ici 90 jours), il faut **impérativement** :
1. Confirmer que la fiche GBP propre à Judith est bien créée et publiée (URL à inscrire ligne 1.7).
2. Récupérer le **lien d'avis court** depuis cette fiche GBP pour pouvoir le partager aux patientes (cf. plan op Chantier 2 préparation).
3. Sans ces deux étapes, le Chantier 2 est bloqué.

---

## 10. Protocole de mise à jour

> Ce fichier doit rester **vivant** mais cohérent. Workflow obligatoire pour chaque modification.

### Quand modifier ce fichier

- Nouveau pilier ou sous-thème activé (page publiée)
- Changement coordonnées (téléphone, email, adresse)
- Nouveau profil externe (annuaire, ordre, etc.)
- Nouvelle pratique / nouveau lieu
- Correction d'erreur factuelle

### Workflow d'update (à suivre dans cet ordre)

1. **Modifier ce fichier** en premier (commit dédié, message clair).
2. **Mettre à jour `app/(public)/_components/GlobalJsonLd.tsx`** pour refléter le changement (mêmes valeurs).
3. **Mettre à jour `public/llms.txt`** si la modif touche identité/spécialités/lieux.
4. **Mettre à jour la page `/a-propos`** si la modif touche bio, parcours, lieux, jours de pratique.
5. **Mettre à jour les profils externes** affectés (Lumino, HealthDoc, LinkedIn, GBP, etc.). Tableau de suivi à jour.
6. **Vérifier les pages décisionnelles déjà publiées** : si la modif touche un fait cité dans une page service ou ressource, mettre à jour la page.

### Cadence de revue

- **Hebdomadaire (vendredi, 5 min)** : passer le tableau §9 et noter les changements de statut.
- **Mensuelle (1er du mois, 30 min)** : audit complet — visiter chaque profil externe, comparer à ce fichier, mesurer le NAP consistency score (cible 100% à 60j).

### Règle critique

⚠️ **Ne JAMAIS publier une page décisionnelle avant que le Chantier 1 soit à 100% pour le sujet de la page.**

Exemple : avant de publier `/services/acupuncture-fiv-montreal`, s'assurer que les profils Lumino + LinkedIn + GBP mentionnent bien la FIV comme sous-thème de fertilité et utilisent le bon code postal H1Y 1G3.

Une page décisionnelle qui annonce *"Acupunctrice à Rosemont, H1Y 1G3"* alors que Lumino dit encore un autre code postal = mauvais signal pour les LLMs.

---

## 11. Versioning

| Version | Date | Auteur | Changements |
|---|---|---|---|
| 1.0 | 2026-05-06 | Benoit + Claude | Création initiale — Chantier 1.1 du PROOF_GRAPH_OPERATIONAL_PLAN. Pré-rempli depuis `GlobalJsonLd.tsx` + sections About du site. Bios 3e personne rédigées. |
| 1.1 | 2026-05-06 | Benoit + Claude | Audit web : code postal Éden trouvé (J6A 7K4), nom officiel précisé (Éden Santé Mieux-être), URLs Lumino documentées (profil non-revendiqué — action prioritaire), HealthDoc absent (opportunité), divergence détectée sur la page LSSI équipe (utilise `infertilité`), distinction Facebook page business vs profil perso, alerte GBP non visible publiquement. |
| 1.2 | 2026-05-06 | Benoit + Claude | Correction §4 : nom canonique = `Éden Yoga Pilates` (revert). Ajout §1 affiliations : Judith est administratrice du CA de l'**AAQ** — découverte majeure non documentée dans le schema. GBP confirmée existante (lien Knowledge Graph fourni par Benoit) ; URL Maps canonique encore à récupérer. Profils §9 réorganisés : nouvelle ligne 1.10 pour AAQ, schema JSON-LD passé en ⚠️ (manque `memberOf` AAQ + `sameAs` AAQ). |
| 1.3 | 2026-05-06 | Benoit + Claude | Précision AAQ : Judith **a démissionné récemment** du CA — passé en `Ancienne administratrice` dans §1, mention historique dans §9 ligne 1.10, recommandation schema modifiée en `alumniOf` ou `affiliation` (pas `memberOf`). GBP : URL share fournie (`share.google/ncO1Alzja10AmsUfR`) — ligne 1.7 passée en ✅ existence confirmée. Lien d'avis court GBP toujours à récupérer pour débloquer le Chantier 2. |
| 1.4 | 2026-05-06 | Benoit + Claude | Bio longue §7.3 enrichie d'un 4e paragraphe court mentionnant l'engagement AAQ (siège passé au CA) — formulation neutre qui reste valide même après démission. Bio passée de ~1500 à ~1700 caractères. Bio courte et moyenne inchangées (mention AAQ trop longue à intégrer sans alourdir). |
| 1.5 | 2026-05-07 | Benoit + Claude | Session matinale. Cohérence interne avec le repo : §3 ajout d'un flag de divergence sur les coordonnées géo LSSI (rdvUrl.ts dit 45.5501/-73.5832, le SOT et GlobalJsonLd.tsx disent 45.5408/-73.5823 — à trancher) ; §4 ajout des coordonnées géo Éden (45.7422, -73.4515) et des identifiants GoRendezVous Éden (companyId=141296, eids=192390, stype=Acupuncture) précédemment manquants. Cross-refs étendues à `rdvUrl.ts` et `llms-full.txt`. Note sur le script `generate-llms-full.mjs` : à auditer car mentionne ménopause (non publiée — viole la règle critique) et omet le numéro OAQ A-008-24. |

---

## 🔗 Documents associés

- **Plan opérationnel parent** : `PROOF_GRAPH_OPERATIONAL_PLAN.md` (Chantier 1)
- **Catalogue d'actions** : `PROOF_GRAPH_BACKLOG.md`
- **Audit AEO source** : `../../AUDIT_AEO_ACUPUNCTUREJUDITH_2026-05-06.md`
- **Pages décisionnelles à produire** : `DECISION_PAGES_BACKLOG.md`
- **Index général** : `INDEX.md`
- **Schema JSON-LD live** : `app/(public)/_components/GlobalJsonLd.tsx`
- **Page À propos live** : `app/(public)/a-propos/page.tsx`
