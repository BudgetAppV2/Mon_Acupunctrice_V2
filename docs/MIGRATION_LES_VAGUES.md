# Migration La Source en Soi → Les Vagues — Recensement

*Reconnaissance en lecture seule, 2026-10-12. Aucun fichier modifié à part celui-ci.*
*Contexte : Judith a quitté La Source en Soi (LSSI, 2554 Beaubien Est, Rosemont, 514 750-3735, GRV companyId=104074 / eids=175708) pour la clinique **Les Vagues**. Le statut d'Éden Yoga Pilates (Repentigny) est à confirmer : les occurrences Éden sont recensées à part (colonne « Clinique » = ÉDEN).*

---

## 1. Résumé

| Périmètre | Fichiers | Occurrences |
|---|---|---|
| **Code et contenu en production** (app, components, lib, public, scripts, content, config, CLAUDE/GEMINI.md, tests .py) | **65** | **~375** (après retrait des faux positifs) |
| Documentation de travail `project-docs/` (roadmaps, prompts, audits, SOT) | 130 | ~1 064 |
| `docs/` (stratégie migration Wix, scouting) | 14 | ~246 |
| `subtitle-lab/` (prompts, presets) | 16 | ~123 |
| **Total (fichiers texte suivis par git)** | **241** | **~1 840** |

**Faux positifs écartés** : `credential*` (contient « eden »), `précédent`, et **« Collège de Rosemont »** (l'école de Judith : à **garder**). `content/visual-bank/` (119 fichiers) : correspondances uniquement dans des binaires `.eps`/`.jpg`, à ignorer.

**Recherches sans résultat** : `votre-experience`, `1215 avis` (graphie collée), `openingHours`/`dayOfWeek` (aucun horaire structuré dans le schema), clinique dans `.env.local.example`, et aucun dossier de tests automatisés.

**Point clé d'architecture** : environ 60 % des valeurs NAP passent déjà par **`lib/entity-canonical.mjs`** (`NAP.lssi`, `NAP.eden`, `CONTACT`, `SAMEAS`, `PRICING`, `BIOS`). Ce fichier alimente `rdvUrl.ts` (CLINICS, getRdvUrl), `GlobalJsonLd.tsx`, `generate-llms.mjs` et `generate-llms-full.mjs`. Le reste est **codé en dur** dans environ 30 sections et pages publiques, ce qui demande le plus de travail manuel.

**Décision bloquante** : l'acupuncture sociale est un des 4 **piliers** et elle n'est offerte qu'à LSSI (`hasSocialAcupuncture: true`). Si Les Vagues ne l'offre pas, la règle AEO de CLAUDE.md oblige à retirer ce pilier de `PILIERS`, à dépublier ou rediriger `/services/acupuncture-sociale` et à régénérer llms.txt et llms-full.txt. C'est le plus gros impact potentiel du chantier.

---

## 2. Tableau par fichier

Légende **Type** : ADR adresse · TÉL téléphone · HOR horaires/jours · RDV lien de réservation · AVIS avis/note · TARIF · SEO métadonnées/OG · JSONLD · ÉDIT texte éditorial · IMG image/alt · HUB outil interne (pas le site public) · DOC.
**Clinique** : LSSI / ÉDEN / LES DEUX.

### 2.1 Source canonique (à traiter en premier, se propage automatiquement)

| Fichier | Lignes | Extrait | Type | Clinique | Action proposée |
|---|---|---|---|---|---|
| `lib/entity-canonical.mjs` | 96-120 | `lssi: { name: 'La Source en Soi', streetAddress: '2554 rue Beaubien Est', postalCode: 'H1Y 1G3', neighborhood: 'Rosemont', borough: 'Rosemont—La Petite-Patrie', geo: {45.5408,-73.5823}, daysLabel: 'lundi, mardi, jeudi, vendredi', hasSocialAcupuncture: true, grvSlug: 'lasourceensoi', grvCompanyId: '104074', grvEmployeeId: '175708', grvUrl…, siteUrl: 'https://lasourceensoi.com/', mapsQuery…` | ADR/HOR/RDV/JSONLD | LSSI | Remplacer le bloc par `lesvagues: {…}` (nouvelle clé). Toutes les valeurs sont à fournir (§5). Décider si `hasSocialAcupuncture` reste vrai. |
| `lib/entity-canonical.mjs` | 121-144 | `eden: { … '121 boulevard Industriel', 'J6A 7K4', grvCompanyId '141296', eids '192390', daysLabel 'mercredi, 9 h 00 à 15 h 00' }` | ADR/HOR/RDV | ÉDEN | Garder, modifier ou retirer selon le statut d'Éden. Si Éden reste, revalider le jour et les heures (le mercredi était calé sur l'horaire LSSI). |
| `lib/entity-canonical.mjs` | 150-156 | `CONTACT.phone '+1-514-750-3735'`, `phoneLocal`, `phoneInternational`, `reservationUrl: …lasourceensoi?companyId=104074&eids=175708` | TÉL/RDV | LSSI | Le téléphone de LSSI sert de **téléphone de Judith** partout (JSON-LD, footer, llms) : nouveau numéro requis. Remplacer `reservationUrl`. |
| `lib/entity-canonical.mjs` | 165-186 | `SAMEAS.business: ['https://lasourceensoi.com/', 'https://share.google/…']`, commentaire « page équipe LSSI corrigée » | JSONLD | LSSI | Retirer `lasourceensoi.com`, ajouter le site de Les Vagues (et la page équipe si elle existe). `gbpReviewLink` et `gbpShareUrl` désignent le GBP **de Judith** : à garder, mais vérifier qu'ils restent valides après le changement d'adresse. |
| `lib/entity-canonical.mjs` | 190-197 | `PRICING { adultSession: 100, childSession: 90, socialMin: 35, socialMax: 60 }` | TARIF | LES DEUX | Confirmer les tarifs chez Les Vagues. Sociale : selon la décision pilier. |
| `lib/entity-canonical.mjs` | 201-215 | `BIOS.short/medium/long` : « pratique à La Source en Soi (Rosemont…) », « du lundi au vendredi (sauf le mercredi)… 2554 Beaubien Est… Éden… Repentigny » | ÉDIT/HOR | LES DEUX | Réécrire les 3 bios (utilisées sur les profils externes). |
| `lib/entity-canonical.mjs` | 59-84 | `PILIERS` → `{ id: 'sociale', … }` | JSONLD | LSSI | **Décision pilier sociale** (voir §1). |
| `lib/entity-canonical.d.ts` | 83-84 | `readonly lssi: Clinic; readonly eden: Clinic;` | Type TS | LES DEUX | Renommer la clé (`lesvagues`) et retirer `eden` si besoin. |
| `lib/utils/rdvUrl.ts` | 10, 24-63, 72, 89 | `type Clinic = 'lssi' \| 'eden'`, `CLINICS.lssi {…}`, `CLINICS.eden {phone: ''…}`, défaut `clinic \|\| 'lssi'`, `RDV_URL_BASE = CLINICS.lssi.grvUrl` | RDV/ADR/TÉL | LES DEUX | Renommer la clé, changer la clinique par défaut. Ajouter le téléphone d'Éden ou des Vagues si différent. Consommateurs à vérifier : `app/api/blog/publish`, `publish-youtube`, `generate-blog-captions`, `generate-caption-v2`, `generate-captions`, `components/features/blog/BlogEditor.tsx`, `lib/utils/platformOptimization.ts`, `lib/utils/publishHelpers.ts` (tous via `getRdvUrl`, mis à jour automatiquement). |

### 2.2 JSON-LD et SEO structuré

| Fichier | Lignes | Extrait | Type | Clinique | Action proposée |
|---|---|---|---|---|---|
| `app/(public)/_components/GlobalJsonLd.tsx` | 59-62 | `workLocation: [{@id #lssi, NAP.lssi.name}, {@id #eden…}]` | JSONLD | LES DEUX | Nouvel `@id` (`#lesvagues`). Les valeurs viennent de NAP (automatique), mais les **clés** sont en dur. |
| idem | 83-87 | `areaServed: City NAP.lssi.addressLocality, City NAP.eden…, AdministrativeArea NAP.lssi.borough` | JSONLD | LES DEUX | Adapter le quartier ou l'arrondissement des Vagues. |
| idem | 89-131 | `location: [Place #lssi {address, geo}, Place #eden {…}]` + commentaire « Les avis 4.9/1215 sont attachés à la clinique LSSI » | JSONLD/AVIS | LES DEUX | Renommer `@id` et clés. Mettre à jour le commentaire. |
| `app/(public)/a-propos/page.tsx` | 14, 30-55, 73 | metadata « La Source en Soi (Rosemont) et Eden Yoga Pilates »; JSON-LD local : `name 'La Source en Soi'`, `url lasourceensoi.com`, `streetAddress '2554 rue Beaubien Est'`, `telephone '514-750-3735'`, **`aggregateRating {4.9, reviewCount '1215'}`**; badge `'La Source en Soi'` | JSONLD/AVIS/TÉL/ADR/SEO | LES DEUX | **Priorité haute** : NAP en dur hors de la source canonique, et un `aggregateRating` LSSI encore présent alors que GlobalJsonLd l'a retiré (incohérence déjà existante). Retirer le rating et brancher le reste sur NAP. |
| `app/(public)/reserver/page.tsx` | 11-13, 22, 40-50 | title/description « Rosemont (La Source en Soi) ou Repentigny (Éden) »; durée « acupuncture sociale, Rosemont seulement »; `ReserveAction target: CLINICS.lssi.grvUrl` / `CLINICS.eden.grvUrl` | SEO/JSONLD/RDV | LES DEUX | Réécrire les métadonnées. Les cibles d'action suivront CLINICS. |
| `app/(public)/tarifs/page.tsx` | 12-14, 23, 33, 72-84, 126 | « Consultation privee 100 $/h, acupuncture sociale 35-60 $. Rosemont et Repentigny »; FAQ tarifs (100 $, 90 $, 35-60 $); Offer JSON-LD `35-60 CAD` | TARIF/SEO/JSONLD | LES DEUX | Montants **en dur** (pas branchés sur PRICING). Mettre à jour selon les tarifs des Vagues et la décision sociale. |
| `app/(public)/services/acupuncture-sociale/page.tsx` | 15, 21-22 | « …a Rosemont. Sliding scale 35-60 $… La Source en Soi. », Service JSON-LD « Acupuncture sociale a Rosemont » | SEO/JSONLD/TARIF | LSSI | Selon la décision pilier : réécrire, ou dépublier puis rediriger. |
| `app/(public)/services/fertilite/page.tsx` | 16, 23 | « Acupunctrice a Rosemont… 100 $… La Source en Soi. », Service « …a Rosemont » | SEO/JSONLD/TARIF | LSSI | Réécrire la meta description et le JSON-LD. |
| `app/(public)/services/grossesse/page.tsx` | 15, 22 | idem (100 $, La Source en Soi, Rosemont) | SEO/JSONLD/TARIF | LSSI | idem |
| `app/(public)/services/pediatrie/page.tsx` | 15, 23, 103 | « …90 $, La Source en Soi. », « …a Rosemont », lien « Acupuncture sociale (35-60 $) » | SEO/JSONLD/TARIF | LSSI | idem |
| `app/(public)/services/page.tsx` | 6, 8 | title « Acupuncture a Rosemont, Montreal », « La Source en Soi, Beaubien Est. » | SEO | LSSI | Réécrire. |
| `app/(public)/page.tsx` | 13, 16 | title « …— Rosemont & Repentigny », « Clinique La Source en Soi a Rosemont. 4,9/5 sur Google. » | SEO/AVIS | LES DEUX | Réécrire (page d'accueil, priorité SEO). |
| `app/(public)/layout.tsx` | 36, 50 | description OG « En partenariat avec la clinique La Source en Soi à Rosemont », alt OG « acupunctrice à Rosemont » | SEO/IMG | LSSI | Réécrire (s'applique à toutes les pages publiques). |
| `app/(public)/faq/page.tsx` | 15, 17 | « Acupuncture a Rosemont, Montreal », « La Source en Soi, Rosemont » | SEO | LSSI | Réécrire. |
| `app/(public)/contact/page.tsx` | 11, 13 | title et description « Rosemont (La Source en Soi) et Repentigny (Éden) » | SEO | LES DEUX | Réécrire. |

### 2.3 Pages et sections publiques (texte en dur)

| Fichier | Lignes | Extrait | Type | Clinique | Action proposée |
|---|---|---|---|---|---|
| `app/(public)/contact/page.tsx` | 19-22, 62-100, 142-150 | `MAPS_LSSI_EMBED/DIR`, carte LSSI (adresse, tél, « lasourceensoi.com », jours), **« Métro Beaubien (ligne orange) — 10 minutes à pied. Stationnement sur rue. »**, **« 4,9/5 sur 1 215 avis Google »**, CTA « Réserver à Rosemont », iframe « Carte Google Maps — La Source en Soi » | ADR/TÉL/HOR/RDV/AVIS/ÉDIT | LSSI | Refaire la carte clinique : accès en transport et stationnement à fournir, retirer l'avis, renommer la ville dans le CTA. |
| idem | 102-130, 155-163 | carte Éden, « Repentigny, QC » en dur, « edenyogapilates.ca » en dur, CTA « Réserver à Repentigny », iframe Éden | ADR/RDV | ÉDEN | Selon le statut d'Éden. |
| `app/(public)/reserver/page.tsx` | 89-113, 163, 177, 210 | bloc « ROSEMONT — MONTRÉAL », `event="Reservation Rosemont"`, « Réserver à Rosemont → », **« Appelez La Source en Soi et demandez Judith Dufour-Savard »**, « (métro Beaubien) », bouton « Rosemont » | ADR/TÉL/RDV/ÉDIT | LSSI | Réécrire. Le nom d'événement Plausible change aussi (voir §3). |
| idem | 118-142, 178, 211 | bloc « REPENTIGNY », `event="Reservation Repentigny"`, bouton « Repentigny » | RDV | ÉDEN | Selon le statut d'Éden. |
| `app/(public)/_sections/AboutCliniqueSection.tsx` | 17-61 | « Mon cabinet principal est à La Source en Soi… sur Beaubien Est à Rosemont », carte « 2554 rue Beaubien Est », « Lundi, mardi, jeudi, vendredi », « 514 750-3735 », lien `lasourceensoi.com`, maps « La+Source+en+Soi+Rosemont », **« 4,9/5 sur 1 215 avis Google »** | ADR/TÉL/HOR/AVIS/ÉDIT | LSSI | Tout en dur : réécrire la section et la brancher sur NAP. |
| idem | 23-24, 65-79 | « Le mercredi, je pratique à Éden Yoga Pilates », « 121 Boulevard Industriel, suite 225 » (en dur, « suite » au lieu de « local »), « Mercredi », `edenyogapilates.ca` | ADR/HOR | ÉDEN | Selon le statut d'Éden. |
| `app/(public)/_sections/HeroSection.tsx` | 24, 28, 39, 65, 74 | « Membre OAQ · Rosemont », H1 « Acupunctrice à Rosemont, Montréal », « à Rosemont et à Repentigny », **« 2554 Beaubien Est »**, alt « dans son cabinet a La Source en Soi a Rosemont » | ÉDIT/SEO/ADR/IMG | LES DEUX | Réécrire le H1 (impact SEO majeur), la ligne d'adresse et l'alt. |
| `app/(public)/_sections/AboutHeroSection.tsx` | 27, 32-33 | « Rosemont et Repentigny », « Mon cabinet principal est à La Source en Soi, sur Beaubien Est », « le mercredi à Éden » | ÉDIT/HOR | LES DEUX | Réécrire. |
| `app/(public)/_sections/CtaFinalSection.tsx` | 34, 45, 49, 53 | « À Rosemont ou à Repentigny », « Rosemont — La Source en Soi », « Repentigny — Éden », « 514 750-3735 » | ÉDIT/TÉL | LES DEUX | Réécrire. |
| `app/(public)/_sections/TemoignagesSection.tsx` | 38, 47, 53 | « Avis Google publics de la clinique La Source en Soi… 4,9/5 sur 1 215 avis. », 2 avis signés « Avis Google · La Source en Soi » | AVIS | LSSI | Retirer le 4,9/1 215. **Décider** si les 2 avis (portant sur Judith, publiés sur la fiche LSSI) restent avec leur source d'origine ou s'ils sont retirés (zone grise OAQ, R7). |
| `app/(public)/_sections/ServicePediatrieTemoignageSection.tsx` | 51 | « Avis Google sur la clinique La Source en Soi » | AVIS | LSSI | Même décision. |
| `app/(public)/_sections/ServiceFertiliteBioSection.tsx` | 26-27 | « acupunctrice à La Source en Soi, sur Beaubien Est à Rosemont » | ÉDIT | LSSI | Réécrire. |
| `app/(public)/_sections/ServiceFertiliteHeroSection.tsx` | 49, 52 | « FERTILITÉ · ROSEMONT & REPENTIGNY », H1 « …à Rosemont et Montréal » | ÉDIT/SEO | LES DEUX | Réécrire (H1). |
| `app/(public)/_sections/ServiceGrossesseHeroSection.tsx` | 46 | « GROSSESSE & PÉRINATALITÉ · ROSEMONT & REPENTIGNY » | ÉDIT | LES DEUX | Réécrire. |
| `app/(public)/_sections/ServicePediatrieHeroSection.tsx` | 46 | « PÉDIATRIE · ROSEMONT & REPENTIGNY » | ÉDIT | LES DEUX | Réécrire. |
| `app/(public)/_sections/ServiceSocialeHeroSection.tsx` | 46, 49, 63, 80 | « ACUPUNCTURE SOCIALE · ROSEMONT », H1 « …à Rosemont — tarif solidaire », « 35 $ à 60 $ », alt « Espace acupuncture sociale La Source en Soi » (sur la photo `judith-portrait-03.webp`) | ÉDIT/TARIF/IMG | LSSI | Selon la décision pilier. |
| `app/(public)/_sections/ServiceSocialeCtaSection.tsx` | 35, 43 | **URL GRV LSSI codée en dur** `…lasourceensoi?companyId=104074&eids=175708`, « Disponible uniquement à Rosemont (La Source en Soi) » | RDV/ÉDIT | LSSI | Lien hors de la source canonique : le remplacer (ou utiliser getRdvUrl). |
| `app/(public)/_sections/ServiceSocialeInfosSection.tsx` | 29, 49, 51 | « 35 $ à 60 $ », « offert uniquement à la clinique La Source en Soi, à Rosemont », TODO horaires sociale | TARIF/ÉDIT/HOR | LSSI | Selon la décision pilier. |
| `app/(public)/_sections/ServiceSocialeConvictionSection.tsx` | 41 | « une des rares acupunctrices à Rosemont à offrir ce service » | ÉDIT | LSSI | Selon la décision pilier et le quartier des Vagues. |
| `app/(public)/_sections/ServiceSocialeFormatSection.tsx` | 20 | `Tarif: '35-60 $'` | TARIF | LSSI | idem |
| `app/(public)/_sections/ServiceFertiliteCtaSection.tsx` | 46 | « Disponible à Rosemont (La Source en Soi) et à Repentigny (Éden) » | ÉDIT | LES DEUX | Réécrire. |
| `app/(public)/_sections/ServiceGrossesseCtaSection.tsx` | 43 | idem | ÉDIT | LES DEUX | idem |
| `app/(public)/_sections/ServicePediatrieCtaSection.tsx` | 43 | idem | ÉDIT | LES DEUX | idem |
| `app/(public)/_sections/ServiceFertiliteInfosSection.tsx` | 37 | « 100 $ » | TARIF | — | Confirmer. |
| `app/(public)/_sections/ServiceGrossesseInfosSection.tsx` | 29 | « 100 $ la séance d'une heure » | TARIF | — | Confirmer. |
| `app/(public)/_sections/ServicePediatrieInfosSection.tsx` | 30 | « 90 $ la séance » | TARIF | — | Confirmer. |
| `app/(public)/_sections/AboutSection.tsx` | 53 | `<Badge label="La Source en Soi" />` | ÉDIT | LSSI | Remplacer. |
| `app/(public)/_components/SiteHeader.tsx` | 28 | « ACUPUNCTRICE · ROSEMONT » | ÉDIT | LSSI | Remplacer (en-tête global). |
| `app/(public)/_components/SiteFooter.tsx` | 27, 87-88, 121 | « Acupunctrice à Rosemont et Repentigny », liste des cliniques, ligne légale « La Source en Soi (Rosemont) · Éden Yoga Pilates (Repentigny) » | ÉDIT/ADR | LES DEUX | Remplacer (pied de page global). |
| `app/(public)/_components/ClinicBadge.tsx` | 2, 21-38 | maps « La+Source+en+Soi+Rosemont », « 4,9 / 5 — 1 200+ avis Google » | AVIS | LSSI | **Composant non importé** (code mort) : candidat à la suppression. |
| `app/(public)/_sections/_lab/ServiceFertiliteInfosSectionLab.tsx` | 41-46 | « Avis Google… sur 1 215 avis La Source en Soi. » | AVIS | LSSI | Fichier « lab » : vérifier s'il est routé, sinon le supprimer ou l'ignorer. |
| `app/(public)/_sections/_lab/ServiceFertiliteHeroSectionLab.tsx` | 114 | « ROSEMONT & REPENTIGNY » | ÉDIT | LES DEUX | idem |
| `app/(public)/_sections/_lab/ServiceFertiliteBioSectionLab.tsx` | 25 | « acupunctrice à La Source en Soi » | ÉDIT | LSSI | idem |

### 2.4 Fichiers AEO générés et leurs générateurs

| Fichier | Lignes | Extrait | Type | Clinique | Action proposée |
|---|---|---|---|---|---|
| `scripts/generate-llms.mjs` | 40, 70-81, 108, 119, 141-142, 149 | gabarits `${NAP.lssi.*}`, `${NAP.eden.*}`, « — clinique principale », « — clinique secondaire », « pas d'acupuncture sociale offerte à Éden », **lien en dur** `${NAP.lssi.siteUrl}equipe/judith-dufour-savard/` (« Page équipe à La Source en Soi »), version anglaise « Mon, Tue, Thu, Fri » / « Wed 9am–3pm » **en dur** | JSONLD/HOR/ÉDIT | LES DEUX | Renommer les clés NAP, retirer la page équipe LSSI, mettre les jours anglais à jour (non dérivés de NAP). |
| `scripts/generate-llms-full.mjs` | 62, 89, 147, 151-155 | `${NAP.lssi.*}`; **phrase en dur** l. 89 « …La Source en Soi (Rosemont, Montréal). Elle est offerte uniquement à La Source en Soi »; PRICING | ÉDIT/TARIF/ADR | LES DEUX | Renommer les clés et réécrire la l. 89. |
| `public/llms.txt` | 5, 33-48, 71, 79, 101-109 | sortie générée (LSSI, Éden, tél, GRV, page équipe LSSI) | (généré) | LES DEUX | **Ne pas éditer à la main** : régénérer. |
| `public/llms-full.txt` | 3-7, 25, 109-118 | sortie générée | (généré) | LES DEUX | Régénérer. |

### 2.5 Contenu markdown (source de Firestore)

| Fichier | Lignes | Extrait | Type | Clinique | Action proposée |
|---|---|---|---|---|---|
| `content/ressources/acupuncture-grossesse-montreal.md` | 102 | « Je pratique a La Source en Soi a Rosemont (2554 rue Beaubien Est…) du lundi au vendredi sauf mercredi, et a Eden… (121 boulevard Industriel) le mercredi » | ADR/HOR/ÉDIT | LES DEUX | Réécrire, puis **ré-injecter** dans Firestore (`inject.mjs`). |
| `content/ressources/acupuncture-menopause.md` | 9, 123 | metaDescription « …acupunctrice à Rosemont », paragraphe LSSI + Éden | SEO/HOR | LES DEUX | Réécrire et ré-injecter (si publiée). |
| `content/faq/comment-se-passe-seance-acupuncture.md` | 24 | « Je pratique à La Source en Soi (Rosemont) du lundi au vendredi sauf mercredi, et à Éden… le mercredi. » | HOR/ÉDIT | LES DEUX | Réécrire et ré-injecter. |
| `content/README.md` | 246 | « Mentionner les 2 cliniques quand pertinent (LSSI Rosemont + Éden Repentigny) » | DOC | LES DEUX | Mettre la consigne éditoriale à jour. |
| `scripts/seo-geo/source-resources/01-…fertilite-montreal.md` | 22-28, 41, 92, 192-201 | titre SEO « …Rosemont », metaDesc, alt image « cabinet lumineux de Rosemont », « clinique La Source en Soi sur Beaubien Est », « clinique familiale… sage-femmes, doulas, ostéopathes » | SEO/ÉDIT/IMG | LSSI | Sources des **ressources déjà publiées dans Firestore** (via `import-seo-geo-content.mjs` / `publish-all-resources.mjs`). Réécrire puis ré-importer, ou modifier directement dans le CMS. |
| `scripts/seo-geo/source-resources/02-…grossesse-montreal.md` | 22-41, 136, 200, 224 | idem + avis « Ingrid M., avis Google sur la clinique La Source en Soi » | SEO/ÉDIT/AVIS | LSSI | idem |
| `scripts/seo-geo/source-resources/03-…pediatrique….md` | 22-43, 121-123, 184, 208 | idem + avis « Parent d'un enfant de 6 ans… La Source en Soi » | SEO/ÉDIT/AVIS | LSSI | idem |
| `scripts/seo-geo/source-resources/04-…anxiete.md` | 25-43, 134-136, 191, 215 | idem + section « La Source en Soi : un lieu en soi » (texte qui joue sur le nom de la clinique) + avis « Alexandra P. » | SEO/ÉDIT/AVIS | LSSI | idem (section à réécrire entièrement) |
| `scripts/seo-geo/source-resources/05-…sociale-montreal.md` | 13-43, 120-125, 210 | Rosemont, « tarif réduit », « La Source en Soi, Beaubien Est », « L'acupuncture sociale chez La Source en Soi » | SEO/ÉDIT/TARIF | LSSI | Selon la décision pilier. |

### 2.6 Hub interne (outils de publication sociale, pas le site public)

| Fichier | Lignes | Extrait | Type | Clinique | Action proposée |
|---|---|---|---|---|---|
| `lib/utils/publishHelpers.ts` | 153 | `clinicUsername: … \|\| 'lasourceensoi'` (mention Instagram en story) | HUB | LSSI | Remplacer par le compte IG des Vagues (ou supprimer la mention). |
| `functions-python/main.py` | 22, 93 | `DEFAULT_CLINIC = os.environ.get("DEFAULT_CLINIC", "lasourceensoi")` | HUB | LSSI | Valeur par défaut, plus la variable d'environnement de la Cloud Function (hors repo). |
| `components/features/publish/PublishSheet.tsx` | 106 | « Ajoute le tag @lasourceensoi dans Instagram » | HUB | LSSI | Changer l'aide affichée à Judith. |
| `lib/utils/storyImageGenerator.ts` | 2, 69 | `ctx.fillText('LA SOURCE EN SOI', …)` (branding des stories de blog, utilisé par `useBlogSequence`) | HUB/IMG | LSSI | Remplacer le branding. |
| `lib/data/imageEditorTemplates.ts` | 2, 21, 98-101 | template « La Source en Soi », `LOGO_URL = '/images/logo-la-source-en-soi.png'`, texte `@LASOURCEENSOI` | HUB/IMG | LSSI | Remplacer le template et le logo. |
| `public/images/logo-la-source-en-soi.png` | — | logo LSSI | IMG | LSSI | Remplacer par le logo des Vagues (autorisation requise) ou supprimer. |
| `lib/data/textStylePresets.ts` | 6, 120, 151 | presets « La Source en Soi / wellness » | HUB | LSSI | Renommer (cosmétique). |
| `components/features/image-editor/panels/TemplatesPanel.tsx` | 76 | libellé « La Source en Soi » | HUB | LSSI | Renommer. |
| `components/features/image-editor/panels/ColorPanel.tsx` | 193 | palette « La Source en Soi » | HUB | LSSI | Renommer (la palette peut rester). |
| `test_canva_story.py` | 3, 18-19, 78-80 | `CLINIC_USERNAME = "lasourceensoi"`, lien GRV | HUB/test | LSSI | Script de test manuel : mettre à jour ou supprimer. |
| `test_debug_story.py` | 33, 54, 61 | `@lasourceensoi`, lien GRV | HUB/test | LSSI | idem |

### 2.7 Documentation et instructions d'agents (à mettre à jour, sans impact production)

| Fichier | Lignes | Extrait | Action proposée |
|---|---|---|---|
| `CLAUDE.md` | 57, 78, 88-89, 96-98 | « 1 215 avis 4,9/5 », R6 « adresse principale LSSI », bloc « Deux cliniques » (NAP + GRV) | Mettre à jour : c'est le contexte lu à chaque session. |
| `GEMINI.md` | 67, 234, 239 | « @lasourceensoi », « Acupunctrice solo à La Source en Soi », « Go Rendez-Vous : lasourceensoi, employeeId 7556837 » | Mettre à jour (l'employeeId diffère d'eids=175708 : donnée périmée). |
| `project-docs/02_ROADMAP/content-strategy/ENTITY_SOURCE_OF_TRUTH.md` | ~64 occ. | SOT d'entité | **Doit être mis à jour en même temps que `entity-canonical.mjs`** (règle du fichier). |
| `docs/migration-wix/CLAUDE.md` | 10 occ. | contexte permanent de migration | Mettre à jour. |
| `project-docs/02_ROADMAP/migration-wix/ANNUAIRES_KIT.md`, `PLAYBOOK_ANNUAIRES_JOUR_J.md` | 33 et 35 occ. | NAP universel, descriptions copier-coller, checklist des 8 fiches | Mettre à jour : c'est **la checklist de l'étape hors repo** (§3). |
| `project-docs/02_ROADMAP/LAUNCH_PLAN.md`, `KEYWORD_BACKLOG.md`, `PROOF_GRAPH_OPERATIONAL_PLAN.md`, `PROMPT_CC_GBP_OPTIMIZATION.md` | 75 / — / 29 / 32 occ. | stratégie locale centrée sur Rosemont | Réviser la stratégie de mots-clés locaux (Rosemont → quartier des Vagues). |
| Autres `project-docs/` (environ 120 fichiers : PROMPT_CC_*, HANDOFF_*, audits, `_archive/`, `_completed/`), `docs/` (scouting, plans éditoriaux v0.2/v0.3), `subtitle-lab/prompts/` (16) | ~1 300 occ. | historique | **Ne pas réécrire** (archives datées). Option : une note en tête de `HANDOFF` indiquant que LSSI n'est plus d'actualité depuis octobre 2026. |

---

## 3. Éléments qui vivent hors du repo (détectés par références dans le code)

| Élément | Référence dans le code | Ce qui doit changer |
|---|---|---|
| **Firestore `ressources`** | `scripts/seo-geo/publish-all-resources.mjs`, `import-seo-geo-content.mjs`, `content/scripts/inject.mjs` | Les 5 ressources issues de `scripts/seo-geo/source-resources/` et les ressources de `content/ressources/` contiennent du texte LSSI, Rosemont et Éden, ainsi que des avis attribués à LSSI. Après injection, la copie Firestore fait foi pour le site. |
| **Firestore `faq`** | `scripts/seo-geo/publish-all-faq.mjs`, `content/faq/*` | Au minimum `comment-se-passe-seance-acupuncture`. D'autres FAQ créées dans le Hub peuvent mentionner LSSI : à **interroger** (non visible dans le repo). |
| **Firestore `publicBlog`** | `app/sitemap.ts`, `scripts/migrate-wix-blog.mjs`, `app/api/blog/publish/route.ts` | Articles migrés de Wix et articles du Hub : le contenu peut mentionner LSSI ou Rosemont. Le champ **`ctaUrl`** est stocké au moment de la publication (`getRdvUrl(...)` → ancienne URL GRV LSSI figée dans chaque document). |
| **Firestore `contentItems` / `calendarSlots`** | `/api/cron/publish`, `generate-captions`, `platformOptimization.ts` | Les légendes déjà générées contiennent l'ancienne URL GRV LSSI en dur. **Le cron publiera ces anciens liens** pour tout post planifié (`distributionStatus == 'scheduled'`). |
| **GoRendezVous** | `NAP.lssi.grv*`, `NAP.eden.grv*` | Nouveaux companyId, eids et slug des Vagues. Fermeture ou désactivation du profil LSSI (eids 175708) : décision de LSSI. Éden : à confirmer. |
| **Google Business Profile (de Judith)** | `SAMEAS.gbpShareUrl`, `gbpReviewLink`, décision R6 « adresse principale LSSI » | Changer l'adresse principale, les horaires, le téléphone et le lien de réservation. Vérifier que les avis (6 à ce jour d'après GlobalJsonLd) sont conservés. Un changement d'adresse peut déclencher une revérification. |
| **GBP de La Source en Soi** | avis 4,9/1 215 cités | Pas sous notre contrôle. Demander à LSSI de retirer Judith de sa fiche et de sa page équipe. |
| **Wikidata Q139677208** | `ENTITY.wikidataId` | Mettre à jour les déclarations de lieu de travail ou d'employeur si elles mentionnent LSSI (à vérifier sur la page). |
| **Annuaires** | `ANNUAIRES_KIT.md`, `PLAYBOOK_ANNUAIRES_JOUR_J.md` | OAQ (profil, site web), Bing Places, Apple Maps, Yelp Canada, Pages Jaunes (3 fiches), Lumino Santé (Sun Life), **Medimap (inscrit « via LSSI »)**, HealthDoc (mentionné « en attente »). |
| **lasourceensoi.com, page équipe** | `llms.txt` → `/equipe/judith-dufour-savard/` | Lien sortant à retirer chez nous. Demander à LSSI de retirer la page ou d'y mettre une redirection. |
| **Réseaux sociaux** | `SAMEAS.social` | Bio Instagram et lien en bio, Facebook (adresse, bouton RDV), YouTube (descriptions qui contiennent l'URL GRV LSSI : `publish-youtube`), LinkedIn (expérience). |
| **Instagram @lasourceensoi** | `publishHelpers.ts`, `PublishSheet.tsx`, `functions-python` | Plus de tag ni de collaboration avec ce compte. |
| **Variable d'env de la Cloud Function** | `DEFAULT_CLINIC` (functions-python) | Mettre à jour la valeur côté Firebase/GCP. **Aucune variable liée à la clinique dans Vercel** ni dans `.env.local.example`. |
| **Plausible** | `event="Reservation Rosemont"` / `"Reservation Repentigny"` | Les objectifs nommés dans Plausible Cloud seront à renommer ou recréer. L'historique est conservé sous l'ancien nom. |
| **Google Search Console** | — | Après déploiement : inspection et réindexation des pages principales, suivi des requêtes « Rosemont ». |
| **Domaine grossesseacupuncture.ca / mon-acupunctrice.ca** | décision R8 | Vérifier qu'aucune page ou redirection externe ne pointe vers LSSI. |

---

## 4. Dépendances d'ordre

1. **Données fournies (§5) → tout le reste.** Rien ne peut être codé sans NAP, GRV, téléphone et tarifs des Vagues, plus le statut d'Éden.
2. **Décision « pilier acupuncture sociale »** → avant de toucher `PILIERS`, les pages `/services/acupuncture-sociale`, `/tarifs` et les sections Sociale*.
3. **`entity-canonical.mjs` + `entity-canonical.d.ts` + SOT** (ensemble) → puis `rdvUrl.ts` (renommer la clé `lssi`) → puis tous les consommateurs de `CLINICS.lssi` et `NAP.lssi` (contact, reserver, GlobalJsonLd, générateurs). Renommer la clé casse la compilation tant que tous les consommateurs ne sont pas migrés : un seul lot atomique.
4. **Contenu des pages avant JSON-LD et llms** : la règle AEO interdit de déclarer dans le schema ou les llms un lieu ou service qui n'apparaît pas encore sur le site. Le JSON-LD (automatique via NAP) doit donc partir **dans le même déploiement** que le texte visible.
5. **`generate-llms.mjs` puis `generate-llms-full.mjs`** après la mise à jour de NAP et des gabarits. Ne jamais éditer `public/llms*.txt` à la main.
6. **Markdown `content/` → `inject.mjs`** (Firestore) → revalidation ISR (approbation dans `/contenu` ou `revalidatePath`). Les ressources passent par `pending` → `published`, ce qui demande une approbation de Judith.
7. **Redirections avant suppression de pages** : si `/services/acupuncture-sociale` est retirée, ajouter la redirection 308 dans `next.config.mjs` (`redirects()`, l. 54-80) **dans le même déploiement**, et retirer l'URL de `app/sitemap.ts` (l. 60).
8. **Firestore `contentItems` planifiés** : à corriger **avant** le prochain passage du cron (12 h UTC) qui suit la désactivation du profil GRV LSSI.
9. **Site déployé → GBP → annuaires → Wikidata** : changer l'adresse GBP une fois le site à jour, pour que Google trouve la même NAP partout. Les annuaires utilisent ensuite le NAP du kit mis à jour.
10. **CLAUDE.md, docs agents** : à la fin, pour refléter l'état réel.

---

## 5. Données confirmées (L0, 2026-10-12)

**Les Vagues : remplace `lssi` comme clinique principale, sous la clé `lesvagues`**
- Nom : **« Les Vagues, communautés thérapeutiques »** (toujours le nom complet, jamais « Les Vagues » seul)
- Adresse : 2395 rue Beaubien Est, Montréal (QC) H2G 1N3. Quartier : Rosemont. Arrondissement : Rosemont—La Petite-Patrie. **Toutes les mentions « Rosemont » restent.**
- Geo : 45.5481818, -73.5924854
- Téléphone de la clinique : aucun publié
- Site : https://lesvaguesct.com/. Instagram : `lesvagues.beaubien`
- GRV : slug `bhavanalaclinique`, companyId `106503`, eids `196572`. URL : `https://www.gorendezvous.com/bhavanalaclinique?companyId=106503&eids=196572`
- ⚠️ « Bhavana » (maison mère qui gère le GRV) ne doit **jamais** apparaître dans un texte visible, les llms ou le JSON-LD. Il n'apparaît que dans l'URL.
- mapsQuery : `Judith+Dufour-Savard+Acupuncteure,+2395+Rue+Beaubien+E,+Montréal,+QC+H2G+1N3` (la fiche GBP de Judith est déjà à cette adresse)
- Accès : métro Beaubien (ligne orange), bus 18 Beaubien. Stationnement sur rue.
- Acupuncture sociale : **oui**. Le pilier reste, sans redirection ni retrait.
- Horaires : lundi 8 h 30–15 h (privé) · mardi 13 h–17 h (sociale) et 18 h–21 h (privé) · mercredi 8 h 30–11 h 30 (sociale) · vendredi 8 h 30–12 h (sociale). daysLabel : `lundi, mardi, mercredi, vendredi`. EN : `Mon, Tue, Wed, Fri`.

**Éden Yoga Pilates : reste clinique secondaire.** Passe au **jeudi 9 h–15 h** (au lieu du mercredi). EN : `Thu 9am–3pm`. Téléphone inconnu, laissé vide.

**Contact Judith** : `+1-514-882-1922` / `514 882-1922` (cellulaire). Remplace le 514 750-3735 partout. `reservationUrl` = URL GRV des Vagues. Dans le JSON-LD, `telephone` figure seulement sur Person et le business, pas sur `Place #lesvagues`.

**Tarifs** : adulte 105 $ (au lieu de 100), enfant 90 $, sociale 35–65 $ (au lieu de 35–60).

**SAMEAS.business** : retrait de lasourceensoi.com, ajout de https://lesvaguesct.com/. gbpShareUrl et gbpReviewLink sont conservés.

**Décisions**
- Les 3 avis Google de la fiche LSSI : **retirés**, ainsi que toute mention 4,9 / 1 215 avis.
- Phrase « Anciennement à la clinique La Source en Soi (2024–2026) » : seulement sur /a-propos (AboutClinique) et /contact.
- `ClinicBadge.tsx` et `_sections/_lab/*` : supprimés.
- « Collège de Rosemont » : conservé.
- GEMINI.md : employeeId 7556837 → 196572.

## 6. Ordre d'exécution recommandé (lots validables séparément)

| Lot | Contenu | Validation |
|---|---|---|
| **L0 — Données et décisions** ✅ 2026-10-12 | Remplir §5. Trancher le pilier sociale, le sort d'Éden et les avis. | Benoit + Judith |
| **L1 — Gel des fuites actives** ✅ `8fe0d49` | Firestore : 0 post planifié ; 7 articles `publicBlog` (`content`) + 1 `contentItem` publié migrés vers le GRV Vagues via `scripts/migrate-rdv-url.mjs` (8 docs, 9 champs). Tag Instagram `lesvagues.beaubien` (`publishHelpers.ts`, `functions-python/main.py`). | Relance du script = 0 changement |
| **L2 — Source canonique (atomique)** ✅ `4f62279` | `entity-canonical.mjs` + `.d.ts` + SOT, `rdvUrl.ts` (clé renommée), `GlobalJsonLd.tsx`, `contact/page.tsx`, `reserver/page.tsx`, `a-propos/page.tsx` (NAP en dur + retrait de `aggregateRating`), `ServiceSocialeCtaSection` (URL GRV en dur). | `npm run build` OK, Rich Results Test sur `/` et `/a-propos` |
| **L3 — Texte public global** ✅ `3e45d6b` | Header, footer, `layout.tsx` (OG), Hero, AboutHero, AboutClinique, CtaFinal, Temoignages, badges. | Relecture mobile 375px de toutes les pages |
| **L4 — Pages services et tarifs** ✅ `b18ec2c` | Métadonnées et JSON-LD de `/services/*`, `/tarifs`, `/faq`, `/`, sections Hero/Cta/Infos/Bio. Pilier sociale selon L0 (+ redirection et sitemap si retrait). | Relecture de Judith (terminologie OAQ) |
| **L5 — AEO** ✅ `4273a41` | Gabarits `generate-llms.mjs` (page équipe, jours EN) et `generate-llms-full.mjs` (l. 89), puis régénération des deux fichiers. | `grep -i "source en soi\|beaubien\|750-3735\|104074"` sur `public/` = 0 |
| **L6 — Contenu Firestore** ⏸ en attente de Judith (§7) | Réécrire `content/ressources/*`, `content/faq/*`, `scripts/seo-geo/source-resources/*` → injecter → approbation de Judith dans `/contenu`. Audit des blogs et FAQ créés dans le Hub. | Pages ressources et FAQ en ligne sans mention LSSI |
| **L7 — Hub interne** ✅ `bfff91b` (logo provisoire, §7) | `publishHelpers`, `PublishSheet`, `storyImageGenerator`, templates et logo de l'éditeur d'image, presets, scripts de test .py. | Judith génère une story test |
| **L8 — Hors repo** | GBP, GRV, Wikidata, 8 annuaires, réseaux sociaux, Plausible, Search Console, demandes à LSSI. Dans l'ordre du §4.9. | Checklist du kit annuaires mise à jour |
| **L9 — Docs** ✅ | `CLAUDE.md`, `GEMINI.md`, `docs/migration-wix/CLAUDE.md`, `content/README.md`, `ANNUAIRES_KIT`/`PLAYBOOK`, stratégie mots-clés locaux. Note d'obsolescence en tête des handoffs. | — |
| **L10 — Sécurité** (hors migration, à traiter séparément) | `app/api/cms/approve/route.ts` : la route accepte un POST **sans authentification** (n'importe qui peut publier un contenu `pending` ou déclencher le nettoyage Storage de M2A). Elle **réécrit aussi `publishedAt`** à chaque appel, ce qui fausse les dates des articles déjà publiés (re-approbation, revalidation). Vérifier aussi `unpublish`, `delete`, `comment`, `submit`. | Appel sans jeton → 401 ; re-approbation qui conserve `publishedAt` |

**Contrôle final suggéré** : refaire la recherche initiale (`source en soi|sourceensoi|lssi|beaubien|750-3735|104074|175708|rosemont`) sur `app/ components/ lib/ public/ scripts/ content/`. Seules doivent rester les mentions volontaires (« Collège de Rosemont », éventuel « anciennement à… »).

## 7. Points de relecture ouverts (après L1–L5, L7, L9)

| # | Point | Bloque | Qui |
|---|---|---|---|
| 1 | **Durée de l'acupuncture sociale** : `/reserver` annonce « 30 à 45 minutes », la page `/services/acupuncture-sociale` « 60 minutes ». Incohérence antérieure à la migration, à trancher avant de réécrire l'article de blog sur l'acupuncture sociale. | L6 | Judith |
| 2 | **Témoignages** : la section témoignages de l'accueil et le témoignage de la page pédiatrie ont été retirés (avis LSSI). `TestimonialCard.tsx` est conservé mais inutilisé. À réintroduire seulement avec des avis du GBP de Judith. | — | Judith / Benoit |
| 3 | **Équipe des Vagues** : `AboutCliniqueSection` décrivait l'équipe de LSSI (ostéopathes, doulas…), remplacée par un paragraphe neutre. Les ressources `scripts/seo-geo/source-resources/01` et `02` décrivent aussi l'« écosystème » LSSI. Composition réelle de l'équipe des Vagues à fournir. | L6 | Judith |
| 4 | **Logo** : `public/images/logo-les-vagues.png` est un PNG transparent 400×400 provisoire (le template « Les Vagues » de l'éditeur d'image n'affiche donc aucun logo). Remplacer par le vrai logo de la clinique, fond transparent, même nom de fichier. | — | Judith / Les Vagues |
| 5 | **Code postal** : OpenStreetMap géocode le 2395 Beaubien Est en H1Y 1G2 ; publié H2G 1N3 (donnée confirmée, identique au GBP). Vérifier sur Postes Canada avant L8. | L8 | Benoit |
| 6 | **Relecture mobile 375 px** non faite en L3/L4 (redimensionnement Chrome impossible). | Déploiement | Benoit |
| 7 | **Lumino** : profil rattaché à « la-source-en-soi-centre » — revendiquer puis corriger (procédure dans le kit annuaires). | L8 | Benoit / Judith |
| 8 | **Variable `DEFAULT_CLINIC`** de la Cloud Function `publish-story-instagrapi` à passer à `lesvagues.beaubien` (commande gcloud fournie en L1). | Stories | Benoit |

