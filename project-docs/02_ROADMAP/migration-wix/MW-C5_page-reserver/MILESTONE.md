# Milestone MW-C5 : Page `/reserver` — landing de confiance

**Type** : UI
**Vague** : 3
**Priorité** : Critical
**Temps estimé Claude Code** : 2-3h
**Dépendances** : MW-B1, MW-B3
**Status** : 🔴 Not started

---

## Objectif

Créer la page `/reserver` comme landing de confiance qui transforme la friction de Go Rendez-Vous (sélection manuelle de Judith dans la liste) en argument de crédibilité, avec témoignages curatés et CTA final.

---

## Contexte minimal

Go Rendez-Vous atterrit sur la page de la clinique La Source en Soi, pas directement sur le profil de Judith. Au lieu de subir cette friction, la page `/reserver` l'explique et la retourne en signal de confiance : Judith exerce dans une clinique spécialisée réputée. C'est la fin du funnel — la page fait simultanément conversion, réassurance, renforcement du positionnement, et empilement du social proof (plan §9.1).

---

## Livrables

- [ ] **Page `app/(public)/reserver/page.tsx`** — Server Component avec les 6 sections décrites dans le plan §9.1
- [ ] **Section témoignages curatés** — 3-5 avis Google sélectionnés (source MW-A4), avec attribution "Avis Google sur la clinique La Source en Soi"
- [ ] **Metadata SEO** — optimisée pour "réserver acupuncture Rosemont"
- [ ] **Schema.org** — `MedicalClinic` avec `potentialAction: ReserveAction`

---

## Approche technique

**Sections de la page** (plan §9.1) :

1. **H1 rassurant** — "Réserver une séance avec Judith"
2. **Texte stratégique** (3-4 phrases) — explique que Judith exerce à La Source en Soi, que le bouton dirige vers le système de réservation de la clinique, instruction claire "Sélectionnez Judith Dufour-Savard dans la liste", bénéfice "Vous bénéficiez de l'environnement d'une clinique spécialisée"
3. **Bouton primaire** — "Ouvrir le système de réservation →", `target="_blank"`, `rel="noopener"`, URL `https://gorendezvous.com/lasourceensoi`
4. **Encadré réassurance** — "Besoin d'aide ?" avec téléphone clinique et lien `/contact`
5. **Section "À quoi s'attendre"** — 3-4 points courts (durée, accueil, déroulement, suivi)
6. **Section "Témoignages"** — 3-5 avis Google récents sélectionnés, attribution claire, `<ClinicBadge />` avec le nombre total d'avis

**Témoignages** :
Les 3-5 avis sélectionnés proviennent de l'analyse de MW-A4. Ils sont hardcodés dans la page (pas de widget API, pas de CMS — décision plan §8.1b). En priorité : avis mentionnant Judith par son nom. Attribution : "Avis Google sur la clinique La Source en Soi, où exerce Judith".

**Event tracking** (préparation pour MW-F3 Plausible) :
Ajouter un `data-plausible-event="reservation_click"` sur le bouton de réservation pour le tracking futur. Pas de JavaScript de tracking dans ce milestone — juste les attributs data.

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(public)/reserver/page.tsx
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] Le bouton de réservation ouvre `gorendezvous.com/lasourceensoi` dans un nouvel onglet
- [ ] L'instruction de sélection de Judith est claire et visible
- [ ] 3-5 témoignages affichés avec attribution source correcte
- [ ] `<ClinicBadge />` affiché avec "★ 4,9/5 · 1 200+ avis Google"
- [ ] Lighthouse 95+ sur la page
- [ ] Schema.org validé
- [ ] Responsive correct à 375px, 768px, 1024px
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Visual** : 375px et 1024px — le bouton CTA est visible et proéminent
- **SEO** : meta tags, schema.org
- **Fonctionnel** : le lien Go Rendez-Vous s'ouvre correctement dans un nouvel onglet
- **Contenu** : vérifier que l'instruction de sélection de Judith est explicite

---

## Contraintes

- Ne pas modifier le code du Hub admin
- Ne pas utiliser de widget Google Reviews embarqué — témoignages hardcodés avec attribution
- Ne pas inventer de témoignages — uniquement des vrais avis vérifiables depuis Google Maps
- L'URL Go Rendez-Vous est `https://gorendezvous.com/lasourceensoi` (pas de deep-link avec employeeId — décision plan §9.3)
- Vouvoiement
- Mobile-first 375px
- Pas d'emojis

---

## Références

- Plan stratégique §9.1 (page /reserver détaillée), §8.1b (témoignages curatés), §9.3 (paramètres Go Rendez-Vous)
- MW-A4 (avis Google analysés — source des témoignages)
- MW-B3 (`<ClinicBadge />`, `<CtaButton />`, `<SectionHeading />`, `<TestimonialCard />`)

---

## Notes de planification

- Les témoignages sont hardcodés pour le MVP. Si Benoit souhaite un système de rotation ou de mise à jour facile, on peut stocker les avis dans `siteConfig/testimonials` dans Firestore plus tard.
- Le bouton CTA est le plus important de tout le site — design prominent, couleur accent, taille lg.
- Point à valider avec Benoit : les 3-5 avis sélectionnés en MW-A4 sont-ils suffisamment pertinents ? Idéalement, au moins 1 mentionne Judith par son nom.
- Gotcha : Go Rendez-Vous peut changer son interface ou ses URLs. Prévoir un commentaire dans le code indiquant où mettre à jour l'URL si nécessaire.
