# Milestone MW-D4 : Pages `/faq` + `/faq/[category]`

**Type** : UI
**Vague** : 4
**Priorité** : High
**Temps estimé Claude Code** : 3-4h
**Dépendances** : MW-B3, MW-D3
**Status** : 🔴 Not started

---

## Objectif

Créer les pages FAQ publiques — vue d'ensemble par catégorie et page détaillée par catégorie — avec schema.org `FAQPage` pour les rich snippets Google et liens discrets dans le footer (amendement A1).

---

## Contexte minimal

MW-D3 a importé les 6 premières FAQ dans Firestore. Les pages FAQ servent un double rôle (amendement A1) : silo SEO dense pour ranker sur les long-tail/PAA, et funnel de conversion secondaire avec CTAs contextuels. Au lancement, les liens vers `/faq` sont discrets (footer uniquement, pas dans le header principal).

---

## Livrables

- [ ] **Page `app/(public)/faq/page.tsx`** — vue d'ensemble avec les 5 catégories (fertilité, grossesse, pédiatrie, acupuncture sociale, séance), compteur de questions par catégorie, lien vers chaque catégorie
- [ ] **Page `app/(public)/faq/[category]/page.tsx`** — page FAQ par catégorie avec toutes les questions/réponses en accordéon, CTA contextuel en fin de catégorie
- [ ] **Composant `<FaqAccordion />`** — accordéon accessible (ARIA, clavier) pour question/réponse
- [ ] **Schema.org `FAQPage`** par page de catégorie — pour les rich snippets Google
- [ ] **Metadata dynamique** via `generateMetadata`

---

## Approche technique

**Page vue d'ensemble** (`/faq/page.tsx`) :
- Server Component, query Firestore `faqs` groupées par `category`
- Pour chaque catégorie : titre, nombre de questions, 2-3 questions preview, lien "Voir toutes les questions"
- Design discret, propre, fidèle aux tokens v4

**Page catégorie** (`/faq/[category]/page.tsx`) :
- Server Component, query Firestore `faqs` filtrées par `category` et `status == 'published'`, ordonnées par `order`
- `generateStaticParams` pour les 5 catégories
- Chaque question/réponse dans un accordéon
- Réponse en markdown rendu (réutiliser le renderer de MW-D2)
- CTA en fin de page : wording adapté à la catégorie ("Prêt·e à commencer votre parcours fertilité ?" → `/reserver`)
- Breadcrumb : Accueil > FAQ > [Catégorie]

**Composant `<FaqAccordion />`** :
- Props : `items: { question: string; reponse: string }[]`
- Accordéon natif HTML `<details>/<summary>` pour SSR + accessibilité
- Ou `'use client'` avec état si animation souhaitée
- ARIA : `role`, `aria-expanded`, `aria-controls`
- Navigation clavier : Enter/Space pour toggle

**Schema.org FAQPage** (JSON-LD) :
```json
{
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "...",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "..."
      }
    }
  ]
}
```

---

## Fichiers impactés

```
📄 NEW (fichiers à créer) :
- app/(public)/faq/page.tsx
- app/(public)/faq/[category]/page.tsx
- app/(public)/_components/FaqAccordion.tsx
```

---

## Definition of Done

- [ ] `npm run build` passe sans erreur
- [ ] La page `/faq` affiche les 5 catégories avec compteurs corrects
- [ ] La page `/faq/fertilite` affiche les FAQ de fertilité en accordéon
- [ ] Le schema.org `FAQPage` est validé via validator.schema.org
- [ ] L'accordéon est accessible au clavier (Tab, Enter, Space)
- [ ] CTA contextuel en fin de chaque page catégorie
- [ ] Lighthouse 95+ sur les pages FAQ
- [ ] Responsive correct à 375px, 768px, 1024px
- [ ] Fichier `NOTES.md` créé avec le journal d'exécution
- [ ] Review par Benoit sur la branche (pas de merge automatique)

---

## Tests requis

- **Visual** : 375px et 1024px — page vue d'ensemble et page catégorie
- **SEO** : schema.org FAQPage validé, meta tags dynamiques par catégorie
- **Accessibilité** : navigation clavier de l'accordéon, contraste WCAG AA
- **Contenu** : vérifier que les FAQ importées en MW-D3 s'affichent correctement

---

## Contraintes

- Ne pas modifier le code du Hub admin
- Les FAQ affichent uniquement les documents `status == 'published'` (amendement A2)
- L'accordéon doit fonctionner sans JavaScript (fallback `<details>/<summary>`) pour le SEO
- Les liens vers `/faq` sont dans le footer seulement (amendement A1) — ne pas les ajouter dans le header principal
- Mobile-first 375px
- Pas d'emojis
- Composants < 150 lignes

---

## Références

- Plan stratégique §5 (plan FAQ complet), §5.2 (structure FAQ)
- Amendement A1 (visibilité progressive — footer uniquement au lancement)
- Amendement A2 (workflow status — filtrage `published`)
- Plan stratégique §4.4 (maillage interne — FAQ comme spokes)
- MW-D3 (données FAQ dans Firestore)
- MW-B3 (`<SectionHeading />`, `<CtaButton />`)

---

## Notes de planification

- Au lancement, les FAQ sont peu nombreuses (6 importées en MW-D3). Les pages seront enrichies au fur et à mesure via l'admin Hub (MW-E1) et le cron de rafraîchissement (MW-F2).
- Le choix `<details>/<summary>` vs accordéon custom dépend de l'esthétique souhaitée. `<details>` est le plus accessible et le plus SEO-friendly (contenu visible dans le HTML source). Si animation souhaitée, utiliser `<details>` avec CSS transitions.
- La section "Articles liés" en bas de chaque FAQ sera ajoutée en MW-D6 (maillage interne).
- Point à valider avec Benoit : est-ce que la catégorie `seance` (questions logistiques) doit être visuellement distincte des catégories thématiques (piliers) ?
