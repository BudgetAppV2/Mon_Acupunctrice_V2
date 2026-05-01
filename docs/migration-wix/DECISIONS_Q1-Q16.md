# Décisions Q1-Q16 + découvertes du 14 avril 2026

**Contexte** : ce document consolide les réponses aux 16 questions ouvertes identifiées par Claude Code dans `GENERATION_REPORT.md` et une découverte majeure faite en regardant `scripts/seo-geo/`. Il sert de référence pour Claude Code qui exécute les milestones.

**Statut** : décisions validées par Benoit le 14 avril 2026.

---

## 🔥 Découverte majeure : les 5 ressources existent déjà

En regardant `scripts/seo-geo/source-resources/`, on a trouvé **5 ressources déjà rédigées** :

| Fichier | Pilier | Longueur |
|---|---|---|
| `01-acupuncture-fertilite-montreal.md` | Fertilité | ~16 KB, 218 lignes |
| `02-acupuncture-grossesse-montreal.md` | Grossesse | similaire |
| `03-acupuncture-pediatrique-enfants-bebes.md` | Pédiatrie | similaire |
| `04-acupuncture-sante-mentale-anxiete.md` | Transversal (anxiété) | similaire |
| `05-acupuncture-sociale-montreal.md` | Acupuncture sociale | similaire |

Chaque ressource est structurée avec des champs `### CHAMP: xxx` :
- `title`, `slug`, `category`, `metaTitle`, `metaDescription`, `heroImageAlt`
- `shortAnswer`, `introSection`, `scienceSection`, `mechanismSection`, `judithApproach`, `whatToExpect`, `protocolSection`, `testimonial`
- `faqJson` (FAQ embarquée par ressource pour schema.org FAQPage)
- `publishedDate`, `updatedDate`, `authorName`, `relatedGuides`

Un script Node existe déjà : `scripts/seo-geo/publish-all-resources.mjs` (393 lignes) qui :
1. Lit chaque fichier markdown
2. Extrait les champs via `extractField()`
3. Convertit les champs rich text en Ricos via API Wix
4. Publie dans la collection Wix "Resources"

Les 6 FAQ dans `scripts/seo-geo/source/` suivent le même pattern (script `publish-all-faq.mjs`).

**Implication** : pas besoin de rédiger de contenu au lancement. Il faut juste adapter le pipeline pour Firestore au lieu de Wix.


---

## 🎯 Décision architecturale : pattern hub-and-spoke avec les ressources existantes

**Question implicite** : si les 5 ressources existent, où va leur contenu ? Dans la collection `ressources`, `servicePages`, ou les deux ?

**Décision** : **pattern hub-and-spoke à double exploitation d'un seul corpus**.

### Collection `ressources` (spoke — SEO autorité)

Les 5 fichiers sont importés **intégralement** dans la collection `ressources` avec leur contenu long complet (scienceSection, mechanismSection, protocolSection, citations scientifiques, FAQ embarquée). Les pages `/ressources/[slug]` affichent ce contenu.

URLs résultantes :
- `/ressources/acupuncture-fertilite-montreal`
- `/ressources/acupuncture-grossesse-montreal`
- `/ressources/acupuncture-pediatrique-enfants-bebes`
- `/ressources/acupuncture-sante-mentale-anxiete`
- `/ressources/acupuncture-sociale-montreal`

**Rôle** : contenu profond qui ranke sur les long-tail, capture le trafic SEO, affiche l'autorité scientifique avec citations PubMed.

### Collection `servicePages` (hub — funnel conversion)

Les 4 pages services (`/services/fertilite`, `/services/grossesse`, `/services/pediatrie`, `/services/acupuncture-sociale`) sont du contenu **court, vitrine, funnel**. Leur contenu est **extrait** de sections précises des 4 ressources correspondantes (pas le 04 anxiété qui est transversal) :

- **Hero / Intro** : extrait de la section `introSection` de la ressource (humain, ton Judith)
- **Mon approche** : extrait de `judithApproach` (positionnement La Source en Soi)
- **À quoi s'attendre** : extrait de `whatToExpect` (1er rendez-vous, nombre de séances)
- **Encart "Où exerce Judith"** : bloc ClinicBadge avec 4,9/5 · 1 200+ avis
- **CTA final** : "Réserver une séance [pilier]"
- **Lien vers la ressource longue** : "Pour aller plus loin, lisez notre guide scientifique complet →"

**Rôle** : hub court et chaleureux qui convertit vers Go Rendez-Vous, pointe vers la ressource longue pour les lecteurs qui veulent plus.

### Maillage naturel

- La **page service** `/services/fertilite` pointe vers la **ressource** `/ressources/acupuncture-fertilite-montreal` pour "le contenu scientifique complet"
- La **ressource** `/ressources/acupuncture-fertilite-montreal` pointe vers la **page service** `/services/fertilite` via le CTA "Prendre rendez-vous en fertilité"
- Les FAQ de chaque pilier pointent vers la page service (conversion) et vers la ressource (profondeur)
- Les articles de blog pointent vers les deux selon leur angle

### Impact sur les milestones

- **MW-D3 doit être corrigé** : les 5 fichiers `source-resources/*.md` vont vers la collection `ressources`, **pas** `servicePages`. La collection `servicePages` reste vide au lancement (le contenu court est hardcodé dans les fichiers React de MW-C3).
- **MW-C3 doit être précisé** : les pages services extraient des sections spécifiques des 4 ressources correspondantes (fichiers 01, 02, 03, 05) pour leur contenu. Pas de rédaction depuis zéro.
- **MW-D5 est simplifié** : les pages ressources affichent le contenu importé par MW-D3. Pas de "ressources vides au lancement".


---

## ⚠️ Alertes sur le contenu existant

En lisant `source-resources/01-acupuncture-fertilite-montreal.md`, plusieurs flags à noter :

1. **Témoignages fictifs** : le témoignage "Sarah, 36 ans, Rosemont" est explicitement marqué comme fictif dans les notes du fichier (⚠️ "à remplacer par un vrai témoignage anonymisé avec consentement, ou à retirer"). **Il faut retirer ou remplacer tous les témoignages fictifs avant publication**.

2. **Informations biographiques à valider** :
   - "Expérience en maison de naissance" — à confirmer avec Judith
   - "Mère de trois enfants" — à confirmer (3 dans le fichier, alors qu'on a 3 enfants dans les memories : Élie, Noa, Milo — ✅ cohérent)
   - Liste des cliniques de fertilité mentionnées (OVO, McGill, PROCREA) — vérifier qu'elle travaille vraiment avec leurs patientes

3. **Mention "tarif réduit" sur la page fertilité** : à valider, cohérent avec le positionnement solidaire mais peut-être à nuancer selon le contexte.

4. **Images hero manquantes** : chaque ressource doit avoir une image hero (Judith en consultation, cabinet, etc.). Les 8 photos Eric Bates peuvent servir ici.

**Action** : Claude Code qui exécute MW-D3 doit signaler ces points dans son `NOTES.md` pour que Benoit review avant publication. Ne pas importer les témoignages fictifs tels quels — soit les retirer, soit les remplacer par des placeholders `[Témoignage à fournir]`.

---

## 📋 Réponses au Bucket 1 — Décisions architecturales (validées)

### Q6 — Logo pour MW-B3

**Décision** : pas de logo graphique. Juste le nom "Judith Dufour-Savard" en **Cormorant Garamond** (serif), weight 600, avec un small `ACUPUNCTRICE` en Inter uppercase dessous (letter-spacing élevé). C'est ce qui est dans `homepage-v4.html` ligne 179 (`.site-logo`). Un logo SVG pourra être ajouté plus tard en 30 min de swap si Judith le demande.

### Q10 — `04-acupuncture-sante-mentale-anxiete.md`

**Décision** : ressource indépendante transversale (confirmé par l'existant — le fichier est déjà dans `source-resources/`). Elle va dans la collection `ressources` avec `category: 'transversal'` ou `category: 'sante-mentale'`. Elle est cross-linkée depuis les piliers fertilité (anxiété pré-conception) et grossesse (anxiété prénatale) via le maillage interne.

### Q11 — "Rejeter" un contenu dans MW-E4

**Décision** : **remettre en draft** avec deux champs ajoutés au schéma :
- `rejectionReason: string` (raison du rejet pour retravail)
- `rejectedAt: Timestamp` (date du rejet)
- `rejectedBy: string` (qui a rejeté — utile si Judith + Benoit reviewent)

Pas de delete hard. Le contenu rejeté reste visible dans l'admin avec un badge "Rejeté" et la raison, pour itération.

### Q12 — Plausible Analytics (MW-F3)

**Décision** : **Plausible hosted** (~9 $/mois pour 1 site). Raisons :
- Self-hosted demande maintenance serveur + updates + monitoring que Benoit n'a pas le temps de gérer
- 9 $/mois reste largement sous le budget d'économie de Wix (~25-35 $/mois)
- Configuration en 5 minutes, juste un token dans `.env.local`
- Plausible = RGPD-compliant, pas de bandeau cookies nécessaire (cohérent avec positionnement privacy-friendly)

### Q14 — Ressources vides au lancement

**Résolu par l'existant** : 5 ressources déjà rédigées dans `scripts/seo-geo/source-resources/`. MW-D3 les importe dans la collection `ressources`. Au lancement, le silo SEO a 5 entrées profondes, chacune avec schema.org Article + FAQPage embarqué. Suffisant pour l'indexation initiale.

**Flag** : témoignages fictifs à retirer/remplacer avant publication (voir section Alertes ci-dessus).

### Q16 — Cron refresh content (MW-F2) au lancement

**Décision** : au lancement, le cron fait **uniquement** la revalidation ISR des pages publiques. **Pas de génération automatique Claude** au lancement.

Raisons :
- Un générateur Claude non surveillé en prod = risque de contenu médiocre publié
- La génération automatique est déjà prévue en post-MVP (MW-H3)
- Au lancement, Judith écrit manuellement ou via admin Hub les nouvelles FAQ/ressources via MW-E1/E2

Le cron `/api/cron/refresh-content` fait donc :
1. Lit `siteConfig/contentRefresh` pour last run
2. `revalidatePath('/')`, `revalidatePath('/blog')`, `revalidatePath('/faq')`, `revalidatePath('/ressources')` pour rafraîchir le cache ISR
3. Regénère le sitemap si nouveaux contenus
4. Write `siteConfig/contentRefresh.lastRun = now`

La logique de génération Claude reste dans MW-H3 post-MVP, architecturée comme extension de ce cron.


---

## 📋 Réponses au Bucket 2 — Infos métier

### Q1 — Tarifs exacts de l'échelle solidaire (MW-C4)

**Réponse** : échelle solidaire de **35 $ à 50 $** par séance.

**Implication pour la page /tarifs** : la page doit expliquer pédagogiquement comment choisir son tarif dans cette fourchette. Pas de palier rigide (pas de "25$ si étudiant, 35$ si sous le seuil de pauvreté"), mais une invitation à choisir selon sa capacité. Le ton doit enlever la honte du choix à 35$ et démystifier le choix à 50$.

**SEO** : cible la requête "combien coûte acupuncture Montréal" et similaires. La fourchette 35-50$ est significativement plus accessible que le marché standard (70-90$ chez Lumino), c'est un argument de différenciation fort.

### Q2, Q3 — Adresse, horaires, diplômes

**À récupérer depuis** :
- Site Wix actuel (MW-A1 va les exporter)
- Fichiers existants dans `scripts/seo-geo/source-resources/` qui mentionnent "La Source en Soi sur Beaubien Est"
- Profil Judith sur `lasourceensoi.com/equipe/judith-dufour-savard/`

**Diplômes déjà mentionnés dans le contenu existant** :
- Membre de l'Ordre des acupuncteurs du Québec (OAQ)
- Expérience en maison de naissance (à valider avec Judith)
- Mère de 3 enfants (cohérent avec memories : Élie, Noa, Milo)

**Claude Code (MW-A1)** devra confirmer ces infos dans son inventaire et remonter les éléments manquants (téléphone direct, email, horaires exacts).

### Q7 — Emplacement "Site public" dans la nav du Hub

**Décision** : pas décidé immédiatement. À trancher au moment d'exécuter MW-E1. Options à considérer :
- **(a)** Nouvel onglet dans BottomTabBar (passe de 4 à 5 onglets — fragilise l'UX mobile)
- **(b)** Sous-menu dans Profil (accessible via Profil > Site public) — ma reco
- **(c)** Lien dans le header du Hub (si jamais on ajoute un header)

L'admin "Site public" n'est pas une action quotidienne comme Idées/Calendrier — c'est de l'admin de contenu. Le placer dans Profil garde la nav principale propre.

### Q8 — Pédiatrie confirmée et active ?

**À valider avec Judith**. La ressource `03-acupuncture-pediatrique-enfants-bebes.md` existe et a été rédigée, ce qui suggère que Judith pratique ou est prête à pratiquer la pédiatrie. Mais la confirmation finale doit venir d'elle. Si non confirmée : la pédiatrie reste comme ressource (contenu SEO) mais la page service `/services/pediatrie` est reportée post-MVP.

**Flag** : Claude Code exécutant MW-C3 doit vérifier avec Benoit avant de publier la page service pédiatrie.

### Q13 — Google Search Console propriété acupuncturejudith.ca

**À vérifier par Benoit** sur search.google.com/search-console (30 secondes). Si pas configurée, c'est un prérequis de MW-G2 à ajouter à la checklist de pré-lancement.

---

## 📷 Droits photos Eric Bates Images

**Statut** : **droits de Judith** — contrat professionnel payé, les photos appartiennent à Judith. Pas de restriction d'usage pour le site, Firebase Storage, ou Vercel.

**Implication pour MW-A1** : les 8 photos peuvent être commitées dans `public/site/judith/` sans souci de droits. À ajouter dans le NOTES.md du milestone comme confirmation.

---

## 📋 Bucket 3 et 4 — À traiter au fil de l'exécution

Les questions suivantes sont à traiter **au moment où leur milestone respectif est lancé**, pas maintenant :

| # | Question | Quand traiter |
|---|----------|---------------|
| Q4 | Guide de ton : sujets tabous + dispo entretien Judith | Avant MW-A3 |
| Q5 | Relation formelle La Source en Soi | Avant MW-A4 |
| Q9 | Root layout font globale qui interfère ? | Au début de MW-B1 (Claude Code vérifie `app/layout.tsx`) |
| Q15 | Publication Wix via route Next ou CF ? | Au début de MW-E3 (Claude Code lit `app/api/blog/publish/`) |

---

*Dernière mise à jour : 14 avril 2026 — décisions validées par Benoit*
