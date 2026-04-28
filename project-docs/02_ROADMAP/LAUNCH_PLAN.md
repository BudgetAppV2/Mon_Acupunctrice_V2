# Plan de lancement — acupuncturejudith.ca
## Version 2.0 — 28 avril 2026

**Approche** : On traite le lancement du site comme un événement.
En événementiel, tu ne te contentes pas d'ouvrir les portes — tu crées un build-up.

---

## TIMELINE — Vue d'ensemble

```
J-21 à J-14  │ FONDATIONS        │ Préparer tout ce qui peut l'être
J-14 à J-7   │ BUILD-UP           │ Créer les comptes, contacter les partenaires
J-7  à J-1   │ BUZZ               │ Annoncer, teaser, préparer le jour J
J-0          │ LANCEMENT          │ Switch DNS, tout publier simultanément
J+1 à J+7   │ AMPLIFICATION      │ Pousser, mesurer, ajuster
J+7 à J+30  │ CROISSANCE         │ Contenu + outreach + optimisation
J+30 à J+90 │ DOMINATION         │ Publier massivement, contacter les médias
```

---

## PHASE 0 — FONDATIONS (J-21 à J-14)

### Ce qu'on fait MAINTENANT, sans attendre Judith

| # | Action | Qui | Effort | Statut |
|---|--------|-----|--------|--------|
| 1 | Cherry-pick commit GRV `e0ce162` sur main | Benoit | 5 min | À faire |
| 2 | Créer compte Plausible Analytics (9$/mois) | Benoit | 10 min | À faire |
| 3 | MW-F3a : Script Plausible dans layout.tsx | CC | 30 min | À faire |
| 4 | MW-E3 : Blog publish → Firestore (couper Wix) | CC | 4-5h | À faire |
| 5 | Produire ressource "Acupuncture et ménopause" | Benoit + Claude | 3-4h | À faire |
| 6 | Produire 5 FAQ quick-win (SD < 5) | Benoit + Claude | 1h | À faire |
| 7 | Produire ressource "Acupuncture et SOPK" | Benoit + Claude | 2-3h | À faire |
| 8 | Préparer le Google Business Profile (SANS publier) | Benoit | 30 min | À faire |

### Pourquoi ces actions n'attendent PAS le DNS
- Plausible : le script sera prêt dans le code, il collectera dès le switch
- Blog CMS : on peut publier du contenu dans Firestore, il apparaîtra au switch
- Ressources/FAQ : même chose, elles seront dans Firestore prêtes pour le jour J
- GBP : on peut remplir la fiche en mode brouillon

---

## PHASE 1 — BUILD-UP (J-14 à J-7)

### 1A. Créer les fiches annuaires (Cercle 2)

Les fiches peuvent être créées AVANT le switch DNS. On met l'URL acupuncturejudith.ca
même si elle ne pointe pas encore vers le bon serveur — quand le DNS switchera,
tous les liens seront instantanément actifs.

| # | Plateforme | DA | Temps | Notes |
|---|-----------|-----|-------|-------|
| 1 | Google Business Profile | 100 | 30 min | Post "Opening Soon" = 15-25 RDV avant J-0! |
| 2 | OAQ — o-a-q.org | ~40 | 15 min | Répertoire membres — Judith est déjà membre |
| 3 | AAQ — acupuncture-quebec.com | ~30 | 15 min | Répertoire "Trouver un acupuncteur" |
| 4 | Lumino Santé (Sun Life) | 54 | 15 min | Profil praticien |
| 5 | 411.ca | 53 | 10 min | Fiche entreprise |
| 6 | fresha.com | 62 | 15 min | Profil praticien |
| 7 | canpages.ca | 51 | 10 min | Fiche |
| 8 | Go Rendez-Vous | 42 | 5 min | Vérifier lien → acupuncturejudith.ca |
| 9 | medimap.ca | 39 | 10 min | Profil praticien |
| 10 | goldbook.ca | 38 | 10 min | Fiche |
| 11 | Yelp | ~90 | 15 min | Profil |
| 12 | ic.gc.ca | 73 | 10 min | Registraire entreprises |

**Effort total : ~2h30** pour 12 backlinks DA 38-100.

**HACK GBP** : Publier un post "Opening Soon" sur Google Business Profile
30 jours avant le lancement. D'après les données, ça peut générer
15-25 demandes de rendez-vous avant même l'ouverture du site.

### 1B. Contacter les partenaires naturels (Cercle 1)

| # | Qui | Demande | Préparé? |
|---|-----|---------|----------|
| 1 | Responsable SEO La Source en Soi | Lien page équipe + article blog + contacts médias | Document de prep prêt |
| 2 | Annie Bouchard (proprio LSSI) | Validation lien + mention newsletter | Contact établi |
| 3 | Collègues praticiens LSSI | "Partagez le nouveau site quand il sera live!" | En personne |
| 4 | Go Rendez-Vous | Vérifier que le profil linke vers acupuncturejudith.ca | Email/téléphone |

### 1C. Préparer le contenu social du lancement

| # | Contenu | Plateforme | Quand publier |
|---|---------|-----------|---------------|
| 1 | Story teaser "Quelque chose arrive bientôt..." | IG | J-7 |
| 2 | Post carrousel "Mon nouveau site est en construction" | IG/FB | J-5 |
| 3 | Story compte à rebours | IG | J-3 |
| 4 | Reel "Visite guidée du nouveau site" (screen recording) | IG/FB | J-0 |
| 5 | Post annonce officielle | IG/FB | J-0 |
| 6 | Story "Le site est live — lien en bio!" | IG | J-0 |

Note : tout ce contenu peut être préparé dans le Hub à l'avance.

---

## PHASE 2 — BUZZ (J-7 à J-1)

### Actions J-7

- [ ] Publier les stories teaser sur IG
- [ ] Préparer le post d'annonce officielle (caption + visuels)
- [ ] Vérifier tous les liens du site une dernière fois
- [ ] Demander à 5 patientes proches de Judith de "se préparer à laisser un avis Google"
- [ ] S'assurer que les 12 fiches annuaires sont prêtes à publier

### Actions J-3

- [ ] Story compte à rebours IG
- [ ] Confirmer avec La Source en Soi que le lien sera ajouté le jour J
- [ ] Tester le flow de réservation GRV de bout en bout

### Actions J-1

- [ ] Préparer tous les onglets ouverts : Vercel DNS, GSC, Plausible, GBP
- [ ] Rédiger l'email pour les patientes (si liste dispo)
- [ ] Vérifier le build Vercel une dernière fois
- [ ] Préparer le screen recording pour le Reel de lancement

---

## PHASE 3 — JOUR J (switch DNS)

### Le matin du jour J — Ordre des opérations

```
08:00  Switcher le DNS (acupuncturejudith.ca → Vercel)
08:15  Vérifier que le site est live (tester 5-6 pages)
08:30  Soumettre sitemap.xml à Google Search Console
08:45  Vérifier Plausible Analytics (premiers hits)
09:00  Publier les 12 fiches annuaires (pic de backlinks simultané)
09:30  Demander à LSSI d'ajouter le lien page équipe
10:00  Publier le Reel/post d'annonce sur IG
10:15  Publier le post sur FB
10:30  Publier la story IG "Le site est live!"
11:00  Envoyer l'email aux patientes (si applicable)
12:00  Post GBP "Nous sommes ouverts — visitez notre nouveau site!"
```

### Pourquoi cet ordre ?

1. **DNS d'abord** — le site doit être live avant toute annonce
2. **GSC ensuite** — Google commence à crawler immédiatement
3. **Annuaires en bloc** — le pic simultané de backlinks envoie un signal fort à Google
4. **LSSI** — le backlink DA 26 est le plus précieux
5. **Social en dernier** — quand les gens cliquent, tout fonctionne déjà

---

## PHASE 4 — AMPLIFICATION (J+1 à J+7)

| Jour | Action |
|------|--------|
| J+1 | Vérifier indexation Google (site:acupuncturejudith.ca) |
| J+1 | Répondre aux commentaires/DM sur les posts IG/FB |
| J+2 | Publier article blog #1 (prêt depuis Phase 0) |
| J+3 | Demander les premiers avis Google (5 patientes) |
| J+4 | Story IG "Merci pour vos messages!" + partager avis Google |
| J+5 | Publier article blog #2 |
| J+7 | Premier bilan Plausible : combien de visiteurs ? D'où viennent-ils ? |

---

## PHASE 5 — CROISSANCE (J+7 à J+30)

### Contenu (2-3 pièces/semaine)

Puiser dans le KEYWORD_BACKLOG.md — 27 contenus priorisés.
Objectif : 10 nouvelles pages dans le premier mois.

### Outreach Cercle 3 — Partenaires santé (1 email/jour)

| # | Contact | Organisation | Angle |
|---|---------|-------------|-------|
| 1 | Partenariats | Clinique OVO/Procrea (fusionnés) | "Acupunctrice complémentaire — ressources scientifiques fertilité" |
| 2 | Sages-femmes | Maisons de naissance MTL | "Ressources grossesse + préparation accouchement" |
| 3 | Doulas | Réseau doulas QC | "Partage de ressources périnatalité" |
| 4 | Programme acupuncture | Collège de Rosemont | "Alumni spotlight" |
| 5 | Allaitement | Nourri-Source Montréal | "Acupuncture + allaitement" |

### Avis Google

Objectif : 10 avis dans le premier mois.
Judith demande un avis à chaque patiente satisfaite.
QR code dans le cabinet qui mène directement à la page d'avis.

### Mesure

Premier rapport Plausible + GSC à J+30 :
- Combien de visiteurs/jour ?
- Top pages d'entrée ?
- D'où vient le traffic (organic, referral, social, direct) ?
- Premiers mots-clés qui rankent ?

---

## PHASE 6 — DOMINATION (J+30 à J+90)

### Contenu

Objectif : 20 ressources + 25 FAQ + 20 articles blog.
= Le hub de contenu acupuncture le plus complet au Québec.

### Outreach Cercle 4 — Médias (via contacts LSSI)

| # | Média | DA | Angle de pitch |
|---|-------|-----|---------------|
| 1 | Coup de Pouce | 57 | "Grossesse : ce que la science dit sur l'acupuncture" |
| 2 | Elle Québec | 54 | "Ménopause sans hormones : l'acupuncture comme alternative" |
| 3 | Voir.ca | 62 | "L'acupuncture sociale : rendre la santé accessible" |
| 4 | Gazette des femmes | 40 | "Fertilité et médecine chinoise" |
| 5 | Maman pour la vie | 51 | "Coliques de bébé : l'acupuncture pédiatrique" |
| 6 | Podcast Post-partum | 58 | Invitée acupunctrice spécialisée |

### GEO

Les 20+ ressources publiées couvrent les 26 prompts LLM identifiés.
Quand quelqu'un demande à ChatGPT "recommande-moi un acupuncteur à Montréal",
le site devrait commencer à apparaître dans les réponses.

---

## CE QU'ON PEUT AVANCER MAINTENANT (sans toucher au DNS)

### Immédiat (cette semaine)

1. ✅ Cherry-pick GRV sur main
2. ✅ Créer compte Plausible
3. ✅ Sprint CC : MW-F3a (Plausible) + MW-E3 (Blog→Firestore)
4. ✅ Session production contenu : ressource ménopause + 5 FAQ
5. ✅ Préparer GBP en mode brouillon

### Semaine prochaine

6. ✅ Sprint CC : MW-E1 (FAQ CMS) + MW-E2 (Ressources CMS)
7. ✅ Créer les 12 fiches annuaires (en mode brouillon ou avec URL)
8. ✅ Rencontre SEO La Source en Soi
9. ✅ Produire ressources SOPK + douleur chronique
10. ✅ Préparer les contenus social de lancement dans le Hub

### Quand Judith valide

11. Intégrer ses feedbacks
12. Fixer la date du jour J
13. Lancer la timeline J-7

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

---

## CONTACTS À IDENTIFIER (mission Claude in Chrome)

- [ ] Responsable partenariats Clinique OVO Montréal
- [ ] Contact presse Coup de Pouce
- [ ] Contact presse Elle Québec
- [ ] Contact rédaction Voir.ca
- [ ] Contact Nourri-Source Montréal
- [ ] Contact maisons de naissance Montréal
- [ ] Contact Association des doulas QC
- [ ] Valérie Roberts (Podcast Post-partum)
- [ ] Rédactrice Gazette des femmes
- [ ] Rédactrice Maman pour la vie

