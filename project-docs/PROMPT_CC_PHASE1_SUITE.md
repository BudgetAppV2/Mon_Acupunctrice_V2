# Mission CC : Phase 1 suite — Grossesse, Pediatrie, Sociale

## Contexte

Phase 1 a anime Fertilite completement (commit `65379b9`) puis ete corrigee selon feedback Judith (commit `0d47476`). Les CTA des 3 autres pages services ont aussi ete animes lors de Phase 1, mais le reste de leurs sections est encore statique.

Cette mission applique le pattern **Fertilite corrige** aux 3 pages services restantes : **Grossesse**, **Pediatrie**, **Sociale**.

## Source de verite : Fertilite corrigee

**Avant tout** : lis ces 7 fichiers pour comprendre le pattern exact a reproduire :

```
app/(public)/_sections/ServiceFertiliteHeroSection.tsx          ← Hero clip-path rideau
app/(public)/_sections/ServiceFertiliteBioSection.tsx           ← Bio simple (Reveal, pas RevealWords)
app/(public)/_sections/ServiceFertiliteBenefitsSection.tsx      ← Cards reveal mask en stagger
app/(public)/_sections/ServiceFertiliteCollaborationSection.tsx ← Reveal simple (PAS de ligne horizontale)
app/(public)/_sections/ServiceFertiliteTemoignageSection.tsx    ← Timeline temoignage
app/(public)/_sections/ServiceFertiliteInfosSection.tsx         ← Cards staggered (PAS de CountUp)
app/(public)/_sections/ServiceFertiliteCtaSection.tsx           ← Deja fait en Phase 1, reference le pattern
```

**Decisions prises (NE PAS REMETTRE EN QUESTION) :**

1. ❌ **Pas de CountUp** nulle part (Judith le trouve gimmick). Les nombres affiches en statique.
2. ❌ **Pas de ligne horizontale** qui se trace dans les sections type Collaboration. Juste Reveal simple.
3. ❌ **Pas de RevealWords** dans les sections Bio. Juste Reveal sur le bloc de paragraphes.
4. ❌ **Pas de ScrollHighlightText** (l'effet texte qui s'assombrit) — il etait sur la section "Homme" de Fertilite (specifique a cette page).
5. ✅ **Hero clip-path rideau** garde — c'est l'effet wow signature des pages services.
6. ✅ **Cards reveal mask en stagger** garde pour les grids (Benefits, Conditions, Format, etc.).
7. ✅ **Timeline temoignage** garde quand il y a une section temoignage.
8. ✅ **MagneticButton** garde sur les CTAs hero + bottom CTA.

**ATTENTION pattern Hero — bug a EVITER :**

Dans la version originale de Phase 1, CC avait defini `sectionRef` mais ne l'attachait pas au JSX (parce que `<GrainOverlay>` ne forwarde pas les refs). Resultat : la guard `if (!sectionRef.current) return;` returnait toujours et l'animation ne se jouait jamais.

**Solution appliquee dans Fertilite corrigee** : pas de `sectionRef`. La guard est sur `photoRef.current` qui EST attache au JSX. Reproduire ce pattern exactement.

## Pages a animer

### 1. Grossesse (7 sections)

```
ServiceGrossesseHeroSection.tsx          ← pattern Hero Fertilite (clip-path + timeline + MagneticButton)
ServiceGrossesseBioSection.tsx           ← pattern Bio Fertilite (Reveal simple)
ServiceGrossesseBenefitsSection.tsx      ← pattern Benefits Fertilite (cards reveal mask en stagger)
ServiceGrossesseCollaborationSection.tsx ← pattern Collaboration Fertilite (Reveal simple, PAS de ligne)
ServiceGrossesseTemoignageSection.tsx    ← pattern Temoignage Fertilite (timeline grand quote)
ServiceGrossesseInfosSection.tsx         ← pattern Infos Fertilite (cards staggered, valeurs statiques)
ServiceGrossesseCtaSection.tsx           ← deja anime en Phase 1, ne pas toucher
```

Hero kicker : `GROSSESSE · ROSEMONT & REPENTIGNY` (texte original deja en place, ne pas modifier).

### 2. Pediatrie (7 sections)

```
ServicePediatrieHeroSection.tsx        ← pattern Hero Fertilite
ServicePediatrieBioSection.tsx         ← pattern Bio Fertilite
ServicePediatrieApprocheSection.tsx    ← Reveal + StaggerChildren si grid de cards approches
ServicePediatrieConditionsSection.tsx  ← pattern Benefits Fertilite (cards reveal mask)
ServicePediatrieTemoignageSection.tsx  ← pattern Temoignage Fertilite
ServicePediatrieInfosSection.tsx       ← pattern Infos Fertilite (PAS de CountUp)
ServicePediatrieCtaSection.tsx         ← deja anime, ne pas toucher
```

Hero kicker : `PEDIATRIE · ROSEMONT & REPENTIGNY` (texte original deja en place).

**ATTENTION** : la section InfoCard "Duree" de Pediatrie a ete recemment auditee par Judith — elle a "Rencontre 1 heure" + sous-ligne "Traitement actif 20-30 min bebes / 30-45 min enfants". **PRESERVER ce contenu textuel a 100%**, ne pas le simplifier.

### 3. Sociale (7 sections)

```
ServiceSocialeHeroSection.tsx       ← pattern Hero Fertilite
ServiceSocialeConvictionSection.tsx ← pattern Bio Fertilite (Reveal simple sur les paragraphes texte)
ServiceSocialeFormatSection.tsx     ← StaggerChildren reveal mask sur les cards format
ServiceSocialeNadaSection.tsx       ← Reveal sur le bloc explicatif
ServiceSocialePublicSection.tsx     ← StaggerChildren sur les cards de profils
ServiceSocialeInfosSection.tsx      ← pattern Infos Fertilite (PAS de CountUp)
ServiceSocialeCtaSection.tsx        ← deja anime, ne pas toucher
```

Hero kicker : `ACUPUNCTURE SOCIALE · ROSEMONT` (PAS de Repentigny, sociale n'est qu'a Rosemont — texte deja correct dans le fichier).

**ATTENTION Sociale — texte audite** : `ServiceSocialeConvictionSection.tsx` mentionne "Clinique d'**acupuncture sociale** d'Hochelaga" (pas juste "d'Hochelaga"). **PRESERVER ce texte** lors de l'instrumentation animation.

## Regles d'engagement (techniques)

1. **NE JAMAIS modifier le contenu textuel** des sections originales. Seuls les wrappers d'animation s'ajoutent. Les textes ont ete audites par Judith hier.
2. **TOUJOURS** mettre `'use client';` en top des fichiers transformes.
3. **TOUJOURS** verifier `npm run build` + `npx tsc --noEmit` a la fin.
4. **JAMAIS** introduire de `sectionRef` non attache au JSX (cf. bug ci-dessus).
5. **JAMAIS** introduire CountUp / RevealWords / ligne horizontale (interdits par Judith).
6. **TOUJOURS** utiliser opacity 0.01 au lieu de 0 sur les inline styles initiaux des elements animes (LCP-friendly trick).
7. La photo hero de chaque page peut etre differente — verifier le `<img src=>` dans l'original et preserver l'image actuellement utilisee.
8. **NE PAS** modifier les CTA de ces 3 pages — ils ont deja ete animes en Phase 1.

## Tests

Apres avoir tout fini :

```bash
npm run build   # Doit reussir
npx tsc --noEmit  # Aucune erreur
```

Test manuel sur les 3 pages a `localhost:3000/services/grossesse`, `/services/pediatrie`, `/services/acupuncture-sociale` :
- Hero : photo se revele (rideau) + textes en cascade
- Sections au scroll : reveal subtil, cards en stagger
- Pas de mots qui apparaissent un par un (RevealWords interdit)
- Pas de ligne orange qui se trace
- Pas de nombres qui s'incrementent
- Console DevTools : aucune erreur rouge, aucun warning hydration

## Commit

Un seul commit a la fin :

```
feat(services): animations sur Grossesse, Pediatrie, Sociale (pattern Fertilite corrige)

Application du pattern Fertilite corrige (commit 0d47476) aux 3 pages services
restantes :

- Hero : clip-path rideau + timeline GSAP unifiee + MagneticButton CTAs
- Bio : Reveal simple (pas RevealWords)
- Benefits/Conditions/Format : cards reveal mask en stagger
- Collaboration : Reveal simple (pas de ligne horizontale)
- Temoignage : timeline grand quote + signature glissee (Grossesse, Pediatrie)
- Infos : cards staggered + HoverLift, valeurs statiques (pas de CountUp)
- CTA : deja animes en Phase 1, non touches

Decisions Judith respectees :
- Pas de CountUp
- Pas de ligne horizontale
- Pas de RevealWords
- Pas de ScrollHighlightText (specifique Fertilite Homme)

Bug evite : sectionRef non attache au JSX. Pattern Fertilite corrige reproduit.
Contenus textuels audites Judith preserves a 100%.
```

