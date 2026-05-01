# MW-C3d — Page /services/acupuncture-sociale

**One-shot prompt pour Claude Code.** Lis tout avant de commencer.

---

## Contexte

4e et derniere page services. Pattern IDENTIQUE a MW-C3a/b/c MAIS avec differences notables :
- **Angle NON scientifique au hero** (c'est un modele de distribution, pas un protocole)
- **Section dediee etudes NADA** avec 3 etudes citees
- **Pas de section temoignage** (aucun avis Google specifiquement sociale)
- **Tarifs differents** (fourchette 35-50 $ au lieu de 90 $ fixe)

---

## Fichiers a lire AVANT

1. **`project-docs/02_ROADMAP/migration-wix/MW-C3_services/acupuncture-sociale/CONTENU_BROUILLON.md`** → texte verbatim (165 lignes)
2. **MW-C3a comme reference** : `app/(public)/_sections/ServiceFertilite*.tsx`
3. **`public/site/judith/manifest.json`** → portrait-03 (deja Instagram card)

**Pas de SVG decoratif specifique** pour cette page (polish UI reporte a MW-G0).

---

## Architecture

```
app/(public)/services/acupuncture-sociale/page.tsx
app/(public)/_sections/
  ServiceSocialeHeroSection.tsx
  ServiceSocialeConvictionSection.tsx      — bio + philosophie
  ServiceSocialeFormatSection.tsx          — deroulement + 5 differences privé/social
  ServiceSocialePublicSection.tsx          — pour qui + conditions ideales
  ServiceSocialeNadaSection.tsx            — protocole + 3 etudes citees
  ServiceSocialeInfosSection.tsx           — pratique
  ServiceSocialeCtaSection.tsx
```

Convention `ServiceSociale*` (pas `ServiceAcupunctureSociale*` qui serait trop long).

**Note** : pas de section Temoignage. Liste ci-dessus a 7 sections deja (hero + 5 contenu + cta), on ne compte pas le temoignage.

---

## Differences cles vs fertilite/grossesse/pediatrie

1. **H1** : « La santé est un droit, pas un privilège. » (avec "droit" italic + underline warm)
2. **Photo hero** : portrait-03 (Instagram card homepage reutilisee) `loading="lazy"`
3. **Tarifs** : fourchette « 35 $ à 50 $ » (sliding scale) + « vous choisissez selon vos moyens »
4. **Durees** : 30-45 min (plus courtes que 60 min en prive)
5. **Pas de testimonial** (MW-D3 rule : no fake testimonials, aucun avis Google specifiquement social)
6. **Section NADA** : centrale, avec 3 etudes specifiquement citees — C'EST UN LIVRABLE CLE :

```
### Ce que la recherche montre :

- Une etude contrôlee randomisee de 2017 (Carter et al., Behavioral Sciences)
  portant sur 100 patients en traitement de dependance montre que le NADA ajoute
  au traitement conventionnel ameliore significativement la qualite de vie, reduit
  l'anxiete et la depression, et est associe a une diminution de la consommation
  d'alcool a 3 et 6 mois, ainsi qu'a une diminution du tabagisme a 6 mois.
  Source : PMID 28621706.

- Une revue de 2016 (Stuyt & Voyles, Substance Abuse and Rehabilitation) confirme
  que le NADA est un outil adjuvant efficace pour les personnes vivant avec des
  problemes de sante mentale et de dependances. Source : PMID 27994492.

- Une meta-analyse en reseau de 2022 (Prado et al., Revista Latino-Americana de
  Enfermagem) portant sur 15 etudes montre que l'auriculotherapie (dont les
  points NADA font partie) est efficace pour reduire l'anxiete et le stress chez
  les professionnels de sante. Source : PMID 36287403.
```

Formater avec liens PubMed : https://pubmed.ncbi.nlm.nih.gov/{PMID}/

7. **PaperTexture variant="real"** : 1 seule fois — sur **ServiceSocialeNadaSection** (c'est la plus "riche" scientifiquement)
8. **TODO Judith inline** : garder les 3 mentions `[TODO Judith : ...]` du CONTENU_BROUILLON mais sous forme de commentaires HTML `{/* TODO Judith : ... */}` dans le code (pas visible sur le site). Ne pas afficher a l'utilisateur.

---

## Livrable specifique : Format avec 5 differences

Tableau ou grille comparative :

```jsx
<div className="grid grid-cols-1 md:grid-cols-5 gap-4">
  {[
    { label: 'Espace', social: 'Partage', prive: 'Salle privee' },
    { label: 'Tenue', social: 'Habillé(e)', prive: 'Tenue adaptee' },
    { label: 'Points', social: 'Distaux', prive: 'Tout le corps' },
    { label: 'Duree', social: '30-45 min', prive: '60 min' },
    { label: 'Tarif', social: '35-50 $', prive: 'Standard' },
  ].map((item) => (
    <div key={item.label} className="text-center">
      <div className="text-[11px] font-semibold uppercase tracking-[1.5px] text-public-accent-taupe-dark mb-2">{item.label}</div>
      <div className="text-[15px] font-medium text-public-text-dark">{item.social}</div>
      <div className="text-[12px] text-public-text-light mt-1">vs {item.prive} en prive</div>
    </div>
  ))}
</div>
```

Ou format tableau a 2 colonnes (mobile-friendly) au choix.

---

## Contraintes

Identiques a MW-C3a/b/c.

---

## Schema.org

```json
{
  "@context": "https://schema.org",
  "@type": "MedicalWebPage",
  "name": "Acupuncture sociale a Rosemont",
  "description": "Acupuncture a tarif reduit en format communautaire a Rosemont. Sliding scale, protocole NADA, accessible a tous.",
  "medicalAudience": "Patient",
  "mainEntity": {
    "@type": "MedicalTherapy",
    "name": "Acupuncture sociale (community acupuncture, protocole NADA)",
    "relevantSpecialty": "Integrative Medicine"
  }
}
```

---

## Definition of Done

- [ ] `npm run build` passe
- [ ] 7 sections `ServiceSociale*.tsx` + `page.tsx`
- [ ] H1 « La santé est un droit, pas un privilège. »
- [ ] Photo portrait-03 `loading="lazy"`
- [ ] Pas de SVG decoratif
- [ ] **Pas de section Temoignage** (a verifier : `grep "TestimonialCard" app/(public)/_sections/ServiceSociale*.tsx` retourne vide)
- [ ] Section NADA avec 3 etudes citees, avec liens pubmed.ncbi.nlm.nih.gov
- [ ] PMID 28621706, 27994492, 36287403 presents dans NADA section
- [ ] Tarifs « 35-50 $ » et « tarif libre »/« sliding scale » dans Infos
- [ ] Durees 30-45 min dans Infos (pas 60 min comme les autres services)
- [ ] Lien GRV present (meme que prive par defaut)
- [ ] TODO Judith laisses en commentaires HTML (pas visibles utilisateur) dans le code
- [ ] PaperTexture variant="real" exactement 1 fois (NADA)
- [ ] Cross-linking /ressources/acupuncture-sociale-montreal (min 2 liens)
- [ ] Schema.org MedicalWebPage + MedicalTherapy
- [ ] Mobile 375px OK
- [ ] Zero modif Hub admin

---

## Commit attendu

```
feat(public): MW-C3d page /services/acupuncture-sociale (4e et derniere page services)
```

---

## References

- Contenu : `MW-C3_services/acupuncture-sociale/CONTENU_BROUILLON.md`
- Source SEO : `scripts/seo-geo/source-resources/05-acupuncture-sociale-montreal.md`
- Etudes NADA citees : PubMed recherche sept 2025 + validation PMID existants
- Pattern : MW-C3a

*Prompt drafte 16 avril 2026 Claude Desktop.*
