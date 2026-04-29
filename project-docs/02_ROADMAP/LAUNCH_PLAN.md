# Plan de lancement — acupuncturejudith.ca
## Version 3.0 — 29 avril 2026

**Approche** : On traite le lancement du site comme un événement.
En événementiel, tu ne te contentes pas d'ouvrir les portes — tu crées un build-up.

---

## TIMELINE — Vue d'ensemble

```
J-21 à J-14  │ FONDATIONS        │ Construire, produire, préparer
J-14 à J-7   │ BUILD-UP           │ Fiches, contacts, partenariats
J-7  à J-1   │ BUZZ               │ Teaser social, confirmer les partenaires
J-0          │ LANCEMENT          │ Switch DNS, tout publier simultanément
J+1 à J+7   │ AMPLIFICATION      │ Pousser, mesurer, ajuster
J+7 à J+30  │ CROISSANCE         │ Contenu + outreach + optimisation
J+30 à J+90 │ DOMINATION         │ Publier massivement, contacter les médias
```

---

## NOUVEAU — Deux cliniques

Judith pratique maintenant à DEUX endroits :

| | La Source en Soi | Éden Yoga Pilates |
|---|---|---|
| **Lieu** | Rosemont, Montréal | 121 Boul. Industriel #225, Repentigny |
| **Horaire** | Lun-Ven (voir horaire) | Mercredi 9h-15h (dernier patient 14h) |
| **Services** | Acupuncture classique + sociale | Acupuncture classique (PAS de sociale) |
| **GRV** | gorendezvous.com/lasourceensoi eids=175708 | gorendezvous.com/edenyogapilates eids=?????? |
| **GBP** | LSSI a un GBP existant (DA 26) | Eden a un GBP existant (à vérifier) |
| **Backlinks** | 12 058 backlinks, 217 domaines | À analyser (Ubersuggest) |
| **Site partenaire** | lasourceensoi.com | edenyogapilates.ca |

### Impact SEO : double zone géographique

Judith passe de 1 zone (Rosemont/Montréal) à 2 zones (+ Repentigny/rive-nord/Lanaudière).

**Nouveaux mots-clés à rechercher** (mission Ubersuggest + ATP) :
- acupuncture Repentigny
- acupunctrice rive-nord
- acupuncture Lanaudière
- acupuncture Repentigny grossesse
- acupuncture Repentigny fertilité
- acupuncture L'Assomption (ville voisine)
- acupuncture Terrebonne (ville voisine)
- acupuncture Mascouche

### Impact sur le site

**Page /reserver** — devient un choix entre deux cliniques (deux colonnes/cartes).
**Page /contact** — ajouter la deuxième adresse.
**Pages services** — mentionner disponibilité aux deux endroits.
**Schema.org** — MedicalBusiness avec deux `location`.
**Footer** — possiblement les deux adresses.

---

## STRATÉGIE GOOGLE BUSINESS PROFILE — 3 fiches

### Pourquoi 3 fiches (pas 1, pas 2)

Puisque Judith pratique à PLUSIEURS endroits, Google permet explicitement
qu'elle ait son propre GBP praticien SÉPARÉ de celui des cliniques.

Les 3 fiches sont :
1. **GBP La Source en Soi** (existe déjà, DA 26) — la clinique
2. **GBP Éden Yoga Pilates** (existe probablement) — la clinique
3. **GBP "Judith Dufour-Savard — Acupunctrice"** (à créer) — la praticienne

Chacune capte des recherches DIFFÉRENTES :
- "clinique bien-être Rosemont" → GBP La Source en Soi
- "yoga pilates Repentigny" → GBP Éden
- "acupunctrice Rosemont" / "acupunctrice Repentigny" → GBP Judith

### Fiche 3 : GBP Praticien pour Judith (À CRÉER)

**Règles Google pour les praticiens multi-sites** :
- UN SEUL GBP praticien, lié à l'adresse PRINCIPALE (La Source en Soi)
- Le nom = SEULEMENT le nom du praticien, PAS le nom de la clinique
  → "Judith Dufour-Savard" (pas "La Source en Soi: Judith Dufour-Savard")
- Catégorie primaire : "Acupuncturist"
- Site web : acupuncturejudith.ca
- Heures : les heures combinées des deux cliniques
- Description : mentionner les deux points de pratique

**Setup** :
1. Aller sur business.google.com
2. "Add your business to Google"
3. Nom : "Judith Dufour-Savard"
4. Catégorie : "Acupuncturist"
5. Adresse : celle de La Source en Soi (adresse principale)
6. Heures : lun-ven selon horaire LSSI + mercredi 9h-15h (Eden)
7. Site web : https://acupuncturejudith.ca
8. Lien de réservation : https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708
9. Description (750 chars max) : mentionner les deux cliniques, les spécialités, l'OAQ
10. Photos : photos professionnelles de Judith
11. Vérification : vidéo (montrer l'enseigne de LSSI, l'intérieur, action dans le dashboard)

**Post "Opening Soon"** :
Publier 30 jours avant le lancement du site.
Peut générer 15-25 demandes de rendez-vous avant le jour J.

### Ce que les propriétaires des cliniques doivent faire

#### La Source en Soi (Annie / responsable SEO)
- [ ] Ajouter "Acupuncture — Judith Dufour-Savard" dans les SERVICES du GBP LSSI
- [ ] Ajouter des photos de Judith dans la galerie GBP
- [ ] Ajouter le lien de réservation direct (eids=175708) dans les attributs
- [ ] Ajouter un lien vers acupuncturejudith.ca sur la page équipe du site

#### Éden Yoga Pilates (Émilie Comeau)
- [ ] Fournir le code du bouton GRV avec l'eids de Judith à Eden
- [ ] Ajouter "Acupuncture — Judith Dufour-Savard" dans les services du GBP Eden
- [ ] Ajouter un lien vers acupuncturejudith.ca sur edenyogapilates.ca/decouvrir-nos-soins
- [ ] Confirmer l'adresse exacte avec code postal (pour Schema.org et annuaires)
- [ ] Confirmer les services offerts (acupuncture classique seulement ? fertilité/grossesse aussi ?)

---

## PHASE 0 — FONDATIONS (J-21 à J-14)

### Technique (sans toucher au DNS)

| # | Action | Qui | Effort | Statut |
|---|--------|-----|--------|--------|
| 1 | Cherry-pick commit GRV e0ce162 sur main | Benoit | 5 min | À faire |
| 2 | Créer compte Plausible Analytics (9$/mois) | Benoit | 10 min | À faire |
| 3 | MW-F3a : Script Plausible dans layout.tsx | CC | 30 min | À faire |
| 4 | MW-E3 : Blog publish → Firestore (couper Wix) | CC | 4-5h | À faire |
| 5 | Produire ressource "Acupuncture et ménopause" (22K/mois!) | Benoit + Claude | 3-4h | À faire |
| 6 | Produire 5 FAQ quick-win (SD < 5) | Benoit + Claude | 1h | À faire |
| 7 | Produire ressource "Acupuncture et SOPK" | Benoit + Claude | 2-3h | À faire |
| 8 | Ajouter page /reserver avec 2 cliniques | CC | 2h | À faire (quand code GRV Eden reçu) |
| 9 | Ajouter deuxième adresse sur page /contact | CC | 1h | À faire |
| 10 | Mettre à jour Schema.org (2 locations) | CC | 1h | À faire |

### Recherche SEO complémentaire

| # | Action | Outil | Effort |
|---|--------|-------|--------|
| 1 | Recherche mots-clés "acupuncture Repentigny" + rive-nord | Ubersuggest | 30 min |
| 2 | Competitor analysis edenyogapilates.ca | Ubersuggest | 15 min |
| 3 | Backlinks analysis edenyogapilates.ca | Ubersuggest | 15 min |
| 4 | AnswerThePublic "acupuncture Repentigny" | ATP | 10 min |
| 5 | Vérifier GBP existant d'Eden Yoga Pilates | Google Maps | 5 min |

**Prompt Claude in Chrome pour Ubersuggest** :
```
Recherche Ubersuggest (Canada/FR) pour les seeds suivants :
1. acupuncture Repentigny
2. acupuncture rive-nord
3. acupuncture Lanaudière
4. acupuncture Terrebonne
5. acupuncture L'Assomption

Pour chaque seed, extrais Keyword Ideas (tous onglets) et Questions.
Aussi faire un Traffic Analyzer sur edenyogapilates.ca.
Sauvegarder via JavaScript download : ubersuggest-repentigny.md
```

### GBP (peut être fait AVANT le switch DNS)

Le GBP de Judith EXISTE DÉJÀ — géré par jdufoursavard@gmail.com.
Il faut l'OPTIMISER, pas le créer.

| # | Action | Qui | Effort |
|---|--------|-----|--------|
| 1 | Se connecter sur business.google.com (jdufoursavard@gmail.com) | Judith/Benoit | 5 min |
| 2 | Catégorie primaire → "Acupuncturist" | Benoit | 2 min |
| 3 | Site web → https://acupuncturejudith.ca | Benoit | 2 min |
| 4 | Lien réservation → URL GRV avec eids=175708 | Benoit | 2 min |
| 5 | Description optimisée (750 chars, mentionne 2 cliniques, spécialités, OAQ) | Benoit | 15 min |
| 6 | Ajouter 6 services (fertilité, grossesse, pédiatrie, stress, sociale, ménopause) | Benoit | 15 min |
| 7 | Ajouter 10-15 photos (profil, cabinet LSSI, en action) | Benoit/Judith | 30 min |
| 8 | Attributs : Women-led, Accepts insurance, langues | Benoit | 5 min |
| 9 | Post "Opening Soon" — nouveau site web | Benoit | 10 min |
| 10 | Demander à Émilie d'ajouter "Acupuncture" dans services GBP Eden | Émilie | 5 min |

Note : UN SEUL GBP praticien pour Judith (pas un deuxième pour Eden).
La description mentionne les deux cliniques, Google le géolocalise correctement.

---

## PHASE 1 — BUILD-UP (J-14 à J-7)

### Fiches annuaires — DOUBLER pour Repentigny

Chaque annuaire doit avoir les DEUX adresses quand c'est possible.

| # | Plateforme | DA | Action Rosemont | Action Repentigny |
|---|-----------|-----|-----------------|-------------------|
| 1 | Google Business Profile | 100 | GBP praticien (adresse principale) | Services mention Repentigny |
| 2 | OAQ — o-a-q.org | ~40 | Vérifier répertoire | Même fiche (praticien unique) |
| 3 | Lumino Santé | 54 | Fiche praticien | Ajouter 2e adresse si possible |
| 4 | 411.ca | 53 | Fiche entreprise | Fiche séparée si possible |
| 5 | fresha.com | 62 | Profil praticien | 2e localisation |
| 6 | canpages.ca | 51 | Fiche | Fiche |
| 7 | Go Rendez-Vous | 42 | Lien → acupuncturejudith.ca | Idem |
| 8 | medimap.ca | 39 | Profil | 2e localisation |
| 9 | goldbook.ca | 38 | Fiche | Fiche |
| 10 | Yelp | ~90 | Profil | Profil 2e localisation |
| 11 | ic.gc.ca | 73 | Vérifier fiche | — |

### Contacts partenaires (Cercle 1)

| # | Contact | Demande | Statut |
|---|---------|---------|--------|
| 1 | Responsable SEO La Source en Soi | Lien page équipe + services GBP + contacts médias | Rencontre à planifier |
| 2 | Émilie Comeau (proprio Eden) | Code GRV + lien site + services GBP | Rencontre aujourd'hui |
| 3 | Annie Bouchard (proprio LSSI) | Validation lien + mention newsletter | Contact établi |
| 4 | Patientes régulières de Judith | Avis Google (prévoir QR code) | En séance |

### Contenu social pré-lancement

| # | Contenu | Plateforme | Quand |
|---|---------|-----------|-------|
| 1 | Story teaser "Quelque chose arrive bientôt..." | IG | J-7 |
| 2 | Post "Mon nouveau site est en construction" | IG/FB | J-5 |
| 3 | Story compte à rebours | IG | J-3 |
| 4 | Reel visite guidée du site (screen recording) | IG/FB | J-0 |
| 5 | Post annonce officielle | IG/FB | J-0 |
| 6 | Story "Le site est live — lien en bio!" | IG | J-0 |

---

## PHASE 2 — BUZZ (J-7 à J-1)

### J-7
- [ ] Publier stories teaser IG
- [ ] Préparer post annonce officielle (caption + visuels)
- [ ] Dernière vérification de tous les liens du site
- [ ] Demander à 5 patientes de "se préparer à laisser un avis Google"

### J-3
- [ ] Story compte à rebours IG
- [ ] Confirmer avec LSSI que le lien page équipe sera ajouté jour J
- [ ] Confirmer avec Eden que le lien sera ajouté jour J
- [ ] Tester le flow GRV complet (Rosemont + Repentigny)

### J-1
- [ ] Préparer onglets : Vercel DNS, GSC, Plausible, GBP
- [ ] Préparer le screen recording pour le Reel
- [ ] Vérifier build Vercel
- [ ] Go / No-go avec Judith

---

## PHASE 3 — JOUR J (switch DNS)

### Ordre des opérations

```
08:00  Switcher le DNS (acupuncturejudith.ca → Vercel)
08:15  Vérifier site live (tester 10 pages dont /reserver avec 2 cliniques)
08:30  Soumettre sitemap.xml à Google Search Console
08:45  Vérifier Plausible Analytics (premiers hits)
09:00  Publier les fiches annuaires (pic de backlinks simultané)
09:30  LSSI ajoute le lien page équipe
09:45  Eden ajoute le lien sur edenyogapilates.ca
10:00  Publier Reel/post annonce sur IG
10:15  Publier post sur FB
10:30  Story IG "Le site est live!"
11:00  Email patientes (si liste disponible)
12:00  Post GBP "Notre nouveau site est en ligne!"
```

---

## PHASE 4 — AMPLIFICATION (J+1 à J+7)

| Jour | Action |
|------|--------|
| J+1 | Vérifier indexation (site:acupuncturejudith.ca) |
| J+1 | Répondre commentaires/DM IG/FB |
| J+2 | Publier article blog #1 |
| J+3 | Demander premiers avis Google (5 patientes) |
| J+4 | Story "Merci pour vos messages!" + partager un avis |
| J+5 | Publier article blog #2 |
| J+7 | Premier bilan Plausible |

---

## PHASE 5 — CROISSANCE (J+7 à J+30)

### Contenu : 2-3 pièces/semaine (KEYWORD_BACKLOG.md)

Objectif : 10 nouvelles pages dans le premier mois.
Priorité #1 : Ménopause (22K/mois), SOPK, douleur chronique.

### Outreach Cercle 3 — Partenaires santé

| # | Contact | Organisation | Angle |
|---|---------|-------------|-------|
| 1 | Partenariats | Clinique OVO/Procrea | Acupunctrice complémentaire fertilité |
| 2 | Sages-femmes | Maisons de naissance MTL | Ressources grossesse |
| 3 | Doulas | Réseau doulas QC | Ressources périnatalité |
| 4 | Programme acupuncture | Collège de Rosemont | Alumni spotlight |
| 5 | Allaitement | Nourri-Source Montréal | Acupuncture + allaitement |
| 6 | Yoga/bien-être | Studios yoga Repentigny | Cross-promotion Eden |

### Avis Google — Objectif : 10 en 30 jours

QR code dans les deux cabinets → page d'avis Google direct.

---

## PHASE 6 — DOMINATION (J+30 à J+90)

### Contenu

Objectif : 20 ressources + 25 FAQ + 20 articles blog.

### Outreach Cercle 4 — Médias

| # | Média | DA | Angle de pitch |
|---|-------|-----|---------------|
| 1 | Coup de Pouce | 57 | Grossesse : ce que la science dit sur l'acupuncture |
| 2 | Elle Québec | 54 | Ménopause sans hormones : l'acupuncture comme alternative |
| 3 | Voir.ca | 62 | L'acupuncture sociale : rendre la santé accessible |
| 4 | Gazette des femmes | 40 | Fertilité et médecine chinoise |
| 5 | Maman pour la vie | 51 | Coliques de bébé : l'acupuncture pédiatrique |
| 6 | Podcast Post-partum | 58 | Invitée acupunctrice spécialisée |

---

## CONTACTS — LISTE COMPLÈTE

### Confirmés / en cours

| Contact | Organisation | Statut | Action |
|---------|-------------|--------|--------|
| Annie Bouchard | La Source en Soi (proprio) | Contact établi | Intro vers responsable SEO |
| Responsable SEO LSSI | La Source en Soi | Rencontre à planifier | Lien + GBP + contacts médias |
| Émilie Comeau | Éden Yoga Pilates (proprio) | Rencontre aujourd'hui | Code GRV + lien site + GBP |

### À identifier (mission Claude in Chrome)

| Contact | Organisation | Comment le trouver |
|---------|-------------|-------------------|
| Responsable partenariats | Clinique OVO Montréal | Site ovo.com / LinkedIn |
| Contact presse | Coup de Pouce | coupdepouce.com/contact |
| Contact presse | Elle Québec | Site / LinkedIn |
| Contact rédaction | Voir.ca | voir.ca |
| Contact | Nourri-Source Montréal | nourrisourcemontreal.org |
| Contact | Maisons de naissance QC | Réseau MN |
| Contact | Association doulas QC | Site / Facebook |
| Valérie Roberts | Podcast Post-partum | Instagram / site |
| Rédactrice | Gazette des femmes | gazettedesfemmes.ca |
| Rédactrice | Maman pour la vie | mamanpourlavie.com |

---

## GUIDE — Comment parler du GBP aux propriétaires de cliniques

### Pour Émilie (Éden Yoga Pilates) — ce que tu lui dis aujourd'hui

> "Judith va avoir son propre Google Business Profile comme praticienne.
> Google permet ça quand un praticien travaille à plusieurs endroits.
> C'est séparé du GBP d'Éden — ça ne change rien pour toi.
> 
> Ce que ça te rapporte : quand quelqu'un cherche 'acupuncture Repentigny'
> et trouve le profil de Judith, ils découvrent aussi Éden Yoga Pilates.
> Plus de visibilité pour les deux.
> 
> Ce dont j'ai besoin :
> 1. Le code du bouton Go Rendez-Vous de Judith (comme celui de La Source en Soi)
> 2. Est-ce que tu pourrais ajouter un lien vers acupuncturejudith.ca
>    sur ta page 'Découvrir nos soins'?
> 3. Est-ce que tu pourrais ajouter 'Acupuncture' dans les services
>    de ton Google Business Profile, en mentionnant Judith?
> 4. L'adresse exacte avec le code postal."

### Pour Annie / responsable SEO (La Source en Soi)

Document de préparation complet : ~/Desktop/PREP_RENCONTRE_SEO_LSSI.md
Inclut la stratégie GBP partenariat détaillée.

---

## CE QU'ON PEUT AVANCER MAINTENANT (sans DNS)

### Cette semaine

| # | Action | Dépend de | Effort |
|---|--------|-----------|--------|
| 1 | Cherry-pick GRV sur main | Rien | 5 min |
| 2 | Créer compte Plausible | Rien | 10 min |
| 3 | Sprint CC : MW-F3a + MW-E3 | Rien | 5h |
| 4 | Obtenir code GRV Eden (Émilie) | Rencontre aujourd'hui | — |
| 5 | Recherche Ubersuggest Repentigny | Ubersuggest payant | 30 min |
| 6 | Créer GBP Judith (brouillon) | Rien | 30 min |
| 7 | Post GBP "Opening Soon" | GBP créé | 10 min |

### Semaine prochaine

| # | Action | Dépend de | Effort |
|---|--------|-----------|--------|
| 8 | Sprint CC : ajouter 2e clinique au site | Code GRV Eden | 3-4h |
| 9 | Sprint CC : MW-E1 + MW-E2 (CMS) | MW-E3 | 9-10h |
| 10 | Produire ressource ménopause | Rien | 3-4h |
| 11 | Produire 5 FAQ quick-win | Rien | 1h |
| 12 | Créer 12 fiches annuaires | Rien | 2h30 |
| 13 | Rencontre SEO La Source en Soi | Annie fait l'intro | 1h |

### Quand Judith valide le preview

| # | Action |
|---|--------|
| 14 | Intégrer ses feedbacks |
| 15 | Fixer la date du jour J |
| 16 | Lancer timeline J-7 (buzz social) |
| 17 | Switch DNS le jour J |

---

## MÉTRIQUES DE SUCCÈS

| Métrique | J+0 | J+7 | J+30 | J+90 |
|----------|-----|------|------|------|
| Pages indexées Google | 0 | 20+ | 60+ | 100+ |
| Backlinks (domaines) | 0 | 15+ | 25+ | 40+ |
| Visiteurs uniques/mois | 0 | 100 | 300 | 1 000 |
| Avis Google | 0 | 3 | 10 | 25 |
| Mots-clés top 10 | 0 | 5 | 15 | 30 |
| RDV via site/mois | 0 | 2 | 5 | 15 |
| Ressources publiées | 7 | 8 | 15 | 25 |
| FAQ publiées | 11 | 16 | 25 | 50 |

