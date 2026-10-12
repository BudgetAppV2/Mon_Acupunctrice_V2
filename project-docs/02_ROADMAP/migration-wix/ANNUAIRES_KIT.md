# Kit annuaires — Judith Dufour-Savard
*Document de préparation pour le déploiement des fiches annuaires.
Date cible : 3 mai 2026 (jour du switch DNS). À soumettre simultanément pour un pic de backlinks.*

> **🔄 Mise à jour 29 avril 2026** : données récupérées par Claude in Chrome (`ANNUAIRES_KIT_DATA.md` à côté de ce fichier). Liste de plateformes révisée — passage de 12 à 8 actions concrètes pour 10 fiches utiles.
>
> **🔄 Mise à jour 12 octobre 2026** : Judith a quitté La Source en Soi pour **Les Vagues, communautés thérapeutiques** (2395 rue Beaubien Est, Rosemont). NAP, horaires, descriptions et téléphone ci-dessous sont à jour. Toute fiche déjà créée avec l'ancienne adresse (2554 Beaubien Est, H1Y 1G3) doit être corrigée. Voir `docs/MIGRATION_LES_VAGUES.md`.

---

## 0. Infos de base — toutes confirmées sauf indication contraire

| Champ | Valeur | Source |
|-------|--------|--------|
| Nom légal complet | Judith Dufour-Savard | ✓ |
| Nom professionnel à utiliser partout | **Judith Dufour-Savard, Ac.** | ✓ |
| Numéro OAQ (membre #) | **A-008-24** | ✓ Répertoire OAQ |
| Téléphone pro principal | **514 882-1922** (cellulaire de Judith, appel ou texto) | ✓ Oct. 2026 — Les Vagues n'a pas de numéro public |
| Email pro | jdufoursavard@gmail.com | 💬 Judith (à confirmer si autre) |
| Site web officiel | https://acupuncturejudith.ca | ✓ |
| Année admission OAQ | 2024 (probable, suffixe « -24 ») | 💬 Judith (à confirmer) |
| Année début de pratique | `<À CONFIRMER avec Judith>` | 💬 (peut être antérieure si formation supervisée en Maison de naissance) |
| Photos professionnelles | `/Users/benoitarchambault/Dropbox (Compte personnel)/Judith/` | ✓ 14 originales Eric Bates + 8 cropées |
| Logo personnel | `<À CONFIRMER avec Judith>` | 💬 (a-t-elle un logo perso ?) |

### Adresses

**Principale — Les Vagues, communautés thérapeutiques (Rosemont, Montréal)**
```
Les Vagues, communautés thérapeutiques
2395 rue Beaubien Est
Montréal, QC  H2G 1N3
Canada
Téléphone : 514 882-1922 (Judith)
```

⚠️ Code postal : OpenStreetMap géocode le 2395 Beaubien Est en H1Y 1G2. On garde **H2G 1N3** (identique à la fiche Google), mais vérifier sur Postes Canada avant de soumettre les fiches.

**Secondaire — Éden Yoga Pilates (Repentigny)**
```
Éden Yoga Pilates
121 Boulevard Industriel, suite 225
Repentigny, QC  J6A 7K4
Canada
Téléphone Éden : 514 815-1035
```

### Horaires Judith (confirmés octobre 2026)

```
Lundi    : 8h30 – 15h00      (Les Vagues, Rosemont — séances privées)
Mardi    : 13h00 – 17h00     (Les Vagues, Rosemont — acupuncture sociale)
           18h00 – 21h00     (Les Vagues, Rosemont — séances privées)
Mercredi : 8h30 – 11h30      (Les Vagues, Rosemont — acupuncture sociale)
Jeudi    : 9h00 – 15h00      (Éden Repentigny)
Vendredi : 8h30 – 12h00      (Les Vagues, Rosemont — acupuncture sociale)
Samedi   : Fermé
Dimanche : Fermé
```

Source canonique : `NAP.lesvagues.schedule` et `NAP.eden.schedule` dans `lib/entity-canonical.mjs`. Les annuaires qui n'acceptent qu'une plage par jour : mardi 13h00 – 21h00.

### URLs de réservation

- Les Vagues : `https://www.gorendezvous.com/bhavanalaclinique?companyId=106503&eids=196572` (le slug GRV est un nom technique — ne jamais l'écrire comme nom de clinique)
- Éden : `https://www.gorendezvous.com/edenyogapilates?companyId=141296&eids=192390&stype=Acupuncture`
- **Page unifiée** : `https://acupuncturejudith.ca/reserver`

**Préférer la page unifiée** sur les annuaires — elle présente les deux options et capte l'analytics Plausible.

---

## 1. Descriptions réutilisables — Copier selon la longueur permise

### Description ULTRA-COURTE (50-80 caractères)

> Acupunctrice à Montréal et Repentigny — Fertilité, grossesse, pédiatrie

(72 caractères)

### Description COURTE (150-250 caractères)

> Judith Dufour-Savard, Ac. (OAQ A-008-24) accompagne ses patientes en fertilité, grossesse, pédiatrie et santé mentale. Pratique chez Les Vagues, communautés thérapeutiques (Rosemont) et à Éden Yoga Pilates (Repentigny).

(219 caractères)

### Description MOYENNE (400-500 caractères)

> Judith Dufour-Savard est acupunctrice membre en règle de l'Ordre des acupuncteurs du Québec (numéro de membre A-008-24). Elle accompagne ses patientes dans les enjeux de fertilité, grossesse, périnatalité, pédiatrie, ménopause, anxiété et insomnie. Sa pratique combine acupuncture classique, moxibustion et auriculothérapie, avec une approche personnalisée fondée sur la médecine chinoise traditionnelle. Cabinets chez Les Vagues, communautés thérapeutiques (Rosemont, Montréal) les lundis, mardis, mercredis et vendredis, et à Éden Yoga Pilates (Repentigny) le jeudi.

(568 caractères — raccourcir si nécessaire)

### Description LONGUE (700-750 caractères) — pour Google Business Profile, Lumino

> Judith Dufour-Savard est acupunctrice membre en règle de l'Ordre des acupuncteurs du Québec (numéro de membre A-008-24). Elle accompagne ses patientes dans les transitions de vie qui touchent au corps féminin : fertilité et préparation à la conception, grossesse et préparation à l'accouchement, soins post-partum, pédiatrie (coliques, sommeil, eczéma), ménopause, anxiété et insomnie.
>
> Son approche s'appuie sur la médecine chinoise traditionnelle et intègre l'acupuncture classique, la moxibustion, l'auriculothérapie et les ventouses selon les besoins. Chaque traitement est personnalisé après une évaluation complète incluant prise du pouls et observation de la langue.
>
> Judith pratique à deux endroits : chez Les Vagues, communautés thérapeutiques, à Rosemont (Montréal) les lundis, mardis, mercredis et vendredis, avec des plages d'acupuncture sociale à tarif réduit, et à Éden Yoga Pilates à Repentigny le jeudi. Réservation en ligne via acupuncturejudith.ca.

(966 caractères — raccourcir au besoin)

### Bio personnelle (annuaires qui demandent un texte « About »)

> Acupunctrice membre de l'OAQ (A-008-24), Judith Dufour-Savard pratique à Montréal (Rosemont) et à Repentigny. Sa pratique se concentre sur l'accompagnement des femmes — fertilité, grossesse, post-partum, pédiatrie, ménopause — avec une approche qui combine la rigueur scientifique et l'écoute clinique. Elle pratique aussi l'acupuncture sociale chez Les Vagues, communautés thérapeutiques, pour rendre les soins accessibles.

---

## 2. Catégories et services — Réutiliser tel quel

### Catégorie primaire (toujours)
- **Acupuncteur / Acupuncturist** (sous Health & Medical > Traditional Chinese Medicine)

### Catégories secondaires
- Médecine alternative / Alternative medicine
- Médecine traditionnelle chinoise / Traditional Chinese Medicine
- Praticien de santé / Health practitioner
- Soin du bien-être / Wellness service

### Services
1. Acupuncture en fertilité
2. Acupuncture en grossesse
3. Acupuncture pédiatrique (bébés et enfants)
4. Acupuncture pour la ménopause
5. Acupuncture pour l'anxiété et le stress
6. Acupuncture pour l'insomnie
7. Acupuncture pour la douleur chronique
8. Acupuncture sociale (Les Vagues uniquement)
9. Moxibustion
10. Auriculothérapie
11. Ventouses thérapeutiques
12. Préparation à l'accouchement

### Mots-clés / tags
acupuncture, acupunctrice, médecine chinoise, fertilité, grossesse, périnatalité, ménopause, anxiété, insomnie, douleur, Montréal, Rosemont, Repentigny, OAQ

---

## 3. Les plateformes — Liste révisée (8 actions, 10 fiches)

### 🟢 Niveau 1 — Plateformes essentielles (priorité maximale)

#### Fiche 1 — Google Business Profile
- **DA** : 100
- **URL** : https://business.google.com (compte jdufoursavard@gmail.com)
- **Statut** : ✅ Existe déjà — optimisée selon le handoff (catégorie, services, description, lien réservation)
- **Action requise jour J** : Post « Site live » + vérifier que tous les liens pointent vers acupuncturejudith.ca

#### Fiche 2 — Apple Maps
- **DA** : 100 (équivalent dans l'écosystème Apple)
- **URL inscription** : https://mapsconnect.apple.com/
- **Statut existence** : ❓ Non vérifié (nécessite un appareil Apple pour vérifier sur Plans). À faire avant le jour J.
- **Champs requis** : Nom, adresse, téléphone, catégorie, site web, heures
- **Description max** : ~300 caractères → utiliser COURTE
- **Catégorie** : ✅ « Acupuncture » (sous Health > Alternative & Holistic Health)
- **Validation** : Apple ID + appel téléphonique automatique
- **Délai approbation** : 3-7 jours
- **Frais** : Gratuit
- **Note** : Vérifier d'abord si Apple Maps a auto-importé une fiche depuis Google Maps. Pour les 2 adresses, créer 2 fiches distinctes ou une fiche principale avec adresse secondaire.

#### Fiche 3 — Bing Places for Business
- **DA** : 90+
- **URL inscription** : https://www.bingplaces.com/
- **Statut existence** : ❌ Pas de fiche actuelle (vérifié par CiC sur Bing Maps)
- **Action recommandée** : **Vérifier d'abord si Bing a auto-importé depuis GBP** avant de créer manuellement
- **Champs requis** : Nom, adresse, catégorie, téléphone, site web, heures, description, photos
- **Description max** : ~250 mots → utiliser MOYENNE
- **Catégorie** : ✅ « Acupuncture » ou « Alternative & Holistic Health Service »
- **Validation** : Email + carte postale OU téléphone
- **Délai approbation** : 1-2 sem si carte, qq jours si téléphone
- **Frais** : Gratuit

#### Fiche 4 — Yelp Canada
- **DA** : 90
- **URL inscription** : https://business.yelp.com/
- **Statut existence** : ❌ Pas de fiche
- **Champs requis** : Nom, adresse, catégorie, téléphone, site web, heures, photos
- **Description max** : ~2500 caractères → utiliser LONGUE
- **Catégorie** : ✅ « Acupuncture » (sous Health & Medical > Traditional Chinese Medicine)
- **Validation** : Email + appel/SMS de confirmation
- **Délai approbation** : Immédiat après validation
- **Frais** : Gratuit (publicité payante optionnelle)
- **Note** : Vérifier d'abord s'il existe une fiche non réclamée (Yelp en crée parfois automatiquement). Si oui, utiliser « Claim this business ».

### 🟢 Niveau 2 — Annuaires santé spécialisés (haute crédibilité)

#### Fiche 5 — OAQ (Ordre des acupuncteurs du Québec)
- **DA** : ~40 mais EXTRÊMEMENT crédible
- **URL** : https://o-a-q.org / portail membre
- **Statut existence** : ✅ Existe — `A-008-24`, acupuncture en groupe : oui. Lieu d'exercice encore inscrit : La Source en Soi (à corriger)
- **Action requise** : Remplacer le lieu d'exercice par Les Vagues, communautés thérapeutiques (2395 rue Beaubien Est) et mettre à jour le champ « site web » → https://acupuncturejudith.ca (portail OAQ)
- **Note** : Le répertoire OAQ ne donne pas de page dédiée par membre. Le backlink est implicite via le résultat de recherche, mais reste très crédible aux yeux de Google car .org officiel.

#### Fiche 6 — Lumino Santé (Sun Life)
- **DA** : 54 — **HAUTE VALEUR pour les patientes Sun Life** (assurance collective)
- **URL inscription** : https://lumino.sunlife.ca/fr/professionnel-de-la-sante/inscription (à vérifier — site en transition)
- **Statut existence** : ⚠️ Profil non revendiqué, rattaché à la clinique « la-source-en-soi-centre » (URL `luminohealth.sunlife.ca/en/health-care-provider-profile/acupuncturist/la-source-en-soi-centre/judith-dufour-savard-1007631-1001446/`). **À corriger** : revendiquer le profil, puis changer le rattachement vers Les Vagues (2395 Beaubien Est) et Éden. Si Lumino ne permet pas de changer de clinique, demander le transfert au support
- **Champs requis** : Numéro OAQ A-008-24, spécialité, adresses, téléphone, description, photo
- **Description max** : ~500-1000 caractères → utiliser MOYENNE ou LONGUE
- **Catégorie** : ✅ « Acupuncturiste » (médecine traditionnelle chinoise)
- **Validation** : Vérification du numéro de membre OAQ (document officiel)
- **Délai approbation** : 5-10 jours ouvrables
- **Frais** : Gratuit pour fiche de base
- **⚠️ Priorité haute** : très utilisé par les patientes avec assurance Sun Life pour trouver des praticiens couverts par leur plan.

#### Fiche 7 — Medimap (via Les Vagues)
- **DA** : 39
- **URL** : https://medimap.ca/for-clinics
- **Statut existence** : ❌ Pas de profil individuel possible — Medimap indexe des cliniques, pas des praticiens
- **Stratégie** : Vérifier si Les Vagues a une fiche Medimap. Si oui, demander à la clinique d'ajouter Judith dans les praticiens. Si non, faible priorité.
- **Note** : Alternative — créer une fiche clinique « Judith Dufour-Savard Ac. » pour la pratique privée. À évaluer post-launch.

### 🟡 Niveau 3 — Annuaires généralistes (1 inscription = 3 fiches !)

#### Fiche 8/9/10 — Pages Jaunes Canada (= 411.ca = Canpages)
- **DA** : ~70 (Yellow Pages Group)
- **URL inscription** : https://www.yellowpages.ca/for-business
- **Statut existence** : ❌ Pas de fiche (vérifié sur PJ.ca, 411.ca, Canpages)
- **🔥 Insight clé** : **Une seule inscription sur Pages Jaunes propage automatiquement la fiche sur 411.ca et Canpages** (même infrastructure). 1 action = 3 fiches.
- **Champs requis** : Nom, adresse, catégorie, téléphone
- **Description max** : ~200-500 caractères → utiliser COURTE ou MOYENNE
- **Catégorie** : ✅ « Acupuncture » (sous Santé > Médecines alternatives)
- **Validation** : Email + possiblement appel
- **Délai approbation** : 3-5 jours ouvrables
- **Frais** : Gratuit (forfaits premium en option)
- **Note** : Privilégier le format « entreprise » plutôt que « personne ». Les données se synchronisent vers 411 et Canpages automatiquement (pas d'inscription séparée nécessaire).

---

## 4. Plateformes ABANDONNÉES (et pourquoi)

| Plateforme | Statut | Raison |
|-----------|--------|--------|
| Goldbook.ca | ❌ Abandonné | Erreur SSL au site, possiblement défaillant ou non maintenu. Pas la peine d'y investir du temps. |
| IC.gc.ca / ISED | ❌ Non applicable | Répertoire des entreprises **incorporées fédéralement**. Une acupunctrice en pratique privée (travailleuse autonome ou EI provinciale) n'y figure pas. Skip sauf si Judith incorpore un jour fédéralement. |

Initialement listés comme « 12 plateformes » dans le LAUNCH_PLAN, ces deux ont été éliminés après vérification. **Liste finale réelle : 8 actions pour 10 fiches** (Pages Jaunes en compte 3).

---

## 5. Workflow de déploiement (jour J — 3 mai)

### J-7 (préparation finale, lundi 26 ou mardi 27 avril)
- [ ] Confirmer avec Judith :
  - [x] Téléphone pro à utiliser sur les annuaires : 514 882-1922 (Judith)
  - [ ] Email pro (jdufoursavard@gmail.com confirmé ?)
  - [ ] Logo perso disponible ?
  - [x] Heures fixes réelles chez Les Vagues (confirmées octobre 2026)
  - [ ] Année de début de pratique exacte
- [ ] Préparer 10 photos haute résolution dans un dossier de soumission (sélectionner depuis `/Users/benoitarchambault/Dropbox (Compte personnel)/Judith/`)
- [ ] Tester acupuncturejudith.ca/reserver
- [ ] Vérifier sur iPhone/Mac si Apple Maps a déjà importé une fiche depuis Google
- [ ] Mettre à jour la fiche OAQ avec acupuncturejudith.ca comme site web

### Jour J (3 mai, après le switch DNS à 08h00)

Soumettre les fiches dans cet ordre (priorité décroissante) :

| # | Plateforme | Temps estimé | Note |
|---|-----------|-------------|------|
| 1 | Bing Places (vérifier auto-import GBP d'abord) | 10-15 min | Si auto-import OK, juste confirmer infos |
| 2 | Apple Maps Connect | 15-20 min | Apple ID + appel de validation |
| 3 | Yelp Canada | 15 min | Vérifier fiche existante d'abord |
| 4 | Lumino Santé | 20 min | Numéro OAQ requis, validation longue |
| 5 | Pages Jaunes (= 411 + Canpages auto) | 15-20 min | 1 inscription, 3 fiches |
| 6 | OAQ — mise à jour site web | 5 min | Juste corriger le champ URL |
| 7 | GBP — Post « Site live » | 5 min | Communication |
| 8 | Medimap — vérifier si Les Vagues y est | 10 min | Si oui, demander à la clinique |

**Temps total estimé** : ~2h pour 8 actions et 10+ fiches actives.

### J+7 (vérification, samedi 10 mai)
- [ ] Vérifier la propagation : Pages Jaunes → 411 → Canpages
- [ ] Confirmer que toutes les fiches sont validées et visibles
- [ ] Faire une recherche Google « Judith Dufour-Savard acupunctrice Montréal » pour voir l'effet cumulé

---

## 6. Notes stratégiques

### Pourquoi soumettre toutes les fiches le même jour
Google détecte les pics de mentions et les interprète comme un signal de pertinence. Si 8-10 nouveaux backlinks apparaissent en 24h pointant vers acupuncturejudith.ca, le signal est plus fort que 1 par mois pendant 10 mois.

### NAP Consistency (Name, Address, Phone)
Google compare les NAP entre les annuaires pour valider qu'il s'agit de la même entreprise. **Utiliser exactement les mêmes valeurs partout** :
- **Nom** : `Judith Dufour-Savard, Ac.` (avec virgule et « Ac. » abrégé pour OAQ)
- **Adresse principale** : `2395 rue Beaubien Est, Montréal, QC, H2G 1N3` (format identique)
- **Téléphone** : `514 882-1922` sur toutes les fiches

Toute variation crée du bruit et dilue le signal SEO.

### Numéro OAQ — Toujours mentionner
Le numéro `A-008-24` doit apparaître dans les fiches professionnelles de santé pour la crédibilité. Lumino Santé l'exige. C'est aussi un signal de confiance pour les patientes.

### Suivi
Créer une feuille Google Sheets avec une ligne par fiche : URL de la fiche, date de soumission, statut, date de validation, lien d'accès admin, identifiants. Permet de relancer si une fiche traîne et de vérifier mensuellement la cohérence des infos.

### Données brutes — Voir aussi
Les détails complets de la recherche CiC sont dans `ANNUAIRES_KIT_DATA.md` à côté de ce fichier. Il contient les sources précises, URLs, et la grille complète des champs requis par plateforme.

---

## 7. Checklist finale avant publication

Avant de déclarer ce kit prêt à exécuter le 3 mai, vérifier que :

- [ ] Toutes les valeurs marquées « 💬 Judith » sont confirmées
- [x] Les heures chez Les Vagues ont été validées par Judith (octobre 2026)
- [ ] La photo professionnelle principale est sélectionnée et redimensionnée si nécessaire
- [ ] Le site acupuncturejudith.ca/reserver fonctionne en production
- [ ] La fiche GBP est totalement à jour (description, services, photos, lien réservation)
- [ ] Apple Maps a été vérifié manuellement sur iPhone/Mac
- [ ] Tu as 2h libres le matin du 3 mai pour soumettre tout en une seule session
