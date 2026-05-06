# Guide de Curation Freepik — Banque visuelle Judith

**Date** : 5 mai 2026
**Objectif** : Constituer une banque de 60 assets (30 backgrounds + 30 line art) pour génération automatique des covers blog/ressources/FAQ.
**Source** : Abonnement Freepik Premium / Majestic
**Destination** : `content/visual-bank/`

---

## Stratégie

**Combo gagnant** : `Boho background` (mood pastel chaleureux) + `Line art ciblé` (sujet par pilier) → composition harmonieuse garantie.

Avantage clé : un line art noir/foncé sur n'importe quel boho background = cohérence visuelle. Tu peux mixer presque librement.

---

## Workflow Freepik recommandé

### Phase 1 — Curation via Collections (45 min)

1. **Connecte-toi à Freepik** (compte Premium / Majestic)
2. **Crée 8 Collections** (un par catégorie) :
   - `Judith - Backgrounds` (universels)
   - `Judith - Line art Grossesse`
   - `Judith - Line art Pédiatrie`
   - `Judith - Line art Fertilité`
   - `Judith - Line art Anxiété-Sommeil`
   - `Judith - Line art Ménopause`
   - `Judith - Line art Acupuncture sociale`
   - `Judith - Line art Transversal`

3. Pour chaque catégorie, recherche avec les termes ci-dessous, filtre, ajoute à la Collection (pas download immédiat).

### Phase 2 — Bulk download (10-15 min)

Une fois les Collections complètes :
- Va dans chaque Collection
- Clic "Download all" (Premium) → ZIP
- Tous les ZIP atterrissent dans `~/Downloads/`

### Phase 3 — Tri automatique (15 min)

- Décompresse les ZIP dans `content/visual-bank/raw-downloads/`
- Lance le script : `python3 content/visual-bank/scripts/tag-and-organize.py`
- Le script te pose les questions, range, génère les metadata

---

## Termes de recherche Freepik

### BACKGROUNDS — Universels (objectif : 25-30 assets)

**Filtres recommandés** :
- Type : **Photos** (texture) OU **Vectors** (.eps/.svg pour redimensionnement infini)
- Color filter : **Beige + Pink + Brown** combiné
- Orientation : **Horizontal** ou **Square** (jamais portrait pur)
- Trier par : **Most relevant** ou **Latest**

**Termes par ordre de pertinence** (fais 5-7 recherches, garde les meilleurs) :

```
boho watercolor background pastel
abstract terracotta background organic
sage green watercolor texture minimal
warm earth tones abstract background
neutral beige watercolor stains
peach pastel boho abstract
clay color organic shapes background
sand dune abstract minimal
muted pink watercolor texture pastel
warm cream beige minimal background
boho aesthetic background neutral
abstract watercolor blob pastel
```

**Critères de sélection** :
- Palette dans [#856457, #aca394, #de585d, #ecc0ab, #a1a9c4, #dcdac7]
- Saturation faible/moyenne (pas trop vif)
- Composition aérée (pas trop chargée — il faut de l'espace pour le line art overlay)
- Pas de motifs trop forts (qui distrairaient du texte)
- Évite les couleurs hors palette (vert vif, bleu électrique, jaune fluo)
- Évite les patterns trop chargés (mandalas complexes, rayures, géométries)

**Distribution suggérée** :
- 8 backgrounds **clairs** (luminosité 80%+) → cover blog principal
- 12 backgrounds **moyens** (luminosité 60-80%) → versatilité maximum
- 5 backgrounds **plus foncés** (luminosité 40-60%) → contraste pour titres clairs
- 5 backgrounds **avec texture marquée** (papier, watercolor stains) → variété tactile

---

### LINE ART — Par pilier

#### GROSSESSE (5-6 assets)
**Filtres** : Type **Vectors** (SVG idéalement), Color **Black & White**

```
line art pregnant woman minimal silhouette
line art pregnancy belly hands minimalist
line art mother to be one line drawing
abstract line drawing pregnancy
hand drawn line pregnant silhouette
line art pregnant woman side profile minimal
```

À privilégier : silhouettes douces, courbes minimales, one-line drawings élégants, mains sur le ventre (geste universel).
À éviter : détails médicaux (échographies, fœtus visible), style enfantin/cartoon, couleurs (on veut du noir/foncé pur).

---

#### PÉDIATRIE (5-6 assets)
**Filtres** : Type **Vectors**, Color **Black & White**

```
line art baby feet minimalist
line art mother child silhouette one line
line art baby hand abstract
minimalist line drawing baby
child silhouette line art simple
line art mother holding baby minimal
line art baby face simple silhouette
```

À privilégier : pieds de bébé, mains, silhouettes douces, parent + enfant abstraites, "newborn aesthetic" minimaux.
À éviter : bébés avec expressions faciales détaillées, couches/biberons/hochets.

---

#### FERTILITÉ (5-6 assets)
**Filtres** : Type **Vectors**, Color **Black & White**

```
line art flower bud minimalist
line art moon phases simple
abstract line drawing nature growth
line art seedling minimalist
botanical line art delicate
line art butterfly minimalist
line art lotus opening minimalist
```

À privilégier : métaphores fécondité (graines, boutons, lune), botanique délicate, cycles, transformations.
À éviter : tout ce qui est anatomique (utérus, ovaires, spermatozoïdes), bébés, couples (Judith accompagne aussi des femmes seules).

---

#### ANXIÉTÉ & SOMMEIL (5-6 assets)
**Filtres** : Type **Vectors**, Color **Black & White**

```
line art meditation minimalist
line art moon stars minimal
abstract line drawing waves calm
line art breathing yoga simple
line art lotus minimalist
line art zen circle enso
line art mountains peaceful minimal
```

À privilégier : lune, étoiles, vagues calmes, méditation, yoga, cercles enso, montagnes.
À éviter : symboles "anxiété" négatifs, clichés "dormir avec mouton".

---

#### MÉNOPAUSE & SANTÉ DES FEMMES (5-6 assets)
**Filtres** : Type **Vectors**, Color **Black & White**

```
line art woman portrait minimal
line art feminine silhouette modern
line art woman meditation
abstract line woman empowerment
line art woman flowers
line art mature woman minimal silhouette
line art body positive minimal woman
```

À privilégier : femmes adultes, force tranquille, sérénité, body positive sans cliché.
À éviter : stéréotypes "femme âgée fatiguée", bouffées de chaleur littérales.

---

#### ACUPUNCTURE SOCIALE (5-6 assets)
**Filtres** : Type **Vectors**, Color **Black & White**

```
line art hands together minimal
line art community circle simple
line art helping hands minimalist
abstract line drawing connection
line art hands holding heart
line art people circle community
```

À privilégier : mains qui s'entraident, cercles, communautés, symboles de partage.
À éviter : symboles charité/pauvreté (paume tendue, pièces).

---

#### TRANSVERSAL (3-5 assets bonus)
**Filtres** : Type **Vectors**, Color **Black & White**

```
line art plant minimalist botanical
line art leaf simple modern
line art branches one line
line art geometric flower
line art minimalist herb sage
```

À privilégier : plantes, herbes (médecine chinoise herbal), formes géométriques douces, éléments universels réutilisables.

---

## Convention de nommage finale (gérée par le script)

**Pattern** : `[type]-[descriptif]-[NN].[ext]`

**Exemples** :
- `boho-pastel-pink-01.jpg`
- `boho-terracotta-watercolor-02.jpg`
- `pregnant-silhouette-01.svg`
- `baby-feet-01.svg`
- `flower-bud-01.svg`

Le script `tag-and-organize.py` se charge du renommage automatique. Tu n'as pas besoin de renommer pendant le download Freepik.

---

## Distribution finale visée

| Catégorie | Quantité | Format préféré |
|---|---|---|
| Backgrounds boho | 25-30 | JPG/PNG (texture) ou EPS/SVG |
| Line art Grossesse | 5-6 | SVG (vectoriel) |
| Line art Pédiatrie | 5-6 | SVG |
| Line art Fertilité | 5-6 | SVG |
| Line art Anxiété-Sommeil | 5-6 | SVG |
| Line art Ménopause | 5-6 | SVG |
| Line art Acupuncture sociale | 5-6 | SVG |
| Line art Transversal | 3-5 | SVG |
| **TOTAL** | **60-70** | — |

---

## Checklist post-curation

Avant de quitter Freepik, vérifie :

- [ ] J'ai au minimum 25 backgrounds dans `Judith - Backgrounds`
- [ ] Chaque pilier line art a au moins 5 assets
- [ ] Tous les line art sont en noir/blanc (pas en couleur)
- [ ] Tous les backgrounds respectent la palette pastel chaude
- [ ] Pas de visages identifiables, pas d'aiguilles, pas de chinoiseries
- [ ] Tous les assets sont en licence Premium (commercial OK)
- [ ] J'ai téléchargé en SVG quand possible (qualité illimitée)

---

## Trucs pour gagner du temps Freepik

1. **Utilise les "Similar" / "Related"** : quand tu trouves un asset parfait, Freepik propose des similaires dans la sidebar — souvent 3-4 d'entre eux sont aussi des winners
2. **Filtre "AI generated"** : à éviter sur Freepik (qualité variable) — privilégie "Hand-drawn" / "Vector"
3. **Utilise les "Authors collections"** : si un illustrateur a un style qui marche, ses autres œuvres aussi
4. **Garde l'onglet Collection ouvert** : tu peux ajouter sans quitter ta recherche

---

## Après la curation — Étape suivante

1. Télécharge tous tes ZIP dans `~/Downloads/`
2. Décompresse-les dans `content/visual-bank/raw-downloads/`
3. Lance : `python3 content/visual-bank/scripts/tag-and-organize.py`
4. Le script te guide question par question (1 lettre = 1 réponse, ultra rapide)
5. Une fois fini : commit + push
