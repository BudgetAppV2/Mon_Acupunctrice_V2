# MW-C4 / C5 / C6 — Pages utilitaires SEO-optimisées

**One-shot prompt pour Claude Code.** 3 pages en une exécution.

---

## Contexte

3 pages courtes (tarifs, réserver, contact) qui remplacent les placeholders MW-B1. **Directive Benoit** : optimiser chaque détail pour maximiser le SEO (particulièrement SEO local — "acupuncteur Rosemont", "acupuncture Beaubien Est", "acupuncture Montréal").

**Priorités SEO** (dans l'ordre) :
1. **Schema.org LocalBusiness / MedicalBusiness** avec geo, openingHoursSpecification, aggregateRating
2. **NAP consistency** (Nom/Adresse/Phone identiques partout)
3. **Google Maps iframe embed** sur /contact (critique local pack)
4. **FAQPage Schema** sur /tarifs (5 questions rich snippet)
5. **BreadcrumbList** sur les 3 pages
6. **Core Web Vitals préservés** (pas d'iframe GRV, pas de JS tiers lourd)
7. **Mots-clés locaux** dans H1/metaTitle/metaDescription

---

## Stack

Next.js 15 App Router, TypeScript strict, Tailwind, Server Components. Aucune nouvelle dépendance.

---

## Fichiers à lire AVANT

1. **`project-docs/02_ROADMAP/migration-wix/MW-C456_pages-utilitaires/CONTENU_BROUILLON.md`** → texte exact verbatim + toutes les décisions SEO
2. **Pattern MW-C3** : `app/(public)/_sections/ServiceFertilite*.tsx` → structure à répliquer pour les sections des 3 pages
3. **`app/(public)/_components/RessourceFaq.tsx`** → **RÉUTILISE ce composant** pour la FAQ tarifs (`<details>` natif SSR)
4. **`app/(public)/_components/CtaButton.tsx`**, `SectionHeading.tsx`, `SectionNumber.tsx` → composants standards
5. **Pages placeholders actuels** : `app/(public)/tarifs/page.tsx`, `app/(public)/reserver/page.tsx`, `app/(public)/contact/page.tsx` → à REMPLACER

---

## Architecture

```
app/(public)/tarifs/page.tsx                   (remplace placeholder, ~120 lignes avec inline sections)
app/(public)/reserver/page.tsx                 (remplace placeholder, ~100 lignes avec inline sections)
app/(public)/contact/page.tsx                  (remplace placeholder, ~140 lignes avec inline sections — page la plus riche)
```

**Décision architecturale** : pas de sections séparées dans `_sections/` pour ces 3 pages. Chacune est suffisamment courte pour être tout inline dans `page.tsx`. Ça évite la prolifération de fichiers et reste sous 150 lignes / page.

---

## Livrable 1 — `app/(public)/tarifs/page.tsx`

### Metadata
```tsx
export const metadata: Metadata = {
  title: 'Tarifs — Acupuncture à Rosemont, Montréal',
  description: 'Tarifs transparents pour mes services d\'acupuncture à La Source en Soi (Rosemont). Consultation privée 90 $/h, acupuncture sociale à tarif libre (35-50 $). Reçu pour assurances.',
};
```

### Structure (6 sections inline)

1. **Hero** — Kicker "TARIFS", H1 "Tarifs transparents, accessibles à tous.", sous-titre.
2. **2 offres en cards** — Grid md:grid-cols-2, card "Consultation privée 90 $" + card "Acupuncture sociale 35-50 $"
3. **Ce qui est inclus** — Bg `bg-public-beige-bg`, liste 5 points avec CheckIcon
4. **Infos pratiques (3 cards)** — Paiement / Assurances / Annulation
5. **FAQ tarifs** — Utiliser `<RessourceFaq entries={FAQ_TARIFS} />`, 5 questions (voir CONTENU_BROUILLON)
6. **CTA final** — Bouton primaire GRV + secondaire /contact

### Schema.org (dangerouslySetInnerHTML)

3 JSON-LD combinés dans un array :

```jsonc
[
  {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    "name": "Judith Dufour-Savard — Acupuncture",
    "telephone": "+1-514-750-3735",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "2554 rue Beaubien Est",
      "addressLocality": "Montréal",
      "addressRegion": "QC",
      "postalCode": "H1Y 1G3",
      "addressCountry": "CA"
    },
    "priceRange": "$$",
    "paymentAccepted": "Cash, Credit Card, Debit Card, Interac",
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "Services d'acupuncture",
      "itemListElement": [
        {
          "@type": "Offer",
          "name": "Consultation privée d'acupuncture",
          "description": "Séance individuelle de 60 minutes en cabinet privé",
          "price": "90",
          "priceCurrency": "CAD",
          "eligibleDuration": { "@type": "QuantitativeValue", "value": 60, "unitCode": "MIN" }
        },
        {
          "@type": "Offer",
          "name": "Acupuncture sociale",
          "description": "Séance en petit groupe, tarif libre 35-50 $",
          "priceSpecification": {
            "@type": "PriceSpecification",
            "minPrice": "35",
            "maxPrice": "50",
            "priceCurrency": "CAD"
          },
          "eligibleDuration": { "@type": "QuantitativeValue", "minValue": 30, "maxValue": 45, "unitCode": "MIN" }
        }
      ]
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [ /* 5 questions de CONTENU_BROUILLON Section 5 */ ]
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://acupuncturejudith.ca/" },
      { "@type": "ListItem", "position": 2, "name": "Tarifs", "item": "https://acupuncturejudith.ca/tarifs" }
    ]
  }
]
```

---

## Livrable 2 — `app/(public)/reserver/page.tsx`

### Metadata
```tsx
export const metadata: Metadata = {
  title: 'Prendre rendez-vous — Acupuncture Rosemont, Montréal',
  description: 'Réservez votre séance d\'acupuncture à Rosemont en ligne, par téléphone ou par courriel. Disponibilités en temps réel via Go Rendez-Vous. Clinique La Source en Soi.',
};
```

### Structure (6 sections inline)

1. **Hero** — Kicker "RÉSERVER", H1 "Prendre rendez-vous.", sous-titre
2. **Option principale (en ligne)** — Gros bouton Go Rendez-Vous, lien direct URL `https://www.gorendezvous.com/lasourceensoi?companyId=104074`, `target="_blank" rel="noopener noreferrer"`
3. **3 autres moyens (cards)** — Téléphone / Courriel / En clinique. Icônes SVG inline.
4. **Ce à quoi s'attendre** — 3 points : Durée / Tenue / À apporter
5. **Horaires de consultation** — avec `[TODO Judith]` placeholder plausible (Mar-Ven 9-19h, Sam 9-15h)
6. **CTA final** — Bouton primaire GRV + secondaire /tarifs

### Schema.org

```jsonc
[
  {
    "@context": "https://schema.org",
    "@type": "MedicalBusiness",
    /* idem que /tarifs pour NAP consistency */
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "19:00"
      },
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": "Saturday",
        "opens": "09:00",
        "closes": "15:00"
      }
    ],
    "potentialAction": {
      "@type": "ReserveAction",
      "target": "https://www.gorendezvous.com/lasourceensoi?companyId=104074",
      "result": { "@type": "Reservation", "name": "Séance d'acupuncture" }
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://acupuncturejudith.ca/" },
      { "@type": "ListItem", "position": 2, "name": "Réserver", "item": "https://acupuncturejudith.ca/reserver" }
    ]
  }
]
```

**IMPORTANT** : ajouter un commentaire HTML `{/* TODO Judith: horaires à valider */}` au-dessus de l'array `openingHoursSpecification`.

---

## Livrable 3 — `app/(public)/contact/page.tsx` (la plus riche SEO)

### Metadata
```tsx
export const metadata: Metadata = {
  title: 'Contact — Acupuncture Rosemont, Beaubien Est, Montréal',
  description: 'Contactez Judith Dufour-Savard, acupunctrice à Rosemont. Clinique La Source en Soi, 2554 rue Beaubien Est. Par téléphone, courriel ou en personne.',
};
```

### Structure (6 sections inline)

1. **Hero** — Kicker "CONTACT", H1 "Restons en contact.", sous-titre
2. **Coordonnées clinique (NAP bloc)** — NAP complet visible au-dessus de la fold, icons (📞 ✉ 🌐 📍 → remplacer par SVG inline simples), mention métro Beaubien + stationnement, badge "⭐ 4,9/5 sur 1 215 avis Google"
3. **Horaires** — même contenu que /reserver (cohérence, SEO ne pénalise pas la répétition structurée)
4. **Google Maps iframe** — **CRITIQUE** :
```html
<iframe
  src="https://www.google.com/maps?q=2554+rue+Beaubien+Est+Montreal+QC&output=embed"
  width="100%" height="400" style={{ border: 0 }}
  loading="lazy"
  referrerPolicy="no-referrer-when-downgrade"
  title="Carte Google Maps — La Source en Soi"
  className="rounded-[14px] shadow-public-sm"
></iframe>
```
Attention syntaxe JSX : `style={{ border: 0 }}` et `referrerPolicy` (camelCase).

5. **Écrivez-moi** — Gros bouton `<a href="mailto:[TODO]?subject=Question pour Judith">`. Commentaire inline `{/* TODO Judith: email à compléter, placeholder suggéré info@acupuncturejudith.ca */}`.
6. **CTA final** — 3 boutons : GRV / /tarifs / /services/fertilite

### Schema.org (LE PLUS COMPLET)

```jsonc
[
  {
    "@context": "https://schema.org",
    "@type": ["MedicalBusiness", "LocalBusiness"],
    "@id": "https://acupuncturejudith.ca/#business",
    "name": "Judith Dufour-Savard — Acupuncture",
    "image": "https://acupuncturejudith.ca/site/judith/judith-portrait-01.jpg",
    "telephone": "+1-514-750-3735",
    "url": "https://acupuncturejudith.ca",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "2554 rue Beaubien Est",
      "addressLocality": "Montréal",
      "addressRegion": "QC",
      "postalCode": "H1Y 1G3",
      "addressCountry": "CA"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 45.5501,
      "longitude": -73.5832
    },
    "openingHoursSpecification": [
      { "@type": "OpeningHoursSpecification", "dayOfWeek": ["Tuesday", "Wednesday", "Thursday", "Friday"], "opens": "09:00", "closes": "19:00" },
      { "@type": "OpeningHoursSpecification", "dayOfWeek": "Saturday", "opens": "09:00", "closes": "15:00" }
    ],
    "priceRange": "$$",
    "medicalSpecialty": ["Acupuncture", "Obstetrics", "Pediatrics"],
    "availableLanguage": ["French", "English"],
    "paymentAccepted": "Cash, Credit Card, Debit Card, Interac",
    "areaServed": [
      { "@type": "City", "name": "Montréal" },
      { "@type": "AdministrativeArea", "name": "Rosemont—La Petite-Patrie" }
    ],
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "1215",
      "bestRating": "5"
    },
    "memberOf": { "@type": "Organization", "name": "Ordre des acupuncteurs du Québec" },
    "parentOrganization": {
      "@type": "MedicalClinic",
      "name": "La Source en Soi",
      "url": "https://lasourceensoi.com/"
    },
    "sameAs": [
      "https://www.instagram.com/mon_acupunctrice/",
      "https://lasourceensoi.com/"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    "mainEntity": {
      "@id": "https://acupuncturejudith.ca/#business"
    }
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://acupuncturejudith.ca/" },
      { "@type": "ListItem", "position": 2, "name": "Contact", "item": "https://acupuncturejudith.ca/contact" }
    ]
  }
]
```

**NOTE Important** : mettre `@id: "https://acupuncturejudith.ca/#business"` sur le MedicalBusiness de /contact pour qu'il devienne la référence canonique. Les autres pages (/tarifs, /reserver) peuvent référencer via `"mainEntity": { "@id": "https://acupuncturejudith.ca/#business" }`. Ça évite la duplication et renforce le signal unique pour Google.

---

## Contraintes (ce qu'on ne fait PAS)

- Ne pas modifier `_components/` existants, `(app)/`, `(auth)/`, `tailwind.config.ts`, `next.config.mjs`, `firestore.rules`
- **Ne pas** intégrer d'iframe Go Rendez-Vous — bouton simple seulement (Core Web Vitals)
- **Ne pas** créer un formulaire de contact avec backend — `mailto:` simple
- **Ne pas** oublier le Schema.org sur les 3 pages (c'est la priorité SEO)
- **Ne pas** oublier NAP identique sur les 3 pages (2554 rue Beaubien Est, 514 750-3735, même email quand TODO résolu)
- Pas d'emojis dans le code source (utiliser SVG inline ou caractères Unicode seulement si absolument nécessaire)
- Pages < 150 lignes chacune
- Mobile-first 375px
- `export default`, pas `'use client'`
- **Copier le texte VERBATIM** de CONTENU_BROUILLON.md

---

## Definition of Done

### Build
- [ ] `npm run build` passe
- [ ] 3 routes static : `/tarifs`, `/reserver`, `/contact`

### Contenu
- [ ] `/tarifs` : H1 "Tarifs transparents, accessibles à tous."
- [ ] `/reserver` : H1 "Prendre rendez-vous."
- [ ] `/contact` : H1 "Restons en contact."
- [ ] NAP identique sur les 3 pages : `2554 rue Beaubien Est`, `Montréal`, `H1Y 1G3`, `514 750-3735`
- [ ] Tarifs : 90 $ consultation privée, 35-50 $ acupuncture sociale
- [ ] FAQ tarifs : 5 questions via `<RessourceFaq>` composant existant MW-D5

### Schema.org (LE PLUS CRITIQUE)
- [ ] `/tarifs` : MedicalBusiness + OfferCatalog (2 Offers) + FAQPage + BreadcrumbList
- [ ] `/reserver` : MedicalBusiness + openingHoursSpecification + ReserveAction + BreadcrumbList
- [ ] `/contact` : MedicalBusiness COMPLET (@id canonique) + ContactPage + BreadcrumbList
- [ ] AggregateRating 4.9/5, 1215 avis présent sur /contact
- [ ] GeoCoordinates présent sur /contact (45.5501, -73.5832)

### SEO local
- [ ] Google Maps iframe embed sur /contact (lazy loading, referrerPolicy)
- [ ] Pas d'iframe Go Rendez-Vous (vérifier absence)
- [ ] Mots-clés locaux dans les metaTitle : "Rosemont", "Montréal", "Beaubien Est"

### TODOs
- [ ] 3 TODO Judith en commentaires HTML `{/* */}` invisibles utilisateur : email, horaires, lien direct GRV profil Judith
- [ ] Valeurs placeholder plausibles (pas de champs vides) pour ne pas casser le rendu

### Technique
- [ ] Bouton `mailto:` fonctionnel même avec TODO email (attribut vide OK, défaut `info@acupuncturejudith.ca`)
- [ ] Bouton GRV en nouvel onglet (`target="_blank" rel="noopener noreferrer"`)
- [ ] Mobile 375px sans scroll horizontal
- [ ] Pas de modification Hub admin

---

## Commit attendu

Préférence : **3 commits séparés** pour traçabilité :
```
feat(public): MW-C4 page /tarifs (SEO-optimisée : MedicalBusiness + OfferCatalog + FAQPage)
feat(public): MW-C5 page /reserver (SEO-optimisée : ReserveAction + openingHours)
feat(public): MW-C6 page /contact (SEO-optimisée : LocalBusiness complet + Google Maps + AggregateRating)
```

Ou si tu préfères : 1 commit unique :
```
feat(public): MW-C4/C5/C6 pages utilitaires SEO-optimisées (tarifs, reserver, contact)
```

Fais 3 commits séparés si c'est facile, sinon 1 seul c'est OK.

---

## References

- Contenu et décisions : `project-docs/02_ROADMAP/migration-wix/MW-C456_pages-utilitaires/CONTENU_BROUILLON.md`
- Adresse confirmée web search : 2554 Rue Beaubien E, Montréal QC H1Y 1G3
- GRV URL confirmée : https://www.gorendezvous.com/lasourceensoi?companyId=104074
- Pattern sections : MW-C3
- FAQ composant : MW-D5 `RessourceFaq.tsx` (à réutiliser, pas à dupliquer)

---

*Prompt drafte 16 avril 2026 par Claude Desktop (Opus). Priorite SEO local selon directive Benoit.*
