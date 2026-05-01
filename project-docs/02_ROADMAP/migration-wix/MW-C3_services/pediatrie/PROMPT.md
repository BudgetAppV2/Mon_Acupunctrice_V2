# MW-C3c — Page /services/pediatrie

**One-shot prompt pour Claude Code.** Lis tout avant de commencer.

---

## Contexte

3e page services. Pattern identique a MW-C3a/b. Page SERVICE courte (~700 mots, conversion) complementaire a la ressource `/ressources/acupuncture-pediatrique-enfants-bebes` (2500 mots SEO).

---

## Fichiers a lire AVANT

1. **`project-docs/02_ROADMAP/migration-wix/MW-C3_services/pediatrie/CONTENU_BROUILLON.md`** → texte verbatim
2. **MW-C3a comme reference** : `app/(public)/_sections/ServiceFertilite*.tsx` → pattern a repliquer
3. **`public/site/judith/manifest.json`** → portrait-02 (proche/douce)

**Pas de SVG decoratif specifique** pour cette page (decision polish UI reporte — MW-G0). Laisser la section Hero sans SVG filigrane.

---

## Architecture

```
app/(public)/services/pediatrie/page.tsx
app/(public)/_sections/
  ServicePediatrieHeroSection.tsx
  ServicePediatrieBioSection.tsx
  ServicePediatrieConditionsSection.tsx     — liste par age (bebes/enfants/ados)
  ServicePediatrieApprocheSection.tsx       — techniques adaptees
  ServicePediatrieTemoignageSection.tsx
  ServicePediatrieInfosSection.tsx
  ServicePediatrieCtaSection.tsx
```

Convention `ServicePediatrie*`.

---

## Differences cles vs fertilite/grossesse

1. **Photo hero** : portrait-02 via `<picture>` AVIF+WebP, `loading="lazy"`
2. **Pas de SVG decoratif** (reporte a MW-G0 polish UI)
3. **ConditionsSection** : structure par tranches d'age
   - 3 cards grid-cols-1 md:grid-cols-3 : Bebes (0-12 mois), Enfants (1-12 ans), Ados (12+)
   - Chaque card contient un titre + une liste `<ul>` des conditions
   - Background : `bg-public-beige-light`
4. **ApprocheSection** : liste des techniques non-aiguilles (aiguilles ultra-fines, laser, aimants, tuina, acupression)
   - PaperTexture variant="real" ici (1 seule utilisation)
5. **H1** : « Des soins doux, pour les plus petits. » (avec "doux" italic + underline warm)
6. **Testimonial** : Parent d'un enfant de 6 ans (texte verbatim CONTENU_BROUILLON)
7. **Infos** : durees differentes (20-30 bebes / 30-45 enfants), tarif 90$
8. **Cross-linking** : /ressources/acupuncture-pediatrique-enfants-bebes (min 3 fois)

---

## Livrable specifique : Conditions par age structure

```jsx
<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
  <div className="bg-white rounded-[14px] p-8 border border-public-border-subtle">
    <h3 className="font-public-serif text-[22px] font-semibold mb-2">Bebes</h3>
    <p className="text-[12px] uppercase tracking-[1.5px] text-public-accent-taupe-dark mb-4">0-12 MOIS</p>
    <ul className="space-y-2 text-[14px] text-public-text-medium">
      <li>Coliques (etude Landgren 2017 : reduction significative des pleurs)</li>
      <li>Reflux, regurgitations</li>
      <li>Troubles du sommeil</li>
      <li>Eczema</li>
      <li>Poussees dentaires</li>
    </ul>
  </div>
  {/* Enfants (1-12 ans) ... */}
  {/* Ados (12+) ... */}
</div>
```

---

## Livrable specifique : Approche techniques

Liste les 5 techniques avec description courte :
- Aiguilles ultra-fines (5-10x plus fines qu'une aiguille de vaccination)
- Laser (stimulation lumineuse, pas d'aiguille)
- Aimants (colles sur les points, portes quelques jours)
- Tuina pediatrique (massage chinois)
- Acupression (pression douce, sans aiguilles)

Puis phrase cle : "Pour les bebes coliqueux, j'utilise souvent une seule aiguille, inseree pendant quelques secondes. C'est tout."

---

## Contraintes

Identiques a MW-C3a/b.

---

## Schema.org

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "Acupuncture pediatrique pour enfants et bebes a Montreal",
  "description": "Acupuncture douce adaptee aux bebes et enfants. Coliques, sommeil, allergies, TDAH. Rosemont.",
  "medicalAudience": [{ "@type": "MedicalAudience", "audienceType": "Patient" }, { "@type": "ParentAudience", "childMinAge": 0 }],
  "about": { "@type": "MedicalCondition", "name": "Pediatric conditions" },
  "mainEntity": { "@type": "MedicalTherapy", "name": "Acupuncture pediatrique", "relevantSpecialty": "Pediatrics" }
}
```

---

## Definition of Done

- [ ] `npm run build` passe
- [ ] 7 sections `ServicePediatrie*.tsx` + `page.tsx`
- [ ] H1 « Des soins doux, pour les plus petits. »
- [ ] Photo portrait-02 `loading="lazy"`
- [ ] Pas de SVG decoratif (verifier `grep "site/svg" app/(public)/_sections/ServicePediatrie*.tsx` retourne vide)
- [ ] 3 cards par age (Bebes/Enfants/Ados) avec listes conditions
- [ ] 5 techniques dans ApprocheSection
- [ ] PaperTexture variant="real" exactement 1 fois (Approche)
- [ ] TestimonialCard "Parent d'un enfant de 6 ans" verbatim
- [ ] Infos : 20-30 min bebes, 30-45 min enfants, 90 $
- [ ] Cross-linking /ressources/acupuncture-pediatrique-enfants-bebes (min 3 liens)
- [ ] Schema.org MedicalWebPage
- [ ] Mobile 375px OK
- [ ] Zero modif Hub admin

---

## Commit attendu

```
feat(public): MW-C3c page /services/pediatrie (3e page services)
```

---

## References

- Contenu : `MW-C3_services/pediatrie/CONTENU_BROUILLON.md`
- Source SEO : `scripts/seo-geo/source-resources/03-acupuncture-pediatrique-enfants-bebes.md`
- Pattern : MW-C3a

*Prompt drafte 16 avril 2026 Claude Desktop.*
