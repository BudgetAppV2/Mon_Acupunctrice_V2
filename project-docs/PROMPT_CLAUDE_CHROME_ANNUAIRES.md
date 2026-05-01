# Mission Claude in Chrome — Compléter le kit annuaires Judith Dufour-Savard

**Contexte** : tu prépares la soumission de 12 fiches annuaires pour Judith Dufour-Savard, acupunctrice à Montréal et Repentigny, dans le cadre du lancement de son site `acupuncturejudith.ca` prévu pour le 3 mai 2026. Le kit annuaires complet est dans `project-docs/02_ROADMAP/migration-wix/ANNUAIRES_KIT.md`. Cette mission a 3 objectifs :

1. Récupérer 4 infos publiques manquantes
2. Vérifier sur chacun des 12 annuaires si une fiche Judith existe déjà
3. Capturer les exigences spécifiques de chaque plateforme

**Sortie** : un fichier markdown structuré sauvegardé via JavaScript download nommé `ANNUAIRES_KIT_DATA.md` que je fusionnerai dans le kit.

---

## Phase 1 — Récupérer les 4 infos publiques manquantes

### 1.1 Numéro OAQ de Judith

Aller sur le répertoire public de l'Ordre des acupuncteurs du Québec :
**URL** : `https://o-a-q.org/grand-public/recherche-membre/`

Rechercher « Judith Dufour-Savard » (ou « Dufour-Savard », « Dufour Savard »).

Capturer :
- Numéro de membre exact
- Spécialités/champs de pratique listés
- Adresse(s) de pratique listée(s) sur sa fiche
- URL de la fiche publique OAQ (si elle a une page dédiée)
- Si possible : année d'admission à l'OAQ (peut servir de proxy pour « année début pratique »)

### 1.2 Année de début de pratique

Si l'OAQ ne donne pas la date d'admission, chercher ailleurs :
- **Site La Source en Soi** : `https://lasourceensoi.com` — bio de Judith dans la page équipe
- **LinkedIn** : recherche « Judith Dufour-Savard acupunctrice »
- **Autres sites où elle est mentionnée**

Capturer la date la plus précise (année minimum, mois si dispo).

### 1.3 Code postal Éden Yoga Pilates Repentigny

Adresse connue : `121 Boulevard Industriel, suite 225, Repentigny, QC`

Vérifier :
- **Site Éden** : `https://edenyogapilates.ca` (page contact)
- **Google Maps** : rechercher l'adresse pour confirmer le code postal exact
- **Pages Jaunes** : `https://www.pagesjaunes.ca` recherche « Eden Yoga Pilates Repentigny »

Format attendu : `J5Z XXX` ou similaire (codes postaux Repentigny).

### 1.4 Heures exactes de Judith à LSSI (Rosemont)

URL Go Rendez-Vous Judith à LSSI :
`https://www.gorendezvous.com/lasourceensoi?companyId=104074&eids=175708`

Sur ce widget, regarder les disponibilités de Judith (peut nécessiter de cliquer « Acupuncture » puis sélectionner Judith comme praticienne).

Capturer pour chaque jour de la semaine où Judith est à LSSI (lundi, mardi, jeudi, vendredi — pas mercredi, elle est à Éden) :
- Heure de début la plus matinale visible
- Heure de fin la plus tardive visible

Note : ce sont des estimations basées sur les disponibilités. Judith devra confirmer.

---

## Phase 2 — Vérifier l'existence de fiches Judith sur les 12 annuaires

Pour chaque plateforme ci-dessous, faire une recherche « Judith Dufour-Savard » (variantes : « Dufour Savard », « Dufour-Savard acupuncture »). Capturer :

- ✅ **Fiche existe** → URL de la fiche + statut (réclamée par Judith ou non, infos à jour ou pas)
- ❌ **Aucune fiche** → confirmer qu'il faudra créer

| # | Plateforme | URL de recherche |
|---|-----------|------------------|
| 1 | Google Business Profile | (déjà géré, skip cette étape) |
| 2 | Apple Maps | `https://maps.apple.com` (chercher avec localisation Montréal) |
| 3 | Bing Places | `https://www.bing.com/maps` recherche « Judith Dufour-Savard acupuncture Montréal » |
| 4 | Yelp | `https://www.yelp.ca` recherche « Judith Dufour-Savard » + « Acupuncture Montréal » |
| 5 | OAQ (déjà confirmé en Phase 1) | skip cette étape |
| 6 | Lumino Santé | `https://luminosante.ca` recherche acupuncteurs Montréal |
| 7 | Medimap | `https://medimap.ca` recherche acupuncture Montréal |
| 8 | Pages Jaunes | `https://www.pagesjaunes.ca` recherche « Judith Dufour-Savard » |
| 9 | 411.ca | `https://www.411.ca` recherche idem |
| 10 | Canpages | `https://canpages.ca` recherche idem |
| 11 | Goldbook | `https://www.goldbook.ca` recherche idem |
| 12 | IC.gc.ca | `https://www.ic.gc.ca/app/ccc/srch/cccBscSrch.do` recherche par nom |

---

## Phase 3 — Exigences spécifiques de chaque plateforme

Pour les plateformes où il faudra **créer** une fiche (résultat Phase 2), aller sur la page d'inscription et noter :

- URL exacte du formulaire d'inscription/réclamation
- Champs requis (titre, description, catégorie, photos, etc.)
- Longueurs max des champs description (caractères ou mots)
- Type de validation : email automatique, SMS, appel téléphonique, document officiel
- Délai d'approbation typique mentionné
- Frais éventuels (gratuit / payant / freemium)
- Catégories acupuncture / médecine alternative disponibles dans leur taxonomie

Pour les plateformes où une fiche **existe déjà**, noter :
- Comment réclamer une fiche existante (procédure)
- Si modifications possibles sans authentification (peu probable mais à vérifier)

---

## Format de sortie attendu

Sauvegarder un fichier markdown via JavaScript download intitulé `ANNUAIRES_KIT_DATA.md` avec exactement cette structure :

```markdown
# Données complémentaires kit annuaires — collectées le <date du jour>

## Phase 1 — Infos publiques

### Numéro OAQ
- **Numéro** : <valeur trouvée>
- **Source** : <URL>
- **Spécialités listées** : <liste>
- **Adresses listées** : <liste>
- **Année admission OAQ** : <valeur ou "non trouvée">

### Année début de pratique
- **Année** : <valeur>
- **Source** : <URL où trouvé>
- **Note** : <commentaire si plusieurs sources contradictoires>

### Code postal Éden Yoga Pilates
- **Code postal** : <valeur>
- **Adresse complète confirmée** : <valeur>
- **Source** : <URL>

### Heures Judith à LSSI (à valider avec Judith)
- **Lundi** : <heure début> - <heure fin>
- **Mardi** : <heure début> - <heure fin>
- **Jeudi** : <heure début> - <heure fin>
- **Vendredi** : <heure début> - <heure fin>
- **Source** : Go Rendez-Vous LSSI (companyId=104074&eids=175708)

## Phase 2 — État des fiches sur les 12 plateformes

| # | Plateforme | Fiche existe ? | URL fiche | Notes |
|---|-----------|----------------|-----------|-------|
| 2 | Apple Maps | ✅/❌ | ... | ... |
| 3 | Bing Places | ✅/❌ | ... | ... |
| 4 | Yelp | ✅/❌ | ... | ... |
| 6 | Lumino Santé | ✅/❌ | ... | ... |
| 7 | Medimap | ✅/❌ | ... | ... |
| 8 | Pages Jaunes | ✅/❌ | ... | ... |
| 9 | 411.ca | ✅/❌ | ... | ... |
| 10 | Canpages | ✅/❌ | ... | ... |
| 11 | Goldbook | ✅/❌ | ... | ... |
| 12 | IC.gc.ca | ✅/❌ | ... | ... |

## Phase 3 — Exigences par plateforme à créer/réclamer

### <Nom plateforme>
- **URL inscription** : <URL>
- **Champs requis** : <liste>
- **Description max** : <N caractères>
- **Validation** : <type>
- **Délai approbation** : <valeur>
- **Frais** : <gratuit/payant/freemium>
- **Catégorie acupuncture disponible** : ✅/❌ <nom exact de la catégorie>
- **Notes spécifiques** : <observations>

(répéter la section pour chacune des 11 plateformes pertinentes)
```

---

## Méthode pour sauvegarder via JavaScript

À la fin de la mission, dans la console du navigateur, exécuter quelque chose comme :

```javascript
const content = `# Données complémentaires kit annuaires...
[le contenu markdown complet ici]
`;
const blob = new Blob([content], { type: 'text/markdown' });
const url = URL.createObjectURL(blob);
const a = document.createElement('a');
a.href = url;
a.download = 'ANNUAIRES_KIT_DATA.md';
a.click();
URL.revokeObjectURL(url);
```

Le fichier sera téléchargé dans `~/Downloads/`. Je le déplacerai ensuite dans `project-docs/02_ROADMAP/migration-wix/`.

---

## Notes importantes

- **Ne pas tenter de créer de compte ou réclamer une fiche** — c'est juste de la reconnaissance, pas du déploiement. Le déploiement se fera le jour J (3 mai).
- **Si une fiche Judith existe sur Apple Maps ou ailleurs avec des infos obsolètes**, c'est important de le noter — on devra la réclamer et corriger plutôt que créer une duplicate.
- **Pour OAQ et IC.gc.ca**, ce sont des organismes officiels — la présence d'une fiche est probable mais à confirmer.
- **Ne pas perdre de temps sur les Bing Places détails** s'ils renvoient juste à GBP — Bing importe automatiquement de Google.
- Si une plateforme demande des credentials pour voir les détails du formulaire d'inscription, simplement noter « inscription requise pour voir les exigences » sans s'inscrire.

Bonne mission !
