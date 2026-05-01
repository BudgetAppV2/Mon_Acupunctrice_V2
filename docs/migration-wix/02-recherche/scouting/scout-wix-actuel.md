# Scouting — Site Wix actuel (acupuncturejudith.ca)

**Date** : 13 avril 2026
**Temps passé** : 20 min
**Statut global** : 🟢 Vert

## TL;DR

Le site Wix compte ~27 URLs indexables : 8 pages statiques, 11 articles de blog, 6 FAQ dynamiques, 1 page booking, 1 page pricing. Le contenu blog est de qualité (co-écrit avec une rédactrice spécialisée en périnatalité) et vaut la peine d'être migré tel quel. Le schema.org `Person` + `MedicalBusiness` est bien implémenté. Le site est 100% CSR (Wix Thunderbolt) — la migration vers Next.js SSR/SSG sera un gain SEO majeur.

## Ce qu'on savait (hypothèses du plan)

- Environ 10 articles de blog
- Site Wix standard avec performance moyenne
- Faible présence organique
- Blog Wix classique

## Ce qu'on a trouvé

### Inventaire complet via sitemap

**Pages statiques (8) :**
| URL | Contenu |
|-----|---------|
| `/` | Accueil (hero, services, FAQ, call-to-action) |
| `/a-propos` | Bio Judith, parcours, philosophie |
| `/services` | Vue d'ensemble services |
| `/bienfaits` | Les bienfaits de l'acupuncture (format FAQ) |
| `/acupuncture-sociale` | Page dédiée acupuncture sociale |
| `/contactez-moi` | Contact + formulaire |
| `/blog` | Liste des articles |
| `/politique-de-confidentialite-et-cookies` | Politique légale |

Note : `/book-online` existe dans les résultats Google mais n'est pas dans le sitemap.

**Articles de blog (11) :**
1. Acupuncture et nausées de grossesse (8 min, janv. 2026)
2. Système immunitaire (6 min, oct. 2025)
3. Coliques du nouveau-né (6 min, juil. 2025)
4. Stress et anxiété chez l'enfant (8 min, juin 2025)
5. Fatigue post-natale (7 min, mai 2025)
6. Acupuncture pédiatrique (5 min, juil. 2025)
7. Baby blues et post-partum (7 min, mai 2025)
8. Fertilité — préparer la conception (6 min, avr. 2025)
9. Acupuncture sociale (3 min, mars 2025)
10. Préparation accouchement et induction (3 min, avr. 2025)
11. Bébé en siège (3 min, avr. 2025)

**6 catégories :** Fertilité, Grossesse, Post-partum, Enfant, Acupuncture pour tous, Santé générale

**FAQ dynamiques (6) :** publiées via l'API Wix depuis le Hub V2 (fichiers source dans `scripts/seo-geo/source/`). Sujets : anxiété, FIV/traitement hormonal, nausées grossesse, séances avant FIV, bébé en siège/moxibustion, tomber enceinte naturellement.

**Autres :** 1 page booking ("Première évaluation"), 1 page pricing plans (dernière modif sept. 2024, probablement obsolète).

### Qualité du contenu

**Blog : à migrer tel quel.** Les articles sont co-écrits avec Claire Thomas, rédactrice web spécialisée en périnatalité. Longueur 500-2000 mots, bien structurés, ton empathique et pédagogique. Certains articles (nausées, fertilité) sont particulièrement bien écrits avec un mix de données scientifiques et d'expérience personnelle.

**Pages statiques : à réécrire/améliorer.** La structure est bonne mais le contenu peut être enrichi, surtout les pages services (à éclater en sous-pages par pilier).

**FAQ dynamiques : déjà dans le pipeline.** Ces 6 FAQ sont des contenus SEO produits via le Hub V2 — elles font partie de la stratégie en cours.

### SEO et technique

- **Schema.org** : `Person` + `MedicalBusiness` bien implémenté (site-wide JSON-LD)
- **Rendu** : 100% CSR via Wix Thunderbolt v1.17110.0 — le contenu n'est PAS dans le HTML initial, ce qui pénalise le SEO
- **Polices** : Cormorant Garamond (titres) + Inter (corps)
- **Meta tags** : présents mais basiques ("Acupuncture à Montreal - Rosemont | Judith Dufour Savard")

### Images

- Toutes sur `static.wixstatic.com/media` — URLs publiques, téléchargeables
- Estimation : 30-60 images (pages + articles)
- Wix applique des transformations dynamiques — il faudra télécharger les originaux

### Fonctionnalités Wix utilisées

| Fonctionnalité | Présent | Migration |
|---|---|---|
| Wix Blog | Oui (11 articles) | Migrer contenu, recréer en Next.js |
| Wix Bookings | Oui (1 service) | Remplacé par Go Rendez-Vous |
| Wix FAQ (CMS custom) | Oui (6 FAQ) | Migrer vers Firestore `faqs` |
| Wix Pricing Plans | Oui (1 page) | Probablement obsolète |
| Schema.org JSON-LD | Oui | Recréer en Next.js (améliorer) |
| Formulaire contact | Probable | Recréer nativement |
| Galerie photo | Possible | À vérifier |
| Chat / Newsletter | Non | N/A |

## Surprises et découvertes

1. **Le flag `"isSEO":false` détecté sur la page `/acupuncture-sociale`** — possible problème d'indexation côté Wix pour cette page stratégique.

2. **La page `/bienfaits` est structurée en FAQ** — contenu potentiellement migratable directement dans la collection `faqs` Firestore.

3. **Claire Thomas, rédactrice web spécialisée en périnatalité**, co-signe les articles. C'est un atout de qualité à préserver.

4. **L'article le plus récent date de janvier 2026** — le blog est actif, pas abandonné.

5. **Les articles couvrent déjà les 3 piliers** : fertilité (1), grossesse/périnatalité (5), pédiatrique (3), acupuncture sociale (1), santé générale (1).

## Risques identifiés

1. **Redirections 301 obligatoires** 🟡 : les 11 articles de blog ont du jus SEO. Les slugs Wix (`/post/acupuncture-et-nausees-de-grossesse`) devront être redirigés vers les nouveaux URLs (`/blog/acupuncture-nausees-grossesse`). Si les redirections sont mal faites, on perd le peu de SEO existant.

2. **Contenu Ricos JSON** 🟡 : le contenu blog est en format Ricos (JSON propriétaire Wix). La conversion vers markdown/HTML devra être testée. L'API Wix retourne le Ricos JSON — il faudra un parser.

3. **Images Wix CDN** 🟡 : après migration, les anciennes URLs `static.wixstatic.com` resteront fonctionnelles un temps mais ne sont pas garanties à long terme. Il faut re-uploader vers Firebase Storage.

## Recommandations d'ajustement du plan

1. **Ajouter une matrice de redirections 301** au plan de migration — mapper chaque URL Wix vers la nouvelle URL Next.js

2. **La page `/bienfaits` n'est pas dans l'arborescence proposée** — le contenu pourrait être intégré dans les pages services ou dans les FAQ par pilier

3. **Le contenu pédiatrique (3 articles)** est plus important qu'anticipé dans le plan — considérer si c'est un sous-pilier de Grossesse/Périnatalité ou une page service dédiée

4. **Charge d'inventaire complet estimée : 3-4 heures** — c'est raisonnable et devrait inclure le téléchargement du contenu Ricos + extraction des images originales

## Questions à ramener à Benoit

1. **Les articles co-écrits avec Claire Thomas — a-t-elle une entente qui permet la republication sur un nouveau site ?** Question de droits d'auteur à clarifier.

2. **La page `/bienfaits` — on la garde comme page séparée ou on intègre son contenu dans les FAQ/services ?**

3. **L'acupuncture pédiatrique a 3 articles dédiés — est-ce un pilier à part entière ou un sous-thème de Grossesse/Périnatalité ?** Le plan mentionne "pédiatrie légère" comme incertain.

4. **Le pricing plan Wix (dernière modif sept. 2024) — est-il encore actif ou obsolète ?**

5. **Le flag `isSEO:false` sur la page acupuncture sociale — Judith en est-elle consciente ? A-t-elle des stats de trafic Wix pour confirmer si cette page indexe ?**
