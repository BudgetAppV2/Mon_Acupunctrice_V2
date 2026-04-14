# Milestone MW-F3 : Intégration Plausible Analytics

**Type** : Automation
**Vague** : 6
**Priorité** : Medium
**Temps estimé Claude Code** : 1-2h
**Dépendances** : MW-B1
**Status** : 🔴 Not started

---

## Objectif

Intégrer Plausible Analytics dans le layout public pour mesurer le trafic du site sans cookies ni consentement, et configurer les custom events pour le tracking des CTAs de réservation.

---

## Contexte minimal

Plausible est le choix d'analytics pour le site public (pas GA4), cohérent avec le positionnement privacy-friendly de Judith. Plausible ne nécessite pas de consentement cookies (RGPD compliant by design). L'intégration est un script léger (~1 KB) à ajouter dans le layout public.

---

## Livrables

- [ ] **Script Plausible** dans le layout public `app/(public)/layout.tsx` — `<script>` tag avec le domain configuré
- [ ] **Custom events** — tracking des clics sur les CTAs "Réserver" via `data-plausible-event` attributes
- [ ] **Configuration Plausible** — document décrivant la création du compte et la configuration du domain

---

## Approche technique

**Intégration script** :
Ajouter dans `app/(public)/layout.tsx` (dans le `<head>`) :
```html
<script
  defer
  data-domain="acupuncturejudith.ca"
  src="https://plausible.io/js/script.js"
/>
```

Plausible ne nécessite aucune config côté client au-delà de ce script. Le dashboard est sur `plausible.io`.

**Custom events** :
Sur chaque `<CtaButton />` qui pointe vers `/reserver` :
```html
<a
  href="/reserver"
  data-plausible-event="cta_click"
  data-plausible-event-page="homepage"
  data-plausible-event-position="hero"
>
```

Sur le bouton de réservation final de `/reserver` :
```html
<a
  href="https://gorendezvous.com/lasourceensoi"
  target="_blank"
  data-plausible-event="reservation_click"
  data-plausible-event-source="reserver"
>
```

Pour activer le tracking des attributs `data-plausible-event`, il faut le script étendu :
```html
<script
  defer
  data-domain="acupuncturejudith.ca"
  src="https://plausible.io/js/script.tagged-events.js"
/>
```

**Configuration** :
1. Créer un compte Plausible (gratuit 30 jours, puis ~9 $/mois — ou self-hosted gratuit)
2. Ajouter le domain `acupuncturejudith.ca`
3. Configurer les goals : `cta_click`, `reservation_click`
4. Vérifier que le script est détecté après déploiement

---

## Fichiers impactés

```
✏️ MODIFY (fichiers existants) :
- app/(public)/layout.tsx (ajout du script Plausible dans <head>)
- app/(public)/_components/CtaButton.tsx (ajout data-plausible-event attributes)
- app/(public)/reserver/page.tsx (ajout data-plausible-event sur le bouton Go Rendez-Vous)
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] Le script Plausible est chargé dans le layout public (vérifiable dans le DOM)
- [ ] Le script n'est PAS chargé dans le layout du Hub admin (`(app)/`)
- [ ] Les CTAs "Réserver" ont les attributs `data-plausible-event` configurés
- [ ] Le bouton Go Rendez-Vous sur `/reserver` a l'event `reservation_click`
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **DOM** : inspecter le `<head>` du layout public — le script Plausible est présent
- **Régression** : le Hub admin ne charge PAS le script Plausible
- **Events** : inspecter un CTA dans le DOM — les attributs `data-plausible-event` sont présents
- **Performance** : Lighthouse — le script defer ne pénalise pas le LCP

---

## Contraintes

- Ne pas ajouter Plausible dans le layout du Hub admin — site public uniquement
- Pas de GA4, pas de Google Analytics, pas de cookies — Plausible uniquement
- Le script doit être chargé en `defer` pour ne pas bloquer le rendu
- Pas de consentement cookies nécessaire (Plausible est privacy-friendly)
- Mobile-first non applicable (c'est un script analytics)

---

## Références

- CLAUDE.md migration — "Analytics : Plausible (pas GA4), cohérent avec positionnement privacy-friendly"
- Plan stratégique §9.3 (tracking clics Go Rendez-Vous), §9.4 (KPIs à tracker)
- MW-B1 (layout public — fichier à modifier)
- MW-C5 (page /reserver — bouton Go Rendez-Vous à tracker)

---

## Notes de planification

- Plausible offre un essai gratuit de 30 jours. Après, c'est ~9 $/mois pour le plan hosted. Alternative : self-hosted Plausible sur un serveur à Benoit (gratuit mais maintenance).
- Point à valider avec Benoit : est-ce que Plausible est déjà configuré (compte créé, domain ajouté) ou faut-il le faire dans ce milestone ?
- Le tracking `reservation_click` est le KPI le plus important — il mesure la conversion finale du funnel. Les `cta_click` mesurent les micro-conversions intermédiaires.
- Les données Plausible seront exploitées dans le dashboard SEO post-MVP (MW-H1).


---

## Décisions 14 avril 2026 (post-reverse-planning)

**Q12 — Plausible hosted vs self-hosted ?** → **Plausible hosted** (~9 $/mois pour 1 site sur plausible.io).

**Raisons** :
- Self-hosted demande maintenance serveur + updates + monitoring continu
- 9 $/mois reste sous le budget d'économie Wix (~25-35 $/mois)
- Setup en 5 minutes, juste un token dans `.env.local`
- Plausible = RGPD-compliant, pas de bandeau cookies nécessaire (cohérent avec positionnement privacy-friendly)
- Tracking events disponible via API simple (`window.plausible('CTA_Reserver_Click')`)

**Setup concret pour ce milestone** :

1. **Créer un compte** sur plausible.io avec le domaine `acupuncturejudith.ca`
2. **Récupérer le script** : `<script defer data-domain="acupuncturejudith.ca" src="https://plausible.io/js/script.js"></script>`
3. **L'ajouter au layout public** (`app/(public)/layout.tsx`) uniquement, pas au layout Hub admin
4. **Créer un wrapper Client Component** `<PlausibleEvent />` pour tracker les clics CTA :
   ```typescript
   'use client'
   export function trackReservationClick(source: string) {
     if (typeof window !== 'undefined' && window.plausible) {
       window.plausible('Reservation_Click', { props: { source } })
     }
   }
   ```
5. **Variable d'env** : `NEXT_PUBLIC_PLAUSIBLE_DOMAIN=acupuncturejudith.ca` dans `.env.local`

**Events à tracker dès le lancement** :
- `Reservation_Click` (avec `source` : homepage, service_fertilite, faq_[slug], ressource_[slug], etc.)
- `Blog_Read` (quand un article blog est scrollé à 80 %)
- `Ressource_Read` (idem pour les ressources)

**Post-MVP** : intégration du dashboard Plausible dans le Hub admin (MW-H1).

**Référence** : `docs/migration-wix/DECISIONS_Q1-Q16.md` Q12
