# Milestone MW-C6 : Page `/contact`

**Type** : UI
**Vague** : 3
**Priorité** : Medium
**Temps estimé Claude Code** : 1-2h
**Dépendances** : MW-B1, MW-B3
**Status** : 🔴 Not started

---

## Objectif

Créer la page `/contact` avec les coordonnées de La Source en Soi, horaires, plan d'accès, et liens vers les canaux de communication.

---

## Contexte minimal

La page contact est une page navigationnelle standard qui doit afficher le NAP canonique de La Source en Soi (adresse, téléphone, email). Le trafic vient des prospects en fin de parcours ("acupuncture Rosemont contact") et des personnes qui cherchent les informations pratiques. Simple mais doit être correcte — le NAP affiché ici doit être identique partout sur le web (plan §8.2).

---

## Livrables

- [ ] **Page `app/(public)/contact/page.tsx`** — Server Component avec : coordonnées, horaires, plan d'accès, liens de communication, CTA vers `/reserver`
- [ ] **Metadata SEO** — optimisée pour "contact acupuncture Rosemont"
- [ ] **Schema.org** — `MedicalClinic` avec `address`, `telephone`, `openingHoursSpecification`, `geo`

---

## Approche technique

**Sections de la page** :

1. **H1** — "Contactez Judith" ou "Comment nous rejoindre"
2. **Bloc coordonnées** — Clinique La Source en Soi, adresse complète, téléphone, email (si applicable), `<ClinicBadge />`
3. **Horaires** — horaires de la clinique (ou de Judith spécifiquement si différents)
4. **Plan d'accès** — image statique Google Maps ou embed iframe léger (avec `loading="lazy"`), mentions des repères locaux (métro Rosemont, quartier Petite-Patrie — plan §8.2)
5. **Réseaux sociaux** — liens Instagram, Facebook, YouTube
6. **CTA** — "Réserver une séance" → `/reserver`

**NAP canonique** (à sourcer depuis MW-A4 ou `siteConfig`) :
- Nom : Clinique La Source en Soi
- Adresse : [adresse complète Rosemont]
- Téléphone : [numéro clinique]

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(public)/contact/page.tsx
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] Le NAP affiché est celui de La Source en Soi (pas une adresse personnelle de Judith)
- [ ] Les horaires sont affichés clairement
- [ ] Le plan d'accès mentionne le quartier et un repère local
- [ ] CTA vers `/reserver` présent
- [ ] Lighthouse 95+ sur la page
- [ ] Schema.org `MedicalClinic` validé avec `address` et `telephone`
- [ ] Responsive correct à 375px, 768px, 1024px
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Visual** : 375px et 1024px
- **SEO** : meta tags, schema.org MedicalClinic avec geo coordinates
- **Contenu** : NAP cohérent avec les autres pages du site et les fiches externes

---

## Contraintes

- Ne pas modifier le code du Hub admin
- Le NAP doit être celui de La Source en Soi — pas d'adresse personnelle de Judith
- Ne pas créer de formulaire de contact complexe — un lien `mailto:` ou un bouton téléphone suffit au lancement
- Pas d'embed Google Maps lourd — préférer une image statique avec un lien "Ouvrir dans Google Maps"
- Mobile-first 375px
- Pas d'emojis

---

## Références

- Plan stratégique §8.2 (cohérence NAP, mentions quartiers), §9.1 (CTAs)
- CLAUDE.md migration — invariant NAP La Source en Soi
- MW-A4 (audit NAP — source des coordonnées vérifiées)
- MW-B3 (`<ClinicBadge />`, `<CtaButton />`, `<SectionHeading />`)

---

## Notes de planification

- Point à valider avec Benoit : l'adresse exacte de La Source en Soi, les horaires d'ouverture, et le téléphone/email de contact à afficher.
- Le plan d'accès peut mentionner : métro Rosemont, bus, stationnement si applicable. Mentions naturelles sans bourrage (plan §8.2).
- Cette page est la plus simple du site — 1-2h maximum. Si terminée rapidement, elle peut servir de test de validation du design system avant les pages plus complexes.
