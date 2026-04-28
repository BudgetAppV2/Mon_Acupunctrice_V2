# Plan de pré-lancement et lancement — acupuncturejudith.ca

**Date** : 28 avril 2026
**Objectif** : Maximiser l'impact du lancement du site en préparant le terrain comme un événement

---

## Philosophie

On traite le lancement du site comme une première de spectacle :
- **Pré-production** (maintenant → J-7) : contacter les partenaires, préparer le contenu, créer les fiches
- **Jour J** (switch DNS) : tout est prêt, les backlinks arrivent simultanément
- **Post-première** (J+1 → J+90) : publier du contenu, mesurer, ajuster

---

## PHASE 1 — PRÉ-LANCEMENT (maintenant → J-7)

### 1A. Construction (technique)

| # | Tâche | Responsable | Effort | Statut |
|---|-------|-------------|--------|--------|
| 1 | Créer compte Plausible Analytics | Benoit | 10 min | À faire |
| 2 | MW-F3a : Installer script Plausible | CC | 30 min | À faire |
| 3 | Cherry-pick commit GRV e0ce162 sur main | Benoit | 5 min | À faire |
| 4 | Judith valide preview Vercel | Judith | 10 min | En attente |
| 5 | Créer compte Google Search Console | Benoit | 15 min | À faire |
| 6 | Produire ressource "Acupuncture et ménopause" (22K/mois!) | Benoit + Claude | 3-4h | À faire |
| 7 | Produire 5 FAQ quick-win (SD < 5) | Benoit + Claude | 1h | À faire |
| 8 | MW-E3 : Blog CMS → Firestore | CC | 4-5h | À faire |

### 1B. Contacts et partenariats (le "carnet de route")

#### Cercle 1 — Liens naturels (cette semaine)

Ce sont les gens qui connaissent déjà Judith. La demande est simple et légitime.

| # | Contact | Organisation | Demande | Canal |
|---|---------|-------------|---------|-------|
| 1 | Responsable SEO La Source en Soi | lasourceensoi.com | Lien page équipe + article blog + contacts médias | Rencontre (Annie fait l'intro) |
| 2 | Annie Bouchard (proprio LSSI) | La Source en Soi | Validation lien, mention newsletter | En personne |
| 3 | Collègues praticiens LSSI | La Source en Soi | Partage du site dans leurs réseaux | En personne |
| 4 | Patientes régulières de Judith | — | Demander un avis Google (GBP) | En séance |

#### Cercle 2 — Annuaires et fiches (semaine 1-2)

Pas de contact humain nécessaire — juste créer/mettre à jour des fiches en ligne.

| # | Plateforme | DA | Action | Temps |
|---|-----------|-----|--------|-------|
| 1 | Google Business Profile | 100 | Créer fiche "Judith Dufour-Savard — Acupunctrice" | 30 min |
| 2 | OAQ (o-a-q.org) | ~40 | Vérifier que Judith est dans le répertoire avec lien site | 15 min |
| 3 | AAQ (acupuncture-quebec.com) | ~30 | Idem — répertoire "Trouver un acupuncteur" | 15 min |
| 4 | Lumino Santé / Sun Life | 54 | Mettre à jour fiche avec URL acupuncturejudith.ca | 15 min |
| 5 | 411.ca | 53 | Créer fiche entreprise | 10 min |
| 6 | fresha.com | 62 | Créer profil praticien | 15 min |
| 7 | canpages.ca | 51 | Créer fiche | 10 min |
| 8 | gorendezvous.com | 42 | Vérifier que lien pointe vers acupuncturejudith.ca | 5 min |
| 9 | medimap.ca | 39 | Créer profil | 10 min |
| 10 | goldbook.ca | 38 | Créer fiche | 10 min |
| 11 | Yelp | ~90 | Créer profil | 15 min |
| 12 | ic.gc.ca (Registraire entreprises) | 73 | Vérifier fiche entreprise | 10 min |

Effort total estimé : ~2h30 pour créer les 12 fiches.

#### Cercle 3 — Partenaires santé (semaine 2-3)

Ces contacts demandent un pitch personnalisé. L'angle : "Judith est acupunctrice spécialisée en périnatalité, son nouveau site est une ressource scientifique pour les patientes — voudriez-vous le recommander ?"

| # | Contact | Organisation | Angle | Canal |
|---|---------|-------------|-------|-------|
| 1 | Responsable partenariats | Clinique OVO (+ Procrea fusionné) | "Praticienne complémentaire en acupuncture fertilité — ressources PubMed sur le site" | Email / téléphone |
| 2 | Sages-femmes | Maisons de naissance Montréal | "Ressources grossesse + acupuncture préparation accouchement" | Email |
| 3 | Doulas Montréal | Réseau doulas QC | "Partage de ressources périnatalité" | Email / IG |
| 4 | Collège de Rosemont | Programme acupuncture | "Alumni spotlight" | Email |
| 5 | Nourri-Source Montréal | Allaitement | "Ressource acupuncture + allaitement" | Email |

#### Cercle 4 — Médias (mois 1-2, post-lancement)

Via les contacts de La Source en Soi ou par pitch direct.

| # | Média | DA | Angle de pitch |
|---|-------|-----|---------------|
| 1 | Coup de Pouce | 57 | "L'acupuncture pendant la grossesse : ce que dit la science" |
| 2 | Elle Québec | 54 | "Ménopause sans hormones : l'acupuncture comme alternative" |
| 3 | Voir.ca | 62 | "L'acupuncture sociale : rendre la santé accessible à Rosemont" |
| 4 | Gazette des femmes | 40 | "Fertilité et médecine chinoise : le point sur la recherche" |
| 5 | Maman pour la vie | 51 | "Acupuncture pédiatrique : soulager les coliques naturellement" |
| 6 | Podcast Post-partum (V. Roberts) | 58 | "Invitée : acupunctrice spécialisée en périnatalité" |

---

## PHASE 2 — JOUR J (switch DNS)

### Checklist du jour J

- [ ] Switch DNS acupuncturejudith.ca → Vercel
- [ ] Vérifier que le site est live et fonctionnel
- [ ] Soumettre sitemap.xml à Google Search Console
- [ ] Vérifier que Plausible collecte des données
- [ ] Publier les 12 fiches annuaires (préparées en phase 1)
- [ ] Demander à La Source en Soi d'ajouter le lien (page équipe)
- [ ] Post Instagram Judith : "Mon nouveau site est en ligne !"
- [ ] Post Facebook La Source en Soi (si accord)
- [ ] Email aux patientes régulières (si liste disponible)

### Ce qu'on attend le jour J

- Google commence à crawler le site (2-4h après soumission sitemap)
- Les fiches annuaires créent un pic de backlinks simultané (signal fort)
- Le lien La Source en Soi transfère de l'autorité (DA 26)
- Les premiers visiteurs arrivent via social + direct

---

## PHASE 3 — POST-LANCEMENT (J+1 → J+90)

### Semaine 1 (J+1 → J+7)
- Vérifier indexation Google (site:acupuncturejudith.ca)
- Premiers insights Plausible (traffic, sources, pages populaires)
- Publier 2 articles blog
- Demander des avis Google aux premières patientes

### Semaine 2-4 (J+7 → J+30)
- MW-E1/E2 : CMS FAQ + Ressources (pour industrialiser l'injection)
- Produire 3 nouvelles ressources (SOPK, douleur chronique, insomnie)
- Envoyer les pitchs au Cercle 3 (partenaires santé)
- Google Search Console montre les premiers mots-clés

### Mois 2-3 (J+30 → J+90)
- 20 ressources publiées (objectif)
- Contacter les médias (Cercle 4) via les contacts de LSSI
- Analyser les données GSC : quels mots-clés rankent ? Quels quick wins ?
- Objectif : 500 visiteurs/mois

---

## LISTE DE CONTACTS — À RECHERCHER

Les contacts suivants doivent être identifiés (noms, emails, téléphones) :

### À trouver via Claude in Chrome
- [ ] Responsable partenariats ou soins complémentaires — Clinique OVO Montréal
- [ ] Contact presse — Coup de Pouce magazine
- [ ] Contact presse — Elle Québec
- [ ] Contact rédaction — Voir.ca (section Art de vivre)
- [ ] Contact — Nourri-Source Montréal
- [ ] Contact — Réseau des maisons de naissance du Québec
- [ ] Contact — Association des doulas du Québec
- [ ] Valérie Roberts — Podcast Post-partum (déjà liée à LSSI)
- [ ] Rédactrice — Gazette des femmes
- [ ] Rédactrice — Maman pour la vie

### À obtenir via La Source en Soi (rencontre SEO)
- [ ] Contacts médias que LSSI a déjà (coupdepouce, ellequebec, voir.ca)
- [ ] Contacts WordPress pour modification page équipe
- [ ] Accès newsletter Mailchimp LSSI (pour mention Judith)

---

## MÉTRIQUES DE SUCCÈS

| Métrique | J+0 | J+7 | J+30 | J+90 |
|----------|-----|------|------|------|
| Pages indexées Google | 0 | 20+ | 50+ | 80+ |
| Backlinks (domaines référents) | 0 | 12+ | 20+ | 30+ |
| Visiteurs uniques/mois | 0 | 50 | 200 | 500 |
| Avis Google | 0 | 3 | 10 | 25 |
| Mots-clés top 10 Google | 0 | 3 | 10 | 25 |
| Rendez-vous via site/mois | 0 | 1 | 3 | 10 |

