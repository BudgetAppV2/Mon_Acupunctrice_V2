# Mission CC : Finitions Phase 1 — 12 sections restantes

## Contexte

Phase 1 + suite (commits 0d47476 + 683766f) ont anime :
- Fertilite : 7/8 sections
- Grossesse : 5/7 sections (manque Collaboration, Infos)
- Pediatrie : 2/7 sections (manque Bio, Approche, Conditions, Temoignage, Infos)
- Sociale : 2/7 sections (manque Conviction, Format, Nada, Public, Infos)

Resultat actuel : Pediatrie et Sociale ont **Hero spectaculaire + 5 sections plates au milieu + CTA spectaculaire**. Le contraste est trop fort. Cette mission applique des animations sobres aux 12 sections restantes pour combler le creux.

**12 fichiers a modifier** :

- ServiceGrossesseCollaborationSection.tsx
- ServiceGrossesseInfosSection.tsx
- ServicePediatrieBioSection.tsx
- ServicePediatrieApprocheSection.tsx
- ServicePediatrieConditionsSection.tsx
- ServicePediatrieTemoignageSection.tsx
- ServicePediatrieInfosSection.tsx
- ServiceSocialeConvictionSection.tsx
- ServiceSocialeFormatSection.tsx
- ServiceSocialeNadaSection.tsx
- ServiceSocialePublicSection.tsx
- ServiceSocialeInfosSection.tsx

Tous ont deja use client + import Reveal mais sans wrapping JSX actif.

## Source de verite : patterns Fertilite corriges

Pour chaque type de section, copie exactement le pattern depuis Fertilite :

| Type de section | Fichier reference | Pattern a reproduire |
|-----------------|-------------------|---------------------|
| Bio / Texte intro | ServiceFertiliteBioSection.tsx | Reveal scaleFrom=0.7 sur SectionNumber + Reveal sur heading + Reveal delay=0.15 sur bloc paragraphes |
| Cards grid | ServiceFertiliteBenefitsSection.tsx | useGSAP timeline + clip-path reveal mask en stagger sur les cards |
| Collaboration / Texte simple | ServiceFertiliteCollaborationSection.tsx | Reveal scaleFrom + Reveal heading + Reveal delay sur paragraphes (PAS de ligne horizontale) |
| Temoignage | ServiceFertiliteTemoignageSection.tsx | useGSAP timeline (grand guillemet scale, citation fade, signature slide) |
| Infos cards | ServiceFertiliteInfosSection.tsx | StaggerChildren scale=0.92 y=28 stagger=0.12 + HoverLift sur chaque card ; valeurs en statique (PAS de CountUp) |

## Mapping section -> pattern

### Grossesse

| Section | Pattern |
|---------|---------|
| Collaboration | Pattern Collaboration Fertilite |
| Infos | Pattern Infos Fertilite |

### Pediatrie

| Section | Pattern |
|---------|---------|
| Bio | Pattern Bio Fertilite |
| Approche | Pattern Bio Fertilite (texte intro avec quelques paragraphes) |
| Conditions | Pattern Benefits Fertilite (cards reveal mask) |
| Temoignage | Pattern Temoignage Fertilite |
| Infos | Pattern Infos Fertilite |

### Sociale

| Section | Pattern |
|---------|---------|
| Conviction | Pattern Bio Fertilite |
| Format | Pattern Benefits Fertilite (cards reveal mask) |
| Nada | Pattern Bio Fertilite (texte explicatif) |
| Public | Pattern Benefits Fertilite (cards de profils en stagger) |
| Infos | Pattern Infos Fertilite |

## Regles d engagement (NE PAS DEVIER)

1. **JAMAIS** introduire CountUp, RevealWords, ScrollHighlightText, ligne horizontale qui se trace. Judith les a refuses.
2. **JAMAIS** introduire de sectionRef non attache au JSX (cause de bug — utiliser une ref attachee comme gridRef.current ou containerRef.current pour la guard).
3. **TOUJOURS** preserver le contenu textuel original a 100%. Les textes ont ete audites par Judith. Ne PAS simplifier, raccourcir, ou modifier les phrases.
4. **TOUJOURS** mettre opacity: 0.01 (LCP-friendly trick) sur les inline styles initiaux des elements animes en fade.
5. **TOUJOURS** utiliser les composants animation existants depuis app/(public)/_components/animations/, ne pas en inventer de nouveaux.
6. **NE PAS** toucher aux fichiers Hero, CTA, et autres deja animes.
7. **NE PAS** toucher aux fichiers Fertilite (deja finis et corriges).

## Verifications speciales (audits Judith a preserver)

Lors des modifications, **conserver exactement** :

- **Pediatrie InfoCard Duree** : Rencontre 1 heure + sous-ligne Traitement actif 20-30 min bebes / 30-45 min enfants — texte audite par Judith hier
- **Pediatrie note legale ado 14+** : n a pas besoin du consentement de ses parents pour recevoir un traitement — texte audite
- **Pediatrie sous-section A quoi s attendre selon l age** : bebes / enfants / adolescents — audite
- **Sociale Clinique d acupuncture sociale d Hochelaga** dans Conviction — audite (pas juste d Hochelaga)

## Tests

bash:
- npm run build (doit reussir)
- npx tsc --noEmit (aucune erreur)

Test manuel :
- localhost:3000/services/grossesse : Collaboration et Infos animees
- localhost:3000/services/pediatrie : Bio, Approche, Conditions, Temoignage, Infos animees
- localhost:3000/services/acupuncture-sociale : Conviction, Format, Nada, Public, Infos animees

Pour chaque page, scroller du haut au bas et verifier qu il n y a plus de trou plat entre Hero et CTA.

Console DevTools : aucune erreur, aucun warning hydration.

prefers-reduced-motion test : DevTools, Rendering, Emulate prefers-reduced-motion: reduce, recharger les 3 pages, tout doit apparaitre instantanement.

## Commit

Un seul commit a la fin :

feat(services): finitions Phase 1 sur 12 sections restantes

Application des patterns Fertilite aux sections statiques de Grossesse, Pediatrie, Sociale :
- Grossesse : Collaboration + Infos
- Pediatrie : Bio + Approche + Conditions + Temoignage + Infos
- Sociale : Conviction + Format + Nada + Public + Infos

Decisions Judith respectees :
- Pas de CountUp
- Pas de RevealWords
- Pas de ScrollHighlightText
- Pas de ligne horizontale qui se trace

Contenus textuels audites preserves a 100%.

Bug sectionRef non attache evite (guard sur ref attachee).

Phase 1 totalement complete sur les 4 pages services.
