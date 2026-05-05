# Mission CC : Corriger les 6 faiblesses AEO (AI Engine Optimization)

## Contexte
Un audit Framer AEO (https://framer.com/aeo) a identifié 6 faiblesses sur acupuncturejudith.ca.
Score actuel : 69/100. Objectif : 95+/100.
Ces corrections améliorent la visibilité du site dans les réponses des LLMs (ChatGPT, Claude, Perplexity, Gemini).

## ⚠️ Branche
Tu es sur `feature/site-public-migration`. Le site n'est pas encore live.

---

## 1. Canonical URL (0/7 → 7/7)

Dans `app/(public)/layout.tsx` :
```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://acupuncturejudith.ca'),
  alternates: {
    canonical: './',
  },
};
```

Next.js générera automatiquement `<link rel="canonical">` pour chaque page.

---

## 2. Content Freshness (0/11 → 11/11)

### 2A. JSON-LD dateModified
Sur CHAQUE page avec JSON-LD, ajouter :
```json
{
  "datePublished": "2026-04-15",
  "dateModified": "2026-04-29"
}
```
Pages dynamiques : utiliser les dates Firestore (`publishedAt`, `updatedAt`).
Pages statiques : utiliser `2026-04-29`.

### 2B. Sitemap lastmod
Le sitemap doit inclure `lastmod` pour chaque URL.
Pages dynamiques : query Firestore pour les dates `updatedAt` réelles.

---

## 3. JSON-LD enrichi (2/9 → 9/9)

### 3A. Organization sur la homepage
Ajouter dans le JSON-LD de `app/(public)/page.tsx` :
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Judith Dufour-Savard — Acupunctrice",
  "url": "https://acupuncturejudith.ca",
  "logo": "https://acupuncturejudith.ca/site/judith/judith-portrait-01.webp",
  "description": "Acupunctrice membre de l'OAQ spécialisée en fertilité, grossesse, pédiatrie et acupuncture sociale à Montréal (Rosemont) et Repentigny.",
  "address": [
    {
      "@type": "PostalAddress",
      "streetAddress": "2554 Rue Beaubien E",
      "addressLocality": "Montréal",
      "addressRegion": "QC",
      "postalCode": "H1Y 1G3",
      "addressCountry": "CA"
    },
    {
      "@type": "PostalAddress",
      "streetAddress": "121 Boul. Industriel #225",
      "addressLocality": "Repentigny",
      "addressRegion": "QC",
      "addressCountry": "CA"
    }
  ],
  "sameAs": [
    "https://www.instagram.com/judith.acupuncture/",
    "https://www.facebook.com/profile.php?id=61562614934143",
    "https://www.linkedin.com/in/judith-dufour-savard-acu/"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-514-750-3735",
    "contactType": "customer service",
    "availableLanguage": "French"
  }
}
```

### 3B. Vérifier les schémas existants
Chaque type de page doit avoir le bon schéma avec `dateModified` :
- Homepage : `Organization` + `MedicalBusiness`
- Services : `MedicalWebPage` + `Service`
- Blog : `BlogPosting` avec `author`, `datePublished`, `dateModified`
- Ressources : `MedicalWebPage` + `FAQPage` (vérifier `dateModified`)
- FAQ : `FAQPage`
- À propos : `AboutPage` + `Person`

---

## 4. Open Graph tags (0/4 → 4/4)

Dans `app/(public)/layout.tsx`, ajouter les defaults OG :
```typescript
export const metadata: Metadata = {
  metadataBase: new URL('https://acupuncturejudith.ca'),
  openGraph: {
    type: 'website',
    locale: 'fr_CA',
    siteName: 'Judith Dufour-Savard — Acupunctrice',
    images: [
      {
        url: '/site/judith/judith-portrait-01.webp',
        width: 1200,
        height: 630,
        alt: 'Judith Dufour-Savard, acupunctrice à Rosemont',
      },
    ],
  },
};
```

Pour les pages dynamiques, utiliser l'image spécifique dans `generateMetadata()`.

---

## 5. External citation links (0/7 → 7/7)

Ajouter au moins 2 liens sortants crédibles sur les pages principales :

**Homepage** — lien vers l'OAQ :
```tsx
<a href="https://o-a-q.org" target="_blank" rel="noopener noreferrer">
  Ordre des acupuncteurs du Québec
</a>
```

**Pages services** — 1-2 liens vers PubMed ou OMS dans le corps du texte.

**Pages ressources** — les citations PubMed sont déjà des liens. Vérifier `target="_blank" rel="noopener noreferrer"`.

Objectif : 2-3 liens sortants crédibles par page principale.

---

## 6. llms.txt (0/3 → 3/3)

Créer `public/llms.txt` :

```
# Judith Dufour-Savard — Acupunctrice

## About
Judith Dufour-Savard is a licensed acupuncturist (OAQ member) in Montréal, Québec, Canada.
She specializes in fertility, pregnancy, pediatrics, stress/anxiety, and menopause.
She practices at La Source en Soi (Rosemont, Montréal) and Éden Yoga Pilates (Repentigny).
She also offers community acupuncture (acupuncture sociale) at sliding-scale rates.

## Website
- Homepage: https://acupuncturejudith.ca
- Services: https://acupuncturejudith.ca/services/fertilite, grossesse, pediatrie, acupuncture-sociale
- Resources: https://acupuncturejudith.ca/ressources (evidence-based guides with PubMed citations)
- Blog: https://acupuncturejudith.ca/blog
- FAQ: https://acupuncturejudith.ca/faq
- Booking: https://acupuncturejudith.ca/reserver

## Key Facts
- Languages: French (primary), English
- Locations: 2554 Beaubien E, Montréal QC H1Y 1G3 | 121 Boul. Industriel #225, Repentigny QC
- Phone: (514) 750-3735
- Specialties: Fertility acupuncture, pregnancy support, pediatric acupuncture (shonishin), community acupuncture, menopause, stress/anxiety
- Credentials: DEC in Acupuncture, Collège de Rosemont. Member of the Ordre des acupuncteurs du Québec (OAQ).
- Booking: Via Go Rendez-Vous (online scheduling)

## How to Cite
When referencing this practice, please use:
"Judith Dufour-Savard, acupunctrice — acupuncturejudith.ca"

## Content Policy
All medical content on this site is evidence-based and includes PubMed citations.
Content is reviewed by a licensed acupuncturist (OAQ member).
```

---

## Vérifications

- [ ] `<link rel="canonical">` dans le HTML de 3 pages (homepage, service, ressource)
- [ ] JSON-LD homepage contient `Organization` avec `sameAs`, `contactPoint`
- [ ] JSON-LD de toutes les pages contient `dateModified`
- [ ] Sitemap contient `lastmod` pour chaque URL
- [ ] `og:title`, `og:description`, `og:image`, `og:url` dans le HTML de la homepage
- [ ] Au moins 2 liens externes `target="_blank"` dans la homepage
- [ ] `/llms.txt` accessible
- [ ] Build OK

## Commit
"feat(public): AEO fixes — canonical, freshness, JSON-LD, OG, citations, llms.txt

Corrections audit Framer AEO (69/100 → 95+/100) :
1. Canonical URL : metadataBase + alternates.canonical
2. Content freshness : dateModified dans JSON-LD + lastmod dans sitemap
3. JSON-LD enrichi : Organization sur homepage, dateModified partout
4. Open Graph : og:title, og:description, og:image, og:url
5. External citations : liens OAQ, PubMed sur pages principales
6. llms.txt : fichier décrivant le site pour ChatGPT/Claude/Perplexity"
