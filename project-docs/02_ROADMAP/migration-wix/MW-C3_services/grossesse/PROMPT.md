# MW-C3b — Page /services/grossesse

**One-shot prompt pour Claude Code.** Lis tout avant de commencer.

---

## Contexte

2e page services. Pattern identique a MW-C3a fertilite (commit f007ea4 puis fix 6b9f11c). Page SERVICE courte (~700 mots, conversion) complementaire a la ressource `/ressources/acupuncture-grossesse-montreal` (2500 mots SEO).

---

## Fichiers a lire AVANT

1. **`project-docs/02_ROADMAP/migration-wix/MW-C3_services/grossesse/CONTENU_BROUILLON.md`** → texte exact verbatim
2. **MW-C3a comme reference** : `app/(public)/_sections/ServiceFertilite*.tsx` + `app/(public)/services/fertilite/page.tsx` → pattern a repliquer
3. **`public/site/svg/pregnant-woman.svg`** → SVG decoratif (deja utilise sur homepage, reutiliser ici)
4. **`public/site/judith/manifest.json`** → portrait-06 (featured MW-C1 card grossesse)

---

## Architecture

```
app/(public)/services/grossesse/page.tsx            (~80 lignes — metadata + Schema.org + assemblage)
app/(public)/_sections/
  ServiceGrossesseHeroSection.tsx                    (~80 lignes)
  ServiceGrossesseBioSection.tsx                     (~60 lignes)
  ServiceGrossesseBenefitsSection.tsx                (~90 lignes) — 3 cards trimestres + liste
  ServiceGrossesseCollaborationSection.tsx           (~50 lignes)
  ServiceGrossesseTemoignageSection.tsx              (~40 lignes)
  ServiceGrossesseInfosSection.tsx                   (~60 lignes)
  ServiceGrossesseCtaSection.tsx                     (~40 lignes)
```

Convention `ServiceGrossesse*` (parallele a `ServiceFertilite*`).

---

## Differences cles vs fertilite

1. **Photo hero** : portrait-06 (featured grossesse) via `<picture>` AVIF+WebP, `loading="lazy"`
2. **SVG decoratif** : `pregnant-woman.svg` dans ServiceGrossesseBioSection (meme pattern que reproductive-flowers sur fertilite). Rotation -8deg, opacity 0.14, mix-blend multiply, absolute right:-80 top:40 w:460 h:560.
3. **BenefitsSection** : structure differente — 3 cards trimestres (1er/2e/3e) en grid 3-col puis liste a plat des autres bienfaits. PaperTexture variant="real" ici (1 seule utilisation).
4. **H1** : « Votre grossesse, accompagnée en douceur. » (avec "douceur" italic + underline warm, comme "accompagné" sur fertilite)
5. **Testimonial** : Ingrid M. (voir CONTENU_BROUILLON section 5 pour extrait exact — version plus riche qu'homepage car on a plus de place)
6. **Cross-linking** : lien vers `/ressources/acupuncture-grossesse-montreal` (min 3 fois : hero CTA, bio inline, Pour aller plus loin)
7. **Note continuite** dans InfosSection : mention fertilite → grossesse → post-partum → pediatrie

---

## Contraintes (ce qu'on ne fait PAS)

Identiques a MW-C3a :
- Ne pas modifier `_components/`, `(app)/`, `(auth)/`, `tailwind.config.ts`, `next.config.mjs`
- Photo via `<img>` native ou `<picture>` (pas `next/image`)
- PaperTexture variant="real" : 1 seule fois (Benefits)
- Composants < 150 lignes
- Mobile 375px
- `export default`, pas `'use client'`
- **Copier texte VERBATIM** de CONTENU_BROUILLON.md

---

## Livrable specifique : Benefits trimestres structure

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
  {[
    { num: '1er', title: 'Survivre aux nausees', desc: 'Points PC6 et ST36 specifiques, documentes...' },
    { num: '2e', title: 'Le confort retrouve', desc: 'Douleurs lombaires, sciatique, crampes, sommeil...' },
    { num: '3e', title: 'Preparer la rencontre', desc: 'Version du siege (moxibustion 33-36 sem)...' },
  ].map((trim) => (
    <div key={trim.num} className="bg-white rounded-[14px] p-8 border border-public-border-subtle">
      <div className="text-[11px] font-semibold uppercase tracking-[2px] text-public-accent-taupe-dark mb-2">{trim.num} TRIMESTRE</div>
      <h3 className="font-public-serif text-[22px] mb-3">{trim.title}</h3>
      <p className="text-[14px] text-public-text-medium">{trim.desc}</p>
    </div>
  ))}
</div>
```

Puis liste "Autres bienfaits" en 2-colonnes avec CheckIcon (identique pattern fertilite Benefits).

---

## Schema.org (page.tsx)

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "Acupuncture grossesse a Montreal",
  "description": "Acupuncture pour accompagner la grossesse a Rosemont. Nausees, douleurs, version du siege, preparation accouchement.",
  "medicalAudience": "Patient",
  "about": { "@type": "MedicalCondition", "name": "Pregnancy" },
  "mainEntity": { "@type": "MedicalTherapy", "name": "Acupuncture pour la grossesse", "relevantSpecialty": "Obstetrics" }
}
```

---

## Definition of Done

- [ ] `npm run build` passe
- [ ] 7 sections `ServiceGrossesse*.tsx` + `page.tsx`
- [ ] H1 « Votre grossesse, accompagnée en douceur. »
- [ ] Photo portrait-06 `loading="lazy"`
- [ ] SVG pregnant-woman.svg dans Bio (rotate, opacity, multiply)
- [ ] PaperTexture variant="real" exactement 1 fois (Benefits)
- [ ] TestimonialCard avec Ingrid M. (extrait long, voir CONTENU_BROUILLON)
- [ ] Tarif 90 $ dans Infos
- [ ] Note continuite fertilite→grossesse→post-partum dans Infos
- [ ] Cross-linking /ressources/acupuncture-grossesse-montreal (min 3 liens)
- [ ] Schema.org MedicalWebPage + MedicalTherapy
- [ ] Mobile 375px OK
- [ ] Zero modif Hub admin

---

## Commit attendu

```
feat(public): MW-C3b page /services/grossesse (2e page services)
```

---

## References

- Contenu : `MW-C3_services/grossesse/CONTENU_BROUILLON.md`
- Source SEO (ressource, pas service) : `scripts/seo-geo/source-resources/02-acupuncture-grossesse-montreal.md`
- Pattern : MW-C3a (commits f007ea4 + 6b9f11c)

*Prompt drafte 16 avril 2026 Claude Desktop.*
